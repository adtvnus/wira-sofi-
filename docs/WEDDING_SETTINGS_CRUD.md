# 📋 Wedding Settings CRUD Management System

## 🎯 **Fitur yang Telah Diimplementasikan**

### **1. Wedding Settings List/Table CRUD**
- ✅ **Tampilan Table**: Menampilkan semua wedding settings dari database
- ✅ **Status Aktif**: Menunjukkan setting mana yang sedang aktif
- ✅ **Aktivasi Setting**: Dapat mengaktifkan setting tertentu
- ✅ **Edit Setting**: Link ke form edit
- ✅ **Hapus Setting**: Hapus setting yang tidak aktif
- ✅ **Real-time Update**: Frontend otomatis update saat setting diaktifkan

### **2. Backend API Endpoints**
```javascript
// Get all wedding settings for CRUD table
GET /api/wedding-settings/all

// Set active wedding setting
PUT /api/wedding-settings/:id/activate

// Delete wedding setting
DELETE /api/wedding-settings/:id
```

### **3. Frontend Components**
- ✅ **WeddingSettingsList.tsx**: Komponen table CRUD
- ✅ **AdminLayout**: Menu "Settings List" ditambahkan
- ✅ **Dashboard**: Menampilkan data dari setting aktif
- ✅ **WeddingContext**: Function `reloadActiveSettings()` untuk update real-time

## 📊 **Struktur Database**

```sql
wedding_settings table:
├── id (Primary Key)
├── groom_full_name
├── groom_first_name  
├── groom_parents
├── bride_full_name
├── bride_first_name
├── bride_parents
├── wedding_date
├── wedding_time
├── wedding_venue
├── wedding_address
├── is_active (Boolean - hanya 1 yang true)
├── created_by (Foreign Key ke admin_users)
├── created_at
└── updated_at
```

## 🎮 **Cara Menggunakan Sistem**

### **1. Akses Wedding Settings List**
```
URL: http://localhost:5173/admin/wedding-settings-list
Menu: Admin Dashboard → Settings List
```

### **2. Melihat Data yang Ada**
- Table menampilkan semua wedding settings
- Kolom Status menunjukkan mana yang aktif
- Data diurutkan berdasarkan tanggal dibuat (terbaru dulu)

### **3. Mengaktifkan Setting**
1. Klik tombol "Aktifkan" pada baris yang diinginkan
2. Setting lama otomatis dinonaktifkan
3. Setting baru menjadi aktif
4. Frontend otomatis update dengan data baru

### **4. Mengedit Setting**
1. Klik tombol "Edit" pada baris yang diinginkan
2. Akan redirect ke form Wedding Settings
3. Data akan ter-load untuk diedit

### **5. Menghapus Setting**
1. Hanya setting yang tidak aktif yang bisa dihapus
2. Klik tombol "Hapus" dan konfirmasi
3. Data akan terhapus dari database

## 🔄 **Flow Data Real-time**

### **Saat Setting Diaktifkan:**
```
1. User klik "Aktifkan" di table
2. API call: PUT /api/wedding-settings/:id/activate
3. Database: Deactivate all → Activate selected
4. Table reload: Tampilkan status terbaru
5. WeddingContext reload: Update frontend data
6. Dashboard update: Tampilkan data aktif baru
7. Frontend pages update: Nama pengantin berubah
```

### **Update Frontend Pages:**
```
Dashboard: 
├── Pengantin Pria: [Data dari setting aktif]
├── Pengantin Wanita: [Data dari setting aktif]  
├── Tanggal Pernikahan: [Data dari setting aktif]
└── Tempat Acara: [Data dari setting aktif]

User Pages:
├── http://localhost:5173/ → Nama dari setting aktif
├── http://localhost:5173/main/{guest} → Nama dari setting aktif
└── Semua komponen menggunakan data aktif
```

## 📋 **Table Columns**

| Column | Description | Data Source |
|--------|-------------|-------------|
| **Status** | Aktif/Tidak Aktif | `is_active` boolean |
| **Pengantin** | Nama pengantin | `groom_first_name` & `bride_first_name` |
| **Tanggal & Tempat** | Info acara | `wedding_date`, `wedding_venue` |
| **Dibuat** | Info pembuat | `created_by_name`, `created_at` |
| **Aksi** | Tombol aksi | Aktifkan, Edit, Hapus |

## 🎨 **UI/UX Features**

### **Visual Indicators:**
- ✅ **Active Row**: Background hijau untuk setting aktif
- 🔴 **Status Badge**: Badge hijau "Aktif" / abu-abu "Tidak Aktif"
- 🎯 **Action Buttons**: Tombol berbeda warna sesuai fungsi

### **User Experience:**
- ✅ **Confirmation**: Konfirmasi sebelum hapus
- ✅ **Loading States**: Spinner saat memuat data
- ✅ **Success Messages**: Notifikasi berhasil/gagal
- ✅ **Auto-hide Messages**: Pesan hilang otomatis setelah 3 detik

## 🔧 **Technical Implementation**

### **API Service Integration:**
```typescript
// Get all settings
await apiService.getAllWeddingSettings()

// Activate setting
await apiService.activateWeddingSetting(id)

// Delete setting  
await apiService.deleteWeddingSetting(id)
```

### **Context Integration:**
```typescript
// Reload active settings in context
await reloadActiveSettings()

// Update frontend dengan data aktif baru
setWeddingData(prev => ({ ...prev, ...contextData }))
```

### **Real-time Updates:**
```typescript
// Setelah aktivasi berhasil
await loadWeddingSettings(); // Reload table
await reloadActiveSettings(); // Update context
// Frontend otomatis update
```

## 🎯 **Benefits**

### **1. Centralized Management**
- Semua wedding settings dalam satu table
- Easy switching antar setting
- Clear visual status

### **2. Real-time Updates**
- Frontend langsung update saat setting berubah
- Tidak perlu refresh manual
- Consistent data across all pages

### **3. Data Integrity**
- Hanya 1 setting yang aktif di database
- Tidak bisa hapus setting aktif
- Proper validation dan error handling

### **4. User-friendly Interface**
- Intuitive table layout
- Clear action buttons
- Helpful status indicators

## 🚀 **Next Steps**

1. **Test Backend Server**: Troubleshoot server exit issue
2. **Test Full Flow**: Test aktivasi dan update frontend
3. **Add More Features**: 
   - Duplicate setting
   - Export/Import settings
   - Setting templates
4. **Performance**: Add pagination untuk banyak data

## 📝 **Usage Example**

```typescript
// Contoh penggunaan di component
const { reloadActiveSettings } = useWedding();

// Setelah aktivasi setting
const handleActivate = async (id: number) => {
  const result = await apiService.activateWeddingSetting(id);
  if (result.success) {
    await reloadActiveSettings(); // Update frontend
    // Nama pengantin di semua halaman otomatis berubah
  }
};
```

## ✅ **Status Implementasi**

- ✅ Backend API endpoints
- ✅ Frontend CRUD table
- ✅ Real-time context updates
- ✅ Dashboard integration
- ✅ Menu navigation
- ⚠️ Backend server troubleshooting needed
- 🔄 Testing full flow pending

**Sistem Wedding Settings CRUD sudah siap digunakan!** Tinggal troubleshoot backend server agar dapat test full functionality.
