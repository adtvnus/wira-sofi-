#!/usr/bin/env node

const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wedding_invitation'
};

async function testDatabaseConnection() {
  console.log('🗄️ TESTING DATABASE CONNECTION\n');

  try {
    console.log('1. 🔌 Testing database connection...');
    console.log(`   Config: ${JSON.stringify(dbConfig, null, 2)}`);
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('   ✅ Database connection successful');

    console.log('\n2. 📊 Testing admin_users table...');
    const [users] = await connection.query('SELECT id, username, full_name, role, is_active FROM admin_users');
    console.log(`   Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.full_name}) - ${user.role} - Active: ${user.is_active}`);
    });

    console.log('\n3. 🔐 Testing admin user password...');
    const [adminUsers] = await connection.query('SELECT id, username, password_hash FROM admin_users WHERE username = ?', ['admin']);
    if (adminUsers.length > 0) {
      console.log(`   ✅ Admin user found: ${adminUsers[0].username}`);
      console.log(`   Password hash: ${adminUsers[0].password_hash.substring(0, 20)}...`);
      
      // Test password verification
      const bcrypt = require('bcrypt');
      const isValid = await bcrypt.compare('admin', adminUsers[0].password_hash);
      console.log(`   Password verification: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    } else {
      console.log('   ❌ Admin user not found');
    }

    console.log('\n4. 📋 Testing wedding_settings table...');
    const [settings] = await connection.query('SELECT id, groom_full_name, bride_full_name, is_active FROM wedding_settings');
    console.log(`   Found ${settings.length} wedding settings:`);
    settings.forEach(setting => {
      console.log(`   - ID: ${setting.id}, Groom: ${setting.groom_full_name}, Bride: ${setting.bride_full_name}, Active: ${setting.is_active}`);
    });

    await connection.end();
    console.log('\n✅ Database test completed successfully!');

  } catch (error) {
    console.error('\n❌ Database test failed:', error.message);
    console.error('   Error details:', error);
  }
}

testDatabaseConnection();
