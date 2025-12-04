<?php
require_once 'config.php';

$sql = "SELECT user_id, full_name, email FROM Users WHERE role = 'therapist'";
$result = $conn->query($sql);

$therapists = [];
while ($row = $result->fetch_assoc()) {
    $therapists[] = $row;
}

echo json_encode(['therapists' => $therapists]);
?>