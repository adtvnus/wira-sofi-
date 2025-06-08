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

async function debugWeddingSettingsError() {
  console.log('🔍 DEBUGGING WEDDING SETTINGS "FAILED TO FETCH" ERROR\n');
  
  const API_BASE = 'http://localhost:3001/api';
  let token = '';

  try {
    // 1. Test API Health
    console.log('1. 🏥 Testing API Health...');
    const healthResult = await makeRequest(`${API_BASE}/health`);
    console.log(`   Status: ${healthResult.status}`);
    console.log(`   Response: ${JSON.stringify(healthResult.data)}`);
    
    if (healthResult.status !== 200) {
      throw new Error('API Health check failed');
    }

    // 2. Test Login
    console.log('\n2. 🔐 Testing Login...');
    const loginResult = await makeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });
    
    console.log(`   Status: ${loginResult.status}`);
    console.log(`   Response: ${JSON.stringify(loginResult.data, null, 2)}`);
    
    if (loginResult.status !== 200 || !loginResult.data.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginResult.data)}`);
    }
    
    token = loginResult.data.token;
    console.log(`   ✅ Login successful, token: ${token.substring(0, 20)}...`);

    // 3. Test GET Wedding Settings
    console.log('\n3. 📖 Testing GET Wedding Settings...');
    const getResult = await makeRequest(`${API_BASE}/wedding-settings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`   Status: ${getResult.status}`);
    console.log(`   Response: ${JSON.stringify(getResult.data, null, 2)}`);
    
    if (getResult.status !== 200) {
      throw new Error(`GET wedding settings failed: ${JSON.stringify(getResult.data)}`);
    }

    // 4. Test POST Wedding Settings (Complete Data)
    console.log('\n4. ✏️ Testing POST Wedding Settings (Complete Data)...');
    
    const completeWeddingData = {
      groomFullName: 'Wira Saputra Complete Test',
      groomFirstName: 'Wira',
      groomParents: 'Bapak Agus Saputra & Ibu Siti Saputra',
      brideFullName: 'Sofi Andriani Complete Test',
      brideFirstName: 'Sofi',
      brideParents: 'Bapak Budi Andriani & Ibu Rina Andriani',
      weddingDate: '2024-12-25',
      weddingTime: '10:00',
      weddingVenue: 'Gedung Serbaguna Complete Test',
      weddingAddress: 'Jl. Merdeka No. 123, Jakarta Complete Test',
      receptionDate: '2024-12-25',
      receptionTime: '18:00',
      receptionVenue: 'Ballroom Hotel Complete Test',
      receptionAddress: 'Jl. Sudirman No. 456, Jakarta Complete Test'
    };

    console.log(`   📝 Sending complete data: ${JSON.stringify(completeWeddingData, null, 2)}`);
    
    const postResult = await makeRequest(`${API_BASE}/wedding-settings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(completeWeddingData)
    });
    
    console.log(`   Status: ${postResult.status}`);
    console.log(`   Response: ${JSON.stringify(postResult.data, null, 2)}`);
    console.log(`   Headers: ${JSON.stringify(postResult.headers, null, 2)}`);
    
    if (postResult.status === 200) {
      console.log('   ✅ POST successful!');
    } else {
      console.log('   ❌ POST failed!');
    }

    // 5. Test with Missing Required Fields
    console.log('\n5. 🧪 Testing with Missing Required Fields...');
    const incompleteData = {
      groomFullName: '',
      groomFirstName: '',
      brideFullName: '',
      brideFirstName: '',
      weddingDate: '',
      weddingTime: '',
      weddingVenue: '',
      weddingAddress: ''
    };

    const incompleteResult = await makeRequest(`${API_BASE}/wedding-settings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(incompleteData)
    });
    
    console.log(`   Status: ${incompleteResult.status}`);
    console.log(`   Response: ${JSON.stringify(incompleteResult.data, null, 2)}`);

    // 6. Test CORS Headers
    console.log('\n6. 🌐 Testing CORS Headers...');
    const corsResult = await makeRequest(`${API_BASE}/wedding-settings`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Authorization, Content-Type'
      }
    });
    
    console.log(`   Status: ${corsResult.status}`);
    console.log(`   Headers: ${JSON.stringify(corsResult.headers, null, 2)}`);

    console.log('\n🎉 DEBUGGING COMPLETE!');
    
    console.log('\n📋 ANALYSIS SUMMARY:');
    console.log(`   ✅ API Health: ${healthResult.status === 200 ? 'Working' : 'Failed'}`);
    console.log(`   ✅ Login: ${loginResult.status === 200 ? 'Working' : 'Failed'}`);
    console.log(`   ✅ GET Settings: ${getResult.status === 200 ? 'Working' : 'Failed'}`);
    console.log(`   ${postResult.status === 200 ? '✅' : '❌'} POST Settings: ${postResult.status === 200 ? 'Working' : 'Failed'}`);
    console.log(`   ${incompleteResult.status >= 400 ? '✅' : '❌'} Validation: ${incompleteResult.status >= 400 ? 'Working' : 'Not Working'}`);
    console.log(`   ✅ CORS: ${corsResult.status === 200 || corsResult.status === 204 ? 'Working' : 'Check Headers'}`);

    console.log('\n🔍 POSSIBLE CAUSES OF "FAILED TO FETCH":');
    if (postResult.status === 200) {
      console.log('   ✅ Backend API is working perfectly');
      console.log('   🔍 Issue is likely in frontend:');
      console.log('     - Network connectivity issues');
      console.log('     - CORS configuration problems');
      console.log('     - Frontend request format issues');
      console.log('     - Authentication token problems');
      console.log('     - Browser blocking requests');
    } else {
      console.log('   ❌ Backend API has issues');
      console.log('   🔧 Check backend server logs for detailed errors');
    }

  } catch (error) {
    console.error('\n❌ DEBUGGING FAILED:', error.message);
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('   1. Check if backend server is running: npm run backend');
    console.log('   2. Check if frontend server is running: npm run dev');
    console.log('   3. Check browser console for JavaScript errors');
    console.log('   4. Check network tab in browser dev tools');
    console.log('   5. Check if localStorage has valid auth token');
    console.log('   6. Try clearing browser cache and cookies');
    console.log('   7. Check firewall/antivirus blocking requests');
  }
}

debugWeddingSettingsError();
