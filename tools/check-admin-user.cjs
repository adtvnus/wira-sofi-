#!/usr/bin/env node

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function checkAdminUser() {
  console.log('👤 Checking Admin User in Database...\n');

  // Get admin credentials from environment variables
  const adminUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin';
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@wedding-invitation.com';
  const adminFullName = process.env.DEFAULT_ADMIN_FULLNAME || 'Wedding Administrator';

  console.log(`🔧 Using admin credentials from environment:`);
  console.log(`   Username: ${adminUsername}`);
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Full Name: ${adminFullName}\n`);

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // Check admin users
    console.log('🔍 Checking admin users...');
    const [users] = await connection.query('SELECT * FROM admin_users');
    
    console.log(`📊 Found ${users.length} admin users:`);
    for (const user of users) {
      console.log(`   👤 ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}, Active: ${user.is_active}`);
    }

    if (users.length === 0) {
      console.log('\n❌ No admin users found! Creating admin user...');

      const passwordHash = await bcrypt.hash(adminPassword, 10);

      const [result] = await connection.query(`
        INSERT INTO admin_users (username, email, password_hash, full_name, role, is_active)
        VALUES (?, ?, ?, ?, ?, TRUE)
      `, [adminUsername, adminEmail, passwordHash, adminFullName, 'super_admin']);

      console.log(`✅ Admin user created with ID: ${result.insertId}`);
    } else {
      // Test password for admin user
      const adminUser = users.find(u => u.username === adminUsername);
      if (adminUser) {
        console.log('\n🔐 Testing admin password...');
        const isValidPassword = await bcrypt.compare(adminPassword, adminUser.password_hash);
        console.log(`   Password valid: ${isValidPassword ? '✅ YES' : '❌ NO'}`);

        if (!isValidPassword) {
          console.log('🔧 Fixing admin password...');
          const newPasswordHash = await bcrypt.hash(adminPassword, 10);
          await connection.query(`
            UPDATE admin_users
            SET password_hash = ?, email = ?, full_name = ?
            WHERE username = ?
          `, [newPasswordHash, adminEmail, adminFullName, adminUsername]);
          console.log('✅ Admin password and details updated');
        }
      } else {
        console.log('\n❌ Admin user not found! Creating...');
        const passwordHash = await bcrypt.hash(adminPassword, 10);

        const [result] = await connection.query(`
          INSERT INTO admin_users (username, email, password_hash, full_name, role, is_active)
          VALUES (?, ?, ?, ?, ?, TRUE)
        `, [adminUsername, adminEmail, passwordHash, adminFullName, 'super_admin']);

        console.log(`✅ Admin user created with ID: ${result.insertId}`);
      }
    }

    // Check wedding settings
    console.log('\n💒 Checking wedding settings...');
    const [settings] = await connection.query('SELECT * FROM wedding_settings WHERE is_active = TRUE');
    console.log(`📊 Found ${settings.length} active wedding settings`);
    
    if (settings.length > 0) {
      const setting = settings[0];
      console.log(`   💑 Couple: ${setting.groom_first_name} & ${setting.bride_first_name}`);
      console.log(`   📅 Date: ${setting.wedding_date}`);
      console.log(`   📍 Venue: ${setting.wedding_venue}`);
    }

    await connection.end();

    console.log('\n🎉 Admin user check completed!');
    console.log('\n🔑 Login Credentials:');
    console.log(`   Username: ${adminUsername}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('   ⚠️  CHANGE THESE IN PRODUCTION!');

  } catch (error) {
    console.error('\n❌ Check failed:', error.message);
    process.exit(1);
  }
}

checkAdminUser();
