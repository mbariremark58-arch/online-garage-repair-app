<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Handle different API endpoints
switch ($action) {
    case 'get_bookings':
        getBookings($conn);
        break;
    
    case 'get_booking':
        getBooking($conn);
        break;
    
    case 'create_booking':
        createBooking($conn);
        break;
    
    case 'update_booking':
        updateBooking($conn);
        break;
    
    case 'delete_booking':
        deleteBooking($conn);
        break;
    
    case 'get_mechanics':
        getMechanics($conn);
        break;
    
    case 'get_notifications':
        getNotifications($conn);
        break;
    
    case 'track_bookings':
        trackBookings($conn);
        break;
    
    case 'get_stats':
        getStats($conn);
        break;
    
    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}

// Get all bookings
function getBookings($conn) {
    $status = isset($_GET['status']) ? $_GET['status'] : 'all';
    
    $sql = "SELECT * FROM bookings";
    if ($status !== 'all') {
        $sql .= " WHERE status = ?";
    }
    $sql .= " ORDER BY created_at DESC";
    
    if ($status !== 'all') {
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $status);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $result = $conn->query($sql);
    }
    
    $bookings = [];
    while ($row = $result->fetch_assoc()) {
        $bookings[] = $row;
    }
    
    echo json_encode($bookings);
}

// Get single booking
function getBooking($conn) {
    $id = $_GET['id'];
    
    $stmt = $conn->prepare("SELECT * FROM bookings WHERE id = ?");
    $stmt->bind_param("s", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        echo json_encode($row);
    } else {
        echo json_encode(['error' => 'Booking not found']);
    }
}

// Create new booking
function createBooking($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = 'BK' . time();
    $stmt = $conn->prepare("INSERT INTO bookings (id, customer_name, customer_email, customer_phone, car_make, car_model, car_year, license_plate, issue_description, preferred_date, preferred_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')");
    
    $stmt->bind_param("sssssssssss", 
        $id,
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
    
    if ($stmt->execute()) {
        // Create notification
        createNotification($conn, $id, "New booking created for " . $data['customerName']);
        echo json_encode(['success' => true, 'id' => $id]);
    } else {
        echo json_encode(['error' => $stmt->error]);
    }
}

// Update booking
function updateBooking($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $updates = [];
    $params = [];
    $types = "";
    
    if (isset($data['status'])) {
        $updates[] = "status = ?";
        $params[] = $data['status'];
        $types .= "s";
    }
    
    // FIX: Check existence instead of isset to allow setting to NULL
    if (array_key_exists('mechanic_id', $data)) {
        $updates[] = "mechanic_id = ?";
        $params[] = $data['mechanic_id'] ? $data['mechanic_id'] : NULL;
        // Use 'i' for integer, but usually 's' works safely for nulls in prepared statements too. 
        // Strict typing would require conditional binding, but this usually works in mysqli.
        $types .= "i"; 
    }
    
    if (empty($updates)) {
        echo json_encode(['error' => 'No fields to update']);
        return;
    }
    
    $sql = "UPDATE bookings SET " . implode(", ", $updates) . " WHERE id = ?";
    $params[] = $data['id'];
    $types .= "s";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        $message = isset($data['status']) ? "Status updated to " . $data['status'] : "Booking updated";
        createNotification($conn, $data['id'], $message);
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => $stmt->error]);
    }
}

// Delete booking
function deleteBooking($conn) {
    $id = $_GET['id'];
    
    $stmt = $conn->prepare("DELETE FROM bookings WHERE id = ?");
    $stmt->bind_param("s", $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => $stmt->error]);
    }
}

// Get mechanics
function getMechanics($conn) {
    $result = $conn->query("SELECT * FROM mechanics");
    
    $mechanics = [];
    while ($row = $result->fetch_assoc()) {
        $mechanics[] = $row;
    }
    
    echo json_encode($mechanics);
}

// Get notifications
function getNotifications($conn) {
    $result = $conn->query("SELECT * FROM notifications ORDER BY timestamp DESC LIMIT 50");
    
    $notifications = [];
    while ($row = $result->fetch_assoc()) {
        $notifications[] = $row;
    }
    
    echo json_encode($notifications);
}

// Track bookings by email
function trackBookings($conn) {
    $email = $_GET['email'];
    
    $stmt = $conn->prepare("SELECT * FROM bookings WHERE customer_email = ? ORDER BY created_at DESC");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $bookings = [];
    while ($row = $result->fetch_assoc()) {
        $bookings[] = $row;
    }
    
    echo json_encode($bookings);
}

// Get statistics
function getStats($conn) {
    $stats = [];
    
    $result = $conn->query("SELECT COUNT(*) as total FROM bookings");
    $stats['total'] = $result->fetch_assoc()['total'];
    
    $result = $conn->query("SELECT COUNT(*) as pending FROM bookings WHERE status = 'pending'");
    $stats['pending'] = $result->fetch_assoc()['pending'];
    
    $result = $conn->query("SELECT COUNT(*) as in_progress FROM bookings WHERE status = 'in-progress'");
    $stats['in_progress'] = $result->fetch_assoc()['in_progress'];
    
    $result = $conn->query("SELECT COUNT(*) as completed FROM bookings WHERE status = 'completed'");
    $stats['completed'] = $result->fetch_assoc()['completed'];
    
    echo json_encode($stats);
}

// Create notification
function createNotification($conn, $booking_id, $message) {
    $stmt = $conn->prepare("INSERT INTO notifications (booking_id, message) VALUES (?, ?)");
    $stmt->bind_param("ss", $booking_id, $message);
    $stmt->execute();
}

$conn->close();
?>