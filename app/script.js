// ================= CONFIG =================
const API_URL = 'api.php';

// ================= GLOBAL STATE =================
let database = {
    bookings: [],
    mechanics: []
};

// ================= SAFE FETCH =================
async function safeFetch(url, options = {}) {
    const response = await fetch(url, options);
    const text = await response.text();

    try {
        return JSON.parse(text);
    } catch (err) {
        console.error("Invalid JSON from server:");
        console.error(text);
        throw new Error("Server returned invalid JSON");
    }
}

// ================= LOAD DATABASE =================
async function loadDatabase() {
    try {
        database.bookings = await safeFetch(`${API_URL}?action=get_bookings`);
        database.mechanics = await safeFetch(`${API_URL}?action=get_mechanics`);
        return true;
    } catch (error) {
        console.error(error);
        showNotification('Server error. Check console.', 'error');
        return false;
    }
}

// ================= INITIALIZE =================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    await loadDatabase();
    setupEventListeners();
}

// ================= EVENT LISTENERS =================
function setupEventListeners() {

    const customerViewBtn = document.getElementById('customerViewBtn');
    const adminViewBtn = document.getElementById('adminViewBtn');
    const customerView = document.getElementById('customerView');
    const adminView = document.getElementById('adminView');
    const bookingForm = document.getElementById('bookingForm');
    const trackBookingBtn = document.getElementById('trackBookingBtn');
    const statusFilter = document.getElementById('statusFilter');

    // View switching
    customerViewBtn?.addEventListener('click', () => {
        customerView.classList.add('active');
        adminView.classList.remove('active');
    });

    adminViewBtn?.addEventListener('click', async () => {
        adminView.classList.add('active');
        customerView.classList.remove('active');

        const isLoaded = await loadDatabase();
        if (isLoaded){
            renderAdminDashboard();

            updateAdminStats();
        }
    });

// ================= UPDATE ADMIN STATS =================
function updateAdminStats(){
    const bookings = database.bookings;
    document.getElementById('totalBookings').textContent = bookings.length;
    document.getElementById('pendingBookings').textContent = bookings.filter(b => b.status === 'pending').length;
    document.getElementById('inProgressBookings').textContent = bookings.filter(b => b.status === 'in-progress').length;
    document.getElementById('completedBookings').textContent = bookings.filter(b => b.status === 'completed').length;
}

    // Submit booking
    bookingForm?.addEventListener('submit', handleBookingSubmit);

    // Track booking
    trackBookingBtn?.addEventListener('click', handleTrackBooking);

    // Filter
    statusFilter?.addEventListener('change', renderAdminDashboard);
}

// ================= HANDLE BOOKING =================
async function handleBookingSubmit(e) {
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
        const result = await safeFetch(`${API_URL}?action=create_booking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        if (result.success) {
            showNotification('Booking submitted successfully!');
            document.getElementById('bookingForm').reset();
            await loadDatabase();
        } else {
            showNotification(result.error || 'Booking failed', 'error');
        }

    } catch (error) {
        console.error(error);
        showNotification('Server error', 'error');
    }
}

// ================= HANDLE TRACKING =================
async function handleTrackBooking() {
    const email = document.getElementById('trackingEmail').value.trim();

    if (!email) {
        showNotification('Enter your email', 'error');
        return;
    }

    try {
        const bookings = await safeFetch(
            `${API_URL}?action=track_bookings&email=${encodeURIComponent(email)}`
        );

        if (!bookings.length) {
            showNotification('No bookings found', 'error');
            return;
        }

        renderCustomerBookings(bookings);
        showNotification(`Found ${bookings.length} booking(s)`);

    } catch (error) {
        console.error(error);
        showNotification('Server error', 'error');
    }
}

// ================= ADMIN DASHBOARD =================
function renderAdminDashboard() {
    const container = document.getElementById('adminBookings');
    const statusFilter = document.getElementById('statusFilter')?.value;

    if (!container) return;

    let bookings = database.bookings;

    if (statusFilter && statusFilter !== 'all') {
        bookings = bookings.filter(b => b.status === statusFilter);
    }

    container.innerHTML = '';

    if (!bookings.length) {
        container.innerHTML = '<p>No bookings available</p>';
        return;
    }

    bookings.forEach(booking => {
        const card = document.createElement('div');
        card.className = 'booking-card';

        card.innerHTML = `
            <h4>${booking.customer_name}</h4>
            <p><strong>Car:</strong> ${booking.car_make} ${booking.car_model}</p>
            <p><strong>Date:</strong> ${formatDate(booking.preferred_date)} ${formatTime(booking.preferred_time)}</p>
            <p><strong>Status:</strong> ${booking.status}</p>
            <p><strong>Mechanic:</strong> ${getMechanicName(booking.mechanic_id)}</p>
        `;


        container.appendChild(card);
    });

    // Update mechanic and mechanic assignment dropdowns
    
    bookings.forEach(booking => {
        const card = document.createElement('div');
        card.className = 'booking-card';
        card.innerHTML = `
            <h4>${booking.customer_name}</h4>
            <select onchange="updateBooking(${booking.id}, 'status', this.value)">
                <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="in-progress" ${booking.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                <option value="completed" ${booking.status === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
            <select onchange="updateBooking(${booking.id}, 'mechanic_id', this.value)">
                <option value="">Assign Mechanic</option>
                ${database.mechanics.map(m => `
                    <option value="${m.id}" ${booking.mechanic_id == m.id ? 'selected' : ''}>${m.name}</option>
                `).join('')}
            </select>
            <button onclick="downloadReceipt('${booking.booking_ref}')">Download Receipt</button>
        `;
        container.appendChild(card);
    });


async function updateBooking(id, field, value) {
    const payload = { id: id, [field]: value };
    await safeFetch(`${API_URL}?action=update_booking`, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    loadDatabase().then(renderAdminDashboard);
}
}

// ================= CUSTOMER BOOKINGS =================
function renderCustomerBookings(bookings) {
    const container = document.getElementById('customerBookings');
    if (!container) return;

    container.innerHTML = '';

    bookings.forEach(booking => {
        const card = document.createElement('div');
        card.className = 'booking-card';

        card.innerHTML = `
            <h4>${booking.car_make} ${booking.car_model}</h4>
            <p><strong>Date:</strong> ${formatDate(booking.preferred_date)}</p>
            <p><strong>Status:</strong> ${booking.status}</p>
        `;

        container.appendChild(card);
    });
}

// ================= UTILITIES =================
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function formatTime(timeString) {
    if (!timeString) return '';
    return timeString.slice(0, 5);
}

function getMechanicName(id) {
    const mechanic = database.mechanics.find(m => m.id == id);
    return mechanic ? mechanic.name : 'Unassigned';
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}