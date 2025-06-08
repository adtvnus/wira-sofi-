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

async function testLogin() {
  console.log('🔐 Testing Login API...\n');
  
  const API_BASE = 'http://localhost:3001/api';

  try {
    // Test health first
    console.log('1. 🏥 Testing API health...');
    const healthResult = await makeRequest(`${API_BASE}/health`);
    console.log(`   Status: ${healthResult.status}`);
    console.log(`   Response: ${JSON.stringify(healthResult.data)}`);

    // Test login
    console.log('\n2. 🔐 Testing login...');
    const loginData = {
      username: 'admin',
      password: 'admin'
    };

    console.log(`   Sending: ${JSON.stringify(loginData)}`);
    
    const loginResult = await makeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });
    
    console.log(`   Status: ${loginResult.status}`);
    console.log(`   Response: ${JSON.stringify(loginResult.data, null, 2)}`);

    if (loginResult.status === 200 && loginResult.data.token) {
      console.log('\n✅ Login successful!');
      console.log(`🔑 Token: ${loginResult.data.token.substring(0, 20)}...`);
      
      // Test wedding settings with token
      console.log('\n3. 💒 Testing wedding settings...');
      const settingsResult = await makeRequest(`${API_BASE}/wedding-settings`, {
        headers: { 'Authorization': `Bearer ${loginResult.data.token}` }
      });
      
      console.log(`   Status: ${settingsResult.status}`);
      console.log(`   Response: ${JSON.stringify(settingsResult.data, null, 2)}`);
      
    } else {
      console.log('\n❌ Login failed!');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testLogin();
