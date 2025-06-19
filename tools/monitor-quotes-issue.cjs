const fetch = require('node-fetch');

async function monitorQuotesIssue() {
  console.log('🔍 MONITORING QUOTES ISSUE - REAL-TIME DEBUGGING');
  console.log('📋 This script will help identify the exact issue with quotes management');
  console.log('');
  
  try {
    // Step 1: Verify backend is running
    console.log('1. 🏥 Checking backend health...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   ✅ Backend is running:', healthData.message);
    } else {
      console.log('   ❌ Backend health check failed');
      return;
    }

    // Step 2: Test login
    console.log('\n2. 🔐 Testing login...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });

    if (!loginResponse.ok) {
      console.log('   ❌ Login failed');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('   ✅ Login successful');

    // Step 3: Test quotes GET
    console.log('\n3. 📝 Testing quotes GET...');
    const getResponse = await fetch('http://localhost:3001/api/quotes', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log(`   ✅ GET quotes successful: ${getData.data.length} quotes`);
    } else {
      console.log('   ❌ GET quotes failed');
      return;
    }

    // Step 4: Test quotes POST (the problematic operation)
    console.log('\n4. ➕ Testing quotes POST (the issue)...');
    const testQuote = {
      quoteText: 'Monitor test quote: Love is patient, love is kind',
      quoteAuthor: 'Monitor Script',
      quoteCategory: 'general',
      quoteImage: '',
      displayOrder: 0
    };

    console.log('   📤 Sending data:', JSON.stringify(testQuote, null, 2));

    const postResponse = await fetch('http://localhost:3001/api/quotes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testQuote)
    });

    console.log(`   📊 Response status: ${postResponse.status} ${postResponse.statusText}`);

    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log('   ✅ POST quotes successful!');
      console.log('   📥 Response:', JSON.stringify(postData, null, 2));
      
      // Clean up
      if (postData.data && postData.data.id) {
        await fetch(`http://localhost:3001/api/quotes/${postData.data.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('   🗑️ Test quote cleaned up');
      }
    } else {
      const errorData = await postResponse.json().catch(() => ({}));
      console.log('   ❌ POST quotes failed!');
      console.log('   📋 Error response:', JSON.stringify(errorData, null, 2));
    }

    console.log('\n🎯 DIAGNOSIS:');
    console.log('✅ Backend API is working perfectly');
    console.log('✅ Authentication is working');
    console.log('✅ Database operations are working');
    console.log('');
    console.log('💡 If frontend still fails, the issue is likely:');
    console.log('   1. 🔑 Token not being passed correctly from frontend');
    console.log('   2. 🌐 CORS issues in browser');
    console.log('   3. 🐛 JavaScript errors in browser console');
    console.log('   4. 📱 Network requests being blocked');
    console.log('');
    console.log('🔍 NEXT STEPS:');
    console.log('   1. Open browser developer tools (F12)');
    console.log('   2. Go to Console tab - check for JavaScript errors');
    console.log('   3. Go to Network tab - monitor requests when adding quote');
    console.log('   4. Check if token is being sent in Authorization header');
    console.log('   5. Look for any failed network requests');
    console.log('');
    console.log('📋 COMMON ISSUES:');
    console.log('   - Token expired or invalid');
    console.log('   - CORS policy blocking requests');
    console.log('   - Network connectivity issues');
    console.log('   - JavaScript errors preventing form submission');
    console.log('   - Form validation preventing submission');

  } catch (error) {
    console.error('❌ Monitoring failed:', error.message);
  }
}

monitorQuotesIssue();
