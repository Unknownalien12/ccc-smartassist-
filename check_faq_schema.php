<?php
require_once 'backend/db.php';
$stmt = $pdo->query("DESCRIBE faq_questions");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($rows, JSON_PRETTY_PRINT);
?>
