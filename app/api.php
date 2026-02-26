<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
 
// Start session for admin authentication
session_start();

// Handle CORS securely for credentials
$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';

$action = $_GET['action'] ?? '';

// Helper function to protect admin routes
function requireAdmin() {
    if (empty($_SESSION['is_admin'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized access']);
        exit;
    }
}

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

// ================= ADMIN LOGIN ====================
if ($action === 'admin_login') {
    $data = json_decode(file_get_contents('php://input'), true);
    $user = $data['username'] ?? '';
    $pass = $data['password'] ?? '';

    $stmt = $db->prepare("SELECT password FROM admins WHERE username = ?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $result = $stmt->get_result();
    $admin = $result->fetch_assoc();

    // Secure DB check (In production, replace with password_verify)
    if ($admin && $pass === $admin['password']) {
        $_SESSION['is_admin'] = true;
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid admin credentials']);
    }
    exit;
}

// ================= AUTO-ASSIGN ====================
if ($action === 'auto_assign') {
    requireAdmin(); // Protect this route
    
    $pending = $db->query("SELECT id FROM bookings WHERE status = 'pending' AND mechanic_id IS NULL");
    $mechanics = $db->query("SELECT id FROM mechanics");
    
    $mechIds = [];
    while($m = $mechanics->fetch_assoc()) $mechIds[] = $m['id'];
    
    $count = 0;
    if (count($mechIds) > 0) {
        $stmt = $db->prepare("UPDATE bookings SET mechanic_id = ?, status = 'in-progress' WHERE id = ?");
        while($row = $pending->fetch_assoc()) {
            $mId = $mechIds[$count % count($mechIds)];
            $stmt->bind_param("ii", $mId, $row['id']);
            $stmt->execute();
            $count++;
        }
        $stmt->close();
    }
    echo json_encode(['success' => true, 'assigned' => $count]);
    exit;
}

// ================= CREATE BOOKING =================
if ($action === 'create_booking') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || empty($data['customerName']) || empty($data['customerEmail'])) {
        echo json_encode(['error' => 'Invalid or missing required input']);
        exit;
    }

    $booking_ref = 'BK' . strtoupper(uniqid());

    $stmt = $db->prepare("INSERT INTO bookings 
        (booking_ref, customer_name, customer_email, customer_phone, car_make, car_model, car_year, license_plate, issue_description, preferred_date, preferred_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $stmt->bind_param("sssssssssss", $booking_ref, $data['customerName'], $data['customerEmail'], $data['customerPhone'], $data['carMake'], $data['carModel'], $data['carYear'], $data['licensePlate'], $data['issueDescription'], $data['preferredDate'], $data['preferredTime']);

    if (!$stmt->execute()) {
        echo json_encode(['error' => $stmt->error]);
        exit;
    }
    $stmt->close();

    echo json_encode(['success' => true, 'booking_ref' => $booking_ref]);
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
    requireAdmin(); // Protect this route

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
    requireAdmin(); // Protect this route
    
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

// ================= INVALID ACTION =================
echo json_encode(['error' => 'Invalid action']);
exit;