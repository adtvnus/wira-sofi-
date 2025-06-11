const mysql = require('mysql2/promise');

async function fixBrideGroomData() {
  let connection;
  
  try {
    console.log('🔧 Fixing bride-groom data...\n');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });
    
    console.log('✅ Database connected\n');
    
    // First, get current wedding_settings data
    const [wsRows] = await connection.query('SELECT * FROM wedding_settings WHERE is_active = 1 LIMIT 1');
    
    if (wsRows.length === 0) {
      console.log('❌ No active wedding settings found');
      return;
    }
    
    const weddingSetting = wsRows[0];
    console.log('📊 Current Wedding Settings:');
    console.log(`   Groom Full: "${weddingSetting.groom_full_name}"`);
    console.log(`   Bride Full: "${weddingSetting.bride_full_name}"`);
    console.log(`   Bride-Groom ID: ${weddingSetting.bride_groom_id}`);
    
    // Parse names from full names
    const groomFullName = weddingSetting.groom_full_name || 'Wira Saputra';
    const brideFullName = weddingSetting.bride_full_name || 'Sofi Andriani';
    
    const groomParts = groomFullName.split(' ');
    const brideParts = brideFullName.split(' ');
    
    const groomFirstName = groomParts[0] || 'Wira';
    const groomLastName = groomParts.slice(1).join(' ') || 'Saputra';
    const brideFirstName = brideParts[0] || 'Sofi';
    const brideLastName = brideParts.slice(1).join(' ') || 'Andriani';
    
    console.log('\n🔧 Parsed Names:');
    console.log(`   Groom First: "${groomFirstName}"`);
    console.log(`   Groom Last: "${groomLastName}"`);
    console.log(`   Bride First: "${brideFirstName}"`);
    console.log(`   Bride Last: "${brideLastName}"`);
    
    // Update or insert bride_groom_detail_settings
    console.log('\n🔧 Updating bride_groom_detail_settings...');
    
    // First, deactivate all existing records
    await connection.query('UPDATE bride_groom_detail_settings SET is_active = 0');
    
    // Insert new record with correct data
    const [insertResult] = await connection.query(`
      INSERT INTO bride_groom_detail_settings 
      (groom_first_name, groom_last_name, groom_full_name, 
       bride_first_name, bride_last_name, bride_full_name, 
       is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
    `, [
      groomFirstName, groomLastName, groomFullName,
      brideFirstName, brideLastName, brideFullName
    ]);
    
    const newBrideGroomId = insertResult.insertId;
    console.log(`✅ Created new bride-groom detail record with ID: ${newBrideGroomId}`);
    
    // Update wedding_settings to link to the new bride_groom_detail_settings record
    console.log('\n🔧 Linking wedding_settings to bride_groom_detail_settings...');
    
    await connection.query(`
      UPDATE wedding_settings 
      SET bride_groom_id = ?, updated_at = NOW()
      WHERE id = ?
    `, [newBrideGroomId, weddingSetting.id]);
    
    console.log('✅ Updated wedding_settings with bride_groom_id');
    
    // Verify the fix
    console.log('\n🔍 Verifying the fix...');
    
    const [verifyRows] = await connection.query(`
      SELECT 
        ws.id as wedding_id,
        ws.groom_full_name as ws_groom_name,
        ws.bride_full_name as ws_bride_name,
        ws.bride_groom_id,
        bgd.id as couple_id,
        bgd.groom_first_name,
        bgd.groom_last_name, 
        bgd.groom_full_name as bgd_groom_name,
        bgd.bride_first_name,
        bgd.bride_last_name,
        bgd.bride_full_name as bgd_bride_name
      FROM wedding_settings ws
      LEFT JOIN bride_groom_detail_settings bgd ON ws.bride_groom_id = bgd.id
      WHERE ws.is_active = 1
      LIMIT 1
    `);
    
    if (verifyRows.length > 0) {
      const row = verifyRows[0];
      console.log('\n📊 Verification Results:');
      console.log(`   Wedding ID: ${row.wedding_id}`);
      console.log(`   Wedding Setting Groom: "${row.ws_groom_name}"`);
      console.log(`   Wedding Setting Bride: "${row.ws_bride_name}"`);
      console.log(`   Bride-Groom ID: ${row.bride_groom_id}`);
      console.log(`   Couple ID: ${row.couple_id}`);
      console.log(`   Couple Groom First: "${row.groom_first_name}"`);
      console.log(`   Couple Groom Last: "${row.groom_last_name}"`);
      console.log(`   Couple Groom Full: "${row.bgd_groom_name}"`);
      console.log(`   Couple Bride First: "${row.bride_first_name}"`);
      console.log(`   Couple Bride Last: "${row.bride_last_name}"`);
      console.log(`   Couple Bride Full: "${row.bgd_bride_name}"`);
      
      // Check consistency
      const groomMatch = row.ws_groom_name === row.bgd_groom_name;
      const brideMatch = row.ws_bride_name === row.bgd_bride_name;
      console.log(`\n🔍 Data Consistency:`);
      console.log(`   Groom Names Match: ${groomMatch ? '✅' : '❌'}`);
      console.log(`   Bride Names Match: ${brideMatch ? '✅' : '❌'}`);
      console.log(`   Bride-Groom Link: ${row.bride_groom_id ? '✅' : '❌'}`);
      
      if (groomMatch && brideMatch && row.bride_groom_id) {
        console.log('\n🎉 SUCCESS! All data is now consistent and linked properly!');
      } else {
        console.log('\n⚠️  Some issues still remain');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixBrideGroomData();
