// ================= CONFIG =================
const API_URL = 'api.php';

// ================= GLOBAL STATE =================
let database = {
    bookings: [],
    mechanics: []
};

// ================= UTILITIES & SECURITY =================
// Prevent Cross-Site Scripting (XSS)
function escapeHTML(str) {
    if (!str) return '';
    return str.toString().replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag]));
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

// ================= SAFE FETCH =================
async function safeFetch(url, options = {}) {
    // Include credentials to support PHP Sessions
    options.credentials = 'include'; 
    const response = await fetch(url, options);
    
    // Handle 403 Unauthorized gracefully
    if (response.status === 403) {
        throw new Error("Unauthorized");
    }

    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (err) {
        console.error("Invalid JSON from server:", text);
        throw new Error("Server returned invalid JSON");
    }
}

// ================= LOAD DATABASE =================
async function loadDatabase(isAdmin = false) {
    try {
        // Mechanics are public (needed for the assignment dropdown, but could be restricted later)
        database.mechanics = await safeFetch(`${API_URL}?action=get_mechanics`);
        
        // Only attempt to load bookings if we are operating as an admin
        if (isAdmin) {
            database.bookings = await safeFetch(`${API_URL}?action=get_bookings`);
        }
        return true;
    } catch (error) {
        if (error.message !== "Unauthorized") {
            console.error(error);
            showNotification('Server error loading data.', 'error');
        }
        return false;
    }
}

// ================= INITIALIZE =================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    await loadDatabase(false); // Load public data first
    setupEventListeners();
}

