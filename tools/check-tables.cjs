const mysql = require('mysql2/promise');

async function checkTables() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // Show all tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n📋 Current tables in database:');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });

    // Check specific tables we need
    const requiredTables = [
      'couple_settings',
      'bride_groom_detail_settings',
      'gallery_settings',
      'gallery_images',
      'gallery_text_settings'
    ];

    console.log('\n🔍 Checking required tables:');
    for (const tableName of requiredTables) {
      try {
        const [result] = await connection.query(`SHOW TABLES LIKE '${tableName}'`);
        if (result.length > 0) {
          console.log(`   ✅ ${tableName} - EXISTS`);
        } else {
          console.log(`   ❌ ${tableName} - MISSING`);
        }
      } catch (error) {
        console.log(`   ❌ ${tableName} - ERROR: ${error.message}`);
      }
    }

    await connection.end();

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

checkTables();
