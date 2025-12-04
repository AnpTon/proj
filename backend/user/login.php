<?php
session_start();
require_once '../config.php';
require_once '../functions.php';

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

$result = login_user($email, $password);

if ($result === "Success: Login successful") {
    $sql = "SELECT user_id, full_name, email, role FROM Users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $user_result = $stmt->get_result();
    
    if ($user_result->num_rows === 1) {
        $user = $user_result->fetch_assoc();
        
        echo json_encode([
            'message' => $result,
            'user_id' => $user['user_id'],
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'role' => $user['role']
        ]);
    }
} else {
    echo json_encode(['message' => $result]);
}
?>