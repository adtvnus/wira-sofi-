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

async function debugWeddingSettings() {
  console.log('🔍 DEBUGGING WEDDING SETTINGS SAVE ERROR\n');
  
  const API_BASE = 'http://localhost:3001/api';
  let token = '';

  try {
    // 1. Test Health
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

    // 4. Test POST Wedding Settings (Simulate Frontend Data)
    console.log('\n4. ✏️ Testing POST Wedding Settings (Simulating Frontend)...');
    
    // Simulate exact data that frontend would send
    const frontendData = {
      groomFullName: 'Wira Saputra Test',
      groomFirstName: 'Wira',
      groomParents: 'Bapak Agus Saputra & Ibu Siti Saputra',
      brideFullName: 'Sofi Andriani Test',
      brideFirstName: 'Sofi',
      brideParents: 'Bapak Budi Andriani & Ibu Rina Andriani',
      weddingDate: '2024-12-25',
      weddingTime: '10:00:00',
      weddingVenue: 'Gedung Serbaguna Test',
      weddingAddress: 'Jl. Merdeka No. 123, Jakarta Test',
      receptionDate: '2024-12-25',
      receptionTime: '18:00:00',
      receptionVenue: 'Ballroom Hotel Test',
      receptionAddress: 'Jl. Sudirman No. 456, Jakarta Test'
    };

    console.log(`   📝 Sending data: ${JSON.stringify(frontendData, null, 2)}`);
    
    const postResult = await makeRequest(`${API_BASE}/wedding-settings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(frontendData)
    });
    
    console.log(`   Status: ${postResult.status}`);
    console.log(`   Response: ${JSON.stringify(postResult.data, null, 2)}`);
    console.log(`   Headers: ${JSON.stringify(postResult.headers, null, 2)}`);
    
    if (postResult.status === 200) {
      console.log('   ✅ POST successful!');
    } else {
      console.log('   ❌ POST failed!');
      console.log(`   Error details: ${JSON.stringify(postResult.data)}`);
    }

    // 5. Test with Invalid Data
    console.log('\n5. 🧪 Testing with Invalid Data...');
    const invalidData = {
      groomFullName: '', // Empty required field
      groomFirstName: '',
      brideFullName: '',
      brideFirstName: '',
      weddingDate: 'invalid-date',
      weddingTime: 'invalid-time'
    };

    const invalidResult = await makeRequest(`${API_BASE}/wedding-settings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidData)
    });
    
    console.log(`   Status: ${invalidResult.status}`);
    console.log(`   Response: ${JSON.stringify(invalidResult.data, null, 2)}`);

    // 6. Test with Missing Token
    console.log('\n6. 🔒 Testing without Authorization Token...');
    const noTokenResult = await makeRequest(`${API_BASE}/wedding-settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(frontendData)
    });
    
    console.log(`   Status: ${noTokenResult.status}`);
    console.log(`   Response: ${JSON.stringify(noTokenResult.data, null, 2)}`);

    console.log('\n🎉 DEBUGGING COMPLETE!');
    
    console.log('\n📋 ANALYSIS SUMMARY:');
    console.log('   ✅ API Health: Working');
    console.log('   ✅ Login: Working');
    console.log('   ✅ GET Settings: Working');
    console.log(`   ${postResult.status === 200 ? '✅' : '❌'} POST Settings: ${postResult.status === 200 ? 'Working' : 'Failed'}`);
    console.log(`   ${invalidResult.status >= 400 ? '✅' : '❌'} Validation: ${invalidResult.status >= 400 ? 'Working' : 'Not Working'}`);
    console.log(`   ${noTokenResult.status === 401 ? '✅' : '❌'} Auth Protection: ${noTokenResult.status === 401 ? 'Working' : 'Not Working'}`);

  } catch (error) {
    console.error('\n❌ DEBUGGING FAILED:', error.message);
    console.error('Stack trace:', error.stack);
    
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('   1. Check if backend server is running: npm run backend');
    console.log('   2. Check if MySQL database is connected');
    console.log('   3. Check if wedding_settings table exists');
    console.log('   4. Check backend console for detailed errors');
    console.log('   5. Check frontend network tab for request details');
  }
}

debugWeddingSettings();
