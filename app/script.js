// Database (simulating local storage)
let database = {
    bookings: [],
    mechanics: [
        { id: 1, name: "John Smith" },
        { id: 2, name: "Sarah Johnson" },
        { id: 3, name: "Mike Williams" },
        { id: 4, name: "Emily Brown" }
    ],
    notifications: []
};

// Load database from localStorage
function loadDatabase() {
    const savedData = localStorage.getItem('carRepairDB');
    if (savedData) {
        database = JSON.parse(savedData);
    }
}

// Save database to localStorage
function saveDatabase() {
    localStorage.setItem('carRepairDB', JSON.stringify(database));
}

// Initialize
loadDatabase();

// DOM Elements
const customerViewBtn = document.getElementById('customerViewBtn');
const adminViewBtn = document.getElementById('adminViewBtn');
const customerView = document.getElementById('customerView');
const adminView = document.getElementById('adminView');
const bookingForm = document.getElementById('bookingForm');
const generateFakeDataBtn = document.getElementById('generateFakeDataBtn');
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

adminViewBtn.addEventListener('click', () => {
    adminView.classList.add('active');
    customerView.classList.remove('active');
    adminViewBtn.classList.add('active');
    customerViewBtn.classList.remove('active');
    renderAdminDashboard();
});

// Generate Fake Data using Faker.js
generateFakeDataBtn.addEventListener('click', () => {
    if (typeof faker === 'undefined') {
        showNotification('Faker.js not loaded!', 'error');
        return;
    }

    document.getElementById('customerName').value = faker.person.fullName();
    document.getElementById('customerEmail').value = faker.internet.email();
    document.getElementById('customerPhone').value = faker.phone.number();
    document.getElementById('carMake').value = faker.vehicle.manufacturer();
    document.getElementById('carModel').value = faker.vehicle.model();
    document.getElementById('carYear').value = faker.number.int({ min: 2000, max: 2024 });
    document.getElementById('licensePlate').value = faker.vehicle.vrm();
    document.getElementById('issueDescription').value = `${faker.vehicle.type()} having issues with ${faker.helpers.arrayElement(['engine', 'brakes', 'transmission', 'electrical system', 'suspension'])}. ${faker.lorem.sentence()}`;
    
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + faker.number.int({ min: 1, max: 14 }));
    document.getElementById('preferredDate').value = futureDate.toISOString().split('T')[0];
    document.getElementById('preferredTime').value = `${faker.number.int({ min: 8, max: 17 }).toString().padStart(2, '0')}:00`;

    showNotification('Test data generated!');
});

// Submit Booking Form
bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const booking = {
        id: `BK${Date.now()}`,
        customerName: document.getElementById('customerName').value,
        customerEmail: document.getElementById('customerEmail').value,
        customerPhone: document.getElementById('customerPhone').value,
        carMake: document.getElementById('carMake').value,
        carModel: document.getElementById('carModel').value,
        carYear: document.getElementById('carYear').value,
        licensePlate: document.getElementById('licensePlate').value,
        issueDescription: document.getElementById('issueDescription').value,
        preferredDate: document.getElementById('preferredDate').value,
        preferredTime: document.getElementById('preferredTime').value,
        status: 'pending',
        mechanic: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    database.bookings.push(booking);
    saveDatabase();

    addNotification(booking.id, `New booking created for ${booking.customerName}`);
    showNotification('Booking submitted successfully!');
    bookingForm.reset();
});

