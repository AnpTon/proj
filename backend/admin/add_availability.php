<?php
session_start();
require_once '../config.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['error' => 'Access denied']);
    exit;
}

$therapist_id = $_POST['therapist_id'] ?? '';
$date = $_POST['date'] ?? '';
$start_time = $_POST['start_time'] ?? '';
$end_time = $_POST['end_time'] ?? '';

if (empty($therapist_id) || empty($date) || empty($start_time) || empty($end_time)) {
    echo json_encode(['message' => 'Error: All fields are required']);
    exit;
}

$check_sql = "SELECT availability_id FROM Availability 
              WHERE therapist_id = ? AND date = ? 
              AND ((start_time <= ? AND end_time >= ?) OR (start_time <= ? AND end_time >= ?))";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("isssss", $therapist_id, $date, $start_time, $start_time, $end_time, $end_time);
$check_stmt->execute();

if ($check_stmt->get_result()->num_rows > 0) {
    echo json_encode(['message' => 'Error: Overlapping schedule exists for this therapist']);
    exit;
}

$sql = "INSERT INTO Availability (therapist_id, date, start_time, end_time) 
        VALUES (?, ?, ?, ?)";
        
$stmt = $conn->prepare($sql);
$stmt->bind_param("isss", $therapist_id, $date, $start_time, $end_time);

if ($stmt->execute()) {
    echo json_encode(['message' => 'Success: Schedule added successfully']);
} else {
    echo json_encode(['message' => 'Error: ' . $stmt->error]);
}
?>