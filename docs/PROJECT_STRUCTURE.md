# 📁 Project Structure - Wedding Invitation System

## 🏗️ **CLEAN ARCHITECTURE OVERVIEW**

The project has been organized into a clean, modular structure that separates concerns and improves maintainability.

---

## 📂 **ROOT DIRECTORY STRUCTURE**

```
wedding-invitation/
├── 📁 backend/                 # Backend server & API
├── 📁 src/                    # Frontend React application
├── 📁 public/                 # Public static assets
├── 📁 uploads/                # File upload storage
├── 📁 docs/                   # Project documentation
├── 📁 tools/                  # Development & testing tools
├── 📁 scripts/                # Build & utility scripts
├── 📁 node_modules/           # Dependencies (auto-generated)
├── 📄 package.json            # Project configuration
├── 📄 vite.config.ts          # Build configuration
├── 📄 tsconfig.json           # TypeScript configuration
├── 📄 eslint.config.js        # Code linting rules
├── 📄 index.html              # HTML entry point
├── 📄 README.md               # Main project documentation
└── 📄 .env                    # Environment variables
```

---

## 🔧 **BACKEND STRUCTURE**

```
backend/
├── 📄 server.cjs              # Main API server (Express.js)
├── 📁 database/               # Database management
│   ├── 📄 schema.sql          # MySQL database schema
│   ├── 📄 seeder.cjs          # Data seeding script
│   ├── 📄 create.cjs          # Database creation script
│   └── 📄 setup.cjs           # Database setup script
├── 📁 scripts/                # Database utilities
│   ├── 📄 check-consistency.cjs   # Database consistency checker
│   ├── 📄 check-structure.cjs     # Table structure validator
│   └── 📄 add-sample-data.cjs     # Sample data generator
└── 📁 config/                 # Configuration files (future use)
```

