#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  } else {
    console.log(`📁 Directory already exists: ${dirPath}`);
  }
}

function moveFile(source, destination) {
  try {
    if (fs.existsSync(source)) {
      // Create destination directory if it doesn't exist
      const destDir = path.dirname(destination);
      createDirectory(destDir);
      
      fs.renameSync(source, destination);
      console.log(`✅ Moved: ${source} → ${destination}`);
      return true;
    } else {
      console.log(`⚠️ File not found: ${source}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Failed to move ${source}: ${error.message}`);
    return false;
  }
}

console.log('🗂️ Organizing Wedding Invitation Project Files...\n');

// Create main directories
const directories = [
  'backend',
  'backend/scripts',
  'backend/database',
  'backend/config',
  'docs',
  'scripts',
  'tools'
];

console.log('📁 Creating directory structure:');
directories.forEach(createDirectory);

// File organization mapping
const fileMovements = [
  // Backend files
  { from: 'api-server-auth.cjs', to: 'backend/server.cjs' },
  
  // Database files
  { from: 'database-schema.sql', to: 'backend/database/schema.sql' },
  { from: 'database-seeder.cjs', to: 'backend/database/seeder.cjs' },
  { from: 'create-database.cjs', to: 'backend/database/create.cjs' },
  { from: 'setup-database.cjs', to: 'backend/database/setup.cjs' },
  
  // Database tools
  { from: 'check-database-consistency.cjs', to: 'backend/scripts/check-consistency.cjs' },
  { from: 'check-table-structure.cjs', to: 'backend/scripts/check-structure.cjs' },
  { from: 'add-sample-guests.cjs', to: 'backend/scripts/add-sample-data.cjs' },
  
  // System tools
  { from: 'system-health-check.cjs', to: 'tools/health-check.cjs' },
  { from: 'test-all-endpoints.cjs', to: 'tools/test-endpoints.cjs' },
  { from: 'cleanup-unused-folders.cjs', to: 'tools/cleanup.cjs' },
  
  // Documentation
  { from: 'INSTALLATION_GUIDE.md', to: 'docs/INSTALLATION.md' },
  { from: 'MYSQL_SETUP_README.md', to: 'docs/DATABASE_SETUP.md' },
  { from: 'SYSTEM-ANALYSIS-REPORT.md', to: 'docs/SYSTEM_ANALYSIS.md' },
  { from: 'CLEANUP-REPORT.md', to: 'docs/CLEANUP_REPORT.md' },
  { from: 'URL_PARAMETER_GUIDE.md', to: 'docs/URL_PARAMETERS.md' },
  { from: 'WEDDING_DYNAMIC_SYSTEM.md', to: 'docs/SYSTEM_OVERVIEW.md' },
  { from: 'BRIDE_GROOM_DYNAMIC_SYSTEM.md', to: 'docs/DYNAMIC_CONTENT.md' },
  { from: 'TESTING_ANALYSIS_README.md', to: 'docs/TESTING_GUIDE.md' }
];

console.log('\n📦 Moving files to organized structure:');
let movedCount = 0;
let totalCount = fileMovements.length;

fileMovements.forEach(movement => {
  if (moveFile(movement.from, movement.to)) {
    movedCount++;
  }
});

console.log('\n📊 File Organization Summary:');
console.log(`   📁 Directories created: ${directories.length}`);
console.log(`   📄 Files moved: ${movedCount}/${totalCount}`);

console.log('\n🎯 New Project Structure:');
console.log(`
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
├── 📁 public/                 # Public assets
├── 📁 uploads/                # File uploads
├── 📁 docs/                   # Documentation
│   ├── INSTALLATION.md
│   ├── DATABASE_SETUP.md
│   ├── SYSTEM_ANALYSIS.md
│   └── ... (other docs)
├── 📁 tools/                  # Development tools
│   ├── health-check.cjs
│   ├── test-endpoints.cjs
│   └── cleanup.cjs
├── 📁 scripts/                # Build & utility scripts
├── package.json               # Dependencies
├── vite.config.ts             # Build configuration
└── .env                       # Environment variables
`);

console.log('\n✨ Project organization completed!');
console.log('\n🚀 Updated commands:');
console.log('   Backend: node backend/server.cjs');
console.log('   Seeder: node backend/database/seeder.cjs');
console.log('   Health: node tools/health-check.cjs');
console.log('   Frontend: npm run dev');

console.log('\n📋 Next steps:');
console.log('   1. Update package.json scripts');
console.log('   2. Update documentation references');
console.log('   3. Test all functionality');
console.log('   4. Commit organized structure');
