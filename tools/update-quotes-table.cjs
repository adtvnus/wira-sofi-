const mysql = require('mysql2/promise');

async function updateQuotesTable() {
  console.log('🔧 UPDATING QUOTES TABLE STRUCTURE');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // Add missing columns
    console.log('\n🔧 Adding missing columns...');
    
    const columnsToAdd = [
      { name: 'quote_category', type: 'VARCHAR(100)', default: '"general"' },
      { name: 'quote_image_url', type: 'VARCHAR(500)', default: '""' },
      { name: 'display_order', type: 'INT', default: '0' },
      { name: 'header_title', type: 'VARCHAR(255)', default: '"Words of Love"' },
      { name: 'header_subtitle', type: 'VARCHAR(255)', default: '"Beautiful Words"' },
      { name: 'bottom_message', type: 'VARCHAR(255)', default: '"Love Quotes"' },
      { name: 'quotes_image', type: 'VARCHAR(500)', default: '""' }
    ];

    for (const column of columnsToAdd) {
      try {
        await connection.query(`ALTER TABLE quotes_settings ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.default}`);
        console.log(`  ✅ Added ${column.name} column`);
      } catch (error) {
        if (error.message.includes('Duplicate column')) {
          console.log(`  ✅ ${column.name} column already exists`);
        } else {
          console.log(`  ❌ Error adding ${column.name}:`, error.message);
        }
      }
    }

    // Check final structure
    console.log('\n📋 Final quotes_settings structure:');
    const [columns] = await connection.query('DESCRIBE quotes_settings');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type}`);
    });

    await connection.end();
    
    console.log('\n🎉 QUOTES TABLE UPDATED SUCCESSFULLY!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateQuotesTable();
