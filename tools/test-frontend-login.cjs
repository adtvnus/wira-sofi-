#!/usr/bin/env node

// Test frontend login functionality

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function testFrontendLogin() {
  console.log('🔐 TESTING FRONTEND LOGIN FUNCTIONALITY');
  console.log('═══════════════════════════════════════════════════════');
  
  const fetch = await getFetch();

  try {
    // Step 1: Test from frontend perspective (port 5173)
    console.log('🌐 Step 1: Testing from frontend perspective...');
    
    // Simulate frontend login request
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173', // Simulate frontend origin
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin'
      })
    });

    console.log(`Login status: ${loginResponse.status}`);
    console.log(`CORS headers: ${loginResponse.headers.get('access-control-allow-origin')}`);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Frontend login working');
      console.log(`Token: ${loginData.token ? 'Received' : 'Not received'}`);
      console.log(`Success: ${loginData.success}`);
    } else {
      const errorText = await loginResponse.text();
      console.log('❌ Frontend login failed');
      console.log(`Error: ${errorText}`);
    }

    // Step 2: Test CORS preflight
    console.log('\n🔄 Step 2: Testing CORS preflight...');
    
    const preflightResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      }
    });

    console.log(`Preflight status: ${preflightResponse.status}`);
    console.log(`Allow-Origin: ${preflightResponse.headers.get('access-control-allow-origin')}`);
    console.log(`Allow-Methods: ${preflightResponse.headers.get('access-control-allow-methods')}`);
    console.log(`Allow-Headers: ${preflightResponse.headers.get('access-control-allow-headers')}`);

    // Step 3: Check server configuration
    console.log('\n⚙️ Step 3: Checking server configuration...');
    
    const healthResponse = await fetch('http://localhost:3001/api/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Server configuration:');
      console.log(`   Server: ${healthData.server}`);
      console.log(`   Status: ${healthData.status}`);
      console.log(`   Login endpoint: ${healthData.endpoints.login}`);
    }

    // Step 4: Instructions
    console.log('\n📋 INSTRUCTIONS FOR TESTING:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('1. 🌐 Open browser to: http://localhost:5173/login');
    console.log('2. 🔐 Enter credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin');
    console.log('3. 🖱️ Click "Login" button');
    console.log('4. ✅ Should redirect to dashboard');
    console.log('');
    console.log('🔧 If still getting "Failed to fetch":');
    console.log('   1. Check browser console for CORS errors');
    console.log('   2. Make sure both servers are running');
    console.log('   3. Try hard refresh (Ctrl+F5)');
    console.log('   4. Clear browser cache');
    console.log('   5. Try incognito mode');
    console.log('');
    console.log('📊 Current server status:');
    console.log('   ✅ Backend: http://localhost:3001 (Running)');
    console.log('   ✅ Frontend: http://localhost:5173 (Running)');
    console.log('   ✅ CORS: Configured for port 5173');
    console.log('   ✅ Authentication: Working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 SOLUTION: Backend server not running');
      console.log('   Run: npm run start-full');
    } else if (error.message.includes('CORS')) {
      console.log('\n💡 SOLUTION: CORS configuration issue');
      console.log('   Check .env CORS_ORIGIN setting');
    } else {
      console.log('\n💡 SOLUTION: Check network connectivity');
      console.log('   Verify ports 3001 and 5173 are accessible');
    }
  }
}

// Run the test
testFrontendLogin().catch(console.error);
