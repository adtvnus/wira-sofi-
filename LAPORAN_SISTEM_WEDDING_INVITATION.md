# 📋 LAPORAN SISTEM WEDDING INVITATION

## 📖 DESKRIPSI PROGRAM

**Wedding Invitation System** adalah aplikasi web full-stack yang dirancang untuk membuat dan mengelola undangan pernikahan digital secara interaktif. Sistem ini menggunakan teknologi modern dengan React.js untuk frontend, Express.js untuk backend API, dan MySQL sebagai database utama. Aplikasi menyediakan dua interface utama: halaman undangan yang elegan untuk tamu dan dashboard admin yang komprehensif untuk pengelolaan konten. Fitur utama meliputi manajemen tamu dengan sistem RSVP real-time, galeri foto dengan upload otomatis, timeline cerita cinta, sistem quotes dengan gambar, dan generator URL personal untuk setiap tamu. Sistem menggunakan autentikasi JWT untuk keamanan admin, mendukung upload file dengan validasi ukuran maksimal 5MB, dan memiliki sistem fallback ke localStorage untuk mode offline. Arsitektur hybrid storage memungkinkan sinkronisasi otomatis antara database MySQL dan penyimpanan lokal, memberikan fleksibilitas maksimal dalam penggunaan.

## 🗂️ FILE-FILE PENTING

### 🔧 **BACKEND CORE FILES**

#### `backend/server.cjs` ⭐⭐⭐⭐⭐
**Fungsi:** Server API utama dengan Express.js dan autentikasi JWT
**Isi Penting:** 
- 30+ endpoint API untuk semua fitur (auth, guests, RSVP, wedding settings, quotes, gallery, story)
- Middleware autentikasi dengan JWT token
- Koneksi MySQL dengan connection pooling
- File upload handling dengan multer
- CORS configuration dan security headers

#### `backend/database/schema.sql` ⭐⭐⭐⭐⭐
**Fungsi:** Schema database MySQL lengkap dengan relasi
**Isi Penting:**
- 15+ tabel utama: admin_users, wedding_settings, wedding_guests, couple_settings, quotes_settings, gallery_settings, story_settings, dll
- Foreign key constraints dan indexes untuk performa
- Enum types untuk status dan kategori
- Audit trail dengan activity_logs

#### `backend/database/setup.cjs` ⭐⭐⭐⭐
**Fungsi:** Script setup database otomatis
**Isi Penting:** Eksekusi schema SQL, koneksi database, error handling

### ⚛️ **FRONTEND CORE FILES**

#### `src/App.tsx` ⭐⭐⭐⭐⭐
**Fungsi:** Komponen utama aplikasi React dengan routing
**Isi Penting:** Router configuration, context providers, layout management

#### `src/pages/admin/Dashboard.tsx` ⭐⭐⭐⭐⭐
**Fungsi:** Dashboard admin dengan statistik dan overview
**Isi Penting:** Real-time stats, guest analytics, RSVP summary, quick actions

#### `src/pages/admin/GuestManagement.tsx` ⭐⭐⭐⭐⭐
**Fungsi:** CRUD management untuk daftar tamu
**Isi Penting:** Add/edit/delete guests, invitation code generator, bulk operations

#### `src/pages/admin/RsvpManagement.tsx` ⭐⭐⭐⭐
**Fungsi:** Manajemen RSVP responses dari tamu
**Isi Penting:** RSVP status tracking, guest messages, attendance count

#### `src/pages/admin/GalleryManagement.tsx` ⭐⭐⭐⭐
**Fungsi:** Upload dan manajemen foto galeri
**Isi Penting:** Image upload dengan preview, size validation (5MB), gallery organization

#### `src/pages/admin/QuotesManagement.tsx` ⭐⭐⭐⭐
**Fungsi:** Manajemen quotes dengan gambar
**Isi Penting:** Quote text editor, image upload, active/inactive toggle

#### `src/pages/admin/StoryManagement.tsx` ⭐⭐⭐⭐
**Fungsi:** Timeline cerita cinta dengan CRUD
**Isi Penting:** Story timeline items, date management, content editor

