const fetch = require('node-fetch');

async function testFrontendAuth() {
  console.log('🔍 TESTING FRONTEND AUTHENTICATION FLOW');
  
  try {
    const API_BASE_URL = 'http://localhost:3001/api';
    
    // Step 1: Test health check (same as frontend)
    console.log('\n1. 🏥 Testing health check...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      mode: 'cors'
    });
    
    console.log(`   Status: ${healthResponse.status} ${healthResponse.statusText}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   ✅ Health check successful:', healthData);
    } else {
      console.log('   ❌ Health check failed');
      return;
    }

    // Step 2: Test login (exact same as frontend)
    console.log('\n2. 🔐 Testing login (exact same as frontend)...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({ username: 'admin', password: 'admin' }),
    });

    console.log(`   Login status: ${loginResponse.status} ${loginResponse.statusText}`);
    
    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.log('   ❌ Login failed:', errorData);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('   ✅ Login successful');
    console.log(`   Token: ${loginData.token.substring(0, 20)}...`);
    console.log(`   User: ${loginData.user.fullName} (${loginData.user.role})`);

    const token = loginData.token;

    // Step 3: Test token verification (same as frontend)
    console.log('\n3. 🔍 Testing token verification...');
    const verifyResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`   Verify status: ${verifyResponse.status} ${verifyResponse.statusText}`);
    
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('   ✅ Token verification successful');
      console.log(`   Verified user: ${verifyData.user.fullName}`);
    } else {
      console.log('   ❌ Token verification failed');
      return;
    }

    // Step 4: Test quotes API with token (exact same as frontend)
    console.log('\n4. 📝 Testing quotes API with token...');
    const quotesResponse = await fetch(`${API_BASE_URL}/quotes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`   Quotes status: ${quotesResponse.status} ${quotesResponse.statusText}`);
    
    if (quotesResponse.ok) {
      const quotesData = await quotesResponse.json();
      console.log('   ✅ Quotes API successful');
      console.log(`   Found ${quotesData.data.length} quotes`);
    } else {
      const errorData = await quotesResponse.json();
      console.log('   ❌ Quotes API failed:', errorData);
      return;
    }

    // Step 5: Test add quote (exact same as frontend)
    console.log('\n5. ➕ Testing add quote (exact same as frontend)...');
    const addQuoteResponse = await fetch(`${API_BASE_URL}/quotes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quoteText: 'Frontend auth test quote',
        quoteAuthor: 'Auth Test',
        quoteCategory: 'general',
        quoteImage: '',
        displayOrder: 0
      }),
    });

    console.log(`   Add quote status: ${addQuoteResponse.status} ${addQuoteResponse.statusText}`);
    
    if (addQuoteResponse.ok) {
      const addData = await addQuoteResponse.json();
      console.log('   ✅ Add quote successful!');
      console.log(`   New quote ID: ${addData.data.id}`);
      
      // Clean up
      const deleteResponse = await fetch(`${API_BASE_URL}/quotes/${addData.data.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (deleteResponse.ok) {
        console.log('   ✅ Test quote cleaned up');
      }
    } else {
      const errorData = await addQuoteResponse.json();
      console.log('   ❌ Add quote failed:', errorData);
    }

    console.log('\n🎉 FRONTEND AUTHENTICATION FLOW TEST COMPLETED!');
    console.log('\n✅ All authentication steps working correctly');
    console.log('💡 If frontend still fails, check:');
    console.log('   - Browser console for JavaScript errors');
    console.log('   - Network tab for failed requests');
    console.log('   - localStorage for token storage');
    console.log('   - CORS headers in browser');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testFrontendAuth();
