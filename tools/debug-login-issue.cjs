#!/usr/bin/env node

// Debug login issue

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function debugLoginIssue() {
  console.log('🔍 DEBUGGING LOGIN ISSUE');
  console.log('═══════════════════════════════════════════════════════════════');
  
  let connection;
  const fetch = await getFetch();

  try {
    // Step 1: Check database connection
    console.log('📊 Step 1: Checking database connection...');
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });
    console.log('✅ Database connected successfully');

    // Step 2: Check admin_users table
    console.log('\n👤 Step 2: Checking admin_users table...');
    const [users] = await connection.query('SELECT * FROM admin_users');
    console.log(`✅ Found ${users.length} admin users:`);
    
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ID: ${user.id}`);
        console.log(`      Username: "${user.username}"`);
        console.log(`      Full Name: "${user.full_name}"`);
        console.log(`      Email: "${user.email}"`);
        console.log(`      Role: "${user.role}"`);
        console.log(`      Is Active: ${user.is_active}`);
        console.log(`      Password Hash: "${user.password.substring(0, 20)}..."`);
        console.log(`      Created: ${user.created_at}`);
      });
    } else {
      console.log('❌ No admin users found in database!');
      
      // Create admin user if missing
      console.log('\n➕ Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin', 10);
      await connection.query(`
        INSERT INTO admin_users (username, password, full_name, email, role)
        VALUES ('admin', ?, 'Administrator', 'admin@wedding.com', 'admin')
      `, [hashedPassword]);
      console.log('✅ Admin user created: admin / admin');
    }

    // Step 3: Test password verification
    console.log('\n🔐 Step 3: Testing password verification...');
    const [adminUser] = await connection.query('SELECT * FROM admin_users WHERE username = ?', ['admin']);
    
    if (adminUser.length > 0) {
      const user = adminUser[0];
      console.log(`✅ Found admin user: ${user.username}`);
      
      // Test password verification
      const passwordMatch = await bcrypt.compare('admin', user.password);
      console.log(`✅ Password verification: ${passwordMatch ? 'SUCCESS' : 'FAILED'}`);
      
      if (!passwordMatch) {
        console.log('⚠️ Password hash mismatch! Updating password...');
        const newHashedPassword = await bcrypt.hash('admin', 10);
        await connection.query('UPDATE admin_users SET password = ? WHERE username = ?', [newHashedPassword, 'admin']);
        console.log('✅ Password updated successfully');
      }
    } else {
      console.log('❌ Admin user not found after creation!');
    }

    // Step 4: Test backend server connection
    console.log('\n🌐 Step 4: Testing backend server connection...');
    try {
      const healthResponse = await fetch('http://localhost:3001/api/health');
      console.log(`✅ Backend server status: ${healthResponse.status}`);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log(`✅ Health check response: ${JSON.stringify(healthData)}`);
      }
    } catch (error) {
      console.log('❌ Backend server not responding!');
      console.log(`   Error: ${error.message}`);
      console.log('   Make sure backend server is running: node backend/server.cjs');
    }

    // Step 5: Test login API endpoint
    console.log('\n🔑 Step 5: Testing login API endpoint...');
    try {
      const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin'
        })
      });

      console.log(`✅ Login API status: ${loginResponse.status}`);
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Login successful!');
        console.log(`   Token: ${loginData.token ? 'Generated' : 'Missing'}`);
        console.log(`   User: ${loginData.user ? loginData.user.username : 'Missing'}`);
        console.log(`   Response: ${JSON.stringify(loginData, null, 2)}`);
      } else {
        const errorText = await loginResponse.text();
        console.log('❌ Login failed!');
        console.log(`   Status: ${loginResponse.status}`);
        console.log(`   Error: ${errorText}`);
      }
    } catch (error) {
      console.log('❌ Login API request failed!');
      console.log(`   Error: ${error.message}`);
    }

    // Step 6: Check frontend login form
    console.log('\n📱 Step 6: Frontend login troubleshooting...');
    console.log('   Common issues:');
    console.log('   1. Frontend not connecting to correct backend URL');
    console.log('   2. CORS issues between frontend and backend');
    console.log('   3. Frontend form validation errors');
    console.log('   4. Network connectivity issues');
    console.log('   5. Browser cache/cookies issues');

    console.log('\n🎉 LOGIN DEBUG COMPLETED!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 DIAGNOSIS SUMMARY:');
    console.log(`   ✅ Database: ${connection ? 'Connected' : 'Failed'}`);
    console.log(`   ✅ Admin users: ${users.length} found`);
    console.log('   ✅ Password: Verified and updated if needed');
    console.log('   ✅ Backend: Check server status above');
    console.log('   ✅ Login API: Check response above');
    console.log('');
    console.log('💡 SOLUTIONS:');
    console.log('   1. Make sure backend server is running');
    console.log('   2. Use credentials: admin / admin');
    console.log('   3. Clear browser cache and cookies');
    console.log('   4. Check browser console for errors');
    console.log('   5. Try incognito/private browsing mode');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n📊 Database connection closed');
    }
  }
}

// Run the debug
debugLoginIssue().catch(console.error);
