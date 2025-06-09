#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function createGalleryTable() {
  console.log('🗄️ CREATING GALLERY_SETTINGS TABLE\n');

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

    // Check if table already exists
    console.log('\n1. 🔍 Checking if gallery_settings table exists...');
    const [tableExists] = await connection.query(`
      SELECT COUNT(*) as count FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_name = 'gallery_settings'
    `);

    if (tableExists[0].count > 0) {
      console.log('   ⚠️ Table gallery_settings already exists');
      
      // Check current structure
      const [columns] = await connection.query("DESCRIBE gallery_settings");
      console.log('   📋 Current table structure:');
      columns.forEach(col => {
        console.log(`     - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
      });

      // Check if we need to add missing columns
      const requiredColumns = ['image_size', 'display_order'];
      const existingColumns = columns.map(col => col.Field);
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));

      if (missingColumns.length > 0) {
        console.log(`\n   🔧 Adding missing columns: ${missingColumns.join(', ')}`);
        
        for (const column of missingColumns) {
          if (column === 'image_size') {
            await connection.query(`
              ALTER TABLE gallery_settings 
              ADD COLUMN image_size ENUM('L', 'S') DEFAULT 'S' AFTER image_alt
            `);
            console.log('     ✅ Added image_size column');
          }
          
          if (column === 'display_order') {
            await connection.query(`
              ALTER TABLE gallery_settings 
              ADD COLUMN display_order INT DEFAULT 0 AFTER image_size
            `);
            console.log('     ✅ Added display_order column');
          }
        }
      } else {
        console.log('   ✅ All required columns exist');
      }
    } else {
      console.log('   📝 Creating gallery_settings table...');
      
      // Create the table
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

      console.log('   ✅ Table gallery_settings created successfully');
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
          image_alt: 'Wedding Photo 1',
          image_size: 'L',
          display_order: 1
        },
        {
          image_url: '/images/GalleryDatabase/sample-S-1.jpg',
          image_alt: 'Wedding Photo 2',
          image_size: 'S',
          display_order: 2
        },
        {
          image_url: '/images/GalleryDatabase/sample-S-2.jpg',
          image_alt: 'Wedding Photo 3',
          image_size: 'S',
          display_order: 3
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

    console.log('\n🎉 GALLERY SYSTEM SETUP COMPLETE!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Database Table: gallery_settings created/updated');
    console.log('✅ Directory: C:\\Project\\wira-sofi-\\public\\images\\GalleryDatabase');
    console.log('✅ Sample Data: Inserted (if table was empty)');
    console.log('✅ Backend Endpoints: Ready');
    console.log('═══════════════════════════════════════════════════════');

    console.log('\n📋 TABLE FEATURES:');
    console.log('• image_url: Path to uploaded image');
    console.log('• image_alt: Alt text for accessibility');
    console.log('• image_size: L (Large/Landscape) or S (Small/Square)');
    console.log('• display_order: Order for displaying images');
    console.log('• is_active: Show/hide image in gallery');
    console.log('• wedding_id: Support for multiple weddings');

    console.log('\n🔌 AVAILABLE ENDPOINTS:');
    console.log('• GET /api/gallery - Get all gallery images (admin)');
    console.log('• GET /api/gallery/active - Get active images (public)');
    console.log('• POST /api/gallery/upload-image - Upload image file');
    console.log('• POST /api/gallery - Add image to database');
    console.log('• PUT /api/gallery/:id - Update image details');
    console.log('• DELETE /api/gallery/:id - Delete image');

  } catch (error) {
    console.error('\n❌ Error creating gallery table:', error.message);
    console.error('   Stack:', error.stack);
  }
}

createGalleryTable();
