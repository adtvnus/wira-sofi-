#!/usr/bin/env node

// Secure Admin Setup Script
// This script creates admin user using environment variables

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function getConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'wedding_invitation'
  });
}

async function setupSecureAdmin() {
  console.log('🔒 SECURE ADMIN SETUP');
  console.log('═══════════════════════════════════════════════════════');
  
  try {
    // Get admin credentials from environment
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminFullName = process.env.ADMIN_FULL_NAME;
    
    if (!adminUsername || !adminPassword) {
      console.log('❌ Error: ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env file');
      process.exit(1);
    }
    
    console.log('📋 Admin Configuration:');
    console.log(`   Username: ${adminUsername}`);
    console.log(`   Email: ${adminEmail || 'Not set'}`);
    console.log(`   Full Name: ${adminFullName || 'Not set'}`);
    console.log(`   Password: ${'*'.repeat(adminPassword.length)} (${adminPassword.length} characters)`);
    
    // Validate password strength
    if (adminPassword.length < 8) {
      console.log('❌ Error: Password must be at least 8 characters long');
      process.exit(1);
    }
    
    const connection = await getConnection();
    console.log('✅ Database connection established');
    
    // Check if admin_users table exists
    const [tables] = await connection.query(`
      SHOW TABLES LIKE 'admin_users'
    `);
    
    if (tables.length === 0) {
      console.log('📋 Creating admin_users table...');
      await connection.query(`
        CREATE TABLE admin_users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(100),
          role ENUM('admin', 'moderator') DEFAULT 'admin',
          is_active BOOLEAN DEFAULT TRUE,
          last_login TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ admin_users table created');
    }
    
    // Check if admin user already exists
    const [existingUsers] = await connection.query(`
      SELECT id, username, email FROM admin_users WHERE username = ? OR email = ?
    `, [adminUsername, adminEmail]);
    
    if (existingUsers.length > 0) {
      console.log('⚠️ Admin user already exists. Updating password...');
      
      // Hash new password
      const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(adminPassword, bcryptRounds);
      
      // Update existing user
      await connection.query(`
        UPDATE admin_users 
        SET password_hash = ?, 
            email = COALESCE(?, email),
            full_name = COALESCE(?, full_name),
            updated_at = NOW()
        WHERE username = ?
      `, [hashedPassword, adminEmail, adminFullName, adminUsername]);
      
      console.log('✅ Admin user updated successfully');
    } else {
      console.log('👤 Creating new admin user...');
      
      // Hash password
      const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(adminPassword, bcryptRounds);
      
      // Create new admin user
      const [result] = await connection.query(`
        INSERT INTO admin_users (username, email, password_hash, full_name, role, is_active)
        VALUES (?, ?, ?, ?, 'admin', TRUE)
      `, [adminUsername, adminEmail, hashedPassword, adminFullName]);
      
      console.log(`✅ Admin user created with ID: ${result.insertId}`);
    }
    
    // Test login with new credentials
    console.log('\n🧪 Testing admin login...');
    const [testUsers] = await connection.query(`
      SELECT id, username, password_hash FROM admin_users WHERE username = ?
    `, [adminUsername]);
    
    if (testUsers.length > 0) {
      const isValidPassword = await bcrypt.compare(adminPassword, testUsers[0].password_hash);
      if (isValidPassword) {
        console.log('✅ Login test successful');
      } else {
        console.log('❌ Login test failed - password mismatch');
      }
    }
    
    await connection.end();
    
    console.log('\n🎉 SECURE ADMIN SETUP COMPLETED');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Admin user configured securely');
    console.log('✅ Password hashed with bcrypt');
    console.log('✅ No hardcoded credentials in code');
    console.log('✅ Environment variables used');
    console.log('\n🔐 Security Notes:');
    console.log('   • Change default password after first login');
    console.log('   • Keep .env file secure and never commit to git');
    console.log('   • Use strong passwords in production');
    console.log('   • Consider enabling 2FA for production');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setupSecureAdmin();
