<?php
require_once '../config.php';
require_once '../functions.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['message' => 'Error: User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

$therapist_id = $_POST['therapist_id'] ?? '';
$service_id = $_POST['service_id'] ?? '';
$appointment_date = $_POST['appointment_date'] ?? '';
$start_time = $_POST['start_time'] ?? '';

$result = create_appointment($user_id, $therapist_id, $service_id, $appointment_date, $start_time);

echo json_encode(['appointment_id' => $result]);
?>