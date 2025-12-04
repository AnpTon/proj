<?php
require_once '../config.php';
require_once '../functions.php';

$full_name = $_POST['full_name'] ?? '';
$email = $_POST['email'] ?? '';
$phone_number = $_POST['phone_number'] ?? '';
$password = $_POST['password'] ?? '';
$role = $_POST['role'] ?? 'customer';

$result = register_user($full_name, $email, $phone_number, $password, $role);

echo json_encode(['message' => $result]);
?>