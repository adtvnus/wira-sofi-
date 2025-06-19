const mysql = require('mysql2/promise');

async function checkQuotesTable() {
  console.log('🔍 CHECKING QUOTES TABLE STRUCTURE');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // Check table structure
    console.log('\n📋 quotes_settings table structure:');
    const [columns] = await connection.query('DESCRIBE quotes_settings');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Default ? 'DEFAULT ' + col.Default : ''}`);
    });

    // Check current data
    console.log('\n📊 Current quotes data:');
    const [quotes] = await connection.query('SELECT * FROM quotes_settings');
    console.log(`Found ${quotes.length} quotes:`);
    quotes.forEach((quote, index) => {
      console.log(`  ${index + 1}. ID: ${quote.id}, Text: "${quote.quote_text.substring(0, 50)}...", Author: ${quote.quote_author}`);
    });

    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkQuotesTable();
