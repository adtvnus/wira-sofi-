const mysql = require('mysql2/promise');

async function checkBrideGroomNames() {
  let connection;
  
  try {
    console.log('🔍 Checking current bride-groom names in database...\n');
    
    // Database connection
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });
    
    console.log('✅ Database connected successfully\n');

    // First, check what tables exist
    console.log('📊 AVAILABLE TABLES:');
    console.log('=' .repeat(50));

    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   📋 ${tableName}`);
    });

    // Check bride_groom_detail_settings table
    console.log('\n📊 BRIDE-GROOM DETAIL SETTINGS TABLE:');
    console.log('=' .repeat(50));

    const [brideGroomRows] = await connection.query(`
      SELECT id, groom_first_name, groom_last_name, bride_first_name, bride_last_name,
             groom_full_name, bride_full_name, is_active, created_at, updated_at
      FROM bride_groom_detail_settings
      ORDER BY updated_at DESC
    `);
    
    if (brideGroomRows.length === 0) {
      console.log('❌ No data found in bride_groom_detail_settings table');
    } else {
      brideGroomRows.forEach((row, index) => {
        console.log(`\n📝 Record ${index + 1}:`);
        console.log(`   ID: ${row.id}`);
        console.log(`   Groom First Name: "${row.groom_first_name}"`);
        console.log(`   Groom Last Name: "${row.groom_last_name}"`);
        console.log(`   Groom Full Name: "${row.groom_full_name}"`);
        console.log(`   Bride First Name: "${row.bride_first_name}"`);
        console.log(`   Bride Last Name: "${row.bride_last_name}"`);
        console.log(`   Bride Full Name: "${row.bride_full_name}"`);
        console.log(`   Is Active: ${row.is_active}`);
        console.log(`   Updated: ${row.updated_at}`);
      });
    }
    
    // Check wedding_settings table
    console.log('\n\n📊 WEDDING SETTINGS TABLE:');
    console.log('=' .repeat(50));
    
    const [weddingRows] = await connection.query(`
      SELECT ws.id, ws.groom_full_name, ws.bride_full_name, ws.is_active,
             ws.bride_groom_id, ws.created_at, ws.updated_at
      FROM wedding_settings ws
      ORDER BY ws.updated_at DESC
    `);
    
    if (weddingRows.length === 0) {
      console.log('❌ No data found in wedding_settings table');
    } else {
      weddingRows.forEach((row, index) => {
        console.log(`\n📝 Record ${index + 1}:`);
        console.log(`   ID: ${row.id}`);
        console.log(`   Groom Full Name: "${row.groom_full_name}"`);
        console.log(`   Bride Full Name: "${row.bride_full_name}"`);
        console.log(`   Bride-Groom ID: ${row.bride_groom_id}`);
        console.log(`   Is Active: ${row.is_active}`);
        console.log(`   Updated: ${row.updated_at}`);
      });
    }
    
    // Check active wedding setting with couple data
    console.log('\n\n📊 ACTIVE WEDDING SETTING WITH COUPLE DATA:');
    console.log('=' .repeat(50));
    
    const [activeRows] = await connection.query(`
      SELECT 
        ws.id as wedding_id,
        ws.groom_full_name as ws_groom_name,
        ws.bride_full_name as ws_bride_name,
        ws.wedding_date,
        ws.is_active as ws_active,
        bgd.id as couple_id,
        bgd.groom_first_name,
        bgd.groom_last_name, 
        bgd.groom_full_name as bgd_groom_name,
        bgd.bride_first_name,
        bgd.bride_last_name,
        bgd.bride_full_name as bgd_bride_name,
        bgd.is_active as bgd_active
      FROM wedding_settings ws
      LEFT JOIN bride_groom_detail_settings bgd ON ws.bride_groom_id = bgd.id
      WHERE ws.is_active = 1
      ORDER BY ws.updated_at DESC
      LIMIT 1
    `);
    
    if (activeRows.length === 0) {
      console.log('❌ No active wedding setting found');
    } else {
      const row = activeRows[0];
      console.log(`\n📝 Active Wedding Setting:`);
      console.log(`   Wedding ID: ${row.wedding_id}`);
      console.log(`   Wedding Setting Groom: "${row.ws_groom_name}"`);
      console.log(`   Wedding Setting Bride: "${row.ws_bride_name}"`);
      console.log(`   Wedding Date: ${row.wedding_date}`);
      console.log(`   Couple ID: ${row.couple_id}`);
      console.log(`   Couple Groom First: "${row.groom_first_name}"`);
      console.log(`   Couple Groom Last: "${row.groom_last_name}"`);
      console.log(`   Couple Groom Full: "${row.bgd_groom_name}"`);
      console.log(`   Couple Bride First: "${row.bride_first_name}"`);
      console.log(`   Couple Bride Last: "${row.bride_last_name}"`);
      console.log(`   Couple Bride Full: "${row.bgd_bride_name}"`);
      
      // Check if data is consistent
      console.log(`\n🔍 Data Consistency Check:`);
      const groomMatch = row.ws_groom_name === row.bgd_groom_name;
      const brideMatch = row.ws_bride_name === row.bgd_bride_name;
      console.log(`   Groom Names Match: ${groomMatch ? '✅' : '❌'}`);
      console.log(`   Bride Names Match: ${brideMatch ? '✅' : '❌'}`);
      
      if (!groomMatch) {
        console.log(`   ⚠️  Wedding Setting Groom: "${row.ws_groom_name}"`);
        console.log(`   ⚠️  Couple Detail Groom: "${row.bgd_groom_name}"`);
      }
      
      if (!brideMatch) {
        console.log(`   ⚠️  Wedding Setting Bride: "${row.ws_bride_name}"`);
        console.log(`   ⚠️  Couple Detail Bride: "${row.bgd_bride_name}"`);
      }
    }
    
    console.log('\n✅ Database check completed successfully!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkBrideGroomNames();
