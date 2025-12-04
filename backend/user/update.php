<?php
require_once '../config.php';
require_once '../functions.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['message' => 'Error: User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

$full_name = $_POST['full_name'] ?? '';
$email = $_POST['email'] ?? '';
$phone_number = $_POST['phone_number'] ?? '';

$result = update_user_profile($user_id, $full_name, $email, $phone_number);

echo json_encode(['message' => $result]);
?>