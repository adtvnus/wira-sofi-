# 💒 Wedding Invitation System - Wira & Sofi

[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://mysql.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://typescriptlang.org/)

> **Modern, Dynamic Wedding Invitation System with MySQL Integration & Admin Dashboard**

## 🌟 Features

### 🎨 **Frontend Features**
- ✨ **Beautiful UI**: Elegant design with Ovo font & cream color theme
- 📱 **Responsive**: Mobile-first design with Tailwind CSS
- 🎭 **Animations**: Smooth animations with Framer Motion & AOS
- 🔗 **Dynamic URLs**: Personalized invitation URLs for each guest
- 📝 **RSVP System**: Interactive RSVP form with real-time validation
- 🖼️ **Gallery**: Dynamic photo gallery management
- 💌 **Personal Touch**: Customizable content for bride, groom, and story

### 🔐 **Admin Dashboard**
- 🛡️ **Authentication**: JWT-based secure login system
- 👥 **Guest Management**: Complete CRUD operations for guests
- 📊 **Analytics**: Dashboard with statistics and insights
- ⚙️ **Content Management**: Dynamic content editing for all sections
- 📱 **RSVP Management**: View and manage all RSVP responses
- 🎯 **URL Generator**: Generate personalized invitation URLs

### 🗄️ **Backend Features**
- 🚀 **Express.js API**: RESTful API with MySQL integration
- 🔒 **Security**: JWT authentication, bcrypt password hashing
- 📁 **File Upload**: Image upload with multer
- 🗃️ **Database**: MySQL with proper schema and relationships
- 🔄 **Real-time**: Live data synchronization
- 🛠️ **Tools**: Health checks, testing utilities, and monitoring

## 📁 Project Structure

```
wedding-invitation/
├── 📁 backend/                 # Backend server & API
│   ├── server.cjs             # Main API server
│   ├── 📁 database/           # Database files
│   │   ├── schema.sql         # Database schema
│   │   ├── seeder.cjs         # Data seeding
│   │   ├── create.cjs         # Database creation
│   │   └── setup.cjs          # Database setup
│   └── 📁 scripts/            # Database utilities
│       ├── check-consistency.cjs
│       ├── check-structure.cjs
│       └── add-sample-data.cjs
├── 📁 src/                    # Frontend React app
│   ├── 📁 components/         # Reusable components
│   ├── 📁 pages/              # Page components
│   ├── 📁 contexts/           # React contexts
│   ├── 📁 hooks/              # Custom hooks
│   ├── 📁 services/           # API services
│   ├── 📁 types/              # TypeScript types
│   ├── 📁 utils/              # Utility functions
│   └── 📁 layouts/            # Layout components
├── 📁 public/                 # Public assets
├── 📁 uploads/                # File uploads
├── 📁 docs/                   # Documentation
├── 📁 tools/                  # Development tools
├── 📁 scripts/                # Build & utility scripts
├── package.json               # Dependencies
├── vite.config.ts             # Build configuration
└── .env                       # Environment variables
```

## 🚀 Quick Start

### 1. **Installation**
```bash
# Clone repository
git clone <repository-url>
cd wedding-invitation

# Install dependencies
npm install
```

### 2. **Database Setup**
```bash
# Create database
npm run create-db

# Setup tables and schema
npm run setup-db

# Seed with sample data
npm run seed-db
```

### 3. **Environment Configuration**
```bash
# Copy environment file
cp .env.example .env

# Edit .env with your settings
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=wedding_invitation
JWT_SECRET=your_jwt_secret
```

### 4. **Start Development**
```bash
# Start both frontend and backend
npm run start-full

# Or start separately:
npm run backend    # Backend only (port 3001)
npm run dev        # Frontend only (port 5173)
```

## 🔧 Available Scripts

### **Development**
- `npm run dev` - Start frontend development server
- `npm run backend` - Start backend API server
- `npm run start-full` - Start both frontend and backend

### **Database**
- `npm run create-db` - Create MySQL database
- `npm run setup-db` - Setup database schema
- `npm run seed-db` - Seed with sample data
- `npm run check-db` - Check database consistency

### **Tools & Utilities**
- `npm run health-check` - Check system health
- `npm run test-api` - Test all API endpoints
- `npm run add-samples` - Add sample guest data
- `npm run organize` - Organize project files

### **Build & Deploy**
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Access Points

### **🏠 Wedding Invitation**
- **Homepage**: http://localhost:5173/
- **Personal Invitation**: http://localhost:5173/main/{guest-name}
- **RSVP Form**: http://localhost:5173/rsvp/{guest-name}

### **🔐 Admin Dashboard**
- **Login**: http://localhost:5173/admin/login
- **Dashboard**: http://localhost:5173/admin
- **Guest Management**: http://localhost:5173/admin/guest-management
- **RSVP Management**: http://localhost:5173/admin/rsvp-management

### **🔧 API Endpoints**
- **Health Check**: http://localhost:3001/api/health
- **Authentication**: http://localhost:3001/api/auth/login
- **Guests API**: http://localhost:3001/api/guests
- **RSVP API**: http://localhost:3001/api/rsvp

## 🔑 Default Credentials

```
┌─────────────────────────────────────────────────────────┐
│                 ADMIN LOGIN CREDENTIALS                 │
├─────────────────────────────────────────────────────────┤
│ Username: admin     | Password: admin123  | Super Admin │
│ Username: demo      | Password: demo123   | Demo User   │
│ Username: wira      | Password: wira123   | Groom       │
│ Username: sofi      | Password: sofi123   | Bride       │
└─────────────────────────────────────────────────────────┘
```

## 📚 Documentation

Detailed documentation is available in the `docs/` folder:

- 📖 [Installation Guide](docs/INSTALLATION.md)
- 🗄️ [Database Setup](docs/DATABASE_SETUP.md)
- 🏗️ [System Overview](docs/SYSTEM_OVERVIEW.md)
- 🔗 [URL Parameters](docs/URL_PARAMETERS.md)
- 🧪 [Testing Guide](docs/TESTING_GUIDE.md)
- 📊 [System Analysis](docs/SYSTEM_ANALYSIS.md)

## 🛠️ Tech Stack

### **Frontend**
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Routing
- **Vite** - Build tool

### **Backend**
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **JWT** - Authentication
- **Multer** - File uploads
- **bcrypt** - Password hashing

### **Tools & Utilities**
- **ESLint** - Code linting
- **Concurrently** - Process management
- **AOS** - Scroll animations
- **Font Awesome** - Icons

## 🎯 Key Features

### **Dynamic Content Management**
- All wedding content is configurable through admin dashboard
- Bride & groom information, story, quotes, gallery photos
- Real-time content updates without code changes

### **Personalized Guest Experience**
- Each guest gets a personalized URL: `/main/{guest-name}`
- Guest names are automatically populated from database
- RSVP forms are pre-filled with guest information

### **Comprehensive Admin Panel**
- Complete guest management with CRUD operations
- RSVP response tracking and management
- System health monitoring and analytics
- Content management for all wedding sections

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💖 Made with Love

Created with ❤️ for Wira & Sofi's special day.

---

**Happy Wedding! 🎉💒✨**
