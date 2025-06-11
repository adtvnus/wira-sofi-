#!/usr/bin/env node

// Test login fix after correcting double /api issue

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function testLoginFix() {
  console.log('🧪 TESTING LOGIN FIX AFTER CORRECTING DOUBLE /API ISSUE');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const fetch = await getFetch();

  try {
    // Test the corrected URLs
    console.log('📡 Testing corrected API endpoints...');
    
    const API_BASE_URL = 'http://localhost:3001/api';
    
    // Test health endpoint
    console.log('\n🏥 Testing health endpoint...');
    console.log(`   URL: ${API_BASE_URL}/health`);
    
    try {
      const healthResponse = await fetch(`${API_BASE_URL}/health`);
      console.log(`   Status: ${healthResponse.status}`);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('   ✅ Health check successful');
        console.log(`   Server: ${healthData.server || 'Unknown'}`);
        console.log(`   Message: ${healthData.message || 'No message'}`);
      } else {
        console.log('   ❌ Health check failed');
      }
    } catch (error) {
      console.log(`   ❌ Health check error: ${error.message}`);
    }

    // Test login endpoint
    console.log('\n🔑 Testing login endpoint...');
    console.log(`   URL: ${API_BASE_URL}/auth/login`);
    
    try {
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          username: 'admin',
          password: 'admin'
        })
      });

      console.log(`   Status: ${loginResponse.status}`);
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('   ✅ Login successful');
        console.log(`   Token: ${loginData.token ? 'Generated' : 'Missing'}`);
        console.log(`   User: ${loginData.user ? loginData.user.username : 'Missing'}`);
        console.log(`   Success flag: ${loginData.success}`);
      } else {
        const errorData = await loginResponse.json();
        console.log('   ❌ Login failed');
        console.log(`   Error: ${errorData.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Login error: ${error.message}`);
    }

    // Test wrong URLs (what was happening before)
    console.log('\n❌ Testing wrong URLs (what was happening before)...');
    console.log(`   Wrong URL: ${API_BASE_URL}/api/auth/login (double /api)`);
    
    try {
      const wrongResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin'
        })
      });

      console.log(`   Status: ${wrongResponse.status}`);
      console.log('   ❌ This should fail (404 Not Found)');
    } catch (error) {
      console.log(`   ❌ Expected error: ${error.message}`);
    }

    console.log('\n🎉 LOGIN FIX TEST COMPLETED!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 FIXES APPLIED:');
    console.log('   ✅ Removed double /api from login URL');
    console.log('   ✅ Removed double /api from logout URL');
    console.log('   ✅ Removed double /api from auth/me URL');
    console.log('');
    console.log('🔗 CORRECT URLS NOW:');
    console.log('   ✅ Health: http://localhost:3001/api/health');
    console.log('   ✅ Login: http://localhost:3001/api/auth/login');
    console.log('   ✅ Logout: http://localhost:3001/api/auth/logout');
    console.log('   ✅ Auth/me: http://localhost:3001/api/auth/me');
    console.log('');
    console.log('💡 FRONTEND LOGIN SHOULD NOW WORK:');
    console.log('   1. Open http://localhost:5174/admin');
    console.log('   2. Use credentials: admin / admin');
    console.log('   3. Login should succeed without network error');
    console.log('   4. Check browser console for success logs');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testLoginFix().catch(console.error);
