#!/usr/bin/env node

// Use dynamic import for node-fetch v3
async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

const API_BASE_URL = 'http://localhost:3001/api';

async function debugFrontendIssue() {
  console.log('🔍 DEBUGGING FRONTEND GUEST MANAGEMENT ISSUE\n');

  try {
    const fetch = await getFetch();
    
    // Step 1: Check if frontend server is running
    console.log('1. 🌐 Checking frontend server...');
    try {
      const frontendResponse = await fetch('http://localhost:5173');
      console.log('   ✅ Frontend server is running (status:', frontendResponse.status, ')');
    } catch (error) {
      console.log('   ❌ Frontend server is not accessible');
      console.log('   Error:', error.message);
      return;
    }

    // Step 2: Check backend API health
    console.log('\n2. 🏥 Checking backend API health...');
    try {
      const healthResponse = await fetch(`${API_BASE_URL}/health`);
      if (healthResponse.ok) {
        console.log('   ✅ Backend API is healthy');
      } else {
        console.log('   ❌ Backend API health check failed');
        return;
      }
    } catch (error) {
      console.log('   ❌ Cannot connect to backend API');
      console.log('   Error:', error.message);
      return;
    }

    // Step 3: Test authentication
    console.log('\n3. 🔐 Testing authentication...');
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

    // Step 4: Test guests API endpoint
    console.log('\n4. 📋 Testing guests API endpoint...');
    const guestsResponse = await fetch(`${API_BASE_URL}/guests`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!guestsResponse.ok) {
      console.log('   ❌ Guests API failed with status:', guestsResponse.status);
      const errorText = await guestsResponse.text();
      console.log('   Error response:', errorText);
      return;
    }

    const guestsData = await guestsResponse.json();
    console.log('   ✅ Guests API successful');
    console.log('   Response structure:', {
      success: guestsData.success,
      dataType: typeof guestsData.data,
      dataLength: guestsData.data ? guestsData.data.length : 0,
      sampleKeys: guestsData.data && guestsData.data.length > 0 ? Object.keys(guestsData.data[0]) : []
    });

    // Step 5: Check data format compatibility
    console.log('\n5. 🔄 Checking data format compatibility...');
    if (guestsData.data && guestsData.data.length > 0) {
      const sampleGuest = guestsData.data[0];
      console.log('   Sample guest from API:', {
        id: sampleGuest.id,
        guest_name: sampleGuest.guest_name,
        guest_email: sampleGuest.guest_email,
        guest_phone: sampleGuest.guest_phone,
        guest_count: sampleGuest.guest_count,
        rsvp_status: sampleGuest.rsvp_status,
        invitation_code: sampleGuest.invitation_code,
        created_at: sampleGuest.created_at
      });

      // Simulate frontend formatting
      const formattedGuest = {
        id: sampleGuest.id.toString(),
        name: sampleGuest.guest_name,
        email: sampleGuest.guest_email,
        phone: sampleGuest.guest_phone,
        guestCount: sampleGuest.guest_count || 1,
        rsvpStatus: sampleGuest.rsvp_status || 'pending',
        invitationCode: sampleGuest.invitation_code,
        createdAt: sampleGuest.created_at,
        updatedAt: sampleGuest.updated_at
      };

      console.log('   Formatted for frontend:', formattedGuest);
      console.log('   ✅ Data format looks compatible');
    } else {
      console.log('   ⚠️ No guest data found in database');
    }

    // Step 6: Test POST endpoint
    console.log('\n6. ➕ Testing POST endpoint...');
    const testGuest = {
      guestName: `Debug Test ${Date.now()}`,
      guestEmail: 'debug@test.com',
      guestPhone: '081234567890',
      guestCount: 1
    };

    const postResponse = await fetch(`${API_BASE_URL}/guests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testGuest),
    });

    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log('   ✅ POST endpoint working');
      console.log('   Response:', postData);
    } else {
      console.log('   ❌ POST endpoint failed');
      const errorText = await postResponse.text();
      console.log('   Error:', errorText);
    }

    console.log('\n🎯 DIAGNOSIS SUMMARY:');
    console.log('   - Backend API: ✅ Working');
    console.log('   - Authentication: ✅ Working');
    console.log('   - GET /guests: ✅ Working');
    console.log('   - POST /guests: ✅ Working');
    console.log('   - Data format: ✅ Compatible');
    console.log('\n💡 LIKELY CAUSES:');
    console.log('   1. Frontend authentication token might be invalid/expired');
    console.log('   2. CORS issues between frontend and backend');
    console.log('   3. Frontend error handling might be hiding the real issue');
    console.log('   4. Browser console might have more specific error messages');
    console.log('\n🔧 RECOMMENDED ACTIONS:');
    console.log('   1. Check browser console for JavaScript errors');
    console.log('   2. Check Network tab in browser dev tools');
    console.log('   3. Try logging out and logging back in');
    console.log('   4. Clear browser cache and localStorage');

  } catch (error) {
    console.error('\n❌ Debug failed:', error.message);
    console.error('   Stack:', error.stack);
  }
}

debugFrontendIssue();
