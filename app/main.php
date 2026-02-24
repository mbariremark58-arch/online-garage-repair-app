<?php?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AutoFix - Car Repair Shop</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="container">
            <h1 class="logo">🔧 AutoFix</h1>
            <div class="nav-links">
                <a href="landing.html" class="nav-btn home-btn">🏠 Home</a>
                <button id="customerViewBtn" class="nav-btn active">Customer</button>
                <button id="adminViewBtn" class="nav-btn">Admin</button>
            </div>
        </div>
    </nav>

    <!-- Customer View -->
    <div id="customerView" class="view-section active">
        <div class="container">
            <section class="booking-section">
                <h2>Book a Repair Service</h2>
                <form id="bookingForm" class="booking-form">
                    <div class="form-group">
                        <label for="customerName">Full Name *</label>
                        <input type="text" id="customerName" required>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="customerEmail">Email *</label>
                            <input type="email" id="customerEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="customerPhone">Phone *</label>
                            <input type="tel" id="customerPhone" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="carMake">Car Make *</label>
                            <input type="text" id="carMake" placeholder="e.g., Toyota" required>
                        </div>
                        <div class="form-group">
                            <label for="carModel">Car Model *</label>
                            <input type="text" id="carModel" placeholder="e.g., Camry" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="carYear">Year *</label>
                            <input type="number" id="carYear" min="1990" max="2025" required>
                        </div>
                        <div class="form-group">
                            <label for="licensePlate">License Plate *</label>
                            <input type="text" id="licensePlate" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="issueDescription">Issue Description *</label>
                        <textarea id="issueDescription" rows="4" placeholder="Describe the problem with your vehicle..." required></textarea>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="preferredDate">Preferred Date *</label>
                            <input type="date" id="preferredDate" required>
                        </div>
                        <div class="form-group">
                            <label for="preferredTime">Preferred Time *</label>
                            <input type="time" id="preferredTime" required>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary">Submit Booking</button>
                </form>
            </section>

            <section class="status-section">
                <h2>Track Your Booking</h2>
                <div class="search-box">
                    <input type="text" id="trackingEmail" placeholder="Enter your email to track booking">
                    <button id="trackBookingBtn" class="btn btn-primary">Track</button>
                </div>
                <div id="customerBookings" class="bookings-list"></div>
            </section>
        </div>
    </div>

    <!-- Admin View -->
    <div id="adminView" class="view-section">
        <div class="container">
            <section class="admin-dashboard">
                <h2>Admin Dashboard</h2>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3 id="totalBookings">0</h3>
                        <p>Total Bookings</p>
                    </div>
                    <div class="stat-card">
                        <h3 id="pendingBookings">0</h3>
                        <p>Pending</p>
                    </div>
                    <div class="stat-card">
                        <h3 id="inProgressBookings">0</h3>
                        <p>In Progress</p>
                    </div>
                    <div class="stat-card">
                        <h3 id="completedBookings">0</h3>
                        <p>Completed</p>
                    </div>
                </div>

                <div class="filters">
                    <label>Filter by Status:</label>
                    <select id="statusFilter">
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                <div id="adminBookings" class="admin-bookings-list"></div>
            </section>
        </div>
    </div>

    <!-- Notification Toast -->
    <div id="notification" class="notification"></div>

    <!-- Modal for Booking Details -->
    <div id="bookingModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <div id="modalBody"></div>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>