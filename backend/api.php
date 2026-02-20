<?php
require_once 'db.php';
require_once 'Core.php';
require_once 'JWT.php';

$core = new Core($pdo);
$method = $_SERVER['REQUEST_METHOD'];
$request = isset($_GET['request']) ? $_GET['request'] : '';

header('Content-Type: application/json');

// Helper to get Bearer token from header
if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        return $headers;
    }
}

function getAuthToken() {
    $headers = getallheaders();
    foreach ($headers as $name => $value) {
        if (strtolower($name) === 'authorization') {
            if (preg_match('/Bearer\s(\S+)/', $value, $matches)) {
                return $matches[1];
            }
        }
    }
    
    // Fallbacks for environment/server variations
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
    if ($authHeader) {
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return $matches[1];
        }
    }
    
    return null;
}

// Helper to check authentication and role
function checkAuth($requiredRole = null) {
    $token = getAuthToken();
    if (!$token) {
        error_log("Auth Failed: No token found");
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        exit;
    }

    $payload = JWT::validate($token);
    if (!$payload) {
        error_log("Auth Failed: Invalid token: " . $token);
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit;
    }

    if ($requiredRole && $payload['role'] !== $requiredRole && $payload['role'] !== 'admin') {
        error_log("Auth Failed: Insufficient permissions. User role: " . $payload['role'] . ", Required: " . $requiredRole);
        http_response_code(403);
        echo json_encode(['error' => 'Insufficient permissions']);
        exit;
    }

    return $payload;
}

