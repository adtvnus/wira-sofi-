# 🔄 Nodemon Setup - Auto-Restart Backend Server

## 📋 **Overview**

Nodemon telah dikonfigurasi untuk otomatis restart backend server ketika ada perubahan file, sehingga tidak perlu save manual atau restart server secara manual.

## ⚙️ **Configuration**

### **nodemon.json**
```json
{
  "watch": [
    "backend/",
    "src/",
    ".env"
  ],
  "ext": "js,cjs,ts,tsx,json,sql",
  "ignore": [
    "node_modules/",
    "dist/",
    "build/",
    "*.log",
    "*.tmp",
    "uploads/",
    "public/",
    "docs/"
  ],
  "exec": "node backend/server.cjs",
  "env": {
    "NODE_ENV": "development"
  },
  "delay": 1000,
  "verbose": true,
  "colours": true,
  "restartable": "rs",
  "events": {
    "start": "echo '🚀 Backend server starting with nodemon...'",
    "restart": "echo '🔄 Backend server restarting due to file changes...'",
    "crash": "echo '💥 Backend server crashed! Waiting for changes...'",
    "exit": "echo '👋 Backend server stopped.'"
  }
}
```

### **Package.json Scripts**
```json
{
  "backend": "node backend/server.cjs",
  "backend:dev": "nodemon",
  "backend:watch": "nodemon backend/server.cjs",
  "start-full": "concurrently \"npm run backend:dev\" \"npm run dev\"",
  "start-full-watch": "concurrently \"npm run backend:dev\" \"npm run dev\""
}
```

## 🚀 **Usage Commands**

### **Start Backend with Nodemon**
```bash
npm run backend:dev
```

### **Start Full Application (Frontend + Backend with Nodemon)**
```bash
npm run start-full
```

### **Alternative Backend Watch Command**
```bash
npm run backend:watch
```

## 📁 **Watched Directories**

Nodemon akan memantau perubahan di:

- **`backend/`** - Semua file backend server
- **`src/`** - File frontend (untuk sinkronisasi)
- **`.env`** - Environment variables

## 📄 **Watched File Extensions**

- **`.js`** - JavaScript files
- **`.cjs`** - CommonJS files
- **`.ts`** - TypeScript files
- **`.tsx`** - TypeScript React files
- **`.json`** - JSON configuration files
- **`.sql`** - SQL database files

## 🚫 **Ignored Directories**

Nodemon akan mengabaikan:

- **`node_modules/`** - Dependencies
- **`dist/`** - Build output
- **`build/`** - Build output
- **`uploads/`** - File uploads
- **`public/`** - Static assets
- **`docs/`** - Documentation
- **`*.log`** - Log files
- **`*.tmp`** - Temporary files

## ⚡ **Features**

### **Auto-Restart**
- ✅ Otomatis restart ketika file berubah
- ✅ Delay 1 detik untuk menghindari restart berulang
- ✅ Verbose output untuk debugging

### **Manual Restart**
```bash
# Ketik 'rs' di terminal nodemon untuk restart manual
rs
```

### **Event Messages**
- 🚀 **Start**: Server starting with nodemon
- 🔄 **Restart**: Server restarting due to file changes
- 💥 **Crash**: Server crashed! Waiting for changes
- 👋 **Exit**: Server stopped

## 🔧 **Development Workflow**

### **1. Start Development Environment**
```bash
npm run start-full
```

### **2. Edit Backend Files**
- Edit file di `backend/server.cjs`
- Edit file di `backend/database/`
- Edit file di `src/` (untuk sinkronisasi)

### **3. Auto-Restart**
- Nodemon otomatis detect perubahan
- Server restart dalam 1 detik
- API langsung tersedia tanpa manual restart

### **4. Monitor Logs**
```bash
# Terminal akan menampilkan:
[nodemon] restarting due to changes...
[nodemon] backend\server.cjs
🔄 Backend server restarting due to file changes...
🚀 Backend server starting with nodemon...
🔄 Server running with NODEMON - Auto-restart enabled!
```

## 🎯 **Benefits**

### **Development Speed**
- ⚡ **Faster Development**: Tidak perlu restart manual
- 🔄 **Instant Feedback**: Perubahan langsung terlihat
- 🚀 **Seamless Workflow**: Edit → Save → Auto-restart

### **Error Handling**
- 💥 **Crash Recovery**: Auto-restart jika server crash
- 🔍 **Verbose Logging**: Detail informasi untuk debugging
- ⚠️ **Error Detection**: Cepat detect syntax error

### **Productivity**
- 🎯 **Focus on Code**: Tidak perlu mikir restart server
- 🔧 **Easy Configuration**: Setup sekali, pakai selamanya
- 📊 **Real-time Testing**: Test API changes instantly

## 🛠️ **Troubleshooting**

### **Nodemon Not Starting**
```bash
# Install nodemon jika belum ada
npm install --save-dev nodemon

# Check nodemon version
npx nodemon --version
```

### **Too Many Restarts**
```bash
# Increase delay in nodemon.json
"delay": 2000
```

### **Files Not Watched**
```bash
# Check nodemon.json watch patterns
# Add specific directories or files
```

### **Manual Restart**
```bash
# Type 'rs' in nodemon terminal
rs

# Or restart the entire process
Ctrl+C
npm run backend:dev
```

## 📊 **Performance**

### **Resource Usage**
- **Memory**: Minimal overhead
- **CPU**: Low impact
- **Disk**: Efficient file watching

### **Restart Speed**
- **Average**: 1-2 seconds
- **Delay**: 1 second (configurable)
- **Detection**: Instant file change detection

## 🔗 **Integration**

### **With Frontend Development**
```bash
# Start both frontend and backend with auto-restart
npm run start-full
```

### **With Database Changes**
- SQL files in `backend/database/` akan trigger restart
- Environment variables di `.env` akan trigger restart
- Configuration files akan trigger restart

### **With Testing**
```bash
# Backend auto-restart memungkinkan testing real-time
npm run test-api  # Test API endpoints
npm run health-check  # Check server health
```

---

## 🎉 **Result**

**✅ Nodemon berhasil dikonfigurasi!**

- Backend server otomatis restart ketika ada perubahan
- Development workflow lebih efisien
- Tidak perlu save manual atau restart server
- Real-time feedback untuk semua perubahan code

**🚀 Happy Coding with Auto-Restart! 💻✨**
