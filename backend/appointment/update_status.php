<?php
require_once '../config.php';
require_once '../functions.php';

$appointment_id = $_POST['appointment_id'] ?? '';
$new_status = $_POST['new_status'] ?? '';

$result = update_appointment_status($appointment_id, $new_status);

echo json_encode(['message' => $result]);
?>