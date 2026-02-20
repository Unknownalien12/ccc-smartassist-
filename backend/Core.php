<?php
// backend/Core.php

class Core {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getSettings() {
        return $this->pdo->query("SELECT * FROM settings WHERE id = 1")->fetch();
    }

    public function getKnowledgeBase() {
        return $this->pdo->query("SELECT * FROM knowledge_base ORDER BY date_added DESC")->fetchAll();
    }

    public function getManualRules() {
        return $this->pdo->query("SELECT * FROM manual_rules WHERE active = 1")->fetchAll();
    }

    public function saveMessage($sessionId, $role, $content, $userId) {
        // Ensure session exists
        $stmt = $this->pdo->prepare("INSERT IGNORE INTO chat_sessions (id, title, user_id, last_updated) VALUES (?, ?, ?, ?)");
        $stmt->execute([$sessionId, substr($content, 0, 50), $userId, time()]);

        // Save Message
        $id = ($role === 'user' ? 'u_' : 'b_') . uniqid();
        $stmt = $this->pdo->prepare("INSERT INTO messages (id, session_id, role, content, timestamp) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$id, $sessionId, $role, $content, time()]);

        // Update session
        $stmt = $this->pdo->prepare("UPDATE chat_sessions SET last_updated = ? WHERE id = ?");
        $stmt->execute([time(), $sessionId]);
        
        return $id;
    }

    public function getStats() {
        return [
            'kbCount' => (int)$this->pdo->query("SELECT COUNT(*) FROM knowledge_base")->fetchColumn(),
            'ruleCount' => (int)$this->pdo->query("SELECT COUNT(*) FROM manual_rules")->fetchColumn(),
            'sessionCount' => (int)$this->pdo->query("SELECT COUNT(*) FROM chat_sessions")->fetchColumn(),
            'messageCount' => (int)$this->pdo->query("SELECT COUNT(*) FROM messages")->fetchColumn(),
            'userCount' => (int)$this->pdo->query("SELECT COUNT(*) FROM users")->fetchColumn(),
        ];
    }

    public function register($username, $password, $fullName, $role = 'student') {
        // Check if username exists
        $stmt = $this->pdo->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            return ["error" => "Username already exists"];
        }

        $id = ($role === 'admin' ? 'admin-' : 'student-') . uniqid();
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $this->pdo->prepare("INSERT INTO users (id, username, password, role, full_name) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$id, $username, $hashedPassword, $role, $fullName]);

        return ["status" => "success", "user" => ["id" => $id, "username" => $username, "role" => $role, "fullName" => $fullName]];
    }

    public function getUsers() {
        return $this->pdo->query("SELECT id, username, role, full_name, email, student_id, course, year_level FROM users ORDER BY role ASC, full_name ASC")->fetchAll();
    }

    public function getUserProfile($id) {
        $stmt = $this->pdo->prepare("SELECT id, username, role, full_name, email, student_id, course, year_level FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function updateUser($data) {
        $fields = ['full_name', 'email', 'student_id', 'course', 'year_level'];
        $updates = [];
        $params = [];

        foreach ($fields as $field) {
            $key = $this->snakeToCamel($field);
            if (isset($data[$key])) {
                $updates[] = "$field = ?";
                $params[] = $data[$key];
            }
        }

        if (empty($updates)) return ["status" => "error", "message" => "No fields to update"];

        $params[] = $data['id'];
        $sql = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return ["status" => "success"];
    }

    public function deleteUser($id) {
        $stmt = $this->pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return ["status" => "success"];
    }

    private function snakeToCamel($snake) {
        $parts = explode('_', $snake);
        $camel = array_shift($parts);
        foreach ($parts as $part) {
            $camel .= ucfirst($part);
        }
        return $camel;
    }

    // FAQ Management
    public function getFAQs() {
        return $this->pdo->query("SELECT * FROM faq_questions ORDER BY date_added DESC")->fetchAll();
    }

    public function addFAQ($data) {
        $stmt = $this->pdo->prepare("INSERT INTO faq_questions (id, question, date_added, category) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $data['id'] ?? uniqid(),
            $data['question'],
            $data['dateAdded'] ?? time(),
            $data['category'] ?? 'general'
        ]);
        return ["status" => "success"];
    }

    public function deleteFAQ($id) {
        error_log("Core::deleteFAQ called with ID: " . $id);
        $stmt = $this->pdo->prepare("DELETE FROM faq_questions WHERE id = ?");
        $stmt->execute([$id]);
        $count = $stmt->rowCount();
        error_log("Core::deleteFAQ execution complete. Affected rows: $count");
        if ($count > 0) {
            return ["status" => "success"];
        } else {
            return ["status" => "error", "message" => "No FAQ found with ID: " . $id];
        }
    }

    public function updateFAQ($data) {
        $stmt = $this->pdo->prepare("UPDATE faq_questions SET question = ? WHERE id = ?");
        $stmt->execute([$data['question'], $data['id']]);
        return ["status" => "success"];
    }
}
