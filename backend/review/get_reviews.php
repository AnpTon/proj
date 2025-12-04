<?php
require_once '../config.php';

$sql = "SELECT r.rating, r.comment, u.full_name as user_name 
        FROM Reviews r 
        JOIN Users u ON r.user_id = u.user_id 
        ORDER BY r.created_at DESC 
        LIMIT 5";

$result = $conn->query($sql);

$reviews = [];
while ($row = $result->fetch_assoc()) {
    $reviews[] = $row;
}

echo json_encode(['reviews' => $reviews]);
?>