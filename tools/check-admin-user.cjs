#!/usr/bin/env node

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function checkAdminUser() {
  console.log('👤 Checking Admin User in Database...\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
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
      
      const adminPassword = 'admin';
      const passwordHash = await bcrypt.hash(adminPassword, 10);

      const [result] = await connection.query(`
        INSERT INTO admin_users (username, email, password_hash, full_name, role, is_active)
        VALUES (?, ?, ?, ?, ?, TRUE)
      `, ['admin', 'admin@wedding.com', passwordHash, 'Super Admin', 'super_admin']);

      console.log(`✅ Admin user created with ID: ${result.insertId}`);
    } else {
      // Test password for admin user
      const adminUser = users.find(u => u.username === 'admin');
      if (adminUser) {
        console.log('\n🔐 Testing admin password...');
        const isValidPassword = await bcrypt.compare('admin', adminUser.password_hash);
        console.log(`   Password valid: ${isValidPassword ? '✅ YES' : '❌ NO'}`);
        
        if (!isValidPassword) {
          console.log('🔧 Fixing admin password...');
          const newPasswordHash = await bcrypt.hash('admin', 10);
          await connection.query(`
            UPDATE admin_users 
            SET password_hash = ? 
            WHERE username = 'admin'
          `, [newPasswordHash]);
          console.log('✅ Admin password fixed');
        }
      } else {
        console.log('\n❌ Admin user not found! Creating...');
        const adminPassword = 'admin';
        const passwordHash = await bcrypt.hash(adminPassword, 10);

        const [result] = await connection.query(`
          INSERT INTO admin_users (username, email, password_hash, full_name, role, is_active)
          VALUES (?, ?, ?, ?, ?, TRUE)
        `, ['admin', 'admin@wedding.com', passwordHash, 'Super Admin', 'super_admin']);

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
    console.log('   Username: admin');
    console.log('   Password: admin');

  } catch (error) {
    console.error('\n❌ Check failed:', error.message);
    process.exit(1);
  }
}

checkAdminUser();
