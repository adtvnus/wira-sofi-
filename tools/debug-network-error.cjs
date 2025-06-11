#!/usr/bin/env node

// Debug network error during login

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function debugNetworkError() {
  console.log('🔍 DEBUGGING NETWORK ERROR DURING LOGIN');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const fetch = await getFetch();

  try {
    // Step 1: Check if backend server is running
    console.log('🌐 Step 1: Checking backend server status...');
    
    const backendPorts = [3001, 3000, 8000, 5000];
    let backendRunning = false;
    let workingPort = null;

    for (const port of backendPorts) {
      try {
        console.log(`   Testing port ${port}...`);
        const response = await fetch(`http://localhost:${port}/api/health`, {
          method: 'GET',
          timeout: 3000
        });
        
        if (response.ok) {
          console.log(`   ✅ Backend found on port ${port}`);
          backendRunning = true;
          workingPort = port;
          break;
        }
      } catch (error) {
        console.log(`   ❌ Port ${port}: ${error.message}`);
      }
    }

    if (!backendRunning) {
      console.log('\n❌ BACKEND SERVER NOT RUNNING!');
      console.log('💡 SOLUTION: Start backend server with:');
      console.log('   node backend/server.cjs');
      return;
    }

    console.log(`\n✅ Backend server running on port ${workingPort}`);

    // Step 2: Test health endpoint
    console.log('\n🏥 Step 2: Testing health endpoint...');
    try {
      const healthResponse = await fetch(`http://localhost:${workingPort}/api/health`);
      console.log(`   Status: ${healthResponse.status}`);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('   ✅ Health check successful');
        console.log(`   Server: ${healthData.server || 'Unknown'}`);
        console.log(`   Message: ${healthData.message || 'No message'}`);
      }
    } catch (error) {
      console.log(`   ❌ Health check failed: ${error.message}`);
    }

    // Step 3: Test login endpoint
    console.log('\n🔑 Step 3: Testing login endpoint...');
    try {
      const loginResponse = await fetch(`http://localhost:${workingPort}/api/auth/login`, {
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
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('   ✅ Login endpoint working');
        console.log(`   Token: ${loginData.token ? 'Generated' : 'Missing'}`);
        console.log(`   User: ${loginData.user ? loginData.user.username : 'Missing'}`);
      } else {
        const errorText = await loginResponse.text();
        console.log('   ❌ Login endpoint failed');
        console.log(`   Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`   ❌ Login request failed: ${error.message}`);
    }

    // Step 4: Check CORS configuration
    console.log('\n🌐 Step 4: Testing CORS configuration...');
    try {
      const corsResponse = await fetch(`http://localhost:${workingPort}/api/health`, {
        method: 'OPTIONS'
      });
      console.log(`   OPTIONS request status: ${corsResponse.status}`);
      
      const corsHeaders = corsResponse.headers;
      console.log('   CORS Headers:');
      console.log(`     Access-Control-Allow-Origin: ${corsHeaders.get('access-control-allow-origin') || 'Not set'}`);
      console.log(`     Access-Control-Allow-Methods: ${corsHeaders.get('access-control-allow-methods') || 'Not set'}`);
      console.log(`     Access-Control-Allow-Headers: ${corsHeaders.get('access-control-allow-headers') || 'Not set'}`);
    } catch (error) {
      console.log(`   ❌ CORS test failed: ${error.message}`);
    }

    // Step 5: Check frontend configuration
    console.log('\n📱 Step 5: Checking frontend configuration...');
    console.log('   Expected frontend URL: http://localhost:5174');
    console.log('   Expected backend URL: http://localhost:3001');
    console.log('   API Base URL should be: http://localhost:3001');

    // Step 6: Test from different origins
    console.log('\n🔄 Step 6: Testing cross-origin requests...');
    
    const origins = [
      'http://localhost:5174',
      'http://localhost:5173', 
      'http://localhost:3000',
      'http://127.0.0.1:5174'
    ];

    for (const origin of origins) {
      try {
        console.log(`   Testing from origin: ${origin}`);
        const response = await fetch(`http://localhost:${workingPort}/api/health`, {
          method: 'GET',
          headers: {
            'Origin': origin
          }
        });
        console.log(`     Status: ${response.status} - ${response.ok ? 'OK' : 'Failed'}`);
      } catch (error) {
        console.log(`     ❌ Failed: ${error.message}`);
      }
    }

    console.log('\n🎉 NETWORK ERROR DEBUG COMPLETED!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 DIAGNOSIS:');
    console.log(`   ✅ Backend server: ${backendRunning ? `Running on port ${workingPort}` : 'Not running'}`);
    console.log('   ✅ Health endpoint: Check results above');
    console.log('   ✅ Login endpoint: Check results above');
    console.log('   ✅ CORS configuration: Check results above');
    console.log('');
    console.log('💡 COMMON SOLUTIONS:');
    console.log('   1. Make sure backend server is running: node backend/server.cjs');
    console.log('   2. Check if frontend is using correct backend URL');
    console.log('   3. Verify no firewall blocking connections');
    console.log('   4. Try different browser or incognito mode');
    console.log('   5. Check browser console for detailed error messages');
    console.log('');
    console.log('🔧 NEXT STEPS:');
    console.log('   1. Start backend: node backend/server.cjs');
    console.log('   2. Start frontend: npm run dev');
    console.log('   3. Open http://localhost:5174/admin');
    console.log('   4. Check browser Network tab during login');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugNetworkError().catch(console.error);