// Track Booking
trackBookingBtn.addEventListener('click', () => {
    const email = document.getElementById('trackingEmail').value.trim();
    if (!email) {
        showNotification('Please enter your email', 'error');
        return;
    }

    const userBookings = database.bookings.filter(b => b.customerEmail.toLowerCase() === email.toLowerCase());
    
    if (userBookings.length === 0) {
        showNotification('No bookings found for this email', 'error');
        document.getElementById('customerBookings').innerHTML = '<p style="text-align: center; color: #999;">No bookings found</p>';
        return;
    }

    renderCustomerBookings(userBookings);
    showNotification(`Found ${userBookings.length} booking(s)`);
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
                    <span class="detail-label">Vehicle:</span> ${booking.carYear} ${booking.carMake} ${booking.carModel}
                </div>
                <div class="detail-item">
                    <span class="detail-label">License:</span> ${booking.licensePlate}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Scheduled:</span> ${formatDate(booking.preferredDate)} at ${booking.preferredTime}
                </div>
                ${booking.mechanic ? `<div class="detail-item"><span class="detail-label">Mechanic:</span> ${getMechanicName(booking.mechanic)}</div>` : ''}
            </div>
            <div class="detail-item">
                <span class="detail-label">Issue:</span> ${booking.issueDescription}
            </div>
        </div>
    `).join('');
}

// Render Admin Dashboard
function renderAdminDashboard() {
    updateStats();
    renderAdminBookings();
}

// Update Statistics
function updateStats() {
    const total = database.bookings.length;
    const pending = database.bookings.filter(b => b.status === 'pending').length;
    const inProgress = database.bookings.filter(b => b.status === 'in-progress').length;
    const completed = database.bookings.filter(b => b.status === 'completed').length;

    document.getElementById('totalBookings').textContent = total;
    document.getElementById('pendingBookings').textContent = pending;
    document.getElementById('inProgressBookings').textContent = inProgress;
    document.getElementById('completedBookings').textContent = completed;
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
                    <span class="detail-label">Customer:</span> ${booking.customerName}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Contact:</span> ${booking.customerPhone}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email:</span> ${booking.customerEmail}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Vehicle:</span> ${booking.carYear} ${booking.carMake} ${booking.carModel}
                </div>
                <div class="detail-item">
                    <span class="detail-label">License:</span> ${booking.licensePlate}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Scheduled:</span> ${formatDate(booking.preferredDate)} at ${booking.preferredTime}
                </div>
            </div>
            <div class="detail-item">
                <span class="detail-label">Issue:</span> ${booking.issueDescription}
            </div>
            <div class="admin-actions">
                <select class="mechanic-select" id="mechanic-${booking.id}">
                    <option value="">Assign Mechanic</option>
                    ${database.mechanics.map(m => `
                        <option value="${m.id}" ${booking.mechanic === m.id ? 'selected' : ''}>
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
function assignMechanic(bookingId, mechanicId) {
    const booking = database.bookings.find(b => b.id === bookingId);
    if (booking) {
        booking.mechanic = mechanicId;
        booking.updatedAt = new Date().toISOString();
        saveDatabase();
        addNotification(bookingId, `Mechanic ${getMechanicName(mechanicId)} assigned`);
        showNotification('Mechanic assigned successfully!');
        renderAdminDashboard();
    }
}

// Update Booking Status
function updateStatus(bookingId, newStatus) {
    const booking = database.bookings.find(b => b.id === bookingId);
    if (booking) {
        booking.status = newStatus;
        booking.updatedAt = new Date().toISOString();
        saveDatabase();
        addNotification(bookingId, `Status updated to ${newStatus}`);
        showNotification(`Booking status updated to ${newStatus}!`);
        renderAdminDashboard();
    }
}

// Delete Booking
function deleteBooking(bookingId) {
    if (confirm('Are you sure you want to delete this booking?')) {
        database.bookings = database.bookings.filter(b => b.id !== bookingId);
        database.notifications = database.notifications.filter(n => n.bookingId !== bookingId);
        saveDatabase();
        showNotification('Booking deleted successfully!');
        renderAdminDashboard();
    }
}

// Add Notification
function addNotification(bookingId, message) {
    const notif = {
        id: Date.now(),
        bookingId,
        message,
        timestamp: new Date().toISOString(),
        read: false
    };
    database.notifications.push(notif);
    saveDatabase();
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
statusFilter.addEventListener('change', renderAdminBookings);

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

function getMechanicName(mechanicId) {
    const mechanic = database.mechanics.find(m => m.id === mechanicId);
    return mechanic ? mechanic.name : 'Unassigned';
}

// Set minimum date to today
document.getElementById('preferredDate').min = new Date().toISOString().split('T')[0];

// Initial render
renderAdminDashboard();