### 🎨 **FRONTEND USER PAGES**

#### `src/pages/user/Opening.tsx` ⭐⭐⭐⭐
**Fungsi:** Halaman pembuka undangan
**Isi Penting:** Welcome animation, couple names display, invitation preview

#### `src/pages/user/Intro.tsx` ⭐⭐⭐⭐
**Fungsi:** Halaman intro dengan detail pernikahan
**Isi Penting:** Wedding date/time/venue, countdown timer, maps integration

#### `src/pages/user/Rsvp.tsx` ⭐⭐⭐⭐⭐
**Fungsi:** Form RSVP untuk tamu
**Isi Penting:** RSVP form dengan validation, attendance count, personal message

#### `src/pages/user/Gallery.tsx` ⭐⭐⭐⭐
**Fungsi:** Galeri foto pernikahan
**Isi Penting:** Photo grid layout, lightbox view, responsive design

### 🔧 **CONFIGURATION FILES**

#### `package.json` ⭐⭐⭐⭐⭐
**Fungsi:** Konfigurasi project dan dependencies
**Isi Penting:**
- Scripts: dev, build, backend, database setup
- Dependencies: React 19, Express 5, MySQL2, JWT, Multer, Tailwind
- DevDependencies: Vite, TypeScript, ESLint, Nodemon

#### `vite.config.ts` ⭐⭐⭐⭐
**Fungsi:** Konfigurasi build tool Vite
**Isi Penting:** React plugin, proxy configuration, build optimization

#### `tailwind.config.js` ⭐⭐⭐⭐
**Fungsi:** Konfigurasi Tailwind CSS
**Isi Penting:** Custom colors, responsive breakpoints, component classes

#### `tsconfig.app.json` ⭐⭐⭐⭐
**Fungsi:** Konfigurasi TypeScript untuk aplikasi
**Isi Penting:** Target ES2020, strict mode, JSX React, bundler module resolution

#### `eslint.config.js` ⭐⭐⭐⭐
**Fungsi:** Konfigurasi linting dan code quality
**Isi Penting:** TypeScript ESLint, React hooks rules, React refresh plugin

#### `index.html` ⭐⭐⭐⭐⭐
**Fungsi:** Entry point HTML aplikasi
**Isi Penting:**
- Meta tags dan viewport configuration
- External CDN: Tailwind CSS, Font Awesome, Google Fonts (Ovo)
- Root div dan script module untuk React

#### `.env.example` ⭐⭐⭐⭐⭐
**Fungsi:** Template environment variables untuk production
**Isi Penting:**
- Database configuration (MySQL)
- JWT secrets dan security settings
- API URLs dan CORS configuration
- Upload limits dan admin credentials

### 🛠️ **UTILITY FILES**

#### `src/services/apiService.ts` ⭐⭐⭐⭐⭐
**Fungsi:** Service layer untuk komunikasi API
**Isi Penting:** HTTP client, error handling, token management, API endpoints

#### `src/contexts/WeddingContext.tsx` ⭐⭐⭐⭐
**Fungsi:** Global state management untuk data wedding
**Isi Penting:** Context provider, state management, data synchronization

#### `src/contexts/AuthContext.tsx` ⭐⭐⭐⭐⭐
**Fungsi:** Authentication context dan state management
**Isi Penting:**
- JWT token management dan localStorage persistence
- User authentication state dan login/logout functions
- API service token integration
- Session verification dan auto-login

#### `src/utils/storageManager.ts` ⭐⭐⭐⭐
**Fungsi:** Manajemen localStorage dan hybrid storage
**Isi Penting:** Local storage operations, data sync, fallback mechanisms

#### `src/types/wedding.ts` ⭐⭐⭐⭐⭐
**Fungsi:** TypeScript type definitions untuk seluruh aplikasi
**Isi Penting:**
- Interface untuk semua data structures (WeddingCouple, TimelineItem, GalleryImage, dll)
- Type definitions untuk API responses dan form data
- 15+ interfaces covering all wedding features

