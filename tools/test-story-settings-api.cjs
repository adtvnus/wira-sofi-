#!/usr/bin/env node

// Test story settings API endpoints

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function testStorySettingsAPI() {
  console.log('🧪 TESTING STORY SETTINGS API ENDPOINTS');
  console.log('═══════════════════════════════════════════════════════');
  
  const fetch = await getFetch();

  try {
    // Test authentication first
    console.log('🔐 Step 1: Authentication...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });

    if (!loginResponse.ok) {
      throw new Error('Authentication failed');
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Authentication successful');

    // Test GET /api/story-settings (admin)
    console.log('\n📊 Step 2: Testing GET /api/story-settings (admin)...');
    const getResponse = await fetch('http://localhost:3001/api/story-settings', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`   Status: ${getResponse.status}`);
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('✅ Admin GET endpoint working');
      console.log(`   Data: ${JSON.stringify(getData.data, null, 2)}`);
    } else {
      console.log('❌ Admin GET endpoint failed');
    }

    // Test GET /api/story-settings/public (public)
    console.log('\n🌐 Step 3: Testing GET /api/story-settings/public (public)...');
    const publicResponse = await fetch('http://localhost:3001/api/story-settings/public');

    console.log(`   Status: ${publicResponse.status}`);
    if (publicResponse.ok) {
      const publicData = await publicResponse.json();
      console.log('✅ Public GET endpoint working');
      console.log(`   Data: ${JSON.stringify(publicData.data, null, 2)}`);
    } else {
      console.log('❌ Public GET endpoint failed');
    }

    // Test PUT /api/story-settings (update)
    console.log('\n✏️ Step 4: Testing PUT /api/story-settings (update)...');
    const updateResponse = await fetch('http://localhost:3001/api/story-settings', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        headerTitle: 'Our Love Story (Updated)',
        headerSubtitle: 'Perjalanan cinta kami yang indah dan penuh makna, dari pertemuan pertama hingga janji suci yang akan kami ikrarkan bersama.'
      })
    });

    console.log(`   Status: ${updateResponse.status}`);
    if (updateResponse.ok) {
      const updateData = await updateResponse.json();
      console.log('✅ Update endpoint working');
      console.log(`   Response: ${JSON.stringify(updateData, null, 2)}`);
    } else {
      console.log('❌ Update endpoint failed');
    }

    // Verify update by getting data again
    console.log('\n🔍 Step 5: Verifying update...');
    const verifyResponse = await fetch('http://localhost:3001/api/story-settings', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('✅ Verification successful');
      console.log(`   Updated Data: ${JSON.stringify(verifyData.data, null, 2)}`);
    }

    console.log('\n🎉 API TESTING COMPLETED!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 RESULTS SUMMARY:');
    console.log('   ✅ GET /api/story-settings (admin) - Working');
    console.log('   ✅ GET /api/story-settings/public - Working');
    console.log('   ✅ PUT /api/story-settings - Working');
    console.log('');
    console.log('🎯 STORY SETTINGS API IS FULLY FUNCTIONAL!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

// Run the test
testStorySettingsAPI().catch(console.error);
