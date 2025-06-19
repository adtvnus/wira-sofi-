# 📋 LAPORAN PROGRAM WEDDING INVITATION SYSTEM - WIRA & SOFI

## 📖 DESKRIPSI PROGRAM

**Wedding Invitation System - Wira & Sofi** adalah aplikasi web modern untuk undangan pernikahan digital yang dibangun menggunakan teknologi React.js untuk frontend dan Node.js/Express.js untuk backend dengan database MySQL. Sistem ini menyediakan platform lengkap untuk mengelola undangan pernikahan digital dengan fitur admin dashboard yang komprehensif, sistem RSVP real-time, galeri foto dinamis, dan personalisasi URL untuk setiap tamu. Program ini dirancang untuk memberikan pengalaman undangan pernikahan yang elegan dan interaktif dengan manajemen konten yang mudah melalui panel admin yang aman dengan autentikasi JWT.

---

## 📁 FILE-FILE PENTING DAN PENJELASANNYA

### 🔧 **KONFIGURASI UTAMA**

#### `package.json`
**Fungsi:** File konfigurasi utama Node.js yang mendefinisikan dependencies, scripts, dan metadata proyek.
**Isi Penting:** Dependencies React 19, Express.js, MySQL2, JWT, Multer untuk upload file, Tailwind CSS, dan berbagai tools development seperti nodemon dan concurrently.

#### `vite.config.ts`
**Fungsi:** Konfigurasi build tool Vite untuk development dan production.
**Isi Penting:** Plugin React, konfigurasi proxy untuk API backend, dan optimasi build.

#### `tailwind.config.js`
**Fungsi:** Konfigurasi framework CSS Tailwind untuk styling.
**Isi Penting:** Custom theme, color palette cream untuk tema pernikahan, dan responsive breakpoints.

#### `tsconfig.json`
**Fungsi:** Konfigurasi TypeScript compiler untuk type checking dan transpilation.
**Isi Penting:** Target ES2020, strict mode, dan path mapping untuk imports.

---

### 🗄️ **BACKEND & DATABASE**

#### `backend/server.cjs`
**Fungsi:** Server API utama yang menangani semua endpoint REST API.
**Isi Penting:** Autentikasi JWT, CORS configuration, middleware logging, file upload dengan Multer, dan semua endpoint untuk wedding settings, guest management, RSVP, gallery, quotes, dan admin authentication.

#### `backend/database/schema.sql`
**Fungsi:** Schema database MySQL lengkap dengan semua tabel dan relasi.
**Isi Penting:** 10+ tabel utama termasuk admin_users, wedding_settings, wedding_guests, wedding_stories, wedding_quotes, wedding_images, activity_logs, user_sessions, dan thanks_settings dengan foreign key constraints dan indexes.

#### `backend/database/setup.cjs`
**Fungsi:** Script untuk setup database dan tabel secara otomatis.
**Isi Penting:** Koneksi database, eksekusi schema SQL, dan error handling.

#### `backend/database/seeder.cjs`
**Fungsi:** Script untuk mengisi database dengan data sample.
**Isi Penting:** Data default admin user, wedding settings, dan sample guests.

---

### ⚛️ **FRONTEND REACT**

#### `src/App.tsx`
**Fungsi:** Komponen root aplikasi React dengan routing utama.
**Isi Penting:** React Router setup, context providers, dan route definitions untuk user dan admin.

#### `src/main.tsx`
**Fungsi:** Entry point aplikasi React yang me-render App component.
**Isi Penting:** React DOM rendering, CSS imports, dan provider wrapping.

#### `src/index.css`
**Fungsi:** Global CSS styles dengan Tailwind CSS imports.
**Isi Penting:** Tailwind base, components, utilities, dan custom CSS untuk font Ovo dan animasi.

---

### 🔐 **AUTENTIKASI & KONTEKS**

#### `src/contexts/AuthContext.tsx`
**Fungsi:** React Context untuk manajemen state autentikasi global.
**Isi Penting:** Login/logout functions, token management, user state, dan protected route logic.

#### `src/contexts/WeddingContext.tsx`
**Fungsi:** React Context untuk manajemen data wedding global.
**Isi Penting:** Wedding settings state, guest data, RSVP management, dan API integration.

---

### 👥 **HALAMAN ADMIN**

#### `src/pages/admin/Dashboard.tsx`
**Fungsi:** Dashboard utama admin dengan statistik dan overview.
**Isi Penting:** Cards statistik guests, RSVP summary, recent activities, dan quick actions.

#### `src/pages/admin/Login.tsx`
**Fungsi:** Halaman login admin dengan form autentikasi.
**Isi Penting:** Login form, validation, JWT token handling, dan redirect logic.

#### `src/pages/admin/GuestManagement.tsx`
**Fungsi:** CRUD management untuk data tamu undangan.
**Isi Penting:** Table guests, add/edit/delete functions, search/filter, dan bulk operations.

#### `src/pages/admin/RsvpManagement.tsx`
**Fungsi:** Management responses RSVP dari tamu.
**Isi Penting:** RSVP list, status tracking, export functions, dan statistics.

#### `src/pages/admin/WeddingSettings.tsx`
**Fungsi:** Management pengaturan detail pernikahan.
**Isi Penting:** Form wedding details, venue info, date/time settings, dan couple information.

#### `src/pages/admin/GalleryManagement.tsx`
**Fungsi:** Management upload dan organize foto gallery.
**Isi Penting:** Image upload, gallery grid, image metadata, dan file management.