#### `src/main.tsx` ⭐⭐⭐⭐⭐
**Fungsi:** Entry point React aplikasi
**Isi Penting:** React DOM rendering, StrictMode wrapper, CSS imports

#### `src/index.css` ⭐⭐⭐⭐
**Fungsi:** Global CSS styles dan Tailwind configuration
**Isi Penting:**
- Tailwind CSS imports dan Google Fonts (Ovo)
- Custom scrollbar styles untuk admin sidebar
- Responsive design untuk mobile sidebar
- Base layout dan color scheme (cream/amber theme)

#### `src/layouts/AdminLayout.tsx` ⭐⭐⭐⭐⭐
**Fungsi:** Layout wrapper untuk semua admin pages
**Isi Penting:**
- Fixed header dan sidebar navigation
- Mobile responsive sidebar dengan overlay
- User authentication display dan logout functionality
- Navigation menu untuk semua admin features

### 🧩 **COMPONENTS & UI ELEMENTS**

#### `src/components/ui/` directory ⭐⭐⭐⭐
**Fungsi:** Reusable UI component library
**Isi Penting:**
- `Button.tsx` - Styled button component dengan Tailwind
- `Card.tsx` - Card wrapper component
- `Input.tsx` - Form input component
- `NavBar.tsx` - Navigation bar untuk user pages dengan Lucide icons

#### `src/components/admin/` directory ⭐⭐⭐⭐
**Fungsi:** Admin-specific components
**Isi Penting:**
- `Dashboard.tsx` - Dashboard widgets dan statistics
- `GuestTable.tsx` - Data table untuk guest management
- `GuestUrlGenerator.tsx` - URL generator untuk personal invitations
- `LoginForm.tsx` - Admin login form component

#### `src/components/user/` directory ⭐⭐⭐⭐
**Fungsi:** User-facing wedding components
**Isi Penting:**
- `Card.tsx` - Wedding-themed card component
- `Footer.tsx` - Wedding invitation footer
- `Header.tsx` - Wedding invitation header

#### `src/components/` core files ⭐⭐⭐⭐
**Fungsi:** Core utility components
**Isi Penting:**
- `ErrorBoundary.tsx` - Error handling wrapper
- `StorageWarning.tsx` - Storage mode indicator
- `APIToggle.tsx` - API/Local storage mode toggle
- `ImageUpload.tsx` & `FileImageUpload.tsx` - Image upload components

### 🛣️ **ROUTING & NAVIGATION**

#### `src/routes/userRoutes.tsx` ⭐⭐⭐⭐⭐
**Fungsi:** User-facing route definitions
**Isi Penting:**
- Route mapping untuk semua user pages
- Guest name parameter handling
- Single page layout routing
- RSVP dan Thanks page routes

#### `src/routes/adminRoutes.tsx` ⭐⭐⭐⭐⭐
**Fungsi:** Admin route definitions dan protection
**Isi Penting:**
- Protected admin routes dengan authentication
- Admin page route mapping
- Login route handling

### 🎣 **HOOKS & UTILITIES**

#### `src/hooks/useGuestName.ts` ⭐⭐⭐⭐
**Fungsi:** Custom hook untuk guest name management
**Isi Penting:**
- URL parameter extraction untuk guest names
- Guest URL generation utilities
- Guest name state management

#### `src/utils/imageUpload.ts` ⭐⭐⭐⭐
**Fungsi:** Image upload utility functions
**Isi Penting:**
- File validation dan size checking
- Image processing utilities
- Upload error handling

### 🔐 **AUTHENTICATION & SECURITY FILES**

#### `src/components/auth/LoginRequired.tsx` ⭐⭐⭐⭐
**Fungsi:** Authentication guard component
**Isi Penting:** Route protection, authentication checking, redirect logic

#### `backend/server.cjs` - Authentication Middleware ⭐⭐⭐⭐⭐
**Fungsi:** JWT authentication dan session management
**Isi Penting:**
- `authenticateToken` middleware untuk API protection
- Session verification dengan database lookup
- Password hashing dengan bcrypt
- Login/logout endpoints dengan security measures

