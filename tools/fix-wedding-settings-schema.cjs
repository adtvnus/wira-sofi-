const mysql = require('mysql2/promise');

async function fixWeddingSettingsSchema() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // Check current structure of wedding_settings table
    console.log('\n🔍 Checking wedding_settings table structure...');
    const [columns] = await connection.query('DESCRIBE wedding_settings');
    console.log('Current columns:');
    columns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type})`);
    });

    // Add missing columns if they don't exist
    const requiredColumns = [
      { name: 'wedding_maps_url', type: 'TEXT' },
      { name: 'reception_maps_url', type: 'TEXT' },
      { name: 'couple_id', type: 'INT DEFAULT 1' }
    ];

    console.log('\n🛠️ Adding missing columns...');
    for (const col of requiredColumns) {
      try {
        await connection.query(`ALTER TABLE wedding_settings ADD COLUMN ${col.name} ${col.type}`);
        console.log(`   ✅ Added column: ${col.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`   ✅ Column already exists: ${col.name}`);
        } else {
          console.log(`   ❌ Error adding ${col.name}: ${error.message}`);
        }
      }
    }

    // Create gallery_text_settings table if missing
    console.log('\n🛠️ Creating gallery_text_settings table...');
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS gallery_text_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          wedding_id INT DEFAULT 1,
          header_title VARCHAR(255) DEFAULT 'Galeri Foto',
          header_subtitle VARCHAR(255) DEFAULT 'Momen Indah Kami',
          bottom_quote TEXT DEFAULT 'Setiap foto menyimpan kenangan yang tak terlupakan',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('   ✅ gallery_text_settings table created');

      // Insert default data
      await connection.query(`
        INSERT IGNORE INTO gallery_text_settings (id, wedding_id, header_title, header_subtitle, bottom_quote)
        VALUES (1, 1, 'Galeri Foto', 'Momen Indah Kami', 'Setiap foto menyimpan kenangan yang tak terlupakan')
      `);
      console.log('   ✅ Default data inserted');

    } catch (error) {
      console.log(`   ❌ Error creating gallery_text_settings: ${error.message}`);
    }

    // Fix quotes_settings table columns
    console.log('\n🛠️ Fixing quotes_settings table...');
    try {
      // Check if quote_text column exists
      const [quoteColumns] = await connection.query('DESCRIBE quotes_settings');
      const hasQuoteText = quoteColumns.some(col => col.Field === 'quote_text');
      
      if (!hasQuoteText) {
        await connection.query(`ALTER TABLE quotes_settings ADD COLUMN quote_text TEXT`);
        console.log('   ✅ Added quote_text column');
      }

      const hasQuoteAuthor = quoteColumns.some(col => col.Field === 'quote_author');
      if (!hasQuoteAuthor) {
        await connection.query(`ALTER TABLE quotes_settings ADD COLUMN quote_author VARCHAR(255)`);
        console.log('   ✅ Added quote_author column');
      }

      const hasQuoteCategory = quoteColumns.some(col => col.Field === 'quote_category');
      if (!hasQuoteCategory) {
        await connection.query(`ALTER TABLE quotes_settings ADD COLUMN quote_category VARCHAR(100)`);
        console.log('   ✅ Added quote_category column');
      }

      const hasQuoteImageUrl = quoteColumns.some(col => col.Field === 'quote_image_url');
      if (!hasQuoteImageUrl) {
        await connection.query(`ALTER TABLE quotes_settings ADD COLUMN quote_image_url TEXT`);
        console.log('   ✅ Added quote_image_url column');
      }

      const hasDisplayOrder = quoteColumns.some(col => col.Field === 'display_order');
      if (!hasDisplayOrder) {
        await connection.query(`ALTER TABLE quotes_settings ADD COLUMN display_order INT DEFAULT 1`);
        console.log('   ✅ Added display_order column');
      }

    } catch (error) {
      console.log(`   ❌ Error fixing quotes_settings: ${error.message}`);
    }

    // Fix gallery_images table
    console.log('\n🛠️ Fixing gallery_images table...');
    try {
      const [galleryColumns] = await connection.query('DESCRIBE gallery_images');
      const hasAbsolutePath = galleryColumns.some(col => col.Field === 'absolute_path');
      const hasImageSize = galleryColumns.some(col => col.Field === 'image_size');

      if (!hasAbsolutePath) {
        await connection.query(`ALTER TABLE gallery_images ADD COLUMN absolute_path TEXT`);
        console.log('   ✅ Added absolute_path column');
      }

      if (!hasImageSize) {
        await connection.query(`ALTER TABLE gallery_images ADD COLUMN image_size VARCHAR(10) DEFAULT 'S'`);
        console.log('   ✅ Added image_size column');
      }

    } catch (error) {
      console.log(`   ❌ Error fixing gallery_images: ${error.message}`);
    }

    // Fix activity_logs table
    console.log('\n🛠️ Fixing activity_logs table...');
    try {
      const [activityColumns] = await connection.query('DESCRIBE activity_logs');
      const hasActionType = activityColumns.some(col => col.Field === 'action_type');
      
      if (!hasActionType) {
        await connection.query(`ALTER TABLE activity_logs ADD COLUMN action_type VARCHAR(50)`);
        console.log('   ✅ Added action_type column');
      }

    } catch (error) {
      console.log(`   ❌ Error fixing activity_logs: ${error.message}`);
    }

    console.log('\n🎉 Database schema fixes completed!');
    await connection.end();

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

fixWeddingSettingsSchema();
