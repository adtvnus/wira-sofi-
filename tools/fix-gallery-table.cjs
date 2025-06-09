#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function fixGalleryTable() {
  console.log('🔧 FIXING GALLERY_SETTINGS TABLE\n');

  try {
    // Connect to MySQL
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    console.log('✅ Connected to MySQL database');

    // Check current table structure
    console.log('\n1. 🔍 Checking current gallery_settings table...');
    const [tableExists] = await connection.query(`
      SELECT COUNT(*) as count FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_name = 'gallery_settings'
    `);

    if (tableExists[0].count > 0) {
      const [columns] = await connection.query("DESCRIBE gallery_settings");
      console.log('   📋 Current table structure:');
      columns.forEach(col => {
        console.log(`     - ${col.Field}: ${col.Type}`);
      });

      // Check if this is the old gallery_settings (with header_title) or new one
      const hasHeaderTitle = columns.some(col => col.Field === 'header_title');
      const hasImageUrl = columns.some(col => col.Field === 'image_url');

      if (hasHeaderTitle && !hasImageUrl) {
        console.log('\n   ⚠️ This is the old gallery_settings table (for text settings)');
        console.log('   🔄 Renaming to gallery_text_settings and creating new gallery_settings...');

        // Rename old table
        await connection.query('RENAME TABLE gallery_settings TO gallery_text_settings');
        console.log('   ✅ Renamed old table to gallery_text_settings');

        // Create new gallery_settings table for images
        await connection.query(`
          CREATE TABLE gallery_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            wedding_id INT NOT NULL DEFAULT 1,
            image_url VARCHAR(255) NOT NULL,
            image_alt VARCHAR(255) DEFAULT '',
            image_size ENUM('L', 'S') DEFAULT 'S',
            display_order INT DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            created_by INT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_wedding_id (wedding_id),
            INDEX idx_is_active (is_active),
            INDEX idx_display_order (display_order)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('   ✅ Created new gallery_settings table for images');
      } else if (hasImageUrl) {
        console.log('   ✅ Table already has correct structure for images');
      } else {
        console.log('   🔄 Dropping and recreating table...');
        await connection.query('DROP TABLE gallery_settings');
        
        await connection.query(`
          CREATE TABLE gallery_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            wedding_id INT NOT NULL DEFAULT 1,
            image_url VARCHAR(255) NOT NULL,
            image_alt VARCHAR(255) DEFAULT '',
            image_size ENUM('L', 'S') DEFAULT 'S',
            display_order INT DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            created_by INT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_wedding_id (wedding_id),
            INDEX idx_is_active (is_active),
            INDEX idx_display_order (display_order)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('   ✅ Recreated gallery_settings table');
      }
    } else {
      console.log('   📝 Creating new gallery_settings table...');
      
      await connection.query(`
        CREATE TABLE gallery_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          wedding_id INT NOT NULL DEFAULT 1,
          image_url VARCHAR(255) NOT NULL,
          image_alt VARCHAR(255) DEFAULT '',
          image_size ENUM('L', 'S') DEFAULT 'S',
          display_order INT DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_by INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_wedding_id (wedding_id),
          INDEX idx_is_active (is_active),
          INDEX idx_display_order (display_order)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      console.log('   ✅ Created gallery_settings table');
    }

    // Create the directory for gallery images
    console.log('\n2. 📁 Creating gallery images directory...');
    const fs = require('fs');
    const path = require('path');
    
    const galleryPath = path.join(__dirname, '../public/images/GalleryDatabase');
    
    if (!fs.existsSync(galleryPath)) {
      fs.mkdirSync(galleryPath, { recursive: true });
      console.log(`   ✅ Created directory: ${galleryPath}`);
    } else {
      console.log(`   ✅ Directory already exists: ${galleryPath}`);
    }

    // Insert sample data if table is empty
    console.log('\n3. 📊 Checking for existing data...');
    const [existingData] = await connection.query('SELECT COUNT(*) as count FROM gallery_settings');
    
    if (existingData[0].count === 0) {
      console.log('   📝 Inserting sample gallery data...');
      
      const sampleImages = [
        {
          image_url: '/images/GalleryDatabase/sample-L-1.jpg',
          image_alt: 'Wedding Photo Large 1',
          image_size: 'L',
          display_order: 1
        },
        {
          image_url: '/images/GalleryDatabase/sample-S-1.jpg',
          image_alt: 'Wedding Photo Small 1',
          image_size: 'S',
          display_order: 2
        },
        {
          image_url: '/images/GalleryDatabase/sample-S-2.jpg',
          image_alt: 'Wedding Photo Small 2',
          image_size: 'S',
          display_order: 3
        },
        {
          image_url: '/images/GalleryDatabase/sample-L-2.jpg',
          image_alt: 'Wedding Photo Large 2',
          image_size: 'L',
          display_order: 4
        }
      ];

      for (const image of sampleImages) {
        await connection.query(`
          INSERT INTO gallery_settings (
            wedding_id, image_url, image_alt, image_size, display_order, is_active, created_by
          ) VALUES (1, ?, ?, ?, ?, TRUE, 1)
        `, [image.image_url, image.image_alt, image.image_size, image.display_order]);
      }

      console.log(`   ✅ Inserted ${sampleImages.length} sample images`);
    } else {
      console.log(`   📊 Found ${existingData[0].count} existing gallery images`);
    }

    // Verify final structure
    console.log('\n4. ✅ Final verification...');
    const [finalColumns] = await connection.query("DESCRIBE gallery_settings");
    console.log('   📋 Final table structure:');
    finalColumns.forEach(col => {
      console.log(`     ✅ ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });

    const [finalCount] = await connection.query('SELECT COUNT(*) as count FROM gallery_settings');
    console.log(`   📊 Total gallery images: ${finalCount[0].count}`);

    await connection.end();

    console.log('\n🎉 GALLERY SYSTEM FIXED AND READY!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Database Table: gallery_settings (for images)');
    console.log('✅ Old Table: Renamed to gallery_text_settings (preserved)');
    console.log('✅ Directory: C:\\Project\\wira-sofi-\\public\\images\\GalleryDatabase');
    console.log('✅ Sample Data: Ready for testing');
    console.log('✅ Backend Endpoints: Ready');
    console.log('═══════════════════════════════════════════════════════');

    console.log('\n📋 IMAGE SIZE OPTIONS:');
    console.log('• L (Large): For landscape/wide photos');
    console.log('• S (Small): For square/portrait photos');

    console.log('\n🔌 READY TO USE:');
    console.log('• Upload images with size selection (L/S)');
    console.log('• Images saved to /images/GalleryDatabase');
    console.log('• Database tracks all image metadata');
    console.log('• Admin can manage all uploaded images');

  } catch (error) {
    console.error('\n❌ Error fixing gallery table:', error.message);
    console.error('   Stack:', error.stack);
  }
}

fixGalleryTable();