### 🗄️ **DATABASE MANAGEMENT FILES**

#### `backend/database/create.cjs` ⭐⭐⭐⭐
**Fungsi:** Database creation dan migration script
**Isi Penting:** Database creation, schema execution, table verification

#### `backend/database/clean-database.cjs` ⭐⭐⭐
**Fungsi:** Database cleanup dan reset utility
**Isi Penting:** Clean schema execution, admin user creation, data reset

### 📁 **SUPPORTING FILES**

#### `nodemon.json` ⭐⭐⭐⭐
**Fungsi:** Development server auto-restart configuration
**Isi Penting:**
- Watch patterns untuk backend/, src/, .env
- File extensions: js, cjs, ts, tsx, json, sql
- Ignore patterns dan restart delays
- Custom events dan logging

#### `backend/database/seeder.cjs` ⭐⭐⭐
**Fungsi:** Data seeding untuk development
**Isi Penting:** Sample data insertion, admin user creation

#### `tools/` directory ⭐⭐⭐
**Fungsi:** Development tools dan testing utilities
**Isi Penting:** Health checks, database tools, debugging scripts

#### `scripts/organize-files.cjs` ⭐⭐⭐
**Fungsi:** Project file organization utility
**Isi Penting:** File cleanup, structure maintenance, project organization

## 🎯 **TINGKAT KEPENTINGAN**
- ⭐⭐⭐⭐⭐ = Critical (sistem tidak bisa berjalan tanpa file ini)
- ⭐⭐⭐⭐ = Important (fitur utama bergantung pada file ini)
- ⭐⭐⭐ = Supporting (mendukung development dan maintenance)

### 📚 **DOCUMENTATION FILES**

#### `README.md` ⭐⭐⭐⭐
**Fungsi:** Dokumentasi utama project
**Isi Penting:** Installation guide, feature overview, API endpoints, default credentials

#### `docs/` directory ⭐⭐⭐
**Fungsi:** Detailed technical documentation
**Isi Penting:**
- `PROJECT_STRUCTURE.md` - Project architecture
- `DATABASE_SCHEMA_FINAL.md` - Database documentation
- `SYSTEM_OVERVIEW.md` - System analysis
- Various troubleshooting dan setup guides

### 🔄 **MISSING CRITICAL FILES TO ADD**

#### `.env` ⭐⭐⭐⭐⭐
**Status:** MISSING - Perlu dibuat dari .env.example
**Fungsi:** Environment variables untuk development/production
**Isi Penting:** Database credentials, JWT secrets, API configurations

#### `public/images/` directories ⭐⭐⭐⭐
**Status:** Perlu diverifikasi struktur
**Fungsi:** Image storage untuk uploads
**Isi Penting:**
- `GalleryDatabase/` - Gallery images
- `QuotesDatabase/` - Quote images
- `BrideGroomDatabase/` - Couple photos

### 🎨 **ASSETS & STYLING**

#### `src/assets/` directory ⭐⭐⭐
**Fungsi:** Static assets untuk aplikasi
**Isi Penting:**
- `admin/` - Admin-specific assets
- `user/` - User-facing assets dan styles
- `react.svg` - React logo

#### `src/vite-env.d.ts` ⭐⭐⭐
**Fungsi:** Vite environment type definitions
**Isi Penting:** TypeScript declarations untuk Vite

## 📊 **STATISTIK PROJECT**
- **Total Files:** 200+ files
- **Backend Endpoints:** 30+ API endpoints
- **Database Tables:** 15+ tables
- **Admin Pages:** 10 management pages
- **User Pages:** 10 invitation pages
- **Frontend Components:** 25+ React components
- **UI Components:** 10+ reusable UI elements
- **Custom Hooks:** 5+ custom React hooks
- **Route Definitions:** 15+ routes (user + admin)
- **Dependencies:** 50+ npm packages
- **Configuration Files:** 10+ config files
- **TypeScript Interfaces:** 15+ type definitions
- **Authentication:** JWT-based dengan session management
- **Styling:** Tailwind CSS dengan custom theme
