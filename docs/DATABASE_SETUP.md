# 🗄️ MySQL Database Integration Setup

## 📋 Overview
Wedding Invitation App sekarang mendukung **HYBRID STORAGE** dengan MySQL database integration. Data dapat disimpan di localStorage (offline-first) atau MySQL database (persistent storage).

## 🚀 **QUICK SETUP**

### **1. Prerequisites**
```bash
# Install MySQL Server
# Windows: Download from https://dev.mysql.com/downloads/mysql/
# macOS: brew install mysql
# Ubuntu: sudo apt install mysql-server

# Install Node.js dependencies
npm install
```

### **2. Database Setup**
```bash
# 1. Start MySQL service
# Windows: Start MySQL service from Services
# macOS: brew services start mysql
# Ubuntu: sudo systemctl start mysql

# 2. Create database and user (optional)
mysql -u root -p
CREATE DATABASE wedding_invitation;
CREATE USER 'wedding_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON wedding_invitation.* TO 'wedding_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### **3. Backend Configuration**
```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Edit .env file with your database credentials
DB_HOST=localhost
DB_PORT=3306
DB_USER=root  # or wedding_user
DB_PASSWORD=your_password
DB_NAME=wedding_invitation
JWT_SECRET=your_super_secret_jwt_key_here
```

### **4. Run Database Migration**
```bash
# Run migration to create tables
npm run migrate

# This will create:
# - users table
# - wedding_settings table
# - wedding_events table
# - wedding_quotes table
# - wedding_images table
# - wedding_guests table
# - wedding_page_settings table
# - wedding_stories table
# - activity_logs table
```

### **5. Start Backend Server**
```bash
# Development mode
npm run dev

# Production mode
npm start

# Server will run on http://localhost:3001
```

### **6. Frontend Configuration**
```bash
# 1. Navigate to frontend directory (root)
cd ..

# 2. Create environment file
cp .env.example .env

# 3. Configure API URL
VITE_API_URL=http://localhost:3001/api
```

### **7. Start Frontend**
```bash
# Start development server
npm run dev

# Frontend will run on http://localhost:5173
```

## 🔧 **FEATURES**

### **Hybrid Storage System**
- **Local Storage**: Default mode, works offline
- **MySQL Database**: Persistent storage with user authentication
- **Auto-sync**: Automatic synchronization when online
- **Fallback**: Graceful fallback to local storage if API fails

### **API Endpoints**
```
Authentication:
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/profile
POST /api/auth/logout

Wedding Data:
GET  /api/wedding/settings
POST /api/wedding/settings
DELETE /api/wedding/settings/:id

Images:
POST /api/images/upload
DELETE /api/images/:id

Guests:
GET  /api/guests/:weddingId
POST /api/guests
PUT  /api/guests/:id
DELETE /api/guests/:id

Analytics:
GET  /api/analytics/:weddingId
```

### **Database Schema**
```sql
-- Main tables
users                 # User authentication
wedding_settings      # Main wedding configuration
wedding_events        # Wedding events (akad, resepsi, etc.)
wedding_quotes        # Love quotes
wedding_images        # Gallery and other images
wedding_guests        # Guest list and RSVP
wedding_page_settings # Page-specific settings (JSON)
wedding_stories       # Love story timeline
activity_logs         # Audit trail
```

## 🎯 **USAGE**

### **1. Local Storage Mode (Default)**
- Data saved in browser localStorage
- Works completely offline
- No authentication required
- Data persists until browser cache is cleared

### **2. MySQL Database Mode**
- Requires user registration/login
- Data saved to MySQL database
- Accessible from any device
- Persistent and secure storage

### **3. Switching Between Modes**
1. Go to Admin Dashboard
2. Use the "Database Connection" toggle
3. Login with credentials for MySQL mode
4. Data automatically syncs between modes

### **4. User Registration**
```javascript
// Default admin user (created by migration)
Username: admin
Password: admin123
Email: admin@wedding.com

