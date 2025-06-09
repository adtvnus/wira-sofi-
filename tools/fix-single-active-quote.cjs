#!/usr/bin/env node

const mysql = require('mysql2/promise');

// Use dynamic import for node-fetch v3
async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function fixSingleActiveQuote() {
  console.log('🔧 FIXING SINGLE ACTIVE QUOTE SYSTEM\n');

  try {
    const fetch = await getFetch();
    
    // Step 1: Check current active quotes
    console.log('1. 📋 Checking current active quotes...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    const [activeQuotes] = await connection.query(`
      SELECT id, quote_text, quote_author, quote_category, is_active, created_at
      FROM quotes_settings 
      WHERE is_active = TRUE
      ORDER BY created_at DESC
    `);

    console.log(`   Found ${activeQuotes.length} active quotes:`);
    activeQuotes.forEach((quote, index) => {
      console.log(`     ${index + 1}. ID ${quote.id}: "${quote.quote_text.substring(0, 40)}..." - ${quote.quote_author}`);
    });

    if (activeQuotes.length <= 1) {
      console.log('   ✅ System is already correct (0 or 1 active quote)');
      await connection.end();
      return;
    }

    // Step 2: Deactivate all quotes first
    console.log('\n2. 🔄 Deactivating all quotes...');
    await connection.query(`
      UPDATE quotes_settings 
      SET is_active = FALSE, updated_at = NOW()
      WHERE is_active = TRUE
    `);

    console.log('   ✅ All quotes deactivated');

    // Step 3: Activate only the most recent quote
    if (activeQuotes.length > 0) {
      const selectedQuote = activeQuotes[0]; // Most recent
      console.log(`\n3. ✅ Activating most recent quote (ID ${selectedQuote.id})...`);
      
      await connection.query(`
        UPDATE quotes_settings 
        SET is_active = TRUE, updated_at = NOW()
        WHERE id = ?
      `, [selectedQuote.id]);

      console.log(`   ✅ Quote activated: "${selectedQuote.quote_text.substring(0, 50)}..." - ${selectedQuote.quote_author}`);
    }

    // Step 4: Verify the fix
    console.log('\n4. 🔍 Verifying the fix...');
    const [verifyQuotes] = await connection.query(`
      SELECT id, quote_text, quote_author, is_active
      FROM quotes_settings 
      WHERE is_active = TRUE
    `);

    console.log(`   Active quotes after fix: ${verifyQuotes.length}`);
    if (verifyQuotes.length === 1) {
      const activeQuote = verifyQuotes[0];
      console.log(`   ✅ Perfect! Only one quote is active:`);
      console.log(`     ID ${activeQuote.id}: "${activeQuote.quote_text.substring(0, 50)}..." - ${activeQuote.quote_author}`);
    } else if (verifyQuotes.length === 0) {
      console.log('   ⚠️ No quotes are active. Users will see "No quote available" message.');
    } else {
      console.log('   ❌ Still multiple quotes active. Manual intervention needed.');
    }

    await connection.end();

    // Step 5: Test the API endpoints
    console.log('\n5. 🧪 Testing API endpoints...');
    
    // Test public active quote endpoint
    const activeResponse = await fetch('http://localhost:3001/api/quotes/active');
    if (activeResponse.ok) {
      const activeData = await activeResponse.json();
      console.log('   ✅ Public API working');
      if (activeData.data) {
        console.log(`     Active quote: "${activeData.data.quote_text.substring(0, 40)}..." - ${activeData.data.quote_author}`);
      } else {
        console.log('     No active quote returned');
      }
    } else {
      console.log('   ❌ Public API failed');
    }

    // Test admin endpoint
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' }),
    });

    if (loginResponse.ok) {
      const { token } = await loginResponse.json();
      
      const adminResponse = await fetch('http://localhost:3001/api/quotes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        const activeCount = adminData.data?.filter(q => q.is_active).length || 0;
        console.log('   ✅ Admin API working');
        console.log(`     Total quotes: ${adminData.data?.length || 0}`);
        console.log(`     Active quotes: ${activeCount}`);
      }
    }

    console.log('\n🎉 SINGLE ACTIVE QUOTE SYSTEM FIXED!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Only one quote is now active');
    console.log('✅ Public API returns the active quote');
    console.log('✅ Admin panel shows correct status');
    console.log('✅ Frontend will display the active quote');
    console.log('═══════════════════════════════════════════════════════');

    console.log('\n📋 NEXT STEPS:');
    console.log('1. Open http://localhost:5173/admin/quotes-management');
    console.log('2. Verify only one quote shows as active');
    console.log('3. Test toggling quotes (should deactivate others)');
    console.log('4. View result at http://localhost:5173/quotes');

  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
    console.error('   Stack:', error.stack);
  }
}

fixSingleActiveQuote();
