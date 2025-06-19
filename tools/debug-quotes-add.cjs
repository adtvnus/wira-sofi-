const fetch = require('node-fetch');

async function debugQuotesAdd() {
  console.log('🔍 DEBUGGING QUOTES ADD ISSUE');
  
  try {
    // Step 1: Login to get token
    console.log('\n1. 🔐 Getting authentication token...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin'
      })
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.log('   ❌ Login failed:', errorData);
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('   ✅ Login successful, token obtained');

    // Step 2: Test GET quotes (should work)
    console.log('\n2. 📝 Testing GET quotes...');
    const getResponse = await fetch('http://localhost:3001/api/quotes', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log(`   ✅ GET quotes successful: ${getData.data.length} quotes found`);
    } else {
      console.log('   ❌ GET quotes failed');
    }

    // Step 3: Test POST quotes with exact same data as frontend
    console.log('\n3. ➕ Testing POST quotes (same as frontend)...');
    const testQuoteData = {
      quoteText: 'Test quote from debug script',
      quoteAuthor: 'Debug Script',
      quoteCategory: 'general',
      quoteImage: '',
      displayOrder: 0
    };

    console.log('   📤 Sending data:', JSON.stringify(testQuoteData, null, 2));

    const postResponse = await fetch('http://localhost:3001/api/quotes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testQuoteData)
    });

    console.log(`   📊 Response status: ${postResponse.status} ${postResponse.statusText}`);

    const postData = await postResponse.json();
    console.log('   📥 Response data:', JSON.stringify(postData, null, 2));

    if (postResponse.ok) {
      console.log('   ✅ POST quotes successful!');
      
      // Clean up - delete the test quote
      console.log('\n4. 🗑️ Cleaning up test quote...');
      if (postData.data && postData.data.id) {
        const deleteResponse = await fetch(`http://localhost:3001/api/quotes/${postData.data.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (deleteResponse.ok) {
          console.log('   ✅ Test quote deleted');
        } else {
          console.log('   ⚠️ Could not delete test quote');
        }
      }
    } else {
      console.log('   ❌ POST quotes failed!');
      console.log('   📋 Error details:', postData);
    }

    // Step 4: Check database directly
    console.log('\n5. 🗄️ Checking database directly...');
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    const [quotes] = await connection.query('SELECT COUNT(*) as count FROM quotes_settings');
    console.log(`   📊 Total quotes in database: ${quotes[0].count}`);

    const [columns] = await connection.query('DESCRIBE quotes_settings');
    console.log('   📋 Table structure:');
    columns.forEach(col => {
      console.log(`      ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''}`);
    });

    await connection.end();

    console.log('\n🎉 DEBUG COMPLETED!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugQuotesAdd();
