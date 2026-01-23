// API Base URL
const API_URL = 'api.php';

// Database (will be loaded from server)
let database = {
    bookings: [],
    mechanics: [],
    notifications: []
};

// Load data from server
async function loadDatabase() {
    try {
        // Load bookings
        const bookingsResponse = await fetch(`${API_URL}?action=get_bookings`);
        database.bookings = await bookingsResponse.json();
        
        // Load mechanics
        const mechanicsResponse = await fetch(`${API_URL}?action=get_mechanics`);
        database.mechanics = await mechanicsResponse.json();
        
        // Load notifications
        const notificationsResponse = await fetch(`${API_URL}?action=get_notifications`);
        database.notifications = await notificationsResponse.json();
    } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error loading data from server', 'error');
    }
}

// Initialize
loadDatabase();

// DOM Elements
const customerViewBtn = document.getElementById('customerViewBtn');
const adminViewBtn = document.getElementById('adminViewBtn');
const customerView = document.getElementById('customerView');
const adminView = document.getElementById('adminView');
const bookingForm = document.getElementById('bookingForm');
const trackBookingBtn = document.getElementById('trackBookingBtn');
const statusFilter = document.getElementById('statusFilter');
const notification = document.getElementById('notification');
const modal = document.getElementById('bookingModal');
const closeModal = document.querySelector('.close');

// View Switching
customerViewBtn.addEventListener('click', () => {
    customerView.classList.add('active');
    adminView.classList.remove('active');
    customerViewBtn.classList.add('active');
    adminViewBtn.classList.remove('active');
});

adminViewBtn.addEventListener('click', async () => {
    adminView.classList.add('active');
    customerView.classList.remove('active');
    adminViewBtn.classList.add('active');
    customerViewBtn.classList.remove('active');
    await loadDatabase();
    renderAdminDashboard();
});

// Submit Booking Form
bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const bookingData = {
        customerName: document.getElementById('customerName').value,
        customerEmail: document.getElementById('customerEmail').value,
        customerPhone: document.getElementById('customerPhone').value,
        carMake: document.getElementById('carMake').value,
        carModel: document.getElementById('carModel').value,
        carYear: document.getElementById('carYear').value,
        licensePlate: document.getElementById('licensePlate').value,
        issueDescription: document.getElementById('issueDescription').value,
        preferredDate: document.getElementById('preferredDate').value,
        preferredTime: document.getElementById('preferredTime').value
    };

    try {
        const response = await fetch(`${API_URL}?action=create_booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Booking submitted successfully!');
            bookingForm.reset();
            await loadDatabase();
        } else {
            showNotification('Error submitting booking', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error submitting booking', 'error');
    }
});

// Track Booking
trackBookingBtn.addEventListener('click', async () => {
    const email = document.getElementById('trackingEmail').value.trim();
    if (!email) {
        showNotification('Please enter your email', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}?action=track_bookings&email=${encodeURIComponent(email)}`);
        const userBookings = await response.json();
        
        if (userBookings.length === 0) {
            showNotification('No bookings found for this email', 'error');
            document.getElementById('customerBookings').innerHTML = '<p style="text-align: center; color: #999;">No bookings found</p>';
            return;
        }

        renderCustomerBookings(userBookings);
        showNotification(`Found ${userBookings.length} booking(s)`);
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error tracking bookings', 'error');
    }
});

// Render Customer Bookings
function renderCustomerBookings(bookings) {
    const container = document.getElementById('customerBookings');
    
    container.innerHTML = bookings.map(booking => `
        <div class="booking-card">
            <div class="booking-header">
                <span class="booking-id">${booking.id}</span>
                <span class="status-badge status-${booking.status}">${booking.status}</span>
            </div>
            <div class="booking-details">
                <div class="detail-item">
                    <span class="detail-label">Vehicle:</span> ${booking.car_year} ${booking.car_make} ${booking.car_model}
                </div>
                <div class="detail-item">
                    <span class="detail-label">License:</span> ${booking.license_plate}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Scheduled:</span> ${formatDate(booking.preferred_date)} at ${formatTime(booking.preferred_time)}
                </div>
                ${booking.mechanic_id ? `<div class="detail-item"><span class="detail-label">Mechanic:</span> ${getMechanicName(booking.mechanic_id)}</div>` : ''}
            </div>
            <div class="detail-item">
                <span class="detail-label">Issue:</span> ${booking.issue_description}
            </div>
        </div>
    `).join('');
}

// Render Admin Dashboard
async function renderAdminDashboard() {
    await updateStats();
    renderAdminBookings();
}

