#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function checkGalleryDatabase() {
  console.log('🔍 CHECKING GALLERY DATABASE STRUCTURE\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    // Check existing tables
    console.log('1. 📋 Checking existing tables...');
    const [tables] = await connection.query("SHOW TABLES LIKE '%gallery%'");
    console.log('   Gallery-related tables found:', tables.length);
    tables.forEach(table => {
      console.log(`     - ${Object.values(table)[0]}`);
    });

    // Check gallery_settings table structure
    if (tables.some(t => Object.values(t)[0] === 'gallery_settings')) {
      console.log('\n2. 📊 Checking gallery_settings table structure...');
      const [columns] = await connection.query("DESCRIBE gallery_settings");
      console.log('   Columns:');
      columns.forEach(col => {
        console.log(`     - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
      });

      // Check data
      const [data] = await connection.query("SELECT * FROM gallery_settings LIMIT 5");
      console.log(`\n   Data rows: ${data.length}`);
      if (data.length > 0) {
        console.log('   Sample data:', data[0]);
      }
    }

    // Check gallery_images table structure
    if (tables.some(t => Object.values(t)[0] === 'gallery_images')) {
      console.log('\n3. 📊 Checking gallery_images table structure...');
      const [columns] = await connection.query("DESCRIBE gallery_images");
      console.log('   Columns:');
      columns.forEach(col => {
        console.log(`     - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
      });

      // Check data
      const [data] = await connection.query("SELECT * FROM gallery_images LIMIT 5");
      console.log(`\n   Data rows: ${data.length}`);
      if (data.length > 0) {
        console.log('   Sample data:', data[0]);
      }
    }

    await connection.end();

    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('═══════════════════════════════════════════════════════');
    
    if (!tables.some(t => Object.values(t)[0] === 'gallery_settings')) {
      console.log('❌ gallery_settings table missing - need to create');
    } else {
      console.log('✅ gallery_settings table exists');
    }

    if (!tables.some(t => Object.values(t)[0] === 'gallery_images')) {
      console.log('❌ gallery_images table missing - need to create');
    } else {
      console.log('✅ gallery_images table exists');
    }

    console.log('\n📋 REQUIRED FEATURES:');
    console.log('1. Add image_size ENUM("L", "S") column');
    console.log('2. Add absolute_path VARCHAR(500) column');
    console.log('3. Create backend API endpoints');
    console.log('4. Update frontend to use database');
    console.log('5. Implement file upload to GalleryDatabase folder');

  } catch (error) {
    console.error('\n❌ Database check failed:', error.message);
  }
}

checkGalleryDatabase();
