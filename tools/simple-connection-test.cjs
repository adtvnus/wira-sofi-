#!/usr/bin/env node

// Simple connection test

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function simpleConnectionTest() {
  console.log('🔍 SIMPLE CONNECTION TEST');
  console.log('═══════════════════════════════════════════════════════');
  
  const fetch = await getFetch();

  try {
    console.log('🌐 Testing backend server...');
    
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:3001/api/health', {
      method: 'GET',
      timeout: 5000
    });

    console.log(`Health endpoint status: ${healthResponse.status}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log('✅ Backend server is responding');
      console.log(`Response: ${healthData}`);
    } else {
      console.log('❌ Backend server returned error');
    }

    // Test login endpoint
    console.log('\n🔐 Testing login endpoint...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin'
      }),
      timeout: 5000
    });

    console.log(`Login endpoint status: ${loginResponse.status}`);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login endpoint working');
      console.log(`Token received: ${loginData.token ? 'YES' : 'NO'}`);
    } else {
      const errorText = await loginResponse.text();
      console.log('❌ Login endpoint failed');
      console.log(`Error: ${errorText}`);
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 SOLUTION: Backend server is not running');
      console.log('   Run: npm run start-full');
      console.log('   Or: cd backend && npm run dev');
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 SOLUTION: Server is slow to respond');
      console.log('   Check server logs for errors');
    } else {
      console.log('\n💡 SOLUTION: Check server configuration');
      console.log('   Verify ports and CORS settings');
    }
  }
}

// Run the test
simpleConnectionTest().catch(console.error);
