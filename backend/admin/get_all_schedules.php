<?php
session_start();
require_once '../config.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['error' => 'Access denied']);
    exit;
}

$sql = "SELECT 
            a.availability_id,
            a.date,
            a.start_time,
            a.end_time,
            u.full_name
        FROM Availability a
        JOIN Users u ON a.therapist_id = u.user_id
        WHERE a.date >= CURDATE()
        ORDER BY a.date ASC, a.start_time ASC";
        
$result = $conn->query($sql);

$schedules = [];
while ($row = $result->fetch_assoc()) {
    $schedules[] = $row;
}

echo json_encode(['schedules' => $schedules]);
?>