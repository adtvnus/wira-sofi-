#!/usr/bin/env node

// Debug invalid credentials issue

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function debugInvalidCredentials() {
  console.log('🔍 DEBUGGING INVALID CREDENTIALS ISSUE');
  console.log('═══════════════════════════════════════════════════════════════');
  
  let connection;
  const fetch = await getFetch();

  try {
    // Step 1: Check database admin user
    console.log('📊 Step 1: Checking database admin user...');
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    const [users] = await connection.query('SELECT * FROM admin_users WHERE username = ?', ['admin']);
    
    if (users.length === 0) {
      console.log('❌ Admin user not found! Creating new admin user...');
      
      const hashedPassword = await bcrypt.hash('admin', 10);
      await connection.query(`
        INSERT INTO admin_users (username, password, full_name, email, role, is_active)
        VALUES ('admin', ?, 'Administrator', 'admin@wedding.com', 'admin', TRUE)
      `, [hashedPassword]);
      
      console.log('✅ Admin user created successfully');
    } else {
      const user = users[0];
      console.log('✅ Admin user found:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: "${user.username}"`);
      console.log(`   Full Name: "${user.full_name}"`);
      console.log(`   Email: "${user.email}"`);
      console.log(`   Role: "${user.role}"`);
      console.log(`   Is Active: ${user.is_active}`);
      console.log(`   Password Hash: "${user.password.substring(0, 30)}..."`);
      
      // Test password verification
      console.log('\n🔐 Testing password verification...');
      const passwordTests = ['admin', 'Admin', 'ADMIN', '123', 'password'];
      
      for (const testPassword of passwordTests) {
        const isValid = await bcrypt.compare(testPassword, user.password);
        console.log(`   Password "${testPassword}": ${isValid ? '✅ VALID' : '❌ Invalid'}`);
      }
    }

    // Step 2: Test login API with different credentials
    console.log('\n🔑 Step 2: Testing login API with different credentials...');
    
    const credentialTests = [
      { username: 'admin', password: 'admin' },
      { username: 'Admin', password: 'admin' },
      { username: 'admin', password: 'Admin' },
      { username: 'admin@wedding.com', password: 'admin' },
      { username: ' admin ', password: ' admin ' }, // with spaces
    ];

    for (const creds of credentialTests) {
      console.log(`\n   Testing: "${creds.username}" / "${creds.password}"`);
      
      try {
        const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: creds.username,
            password: creds.password
          })
        });

        console.log(`   Status: ${loginResponse.status}`);
        
        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          console.log('   ✅ LOGIN SUCCESS!');
          console.log(`   Token: ${loginData.token ? 'Generated' : 'Missing'}`);
          console.log(`   User: ${loginData.user ? loginData.user.username : 'Missing'}`);
        } else {
          const errorText = await loginResponse.text();
          console.log('   ❌ Login failed');
          console.log(`   Error: ${errorText}`);
        }
      } catch (error) {
        console.log('   ❌ Request failed');
        console.log(`   Error: ${error.message}`);
      }
    }

    // Step 3: Check backend server logs
    console.log('\n📋 Step 3: Backend server debugging tips...');
    console.log('   1. Check backend console for login attempt logs');
    console.log('   2. Look for "🔐 Login attempt:" messages');
    console.log('   3. Check for "👤 Looking for user:" messages');
    console.log('   4. Verify "🔐 Verifying password..." results');
    console.log('   5. Check for any database connection errors');

    // Step 4: Frontend debugging tips
    console.log('\n📱 Step 4: Frontend debugging tips...');
    console.log('   1. Open browser developer tools (F12)');
    console.log('   2. Go to Network tab');
    console.log('   3. Try login and check the request to /api/auth/login');
    console.log('   4. Check request payload and response');
    console.log('   5. Look for any CORS errors in console');

    // Step 5: Reset admin password if needed
    console.log('\n🔄 Step 5: Resetting admin password to ensure it works...');
    const newHashedPassword = await bcrypt.hash('admin', 10);
    await connection.query('UPDATE admin_users SET password = ? WHERE username = ?', [newHashedPassword, 'admin']);
    console.log('✅ Admin password reset to "admin"');

    // Step 6: Final test
    console.log('\n🎯 Step 6: Final login test...');
    const finalResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin'
      })
    });

    console.log(`Final test status: ${finalResponse.status}`);
    
    if (finalResponse.ok) {
      const finalData = await finalResponse.json();
      console.log('🎉 FINAL TEST: LOGIN SUCCESS!');
      console.log(`Token: ${finalData.token ? 'Generated' : 'Missing'}`);
      console.log(`User: ${finalData.user ? finalData.user.username : 'Missing'}`);
    } else {
      const errorText = await finalResponse.text();
      console.log('❌ FINAL TEST: Login still failed');
      console.log(`Error: ${errorText}`);
    }

    console.log('\n🎉 INVALID CREDENTIALS DEBUG COMPLETED!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 SUMMARY:');
    console.log('   ✅ Database admin user verified/created');
    console.log('   ✅ Password hash verified/reset');
    console.log('   ✅ Multiple credential combinations tested');
    console.log('   ✅ Backend API tested directly');
    console.log('');
    console.log('💡 NEXT STEPS:');
    console.log('   1. Try login with: admin / admin');
    console.log('   2. Clear browser cache and cookies');
    console.log('   3. Try incognito/private browsing mode');
    console.log('   4. Check browser console for errors');
    console.log('   5. Check backend console for detailed logs');
    console.log('');
    console.log('🔧 IF STILL FAILING:');
    console.log('   1. Restart backend server');
    console.log('   2. Restart frontend server');
    console.log('   3. Check if ports 3001 and 5174 are accessible');
    console.log('   4. Verify no firewall blocking connections');

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
debugInvalidCredentials().catch(console.error);
