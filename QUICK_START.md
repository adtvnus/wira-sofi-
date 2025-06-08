# 🚀 QUICK START - Wedding Invitation System

## 🎉 **SISTEM SUDAH BERJALAN!**

### ✅ **STATUS SISTEM:**

```
🟢 Backend API Server: http://localhost:3001 ✅ RUNNING
🟢 Frontend React App: http://localhost:5173 ✅ RUNNING
🟡 MySQL Database: ⚠️ NEEDS SETUP (Optional)
```

---

## 🌐 **AKSES LANGSUNG KE SISTEM:**

### **🏠 Wedding Invitation (Public):**
- **Homepage**: http://localhost:5173/
- **Personal Invitation**: http://localhost:5173/main/Ahmad-Budi
- **RSVP Form**: http://localhost:5173/rsvp/Ahmad-Budi
- **Thanks Page**: http://localhost:5173/thanks/Ahmad-Budi

### **🔐 Admin Dashboard:**
- **Admin Portal**: http://localhost:5173/admin/portal
- **Login Page**: http://localhost:5173/admin/login
- **Dashboard**: http://localhost:5173/admin (after login)
- **Guest Management**: http://localhost:5173/admin/guest-management

### **🔧 API Endpoints:**
- **Health Check**: http://localhost:3001/api/health
- **Authentication**: http://localhost:3001/api/auth/login

---

## 🔑 **LOGIN CREDENTIALS:**

### **Demo Mode (LocalStorage):**
```
Username: admin
Password: admin
```

### **MySQL Mode (Jika Database Setup):**
```
Username: admin     | Password: admin     | Super Admin
Username: wira      | Password: wira123   | Groom
Username: sofi      | Password: sofi123   | Bride
Username: demo      | Password: 123       | Demo User
```

---

## 🎯 **CARA MENGGUNAKAN:**

### **1. Test Wedding Invitation:**
1. Buka: http://localhost:5173/
2. Klik "Lihat Undangan" 
3. Test dengan nama: http://localhost:5173/main/Nama-Anda
4. Test RSVP: http://localhost:5173/rsvp/Nama-Anda

### **2. Test Admin Dashboard:**
1. Buka: http://localhost:5173/admin/login
2. Login dengan: `admin` / `admin`
3. Akses Guest Management
4. Tambah tamu baru
5. Generate URL personal

### **3. Test URL Personal:**
- Format: `/main/{nama-tamu}`
- Contoh: `/main/Ahmad-Budi`
- Nama otomatis muncul di undangan
- RSVP form pre-filled

---

## 🗄️ **SETUP DATABASE MYSQL (OPTIONAL):**

### **Jika Ingin Menggunakan MySQL:**

```bash
# 1. Start MySQL Service (XAMPP/WAMP/MySQL)
# 2. Create Database
npm run create-db

# 3. Setup Tables & Data
npm run seed-db

# 4. Verify Connection
npm run health-check

# 5. Restart Backend
npm run backend
```

### **Tanpa MySQL:**
- Sistem tetap berjalan dengan LocalStorage
- Data tersimpan di browser
- Cocok untuk demo dan testing

---

## 🎨 **FITUR YANG BISA DITEST:**

### **✅ Frontend Features:**
- ✅ Beautiful wedding invitation design
- ✅ Responsive mobile-first layout
- ✅ Smooth animations & transitions
- ✅ Dynamic URL parameters
- ✅ Personal guest names
- ✅ RSVP form functionality
- ✅ Gallery & photo management
- ✅ Bride & groom information
- ✅ Wedding story & quotes

### **✅ Admin Features:**
- ✅ Secure login system
- ✅ Guest management (CRUD)
- ✅ URL generator for guests
- ✅ RSVP response tracking
- ✅ Dashboard analytics
- ✅ Content management
- ✅ Export guest list

### **✅ Technical Features:**
- ✅ JWT Authentication
- ✅ RESTful API endpoints
- ✅ Real-time data sync
- ✅ File upload support
- ✅ Activity logging
- ✅ Session management

---

## 🔧 **TROUBLESHOOTING:**

### **Jika Frontend Tidak Muncul:**
```bash
# Restart frontend
Ctrl+C (stop current process)
npm run dev
```

### **Jika Backend Error:**
```bash
# Restart backend
Ctrl+C (stop current process)
npm run backend
```

### **Jika Port Conflict:**
- Frontend akan otomatis cari port kosong (5173, 5174, 5175, dst)
- Backend fixed di port 3001

### **Jika Database Error:**
- Sistem tetap berjalan tanpa MySQL
- Data tersimpan di LocalStorage browser
- Untuk production, setup MySQL diperlukan

---

## 📱 **DEMO SCENARIOS:**

### **Scenario 1: Guest Experience**
1. Buka: http://localhost:5173/main/Sarah-Ahmad
2. Lihat nama "Sarah Ahmad" muncul otomatis
3. Scroll lihat semua section
4. Klik "RSVP" → form pre-filled
5. Submit RSVP

### **Scenario 2: Admin Management**
1. Login: http://localhost:5173/admin/login
2. Masuk Guest Management
3. Tambah tamu: "John Doe"
4. Copy URL personal yang generated
5. Test URL di tab baru

### **Scenario 3: Wedding Content**
1. Lihat Bride & Groom section
2. Test Story timeline
3. Browse Gallery photos
4. Read Quotes section
5. Check Thanks page

---

## 🎊 **SISTEM SIAP DIGUNAKAN!**

**Wedding Invitation System untuk Wira & Sofi sudah fully operational!**

### **Quick Access:**
- **Wedding**: http://localhost:5173/main/Nama-Tamu
- **Admin**: http://localhost:5173/admin/login
- **API**: http://localhost:3001/api/health

### **Next Steps:**
1. ✅ Test semua fitur di browser
2. ✅ Customize content sesuai kebutuhan
3. ✅ Setup MySQL untuk production
4. ✅ Deploy ke hosting

**Selamat menggunakan! 💒✨**
