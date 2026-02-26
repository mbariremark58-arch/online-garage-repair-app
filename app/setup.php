<?php
// Database setup script - Run this once to create database and tables

$host = 'localhost';
$user = 'root';
$pass = '';

// Create connection without database
$conn = new mysqli($host, $user, $pass);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database
$sql = "CREATE DATABASE IF NOT EXISTS car_repair_shop";
if ($conn->query($sql) === TRUE) {
    echo "Database created successfully<br>";
} else {
    echo "Error creating database: " . $conn->error . "<br>";
}

// Select database
$conn->select_db('car_repair_shop');

// ==========================================
// 1. ADMINS TABLE (FIXED: Execution added)
// ==========================================
$sql = "CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
)";
if ($conn->query($sql) === TRUE) {
    echo "Table 'admins' created successfully<br>";
} else {
    echo "Error creating table 'admins': " . $conn->error . "<br>";
}

$sql = "INSERT INTO admins (username, password) VALUES ('admin', 'Admin123') ON DUPLICATE KEY UPDATE username=username";
if ($conn->query($sql) === TRUE) {
    echo "Default admin inserted successfully<br>";
} else {
    echo "Error inserting admin: " . $conn->error . "<br>";
}

// ==========================================
// 2. MECHANICS TABLE (FIXED: Columns combined)
// ==========================================
$sql = "CREATE TABLE IF NOT EXISTS mechanics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    experience VARCHAR(50),
    last_assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
if ($conn->query($sql) === TRUE) {
    echo "Table 'mechanics' created successfully<br>";
} else {
    echo "Error creating table 'mechanics': " . $conn->error . "<br>";
}

// ==========================================
// 3. BOOKINGS TABLE
// ==========================================
$sql = "CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_ref VARCHAR(50) UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    car_make VARCHAR(50) NOT NULL,
    car_model VARCHAR(50) NOT NULL,
    car_year VARCHAR(4) NOT NULL,
    license_plate VARCHAR(20) NOT NULL,
    issue_description TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time TIME NOT NULL,
    status ENUM('pending', 'in-progress', 'completed') DEFAULT 'pending',
    mechanic_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mechanic_id) REFERENCES mechanics(id) ON DELETE SET NULL
)";
if ($conn->query($sql) === TRUE) {
    echo "Table 'bookings' created successfully<br>";
} else {
    echo "Error creating table 'bookings': " . $conn->error . "<br>";
}

// ==========================================
// 4. NOTIFICATIONS TABLE (FIXED: FK matches VARCHAR)
// ==========================================
$sql = "CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_ref) ON DELETE CASCADE
)";
if ($conn->query($sql) === TRUE) {
    echo "Table 'notifications' created successfully<br>";
} else {
    echo "Error creating table 'notifications': " . $conn->error . "<br>";
}

// ==========================================
// 5. SAMPLE DATA
// ==========================================
$sql = "INSERT INTO mechanics (name, specialization, experience) VALUES
    ('John Smith', 'Engine & Transmission', '10 years'),
    ('Sarah Johnson', 'Brakes & Suspension', '8 years'),
    ('Mike Williams', 'Electrical Systems', '12 years'),
    ('Emily Brown', 'General Maintenance', '6 years')
ON DUPLICATE KEY UPDATE name=name";
$conn->query($sql);

$sql = "INSERT INTO bookings (booking_ref, customer_name, customer_email, customer_phone, car_make, car_model, car_year, license_plate, issue_description, preferred_date, preferred_time, status, mechanic_id) VALUES
    ('BK1704900000001', 'Alice Thompson', 'alice.thompson@email.com', '(555) 123-4567', 'Toyota', 'Camry', '2020', 'ABC-1234', 'Engine making unusual rattling noise when accelerating.', '2026-01-15', '09:00:00', 'pending', NULL),
    ('BK1704900000002', 'Robert Martinez', 'robert.m@email.com', '(555) 234-5678', 'Honda', 'Civic', '2019', 'XYZ-5678', 'Brake pads need replacement. Squeaking sound when braking.', '2026-01-14', '14:00:00', 'in-progress', 2),
    ('BK1704900000003', 'Jennifer Lee', 'jennifer.lee@email.com', '(555) 345-6789', 'Ford', 'Explorer', '2021', 'DEF-9012', 'Oil change and general maintenance checkup needed.', '2026-01-13', '10:30:00', 'completed', 1)
ON DUPLICATE KEY UPDATE customer_name=customer_name";
$conn->query($sql);

echo "<br><strong>Database setup complete!</strong><br>";
echo "You can now use the application.";

$conn->close();
?>