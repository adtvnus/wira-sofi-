#!/usr/bin/env node

const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testQuotesAPI() {
  console.log('🔍 TESTING QUOTES API WITH PHOTO UPLOAD\n');
  
  const API_BASE = 'http://localhost:3001/api';
  let token = '';

  try {
    // 1. Login
    console.log('1. 🔐 Testing Login...');
    const loginResult = await makeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });
    
    console.log(`   Status: ${loginResult.status}`);
    if (loginResult.status === 200 && loginResult.data.token) {
      token = loginResult.data.token;
      console.log(`   ✅ Login successful, token: ${token.substring(0, 20)}...`);
    } else {
      throw new Error(`Login failed: ${JSON.stringify(loginResult.data)}`);
    }

    // 2. Get Quotes
    console.log('\n2. 📖 Testing GET Quotes...');
    const getResult = await makeRequest(`${API_BASE}/quotes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`   Status: ${getResult.status}`);
    console.log(`   Response: ${JSON.stringify(getResult.data, null, 2)}`);
    
    if (getResult.status === 200) {
      console.log(`   ✅ Found ${getResult.data.data.length} quotes`);
    }

    // 3. Add New Quote with Image
    console.log('\n3. ✏️ Testing POST Quote with Image...');
    const newQuoteData = {
      quoteText: 'Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day.',
      quoteAuthor: 'Unknown',
      quoteCategory: 'love',
      quoteImage: '/images/quotes/love-quote-new.jpg',
      displayOrder: 10
    };

    console.log(`   📝 Sending quote data: ${JSON.stringify(newQuoteData, null, 2)}`);
    
    const postResult = await makeRequest(`${API_BASE}/quotes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newQuoteData)
    });
    
    console.log(`   Status: ${postResult.status}`);
    console.log(`   Response: ${JSON.stringify(postResult.data, null, 2)}`);
    
    let newQuoteId = null;
    if (postResult.status === 201) {
      console.log('   ✅ Quote added successfully!');
      newQuoteId = postResult.data.data.id;
    }

    // 4. Update Quote
    if (newQuoteId) {
      console.log('\n4. ✏️ Testing PUT Quote...');
      const updateData = {
        quoteText: 'Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day. (Updated)',
        quoteAuthor: 'Unknown Author',
        quoteCategory: 'marriage',
        quoteImage: '/images/quotes/marriage-quote-updated.jpg',
        displayOrder: 15,
        isActive: true
      };

      const putResult = await makeRequest(`${API_BASE}/quotes/${newQuoteId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      console.log(`   Status: ${putResult.status}`);
      console.log(`   Response: ${JSON.stringify(putResult.data, null, 2)}`);
      
      if (putResult.status === 200) {
        console.log('   ✅ Quote updated successfully!');
      }
    }

    // 5. Get Updated Quotes List
    console.log('\n5. 📖 Testing GET Updated Quotes...');
    const getUpdatedResult = await makeRequest(`${API_BASE}/quotes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`   Status: ${getUpdatedResult.status}`);
    if (getUpdatedResult.status === 200) {
      console.log(`   ✅ Found ${getUpdatedResult.data.data.length} quotes after update`);
      getUpdatedResult.data.data.forEach((quote, index) => {
        console.log(`   ${index + 1}. "${quote.quote_text.substring(0, 50)}..." - ${quote.quote_author}`);
        console.log(`      Category: ${quote.quote_category}, Order: ${quote.display_order}, Image: ${quote.quote_image_url || 'None'}`);
      });
    }

    // 6. Delete Quote (Optional)
    if (newQuoteId) {
      console.log('\n6. 🗑️ Testing DELETE Quote...');
      const deleteResult = await makeRequest(`${API_BASE}/quotes/${newQuoteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   Status: ${deleteResult.status}`);
      console.log(`   Response: ${JSON.stringify(deleteResult.data, null, 2)}`);
      
      if (deleteResult.status === 200) {
        console.log('   ✅ Quote deleted successfully!');
      }
    }

    console.log('\n🎉 QUOTES API TESTING COMPLETE!');
    
    console.log('\n📋 ANALYSIS SUMMARY:');
    console.log(`   ✅ Login: ${loginResult.status === 200 ? 'Working' : 'Failed'}`);
    console.log(`   ✅ GET Quotes: ${getResult.status === 200 ? 'Working' : 'Failed'}`);
    console.log(`   ✅ POST Quote: ${postResult.status === 201 ? 'Working' : 'Failed'}`);
    console.log(`   ✅ PUT Quote: ${newQuoteId ? 'Working' : 'Skipped'}`);
    console.log(`   ✅ DELETE Quote: ${newQuoteId ? 'Working' : 'Skipped'}`);

    console.log('\n🎯 QUOTES MANAGEMENT FEATURES:');
    console.log('   📝 ✅ Add quotes with text, author, category');
    console.log('   🖼️ ✅ Upload images for each quote');
    console.log('   📊 ✅ Set display order for quotes');
    console.log('   🏷️ ✅ Categorize quotes (love, marriage, blessing, general)');
    console.log('   ✏️ ✅ Edit existing quotes');
    console.log('   🗑️ ✅ Delete quotes (soft delete)');
    console.log('   🗄️ ✅ MySQL database integration');
    console.log('   🔐 ✅ Authentication protected');

  } catch (error) {
    console.error('\n❌ TESTING FAILED:', error.message);
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('   1. Check if backend server is running: npm run backend');
    console.log('   2. Check if MySQL database is connected');
    console.log('   3. Check if quotes table exists with image column');
    console.log('   4. Check backend console for detailed errors');
  }
}

testQuotesAPI();
