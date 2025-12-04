<?php
// User Management Functions
//Register a new user
function register_user($full_name, $email, $phone_number, $password, $role) {
    global $conn;
    
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    $sql = "INSERT INTO Users (full_name, email, phone_number, password, role) 
            VALUES (?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssss", $full_name, $email, $phone_number, $hashed_password, $role);
    
    if ($stmt->execute()) {
        return "Success: User registered successfully";
    } else {
        return "Error: " . $stmt->error;
    }
}

//Login user
function login_user($email, $password) {
    global $conn;
    
    $sql = "SELECT user_id, full_name, email, password, role FROM Users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['full_name'] = $user['full_name'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['role'] = $user['role'];
            
            return "Success: Login successful";
        } else {
            return "Error: Invalid password";
        }
    } else {
        return "Error: User not found";
    }
}

//Update user profile
function update_user_profile($user_id, $full_name, $email, $phone_number) {
    global $conn;
    
    $sql = "UPDATE Users 
            SET full_name = ?, email = ?, phone_number = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE user_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssi", $full_name, $email, $phone_number, $user_id);
    
    if ($stmt->execute()) {
        return "Success: Profile updated successfully";
    } else {
        return "Error: " . $stmt->error;
    }
}
// Appointment Management Functions
function get_available_time_slots($therapist_id, $date, $service_id) {
    global $conn;
    
    $sql = "SELECT duration FROM Services WHERE service_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $service_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        return ["Error: Service not found"];
    }
    
    $service = $result->fetch_assoc();
    $duration = $service['duration'];
    
    $sql = "SELECT start_time, end_time FROM Availability 
            WHERE therapist_id = ? AND date = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("is", $therapist_id, $date);
    $stmt->execute();
    $availability = $stmt->get_result();
    
    if ($availability->num_rows === 0) {
        return generateDefaultTimeSlots($duration);
    }
    
    $avail = $availability->fetch_assoc();
    $available_start = strtotime($avail['start_time']);
    $available_end = strtotime($avail['end_time']);
    
    $sql = "SELECT start_time, end_time FROM Appointments 
            WHERE therapist_id = ? AND appointment_date = ? AND status != 'canceled'";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("is", $therapist_id, $date);
    $stmt->execute();
    $appointments = $stmt->get_result();
    
    $booked_slots = [];
    while ($appt = $appointments->fetch_assoc()) {
        $booked_slots[] = [
            'start' => strtotime($appt['start_time']),
            'end' => strtotime($appt['end_time'])
        ];
    }
    
    $available_slots = [];
    $current_time = $available_start;
    
    while ($current_time + ($duration * 60) <= $available_end) {
        $slot_start = $current_time;
        $slot_end = $current_time + ($duration * 60);
        
        $is_available = true;
        foreach ($booked_slots as $booked) {
            if (!($slot_end <= $booked['start'] || $slot_start >= $booked['end'])) {
                $is_available = false;
                break;
            }
        }
        
        if ($is_available) {
            $available_slots[] = date('H:i', $slot_start);
        }
        
        $current_time += 1800; 
    }
    
    if (empty($available_slots)) {
        return ["No available slots for this date"];
    }
    
    return $available_slots;
}

function generateDefaultTimeSlots($duration) {
    $slots = [];
    $start_hour = 9; 
    $end_hour = 17; 
    
    for ($hour = $start_hour; $hour < $end_hour; $hour++) {
        for ($minute = 0; $minute < 60; $minute += 30) {
            $time = sprintf('%02d:%02d', $hour, $minute);
            $slots[] = $time;
        }
    }
    
    return $slots;
}

//Create appointment
function create_appointment($user_id, $therapist_id, $service_id, $appointment_date, $start_time) {
    global $conn;
    
    $sql = "SELECT duration, price FROM Services WHERE service_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $service_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        return "Error: Service not found";
    }
    
    $service = $result->fetch_assoc();
    $duration = $service['duration'];
    
    $start_timestamp = strtotime($start_time);
    $end_timestamp = $start_timestamp + ($duration * 60);
    $end_time = date('H:i', $end_timestamp);
    
    $sql = "INSERT INTO Appointments (user_id, therapist_id, service_id, appointment_date, start_time, end_time, status) 
            VALUES (?, ?, ?, ?, ?, ?, 'pending')";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iiisss", $user_id, $therapist_id, $service_id, $appointment_date, $start_time, $end_time);
    
    if ($stmt->execute()) {
        return $stmt->insert_id; 
    } else {
        return "Error: " . $stmt->error;
    }
}

// Update appointment status
function update_appointment_status($appointment_id, $new_status) {
    global $conn;
    
    $sql = "UPDATE Appointments SET status = ? WHERE appointment_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $new_status, $appointment_id);
    
    if ($stmt->execute()) {
        return "Success: Appointment status updated to " . $new_status;
    } else {
        return "Error: " . $stmt->error;
    }
}
// C. Service Management Functions
//Get all services
function get_all_services() {
    global $conn;
    
    $sql = "SELECT * FROM Services ORDER BY service_name";
    $result = $conn->query($sql);
    
    $services = [];
    while ($row = $result->fetch_assoc()) {
        $services[] = $row;
    }
    
    return $services;
}

//Get service by ID
function get_service_by_id($service_id) {
    global $conn;
    
    $sql = "SELECT * FROM Services WHERE service_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $service_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        return $result->fetch_assoc();
    } else {
        return "Error: Service not found";
    }
}
// Payment Processing Functions
// Record Paymeny
function create_payment_record($appointment_id, $amount, $payment_method) {
    global $conn;
    
    $sql = "INSERT INTO Payments (appointment_id, amount, payment_method, payment_status) 
            VALUES (?, ?, ?, 'paid')";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ids", $appointment_id, $amount, $payment_method);
    
    if ($stmt->execute()) {
        return $stmt->insert_id; 
    } else {
        return "Error: " . $stmt->error;
    }
}

// Applu Promo
function apply_promo_code($promo_code, $total_amount) {
    global $conn;
    
    $sql = "SELECT discount_percent FROM Promotions 
            WHERE promo_code = ? AND CURDATE() BETWEEN start_date AND end_date";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $promo_code);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        $promo = $result->fetch_assoc();
        $discount_percent = $promo['discount_percent'];
        
        $discount = ($total_amount * $discount_percent) / 100;
        $discounted_amount = $total_amount - $discount;
        
        return $discounted_amount;
    } else {
        return "Error: Invalid or expired promo code";
    }
}
//Review Management Functions
// Submit review
function submit_review($appointment_id, $user_id, $rating, $comment) {
    global $conn;
    
    $sql = "SELECT appointment_id FROM Appointments 
            WHERE appointment_id = ? AND user_id = ? AND status = 'completed'";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $appointment_id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        return "Error: Cannot review this appointment";
    }
    
    $sql = "INSERT INTO Reviews (appointment_id, user_id, rating, comment) 
            VALUES (?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iiis", $appointment_id, $user_id, $rating, $comment);
    
    if ($stmt->execute()) {
        return "Success: Review submitted successfully";
    } else {
        return "Error: " . $stmt->error;
    }
}
?>