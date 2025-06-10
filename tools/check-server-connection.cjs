#!/usr/bin/env node

// Check server connection and troubleshoot login issues

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function checkServerConnection() {
  console.log('🔍 TROUBLESHOOTING SERVER CONNECTION ISSUES');
  console.log('═══════════════════════════════════════════════════════');
  
  const fetch = await getFetch();

  try {
    // Step 1: Check if backend server is running
    console.log('🌐 Step 1: Checking backend server status...');
    
    const serverUrls = [
      'http://localhost:3001',
      'http://localhost:3001/api',
      'http://localhost:3001/api/health'
    ];

    for (const url of serverUrls) {
      try {
        console.log(`   Testing: ${url}`);
        const response = await fetch(url, { 
          method: 'GET',
          timeout: 5000 
        });
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          console.log(`   ✅ ${url} is accessible`);
        } else {
          console.log(`   ⚠️ ${url} returned ${response.status}`);
        }
      } catch (error) {
        console.log(`   ❌ ${url} failed: ${error.message}`);
      }
    }

    // Step 2: Test authentication endpoint specifically
    console.log('\n🔐 Step 2: Testing authentication endpoint...');
    
    try {
      const authUrl = 'http://localhost:3001/api/auth/login';
      console.log(`   Testing: ${authUrl}`);
      
      const authResponse = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin'
        }),
        timeout: 10000
      });

      console.log(`   Auth Status: ${authResponse.status} ${authResponse.statusText}`);
      
      if (authResponse.ok) {
        const authData = await authResponse.json();
        console.log('   ✅ Authentication endpoint working');
        console.log(`   Response: ${JSON.stringify(authData, null, 2)}`);
      } else {
        const errorText = await authResponse.text();
        console.log('   ❌ Authentication failed');
        console.log(`   Error: ${errorText}`);
      }
    } catch (error) {
      console.log('   ❌ Authentication endpoint failed');
      console.log(`   Error: ${error.message}`);
    }

    // Step 3: Check frontend configuration
    console.log('\n⚙️ Step 3: Checking frontend configuration...');
    
    // Check if there's a .env file or configuration
    const fs = require('fs');
    const path = require('path');
    
    const envFiles = ['.env', '.env.local', '.env.development'];
    
    for (const envFile of envFiles) {
      if (fs.existsSync(envFile)) {
        console.log(`   ✅ Found ${envFile}`);
        try {
          const content = fs.readFileSync(envFile, 'utf8');
          const apiUrlMatch = content.match(/VITE_API_URL=(.+)/);
          if (apiUrlMatch) {
            console.log(`   API URL configured: ${apiUrlMatch[1]}`);
          } else {
            console.log('   ⚠️ No VITE_API_URL found in env file');
          }
        } catch (error) {
          console.log(`   ❌ Error reading ${envFile}: ${error.message}`);
        }
      } else {
        console.log(`   ❌ ${envFile} not found`);
      }
    }

    // Step 4: Check if processes are running
    console.log('\n🔄 Step 4: Checking running processes...');
    
    const { exec } = require('child_process');
    
    // Check for Node.js processes on port 3001
    exec('netstat -ano | findstr :3001', (error, stdout, stderr) => {
      if (stdout) {
        console.log('   ✅ Process found on port 3001:');
        console.log(`   ${stdout.trim()}`);
      } else {
        console.log('   ❌ No process found on port 3001');
        console.log('   💡 Backend server may not be running');
      }
    });

    // Check for processes on port 5175 (frontend)
    exec('netstat -ano | findstr :5175', (error, stdout, stderr) => {
      if (stdout) {
        console.log('   ✅ Process found on port 5175:');
        console.log(`   ${stdout.trim()}`);
      } else {
        console.log('   ❌ No process found on port 5175');
        console.log('   💡 Frontend server may not be running');
      }
    });

    // Step 5: Provide troubleshooting steps
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('1. 🚀 START BACKEND SERVER:');
    console.log('   cd backend');
    console.log('   npm run dev');
    console.log('   (Should show: Server running on port 3001)');
    console.log('');
    console.log('2. 🚀 START FRONTEND SERVER:');
    console.log('   npm run dev');
    console.log('   (Should show: Local: http://localhost:5175)');
    console.log('');
    console.log('3. 🔍 CHECK PORTS:');
    console.log('   Backend should be on: http://localhost:3001');
    console.log('   Frontend should be on: http://localhost:5175');
    console.log('');
    console.log('4. 🔧 IF STILL NOT WORKING:');
    console.log('   • Check if ports 3001 and 5175 are available');
    console.log('   • Restart both servers');
    console.log('   • Check firewall settings');
    console.log('   • Try different ports if needed');
    console.log('');
    console.log('5. 📱 TEST MANUALLY:');
    console.log('   • Open: http://localhost:3001/api/health');
    console.log('   • Should return server status');
    console.log('   • Open: http://localhost:5175');
    console.log('   • Should show wedding invitation app');

    // Wait a moment for netstat commands to complete
    setTimeout(() => {
      console.log('\n🎯 NEXT STEPS:');
      console.log('═══════════════════════════════════════════════════════');
      console.log('1. Start backend server if not running');
      console.log('2. Start frontend server if not running');
      console.log('3. Try login again');
      console.log('4. Check browser console for additional errors');
    }, 2000);

  } catch (error) {
    console.error('\n❌ Connection check failed:', error.message);
    console.log('\n🔧 Basic troubleshooting:');
    console.log('1. Make sure backend server is running on port 3001');
    console.log('2. Make sure frontend server is running on port 5175');
    console.log('3. Check if both servers started without errors');
  }
}

// Run the check
checkServerConnection().catch(console.error);
