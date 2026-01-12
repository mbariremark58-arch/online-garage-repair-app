# 🔧 AutoFix - Car Repair Shop Web Application

A comprehensive web application for managing car repair bookings with customer and admin interfaces.

## 📋 Features

### Customer Features
- **Online Booking Form**: Book repair appointments with car details and issue descriptions
- **Test Data Generation**: Use Faker.js to generate realistic test data
- **Booking Status Tracking**: Track repair status using email
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Admin Features
- **Dashboard**: View statistics (total, pending, in-progress, completed bookings)
- **Booking Management**: View all bookings with filtering options
- **Mechanic Assignment**: Assign mechanics to repair jobs
- **Status Updates**: Update job status (pending → in-progress → completed)
- **Notifications**: Track all booking activities

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Basic understanding of HTML, CSS, and JavaScript

### Installation

1. **Download all files** to a single folder:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `database.json` (for reference - the app uses localStorage)

2. **Open the application**:
   - Simply open `index.html` in your web browser
   - No server setup required!

### First Run

The application uses **localStorage** to persist data. On first run:
- The database will be empty
- Click "Generate Test Data" to populate the booking form
- Submit a few bookings to test the system

## 📚 Using Faker.js

Faker.js is included via CDN in the HTML file. It's used to generate realistic test data.

### How It Works

The application includes Faker.js from CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/@faker-js/faker@8.0.0/dist/faker.min.js"></script>
```

### Generate Test Data

1. Go to the **Customer View**
2. Click the **"Generate Test Data"** button
3. The form will auto-fill with realistic data:
   - Customer name (e.g., "John Doe")
   - Email (e.g., "john.doe@email.com")
   - Phone number
   - Car make and model
   - License plate
   - Issue description
   - Future appointment date

### Faker.js Methods Used

```javascript
faker.person.fullName()          // Generate full name
faker.internet.email()           // Generate email
faker.phone.number()             // Generate phone number
faker.vehicle.manufacturer()     // Car make (Toyota, Honda, etc.)
faker.vehicle.model()            // Car model (Camry, Civic, etc.)
faker.vehicle.vrm()              // License plate
faker.number.int({min, max})     // Random year
faker.lorem.sentence()           // Issue description
```

## 🎯 How to Use

### For Customers

1. **Book a Repair**:
   - Fill out the booking form with your details
   - Or click "Generate Test Data" for quick testing
   - Submit the form
   - Note your booking ID

2. **Track Your Booking**:
   - Enter your email in the tracking section
   - Click "Track" to see all your bookings
   - View status: Pending, In Progress, or Completed

### For Admins

1. **Switch to Admin View**:
   - Click the "Admin" button in the navigation

2. **View Dashboard**:
   - See statistics for all bookings
   - Filter bookings by status

3. **Manage Bookings**:
   - Assign mechanics to jobs
   - Update status (Start Work → Complete)
   - Delete bookings if needed

## 🗂️ Database Structure

### Bookings
```json
{
  "id": "BK1704900000001",
  "customerName": "John Doe",
  "customerEmail": "john@email.com",
  "customerPhone": "(555) 123-4567",
  "carMake": "Toyota",
  "carModel": "Camry",
  "carYear": "2020",
  "licensePlate": "ABC-1234",
  "issueDescription": "Engine issue...",
  "preferredDate": "2026-01-15",
  "preferredTime": "09:00",
  "status": "pending",
  "mechanic": null,
  "createdAt": "2026-01-10T08:30:00.000Z",
  "updatedAt": "2026-01-10T08:30:00.000Z"
}
```

### Mechanics
```json
{
  "id": 1,
  "name": "John Smith",
  "specialization": "Engine & Transmission",
  "experience": "10 years"
}
```

### Notifications
```json
{
  "id": 1704900000001,
  "bookingId": "BK1704900000001",
  "message": "New booking created",
  "timestamp": "2026-01-10T08:30:00.000Z",
  "read": false
}
```

## 🎨 Customization

### Adding More Mechanics

Edit the `mechanics` array in `script.js`:
```javascript
mechanics: [
    { id: 5, name: "New Mechanic" },
    // Add more...
]
```

### Changing Colors

Edit `styles.css` - primary color is set using gradient:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Modifying Status Options

The app supports three statuses:
- `pending` (yellow)
- `in-progress` (blue)
- `completed` (green)

## 📱 Responsive Design

The application is fully responsive:
- **Desktop**: Full layout with side-by-side forms
- **Tablet**: Adjusted grid layouts
- **Mobile**: Stacked single-column layout

## 🔧 Technical Details

- **No Backend Required**: Uses localStorage for data persistence
- **No Build Process**: Pure vanilla JavaScript
- **CDN Dependencies**: Only Faker.js via CDN
- **Modern JavaScript**: ES6+ features
- **CSS Grid & Flexbox**: For responsive layouts

## 🐛 Troubleshooting

### Data Not Persisting?
- Check if localStorage is enabled in your browser
- Clear cache and reload

### Faker.js Not Working?
- Ensure you have internet connection (CDN required)
- Check browser console for errors

### Bookings Not Showing?
- Make sure you're using the correct email for tracking
- Check that bookings were actually submitted

## 📄 License

This is a demonstration project for educational purposes.

## 🤝 Contributing

Feel free to modify and enhance this application for your needs!

---