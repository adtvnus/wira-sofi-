#!/usr/bin/env node

const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testFrontendConnectivity() {
  console.log('🔍 TESTING FRONTEND CONNECTIVITY TO BACKEND\n');
  
  const FRONTEND_URL = 'http://localhost:5173';
  const BACKEND_URL = 'http://localhost:3001/api';

  try {
    // 1. Test Frontend Server
    console.log('1. 🌐 Testing Frontend Server...');
    try {
      const frontendResult = await makeRequest(FRONTEND_URL);
      console.log(`   Status: ${frontendResult.status}`);
      if (frontendResult.status === 200) {
        console.log('   ✅ Frontend server is running');
      } else {
        console.log('   ❌ Frontend server issue');
      }
    } catch (error) {
      console.log(`   ❌ Frontend server not accessible: ${error.message}`);
    }

    // 2. Test Backend Server
    console.log('\n2. 🔧 Testing Backend Server...');
    try {
      const backendResult = await makeRequest(`${BACKEND_URL}/health`);
      console.log(`   Status: ${backendResult.status}`);
      console.log(`   Response: ${JSON.stringify(backendResult.data)}`);
      if (backendResult.status === 200) {
        console.log('   ✅ Backend server is running');
      } else {
        console.log('   ❌ Backend server issue');
      }
    } catch (error) {
      console.log(`   ❌ Backend server not accessible: ${error.message}`);
    }

    // 3. Test CORS Preflight
    console.log('\n3. 🌐 Testing CORS Preflight...');
    try {
      const corsResult = await makeRequest(`${BACKEND_URL}/wedding-settings`, {
        method: 'OPTIONS',
        headers: {
          'Origin': FRONTEND_URL,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Authorization, Content-Type'
        }
      });
      
      console.log(`   Status: ${corsResult.status}`);
      console.log(`   CORS Headers: ${JSON.stringify(corsResult.headers, null, 2)}`);
      
      if (corsResult.status === 200 || corsResult.status === 204) {
        console.log('   ✅ CORS preflight working');
      } else {
        console.log('   ❌ CORS preflight failed');
      }
    } catch (error) {
      console.log(`   ❌ CORS preflight error: ${error.message}`);
    }

    // 4. Test Authentication Flow
    console.log('\n4. 🔐 Testing Authentication Flow...');
    let token = '';
    
    try {
      const loginResult = await makeRequest(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Origin': FRONTEND_URL
        },
        body: JSON.stringify({ username: 'admin', password: 'admin' })
      });
      
      console.log(`   Login Status: ${loginResult.status}`);
      if (loginResult.status === 200 && loginResult.data.token) {
        token = loginResult.data.token;
        console.log(`   ✅ Authentication working, token: ${token.substring(0, 20)}...`);
      } else {
        console.log(`   ❌ Authentication failed: ${JSON.stringify(loginResult.data)}`);
      }
    } catch (error) {
      console.log(`   ❌ Authentication error: ${error.message}`);
    }

    // 5. Test Wedding Settings Endpoint
    if (token) {
      console.log('\n5. 📝 Testing Wedding Settings Endpoint...');
      
      // Test GET first
      try {
        const getResult = await makeRequest(`${BACKEND_URL}/wedding-settings`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Origin': FRONTEND_URL
          }
        });
        
        console.log(`   GET Status: ${getResult.status}`);
        if (getResult.status === 200) {
          console.log('   ✅ GET wedding settings working');
        } else {
          console.log(`   ❌ GET wedding settings failed: ${JSON.stringify(getResult.data)}`);
        }
      } catch (error) {
        console.log(`   ❌ GET wedding settings error: ${error.message}`);
      }

      // Test POST
      try {
        const testData = {
          groomFullName: 'Test Groom Full Name',
          groomFirstName: 'Test',
          groomParents: 'Test Parents',
          brideFullName: 'Test Bride Full Name',
          brideFirstName: 'Test',
          brideParents: 'Test Parents',
          weddingDate: '2024-12-25',
          weddingTime: '10:00',
          weddingVenue: 'Test Venue',
          weddingAddress: 'Test Address',
          receptionDate: '2024-12-25',
          receptionTime: '18:00',
          receptionVenue: 'Test Reception',
          receptionAddress: 'Test Reception Address'
        };

        const postResult = await makeRequest(`${BACKEND_URL}/wedding-settings`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Origin': FRONTEND_URL
          },
          body: JSON.stringify(testData)
        });
        
        console.log(`   POST Status: ${postResult.status}`);
        console.log(`   POST Response: ${JSON.stringify(postResult.data, null, 2)}`);
        
        if (postResult.status === 200) {
          console.log('   ✅ POST wedding settings working');
        } else {
          console.log('   ❌ POST wedding settings failed');
        }
      } catch (error) {
        console.log(`   ❌ POST wedding settings error: ${error.message}`);
      }
    }

    console.log('\n🎉 CONNECTIVITY TESTING COMPLETE!');
    
    console.log('\n📋 TROUBLESHOOTING GUIDE:');
    console.log('   If "Failed to fetch" error occurs in frontend:');
    console.log('   1. ✅ Check both servers are running:');
    console.log('      - Frontend: npm run dev (port 5173)');
    console.log('      - Backend: npm run backend (port 3001)');
    console.log('   2. ✅ Check browser console for detailed errors');
    console.log('   3. ✅ Check network tab in browser dev tools');
    console.log('   4. ✅ Clear browser cache and localStorage');
    console.log('   5. ✅ Disable browser extensions temporarily');
    console.log('   6. ✅ Check firewall/antivirus settings');
    console.log('   7. ✅ Try different browser');
    console.log('   8. ✅ Check if localhost resolves correctly');

    console.log('\n🔧 COMMON SOLUTIONS:');
    console.log('   - Restart both frontend and backend servers');
    console.log('   - Clear browser cache and cookies');
    console.log('   - Check Windows firewall settings');
    console.log('   - Try using 127.0.0.1 instead of localhost');
    console.log('   - Check if other applications are using ports 3001/5173');

  } catch (error) {
    console.error('\n❌ CONNECTIVITY TESTING FAILED:', error.message);
  }
}

testFrontendConnectivity();
