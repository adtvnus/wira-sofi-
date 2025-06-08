# 🚀 Wedding Invitation App - Installation Guide

## 📋 Prerequisites

### **1. Install MySQL**
```bash
# Windows
Download from: https://dev.mysql.com/downloads/mysql/

# macOS
brew install mysql
brew services start mysql

# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

### **2. Install Node.js**
```bash
# Download from: https://nodejs.org/
# Recommended: Node.js 18+ and npm 9+

# Verify installation
node --version
npm --version
```

## 🎯 **OPTION 1: One-Click Setup (Recommended)**

### **Super Quick Start:**
```bash
# Clone or download the project
# Navigate to project directory
cd wedding-invitation-app

# Run one-click setup
node quick-start.js
```

This will:
- ✅ Check MySQL installation
- ✅ Install all dependencies
- ✅ Setup database and tables
- ✅ Create environment files
- ✅ Start both frontend and backend
- ✅ Open browser automatically

## 🔧 **OPTION 2: Manual Setup**

### **Step 1: Install Dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### **Step 2: Database Setup**
```bash
# Run automated database setup
npm run setup-db

# Follow the prompts to enter MySQL credentials
```

### **Step 3: Start Application**
```bash
# Option A: Start both servers together
npm run start-full

# Option B: Start manually in separate terminals
# Terminal 1:
npm run start-backend

# Terminal 2:
npm run dev
```

## 🌐 **Access URLs**

After setup, access these URLs:

- **Frontend**: http://localhost:5173
- **Admin Dashboard**: http://localhost:5173/admin
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🔑 **Default Credentials**

```
Username: admin
Password: admin123
Email: admin@wedding.com
```

## 🎛️ **Available Commands**

```bash
# Setup and Installation
npm run setup-db          # Setup database
npm run install-all       # Install all dependencies

# Development
npm run dev               # Start frontend only
npm run start-backend     # Start backend only
npm run start-full        # Start both frontend and backend

# Build and Production
npm run build             # Build for production
npm run preview           # Preview production build
```

## 🗄️ **Database Information**

- **Database Name**: `wedding_invitation`
- **Tables Created**: 9 tables (users, wedding_settings, etc.)
- **Default Admin**: Created automatically
- **Storage Mode**: Hybrid (Local Storage + MySQL)

## 🔄 **Storage Modes**

### **Local Storage Mode (Default)**
- Works offline
- Data saved in browser
- No authentication required
- Perfect for testing

### **MySQL Database Mode**
- Requires login
- Data saved to database
- Multi-device access
- Production ready

### **Hybrid Mode**
- Best of both worlds
- Auto-sync when online
- Offline capability
- Data redundancy

## 🎨 **Features Available**

- ✅ **Wedding Settings**: Bride/Groom info, events, quotes
- ✅ **Image Management**: Gallery, photos with upload
- ✅ **Guest Management**: RSVP system
- ✅ **Page Customization**: All pages configurable
- ✅ **Data Backup**: Export/import functionality
- ✅ **Responsive Design**: Mobile and desktop
- ✅ **Offline Support**: Works without internet
- ✅ **Security**: Authentication and validation

## 🚨 **Troubleshooting**

### **MySQL Connection Issues**
```bash
# Check MySQL service
# Windows: services.msc -> MySQL
# macOS: brew services list | grep mysql
# Ubuntu: sudo systemctl status mysql

# Test connection
mysql -u root -p -e "SELECT 1"
```

### **Port Already in Use**
```bash
# Check what's using port 3001
netstat -ano | findstr :3001  # Windows
lsof -i :3001                 # macOS/Linux

# Kill process if needed
# Windows: taskkill /PID <PID> /F
# macOS/Linux: kill -9 <PID>
```

### **Permission Issues**
```bash
# MySQL permission error
mysql -u root -p
GRANT ALL PRIVILEGES ON wedding_invitation.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### **Dependencies Issues**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

## 🔧 **Manual Database Setup**

If automated setup fails:

```sql
-- 1. Create database
CREATE DATABASE wedding_invitation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Use database
USE wedding_invitation;

-- 3. Run migration file
SOURCE backend/migrations/001_create_tables.sql;

-- 4. Verify tables
SHOW TABLES;
```

## 📱 **Mobile Development**

To test on mobile devices:

```bash
# Find your IP address
# Windows: ipconfig
# macOS/Linux: ifconfig

# Update .env file
VITE_API_URL=http://YOUR_IP:3001/api

# Access from mobile
http://YOUR_IP:5173
```

## 🚀 **Production Deployment**

### **Backend Deployment**
```bash
# Set production environment
NODE_ENV=production
DB_HOST=your_production_host

# Use PM2 for process management
npm install -g pm2
pm2 start backend/server.js --name wedding-api
```

### **Frontend Deployment**
```bash
# Build for production
npm run build

# Deploy dist/ folder to hosting service
# (Vercel, Netlify, etc.)
```

## 📞 **Support**

If you encounter issues:

1. Check this troubleshooting guide
2. Verify MySQL is running
3. Check console for error messages
4. Ensure all dependencies are installed
5. Try manual setup steps

## 🎉 **Success Indicators**

Setup is successful when you see:

- ✅ Database `wedding_invitation` created
- ✅ 9 tables created in database
- ✅ Backend running on port 3001
- ✅ Frontend running on port 5173
- ✅ Health check returns "OK"
- ✅ Admin dashboard accessible
- ✅ Database toggle works in dashboard

---

**Enjoy building beautiful wedding invitations!** 💒✨
