<?php
session_start();
require_once '../config.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['error' => 'Access denied']);
    exit;
}

$availability_id = $_POST['availability_id'] ?? '';

if (empty($availability_id)) {
    echo json_encode(['message' => 'Error: Availability ID required']);
    exit;
}

$sql = "DELETE FROM Availability WHERE availability_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $availability_id);

if ($stmt->execute()) {
    echo json_encode(['message' => 'Success: Schedule deleted successfully']);
} else {
    echo json_encode(['message' => 'Error: ' . $stmt->error]);
}
?>