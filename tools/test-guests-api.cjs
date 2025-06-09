#!/usr/bin/env node

// Use dynamic import for node-fetch v3
async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

const API_BASE_URL = 'http://localhost:3001/api';

async function testGuestsAPI() {
  console.log('🧪 TESTING GUESTS API\n');

  try {
    const fetch = await getFetch();

    // Step 1: Login to get token
    console.log('1. 🔐 Logging in to get authentication token...');
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
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('   Token received:', loginData.token ? 'Yes' : 'No');

    const token = loginData.token;

    // Step 2: Test GET /api/guests
    console.log('\n2. 📋 Testing GET /api/guests...');
    const guestsResponse = await fetch(`${API_BASE_URL}/guests`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('   Response status:', guestsResponse.status);
    console.log('   Response headers:', Object.fromEntries(guestsResponse.headers));

    if (!guestsResponse.ok) {
      const errorText = await guestsResponse.text();
      console.log('❌ GET guests failed');
      console.log('   Error response:', errorText);
      return;
    }

    const guestsData = await guestsResponse.json();
    console.log('✅ GET guests successful');
    console.log('   Success:', guestsData.success);
    console.log('   Data count:', guestsData.data ? guestsData.data.length : 0);
    
    if (guestsData.data && guestsData.data.length > 0) {
      console.log('   Sample guest:', {
        id: guestsData.data[0].id,
        guest_name: guestsData.data[0].guest_name,
        guest_email: guestsData.data[0].guest_email,
        rsvp_status: guestsData.data[0].rsvp_status
      });
    }

    // Step 3: Test POST /api/guests
    console.log('\n3. ➕ Testing POST /api/guests...');
    const newGuest = {
      guestName: `Test Guest ${Date.now()}`,
      guestEmail: 'test@example.com',
      guestPhone: '081234567890',
      guestCount: 2
    };

    const addResponse = await fetch(`${API_BASE_URL}/guests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newGuest),
    });

    console.log('   Response status:', addResponse.status);

    if (!addResponse.ok) {
      const errorText = await addResponse.text();
      console.log('❌ POST guests failed');
      console.log('   Error response:', errorText);
      return;
    }

    const addData = await addResponse.json();
    console.log('✅ POST guests successful');
    console.log('   Success:', addData.success);
    console.log('   Message:', addData.message);

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('   Stack:', error.stack);
  }
}

testGuestsAPI();
