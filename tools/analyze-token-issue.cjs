#!/usr/bin/env node

// Use dynamic import for node-fetch v3
async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

const API_BASE_URL = 'http://localhost:3001/api';

async function analyzeTokenIssue() {
  console.log('🔍 ANALYZING TOKEN AUTHENTICATION ISSUE\n');

  try {
    const fetch = await getFetch();
    
    // Step 1: Test fresh login
    console.log('1. 🔐 Testing Fresh Login...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' }),
    });

    if (!loginResponse.ok) {
      console.log('   ❌ Login failed:', loginResponse.status);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('   ✅ Login successful');
    console.log('   Token type:', typeof token);
    console.log('   Token length:', token.length);
    console.log('   Token starts with:', token.substring(0, 10));

    // Step 2: Test token verification endpoint
    console.log('\n2. 🔍 Testing Token Verification...');
    const verifyResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('   Verify response status:', verifyResponse.status);
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('   ✅ Token verification successful');
      console.log('   User data:', verifyData.user);
    } else {
      const errorText = await verifyResponse.text();
      console.log('   ❌ Token verification failed:', errorText);
    }

    // Step 3: Test each problematic endpoint
    const endpoints = [
      { name: 'Guests', url: '/guests' },
      { name: 'Quotes', url: '/quotes' },
      { name: 'Bride-Groom', url: '/bride-groom' },
      { name: 'Thanks Settings', url: '/thanks-settings' }
    ];

    console.log('\n3. 🧪 Testing Problematic Endpoints...');
    
    for (const endpoint of endpoints) {
      console.log(`\n   Testing ${endpoint.name} (${endpoint.url}):`);
      
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint.url}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log(`     Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`     ✅ Success: ${data.success ? 'true' : 'false'}`);
          console.log(`     Data: ${data.data ? (Array.isArray(data.data) ? `${data.data.length} items` : 'object') : 'none'}`);
        } else {
          const errorText = await response.text();
          console.log(`     ❌ Error: ${errorText}`);
          
          // Parse error if JSON
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error === 'Invalid token') {
              console.log(`     🚨 FOUND ISSUE: Invalid token error on ${endpoint.name}`);
            }
          } catch (parseError) {
            // Not JSON, ignore
          }
        }
      } catch (error) {
        console.log(`     ❌ Request failed: ${error.message}`);
      }
    }

    // Step 4: Test POST operations
    console.log('\n4. ➕ Testing POST Operations...');
    
    // Test adding a guest
    console.log('\n   Testing POST Guest:');
    const guestResponse = await fetch(`${API_BASE_URL}/guests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        guestName: `Token Test ${Date.now()}`,
        guestEmail: 'tokentest@example.com',
        guestPhone: '081234567890',
        guestCount: 1
      }),
    });

    console.log(`     Status: ${guestResponse.status}`);
    if (guestResponse.ok) {
      const data = await guestResponse.json();
      console.log(`     ✅ POST Guest successful`);
    } else {
      const errorText = await guestResponse.text();
      console.log(`     ❌ POST Guest failed: ${errorText}`);
    }

    // Test adding a quote
    console.log('\n   Testing POST Quote:');
    const quoteResponse = await fetch(`${API_BASE_URL}/quotes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quoteText: `Token test quote ${Date.now()}`,
        quoteAuthor: 'Test Author',
        quoteCategory: 'general',
        displayOrder: 1
      }),
    });

    console.log(`     Status: ${quoteResponse.status}`);
    if (quoteResponse.ok) {
      const data = await quoteResponse.json();
      console.log(`     ✅ POST Quote successful`);
    } else {
      const errorText = await quoteResponse.text();
      console.log(`     ❌ POST Quote failed: ${errorText}`);
    }

    // Step 5: Check session in database
    console.log('\n5. 🗄️ Checking Session in Database...');
    console.log('   (This would require direct database access)');

    // Step 6: Test with old/invalid token
    console.log('\n6. 🧪 Testing with Invalid Token...');
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3NDkzNzI5NjEsImV4cCI6MTc0OTQ1OTM2MX0.ulV5oir81C_4BB__-GSxvD83_HzonSKzM8HDk7CEJvE';
    
    const invalidResponse = await fetch(`${API_BASE_URL}/guests`, {
      headers: {
        'Authorization': `Bearer ${invalidToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`   Invalid token test status: ${invalidResponse.status}`);
    if (!invalidResponse.ok) {
      const errorText = await invalidResponse.text();
      console.log(`   Expected error: ${errorText}`);
    }

    console.log('\n🎯 ANALYSIS SUMMARY:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 POSSIBLE CAUSES OF "HTTP 403: Invalid token":');
    console.log('1. Frontend using cached/expired token from localStorage');
    console.log('2. Token not being properly stored after login');
    console.log('3. Session expired in database but frontend still has token');
    console.log('4. Fallback token in AuthContext is expired');
    console.log('5. Token format mismatch between frontend and backend');
    console.log('6. Database session table issues');
    console.log('═══════════════════════════════════════════════════════');

    console.log('\n🔧 RECOMMENDED FIXES:');
    console.log('1. Clear localStorage and force fresh login');
    console.log('2. Check token expiration handling in frontend');
    console.log('3. Verify session table in database');
    console.log('4. Remove hardcoded fallback token');
    console.log('5. Add proper token refresh mechanism');

  } catch (error) {
    console.error('\n❌ Analysis failed:', error.message);
  }
}

analyzeTokenIssue();
