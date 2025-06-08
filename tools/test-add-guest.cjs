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

async function testAddGuest() {
  console.log('🧪 Testing Add Guest to MySQL Database\n');
  
  const API_BASE = 'http://localhost:3001/api';
  let token = '';

  try {
    // 1. Login first
    console.log('1. 🔐 Login to get token...');
    const loginResult = await makeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });
    
    if (loginResult.status === 200 && loginResult.data.token) {
      token = loginResult.data.token;
      console.log('   ✅ Login successful');
      console.log(`   🔑 Token: ${token.substring(0, 20)}...`);
    } else {
      throw new Error(`Login failed: ${JSON.stringify(loginResult.data)}`);
    }

    // 2. Test Add Guest
    console.log('\n2. ➕ Testing Add Guest...');
    const testGuest = {
      guestName: 'Test User Debug',
      guestEmail: 'debug@test.com',
      guestPhone: '+62812345678',
      guestCount: 2
    };

    console.log('   📝 Guest data:', JSON.stringify(testGuest, null, 2));

    const addResult = await makeRequest(`${API_BASE}/guests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testGuest)
    });
    
    console.log(`   📊 Response status: ${addResult.status}`);
    console.log('   📄 Response data:', JSON.stringify(addResult.data, null, 2));

    if (addResult.status === 201 && addResult.data.success) {
      console.log('\n   ✅ ADD GUEST SUCCESSFUL!');
      console.log(`   🆔 Guest ID: ${addResult.data.data.id}`);
      console.log(`   👤 Name: ${addResult.data.data.guest_name}`);
      console.log(`   🎫 Code: ${addResult.data.data.invitation_code}`);
      console.log(`   📧 Email: ${addResult.data.data.guest_email}`);
      console.log(`   📱 Phone: ${addResult.data.data.guest_phone}`);
      console.log(`   👥 Count: ${addResult.data.data.guest_count}`);
      
      // 3. Verify by getting all guests
      console.log('\n3. 📖 Verifying by getting all guests...');
      const getResult = await makeRequest(`${API_BASE}/guests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (getResult.status === 200) {
        const guests = getResult.data.guests;
        const newGuest = guests.find(g => g.guest_name === testGuest.guestName);
        if (newGuest) {
          console.log('   ✅ Guest found in database!');
          console.log(`   📊 Total guests now: ${guests.length}`);
        } else {
          console.log('   ⚠️ Guest not found in list');
        }
      }

    } else {
      console.log('\n   ❌ ADD GUEST FAILED!');
      console.log('   📄 Error details:', JSON.stringify(addResult.data, null, 2));
      
      // Check common issues
      if (addResult.status === 401) {
        console.log('   🔍 Issue: Authentication failed');
      } else if (addResult.status === 400) {
        console.log('   🔍 Issue: Bad request - check required fields');
      } else if (addResult.status === 500) {
        console.log('   🔍 Issue: Server error - check database connection');
      }
    }

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check if backend server is running on port 3001');
    console.log('   2. Check if MySQL database is connected');
    console.log('   3. Check if admin user exists in database');
    console.log('   4. Check network connectivity');
  }
}

testAddGuest();
