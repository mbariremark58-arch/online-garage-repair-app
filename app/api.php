<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$db = new mysqli('localhost', 'root', '', 'car_repair_shop');

if ($db->connect_error) {
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$db->set_charset('utf8');


// ================= CREATE TABLES =================
$db->query("CREATE TABLE IF NOT EXISTS mechanics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    specialization VARCHAR(100),
    experience VARCHAR(50)
)");

$db->query("CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_ref VARCHAR(50) UNIQUE,
    customer_name VARCHAR(100),
    customer_email VARCHAR(100),
    customer_phone VARCHAR(20),
    car_make VARCHAR(50),
    car_model VARCHAR(50),
    car_year VARCHAR(4),
    license_plate VARCHAR(20),
    issue_description TEXT,
    preferred_date DATE,
    preferred_time TIME,
    status VARCHAR(50) DEFAULT 'pending',
    mechanic_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

$db->query("CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

// ================= GET MECHANICS =================
if ($action === 'get_mechanics') {
    $result = $db->query("SELECT * FROM mechanics");
    $mechanics = [];
    while ($row = $result->fetch_assoc()) {
        $mechanics[] = $row;
    }
    echo json_encode($mechanics);
    exit;
}

// ================= INSERT SAMPLE MECHANICS =================
$result = $db->query("SELECT COUNT(*) as count FROM mechanics");
$row = $result->fetch_assoc();

if ($row['count'] == 0) {
    $db->query("INSERT INTO mechanics (name, specialization, experience) VALUES
        ('John Smith', 'Engine & Transmission', '10 years'),
        ('Sarah Johnson', 'Brakes & Suspension', '8 years'),
        ('Mike Williams', 'Electrical Systems', '12 years'),
        ('Emily Brown', 'General Maintenance', '6 years')");
}

$action = $_GET['action'] ?? '';


// ================= CREATE BOOKING =================
if ($action === 'create_booking') {

    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        echo json_encode(['error' => 'Invalid JSON input']);
        exit;
    }

    // 🔥 Generate UNIQUE booking reference safely
    $booking_ref = 'BK' . strtoupper(uniqid());

    $stmt = $db->prepare("INSERT INTO bookings 
        (booking_ref, customer_name, customer_email, customer_phone, car_make, car_model, car_year, license_plate, issue_description, preferred_date, preferred_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $stmt->bind_param(
        "sssssssssss",
        $booking_ref,
        $data['customerName'],
        $data['customerEmail'],
        $data['customerPhone'],
        $data['carMake'],
        $data['carModel'],
        $data['carYear'],
        $data['licensePlate'],
        $data['issueDescription'],
        $data['preferredDate'],
        $data['preferredTime']
    );

    if (!$stmt->execute()) {
        echo json_encode(['error' => $stmt->error]);
        exit;
    }

    $stmt->close();

    echo json_encode([
        'success' => true,
        'booking_ref' => $booking_ref
    ]);
    exit;
}
// ================= TRACK BOOKINGS =================
if ($action === 'track_bookings') {
    $email = $_GET['email'] ?? '';
    $stmt = $db->prepare("SELECT * FROM bookings WHERE customer_email = ? ORDER BY created_at DESC");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    $bookings = [];
    while ($row = $result->fetch_assoc()) {
        $bookings[] = $row;
    }

    echo json_encode($bookings);
    exit;
}

// ================= GET BOOKINGS =================
if ($action === 'get_bookings') {

    $result = $db->query("SELECT * FROM bookings ORDER BY created_at DESC");

    $bookings = [];
    while ($row = $result->fetch_assoc()) {
        $bookings[] = $row;
    }

    echo json_encode($bookings);
    exit;
}


// ================= UPDATE BOOKING =================
if ($action === 'update_booking') {

    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? '';

    if (!$id) {
        echo json_encode(['error' => 'Missing ID']);
        exit;
    }

    if (isset($data['status'])) {
        $stmt = $db->prepare("UPDATE bookings SET status = ? WHERE id = ?");
        $stmt->bind_param("si", $data['status'], $id);
        $stmt->execute();
        $stmt->close();
    }

    if (array_key_exists('mechanic_id', $data)) {
        if ($data['mechanic_id']) {
            $stmt = $db->prepare("UPDATE bookings SET mechanic_id = ? WHERE id = ?");
            $stmt->bind_param("ii", $data['mechanic_id'], $id);
        } else {
            $stmt = $db->prepare("UPDATE bookings SET mechanic_id = NULL WHERE id = ?");
            $stmt->bind_param("i", $id);
        }
        $stmt->execute();
        $stmt->close();
    }

    echo json_encode(['success' => true]);
    exit;
}


// ================= DELETE BOOKING =================
if ($action === 'delete_booking') {

    $id = $_GET['id'] ?? '';

    $stmt = $db->prepare("DELETE FROM bookings WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->close();

    echo json_encode(['success' => true]);
    exit;
}


// ================= INVALID ACTION =================
echo json_encode(['error' => 'Invalid action']);
exit;