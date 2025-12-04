<?php
session_start();
require_once '../config.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['error' => 'Access denied']);
    exit;
}

$service_id = $_POST['service_id'] ?? '';

if (empty($service_id)) {
    echo json_encode(['message' => 'Error: Service ID required']);
    exit;
}

$check_sql = "SELECT COUNT(*) as count FROM Appointments WHERE service_id = ?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("i", $service_id);
$check_stmt->execute();
$check_result = $check_stmt->get_result()->fetch_assoc();

if ($check_result['count'] > 0) {
    echo json_encode(['message' => 'Error: Cannot delete service with existing appointments']);
    exit;
}

$sql = "DELETE FROM Services WHERE service_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $service_id);

if ($stmt->execute()) {
    echo json_encode(['message' => 'Success: Service deleted successfully']);
} else {
    echo json_encode(['message' => 'Error: ' . $stmt->error]);
}
?>