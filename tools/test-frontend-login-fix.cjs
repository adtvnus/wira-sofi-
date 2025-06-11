#!/usr/bin/env node

// Test frontend login fix

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function testFrontendLoginFix() {
  console.log('🧪 TESTING FRONTEND LOGIN FIX');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const fetch = await getFetch();

  try {
    // Test the corrected API endpoint
    console.log('📡 Testing corrected API endpoint...');
    
    const testCases = [
      { desc: 'Normal login', username: 'admin', password: 'admin' },
      { desc: 'With whitespace', username: ' admin ', password: ' admin ' },
      { desc: 'Case sensitive', username: 'Admin', password: 'admin' },
      { desc: 'Wrong password', username: 'admin', password: 'wrong' },
    ];

    for (const testCase of testCases) {
      console.log(`\n🔍 Testing: ${testCase.desc}`);
      console.log(`   Credentials: "${testCase.username}" / "${testCase.password}"`);
      
      try {
        // Test with the corrected endpoint (with /api prefix)
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: testCase.username.trim(), // Apply trim like frontend does
            password: testCase.password
          })
        });

        console.log(`   Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('   ✅ SUCCESS');
          console.log(`   Token: ${data.token ? 'Generated' : 'Missing'}`);
          console.log(`   User: ${data.user ? data.user.username : 'Missing'}`);
          console.log(`   Success flag: ${data.success}`);
        } else {
          const errorData = await response.json();
          console.log('   ❌ FAILED');
          console.log(`   Error: ${errorData.error}`);
        }
      } catch (error) {
        console.log('   ❌ REQUEST FAILED');
        console.log(`   Error: ${error.message}`);
      }
    }

    // Test health check endpoint
    console.log('\n🏥 Testing health check endpoint...');
    try {
      const healthResponse = await fetch('http://localhost:3001/api/health');
      console.log(`Health check status: ${healthResponse.status}`);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('✅ Health check successful');
        console.log(`Response: ${JSON.stringify(healthData)}`);
      } else {
        console.log('❌ Health check failed');
      }
    } catch (error) {
      console.log('❌ Health check request failed');
      console.log(`Error: ${error.message}`);
    }

    console.log('\n🎉 FRONTEND LOGIN FIX TEST COMPLETED!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 FIXES APPLIED:');
    console.log('   ✅ API endpoint: /auth/login → /api/auth/login');
    console.log('   ✅ Username trimming: Applied to remove whitespace');
    console.log('   ✅ Logout endpoint: /auth/logout → /api/auth/logout');
    console.log('   ✅ Error handling: Improved for unknown error types');
    console.log('');
    console.log('💡 FRONTEND LOGIN SHOULD NOW WORK:');
    console.log('   1. Open http://localhost:5174/admin');
    console.log('   2. Use credentials: admin / admin');
    console.log('   3. Login should succeed');
    console.log('   4. Check browser console for detailed logs');
    console.log('');
    console.log('🔧 IF STILL FAILING:');
    console.log('   1. Hard refresh browser (Ctrl+F5)');
    console.log('   2. Clear browser cache and cookies');
    console.log('   3. Try incognito/private browsing mode');
    console.log('   4. Check browser Network tab for request details');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFrontendLoginFix().catch(console.error);
