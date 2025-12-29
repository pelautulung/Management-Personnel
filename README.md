# Frontend Folder - File Placement Guide

## 📁 Structure

```
frontend/
├── js/              ← 8 JavaScript files here
├── css/             ← 1 CSS file here
├── assets/          ← Images, icons (optional)
└── *.html           ← All HTML files here
```

## 📋 Files to Place

### JavaScript (js/) - 8 files
1. api-service.js (Core API wrapper)
2. common.js (Utilities & toast notifications)
3. dashboard.js (Dashboard integration)
4. personnel.js (Personnel CRUD operations)
5. certificates.js (Certificate management)
6. submissions.js (Submission workflow)
7. documents.js (Document upload/download)
8. notifications.js (Real-time notifications)

### CSS (css/) - 1 file
1. styles.css (Complete styling)

### HTML Files (root frontend/) - 5+ files
1. index.html (Dashboard)
2. login.html (Login page - use login-integrated.html)
3. contractor-management.html (Personnel management)
4. sertifikat-sbtc.html (Certificate management)
5. profile.html (User profile)
6. notification-popup.html (optional)
7. Any other HTML files you have

### Assets (assets/) - Optional
- images/ (logos, icons)
- icons/ (favicon, etc)

**Total: 14+ files**

## ✅ Verification

After placing files, check:
- [ ] All 8 JS files in js/
- [ ] styles.css in css/
- [ ] All HTML files in frontend/
- [ ] Update API URL in js/api-service.js

Then test:
```bash
python -m http.server 8080
# Open: http://localhost:8080/login.html
```

## 🔧 Important

**Before starting, edit js/api-service.js line 4:**
```javascript
const API_CONFIG = {
    baseURL: 'http://localhost:8000/api',  // ← Change this
    timeout: 30000,
};
```
