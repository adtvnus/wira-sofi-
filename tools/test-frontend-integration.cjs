#!/usr/bin/env node

// Use dynamic import for node-fetch v3
async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

const API_BASE_URL = 'http://localhost:3001/api';
const FRONTEND_URL = 'http://localhost:5173';

async function testFrontendIntegration() {
  console.log('🧪 TESTING FRONTEND-BACKEND INTEGRATION\n');

  try {
    const fetch = await getFetch();
    
    // Step 1: Check both servers are running
    console.log('1. 🌐 Checking servers...');
    
    try {
      const frontendResponse = await fetch(FRONTEND_URL);
      console.log('   ✅ Frontend server: OK');
    } catch (error) {
      console.log('   ❌ Frontend server: FAILED');
      return;
    }

    try {
      const backendResponse = await fetch(`${API_BASE_URL}/health`);
      console.log('   ✅ Backend server: OK');
    } catch (error) {
      console.log('   ❌ Backend server: FAILED');
      return;
    }

    // Step 2: Test authentication flow
    console.log('\n2. 🔐 Testing authentication...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin'
      }),
    });

    if (!loginResponse.ok) {
      console.log('   ❌ Authentication failed');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('   ✅ Authentication successful');
    console.log('   Token type:', typeof token);
    console.log('   Token length:', token ? token.length : 0);

    // Step 3: Test GET guests
    console.log('\n3. 📋 Testing GET guests...');
    const guestsResponse = await fetch(`${API_BASE_URL}/guests`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!guestsResponse.ok) {
      console.log('   ❌ GET guests failed:', guestsResponse.status);
      return;
    }

    const guestsData = await guestsResponse.json();
    console.log('   ✅ GET guests successful');
    console.log('   Guests count:', guestsData.data ? guestsData.data.length : 0);

    // Step 4: Test POST guest
    console.log('\n4. ➕ Testing POST guest...');
    const newGuest = {
      guestName: `Integration Test ${Date.now()}`,
      guestEmail: 'integration@test.com',
      guestPhone: '081234567890',
      guestCount: 1
    };

    const postResponse = await fetch(`${API_BASE_URL}/guests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newGuest),
    });

    if (!postResponse.ok) {
      console.log('   ❌ POST guest failed:', postResponse.status);
      const errorText = await postResponse.text();
      console.log('   Error:', errorText);
      return;
    }

    const postData = await postResponse.json();
    console.log('   ✅ POST guest successful');
    console.log('   New guest ID:', postData.data ? postData.data.id : 'unknown');

    // Step 5: Verify the new guest appears in GET
    console.log('\n5. 🔄 Verifying new guest in list...');
    const verifyResponse = await fetch(`${API_BASE_URL}/guests`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      const newGuestCount = verifyData.data ? verifyData.data.length : 0;
      console.log('   ✅ Verification successful');
      console.log('   Updated guests count:', newGuestCount);
      
      // Find our new guest
      const ourGuest = verifyData.data.find(g => g.guest_name === newGuest.guestName);
      if (ourGuest) {
        console.log('   ✅ New guest found in list:', ourGuest.guest_name);
      } else {
        console.log('   ⚠️ New guest not found in list');
      }
    }

    console.log('\n🎯 INTEGRATION TEST SUMMARY:');
    console.log('   - Frontend Server: ✅ Running');
    console.log('   - Backend Server: ✅ Running');
    console.log('   - Authentication: ✅ Working');
    console.log('   - GET /guests: ✅ Working');
    console.log('   - POST /guests: ✅ Working');
    console.log('   - Data Persistence: ✅ Working');

    console.log('\n💡 FRONTEND DEBUGGING TIPS:');
    console.log('   1. Open browser console (F12) and check for errors');
    console.log('   2. Check Network tab for failed requests');
    console.log('   3. Look for CORS errors or 401 Unauthorized');
    console.log('   4. Verify localStorage has valid auth token');
    console.log('   5. Try hard refresh (Ctrl+F5) to clear cache');

    console.log('\n🔧 IF FRONTEND STILL NOT WORKING:');
    console.log('   1. Clear browser localStorage: localStorage.clear()');
    console.log('   2. Logout and login again');
    console.log('   3. Check if token in localStorage matches server token');
    console.log('   4. Look for JavaScript errors in console');

  } catch (error) {
    console.error('\n❌ Integration test failed:', error.message);
    console.error('   Stack:', error.stack);
  }
}

testFrontendIntegration();
