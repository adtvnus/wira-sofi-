const mysql = require('mysql2/promise');

async function fixThanksSettingsData() {
  let connection;
  
  try {
    console.log('🔧 Fixing Thanks Settings Data...\n');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });
    
    console.log('✅ Database connected\n');
    
    // Check wedding_settings to get valid wedding_id
    console.log('📊 CHECKING WEDDING_SETTINGS:');
    const [weddingRows] = await connection.query(`
      SELECT id FROM wedding_settings ORDER BY id ASC LIMIT 1
    `);
    
    if (weddingRows.length === 0) {
      console.log('❌ No wedding settings found');
      return;
    }
    
    const weddingId = weddingRows[0].id;
    console.log(`   Found wedding_id: ${weddingId}`);
    
    // Check current thanks_settings data
    console.log('\n📊 CHECKING THANKS_SETTINGS DATA:');
    const [thanksRows] = await connection.query(`
      SELECT COUNT(*) as count FROM thanks_settings
    `);
    
    console.log(`   Current records: ${thanksRows[0].count}`);
    
    if (thanksRows[0].count === 0) {
      console.log('\n🔧 INSERTING DEFAULT THANKS SETTINGS...');
      
      await connection.query(`
        INSERT INTO thanks_settings (
          wedding_id, header_title, header_subtitle, main_message, sub_message, couple_names,
          blessing_quote_arabic, blessing_quote_translation, background_image,
          show_social_media, social_media_instagram, social_media_facebook, social_media_twitter,
          instagram, facebook, twitter, contact_phone, contact_email, contact_address,
          is_enabled, created_by
        ) VALUES (
          ?, 'Thank You', 'Terima Kasih',
          'Terima kasih atas kehadiran dan doa restu yang telah diberikan untuk pernikahan kami.',
          'Semoga Allah SWT membalas kebaikan kalian semua.',
          'Wira & Sofi',
          'بَارَكَ اللهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
          'Semoga Allah memberkahi kalian berdua, dan memberkahi kalian, serta menyatukan kalian dalam kebaikan.',
          '', true, '', '', '', '', '', '', '', '', '', true, 1
        )
      `, [weddingId]);
      
      console.log('✅ Default thanks settings inserted');
    } else {
      console.log('✅ Thanks settings data already exists');
    }
    
    // Verify data
    console.log('\n📊 VERIFYING THANKS_SETTINGS:');
    const [verifyRows] = await connection.query(`
      SELECT id, wedding_id, header_title, header_subtitle, couple_names, 
             social_media_instagram, social_media_facebook, social_media_twitter
      FROM thanks_settings 
      ORDER BY id DESC LIMIT 1
    `);
    
    if (verifyRows.length > 0) {
      const settings = verifyRows[0];
      console.log(`   📝 ID: ${settings.id}`);
      console.log(`   📝 Wedding ID: ${settings.wedding_id}`);
      console.log(`   📝 Header Title: "${settings.header_title}"`);
      console.log(`   📝 Header Subtitle: "${settings.header_subtitle}"`);
      console.log(`   📝 Couple Names: "${settings.couple_names}"`);
      console.log(`   📝 Instagram: "${settings.social_media_instagram}"`);
      console.log(`   📝 Facebook: "${settings.social_media_facebook}"`);
      console.log(`   📝 Twitter: "${settings.social_media_twitter}"`);
    }
    
    console.log('\n✅ Thanks settings data fix completed!');
    console.log('\n🚀 Now try to save thanks settings in admin panel');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixThanksSettingsData();
