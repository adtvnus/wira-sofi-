#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function fixQuotesTableStructure() {
  console.log('🔧 FIXING QUOTES_SETTINGS TABLE STRUCTURE\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // Check current table structure
    console.log('\n1. 📋 Current quotes_settings table structure:');
    const [columns] = await connection.query("DESCRIBE quotes_settings");
    const columnNames = columns.map(col => col.Field);
    console.log('   Columns:', columnNames);

    // Add missing columns for quotes
    const requiredColumns = [
      'quote_text',
      'quote_author', 
      'quote_category',
      'quote_image_url',
      'display_order'
    ];

    console.log('\n2. 🏗️ Adding missing columns...');
    for (const column of requiredColumns) {
      if (!columnNames.includes(column)) {
        console.log(`   Adding column: ${column}`);
        
        let columnDef = '';
        switch (column) {
          case 'quote_text':
            columnDef = 'TEXT NOT NULL';
            break;
          case 'quote_author':
            columnDef = 'VARCHAR(100) NULL';
            break;
          case 'quote_category':
            columnDef = "ENUM('love', 'marriage', 'blessing', 'general') DEFAULT 'general'";
            break;
          case 'quote_image_url':
            columnDef = 'VARCHAR(255) NULL';
            break;
          case 'display_order':
            columnDef = 'INT DEFAULT 0';
            break;
        }
        
        await connection.query(`ALTER TABLE quotes_settings ADD COLUMN ${column} ${columnDef}`);
      } else {
        console.log(`   ✅ Column ${column} already exists`);
      }
    }

    // Migrate existing data from header_title to quote_text if needed
    console.log('\n3. 📝 Migrating existing data...');
    const [existingData] = await connection.query(`
      SELECT id, header_title, header_subtitle 
      FROM quotes_settings 
      WHERE quote_text IS NULL OR quote_text = ''
    `);

    for (const row of existingData) {
      if (row.header_title && row.header_title !== 'Words of Love') {
        console.log(`   Migrating quote ID ${row.id}: "${row.header_title}"`);
        await connection.query(`
          UPDATE quotes_settings 
          SET quote_text = ?, 
              quote_author = ?,
              quote_category = 'general',
              display_order = 0
          WHERE id = ?
        `, [row.header_title, row.header_subtitle || 'Unknown', row.id]);
      }
    }

    // Clean up test data and invalid records
    console.log('\n4. 🧹 Cleaning up invalid records...');
    await connection.query(`
      DELETE FROM quotes_settings 
      WHERE quote_text IS NULL 
         OR quote_text = '' 
         OR quote_text LIKE 'Token test quote%'
         OR quote_text LIKE 'Verify quote%'
         OR quote_text LIKE 'Debug test quote%'
    `);

    // Insert some default quotes if table is empty
    console.log('\n5. 📝 Checking for default quotes...');
    const [count] = await connection.query("SELECT COUNT(*) as total FROM quotes_settings WHERE quote_text IS NOT NULL AND quote_text != ''");
    
    if (count[0].total === 0) {
      console.log('   Inserting default quotes...');
      
      const defaultQuotes = [
        {
          text: 'Cinta sejati tidak pernah berakhir. Kekasih mungkin berpisah, tetapi mereka tidak pernah berpisah sepenuhnya',
          author: 'Paulo Coelho',
          category: 'love'
        },
        {
          text: 'Pernikahan adalah tentang menjadi tim. Anda akan menghadapi dunia bersama-sama',
          author: 'Anonymous',
          category: 'marriage'
        },
        {
          text: 'Dalam pernikahan, cinta bukanlah perasaan semata, tetapi keputusan untuk mencintai setiap hari',
          author: 'Gary Chapman',
          category: 'marriage'
        }
      ];

      // Get wedding_id
      const [weddings] = await connection.query('SELECT id FROM wedding_settings WHERE is_active = TRUE LIMIT 1');
      const weddingId = weddings.length > 0 ? weddings[0].id : 1;

      for (let i = 0; i < defaultQuotes.length; i++) {
        const quote = defaultQuotes[i];
        await connection.query(`
          INSERT INTO quotes_settings (
            wedding_id, quote_text, quote_author, quote_category, 
            display_order, is_active, created_by,
            header_title, header_subtitle
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          weddingId, quote.text, quote.author, quote.category,
          i + 1, true, 1,
          'Words of Love', 'Kata-kata indah tentang cinta dan pernikahan'
        ]);
      }
      
      console.log(`   ✅ Inserted ${defaultQuotes.length} default quotes`);
    } else {
      console.log(`   ✅ Table already has ${count[0].total} valid quotes`);
    }

    // Verify final structure
    console.log('\n6. ✅ Final table structure:');
    const [finalColumns] = await connection.query("DESCRIBE quotes_settings");
    const finalColumnNames = finalColumns.map(col => col.Field);
    
    const hasAllRequired = requiredColumns.every(col => finalColumnNames.includes(col));
    console.log('   Has all required columns:', hasAllRequired ? '✅ YES' : '❌ NO');
    
    if (hasAllRequired) {
      console.log('   Required columns found:');
      requiredColumns.forEach(col => {
        console.log(`     ✅ ${col}`);
      });
    }

    // Show sample data
    console.log('\n7. 📄 Sample quotes data:');
    const [sampleData] = await connection.query(`
      SELECT id, quote_text, quote_author, quote_category, is_active 
      FROM quotes_settings 
      WHERE quote_text IS NOT NULL AND quote_text != ''
      LIMIT 3
    `);
    console.table(sampleData);

    await connection.end();
    console.log('\n🎉 Quotes table structure fixed successfully!');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Test the quotes management page');
    console.log('2. Try adding a new quote');
    console.log('3. Verify quotes appear in frontend');

  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
    console.error('   Error code:', error.code);
    console.error('   SQL State:', error.sqlState);
  }
}

fixQuotesTableStructure();
