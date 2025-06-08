# 📝 Quotes Management dengan Upload Foto

## 🎯 **FITUR LENGKAP QUOTES MANAGEMENT**

### ✅ **Fitur yang Sudah Diimplementasi:**

#### **1. 🗄️ MySQL Database Integration:**
- ✅ **Table**: `wedding_quotes` dengan kolom `quote_image_url`
- ✅ **CRUD Operations**: Create, Read, Update, Delete
- ✅ **Soft Delete**: Data tidak benar-benar dihapus
- ✅ **Foreign Key**: Terhubung dengan `wedding_settings`
- ✅ **Activity Logging**: Semua perubahan tercatat

#### **2. 🖼️ Upload Foto Features:**
- ✅ **Simple URL Input**: Manual input URL gambar
- ✅ **Advanced Upload**: Component ImageUpload dengan compression
- ✅ **Image Preview**: Preview gambar sebelum save
- ✅ **Multiple Formats**: JPG, PNG, WebP support
- ✅ **Auto Compression**: Gambar besar otomatis dikompres

#### **3. 📊 Quote Management Features:**
- ✅ **Add Quotes**: Tambah quote baru dengan foto
- ✅ **Edit Quotes**: Edit quote existing dengan foto
- ✅ **Delete Quotes**: Hapus quote (soft delete)
- ✅ **Categories**: Love, Marriage, Blessing, General
- ✅ **Display Order**: Atur urutan tampilan
- ✅ **Active/Inactive**: Toggle status quote

#### **4. 🎨 User Interface:**
- ✅ **Responsive Design**: Mobile-friendly
- ✅ **Cream Theme**: Sesuai dengan wedding theme
- ✅ **Font Ovo**: Typography yang elegant
- ✅ **Icons**: Font Awesome icons
- ✅ **Real-time Preview**: Preview gambar langsung

---

## 🚀 **CARA MENGGUNAKAN QUOTES MANAGEMENT**

### **1. 🔐 Login ke Admin Panel:**
```
URL: http://localhost:5173/admin/login
Username: admin
Password: admin
```

### **2. 📝 Buka Quotes Management:**
```
URL: http://localhost:5173/admin/quotes-management
Atau: Dashboard → Sidebar → "Quotes Management"
```

### **3. ➕ Menambah Quote Baru:**

#### **Step 1: Click "Add New Quote"**
- Click tombol hijau "Add New Quote"
- Form akan muncul

#### **Step 2: Isi Data Quote**
```
📝 Quote Text: "Cinta sejati tidak pernah berakhir..."
👤 Author: "Paulo Coelho"
🏷️ Category: Love/Marriage/Blessing/General
📊 Display Order: 1, 2, 3, dst
```

#### **Step 3: Upload Foto (2 Cara)**

**Cara 1: Simple URL Input**
```
🔗 Enter image URL: /images/quotes/my-quote.jpg
✅ Preview akan muncul otomatis
```

**Cara 2: Advanced Upload**
```
📁 Click "Upload File" button
🖼️ Pilih gambar dari komputer
⚡ Auto compression jika file besar
✅ URL otomatis terisi
```

#### **Step 4: Save Quote**
```
✅ Click "Add Quote" button
🎉 Success message akan muncul
📊 Quote baru muncul di list
```

### **4. ✏️ Edit Quote Existing:**
```
1. Click icon "Edit" (pensil) di quote yang ingin diedit
2. Form edit akan muncul
3. Ubah data yang diperlukan
4. Upload foto baru jika perlu
5. Click "Update Quote"
```

### **5. 🗑️ Hapus Quote:**
```
1. Click icon "Delete" (trash) di quote yang ingin dihapus
2. Konfirmasi penghapusan
3. Quote akan di-soft delete (tidak benar-benar hilang)
```

---

## 📁 **STRUKTUR FOLDER IMAGES**

### **Recommended Folder Structure:**
```
public/
├── images/
│   ├── quotes/
│   │   ├── love-quote-1.jpg
│   │   ├── marriage-quote-1.jpg
│   │   ├── blessing-quote-1.jpg
│   │   └── general-quote-1.jpg
│   ├── gallery/
│   ├── bride-groom/
│   └── stories/
```

