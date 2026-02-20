<?php
// Quick test for chat endpoint
header('Content-Type: application/json');

require_once 'db.php';
require_once 'Core.php';

$core = new Core($pdo);

// Test data
$testData = [
    'sessionId' => 'test-session-' . time(),
    'message' => 'Hello, how do I enroll?',
    'history' => [],
    'userId' => 'test-user',
    'systemInstruction' => 'You are a helpful assistant.'
];

echo "Testing chat endpoint...\n\n";
echo "Test Data:\n";
echo json_encode($testData, JSON_PRETTY_PRINT) . "\n\n";

// Simulate POST request
$_SERVER['REQUEST_METHOD'] = 'POST';
$_GET['request'] = 'chat';

// Create temporary input
$tmpFile = tmpfile();
fwrite($tmpFile, json_encode($testData));
rewind($tmpFile);

// Capture output
ob_start();
include 'api.php';
$output = ob_get_clean();

echo "Response:\n";
echo $output . "\n";

fclose($tmpFile);
