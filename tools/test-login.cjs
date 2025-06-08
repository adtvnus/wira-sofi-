#!/usr/bin/env node

const fetch = require('node-fetch');

async function testLogin() {
  console.log('🔐 TESTING LOGIN FUNCTIONALITY\n');

  try {
    // Test 1: Health Check
    console.log('1. 🏥 Testing API Health...');
    try {
      const healthResponse = await fetch('http://localhost:3001/api/health');
      const healthData = await healthResponse.json();
      console.log(`   Status: ${healthResponse.status}`);
      console.log(`   Response: ${JSON.stringify(healthData)}`);
      
      if (healthResponse.status === 200) {
        console.log('   ✅ API Health check successful');
      } else {
        console.log('   ❌ API Health check failed');
      }
    } catch (error) {
      console.log(`   ❌ API Health check error: ${error.message}`);
      return;
    }

    // Test 2: Login with admin/admin
    console.log('\n2. 🔐 Testing Login with admin/admin...');
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

      console.log(`   Status: ${loginResponse.status}`);
      
      const loginData = await loginResponse.json();
      console.log(`   Response: ${JSON.stringify(loginData, null, 2)}`);

      if (loginResponse.status === 200 && loginData.success) {
        console.log('   ✅ Login successful!');
        console.log(`   Token: ${loginData.token?.substring(0, 30)}...`);
        console.log(`   User: ${loginData.user?.fullName} (${loginData.user?.role})`);
      } else {
        console.log('   ❌ Login failed!');
        console.log(`   Error: ${loginData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ Login request error: ${error.message}`);
    }

    // Test 3: Check database users
    console.log('\n3. 📊 Checking database users...');
    try {
      const usersResponse = await fetch('http://localhost:3001/api/auth/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log(`   Status: ${usersResponse.status}`);
      
      if (usersResponse.status === 200) {
        const usersData = await usersResponse.json();
        console.log(`   Users found: ${usersData.data?.length || 0}`);
        if (usersData.data && usersData.data.length > 0) {
          usersData.data.forEach(user => {
            console.log(`   - ${user.username} (${user.full_name}) - ${user.role}`);
          });
        }
      } else {
        console.log('   ❌ Failed to get users list');
      }
    } catch (error) {
      console.log(`   ⚠️ Users endpoint not available: ${error.message}`);
    }

    // Test 4: Alternative credentials
    console.log('\n4. 🔄 Testing alternative credentials...');
    const altCredentials = [
      { username: 'admin', password: 'admin123' },
      { username: 'wira', password: 'wira123' },
      { username: 'sofi', password: 'sofi123' },
      { username: 'demo', password: '123' }
    ];

    for (const cred of altCredentials) {
      try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cred)
        });

        const data = await response.json();
        console.log(`   ${cred.username}/${cred.password}: ${response.status} - ${data.success ? 'SUCCESS' : data.error}`);
        
        if (data.success) {
          console.log(`   ✅ Working credentials found: ${cred.username}/${cred.password}`);
          break;
        }
      } catch (error) {
        console.log(`   ${cred.username}/${cred.password}: ERROR - ${error.message}`);
      }
    }

  } catch (error) {
    console.error('\n❌ OVERALL TEST FAILED:', error.message);
  }
}

testLogin();