// Or register new user through API
POST /api/auth/register
{
  "username": "your_username",
  "email": "your_email@example.com", 
  "password": "your_password",
  "fullName": "Your Full Name"
}
```

## 🔒 **SECURITY FEATURES**

### **Authentication**
- JWT token-based authentication
- Password hashing with bcrypt
- Session management
- Token expiration (7 days default)

### **Data Protection**
- SQL injection prevention
- Input validation with Joi
- Rate limiting
- CORS protection
- Helmet security headers

### **File Upload Security**
- File type validation
- File size limits
- Image content validation
- Secure file storage

## 📊 **MONITORING**

### **Health Check**
```bash
# Check API health
curl http://localhost:3001/health

# Response:
{
  "status": "OK",
  "timestamp": "2024-12-XX",
  "database": "Connected",
  "environment": "development"
}
```

### **Database Statistics**
```bash
# Get database stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/api/analytics/1
```

## 🚨 **TROUBLESHOOTING**

### **Common Issues**

#### **1. Database Connection Failed**
```bash
# Check MySQL service
# Windows: services.msc -> MySQL
# macOS: brew services list | grep mysql
# Ubuntu: sudo systemctl status mysql

# Check credentials in .env file
# Verify database exists
mysql -u root -p -e "SHOW DATABASES;"
```

#### **2. Migration Failed**
```bash
# Check database permissions
mysql -u root -p -e "SHOW GRANTS FOR 'your_user'@'localhost';"

# Run migration manually
mysql -u root -p wedding_invitation < migrations/001_create_tables.sql
```

#### **3. API Connection Failed**
```bash
# Check backend server is running
curl http://localhost:3001/health

# Check frontend environment variables
cat .env | grep VITE_API_URL

# Check CORS settings in backend
```

#### **4. Authentication Issues**
```bash
# Clear browser localStorage
localStorage.clear()

# Check JWT token expiration
# Login again to get new token
```

## 🔄 **DATA MIGRATION**

### **From Local Storage to MySQL**
1. Enable API mode in dashboard
2. Login with credentials
3. Data automatically syncs to database
4. Verify data in MySQL:
```sql
SELECT * FROM wedding_settings;
SELECT * FROM wedding_events;
```

### **From MySQL to Local Storage**
1. Disable API mode in dashboard
2. Data remains in localStorage
3. Can re-enable API mode anytime

### **Backup & Restore**
```bash
# Export data (works in both modes)
# Use "Download Backup" in dashboard

# Import data
# Use "Import Backup" in dashboard

# MySQL backup
mysqldump -u root -p wedding_invitation > backup.sql

# MySQL restore
mysql -u root -p wedding_invitation < backup.sql
```

## 🎉 **PRODUCTION DEPLOYMENT**

### **Backend Deployment**
```bash
# Set production environment
NODE_ENV=production

# Use production database
DB_HOST=your_production_host
DB_USER=your_production_user
DB_PASSWORD=your_production_password

# Start with PM2
npm install -g pm2
pm2 start server.js --name wedding-api
```

### **Frontend Deployment**
```bash
# Build for production
npm run build

# Set production API URL
VITE_API_URL=https://your-api-domain.com/api

# Deploy to hosting service
# (Vercel, Netlify, etc.)
```

## ✅ **BENEFITS**

### **For Users**
- ✅ **Offline-first**: Works without internet
- ✅ **Cross-device**: Access from any device with MySQL
- ✅ **Data safety**: Multiple backup options
- ✅ **No vendor lock-in**: Can export data anytime

### **For Developers**
- ✅ **Scalable**: MySQL handles multiple users
- ✅ **Secure**: Enterprise-grade security
- ✅ **Maintainable**: Clean API architecture
- ✅ **Extensible**: Easy to add new features

### **For Businesses**
- ✅ **Cost-effective**: Use free MySQL
- ✅ **Reliable**: Proven database technology
- ✅ **Compliant**: Data sovereignty control
- ✅ **Professional**: Enterprise-ready solution

---

**Wedding Invitation App sekarang siap untuk production dengan MySQL database integration!** 🚀

Untuk pertanyaan atau bantuan, silakan buka issue di repository atau hubungi tim development.
