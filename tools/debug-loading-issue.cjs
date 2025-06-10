#!/usr/bin/env node

// Debug loading issue on bride-groom management page

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function debugLoadingIssue() {
  console.log('🔍 DEBUGGING LOADING ISSUE');
  console.log('═══════════════════════════════════════════════════════');
  
  const fetch = await getFetch();

  try {
    // Step 1: Test authentication
    console.log('🔐 Step 1: Testing authentication...');
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

    // Step 2: Test bride-groom endpoint
    console.log('\n📊 Step 2: Testing bride-groom endpoint...');
    const brideGroomResponse = await fetch('http://localhost:3001/api/bride-groom', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`   Status: ${brideGroomResponse.status}`);
    
    if (brideGroomResponse.ok) {
      const brideGroomData = await brideGroomResponse.json();
      console.log('✅ Bride-groom endpoint working');
      console.log(`   Data: ${JSON.stringify(brideGroomData, null, 2)}`);
    } else {
      const errorText = await brideGroomResponse.text();
      console.log('❌ Bride-groom endpoint failed');
      console.log(`   Error: ${errorText}`);
    }

    // Step 3: Test bride-groom-detail endpoint
    console.log('\n📊 Step 3: Testing bride-groom-detail endpoint...');
    const detailResponse = await fetch('http://localhost:3001/api/bride-groom-detail', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`   Status: ${detailResponse.status}`);
    
    if (detailResponse.ok) {
      const detailData = await detailResponse.json();
      console.log('✅ Bride-groom-detail endpoint working');
      console.log(`   Data: ${JSON.stringify(detailData, null, 2)}`);
    } else {
      const errorText = await detailResponse.text();
      console.log('❌ Bride-groom-detail endpoint failed');
      console.log(`   Error: ${errorText}`);
    }

    // Step 4: Check if both endpoints return data
    console.log('\n🔍 Step 4: Analysis...');
    
    if (brideGroomResponse.ok && detailResponse.ok) {
      console.log('✅ Both API endpoints are working');
      console.log('💡 The loading issue might be in the frontend code');
      console.log('');
      console.log('🔧 Possible causes:');
      console.log('   1. useEffect dependency loop');
      console.log('   2. Missing error handling in frontend');
      console.log('   3. State update issue');
      console.log('   4. Token not available in frontend');
      console.log('   5. CORS issue in browser');
    } else {
      console.log('❌ One or both API endpoints are failing');
      console.log('💡 This explains why the loading never completes');
    }

    // Step 5: Recommendations
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('1. 🌐 Open browser developer tools:');
    console.log('   - Press F12');
    console.log('   - Go to Console tab');
    console.log('   - Look for error messages');
    console.log('');
    console.log('2. 📡 Check Network tab:');
    console.log('   - See if API requests are being made');
    console.log('   - Check if requests are failing');
    console.log('   - Look for CORS errors');
    console.log('');
    console.log('3. 🔄 Try these solutions:');
    console.log('   - Hard refresh (Ctrl+F5)');
    console.log('   - Clear browser cache');
    console.log('   - Try incognito mode');
    console.log('   - Check if logged in properly');
    console.log('');
    console.log('4. 🔍 Manual test:');
    console.log('   - Go to: http://localhost:5173/login');
    console.log('   - Login with admin/admin');
    console.log('   - Then go to bride-groom-management');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.log('\n🔧 Basic checks:');
    console.log('   1. Make sure backend server is running');
    console.log('   2. Make sure you are logged in');
    console.log('   3. Check browser console for errors');
  }
}

// Run the debug
debugLoadingIssue().catch(console.error);
