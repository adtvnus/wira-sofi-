const mysql = require('mysql2/promise');

async function fixGallerySettingsTable() {
  console.log('🔧 FIXING GALLERY SETTINGS TABLE NAME MISMATCH');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // Step 1: Check what tables exist
    console.log('\n1. 📋 Checking existing tables...');
    const [tables] = await connection.query("SHOW TABLES LIKE '%gallery%'");
    console.log('   Gallery-related tables:');
    tables.forEach(table => {
      console.log(`      - ${Object.values(table)[0]}`);
    });

    // Step 2: Create gallery_text_settings table (what backend expects)
    console.log('\n2. 📋 Creating gallery_text_settings table...');
    
    try {
      await connection.query('DROP TABLE IF EXISTS gallery_text_settings');
      console.log('   ✅ Dropped existing gallery_text_settings table');
    } catch (error) {
      console.log('   ⚠️ No existing gallery_text_settings table to drop');
    }

    await connection.query(`
      CREATE TABLE gallery_text_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wedding_id INT NOT NULL DEFAULT 1,
        header_title VARCHAR(255) DEFAULT 'Our Gallery',
        header_subtitle VARCHAR(255) DEFAULT 'Capturing beautiful moments of our special day',
        bottom_quote TEXT DEFAULT 'Every picture tells a story of love',
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ gallery_text_settings table created');

    // Insert default settings
    await connection.query(`
      INSERT INTO gallery_text_settings (wedding_id, created_by) VALUES (1, 1)
    `);
    console.log('   ✅ Default gallery text settings inserted');

    // Step 3: Test the query that backend uses
    console.log('\n3. 🧪 Testing backend query...');
    const [settings] = await connection.query(`
      SELECT header_title, header_subtitle, bottom_quote, is_active
      FROM gallery_text_settings
      WHERE wedding_id = 1
      ORDER BY created_at DESC
      LIMIT 1
    `);
    
    console.log(`   ✅ Backend query successful: ${settings.length} rows`);
    if (settings.length > 0) {
      console.log('   📋 Settings data:');
      console.log(`      Title: ${settings[0].header_title}`);
      console.log(`      Subtitle: ${settings[0].header_subtitle}`);
      console.log(`      Quote: ${settings[0].bottom_quote}`);
    }

    await connection.end();

    console.log('\n🎉 GALLERY SETTINGS TABLE FIXED!');
    console.log('✅ Created gallery_text_settings table (what backend expects)');
    console.log('✅ Default settings inserted');
    console.log('✅ Backend query tested successfully');
    console.log('');
    console.log('💡 Now both gallery APIs should work:');
    console.log('   - /api/gallery/images ✅');
    console.log('   - /api/gallery/settings ✅');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

fixGallerySettingsTable();
