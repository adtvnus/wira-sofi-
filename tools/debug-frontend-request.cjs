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

async function debugFrontendRequest() {
  console.log('🔍 DEBUGGING FRONTEND REQUEST SIMULATION\n');
  
  const API_BASE = 'http://localhost:3001/api';
  let token = '';

  try {
    // 1. Simulate Frontend Login
    console.log('1. 🔐 Simulating Frontend Login...');
    const loginResult = await makeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173',
        'Referer': 'http://localhost:5173/admin/login'
      },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });
    
    console.log(`   Status: ${loginResult.status}`);
    if (loginResult.status === 200 && loginResult.data.token) {
      token = loginResult.data.token;
      console.log(`   ✅ Login successful, token: ${token.substring(0, 20)}...`);
    } else {
      throw new Error(`Login failed: ${JSON.stringify(loginResult.data)}`);
    }

    // 2. Simulate Frontend GET Wedding Settings
    console.log('\n2. 📖 Simulating Frontend GET Wedding Settings...');
    const getResult = await makeRequest(`${API_BASE}/wedding-settings`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Origin': 'http://localhost:5173',
        'Referer': 'http://localhost:5173/admin/wedding-settings'
      }
    });
    
    console.log(`   Status: ${getResult.status}`);
    if (getResult.status === 200) {
      console.log('   ✅ GET successful');
      console.log(`   Data keys: ${Object.keys(getResult.data.data || {}).join(', ')}`);
    } else {
      console.log(`   ❌ GET failed: ${JSON.stringify(getResult.data)}`);
    }

    // 3. Simulate Frontend POST Wedding Settings (Exact Frontend Format)
    console.log('\n3. ✏️ Simulating Frontend POST Wedding Settings...');
    
    // This is the exact format that frontend sends
    const frontendFormData = {
      groomFullName: 'Wira Saputra Frontend Test',
      groomFirstName: 'Wira',
      groomParents: 'Bapak Agus Saputra & Ibu Siti Saputra',
      brideFullName: 'Sofi Andriani Frontend Test',
      brideFirstName: 'Sofi',
      brideParents: 'Bapak Budi Andriani & Ibu Rina Andriani',
      weddingDate: '2024-12-25',
      weddingTime: '10:00',
      weddingVenue: 'Gedung Serbaguna Frontend Test',
      weddingAddress: 'Jl. Merdeka No. 123, Jakarta Frontend Test',
      receptionDate: '2024-12-25',
      receptionTime: '18:00',
      receptionVenue: 'Ballroom Hotel Frontend Test',
      receptionAddress: 'Jl. Sudirman No. 456, Jakarta Frontend Test'
    };

    console.log(`   📝 Sending frontend format data...`);
    console.log(`   Data: ${JSON.stringify(frontendFormData, null, 2)}`);
    
    const postResult = await makeRequest(`${API_BASE}/wedding-settings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173',
        'Referer': 'http://localhost:5173/admin/wedding-settings',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify(frontendFormData)
    });
    
    console.log(`   Status: ${postResult.status}`);
    console.log(`   Response: ${JSON.stringify(postResult.data, null, 2)}`);
    
    if (postResult.status === 200) {
      console.log('   ✅ POST successful!');
    } else {
      console.log('   ❌ POST failed!');
      console.log(`   Headers: ${JSON.stringify(postResult.headers, null, 2)}`);
    }

    // 4. Test with Empty Required Fields (Common Frontend Issue)
    console.log('\n4. 🧪 Testing with Empty Required Fields...');
    const emptyFieldsData = {
      groomFullName: '',
      groomFirstName: '',
      groomParents: '',
      brideFullName: '',
      brideFirstName: '',
      brideParents: '',
      weddingDate: '',
      weddingTime: '',
      weddingVenue: '',
      weddingAddress: '',
      receptionDate: '',
      receptionTime: '',
      receptionVenue: '',
      receptionAddress: ''
    };

    const emptyResult = await makeRequest(`${API_BASE}/wedding-settings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173',
        'Referer': 'http://localhost:5173/admin/wedding-settings'
      },
      body: JSON.stringify(emptyFieldsData)
    });
    
    console.log(`   Status: ${emptyResult.status}`);
    console.log(`   Response: ${JSON.stringify(emptyResult.data, null, 2)}`);

    // 5. Test with Invalid Date Format
    console.log('\n5. 📅 Testing with Invalid Date Format...');
    const invalidDateData = {
      ...frontendFormData,
      weddingDate: '25-12-2024', // Wrong format
      weddingTime: '25:00', // Invalid time
      receptionDate: 'invalid-date'
    };

    const invalidResult = await makeRequest(`${API_BASE}/wedding-settings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173',
        'Referer': 'http://localhost:5173/admin/wedding-settings'
      },
      body: JSON.stringify(invalidDateData)
    });
    
    console.log(`   Status: ${invalidResult.status}`);
    console.log(`   Response: ${JSON.stringify(invalidResult.data, null, 2)}`);

    console.log('\n🎉 FRONTEND REQUEST DEBUGGING COMPLETE!');
    
    console.log('\n📋 ANALYSIS SUMMARY:');
    console.log(`   ✅ Login: ${loginResult.status === 200 ? 'Working' : 'Failed'}`);
    console.log(`   ✅ GET Settings: ${getResult.status === 200 ? 'Working' : 'Failed'}`);
    console.log(`   ${postResult.status === 200 ? '✅' : '❌'} POST Settings: ${postResult.status === 200 ? 'Working' : 'Failed'}`);
    console.log(`   ${emptyResult.status >= 400 ? '✅' : '❌'} Empty Fields Validation: ${emptyResult.status >= 400 ? 'Working' : 'Not Working'}`);
    console.log(`   ${invalidResult.status >= 400 ? '✅' : '❌'} Invalid Data Validation: ${invalidResult.status >= 400 ? 'Working' : 'Not Working'}`);

    console.log('\n🔍 POSSIBLE FRONTEND ISSUES:');
    if (postResult.status === 200) {
      console.log('   ✅ Backend API is working perfectly');
      console.log('   🔍 Issue might be in frontend:');
      console.log('     - Check browser console for JavaScript errors');
      console.log('     - Check network tab for actual request details');
      console.log('     - Check if token is properly stored in localStorage');
      console.log('     - Check if form validation is preventing submission');
      console.log('     - Check if there are CORS issues');
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
  }
}

debugFrontendRequest();
