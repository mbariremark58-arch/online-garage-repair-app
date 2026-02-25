# AutoFix - Car Repair Shop Management System

AutoFix is a web-based prototype application designed to help a car repair shop manage its operations. It provides a seamless interface for customers to book and track repair services, alongside an admin dashboard to manage those bookings and assign mechanics.

## 🚀 Features

### Customer Portal
* **Online Booking:** Customers can submit their vehicle details, issue descriptions, and preferred appointment times.
* **Real-time Tracking:** Customers can track the status of their repair by entering their email address.

### Admin Dashboard
* **Statistics Overview:** View total, pending, in-progress, and completed bookings at a glance.
* **Booking Management:** Filter and view customer bookings.
* **Mechanic Assignment:** Track which mechanics are assigned to specific repairs.

## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3, Vanilla JavaScript.
* **Backend:** PHP.
* **Database:** MySQL.

## 📂 File Structure
* `landing.html`, `landing.css`, `landingscript.js` - The promotional frontend landing page.
* `main.php` - The core application interface housing both the Customer and Admin views.
* `style.css` - Styling for the main application portal.
* `script.js` - Frontend logic for handling UI toggles, API fetching, and DOM rendering.
* `api.php` - The RESTful PHP API handling CRUD operations for bookings and mechanics.
* `config.php` - Database connection configuration.
* `setup.php` - One-click database installation and seeding script.

## ⚙️ Installation & Setup

1. **Environment:** Ensure you have a local server environment installed (such as XAMPP, WAMP, or LAMP) running PHP and MySQL.
2. **Clone/Move Files:** Place the project folder into your server's root directory (e.g., `htdocs` for XAMPP).
3. **Database Configuration:** The app connects using the default `root` user with no password. If your MySQL credentials differ, update the constants in `config.php`:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_USER', 'your_username');
   define('DB_PASS', 'your_password');
   define('DB_NAME', 'car_repair_shop');