// Function to handle Gemini API call
function callGemini($apiKey, $history, $userMessage, $systemInstruction, $knowledgeBase) {
    if (empty($apiKey)) return ["error" => "API Key is missing. Please configure it in Settings."];
    
    // Use a valid model name
    $model = "gemini-2.5-flash"; 
    $url = "https://generativelanguage.googleapis.com/v1beta/models/" . $model . ":generateContent?key=" . $apiKey;

    $knowledgeContext = "";
    foreach ($knowledgeBase as $item) {
        $knowledgeContext .= "--- SOURCE: " . $item['question'] . " ---\n" . $item['answer'] . "\n\n";
    }

    // Stricter System Instruction
    $restrictedInstruction = "You are the official CCC SmartAssist, an AI for Cainta Catholic College. 
    IMPORTANT RULES:
    1. ANSWER ONLY using the provided OFFICIAL KNOWLEDGE BASE below.
    2. If the answer is not contained within the Knowledge Base, politely say: 'I\'m sorry, I don\'t have that specific information in my current database. Please contact the school office directly for more details.'
    3. DO NOT use external knowledge or make up information.
    4. Keep answers professional and helpful.
    
    === OFFICIAL KNOWLEDGE BASE ===
    " . $knowledgeContext . "
    
    " . $systemInstruction;

    $contents = [];
    $maxHistory = 10;
    $recentHistory = array_slice($history, -$maxHistory);

    foreach ($recentHistory as $msg) {
        if ($msg['role'] !== 'system') {
            $contents[] = [
                'role' => ($msg['role'] === 'user' || $msg['role'] === 'student') ? 'user' : 'model',
                'parts' => [['text' => $msg['content']]]
            ];
        }
    }
    $contents[] = ['role' => 'user', 'parts' => [['text' => $userMessage]]];

    $data = [
        'contents' => $contents,
        'system_instruction' => ['parts' => [['text' => $restrictedInstruction]]],
        'generationConfig' => [
            'temperature' => 0.1, 
            'maxOutputTokens' => 1024
        ]
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($httpCode !== 200) {
        if ($httpCode === 0) {
            return ["error" => "Gemini API Connection Error: " . $curlError];
        }
        $err = json_decode($response, true);
        return ["error" => "Gemini API Error (HTTP $httpCode): " . ($err['error']['message'] ?? 'Unknown Error')];
    }

    $result = json_decode($response, true);
    return $result['candidates'][0]['content']['parts'][0]['text'] ?? "I apologize, but I am unable to process that query based on my current knowledge base.";
}

switch ($request) {
    case 'login':
        if ($method === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            $username = $data['username'] ?? '';
            $password = $data['password'] ?? '';
            $role = $data['role'] ?? 'student';

            $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND role = ?");
            $stmt->execute([$username, $role]);
            $user = $stmt->fetch();

            if ($user) {
                $authenticated = false;
                if (password_verify($password, $user['password'])) {
                    $authenticated = true;
                } elseif ($password === $user['password']) {
                    $authenticated = true;
                    $newHash = password_hash($password, PASSWORD_DEFAULT);
                    $upStmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
                    $upStmt->execute([$newHash, $user['id']]);
                }

                if ($authenticated) {
                    $token = JWT::generate([
                        'id' => $user['id'],
                        'username' => $user['username'],
                        'role' => $user['role'],
                        'exp' => time() + (24 * 60 * 60)
                    ]);

                    echo json_encode([
                        'status' => 'success', 
                        'token' => $token,
                        'user' => [
                            'id' => $user['id'], 
                            'username' => $user['username'], 
                            'role' => $user['role'], 
                            'fullName' => $user['full_name']
                        ]
                    ]);
                } else {
                    http_response_code(401);
                    echo json_encode(['status' => 'error', 'message' => 'Invalid credentials']);
                }
            } else {
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'User not found or role mismatch']);
            }
        }
        break;

    case 'register':
        if ($method === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            $result = $core->register(
                $data['username'] ?? '',
                $data['password'] ?? '',
                $data['fullName'] ?? '',
                $data['role'] ?? 'student'
            );
            if (isset($result['error'])) {
                http_response_code(400);
            } else {
                $result['token'] = JWT::generate([
                    'id' => $result['user']['id'],
                    'username' => $result['user']['username'],
                    'role' => $result['user']['role'],
                    'exp' => time() + (24 * 60 * 60)
                ]);
            }
            echo json_encode($result);
        }
        break;

    case 'settings':
        if ($method === 'GET') {
            echo json_encode($core->getSettings());
        } elseif ($method === 'POST') {
            checkAuth('admin');
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("UPDATE settings SET system_name = ?, theme_color = ?, api_key = ? WHERE id = 1");
            $stmt->execute([$data['systemName'], $data['themeColor'], $data['apiKey']]);
            echo json_encode(['status' => 'success']);
        }
        break;

    case 'knowledge':
        if ($method === 'GET') {
            echo json_encode($core->getKnowledgeBase());
        } elseif ($method === 'POST') {
            checkAuth('admin');
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("INSERT INTO knowledge_base (id, question, answer, category, source, date_added) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$data['id'], $data['question'], $data['answer'], $data['category'], $data['source'], $data['dateAdded']]);
            echo json_encode(['status' => 'success']);
        } elseif ($method === 'DELETE') {
            checkAuth('admin');
            $stmt = $pdo->prepare("DELETE FROM knowledge_base WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            echo json_encode(['status' => 'success']);
        }
        break;

    case 'rules':
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT * FROM manual_rules");
            echo json_encode($stmt->fetchAll());
        } elseif ($method === 'POST') {
            checkAuth('admin');
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("INSERT INTO manual_rules (id, keyword, response, active) VALUES (?, ?, ?, ?)");
            $stmt->execute([$data['id'], $data['trigger'], $data['response'], $data['active']]);
            echo json_encode(['status' => 'success']);
        } elseif ($method === 'DELETE') {
            checkAuth('admin');
            $stmt = $pdo->prepare("DELETE FROM manual_rules WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            echo json_encode(['status' => 'success']);
        }
        break;

    case 'chat':
        if ($method === 'POST') {
            try {
                $data = json_decode(file_get_contents('php://input'), true);
                if (!$data) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid JSON data']);
                    break;
                }
                
                $sessionId = $data['sessionId'] ?? null;
                $userMessage = $data['message'] ?? '';
                $history = $data['history'] ?? [];
                $userId = $data['userId'] ?? 'guest';
                
                $settings = $core->getSettings();
                $kb = $core->getKnowledgeBase();
                $rules = $core->getManualRules();
                
                $botResponse = null;
                foreach ($rules as $rule) {
                    if (stripos($userMessage, $rule['keyword']) !== false) {
                        $botResponse = $rule['response'];
                        break;
                    }
                }
                
                if (!$botResponse) {
                    $geminiResult = callGemini($settings['api_key'], $history, $userMessage, $data['systemInstruction'] ?? '', $kb);
                    
                    if (is_array($geminiResult) && isset($geminiResult['error'])) {
                        $botResponse = "I'm currently undergoing maintenance. Error: " . $geminiResult['error'];
                    } else {
                        $botResponse = $geminiResult;
                    }
                }

                if ($userId !== 'guest') {
                    $core->saveMessage($sessionId, 'user', $userMessage, $userId);
                    $core->saveMessage($sessionId, 'model', $botResponse, $userId);
                }

                echo json_encode(['response' => $botResponse]);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Server Error: ' . $e->getMessage()]);
            }
        }
        break;

    case 'faqs':
        if ($method === 'GET') {
            echo json_encode($core->getFAQs());
        } elseif ($method === 'POST') {
            try {
                $payload = checkAuth('admin');
                $input = file_get_contents('php://input');
                $data = json_decode($input, true);
                
                error_log("FAQ Mutation (POST): User=" . ($payload['username'] ?? 'unknown') . " Input=" . $input);
                
                if (!$data) {
                    http_response_code(400);
                    echo json_encode(["status" => "error", "message" => "Invalid JSON input"]);
                    break;
                }

                if (isset($data['action'])) {
                    if ($data['action'] === 'delete') {
                        $id = $data['id'] ?? $_GET['id'] ?? null;
                        if (!$id) {
                            http_response_code(400);
                            $res = ["status" => "error", "message" => "Missing ID for deletion"];
                        } else {
                            $res = $core->deleteFAQ($id);
                            if ($res['status'] === 'error') http_response_code(400);
                        }
                        echo json_encode($res);
                    } elseif ($data['action'] === 'update') {
                        $res = $core->updateFAQ($data);
                        if ($res['status'] === 'error') http_response_code(400);
                        echo json_encode($res);
                    }
                } else {
                    $res = $core->addFAQ($data);
                    if ($res['status'] === 'error') http_response_code(400);
                    echo json_encode($res);
                }
            } catch (Exception $e) {
                error_log("FAQ Mutation Error (POST): " . $e->getMessage());
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
        } elseif ($method === 'DELETE') {
            try {
                $payload = checkAuth('admin');
                $id = $_GET['id'] ?? null;
                error_log("FAQ Mutation (DELETE): User=" . ($payload['username'] ?? 'unknown') . " ID=" . $id);
                
                if (!$id) {
                    http_response_code(400);
                    echo json_encode(["status" => "error", "message" => "Missing ID"]);
                } else {
                    $res = $core->deleteFAQ($id);
                    if ($res['status'] === 'error') http_response_code(400);
                    echo json_encode($res);
                }
            } catch (Exception $e) {
                error_log("FAQ Mutation Error (DELETE): " . $e->getMessage());
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
        }
        break;

    case 'suggestions':
        $faqs = $core->getFAQs();
        $suggestions = [];
        foreach ($faqs as $f) {
            $suggestions[] = $f['question'];
        }
        echo json_encode(array_slice($suggestions, 0, 8));
        break;

    case 'stats':
        checkAuth('admin');
        echo json_encode($core->getStats());
        break;

    case 'sessions':
        $payload = checkAuth();
        if ($method === 'GET') {
            $userId = $_GET['userId'] ?? $payload['id'];
            $isAdmin = $payload['role'] === 'admin';
            
            if ($isAdmin && isset($_GET['admin']) && $_GET['admin'] === 'true') {
                $stmt = $pdo->query("SELECT * FROM chat_sessions ORDER BY last_updated DESC LIMIT 100");
            } else {
                $stmt = $pdo->prepare("SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY last_updated DESC");
                $stmt->execute([$userId]);
            }
            
            $sessions = $stmt->fetchAll();
            foreach ($sessions as &$session) {
                $msgStmt = $pdo->prepare("SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC");
                $msgStmt->execute([$session['id']]);
                $session['messages'] = $msgStmt->fetchAll();
            }
            echo json_encode($sessions);
        } elseif ($method === 'POST') {
             $data = json_decode(file_get_contents('php://input'), true);
             if (isset($data['delete'])) {
                $pdo->prepare("DELETE FROM chat_sessions WHERE id = ? AND (user_id = ? OR ? = 'admin')")->execute([$data['id'], $payload['id'], $payload['role']]);
             } else {
                $stmt = $pdo->prepare("INSERT INTO chat_sessions (id, title, user_id, last_updated) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = ?, last_updated = ?");
                $stmt->execute([$data['id'], $data['title'], $payload['id'], $data['lastUpdated'] ?? time(), $data['title'], $data['lastUpdated'] ?? time()]);
             }
             echo json_encode(['status' => 'success']);
        }
        break;

    case 'feedback':
        checkAuth();
        if ($method === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("UPDATE messages SET feedback = ? WHERE id = ?");
            $stmt->execute([$data['feedback'], $data['messageId']]);
            echo json_encode(['status' => 'success']);
        }
        break;

    case 'users':
        checkAuth('admin');
        if ($method === 'GET') {
            echo json_encode($core->getUsers());
        } elseif ($method === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            if (isset($data['action']) && $data['action'] === 'update') {
                echo json_encode($core->updateUser($data));
            }
        } elseif ($method === 'DELETE') {
            echo json_encode($core->deleteUser($_GET['id']));
        }
        break;

    case 'profile':
        $payload = checkAuth();
        $id = $_GET['id'] ?? $payload['id'];
        if ($payload['role'] !== 'admin' && $payload['id'] !== $id) {
            http_response_code(403);
            exit;
        }

        if ($method === 'GET') {
            echo json_encode($core->getUserProfile($id));
        } elseif ($method === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            $data['id'] = $id; 
            echo json_encode($core->updateUser($data));
        }
        break;
        
    default:
        echo json_encode(['error' => 'Invalid request']);
        break;
}