### **Backend Responsibilities:**
- **server.cjs**: Express.js API server with JWT authentication
- **database/**: All database-related scripts and schema
- **scripts/**: Utility scripts for database management
- **config/**: Configuration files (reserved for future use)

---

## ⚛️ **FRONTEND STRUCTURE**

```
src/
├── 📄 App.tsx                 # Main application component
├── 📄 main.tsx                # React entry point
├── 📄 index.css               # Global styles
├── 📄 vite-env.d.ts           # Vite type definitions
├── 📁 components/             # Reusable UI components
│   ├── 📄 APIToggle.tsx       # API mode toggle
│   ├── 📄 StorageWarning.tsx  # Storage warning component
│   └── ... (other components)
├── 📁 pages/                  # Page components
│   ├── 📁 admin/              # Admin dashboard pages
│   ├── 📁 wedding/            # Wedding invitation pages
│   └── ... (other pages)
├── 📁 layouts/                # Layout components
│   ├── 📄 AdminLayout.tsx     # Admin dashboard layout
│   └── ... (other layouts)
├── 📁 contexts/               # React contexts
│   ├── 📄 WeddingContext.tsx  # Wedding data context
│   └── ... (other contexts)
├── 📁 hooks/                  # Custom React hooks
├── 📁 services/               # API service layer
│   └── 📄 apiService.ts       # API communication service
├── 📁 types/                  # TypeScript type definitions
│   └── 📄 wedding.ts          # Wedding-related types
├── 📁 utils/                  # Utility functions
│   └── 📄 storageManager.ts   # Local storage management
├── 📁 routes/                 # Routing configuration
└── 📁 assets/                 # Static assets (images, fonts, etc.)
```

### **Frontend Responsibilities:**
- **components/**: Reusable UI components
- **pages/**: Full page components
- **layouts/**: Page layout templates
- **contexts/**: Global state management
- **services/**: API communication layer
- **types/**: TypeScript type definitions
- **utils/**: Helper functions and utilities

---

## 📚 **DOCUMENTATION STRUCTURE**

```
docs/
├── 📄 INSTALLATION.md         # Installation guide
├── 📄 DATABASE_SETUP.md       # Database setup instructions
├── 📄 SYSTEM_OVERVIEW.md      # System architecture overview
├── 📄 SYSTEM_ANALYSIS.md      # Technical analysis report
├── 📄 URL_PARAMETERS.md       # URL parameter documentation
├── 📄 DYNAMIC_CONTENT.md      # Dynamic content system guide
├── 📄 TESTING_GUIDE.md        # Testing procedures
├── 📄 CLEANUP_REPORT.md       # Project cleanup report
└── 📄 PROJECT_STRUCTURE.md    # This file
```

---

## 🛠️ **TOOLS & SCRIPTS STRUCTURE**

```
tools/
├── 📄 health-check.cjs        # System health monitoring
├── 📄 test-endpoints.cjs      # API endpoint testing
└── 📄 cleanup.cjs             # Project cleanup utility

scripts/
└── 📄 organize-files.cjs      # File organization script
```

### **Tools Responsibilities:**
- **health-check.cjs**: Monitors system health and connectivity
- **test-endpoints.cjs**: Tests all API endpoints
- **cleanup.cjs**: Removes unused files and folders
- **organize-files.cjs**: Reorganizes project structure

---

## 📦 **PACKAGE.JSON SCRIPTS**

### **Development Scripts:**
```json
{
  "dev": "vite",                    // Start frontend dev server
  "backend": "node backend/server.cjs",  // Start backend server
  "start-full": "concurrently \"npm run backend\" \"npm run dev\""
}
```

### **Database Scripts:**
```json
{
  "create-db": "node backend/database/create.cjs",
  "setup-db": "node backend/database/setup.cjs",
  "seed-db": "node backend/database/seeder.cjs",
  "check-db": "node backend/scripts/check-consistency.cjs"
}
```

### **Utility Scripts:**
```json
{
  "health-check": "node tools/health-check.cjs",
  "test-api": "node tools/test-endpoints.cjs",
  "add-samples": "node backend/scripts/add-sample-data.cjs",
  "organize": "node scripts/organize-files.cjs"
}
```

---

## 🎯 **BENEFITS OF THIS STRUCTURE**

### **1. Separation of Concerns**
- **Backend**: All server-side logic in `backend/`
- **Frontend**: All client-side logic in `src/`
- **Documentation**: All docs in `docs/`
- **Tools**: All utilities in `tools/`

### **2. Improved Maintainability**
- Clear file organization
- Easy to locate specific functionality
- Logical grouping of related files

### **3. Better Development Experience**
- Intuitive folder structure
- Clear naming conventions
- Easy navigation

### **4. Scalability**
- Modular architecture
- Easy to add new features
- Clear extension points

---

## 🚀 **QUICK NAVIGATION**

### **Common Development Tasks:**

| Task | Location | Command |
|------|----------|---------|
| Start Development | Root | `npm run start-full` |
| Backend Only | `backend/` | `npm run backend` |
| Frontend Only | `src/` | `npm run dev` |
| Database Setup | `backend/database/` | `npm run setup-db` |
| Health Check | `tools/` | `npm run health-check` |
| API Testing | `tools/` | `npm run test-api` |
| Documentation | `docs/` | Open any `.md` file |

### **File Locations:**

| Component | Location |
|-----------|----------|
| API Server | `backend/server.cjs` |
| Database Schema | `backend/database/schema.sql` |
| React App | `src/App.tsx` |
| Admin Dashboard | `src/pages/admin/` |
| Wedding Pages | `src/pages/wedding/` |
| API Services | `src/services/apiService.ts` |
| Type Definitions | `src/types/wedding.ts` |

---

## 📋 **MAINTENANCE GUIDELINES**

### **Adding New Features:**
1. **Backend**: Add to appropriate `backend/` subfolder
2. **Frontend**: Add to appropriate `src/` subfolder
3. **Documentation**: Update relevant docs in `docs/`
4. **Tests**: Add utilities to `tools/` if needed

### **File Naming Conventions:**
- **Components**: PascalCase (e.g., `WeddingCard.tsx`)
- **Scripts**: kebab-case (e.g., `health-check.cjs`)
- **Documentation**: UPPERCASE (e.g., `INSTALLATION.md`)
- **Folders**: lowercase (e.g., `backend/`, `docs/`)

### **Best Practices:**
- Keep related files together
- Use descriptive folder and file names
- Maintain consistent naming conventions
- Update documentation when adding new features
- Use the provided scripts for common tasks

---

**This clean structure ensures the project remains maintainable, scalable, and easy to navigate for all developers! 🎉**
