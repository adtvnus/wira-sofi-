#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function updateGallerySchema() {
  console.log('🔧 UPDATING GALLERY DATABASE SCHEMA\n');

  let connection;
  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // Step 1: Check current gallery_images table structure
    console.log('\n1. 📋 Checking current gallery_images table structure...');
    
    try {
      const [columns] = await connection.query("DESCRIBE gallery_images");
      console.log('   Current columns:');
      columns.forEach(col => {
        console.log(`     - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
      });

      // Check if image_size column exists
      const hasSizeColumn = columns.some(col => col.Field === 'image_size');
      const hasAbsolutePathColumn = columns.some(col => col.Field === 'absolute_path');

      if (!hasSizeColumn) {
        console.log('\n2. ➕ Adding image_size column...');
        await connection.query(`
          ALTER TABLE gallery_images 
          ADD COLUMN image_size ENUM('L', 'S') DEFAULT 'S' AFTER image_type
        `);
        console.log('   ✅ image_size column added');
      } else {
        console.log('\n2. ✅ image_size column already exists');
      }

      if (!hasAbsolutePathColumn) {
        console.log('\n3. ➕ Adding absolute_path column...');
        await connection.query(`
          ALTER TABLE gallery_images 
          ADD COLUMN absolute_path VARCHAR(500) AFTER image_src
        `);
        console.log('   ✅ absolute_path column added');
      } else {
        console.log('\n3. ✅ absolute_path column already exists');
      }

      // Update image_src column to be longer for absolute paths
      console.log('\n4. 🔄 Updating image_src column length...');
      await connection.query(`
        ALTER TABLE gallery_images 
        MODIFY COLUMN image_src VARCHAR(500)
      `);
      console.log('   ✅ image_src column updated to VARCHAR(500)');

    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE') {
        console.log('   ⚠️ gallery_images table does not exist. Creating it...');
        
        await connection.query(`
          CREATE TABLE gallery_images (
            id INT PRIMARY KEY AUTO_INCREMENT,
            wedding_id INT NOT NULL DEFAULT 1,
            image_src VARCHAR(500),
            absolute_path VARCHAR(500),
            image_alt VARCHAR(200),
            image_type ENUM('landscape', 'square', 'portrait') DEFAULT 'square',
            image_size ENUM('L', 'S') DEFAULT 'S',
            display_order INT DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            created_by INT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_wedding_id (wedding_id),
            INDEX idx_is_active (is_active),
            INDEX idx_display_order (display_order),
            INDEX idx_image_size (image_size)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('   ✅ gallery_images table created with new schema');
      } else {
        throw error;
      }
    }

    // Step 5: Verify final structure
    console.log('\n5. 🔍 Verifying final table structure...');
    const [finalColumns] = await connection.query("DESCRIBE gallery_images");
    console.log('   Final columns:');
    finalColumns.forEach(col => {
      console.log(`     - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    // Step 6: Check if gallery_settings table exists and update if needed
    console.log('\n6. 📋 Checking gallery_settings table...');
    
    try {
      const [settingsColumns] = await connection.query("DESCRIBE gallery_settings");
      console.log('   ✅ gallery_settings table exists');
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE') {
        console.log('   ⚠️ gallery_settings table does not exist. Creating it...');
        
        await connection.query(`
          CREATE TABLE gallery_settings (
            id INT PRIMARY KEY AUTO_INCREMENT,
            wedding_id INT NOT NULL DEFAULT 1,
            header_title VARCHAR(100) DEFAULT 'Our Gallery',
            header_subtitle TEXT,
            bottom_quote TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_by INT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_wedding_id (wedding_id)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('   ✅ gallery_settings table created');

        // Insert default settings
        await connection.query(`
          INSERT INTO gallery_settings (wedding_id, header_title, header_subtitle, bottom_quote)
          VALUES (1, 'Our Gallery', 'Koleksi foto-foto indah perjalanan cinta kami', 'Setiap foto menyimpan kenangan yang tak terlupakan')
        `);
        console.log('   ✅ Default gallery settings inserted');
      }
    }

    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }

    console.log('\n🎉 GALLERY SCHEMA UPDATE COMPLETED!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ gallery_images table updated with:');
    console.log('   - image_size ENUM("L", "S") DEFAULT "S"');
    console.log('   - absolute_path VARCHAR(500)');
    console.log('   - image_src VARCHAR(500) (extended)');
    console.log('✅ gallery_settings table verified/created');
    console.log('✅ Proper indexes added for performance');
    console.log('═══════════════════════════════════════════════════════');

    console.log('\n📋 NEXT STEPS:');
    console.log('1. Update backend API endpoints for gallery');
    console.log('2. Update frontend GalleryManagement.tsx');
    console.log('3. Add size selection UI');
    console.log('4. Implement absolute path storage');

  } catch (error) {
    console.error('\n❌ Schema update failed:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('   Error closing connection:', closeError.message);
      }
    }
  }
}

updateGallerySchema();
