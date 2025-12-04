<?php
require_once '../config.php';
require_once '../functions.php';

$therapist_id = $_POST['therapist_id'] ?? '';
$date = $_POST['date'] ?? '';
$service_id = $_POST['service_id'] ?? '';

$result = get_available_time_slots($therapist_id, $date, $service_id);

echo json_encode(['slots' => $result]);
?>