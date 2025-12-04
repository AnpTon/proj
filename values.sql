-- Use the database
USE wellness_booking_system;

-- 1. Insert sample Users
INSERT INTO Users (full_name, email, phone_number, password, role) VALUES
('Sarah Johnson', 'admin@wellness.com', '555-0100', '$2y$10$0qkszf2MOVQrLyO7eKtGyezDQWouCr9M893MMoZ43I30HaEUgpViq', 'admin'),
('Dr. Michael Chen', 'michael@wellness.com', '555-0101', '$2y$10$770ybF7Ii37HprvLC3pgPOlC/5Spf6Yw/SHTTDnhy4vxIJW4Oqo9i', 'therapist'),
('Emma Rodriguez', 'emma@wellness.com', '555-0102', '$2y$10$770ybF7Ii37HprvLC3pgPOlC/5Spf6Yw/SHTTDnhy4vxIJW4Oqo9i', 'therapist'),
('John Smith', 'john.smith@email.com', '555-0103', '$2y$10$2KAGEmZmg72q2ZJxqubYV.cfVLieGSzQnjcRWsbBBN4pwi3R3r8gu', 'customer'),
('Lisa Brown', 'lisa.brown@email.com', '555-0104', '$2y$10$2KAGEmZmg72q2ZJxqubYV.cfVLieGSzQnjcRWsbBBN4pwi3R3r8gu', 'customer');

-- 2. Insert sample Services 
INSERT INTO Services (service_name, description, duration, price) VALUES
('Swedish Massage', 'A relaxing full-body massage using long, gliding strokes to relieve muscle tension and improve circulation.', 60, 85.00),
('Deep Tissue Massage', 'Targeted massage focusing on deeper muscle layers to relieve chronic pain and muscle tightness.', 90, 120.00),
('Hot Stone Therapy', 'Warm stones placed on specific points to deeply relax muscles and improve energy flow.', 75, 95.00),
('Aromatherapy Session', 'Essential oils combined with gentle massage techniques to enhance mood and reduce stress.', 60, 80.00),
('Reflexology', 'Foot massage targeting specific pressure points to promote healing throughout the body.', 45, 65.00);

-- 3. Insert therapist Availability 
INSERT INTO Availability (therapist_id, date, start_time, end_time) VALUES
(2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00', '12:00:00'),
(2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00', '18:00:00'),
(2, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:00:00', '16:00:00'),
(3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00', '15:00:00'),
(3, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '08:00:00', '12:00:00'),
(3, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '13:00:00', '17:00:00');

-- 4. Insert sample Appointments 
INSERT INTO Appointments (user_id, therapist_id, service_id, appointment_date, start_time, end_time, status) VALUES
(4, 2, 1, DATE_ADD(CURDATE(), INTERVAL -7 DAY), '10:00:00', '11:00:00', 'completed'),
(5, 3, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00', '15:30:00', 'confirmed'),
(4, 2, 3, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '11:00:00', '12:15:00', 'pending'),
(5, 3, 4, DATE_ADD(CURDATE(), INTERVAL -3 DAY), '09:00:00', '10:00:00', 'canceled');

-- 5. Insert sample Payments 
INSERT INTO Payments (appointment_id, amount, payment_method, payment_status, transaction_id) VALUES
(1, 85.00, 'credit_card', 'paid', 'TXN123456789'),
(2, 120.00, 'paypal', 'paid', 'TXN987654321'),
(4, 80.00, 'credit_card', 'refunded', 'TXN456789123');

-- 6. Insert sample Reviews
INSERT INTO Reviews (appointment_id, user_id, rating, comment) VALUES
(1, 4, 5, 'Excellent massage! Michael was very professional and addressed all my tension points. Will definitely book again!'),
(2, 5, 4, 'Emma was wonderful. The deep tissue massage helped my back pain significantly. Would give 5 stars if the room was a bit warmer.');

-- 7. Insert sample Promotions
INSERT INTO Promotions (promo_code, description, discount_percent, start_date, end_date) VALUES
('WELCOME20', 'Welcome discount for new customers', 20.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
('WELLNESS10', '10% off all wellness services', 10.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY)),
('MASSAGEMONDAY', '15% off massage services on Mondays', 15.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 90 DAY));