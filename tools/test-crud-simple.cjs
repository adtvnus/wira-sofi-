#!/usr/bin/env node

// Simple CRUD test using built-in modules
const http = require('http');
const https = require('https');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
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

async function testCRUD() {
  console.log('🧪 Testing CRUD Operations with MySQL\n');
  
  const API_BASE = 'http://localhost:3001/api';
  let token = '';
  let testGuestId = '';

  try {
    // 1. Test Login
    console.log('1. 🔐 Testing Login...');
    const loginResult = await makeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    if (loginResult.status === 200 && loginResult.data.token) {
      token = loginResult.data.token;
      console.log('   ✅ Login successful');
      console.log(`   🔑 Token received: ${token.substring(0, 20)}...`);
    } else {
      throw new Error('Login failed');
    }

    // 2. Test GET Guests
    console.log('\n2. 📖 Testing GET Guests...');
    const getResult = await makeRequest(`${API_BASE}/guests`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (getResult.status === 200) {
      console.log('   ✅ GET Guests successful');
      console.log(`   👥 Total guests: ${getResult.data.guests.length}`);
    } else {
      throw new Error('GET Guests failed');
    }

    // 3. Test CREATE Guest
    console.log('\n3. ➕ Testing CREATE Guest...');
    const createResult = await makeRequest(`${API_BASE}/guests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        guestName: 'Test MySQL User',
        guestEmail: 'mysql@test.com',
        guestPhone: '+62812345678',
        guestCount: 2
      })
    });
    
    if (createResult.status === 201 && createResult.data.guest) {
      testGuestId = createResult.data.guest.id;
      console.log('   ✅ CREATE successful');
      console.log(`   🆔 Guest ID: ${testGuestId}`);
      console.log(`   👤 Name: ${createResult.data.guest.guest_name}`);
      console.log(`   🎫 Code: ${createResult.data.guest.invitation_code}`);
    } else {
      throw new Error('CREATE failed');
    }

    // 4. Test UPDATE Guest
    console.log('\n4. ✏️ Testing UPDATE Guest...');
    const updateResult = await makeRequest(`${API_BASE}/guests/${testGuestId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        guestName: 'Updated MySQL User',
        guestEmail: 'updated@mysql.com',
        guestCount: 3
      })
    });
    
    if (updateResult.status === 200) {
      console.log('   ✅ UPDATE successful');
      console.log(`   👤 Updated name: ${updateResult.data.guest.guest_name}`);
    } else {
      throw new Error('UPDATE failed');
    }

    // 5. Test Wedding Settings
    console.log('\n5. 💒 Testing Wedding Settings...');
    const settingsResult = await makeRequest(`${API_BASE}/wedding-settings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (settingsResult.status === 200) {
      console.log('   ✅ Wedding Settings successful');
      console.log(`   💑 Couple: ${settingsResult.data.settings.groom_name} & ${settingsResult.data.settings.bride_name}`);
    } else {
      throw new Error('Wedding Settings failed');
    }

    // 6. Test DELETE Guest
    console.log('\n6. 🗑️ Testing DELETE Guest...');
    const deleteResult = await makeRequest(`${API_BASE}/guests/${testGuestId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (deleteResult.status === 200) {
      console.log('   ✅ DELETE successful');
      console.log(`   🗑️ Guest ${testGuestId} removed from MySQL`);
    } else {
      throw new Error('DELETE failed');
    }

    console.log('\n🎉 CRUD Test Complete!');
    console.log('\n📋 MySQL Integration Summary:');
    console.log('   ✅ Authentication - JWT working with MySQL');
    console.log('   ✅ CREATE - Data inserted into MySQL');
    console.log('   ✅ READ - Data retrieved from MySQL');
    console.log('   ✅ UPDATE - Data modified in MySQL');
    console.log('   ✅ DELETE - Data removed from MySQL');
    console.log('   ✅ Wedding Settings - Configuration from MySQL');
    
    console.log('\n🗄️ MYSQL CONNECTION STATUS: FULLY OPERATIONAL ✅');

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    
    // Cleanup
    if (testGuestId && token) {
      try {
        await makeRequest(`${API_BASE}/guests/${testGuestId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('🧹 Cleanup completed');
      } catch (e) {
        console.log('⚠️ Cleanup failed');
      }
    }
  }
}

testCRUD();
