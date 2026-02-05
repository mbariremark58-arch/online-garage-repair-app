# AutoFix - Online Garage Repair App

**AutoFix** is a web-based application designed to streamline car repair shop operations. It allows customers to book services online and track their repair status, while providing shop administrators with a dashboard to manage bookings, assign mechanics, and update repair progress.

## 🚀 Features

### For Customers

* **Easy Online Booking:** Schedule appointments by providing vehicle details, issue description, and preferred date/time.
* **Real-Time Tracking:** Check the status of a vehicle repair (Pending, In-Progress, Completed) using an email address.
* **Service Overview:** View available services such as engine repair, brake service, and oil changes.

### For Administrators

* **Admin Dashboard:** View key statistics including total bookings, pending requests, and completed jobs.
* **Workflow Management:**
* **Assign Mechanics:** Allocate specific mechanics to bookings.
* **Update Status:** Move bookings through the workflow (Pending → In-Progress → Completed).


* **Filter & Search:** Filter bookings by status to organize workflow.

## 🛠️ Technologies Used

* **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
* **Backend:** PHP
* **Database:** MySQL

## 📂 Project Structure

```text
/app
├── api.php             # REST API for handling frontend requests
├── config.php          # Database connection configuration
├── setup.php           # Script to initialize the database and tables
├── landing.html        # Public landing page with services info
├── main.html           # Main app interface (Booking & Admin Dashboard)
├── style.css           # Styles for the main application
├── landing.css         # Styles for the landing page
├── script.js           # Frontend logic for the main app
└── landingscript.js    # Logic for the landing page interactions

```

## ⚙️ Installation & Setup

### Prerequisites

* A local server environment like **XAMPP**, **WAMP**, or **MAMP**.
* **PHP** and **MySQL** installed.

### Steps

1. **Clone or Download** the repository.
2. Move the project folder into your server's root directory (e.g., `C:\xampp\htdocs\autofix`).
3. **Start your server** (Apache and MySQL).
4. **Initialize the Database:**
* Open your browser and navigate to: `http://localhost/autofix/app/setup.php`
* This script will automatically create the `car_repair_shop` database and necessary tables (`bookings`, `mechanics`, `notifications`).


5. **Launch the App:**
* Go to: `http://localhost/autofix/app/landing.html`



## 📖 Usage Guide

### Customer View

1. Navigate to the **Home** page (`landing.html`) and click **"Book Now"**.
2. Fill out the booking form with your contact and vehicle information.
3. To track a booking, enter your email address in the "Track Your Booking" section to see the status of your repairs.

### Admin View

1. In the main application (`main.html`), click the **"Admin"** tab.
2. Use the dashboard to view all incoming requests.
3. Use the dropdown menu on a booking card to **Assign a Mechanic**.
4. Click **"Start Work"** or **"Complete"** to update the status of a repair job.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.