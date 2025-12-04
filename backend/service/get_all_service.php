<?php
require_once '../config.php';
require_once '../functions.php';

$services = get_all_services();

echo json_encode(['services' => $services]);
?>