### **Image Guidelines:**
```
📏 Recommended Size: 800x600px atau 1200x800px
📦 Max File Size: 2MB (auto compressed)
🎨 Format: JPG, PNG, WebP
🖼️ Aspect Ratio: 4:3 atau 16:9 untuk best results
```

---

## 🗄️ **DATABASE SCHEMA**

### **wedding_quotes Table:**
```sql
CREATE TABLE wedding_quotes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    wedding_id INT NOT NULL,
    quote_text TEXT NOT NULL,
    quote_author VARCHAR(100) NULL,
    quote_category ENUM('love', 'marriage', 'blessing', 'general') DEFAULT 'general',
    quote_image_url VARCHAR(255) NULL,  -- 🖼️ NEW: Image URL column
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
);
```

---

## 🔧 **API ENDPOINTS**

### **1. GET Quotes:**
```
GET /api/quotes
Headers: Authorization: Bearer {token}
Response: Array of quotes with images
```

### **2. POST New Quote:**
```
POST /api/quotes
Headers: Authorization: Bearer {token}
Body: {
  "quoteText": "Quote text here",
  "quoteAuthor": "Author name",
  "quoteCategory": "love",
  "quoteImage": "/images/quotes/photo.jpg",
  "displayOrder": 1
}
```

### **3. PUT Update Quote:**
```
PUT /api/quotes/{id}
Headers: Authorization: Bearer {token}
Body: {
  "quoteText": "Updated quote text",
  "quoteAuthor": "Updated author",
  "quoteCategory": "marriage",
  "quoteImage": "/images/quotes/new-photo.jpg",
  "displayOrder": 2,
  "isActive": true
}
```

### **4. DELETE Quote:**
```
DELETE /api/quotes/{id}
Headers: Authorization: Bearer {token}
Response: Success message (soft delete)
```

---

## 🎨 **FRONTEND INTEGRATION**

### **User Page Integration:**
```typescript
// src/pages/user/Quotes.tsx akan otomatis load dari MySQL
const quotes = await fetch('/api/quotes');

// Display quotes dengan images
quotes.map(quote => (
  <div>
    <img src={quote.quote_image_url} alt="Quote" />
    <blockquote>"{quote.quote_text}"</blockquote>
    <cite>— {quote.quote_author}</cite>
  </div>
))
```

---

## 🧪 **TESTING**

### **1. Test API:**
```bash
node tools/test-quotes-api.cjs
```

### **2. Test Frontend:**
```
1. Login: http://localhost:5173/admin/login
2. Quotes: http://localhost:5173/admin/quotes-management
3. Add quote dengan foto
4. Edit quote existing
5. Delete quote
6. Check user page: http://localhost:5173/main/guest-name
```

### **3. Test Database:**
```sql
-- Check quotes table
SELECT * FROM wedding_quotes;

-- Check with images
SELECT id, quote_text, quote_author, quote_image_url, is_active 
FROM wedding_quotes 
WHERE is_active = TRUE;
```

---

## 🎉 **HASIL AKHIR**

### **✅ Quotes Management Lengkap:**
- 📝 **CRUD Operations**: Full Create, Read, Update, Delete
- 🖼️ **Image Upload**: Simple URL input + Advanced upload
- 🗄️ **MySQL Integration**: Real database storage
- 🎨 **Beautiful UI**: Cream theme dengan Ovo font
- 📱 **Responsive**: Mobile-friendly design
- 🔐 **Secure**: Authentication protected
- 📊 **Organized**: Categories dan display order
- 🔄 **Real-time**: Instant preview dan updates

### **🎯 User Experience:**
- ✅ **Easy to Use**: Simple form interface
- ✅ **Visual Preview**: See images before save
- ✅ **Flexible Upload**: URL input atau file upload
- ✅ **Auto Compression**: Large images handled automatically
- ✅ **Error Handling**: Clear error messages
- ✅ **Success Feedback**: Confirmation messages

**Quotes Management sekarang fully functional dengan upload foto dan MySQL integration!** 💒✨
