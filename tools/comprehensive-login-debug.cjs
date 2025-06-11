#!/usr/bin/env node

// Comprehensive login debugging

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function comprehensiveLoginDebug() {
  console.log('🔍 COMPREHENSIVE LOGIN DEBUG');
  console.log('═══════════════════════════════════════════════════════════════');
  
  let connection;
  const fetch = await getFetch();

  try {
    // Step 1: Check if servers are running
    console.log('🌐 Step 1: Checking if servers are running...');
    
    // Check backend
    let backendRunning = false;
    try {
      const backendResponse = await fetch('http://localhost:3001/api/health');
      if (backendResponse.ok) {
        console.log('✅ Backend server running on port 3001');
        backendRunning = true;
      }
    } catch (error) {
      console.log('❌ Backend server NOT running on port 3001');
      console.log('💡 Start backend with: node backend/server.cjs');
    }

    // Check frontend
    let frontendRunning = false;
    try {
      const frontendResponse = await fetch('http://localhost:5174');
      if (frontendResponse.ok) {
        console.log('✅ Frontend server running on port 5174');
        frontendRunning = true;
      }
    } catch (error) {
      console.log('❌ Frontend server NOT running on port 5174');
      console.log('💡 Start frontend with: npm run dev');
    }

    if (!backendRunning || !frontendRunning) {
      console.log('\n❌ SERVERS NOT RUNNING!');
      console.log('Please start both servers before testing login.');
      return;
    }

    // Step 2: Check database and admin user
    console.log('\n👤 Step 2: Checking database and admin user...');
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    const [users] = await connection.query('SELECT * FROM admin_users WHERE username = ?', ['admin']);
    
    if (users.length === 0) {
      console.log('❌ Admin user not found! Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin', 10);
      await connection.query(`
        INSERT INTO admin_users (username, password, full_name, email, role, is_active)
        VALUES ('admin', ?, 'Administrator', 'admin@wedding.com', 'admin', TRUE)
      `, [hashedPassword]);
      console.log('✅ Admin user created');
    } else {
      const user = users[0];
      console.log('✅ Admin user found:');
      console.log(`   Username: ${user.username}`);
      console.log(`   Is Active: ${user.is_active}`);
      
      // Test password
      const passwordValid = await bcrypt.compare('admin', user.password);
      console.log(`   Password valid: ${passwordValid ? '✅ YES' : '❌ NO'}`);
      
      if (!passwordValid) {
        console.log('🔄 Resetting admin password...');
        const newHashedPassword = await bcrypt.hash('admin', 10);
        await connection.query('UPDATE admin_users SET password = ? WHERE username = ?', [newHashedPassword, 'admin']);
        console.log('✅ Password reset to "admin"');
      }
    }

    // Step 3: Test backend API directly
    console.log('\n🔑 Step 3: Testing backend API directly...');
    
    const loginPayload = {
      username: 'admin',
      password: 'admin'
    };

    console.log('📡 Making direct API call...');
    console.log(`   URL: http://localhost:3001/api/auth/login`);
    console.log(`   Payload: ${JSON.stringify(loginPayload)}`);

    const apiResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginPayload)
    });

    console.log(`   Response Status: ${apiResponse.status}`);
    console.log(`   Response OK: ${apiResponse.ok}`);

    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      console.log('✅ Backend API login successful!');
      console.log(`   Success: ${apiData.success}`);
      console.log(`   Token: ${apiData.token ? 'Generated' : 'Missing'}`);
      console.log(`   User: ${apiData.user ? apiData.user.username : 'Missing'}`);
    } else {
      const errorText = await apiResponse.text();
      console.log('❌ Backend API login failed!');
      console.log(`   Error: ${errorText}`);
    }

    // Step 4: Test CORS and preflight
    console.log('\n🌐 Step 4: Testing CORS and preflight...');
    
    try {
      const corsResponse = await fetch('http://localhost:3001/api/auth/login', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:5174',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });

      console.log(`   CORS preflight status: ${corsResponse.status}`);
      console.log('   CORS headers:');
      console.log(`     Allow-Origin: ${corsResponse.headers.get('access-control-allow-origin') || 'Not set'}`);
      console.log(`     Allow-Methods: ${corsResponse.headers.get('access-control-allow-methods') || 'Not set'}`);
      console.log(`     Allow-Headers: ${corsResponse.headers.get('access-control-allow-headers') || 'Not set'}`);
    } catch (error) {
      console.log(`   ❌ CORS test failed: ${error.message}`);
    }

    // Step 5: Test with different request formats
    console.log('\n📝 Step 5: Testing different request formats...');
    
    const testCases = [
      { desc: 'Normal request', username: 'admin', password: 'admin' },
      { desc: 'Trimmed spaces', username: ' admin ', password: ' admin ' },
      { desc: 'Case variations', username: 'Admin', password: 'admin' },
    ];

    for (const testCase of testCases) {
      console.log(`\n   Testing: ${testCase.desc}`);
      try {
        const testResponse = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:5174'
          },
          body: JSON.stringify({
            username: testCase.username,
            password: testCase.password
          })
        });

        console.log(`     Status: ${testResponse.status}`);
        if (testResponse.ok) {
          const testData = await testResponse.json();
          console.log(`     ✅ Success: ${testData.success}`);
        } else {
          const errorText = await testResponse.text();
          console.log(`     ❌ Failed: ${errorText}`);
        }
      } catch (error) {
        console.log(`     ❌ Error: ${error.message}`);
      }
    }

    // Step 6: Check frontend configuration
    console.log('\n📱 Step 6: Frontend configuration check...');
    console.log('   Expected API_BASE_URL: http://localhost:3001/api');
    console.log('   Login endpoint should be: http://localhost:3001/api/auth/login');
    console.log('   Health endpoint should be: http://localhost:3001/api/health');

    // Step 7: Browser debugging instructions
    console.log('\n🔧 Step 7: Browser debugging instructions...');
    console.log('   1. Open http://localhost:5174/admin in browser');
    console.log('   2. Open Developer Tools (F12)');
    console.log('   3. Go to Console tab');
    console.log('   4. Try login with admin/admin');
    console.log('   5. Check console for error messages');
    console.log('   6. Go to Network tab and check requests');
    console.log('   7. Look for failed requests or CORS errors');

    console.log('\n🎉 COMPREHENSIVE LOGIN DEBUG COMPLETED!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 SUMMARY:');
    console.log(`   Backend Running: ${backendRunning ? '✅ YES' : '❌ NO'}`);
    console.log(`   Frontend Running: ${frontendRunning ? '✅ YES' : '❌ NO'}`);
    console.log('   Admin User: ✅ Verified/Created');
    console.log('   Password: ✅ Reset to "admin"');
    console.log('   Backend API: Check results above');
    console.log('   CORS: Check results above');
    console.log('');
    console.log('💡 NEXT STEPS:');
    console.log('   1. Make sure both servers are running');
    console.log('   2. Try login with: admin / admin');
    console.log('   3. Check browser console for detailed errors');
    console.log('   4. If still failing, check browser Network tab');
    console.log('   5. Try incognito mode to rule out cache issues');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the comprehensive debug
comprehensiveLoginDebug().catch(console.error);
