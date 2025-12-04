<?php
session_start();
require_once '../config.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['error' => 'Access denied']);
    exit;
}

$sql = "SELECT 
            a.appointment_id,
            a.appointment_date,
            a.start_time,
            a.end_time,
            a.status,
            s.service_name,
            c.full_name as customer_name
        FROM Appointments a
        JOIN Services s ON a.service_id = s.service_id
        JOIN Users c ON a.user_id = c.user_id
        ORDER BY a.appointment_date DESC, a.start_time DESC";
        
$result = $conn->query($sql);

$bookings = [];
while ($row = $result->fetch_assoc()) {
    $bookings[] = $row;
}

echo json_encode(['bookings' => $bookings]);
?>