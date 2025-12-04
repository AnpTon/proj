<?php
require_once '../config.php';
require_once '../functions.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['message' => 'Error: User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

$appointment_id = $_POST['appointment_id'] ?? '';
$rating = $_POST['rating'] ?? '';
$comment = $_POST['comment'] ?? '';

$result = submit_review($appointment_id, $user_id, $rating, $comment);

echo json_encode(['message' => $result]);
?>