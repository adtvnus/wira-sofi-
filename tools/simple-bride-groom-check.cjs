const mysql = require('mysql2/promise');

async function checkBrideGroomData() {
  let connection;
  
  try {
    console.log('🔍 Checking bride-groom data...\n');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });
    
    console.log('✅ Database connected\n');
    
    // Check bride_groom_detail_settings
    console.log('📊 BRIDE-GROOM DETAIL SETTINGS:');
    const [bgRows] = await connection.query('SELECT * FROM bride_groom_detail_settings ORDER BY updated_at DESC LIMIT 3');
    
    if (bgRows.length === 0) {
      console.log('❌ No data in bride_groom_detail_settings');
    } else {
      bgRows.forEach((row, i) => {
        console.log(`\n📝 Record ${i + 1}:`);
        console.log(`   Groom First: "${row.groom_first_name}"`);
        console.log(`   Groom Last: "${row.groom_last_name}"`);
        console.log(`   Groom Full: "${row.groom_full_name}"`);
        console.log(`   Bride First: "${row.bride_first_name}"`);
        console.log(`   Bride Last: "${row.bride_last_name}"`);
        console.log(`   Bride Full: "${row.bride_full_name}"`);
        console.log(`   Active: ${row.is_active}`);
      });
    }
    
    // Check wedding_settings
    console.log('\n\n📊 WEDDING SETTINGS:');
    const [wsRows] = await connection.query('SELECT * FROM wedding_settings ORDER BY updated_at DESC LIMIT 3');
    
    if (wsRows.length === 0) {
      console.log('❌ No data in wedding_settings');
    } else {
      wsRows.forEach((row, i) => {
        console.log(`\n📝 Record ${i + 1}:`);
        console.log(`   Groom Full: "${row.groom_full_name}"`);
        console.log(`   Bride Full: "${row.bride_full_name}"`);
        console.log(`   Bride-Groom ID: ${row.bride_groom_id}`);
        console.log(`   Active: ${row.is_active}`);
      });
    }
    
    console.log('\n✅ Check completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkBrideGroomData();
