const mysql = require('mysql2/promise');

async function testQuotes() {
  console.log('🧪 TESTING QUOTES FUNCTIONALITY');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // Test 1: Check if quotes_settings table exists and has data
    console.log('\n1. 📋 Checking quotes_settings table...');
    const [quotes] = await connection.query('SELECT * FROM quotes_settings');
    console.log(`   Found ${quotes.length} quotes in database`);
    
    if (quotes.length > 0) {
      quotes.forEach((quote, index) => {
        console.log(`   Quote ${index + 1}: "${quote.quote_text.substring(0, 50)}..." by ${quote.quote_author}`);
      });
    }

    // Test 2: Try to insert a new quote
    console.log('\n2. ➕ Testing quote insertion...');
    const testQuote = {
      wedding_id: 1,
      quote_text: 'Test quote: Love is the bridge between two hearts.',
      quote_author: 'Test Author',
      created_by: 1
    };
    
    const [insertResult] = await connection.query(
      'INSERT INTO quotes_settings (wedding_id, quote_text, quote_author, created_by) VALUES (?, ?, ?, ?)',
      [testQuote.wedding_id, testQuote.quote_text, testQuote.quote_author, testQuote.created_by]
    );
    
    console.log(`   ✅ Quote inserted with ID: ${insertResult.insertId}`);

    // Test 3: Check if we can retrieve the new quote
    console.log('\n3. 🔍 Verifying quote retrieval...');
    const [newQuotes] = await connection.query('SELECT * FROM quotes_settings WHERE id = ?', [insertResult.insertId]);
    
    if (newQuotes.length > 0) {
      console.log(`   ✅ Quote retrieved: "${newQuotes[0].quote_text}"`);
    } else {
      console.log('   ❌ Failed to retrieve inserted quote');
    }

    // Test 4: Test quote update
    console.log('\n4. ✏️ Testing quote update...');
    await connection.query(
      'UPDATE quotes_settings SET quote_text = ? WHERE id = ?',
      ['Updated test quote: Love conquers all.', insertResult.insertId]
    );
    
    const [updatedQuotes] = await connection.query('SELECT * FROM quotes_settings WHERE id = ?', [insertResult.insertId]);
    console.log(`   ✅ Quote updated: "${updatedQuotes[0].quote_text}"`);

    // Test 5: Test quote deletion (cleanup)
    console.log('\n5. 🗑️ Cleaning up test quote...');
    await connection.query('DELETE FROM quotes_settings WHERE id = ?', [insertResult.insertId]);
    console.log('   ✅ Test quote deleted');

    // Test 6: Final count
    console.log('\n6. 📊 Final quote count...');
    const [finalQuotes] = await connection.query('SELECT COUNT(*) as count FROM quotes_settings');
    console.log(`   Total quotes: ${finalQuotes[0].count}`);

    await connection.end();
    
    console.log('\n🎉 QUOTES FUNCTIONALITY TEST COMPLETED SUCCESSFULLY!');
    console.log('✅ Database operations working correctly');
    console.log('✅ Ready for frontend quote management');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testQuotes();
