<?php
session_start();
require_once '../config.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['error' => 'Access denied']);
    exit;
}

$service_name = $_POST['service_name'] ?? '';
$description = $_POST['description'] ?? '';
$duration = $_POST['duration'] ?? '';
$price = $_POST['price'] ?? '';

if (empty($service_name) || empty($description) || empty($duration) || empty($price)) {
    echo json_encode(['message' => 'Error: All fields are required']);
    exit;
}

$sql = "INSERT INTO Services (service_name, description, duration, price) 
        VALUES (?, ?, ?, ?)";
        
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssid", $service_name, $description, $duration, $price);

if ($stmt->execute()) {
    echo json_encode(['message' => 'Success: Service added successfully']);
} else {
    echo json_encode(['message' => 'Error: ' . $stmt->error]);
}
?>