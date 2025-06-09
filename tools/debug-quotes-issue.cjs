#!/usr/bin/env node

const mysql = require('mysql2/promise');

// Use dynamic import for node-fetch v3
async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function debugQuotesIssue() {
  console.log('🔍 DEBUGGING QUOTES MANAGEMENT ISSUE\n');

  try {
    // Step 1: Check database tables
    console.log('1. 📋 Checking quotes tables in database...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    // Check what quotes tables exist
    const [tables] = await connection.query("SHOW TABLES LIKE '%quotes%'");
    console.log('   Found quotes tables:', tables.map(t => Object.values(t)[0]));

    // Check quotes_settings table
    if (tables.some(t => Object.values(t)[0] === 'quotes_settings')) {
      console.log('\n   📊 quotes_settings table structure:');
      const [columns] = await connection.query("DESCRIBE quotes_settings");
      console.table(columns);

      const [count] = await connection.query("SELECT COUNT(*) as total FROM quotes_settings");
      console.log(`   Records in quotes_settings: ${count[0].total}`);

      if (count[0].total > 0) {
        const [records] = await connection.query("SELECT * FROM quotes_settings LIMIT 3");
        console.log('   Sample records:');
        console.table(records);
      }
    }

    // Check wedding_quotes table
    if (tables.some(t => Object.values(t)[0] === 'wedding_quotes')) {
      console.log('\n   📊 wedding_quotes table structure:');
      const [columns] = await connection.query("DESCRIBE wedding_quotes");
      console.table(columns);

      const [count] = await connection.query("SELECT COUNT(*) as total FROM wedding_quotes");
      console.log(`   Records in wedding_quotes: ${count[0].total}`);

      if (count[0].total > 0) {
        const [records] = await connection.query("SELECT * FROM wedding_quotes LIMIT 3");
        console.log('   Sample records:');
        console.table(records);
      }
    }

    await connection.end();

    // Step 2: Test API endpoints
    console.log('\n2. 🧪 Testing Quotes API...');
    const fetch = await getFetch();
    
    // Login first
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' }),
    });

    if (!loginResponse.ok) {
      console.log('   ❌ Login failed');
      return;
    }

    const { token } = await loginResponse.json();
    console.log('   ✅ Login successful');

    // Test GET quotes
    console.log('\n   Testing GET /api/quotes...');
    const getResponse = await fetch('http://localhost:3001/api/quotes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`   Status: ${getResponse.status}`);
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log(`   Success: ${getData.success}`);
      console.log(`   Data count: ${getData.data ? getData.data.length : 0}`);
      if (getData.data && getData.data.length > 0) {
        console.log('   Sample quote:', {
          id: getData.data[0].id,
          quote_text: getData.data[0].quote_text,
          quote_author: getData.data[0].quote_author,
          is_active: getData.data[0].is_active
        });
      }
    } else {
      const errorText = await getResponse.text();
      console.log(`   Error: ${errorText}`);
    }

    // Test POST quotes
    console.log('\n   Testing POST /api/quotes...');
    const testQuote = {
      quoteText: `Debug test quote ${Date.now()}`,
      quoteAuthor: 'Debug Author',
      quoteCategory: 'general',
      displayOrder: 1
    };

    const postResponse = await fetch('http://localhost:3001/api/quotes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testQuote),
    });

    console.log(`   Status: ${postResponse.status}`);
    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log(`   Success: ${postData.success}`);
      console.log(`   New quote ID: ${postData.data ? postData.data.id : 'unknown'}`);
    } else {
      const errorText = await postResponse.text();
      console.log(`   Error: ${errorText}`);
    }

    // Test GET again to see if new quote appears
    console.log('\n   Testing GET /api/quotes again...');
    const getResponse2 = await fetch('http://localhost:3001/api/quotes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (getResponse2.ok) {
      const getData2 = await getResponse2.json();
      console.log(`   Data count after POST: ${getData2.data ? getData2.data.length : 0}`);
    }

    // Step 3: Check backend query
    console.log('\n3. 🔍 Analyzing Backend Query...');
    console.log('   Backend GET query:');
    console.log(`   SELECT q.*, c.groom_first_name, c.bride_first_name
      FROM quotes_settings q
      JOIN wedding_settings w ON q.wedding_id = w.id
      LEFT JOIN couple_settings c ON w.id = c.wedding_id AND c.is_active = TRUE
      WHERE q.is_active = TRUE AND w.is_active = TRUE
      ORDER BY q.created_at DESC`);

    // Test this query directly
    const connection2 = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    try {
      const [queryResult] = await connection2.query(`
        SELECT q.*, c.groom_first_name, c.bride_first_name
        FROM quotes_settings q
        JOIN wedding_settings w ON q.wedding_id = w.id
        LEFT JOIN couple_settings c ON w.id = c.wedding_id AND c.is_active = TRUE
        WHERE q.is_active = TRUE AND w.is_active = TRUE
        ORDER BY q.created_at DESC
      `);
      console.log(`   Direct query result count: ${queryResult.length}`);
      if (queryResult.length > 0) {
        console.log('   Sample result:', {
          id: queryResult[0].id,
          quote_text: queryResult[0].quote_text,
          is_active: queryResult[0].is_active,
          wedding_id: queryResult[0].wedding_id
        });
      }
    } catch (queryError) {
      console.log(`   ❌ Direct query failed: ${queryError.message}`);
    }

    await connection2.end();

    console.log('\n🎯 DIAGNOSIS SUMMARY:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 POSSIBLE ISSUES:');
    console.log('1. Table name mismatch (quotes_settings vs wedding_quotes)');
    console.log('2. JOIN conditions failing (wedding_settings not active)');
    console.log('3. Data being inserted but not visible due to JOIN');
    console.log('4. Frontend not refreshing after successful POST');
    console.log('5. is_active flag set to FALSE by default');
    console.log('═══════════════════════════════════════════════════════');

  } catch (error) {
    console.error('\n❌ Debug failed:', error.message);
  }
}

debugQuotesIssue();
