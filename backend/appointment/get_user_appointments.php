<?php
session_start();
require_once '../config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

$sql = "SELECT 
            a.appointment_id,
            a.appointment_date,
            a.start_time,
            a.end_time,
            a.status,
            s.service_name,
            s.price,
            s.duration,
            t.full_name as therapist_name,
            r.review_id,
            r.rating
        FROM Appointments a
        JOIN Services s ON a.service_id = s.service_id
        JOIN Users t ON a.therapist_id = t.user_id
        LEFT JOIN Reviews r ON a.appointment_id = r.appointment_id AND r.user_id = a.user_id
        WHERE a.user_id = ?
        ORDER BY a.appointment_date DESC, a.start_time DESC";
        
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$appointments = [];
while ($row = $result->fetch_assoc()) {
    $appointments[] = $row;
}

echo json_encode(['appointments' => $appointments]);
?>