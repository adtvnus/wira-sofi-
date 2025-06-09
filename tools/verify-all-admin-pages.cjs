#!/usr/bin/env node

// Use dynamic import for node-fetch v3
async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

const API_BASE_URL = 'http://localhost:3001/api';

async function verifyAllAdminPages() {
  console.log('🔍 VERIFYING ALL ADMIN PAGES AFTER TOKEN FIX\n');

  try {
    const fetch = await getFetch();
    
    // Step 1: Fresh login
    console.log('1. 🔐 Getting Fresh Authentication Token...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' }),
    });

    if (!loginResponse.ok) {
      console.log('   ❌ Login failed:', loginResponse.status);
      return false;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('   ✅ Fresh token obtained');
    console.log('   Token length:', token.length);

    // Step 2: Test all admin endpoints
    const tests = [
      {
        name: 'Guest Management - GET',
        method: 'GET',
        url: '/guests',
        expectedStatus: 200
      },
      {
        name: 'Guest Management - POST',
        method: 'POST',
        url: '/guests',
        body: {
          guestName: `Verify Test ${Date.now()}`,
          guestEmail: 'verify@test.com',
          guestPhone: '081234567890',
          guestCount: 1
        },
        expectedStatus: 201
      },
      {
        name: 'Quotes Management - GET',
        method: 'GET',
        url: '/quotes',
        expectedStatus: 200
      },
      {
        name: 'Quotes Management - POST',
        method: 'POST',
        url: '/quotes',
        body: {
          quoteText: `Verify quote ${Date.now()}`,
          quoteAuthor: 'Test Author',
          quoteCategory: 'general',
          displayOrder: 1
        },
        expectedStatus: 201
      },
      {
        name: 'Bride-Groom Management - GET',
        method: 'GET',
        url: '/bride-groom',
        expectedStatus: 200
      },
      {
        name: 'Thanks Management - GET',
        method: 'GET',
        url: '/thanks-settings',
        expectedStatus: 200
      }
    ];

    console.log('\n2. 🧪 Testing All Admin Endpoints...');
    let allPassed = true;

    for (const test of tests) {
      console.log(`\n   Testing: ${test.name}`);
      
      try {
        const options = {
          method: test.method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        };

        if (test.body) {
          options.body = JSON.stringify(test.body);
        }

        const response = await fetch(`${API_BASE_URL}${test.url}`, options);
        
        console.log(`     Status: ${response.status} (expected: ${test.expectedStatus})`);
        
        if (response.status === test.expectedStatus) {
          const data = await response.json();
          console.log(`     ✅ SUCCESS: ${data.success ? 'Data operation successful' : 'Response received'}`);
          
          if (test.method === 'GET' && data.data) {
            const dataInfo = Array.isArray(data.data) ? `${data.data.length} items` : 'object';
            console.log(`     📊 Data: ${dataInfo}`);
          }
        } else {
          const errorText = await response.text();
          console.log(`     ❌ FAILED: ${errorText}`);
          allPassed = false;
          
          // Check if it's the token issue
          if (response.status === 403 && errorText.includes('Invalid token')) {
            console.log(`     🚨 TOKEN ISSUE DETECTED: Still using expired token!`);
          }
        }
      } catch (error) {
        console.log(`     ❌ REQUEST FAILED: ${error.message}`);
        allPassed = false;
      }
    }

    // Step 3: Test specific problematic operations
    console.log('\n3. 🎯 Testing Previously Problematic Operations...');
    
    // Test updating bride-groom data
    console.log('\n   Testing Bride-Groom Update:');
    try {
      const updateResponse = await fetch(`${API_BASE_URL}/bride-groom/1`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groomFirstName: 'Test Groom',
          groomLastName: 'Lastname',
          groomFullName: 'Test Groom Lastname',
          groomParentNames: 'Parent Names',
          brideFirstName: 'Test Bride',
          brideLastName: 'Lastname',
          brideFullName: 'Test Bride Lastname',
          brideParentNames: 'Parent Names'
        }),
      });

      console.log(`     Status: ${updateResponse.status}`);
      if (updateResponse.ok) {
        console.log(`     ✅ Bride-Groom update successful`);
      } else {
        const errorText = await updateResponse.text();
        console.log(`     ❌ Bride-Groom update failed: ${errorText}`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`     ❌ Bride-Groom update error: ${error.message}`);
      allPassed = false;
    }

    // Test updating thanks settings
    console.log('\n   Testing Thanks Settings Update:');
    try {
      const thanksResponse = await fetch(`${API_BASE_URL}/thanks-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          headerTitle: 'Thank You Test',
          headerSubtitle: 'Test Subtitle',
          mainMessage: 'Test message for verification',
          subMessage: 'Test sub message',
          coupleNames: 'Test Couple',
          blessingQuoteArabic: 'Test Arabic',
          blessingQuoteTranslation: 'Test Translation',
          backgroundImage: '',
          showSocialMedia: false,
          socialMediaInstagram: '',
          socialMediaFacebook: '',
          socialMediaTwitter: ''
        }),
      });

      console.log(`     Status: ${thanksResponse.status}`);
      if (thanksResponse.ok) {
        console.log(`     ✅ Thanks settings update successful`);
      } else {
        const errorText = await thanksResponse.text();
        console.log(`     ❌ Thanks settings update failed: ${errorText}`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`     ❌ Thanks settings update error: ${error.message}`);
      allPassed = false;
    }

    // Final results
    console.log('\n🎯 VERIFICATION RESULTS:');
    console.log('═══════════════════════════════════════════════════════');
    
    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED! ✅');
      console.log('');
      console.log('✅ Guest Management: WORKING');
      console.log('✅ Quotes Management: WORKING');
      console.log('✅ Bride-Groom Management: WORKING');
      console.log('✅ Thanks Management: WORKING');
      console.log('');
      console.log('🔒 Token authentication: FIXED');
      console.log('📊 Database operations: WORKING');
      console.log('🌐 All admin pages: FUNCTIONAL');
    } else {
      console.log('❌ SOME TESTS FAILED');
      console.log('');
      console.log('🔧 TROUBLESHOOTING:');
      console.log('1. Make sure you cleared browser localStorage');
      console.log('2. Login again with fresh credentials');
      console.log('3. Check browser console for errors');
      console.log('4. Verify backend server is running');
    }
    
    console.log('═══════════════════════════════════════════════════════');

    return allPassed;

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    return false;
  }
}

verifyAllAdminPages().then(success => {
  if (success) {
    console.log('\n🎯 CONCLUSION: All admin pages are now working correctly!');
    console.log('You can now use all admin functionality without token errors.');
  } else {
    console.log('\n❌ CONCLUSION: Some issues still need attention.');
    console.log('Please follow the troubleshooting steps above.');
  }
});