#### `src/pages/admin/QuotesManagement.tsx`
**Fungsi:** Management quotes/kutipan untuk ditampilkan di website.
**Isi Penting:** Quote CRUD, active/inactive toggle, dan image upload untuk quotes.

#### `src/pages/admin/StoryManagement.tsx`
**Fungsi:** Management cerita pernikahan dan timeline.
**Isi Penting:** Story timeline, content editor, date management, dan display order.

#### `src/pages/admin/BrideGroomManagement.tsx`
**Fungsi:** Management informasi detail pengantin.
**Isi Penting:** Bride/groom profiles, parent names, photos, dan personal information.

#### `src/pages/admin/ThanksManagement.tsx`
**Fungsi:** Management halaman terima kasih.
**Isi Penting:** Thank you message customization, blessing quotes, dan social media links.

---

### 👤 **HALAMAN USER/TAMU**

#### `src/pages/user/Opening.tsx`
**Fungsi:** Halaman pembuka undangan dengan animasi welcome.
**Isi Penting:** Welcome animation, couple names, wedding date, dan enter button.

#### `src/pages/user/Intro.tsx`
**Fungsi:** Halaman intro dengan informasi dasar pernikahan.
**Isi Penting:** Couple introduction, wedding overview, dan navigation to main content.

#### `src/pages/user/Bride.tsx` & `src/pages/user/Groom.tsx`
**Fungsi:** Halaman profil pengantin wanita dan pria.
**Isi Penting:** Personal photos, full names, parent names, dan personal quotes.

#### `src/pages/user/Story.tsx`
**Fungsi:** Halaman cerita pernikahan dan timeline hubungan.
**Isi Penting:** Love story timeline, relationship milestones, dan romantic quotes.

#### `src/pages/user/Gallery.tsx`
**Fungsi:** Halaman galeri foto couple.
**Isi Penting:** Photo grid, lightbox view, image captions, dan responsive layout.

#### `src/pages/user/Quotes.tsx`
**Fungsi:** Halaman quotes/kutipan romantis.
**Isi Penting:** Quote carousel, background images, dan typography styling.

#### `src/pages/user/Invited.tsx`
**Fungsi:** Halaman detail acara dan lokasi pernikahan.
**Isi Penting:** Event details, venue information, maps integration, dan calendar add.

#### `src/pages/user/Rsvp.tsx`
**Fungsi:** Halaman form RSVP untuk konfirmasi kehadiran.
**Isi Penting:** RSVP form, guest count selection, message input, dan submission handling.

#### `src/pages/user/Thanks.tsx`
**Fungsi:** Halaman terima kasih setelah RSVP.
**Isi Penting:** Thank you message, blessing quotes, dan social media sharing.

---

### 🔧 **SERVICES & UTILITIES**

#### `src/services/apiService.ts`
**Fungsi:** Service layer untuk semua API calls ke backend.
**Isi Penting:** HTTP client configuration, API endpoints, error handling, dan response formatting.

#### `src/utils/imageUpload.ts`
**Fungsi:** Utility functions untuk image upload dan processing.
**Isi Penting:** File validation, image compression, upload progress, dan error handling.

#### `src/hooks/useGuestName.ts`
**Fungsi:** Custom React hook untuk extract guest name dari URL.
**Isi Penting:** URL parameter parsing, guest validation, dan name formatting.

---

### 🎨 **COMPONENTS & LAYOUTS**

#### `src/layouts/AdminLayout.tsx`
**Fungsi:** Layout wrapper untuk semua halaman admin.
**Isi Penting:** Sidebar navigation, top bar, breadcrumbs, dan responsive layout.

#### `src/components/ui/`
**Fungsi:** Reusable UI components library.
**Isi Penting:** Button, Input, Modal, Table, Card components dengan consistent styling.

#### `src/components/admin/`
**Fungsi:** Admin-specific components.
**Isi Penting:** Data tables, forms, charts, dan admin-only UI elements.

#### `src/components/user/`
**Fungsi:** User-facing components untuk wedding invitation.
**Isi Penting:** Wedding-themed components, animations, dan interactive elements.

---

### 🛠️ **TOOLS & SCRIPTS**

#### `tools/` directory
**Fungsi:** Development tools dan debugging scripts.
**Isi Penting:** Database health checks, API testing, data migration, dan system monitoring tools.

#### `scripts/organize-files.cjs`
**Fungsi:** Script untuk organize dan cleanup project files.
**Isi Penting:** File organization, cleanup unused files, dan project structure maintenance.

---

### 📚 **DOKUMENTASI**

#### `README.md`
**Fungsi:** Dokumentasi utama proyek dengan setup instructions.
**Isi Penting:** Installation guide, feature overview, API documentation, dan deployment instructions.

#### `docs/` directory
**Fungsi:** Detailed documentation untuk berbagai aspek sistem.
**Isi Penting:** System analysis, database schema, testing guides, dan troubleshooting.

---

## 🎯 **KESIMPULAN**

Program Wedding Invitation System ini adalah aplikasi full-stack modern yang lengkap dengan fitur-fitur enterprise-level seperti autentikasi JWT, real-time updates, file upload management, responsive design, dan comprehensive admin panel. Struktur kode yang terorganisir dengan baik, separation of concerns yang jelas, dan dokumentasi yang lengkap membuat sistem ini mudah untuk di-maintain dan dikembangkan lebih lanjut.
