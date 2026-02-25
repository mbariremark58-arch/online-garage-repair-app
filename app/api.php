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

require_once 'config.php';
$action = $_GET['action'] ?? ''; //To prevent warnings

if ($action === 'admin_login') {
    $data = json_decode(file_get_contents('php://input'), true);
    // Simple prototype logic; use password_verify() in production
    if ($data['username'] === 'admin' && $data['password'] === 'password123') {
        $_SESSION['admin_logged_in'] = true;
        echo json_encode(['success' => true]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
    }
    exit;
}

//Protect middleware
$protected_actions = ['get_bookings', 'update_booking', 'delete_booking'];
if (in_array($action, $protected_actions) && !isset($_SESSION['admin_logged_in'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden: Admin access required']);
    exit;
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

// ================= Download receipt =================
if ($action === 'download_receipt') {
    $ref = $_GET['ref'] ?? '';
    $stmt = $db->prepare("SELECT * FROM bookings WHERE booking_ref = ?");
    $stmt->bind_param("s", $ref);
    $stmt->execute();
    $booking = $stmt->get_result()->fetch_assoc();

    if (!$booking) die("Booking not found");

    // For a simple prototype without external libs, you can output an HTML file 
    // that the browser can "Print to PDF", or integrate Dompdf here:
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="Receipt_'.$ref.'.pdf"');
    
    // Logic to render HTML to PDF would go here
    echo "Receipt Data for " . $booking['customer_name']; 
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