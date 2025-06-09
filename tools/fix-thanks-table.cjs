#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function fixThanksTable() {
  console.log('🔧 FIXING THANKS_SETTINGS TABLE STRUCTURE\n');

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
    console.log('\n1. 📋 Current table structure:');
    const [columns] = await connection.query("DESCRIBE thanks_settings");
    const columnNames = columns.map(col => col.Field);
    console.log('   Columns:', columnNames);

    // Check what columns we need vs what we have
    const requiredColumns = [
      'social_media_instagram',
      'social_media_facebook', 
      'social_media_twitter'
    ];

    const existingColumns = [
      'instagram',
      'facebook',
      'twitter'
    ];

    console.log('\n2. 🔄 Checking column mapping...');
    console.log('   Required by backend:', requiredColumns);
    console.log('   Existing in table:', existingColumns);

    // Add missing columns or rename existing ones
    console.log('\n3. 🏗️ Fixing table structure...');

    // Check if we need to add the social_media_* columns
    for (const reqCol of requiredColumns) {
      if (!columnNames.includes(reqCol)) {
        console.log(`   Adding column: ${reqCol}`);
        await connection.query(`
          ALTER TABLE thanks_settings 
          ADD COLUMN ${reqCol} VARCHAR(255) NULL
        `);
      }
    }

    // Copy data from old columns to new columns if they exist
    if (columnNames.includes('instagram') && columnNames.includes('social_media_instagram')) {
      await connection.query(`
        UPDATE thanks_settings 
        SET social_media_instagram = instagram,
            social_media_facebook = facebook,
            social_media_twitter = twitter
        WHERE social_media_instagram IS NULL
      `);
      console.log('   ✅ Copied data from old columns to new columns');
    }

    // Insert default record if table is empty
    console.log('\n4. 📝 Checking for default record...');
    const [countResult] = await connection.query("SELECT COUNT(*) as total FROM thanks_settings");
    
    if (countResult[0].total === 0) {
      console.log('   Inserting default thanks settings...');
      
      // Get wedding_id
      const [weddings] = await connection.query('SELECT id FROM wedding_settings WHERE is_active = TRUE LIMIT 1');
      const weddingId = weddings.length > 0 ? weddings[0].id : 1;
      
      await connection.query(`
        INSERT INTO thanks_settings (
          wedding_id, header_title, header_subtitle, main_message, sub_message, couple_names,
          blessing_quote_arabic, blessing_quote_translation, background_image,
          show_social_media, social_media_instagram, social_media_facebook, social_media_twitter,
          instagram, facebook, twitter, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        weddingId,
        'Thank You',
        'Terima Kasih',
        'Atas kehadiran, doa, dan restu yang telah diberikan dalam hari bahagia kami, kami mengucapkan terima kasih yang sebesar-besarnya.',
        'Semoga keberkahan dan kebahagiaan senantiasa menyertai kita semua.',
        'Wira & Sofi',
        'Barakallahu lakuma wa baraka alaikuma wa jama\'a bainakuma fi khair',
        'Semoga Allah memberkati kalian dan menyatukan kalian dalam kebaikan',
        '',
        false,
        '', // social_media_instagram
        '', // social_media_facebook
        '', // social_media_twitter
        '', // instagram
        '', // facebook
        '', // twitter
        1
      ]);
      
      console.log('   ✅ Default thanks settings inserted');
    } else {
      console.log('   ✅ Table already has data');
    }

    // Verify final structure
    console.log('\n5. ✅ Final table structure:');
    const [finalColumns] = await connection.query("DESCRIBE thanks_settings");
    const finalColumnNames = finalColumns.map(col => col.Field);
    
    const hasAllRequired = requiredColumns.every(col => finalColumnNames.includes(col));
    console.log('   Has all required columns:', hasAllRequired ? '✅ YES' : '❌ NO');
    
    if (hasAllRequired) {
      console.log('   Required columns found:');
      requiredColumns.forEach(col => {
        console.log(`     ✅ ${col}`);
      });
    }

    // Test the endpoint
    console.log('\n6. 🧪 Testing thanks settings endpoint...');
    const [testData] = await connection.query('SELECT * FROM thanks_settings LIMIT 1');
    if (testData.length > 0) {
      console.log('   ✅ Sample data found');
      console.log('   Sample record:', {
        id: testData[0].id,
        header_title: testData[0].header_title,
        couple_names: testData[0].couple_names,
        social_media_instagram: testData[0].social_media_instagram
      });
    }

    await connection.end();
    console.log('\n🎉 Thanks settings table fixed successfully!');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Test the thanks management page');
    console.log('2. Try updating thanks settings');
    console.log('3. Verify data saves correctly');

  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
    console.error('   Error code:', error.code);
    console.error('   SQL State:', error.sqlState);
  }
}

fixThanksTable();
