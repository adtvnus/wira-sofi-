#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function createDatabase() {
  console.log('🗄️ Creating Wedding Invitation Database...\n');

  try {
    // Connect to MySQL without specifying database
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '', // Empty password for default XAMPP/WAMP setup
    });

    console.log('✅ Connected to MySQL server');

    // Create database
    console.log('📊 Creating database...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS wedding_invitation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Database "wedding_invitation" created');

    // Use the database
    await connection.query('USE wedding_invitation');

    // Read and execute migration file
    console.log('📄 Running database migration...');
    const migrationPath = path.join(__dirname, 'backend/migrations/001_create_tables.sql');

    if (!fs.existsSync(migrationPath)) {
      throw new Error('Migration file not found. Please ensure backend/migrations/001_create_tables.sql exists');
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split SQL statements and execute them
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.query(statement);
        } catch (error) {
          // Skip errors for statements that might already exist
          if (!error.message.includes('already exists')) {
            console.warn('Warning:', error.message);
          }
        }
      }
    }

    console.log('✅ Database migration completed');

    // Verify tables
    const [tables] = await connection.query("SHOW TABLES");
    console.log(`\n📋 Created ${tables.length} tables:`);
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   ✓ ${tableName}`);
    });

    await connection.end();

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n🔑 Default admin credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Email: admin@wedding.com');
    console.log('\n📋 Next steps:');
    console.log('1. Start backend: cd backend && node server.js');
    console.log('2. Start frontend: npm run dev');
    console.log('3. Open: http://localhost:5173/admin');

  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MySQL server is running');
    console.log('2. Check if you can connect: mysql -u root -p');
    console.log('3. Update credentials in this script if needed');
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  createDatabase();
}

module.exports = { createDatabase };
