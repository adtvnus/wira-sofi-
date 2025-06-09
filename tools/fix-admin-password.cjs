#!/usr/bin/env node

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function fixAdminPassword() {
  console.log('🔧 FIXING ADMIN PASSWORD ISSUE\n');

  try {
    // Connect to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // 1. Check current admin users
    console.log('\n1. 📊 Checking current admin users...');
    const [users] = await connection.query(`
      SELECT id, username, email, full_name, role, is_active, created_at
      FROM admin_users 
      WHERE username = 'admin' OR email = 'admin@wedding.com'
    `);

    console.log(`Found ${users.length} admin users:`);
    users.forEach(user => {
      console.log(`   - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Active: ${user.is_active}`);
    });

    // 2. Hash new password
    console.log('\n2. 🔐 Generating new password hash...');
    const newPassword = 'admin';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log(`   New password: "${newPassword}"`);
    console.log(`   Hashed: ${hashedPassword.substring(0, 20)}...`);

    // 3. Update admin password
    console.log('\n3. 🔄 Updating admin password...');
    const [updateResult] = await connection.query(`
      UPDATE admin_users 
      SET password_hash = ?, updated_at = NOW()
      WHERE username = 'admin'
    `, [hashedPassword]);

    console.log(`   Rows affected: ${updateResult.affectedRows}`);

    // 4. Verify the update
    console.log('\n4. ✅ Verifying password update...');
    const [updatedUsers] = await connection.query(`
      SELECT id, username, password_hash, updated_at
      FROM admin_users 
      WHERE username = 'admin'
    `);

    if (updatedUsers.length > 0) {
      const user = updatedUsers[0];
      console.log(`   User ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Password hash: ${user.password_hash.substring(0, 20)}...`);
      console.log(`   Updated at: ${user.updated_at}`);

      // Test password verification
      const isValid = await bcrypt.compare(newPassword, user.password_hash);
      console.log(`   Password verification test: ${isValid ? '✅ PASS' : '❌ FAIL'}`);
    }

    // 5. If no admin user exists, create one
    if (users.length === 0) {
      console.log('\n5. 👤 No admin user found, creating new admin...');
      await connection.query(`
        INSERT INTO admin_users (username, email, password_hash, full_name, role, is_active)
        VALUES ('admin', 'admin@wedding.com', ?, 'Super Admin', 'super_admin', TRUE)
      `, [hashedPassword]);
      console.log('   ✅ New admin user created');
    }

    await connection.end();

    console.log('\n🎉 ADMIN PASSWORD FIX COMPLETED!');
    console.log('\n🔑 Login Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin');
    console.log('\n📍 Try logging in at: http://localhost:5174/admin/login');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure MySQL is running');
    console.log('   2. Check database connection settings in .env');
    console.log('   3. Verify database exists: wedding_invitation');
    console.log('   4. Check if admin_users table exists');
    process.exit(1);
  }
}

fixAdminPassword();
