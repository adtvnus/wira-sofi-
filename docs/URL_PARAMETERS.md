# 🎯 URL Parameter untuk Nama Tamu - Panduan Lengkap

## 📋 **OVERVIEW**

Fitur URL Parameter memungkinkan setiap tamu undangan memiliki URL personal yang menampilkan nama mereka secara otomatis di undangan. Tidak perlu lagi pengaturan nama tamu default - nama akan diambil langsung dari URL.

## 🔗 **FORMAT URL BARU**

### **Struktur URL:**
```
http://localhost:5173/main/{nama-tamu}
http://localhost:5173/rsvp/{nama-tamu}
http://localhost:5173/thanks/{nama-tamu}
```

### **Contoh URL:**
```
http://localhost:5173/main/John-Doe
http://localhost:5173/rsvp/Jane-Smith
http://localhost:5173/thanks/Ahmad-Budi
```

## 🎯 **CARA KERJA**

### **1. URL Encoding**
- Spasi diganti dengan tanda hubung (-)
- Karakter khusus di-encode dengan `encodeURIComponent()`
- Case-insensitive (tidak membedakan huruf besar/kecil)

### **2. Nama Tamu Display**
- Otomatis capitalize setiap kata
- Format: "John Doe", "Jane Smith", "Ahmad Budi"
- Fallback ke "Tamu Undangan" jika tidak ada parameter

### **3. Navigation**
- Link RSVP dan Thanks otomatis include nama tamu
- Konsisten di seluruh aplikasi
- Backward compatible dengan URL lama

## 🛠️ **IMPLEMENTASI TEKNIS**

### **1. Hook useGuestName**
```typescript
const { 
  guestName,           // Nama tamu dari URL
  displayName,         // Nama tamu formatted
  generateGuestUrl,    // Generate URL dengan nama
  getCurrentGuestUrl,  // URL saat ini dengan nama
  encodeGuestName,     // Encode nama untuk URL
  decodeGuestName      // Decode nama dari URL
} = useGuestName();
```

### **2. Router Configuration**
```typescript
const userRoutes = [
  { path: '/main', component: SinglePageLayout },
  { path: '/main/:guestName', component: SinglePageLayout },
  { path: '/rsvp', component: Rsvp },
  { path: '/rsvp/:guestName', component: Rsvp },
  { path: '/thanks', component: Thanks },
  { path: '/thanks/:guestName', component: Thanks },
];
```

### **3. Component Usage**
```typescript
// Di komponen Opening.tsx
const { displayName: guestName } = useGuestName();

// Tampilkan nama tamu
<h3 className="text-lg font-medium">
  {guestName}
</h3>
```

## 📱 **PENGGUNAAN UNTUK ADMIN**

### **1. Generator URL Personal**
- Komponen `GuestUrlGenerator` di admin dashboard
- Input nama tamu → Generate URL otomatis
- Copy & Share via WhatsApp/Email
- Preview URL sebelum dikirim

### **2. Guest Management Integration**
- Setiap guest di database bisa punya URL personal
- Bulk generate URLs untuk semua tamu
- Export daftar URL untuk distribusi

### **3. Analytics & Tracking**
- Track kunjungan per nama tamu
- Monitor RSVP berdasarkan URL personal
- Analytics engagement per tamu

## 🎨 **CONTOH PENGGUNAAN**

### **1. Untuk Tamu "John Doe":**
```
URL Utama: http://localhost:5173/main/John-Doe
URL RSVP:  http://localhost:5173/rsvp/John-Doe
URL Thanks: http://localhost:5173/thanks/John-Doe
```

**Hasil di halaman:**
- Nama yang tampil: "John Doe"
- Form RSVP pre-filled dengan "John Doe"
- Navigation links include parameter nama

### **2. Untuk Tamu "Ahmad Budi Santoso":**
```
URL: http://localhost:5173/main/Ahmad-Budi-Santoso
```

**Hasil:**
- Nama yang tampil: "Ahmad Budi Santoso"
- URL encoding: "Ahmad-Budi-Santoso"

### **3. Karakter Khusus:**
```
Nama: "José María"
URL: http://localhost:5173/main/Jos%C3%A9-Mar%C3%ADa
Tampil: "José María"
```

## 🔄 **BACKWARD COMPATIBILITY**

### **URL Lama (Query Parameter):**
```
http://localhost:5173/main?guest=John%20Doe
```

### **Auto Redirect ke Format Baru:**
```
http://localhost:5173/main/John-Doe
```

## 📊 **KEUNTUNGAN FITUR INI**

### **1. Personalisasi Maksimal**
- ✅ Setiap tamu punya URL unik
- ✅ Nama tampil otomatis tanpa setup
- ✅ Experience yang personal

### **2. Kemudahan Distribusi**
- ✅ Copy-paste URL langsung
- ✅ Share via WhatsApp/Email mudah
- ✅ QR Code per tamu

### **3. Tracking & Analytics**
- ✅ Monitor kunjungan per tamu
- ✅ RSVP tracking individual
- ✅ Engagement analytics

### **4. User Experience**
- ✅ Tidak perlu input nama manual
- ✅ Form RSVP pre-filled
- ✅ Konsisten di semua halaman

## 🚀 **CARA IMPLEMENTASI**

### **1. Generate URL untuk Tamu:**
```typescript
import { useGuestName } from './hooks/useGuestName';

const { generateGuestUrl } = useGuestName();

// Generate URL
const personalUrl = generateGuestUrl('John Doe', '/main');
// Result: "/main/John-Doe"
```

### **2. Kirim ke Tamu:**
```typescript
// WhatsApp
const message = `Halo John Doe! Undangan: ${baseUrl}/main/John-Doe`;

// Email
const emailBody = `Silakan buka undangan Anda: ${baseUrl}/main/John-Doe`;
```

### **3. Tamu Buka URL:**
```
1. Tamu klik: http://localhost:5173/main/John-Doe
2. Aplikasi parse "John-Doe" → "John Doe"
3. Nama "John Doe" tampil di undangan
4. Navigation links include parameter nama
5. Form RSVP pre-filled dengan "John Doe"
```

## 🔧 **TROUBLESHOOTING**

### **Problem: Nama tidak tampil**
**Solution:** 
- Cek format URL: `/main/Nama-Tamu`
- Pastikan tidak ada typo di parameter
- Cek console untuk error

### **Problem: Karakter khusus error**
**Solution:**
- Gunakan `encodeGuestName()` function
- Avoid karakter yang tidak supported
- Test dengan berbagai nama

### **Problem: Navigation tidak konsisten**
**Solution:**
- Pastikan semua link menggunakan `getCurrentGuestUrl()`
- Update semua NavLink components
- Test semua halaman

## 📈 **FUTURE ENHANCEMENTS**

### **1. QR Code Generation**
- Generate QR code per tamu
- Include dalam undangan fisik
- Mobile-friendly scanning

### **2. Advanced Analytics**
- Heatmap kunjungan per tamu
- Time spent per halaman
- Conversion rate RSVP

### **3. Social Sharing**
- Share button dengan nama tamu
- Social media integration
- Viral invitation features

## 🎉 **KESIMPULAN**

Fitur URL Parameter untuk nama tamu memberikan:
- **Personalisasi maksimal** untuk setiap undangan
- **Kemudahan distribusi** URL personal
- **User experience** yang seamless
- **Analytics** yang detail per tamu
- **Scalability** untuk banyak tamu

**Sekarang setiap tamu memiliki undangan yang benar-benar personal!** 🎊
