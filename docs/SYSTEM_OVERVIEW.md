# Sistem Undangan Pernikahan Dinamis

## Ringkasan Perubahan

Sistem undangan pernikahan telah diubah dari data statis menjadi sistem dinamis yang dapat dikelola melalui dashboard admin.

## Fitur Utama

### 1. **Data Dinamis**
- ✅ Nama pengantin pria dan wanita dapat diubah melalui dashboard
- ✅ Guest name dapat diatur per undangan atau menggunakan default
- ✅ Data disimpan di localStorage (dapat diupgrade ke database)
- ✅ Real-time update di seluruh aplikasi

### 2. **Admin Dashboard**
- ✅ Dashboard overview dengan statistik
- ✅ Pengaturan wedding (nama pengantin, orang tua, pesan)
- ✅ Manajemen tamu dengan link personal
- ✅ Manajemen quotes (quotes, foto, header, footer)
- ✅ Copy link undangan
- ✅ Preview undangan

### 3. **Personal Invitation Links**
- ✅ Generate link unik untuk setiap tamu
- ✅ Format: `http://localhost:5173/?guest=NamaTamu`
- ✅ Nama tamu otomatis muncul di undangan

## Cara Menggunakan

### Akses Admin Dashboard
1. Buka `http://localhost:5173/admin/dashboard`
2. Navigasi menggunakan sidebar menu

### Edit Nama Pengantin
1. Masuk ke "Pengaturan Wedding" (`/admin/wedding-settings`)
2. Edit nama depan, belakang, dan lengkap untuk pengantin pria dan wanita
3. Klik "Simpan Perubahan"
4. Perubahan langsung terlihat di halaman undangan

### Kelola Tamu
1. Masuk ke "Manajemen Tamu" (`/admin/guest-management`)
2. Tambah nama tamu baru
3. Copy link undangan personal
4. Kirim link ke tamu melalui WhatsApp/email/media lainnya

### Kelola Quotes
1. Masuk ke "Manajemen Quotes" (`/admin/quotes-management`)
2. Edit header title, subtitle, dan bottom message
3. Ubah URL gambar quotes
4. Tambah, edit, atau hapus quotes
5. Aktifkan/nonaktifkan quotes tertentu
6. Preview perubahan sebelum menyimpan

### Contoh Link Personal
- Tamu umum: `http://localhost:5173/`
- Tamu khusus: `http://localhost:5173/?guest=Bapak%20Ahmad`

## Struktur File Baru

```
src/
├── contexts/
│   └── WeddingContext.tsx          # Context provider untuk data wedding
├── types/
│   └── wedding.ts                  # Interface dan types
├── layouts/
│   └── AdminLayout.tsx             # Layout untuk halaman admin
├── pages/admin/
│   ├── Dashboard.tsx               # Dashboard utama admin
│   ├── WeddingSettings.tsx         # Pengaturan wedding
│   └── GuestManagement.tsx         # Manajemen tamu
└── pages/user/
    └── Intro.tsx                   # Updated dengan data dinamis
```

## Perubahan pada Intro.tsx

### Sebelum:
```tsx
const [guestName] = useState("Bapak/Ibu Tamu Undangan");
// ...
<h2>Wira</h2>
<h2>Sofi</h2>
```

### Sesudah:
```tsx
const { weddingData, guestName, setGuestName, isLoading } = useWedding();
// ...
<h2>{weddingData.couple.groomFirstName}</h2>
<h2>{weddingData.couple.brideFirstName}</h2>
```

## Data Structure

```typescript
interface WeddingCouple {
  groomFirstName: string;      // "Wira"
  groomLastName: string;       // "Maulana"
  groomFullName: string;       // "Wira Maulana"
  groomParentNames: string;    // "Bapak Ahmad & Ibu Siti"
  brideFirstName: string;      // "Sofi"
  brideLastName: string;       // "Kumala"
  brideFullName: string;       // "Sofi Kumala"
  brideParentNames: string;    // "Bapak Budi & Ibu Rina"
}
```

## Keunggulan Sistem Baru

1. **Fleksibilitas**: Nama pengantin dapat diubah kapan saja
2. **Personal Touch**: Setiap tamu mendapat undangan dengan nama mereka
3. **Easy Management**: Dashboard admin yang user-friendly
4. **Scalable**: Mudah ditambahkan fitur baru
5. **Real-time**: Perubahan langsung terlihat di undangan

## Next Steps (Opsional)

1. **Database Integration**: Ganti localStorage dengan database (MySQL/PostgreSQL)
2. **Authentication**: Tambah login admin
3. **RSVP Integration**: Hubungkan dengan sistem RSVP
4. **Analytics**: Track berapa tamu yang sudah membuka undangan
5. **Bulk Import**: Import daftar tamu dari Excel/CSV

## Testing

1. Buka `http://localhost:5173/` - Lihat undangan dengan nama default
2. Buka `http://localhost:5173/?guest=John%20Doe` - Lihat undangan dengan nama "John Doe"
3. Buka `http://localhost:5173/admin/dashboard` - Akses admin dashboard
4. Edit nama pengantin di wedding settings
5. Tambah tamu baru di guest management
6. Test link personal yang di-generate

Sistem sekarang sudah siap digunakan dan dapat dengan mudah dikustomisasi sesuai kebutuhan!
