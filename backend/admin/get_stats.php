<?php
session_start();
require_once '../config.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['error' => 'Access denied']);
    exit;
}

$stats = [];

$sql = "SELECT COUNT(*) as total FROM Appointments";
$result = $conn->query($sql);
$stats['total_bookings'] = $result->fetch_assoc()['total'];

$sql = "SELECT COUNT(DISTINCT user_id) as total FROM Appointments 
        WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
$result = $conn->query($sql);
$stats['active_customers'] = $result->fetch_assoc()['total'];

$sql = "SELECT COUNT(*) as total FROM Appointments 
        WHERE appointment_date = CURDATE() AND status != 'canceled'";
$result = $conn->query($sql);
$stats['todays_appointments'] = $result->fetch_assoc()['total'];

$sql = "SELECT COUNT(*) as total FROM Users WHERE role = 'therapist'";
$result = $conn->query($sql);
$stats['active_therapists'] = $result->fetch_assoc()['total'];

echo json_encode(['stats' => $stats]);
?>