// ================= EVENT LISTENERS =================
function setupEventListeners() {
    const customerViewBtn = document.getElementById('customerViewBtn');
    const adminViewBtn = document.getElementById('adminViewBtn');
    
    // THE FIX: Correctly target the login section ID
    const adminLoginSection = document.getElementById('adminLoginSection'); 
    
    const adminDashboardContent = document.getElementById('adminDashboardContent');
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

    adminViewBtn?.addEventListener('click', () => {
        adminView.classList.add('active');
        customerView.classList.remove('active');
        adminLoginSection.style.display = 'block';
        adminDashboardContent.style.display = 'none';
    });

    // Admin Login
    document.getElementById('adminLoginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const credentials = {
            username: document.getElementById('adminUser').value,
            password: document.getElementById('adminPass').value
        }

        try {
            const result = await safeFetch(`${API_URL}?action=admin_login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            
            if (result.success) {
                adminLoginSection.style.display = 'none';
                adminDashboardContent.style.display = 'block';

                const isLoaded = await loadDatabase(true); // Load admin data
                if (isLoaded) {
                    renderAdminDashboard(); 
                    updateAdminStats(); 
                }
            } else {
                showNotification(result.error || 'Login failed', 'error')
            }
        } catch(error) {
            showNotification('Server error during login', 'error')
        }
    });

    // Auto assign 
    document.getElementById('autoAssignBtn')?.addEventListener('click', async () => {
        const result = await safeFetch(`${API_URL}?action=auto_assign`);
        if (result.success) {
            showNotification('All pending orders auto-assigned!');
            await loadDatabase(true);
            renderAdminDashboard();
            updateAdminStats();
        }
    });

    // Logout
    document.getElementById('adminLogoutBtn')?.addEventListener('click', () => {
        adminDashboardContent.style.display = 'none';
        adminLoginSection.style.display = 'block';
        document.getElementById('adminLoginForm').reset();
        database.bookings = []; // Clear local cache for security
    });

    bookingForm?.addEventListener('submit', handleBookingSubmit);
    trackBookingBtn?.addEventListener('click', handleTrackBooking);
    statusFilter?.addEventListener('change', renderAdminDashboard);
}

// ================= UPDATE ADMIN STATS =================
function updateAdminStats() {
    const bookings = database.bookings;
    document.getElementById('totalBookings').textContent = bookings.length;
    document.getElementById('pendingBookings').textContent = bookings.filter(b => b.status === 'pending').length;
    document.getElementById('inProgressBookings').textContent = bookings.filter(b => b.status === 'in-progress').length;
    document.getElementById('completedBookings').textContent = bookings.filter(b => b.status === 'completed').length;
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
        } else {
            showNotification(result.error || 'Booking failed', 'error');
        }
    } catch (error) {
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
        showNotification('Server error', 'error');
    }
}

// ================= ADMIN DASHBOARD =================
function renderAdminDashboard() {
    const container = document.getElementById('adminBookings');
    const statusFilter = document.getElementById('statusFilter')?.value;
    let bookings = database.bookings;

    if (statusFilter && statusFilter !== 'all') {
        bookings = bookings.filter(b => b.status === statusFilter);
    }

    container.innerHTML = '';
    if (!bookings.length) {
        container.innerHTML = '<p>No bookings available</p>';
        return;
    }

    // Use escapeHTML() for security against malicious inputs
    bookings.forEach(booking => {
        const card = document.createElement('div');
        card.className = 'booking-card';
        card.innerHTML = `
            <div class="booking-header">
                <span class="booking-id">${escapeHTML(booking.booking_ref)}</span>
                <span class="status-badge status-${escapeHTML(booking.status)}">${escapeHTML(booking.status)}</span>
            </div>
            <p><strong>Customer:</strong> ${escapeHTML(booking.customer_name)}</p>
            <p><strong>Car:</strong> ${escapeHTML(booking.car_make)} ${escapeHTML(booking.car_model)}</p>
            
            <div class="admin-actions">
                <label>Assign Mechanic:</label>
                <select class="mechanic-select" onchange="window.updateAssignment(${booking.id}, this.value)">
                    <option value="">Unassigned</option>
                    ${database.mechanics.map(m => `
                        <option value="${m.id}" ${booking.mechanic_id == m.id ? 'selected' : ''}>
                            ${escapeHTML(m.name)}
                        </option>
                    `).join('')}
                </select>
                
                ${booking.status === 'in-progress' ? `
                    <button class="btn btn-success" style="padding: 6px 12px; margin-left: 10px;" onclick="window.markCompleted(${booking.id})">
                        Mark Completed
                    </button>
                ` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

// THE FIX: Move these functions to the global scope so inline HTML can access them
window.updateAssignment = async function(bookingId, mechanicId) {
    const data = { id: bookingId, mechanic_id: mechanicId, status: mechanicId ? 'in-progress' : 'pending' };
    const res = await safeFetch(`${API_URL}?action=update_booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    if (res.success) {
        showNotification('Assignment updated');
        await loadDatabase(true);
        renderAdminDashboard();
        updateAdminStats();
    }
};

window.manualAssign = async function(bookingId, mechanicId) {
    const result = await safeFetch(`${API_URL}?action=update_booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, mechanic_id: mechanicId, status: 'in-progress' })
    });
    
    if (result.success) {
        showNotification('Mechanic assigned manually');
        await loadDatabase(true);
        renderAdminDashboard();
    }
};

// Complete updating 

window.markCompleted = async function(bookingId) {
    if (!confirm("Are you sure you want to mark this repair as completed?")) return;

    const data = { id: bookingId, status: 'completed' };
    
    try {
        const res = await safeFetch(`${API_URL}?action=update_booking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (res.success) {
            showNotification('Order marked as completed');
            await loadDatabase(true);
            renderAdminDashboard();
            updateAdminStats();
        } else {
            showNotification(res.error || 'Failed to update order status', 'error');
        }
    } catch (error) {
        showNotification('Server error while updating status', 'error');
    }
};

// ================= CUSTOMER BOOKINGS =================
function renderCustomerBookings(bookings) {
    const container = document.getElementById('customerBookings');
    if (!container) return;

    container.innerHTML = '';

    bookings.forEach(booking => {
        const card = document.createElement('div');
        card.className = 'booking-card';

        card.innerHTML = `
            <h4>${escapeHTML(booking.car_make)} ${escapeHTML(booking.car_model)}</h4>
            <p><strong>Date:</strong> ${escapeHTML(formatDate(booking.preferred_date))}</p>
            <p><strong>Status:</strong> ${escapeHTML(booking.status)}</p>
        `;

        container.appendChild(card);
    });
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}