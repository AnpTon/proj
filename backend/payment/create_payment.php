<?php
require_once '../config.php';
require_once '../functions.php';

$appointment_id = $_POST['appointment_id'] ?? '';
$amount = $_POST['amount'] ?? '';
$payment_method = $_POST['payment_method'] ?? '';

$result = create_payment_record($appointment_id, $amount, $payment_method);

echo json_encode(['payment_id' => $result]);
?>