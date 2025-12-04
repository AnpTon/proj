<?php
require_once '../config.php';

$sql = "SELECT promo_code, description, discount_percent, end_date 
        FROM Promotions 
        WHERE CURDATE() BETWEEN start_date AND end_date
        ORDER BY end_date ASC";
$result = $conn->query($sql);

$promotions = [];
while ($row = $result->fetch_assoc()) {
    $promotions[] = $row;
}

echo json_encode(['promotions' => $promotions]);
?>