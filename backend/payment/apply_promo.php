<?php
require_once '../config.php';
require_once '../functions.php';

$promo_code = $_POST['promo_code'] ?? '';
$total_amount = $_POST['total_amount'] ?? '';

$result = apply_promo_code($promo_code, $total_amount);

echo json_encode(['discounted_amount' => $result]);
?>