// Update Statistics
async function updateStats() {
    try {
        const response = await fetch(`${API_URL}?action=get_stats`);
        const stats = await response.json();

        document.getElementById('totalBookings').textContent = stats.total || 0;
        document.getElementById('pendingBookings').textContent = stats.pending || 0;
        document.getElementById('inProgressBookings').textContent = stats.in_progress || 0;
        document.getElementById('completedBookings').textContent = stats.completed || 0;
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Render Admin Bookings
function renderAdminBookings() {
    const filterValue = statusFilter.value;
    let bookings = database.bookings;

    if (filterValue !== 'all') {
        bookings = bookings.filter(b => b.status === filterValue);
    }

    const container = document.getElementById('adminBookings');
    
    if (bookings.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">No bookings found</p>';
        return;
    }

    container.innerHTML = bookings.map(booking => `
        <div class="booking-card">
            <div class="booking-header">
                <span class="booking-id">${booking.id}</span>
                <span class="status-badge status-${booking.status}">${booking.status}</span>
            </div>
            <div class="booking-details">
                <div class="detail-item">
                    <span class="detail-label">Customer:</span> ${booking.customer_name}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Contact:</span> ${booking.customer_phone}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email:</span> ${booking.customer_email}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Vehicle:</span> ${booking.car_year} ${booking.car_make} ${booking.car_model}
                </div>
                <div class="detail-item">
                    <span class="detail-label">License:</span> ${booking.license_plate}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Scheduled:</span> ${formatDate(booking.preferred_date)} at ${formatTime(booking.preferred_time)}
                </div>
            </div>
            <div class="detail-item">
                <span class="detail-label">Issue:</span> ${booking.issue_description}
            </div>
            <div class="admin-actions">
                <select class="mechanic-select" id="mechanic-${booking.id}">
                    <option value="">Assign Mechanic</option>
                    ${database.mechanics.map(m => `
                        <option value="${m.id}" ${booking.mechanic_id == m.id ? 'selected' : ''}>
                            ${m.name}
                        </option>
                    `).join('')}
                </select>
                <button class="btn btn-success" onclick="updateStatus('${booking.id}', 'in-progress')">
                    Start Work
                </button>
                <button class="btn btn-warning" onclick="updateStatus('${booking.id}', 'completed')">
                    Complete
                </button>
                <button class="btn btn-danger" onclick="deleteBooking('${booking.id}')">
                    Delete
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners for mechanic selection
    bookings.forEach(booking => {
        const select = document.getElementById(`mechanic-${booking.id}`);
        if (select) {
            select.addEventListener('change', (e) => {
                assignMechanic(booking.id, parseInt(e.target.value));
            });
        }
    });
}

// Assign Mechanic
async function assignMechanic(bookingId, mechanicId) {
    try {
        const response = await fetch(`${API_URL}?action=update_booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: bookingId,
                mechanic_id: mechanicId
            })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Mechanic assigned successfully!');
            await loadDatabase();
            renderAdminDashboard();
        } else {
            showNotification('Error assigning mechanic', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error assigning mechanic', 'error');
    }
}

// Update Booking Status
async function updateStatus(bookingId, newStatus) {
    try {
        const response = await fetch(`${API_URL}?action=update_booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: bookingId,
                status: newStatus
            })
        });

        const result = await response.json();

        if (result.success) {
            showNotification(`Booking status updated to ${newStatus}!`);
            await loadDatabase();
            renderAdminDashboard();
        } else {
            showNotification('Error updating status', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error updating status', 'error');
    }
}

// Delete Booking
async function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}?action=delete_booking&id=${bookingId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Booking deleted successfully!');
            await loadDatabase();
            renderAdminDashboard();
        } else {
            showNotification('Error deleting booking', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error deleting booking', 'error');
    }
}

// Show Toast Notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Status Filter
statusFilter.addEventListener('change', async () => {
    await loadDatabase();
    renderAdminBookings();
});

// Modal Controls
closeModal.addEventListener('click', () => {
    modal.classList.remove('show');
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(timeString) {
    if (!timeString) return '';
    // Handle both HH:MM:SS and HH:MM formats
    const parts = timeString.split(':');
    return `${parts[0]}:${parts[1]}`;
}

function getMechanicName(mechanicId) {
    const mechanic = database.mechanics.find(m => m.id == mechanicId);
    return mechanic ? mechanic.name : 'Unassigned';
}

// Set minimum date to today
document.getElementById('preferredDate').min = new Date().toISOString().split('T')[0];

// Initial render
renderAdminDashboard();