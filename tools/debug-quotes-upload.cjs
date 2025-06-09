#!/usr/bin/env node

const mysql = require('mysql2/promise');

// Use dynamic import for node-fetch v3
async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function debugQuotesUpload() {
  console.log('🔍 DEBUGGING QUOTES UPLOAD ISSUE\n');

  try {
    const fetch = await getFetch();
    
    // Step 1: Check current quotes in database
    console.log('1. 📋 Checking current quotes in database...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    const [currentQuotes] = await connection.query(`
      SELECT id, quote_text, quote_author, quote_category, quote_image_url, is_active, created_at
      FROM quotes_settings 
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log(`   Found ${currentQuotes.length} quotes in database:`);
    currentQuotes.forEach((quote, index) => {
      console.log(`     ${index + 1}. "${quote.quote_text?.substring(0, 30)}..." - ${quote.quote_author} (Active: ${quote.is_active})`);
    });

    await connection.end();

    // Step 2: Test authentication
    console.log('\n2. 🔐 Testing authentication...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' }),
    });

    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }

    const { token } = await loginResponse.json();
    console.log('   ✅ Authentication successful');

    // Step 3: Test POST quote with detailed logging
    console.log('\n3. ➕ Testing POST quote with detailed logging...');
    const testQuote = {
      quoteText: `Debug upload test ${Date.now()}`,
      quoteAuthor: 'Debug Author',
      quoteCategory: 'general',
      displayOrder: 1,
      quoteImage: '' // No image for now
    };

    console.log('   Sending quote data:', testQuote);

    const postResponse = await fetch('http://localhost:3001/api/quotes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testQuote),
    });

    console.log(`   Response status: ${postResponse.status}`);
    console.log(`   Response headers:`, Object.fromEntries(postResponse.headers));

    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log('   ✅ POST successful');
      console.log('   Response data:', postData);
    } else {
      const errorText = await postResponse.text();
      console.log('   ❌ POST failed');
      console.log('   Error response:', errorText);
    }

    // Step 4: Check database after POST
    console.log('\n4. 🗄️ Checking database after POST...');
    const connection2 = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    const [afterQuotes] = await connection2.query(`
      SELECT id, quote_text, quote_author, quote_category, quote_image_url, is_active, created_at
      FROM quotes_settings 
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log(`   Now ${afterQuotes.length} quotes in database:`);
    afterQuotes.forEach((quote, index) => {
      console.log(`     ${index + 1}. "${quote.quote_text?.substring(0, 30)}..." - ${quote.quote_author} (Active: ${quote.is_active})`);
    });

    // Check if our test quote was added
    const ourQuote = afterQuotes.find(q => q.quote_text?.includes('Debug upload test'));
    if (ourQuote) {
      console.log('   ✅ Test quote found in database:', {
        id: ourQuote.id,
        text: ourQuote.quote_text,
        author: ourQuote.quote_author,
        active: ourQuote.is_active
      });
    } else {
      console.log('   ❌ Test quote NOT found in database');
    }

    await connection2.end();

    // Step 5: Test GET quotes to see what frontend receives
    console.log('\n5. 📖 Testing GET quotes (what frontend sees)...');
    const getResponse = await fetch('http://localhost:3001/api/quotes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log(`   ✅ GET successful - ${getData.data?.length || 0} quotes returned`);
      
      if (getData.data && getData.data.length > 0) {
        console.log('   Sample quote from API:', {
          id: getData.data[0].id,
          quote_text: getData.data[0].quote_text,
          quote_author: getData.data[0].quote_author,
          is_active: getData.data[0].is_active
        });

        // Check if our test quote appears in API response
        const ourQuoteInAPI = getData.data.find(q => q.quote_text?.includes('Debug upload test'));
        if (ourQuoteInAPI) {
          console.log('   ✅ Test quote appears in API response');
        } else {
          console.log('   ❌ Test quote does NOT appear in API response');
          console.log('   This suggests JOIN condition or is_active filtering issue');
        }
      }
    } else {
      console.log('   ❌ GET failed');
    }

    // Step 6: Check image upload path
    console.log('\n6. 📁 Checking image upload configuration...');
    const fs = require('fs');
    const path = require('path');
    
    const expectedPath = 'C:\\Project\\wira-sofi-\\public\\images\\QuotesDatabase';
    const currentPath = path.join(__dirname, '../public/images/quotes');
    
    console.log('   Expected path:', expectedPath);
    console.log('   Current backend path:', currentPath);
    console.log('   Expected path exists:', fs.existsSync(expectedPath));
    console.log('   Current path exists:', fs.existsSync(currentPath));

    // Create the expected directory if it doesn't exist
    if (!fs.existsSync(expectedPath)) {
      console.log('   Creating expected directory...');
      fs.mkdirSync(expectedPath, { recursive: true });
      console.log('   ✅ Directory created');
    }

    console.log('\n🎯 DIAGNOSIS SUMMARY:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 POSSIBLE ISSUES:');
    console.log('1. Image upload path mismatch (quotes vs QuotesDatabase)');
    console.log('2. Data being saved but not appearing due to JOIN conditions');
    console.log('3. Frontend showing "unknown" due to missing data fields');
    console.log('4. is_active flag or wedding_id causing filtering issues');
    console.log('═══════════════════════════════════════════════════════');

  } catch (error) {
    console.error('\n❌ Debug failed:', error.message);
    console.error('   Stack:', error.stack);
  }
}

debugQuotesUpload();
