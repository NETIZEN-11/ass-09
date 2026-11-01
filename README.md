# VisitorPass - Smart Visitor Management System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**Tagline:** Smart Visitor Management. Secure Access. Simple Experience.

A complete, production-quality MERN stack application for managing visitor passes, appointments, and security check-ins in offices, colleges, companies, and institutions.

---

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [Seed Data](#-seed-data)
- [Demo Credentials](#-demo-credentials)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [User Roles](#-user-roles)
- [Key Workflows](#-key-workflows)
- [Deployment](#-deployment)
- [License](#-license)

---

## ✨ Features

### Core Features
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Visitor Registration**: Digital visitor registration with photo upload
- **Appointment Management**: Create, approve, reject, and track appointments
- **Digital Pass Generation**: QR code-based visitor passes with PDF download
- **QR Code Check-In/Out**: Camera-based QR scanning for entry/exit verification
- **Real-time Dashboard**: Analytics, statistics, and activity tracking
- **Notification System**: Email notifications for approvals, rejections, and arrivals
- **Multi-organization Support**: Isolated data per organization
- **Visitor Blacklist**: Prevent blacklisted visitors from accessing

### Advanced Features
- **Pass Validation**: Automatic expiration and validity checks
- **Active Visitor Tracking**: Real-time monitoring of checked-in visitors
- **Expected Visitors**: Daily list of approved appointments
- **Visitor History**: Complete check-in/check-out logs
- **Staff Management**: Admin panel for managing users and roles
- **Search & Filters**: Advanced search and filtering capabilities
- **Responsive Design**: Mobile-friendly interface
- **Security**: Password hashing, input validation, rate limiting

---

## 🛠 Technology Stack

### Frontend
- **React.js** (v18.3.1) - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form validation
- **Lucide React** - Icon library
- **Recharts** - Data visualization
- **html5-qrcode** - QR code scanning
- **date-fns** - Date manipulation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcrypt.js** - Password hashing
- **Multer** - File uploads
- **Nodemailer** - Email service
- **QRCode** - QR code generation
- **PDFKit** - PDF generation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### Architecture
- RESTful API design
- MVC (Model-View-Controller) pattern
- Role-based authorization
- Centralized error handling
- Environment-based configuration

---

## 🏗 Architecture

```
┌─────────────────┐
│   React Client  │
│  (Port: 5173)   │
└────────┬────────┘
         │ HTTP/HTTPS
         ▼
┌─────────────────┐
│  Express API    │
│  (Port: 5000)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    MongoDB      │
│  (Port: 27017)  │
└─────────────────┘
```

---

## 📦 Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (v6 or higher)
- **npm** or **yarn**

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd visitor-pass-management
```

### Step 2: Install Dependencies

```bash
# Install root dependencies
npm run install-all

# Or install manually
npm install
cd server && npm install
cd ../client && npm install
```

---

## 🔑 Environment Variables

### Server (.env in server/)

Create a `.env` file in the `server` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/visitor-pass-db

# JWT Configuration
JWT_SECRET=visitor_pass_super_secret_key_2026_change_in_production
JWT_EXPIRE=7d

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@visitorpass.com

# Optional: Twilio SMS
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Application URLs
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Organization Configuration
DEFAULT_ORG_NAME=Demo Organization
DEFAULT_ORG_ID=demo-org-001
```

### Client (.env in client/)

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 💾 Database Setup

### Install MongoDB

**Windows:**
Download from [MongoDB Official Site](https://www.mongodb.com/try/download/community)

**Mac:**
```bash
brew install mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
```

### Start MongoDB
```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
```

---

## 🚀 Running the Application

### Development Mode

**Option 1: Run Both (Recommended)**
```bash
npm run dev
```

**Option 2: Run Separately**
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

---

## 🌱 Seed Data

Populate the database with demo data:

```bash
npm run seed
```

This creates:
- 1 Admin account
- 2 Security staff accounts
- 3 Employee accounts
- 10 Sample visitors
- 7 Sample appointments
- Generated passes and check logs

---

## 🔐 Demo Credentials

### Admin Access
```
Email: admin@visitorpass.com
Password: admin123
```

### Security Staff
```
Email: security1@visitorpass.com
Password: security123
```

### Employee
```
Email: john.smith@visitorpass.com
Password: employee123
```

---

## 📚 API Documentation

### Authentication

#### POST /api/auth/register
Create new user account

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "employee",
  "department": "Engineering"
}
```

#### POST /api/auth/login
Login to account

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "...", "role": "..." },
    "token": "jwt_token_here"
  }
}
```

#### GET /api/auth/me
Get current user (requires auth)

### Visitors

#### POST /api/visitors
Register visitor (multipart/form-data)

#### GET /api/visitors
Get all visitors (Admin/Security only)

#### GET /api/visitors/:id
Get single visitor

### Appointments

#### POST /api/appointments
Create appointment

#### GET /api/appointments
Get appointments (filtered by role)

#### PATCH /api/appointments/:id/approve
Approve appointment (Host/Admin only)

#### PATCH /api/appointments/:id/reject
Reject appointment (Host/Admin only)

### Passes

#### POST /api/passes/generate/:appointmentId
Generate pass for approved appointment

#### GET /api/passes/:id
Get pass details

#### GET /api/passes/:id/pdf
Download pass PDF

### Security

#### POST /api/security/verify
Verify pass by QR or Pass ID

#### POST /api/security/check-in
Check-in visitor

#### POST /api/security/check-out
Check-out visitor

#### GET /api/security/active-visitors
Get currently checked-in visitors

#### GET /api/security/expected-visitors
Get today's expected visitors

### Dashboard

#### GET /api/dashboard/stats
Get dashboard statistics

#### GET /api/dashboard/analytics
Get analytics data (charts, trends)

---

## 📁 Project Structure

```
visitor-pass-management/
│
├── client/                    # Frontend React application
│   ├── public/
│   └── src/
│       ├── assets/           # Static assets
│       ├── components/       # Reusable components
│       ├── layouts/          # Layout components
│       ├── pages/            # Page components
│       ├── routes/           # Route configurations
│       ├── context/          # React context
│       ├── hooks/            # Custom hooks
│       ├── services/         # API services
│       ├── utils/            # Utility functions
│       ├── App.jsx           # Main app component
│       └── main.jsx          # Entry point
│
├── server/                    # Backend Node.js application
│   ├── config/               # Configuration files
│   ├── controllers/          # Request handlers
│   ├── middleware/           # Custom middleware
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   ├── utils/                # Helper functions
│   ├── uploads/              # File uploads
│   ├── public/               # Static files
│   ├── seeds/                # Database seeders
│   └── server.js             # Entry point
│
├── .gitignore
├── package.json
└── README.md
```

---

## 👥 User Roles

### Admin
- Full system access
- Manage staff and visitors
- View all appointments and passes
- Access analytics and reports
- Manage organization settings

### Security / Frontdesk
- Register walk-in visitors
- Scan QR codes
- Check-in/check-out visitors
- View expected visitors
- View entry history

### Employee / Host
- Invite visitors
- Create appointments
- Approve/reject requests
- View own appointments
- Track invited visitors

### Visitor
- Submit registration
- Request appointments
- View appointment status
- Access digital pass
- Download PDF pass

---

## 🔄 Key Workflows

### Workflow 1: Visitor Invitation
1. Employee creates appointment
2. Visitor receives notification
3. Host approves appointment
4. Pass is auto-generated
5. Visitor receives pass

### Workflow 2: Check-In Process
1. Security scans QR code / enters Pass ID
2. System verifies pass validity
3. Security confirms check-in
4. Host receives arrival notification
5. Visitor logged as "inside"

### Workflow 3: Check-Out Process
1. Security scans QR / enters Pass ID
2. System retrieves active check-in
3. Security confirms check-out
4. Appointment marked "completed"
5. Visit duration recorded

---

## 🚢 Deployment

### Production Build

**Frontend:**
```bash
cd client
npm run build
# Output in client/dist/
```

**Backend:**
```bash
cd server
npm start
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Use production MongoDB URI
3. Configure production domain URLs
4. Set strong JWT secret
5. Enable HTTPS
6. Configure email service
7. Set up file storage (AWS S3 recommended)

### Deployment Platforms
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Backend**: Heroku, Railway, AWS EC2, DigitalOcean
- **Database**: MongoDB Atlas (recommended)

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🤝 Contributing

This is a college assignment project, but suggestions and improvements are welcome!

---

## 📧 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ using MERN Stack**

© 2026 VisitorPass. All Rights Reserved.
