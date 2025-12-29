# SBTC Personnel Management System - QUICK START GUIDE
## Already Organized Folders Ready to Use!

### 🎉 Good News!
**All your files are now organized into proper folder structures!**

When you download this repository, you'll get:
- ✅ **backend/** folder with all PHP controllers, middleware, and Laravel files
- ✅ **frontend/** folder with all HTML, CSS, and JavaScript files
- ✅ **docs/** folder with all documentation

**No need to organize files manually anymore! Just download and use directly.**

---

## 📥 How to Download

### Option 1: Download ZIP (Recommended for Quick Start)
1. Click the green "Code" button at the top of the repository
2. Select "Download ZIP"
3. Extract the ZIP file to your desired location
4. You'll get a folder with this structure:
```
Management-Personnel/
├── backend/              (All PHP files here)
├── frontend/             (All HTML, JS, CSS here)
├── docs/                 (All documentation here)
└── [other files]
```

### Option 2: Clone Repository
```bash
git clone https://github.com/pelautulung/Management-Personnel.git
cd Management-Personnel
```

---

## 🚀 Quick Setup After Download

### For Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run database migrations
php artisan migrate

# Start the server
php artisan serve
```

**Backend will run on:** http://localhost:8000

### For Frontend Setup

```bash
cd frontend

# Option 1: Using Python (if installed)
python -m http.server 8080

# Option 2: Using Node.js (if installed)
npm install -g http-server
http-server -p 8080

# Option 3: Using PHP
php -S localhost:8080
```

**Frontend will run on:** http://localhost:8080

---

## 📁 Folder Structure Overview

### Backend Folder
```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/          (All API controllers)
│   │   │   ├── AuthController.php
│   │   │   ├── PersonnelController.php
│   │   │   ├── DashboardController.php
│   │   │   └── [other controllers]
│   │   └── Middleware/               (All middleware)
│   ├── Models/                       (Database models)
│   └── Exceptions/
├── database/
│   ├── migrations/                   (Database migrations)
│   └── seeders/                      (Database seeders)
├── config/                           (Configuration files)
├── routes/
│   ├── api.php                       (API routes)
│   └── web.php                       (Web routes)
├── storage/                          (Logs and files)
└── .env                              (Environment config)
```

### Frontend Folder
```
frontend/
├── index.html                        (Main dashboard)
├── login.html                        (Login page)
├── contractor-management.html        (Personnel management)
├── sertifikat-sbtc.html             (Certificates)
├── profile.html                      (User profile)
├── [other HTML pages]
├── js/                               (JavaScript modules)
│   ├── api-service.js               (API integration)
│   ├── auth.js                      (Authentication)
│   ├── dashboard.js
│   ├── personnel.js
│   └── [other modules]
├── css/                              (Stylesheets)
│   └── styles.css
└── assets/                           (Images, fonts, icons)
```

### Docs Folder
```
docs/
├── API-ENDPOINTS.md                  (API documentation)
├── CRUD-VERIFICATION.md              (CRUD operations)
├── STATUS-REPORT.md                  (Project status)
├── DEPLOYMENT-CHECKLIST.md           (Deployment guide)
└── [other documentation]
```

---

## 🔧 Configuration

### Update API URL in Frontend
Edit `frontend/js/api-service.js`:

```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

Change `localhost:8000` if your backend runs on a different port or server.

### Database Configuration
Edit `backend/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=personnel_db
DB_USERNAME=root
DB_PASSWORD=
```

Update these values based on your local database setup.

---

## 📱 Access the Application

Once both backend and frontend are running:

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8000/api
- **API Documentation**: http://localhost:8080/api-docs.html
- **Database Admin** (if using phpMyAdmin): http://localhost/phpmyadmin

---

## 🔑 Login Credentials

After seeding the database, default credentials:
- **Email**: admin@example.com
- **Password**: password

(Change these in production!)

---

## 📚 Available Documentation

All documentation is in the `docs/` folder:

| File | Purpose |
|------|----------|
| API-ENDPOINTS.md | Complete API endpoint documentation |
| CRUD-VERIFICATION.md | CRUD operations verification |
| STATUS-REPORT.md | Project status and features |
| DEPLOYMENT-CHECKLIST.md | Pre-deployment verification |
| SBTC-PERSONNEL-FOLDER-STRUCTURE.md | Detailed folder structure |

---

## 🐛 Troubleshooting

### Backend Issues

**"Composer not found"**
- Install Composer: https://getcomposer.org/download/

**"PHP version mismatch"**
- Require PHP 8.1 or higher

**"Database connection error"**
- Check `.env` database credentials
- Ensure MySQL/PostgreSQL is running

### Frontend Issues

**"API calls failing"**
- Check `api-service.js` has correct API URL
- Ensure backend is running on correct port

**"Files not loading"**
- Check file paths in HTML (relative vs absolute)
- Verify all JS and CSS files are in correct folders

---

## ✨ Project Features

✅ User Authentication (Login/Register)
✅ Personnel Management (CRUD operations)
✅ Certificate Management
✅ Document Upload/Download
✅ Dashboard with Statistics
✅ Role-Based Access Control
✅ Company Management
✅ Real-time Notifications
✅ Responsive Design
✅ API Documentation

---

## 🎯 Next Steps

1. Download the repository
2. Extract to your working directory
3. Follow backend setup (if using Laravel backend)
4. Follow frontend setup
5. Update API URL configuration
6. Access http://localhost:8080 in your browser
7. Login with provided credentials
8. Explore the application!

---

## 📞 Support

For detailed information, refer to:
- Documentation files in `docs/` folder
- API endpoints in `API-ENDPOINTS.md`
- Deployment guide in `DEPLOYMENT-CHECKLIST.md`

---

**Happy coding! 🚀**

*Last Updated: December 29, 2025*
*Version: 1.0.0*
