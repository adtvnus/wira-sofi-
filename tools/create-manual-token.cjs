#!/usr/bin/env node

const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const JWT_SECRET = 'wedding-invitation-secret-key-2024';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'wedding_invitation'
};

async function createManualToken() {
  console.log('🔧 CREATING MANUAL LOGIN TOKEN\n');

  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    const connection = await mysql.createConnection(dbConfig);

    // Get admin user
    console.log('👤 Getting admin user...');
    const [users] = await connection.query(`
      SELECT id, username, email, full_name, role, is_active
      FROM admin_users 
      WHERE username = 'admin' AND is_active = TRUE
    `);

    if (users.length === 0) {
      console.log('❌ Admin user not found');
      await connection.end();
      return;
    }

    const user = users[0];
    console.log('✅ Admin user found:', user.username);

    // Generate JWT token
    console.log('🔐 Generating JWT token...');
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create session in database
    console.log('💾 Creating session in database...');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await connection.query(`
      INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `, [user.id, token, expiresAt, 'manual-creation', 'Manual Token Creation']);

    await connection.end();

    console.log('\n✅ MANUAL TOKEN CREATED SUCCESSFULLY!');
    console.log('\n📋 TOKEN INFORMATION:');
    console.log(`User: ${user.full_name} (${user.username})`);
    console.log(`Role: ${user.role}`);
    console.log(`Token: ${token}`);
    console.log(`Expires: ${expiresAt.toISOString()}`);

    console.log('\n🎯 CARA MENGGUNAKAN TOKEN:');
    console.log('1. Buka browser console di halaman admin');
    console.log('2. Jalankan script berikut:');
    console.log(`
localStorage.setItem('auth-token', '${token}');
localStorage.setItem('auth-user', JSON.stringify({
  id: ${user.id},
  username: '${user.username}',
  email: '${user.email}',
  fullName: '${user.full_name}',
  role: '${user.role}'
}));
console.log('✅ Token stored! Refresh page to login.');
    `);

    console.log('\n3. Refresh halaman admin');
    console.log('4. Anda akan otomatis login sebagai admin');

    console.log('\n🚀 AKSES ADMIN DASHBOARD:');
    console.log('   Dashboard: http://localhost:5174/admin/dashboard');
    console.log('   Settings List: http://localhost:5174/admin/wedding-settings-list');
    console.log('   Wedding Settings: http://localhost:5174/admin/wedding-settings');

  } catch (error) {
    console.error('❌ Error creating manual token:', error.message);
  }
}

createManualToken();
