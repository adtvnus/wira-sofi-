const mysql = require('mysql2/promise');

async function fixGalleryTable() {
  console.log('🔧 FIXING GALLERY TABLE ISSUES');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // Step 1: Drop existing gallery tables if they have issues
    console.log('\n1. 🗑️ Dropping existing gallery tables...');
    
    try {
      await connection.query('DROP TABLE IF EXISTS gallery_images');
      console.log('   ✅ Dropped gallery_images table');
    } catch (error) {
      console.log('   ⚠️ Could not drop gallery_images:', error.message);
    }

    try {
      await connection.query('DROP TABLE IF EXISTS gallery_settings');
      console.log('   ✅ Dropped gallery_settings table');
    } catch (error) {
      console.log('   ⚠️ Could not drop gallery_settings:', error.message);
    }

    // Step 2: Create gallery_settings table (without foreign keys first)
    console.log('\n2. 📋 Creating gallery_settings table...');
    await connection.query(`
      CREATE TABLE gallery_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wedding_id INT NOT NULL DEFAULT 1,
        gallery_title VARCHAR(255) DEFAULT 'Our Gallery',
        gallery_subtitle VARCHAR(255) DEFAULT 'Beautiful Moments',
        bottom_quote TEXT DEFAULT 'Every picture tells our love story',
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ gallery_settings table created');

    // Insert default settings
    await connection.query(`
      INSERT INTO gallery_settings (wedding_id, created_by) VALUES (1, 1)
    `);
    console.log('   ✅ Default gallery settings inserted');

    // Step 3: Create gallery_images table (without foreign keys)
    console.log('\n3. 📋 Creating gallery_images table...');
    await connection.query(`
      CREATE TABLE gallery_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wedding_id INT NOT NULL DEFAULT 1,
        image_src VARCHAR(500) NOT NULL,
        absolute_path VARCHAR(1000) NOT NULL,
        image_alt VARCHAR(255) DEFAULT '',
        image_type ENUM('landscape', 'square', 'portrait') DEFAULT 'square',
        image_size ENUM('L', 'S') DEFAULT 'S',
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ gallery_images table created');

    // Step 4: Test the tables
    console.log('\n4. 🧪 Testing tables...');
    
    // Test gallery_settings
    const [settings] = await connection.query('SELECT * FROM gallery_settings');
    console.log(`   ✅ gallery_settings query successful: ${settings.length} rows`);

    // Test gallery_images
    const [images] = await connection.query('SELECT * FROM gallery_images');
    console.log(`   ✅ gallery_images query successful: ${images.length} rows`);

    // Test the exact query used by API
    const [apiQuery] = await connection.query(`
      SELECT
        id, image_src, absolute_path, image_alt, image_type, image_size,
        display_order, is_active, created_at, updated_at
      FROM gallery_images
      WHERE wedding_id = 1
      ORDER BY display_order ASC, created_at DESC
    `);
    console.log(`   ✅ API query test successful: ${apiQuery.length} rows`);

    await connection.end();

    console.log('\n🎉 GALLERY TABLES FIXED!');
    console.log('✅ Tables recreated without foreign key constraints');
    console.log('✅ Default settings inserted');
    console.log('✅ API queries tested successfully');
    console.log('');
    console.log('💡 Now try the gallery management page again:');
    console.log('   http://localhost:5173/admin/gallery-management');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

fixGalleryTable();
