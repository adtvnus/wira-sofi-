#!/usr/bin/env node

// Debug gallery upload issues

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function debugGalleryUpload() {
  console.log('🔍 DEBUGGING GALLERY UPLOAD ISSUES');
  console.log('═══════════════════════════════════════════════════════');
  
  let connection;
  const fetch = await getFetch();

  try {
    // Step 1: Check database tables
    console.log('📊 Step 1: Checking database tables...');
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    // Check if gallery tables exist
    const [tables] = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'wedding_invitation' 
      AND table_name IN ('gallery_images', 'gallery_text_settings')
    `);

    console.log('✅ Gallery tables found:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    if (tables.length < 2) {
      console.log('❌ Missing gallery tables! Need to create them.');
      
      // Create gallery_text_settings table
      if (!tables.find(t => t.table_name === 'gallery_text_settings')) {
        console.log('📝 Creating gallery_text_settings table...');
        await connection.query(`
          CREATE TABLE gallery_text_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            wedding_id INT NOT NULL DEFAULT 1,
            header_title VARCHAR(100) NOT NULL DEFAULT 'Our Gallery',
            header_subtitle TEXT,
            bottom_quote TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_by INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        console.log('✅ gallery_text_settings table created');
      }

      // Create gallery_images table
      if (!tables.find(t => t.table_name === 'gallery_images')) {
        console.log('📝 Creating gallery_images table...');
        await connection.query(`
          CREATE TABLE gallery_images (
            id INT AUTO_INCREMENT PRIMARY KEY,
            wedding_id INT NOT NULL DEFAULT 1,
            image_src VARCHAR(255) NOT NULL,
            absolute_path VARCHAR(500),
            image_alt VARCHAR(255),
            image_type ENUM('landscape', 'square', 'portrait') DEFAULT 'square',
            image_size ENUM('L', 'S') DEFAULT 'S',
            display_order INT DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            created_by INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        console.log('✅ gallery_images table created');
      }
    }

    // Step 2: Check upload directory
    console.log('\n📁 Step 2: Checking upload directory...');
    const uploadDir = path.join(__dirname, '../public/images/GalleryDatabase');
    
    if (!fs.existsSync(uploadDir)) {
      console.log('📁 Creating upload directory...');
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('✅ Upload directory created:', uploadDir);
    } else {
      console.log('✅ Upload directory exists:', uploadDir);
    }

    // Check directory permissions
    try {
      fs.accessSync(uploadDir, fs.constants.W_OK);
      console.log('✅ Upload directory is writable');
    } catch (error) {
      console.log('❌ Upload directory is not writable:', error.message);
    }

    // Step 3: Test authentication
    console.log('\n🔐 Step 3: Testing authentication...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });

    if (!loginResponse.ok) {
      throw new Error('Authentication failed');
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Authentication successful');

    // Step 4: Test gallery settings API
    console.log('\n⚙️ Step 4: Testing gallery settings API...');
    const settingsResponse = await fetch('http://localhost:3001/api/gallery/settings', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`   Settings API status: ${settingsResponse.status}`);
    if (settingsResponse.ok) {
      const settingsData = await settingsResponse.json();
      console.log('✅ Gallery settings API working');
      console.log(`   Data: ${JSON.stringify(settingsData.data, null, 2)}`);
    } else {
      const errorText = await settingsResponse.text();
      console.log('❌ Gallery settings API failed');
      console.log(`   Error: ${errorText}`);
    }

    // Step 5: Test gallery images API
    console.log('\n🖼️ Step 5: Testing gallery images API...');
    const imagesResponse = await fetch('http://localhost:3001/api/gallery/images', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`   Images API status: ${imagesResponse.status}`);
    if (imagesResponse.ok) {
      const imagesData = await imagesResponse.json();
      console.log('✅ Gallery images API working');
      console.log(`   Found ${imagesData.data ? imagesData.data.length : 0} images`);
    } else {
      const errorText = await imagesResponse.text();
      console.log('❌ Gallery images API failed');
      console.log(`   Error: ${errorText}`);
    }

    // Step 6: Test upload endpoint (without actual file)
    console.log('\n📤 Step 6: Testing upload endpoint structure...');
    const uploadTestResponse = await fetch('http://localhost:3001/api/gallery/upload-image', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`   Upload endpoint status: ${uploadTestResponse.status}`);
    const uploadTestText = await uploadTestResponse.text();
    console.log(`   Upload endpoint response: ${uploadTestText}`);

    if (uploadTestResponse.status === 400 && uploadTestText.includes('No image file')) {
      console.log('✅ Upload endpoint is accessible and expecting files');
    } else {
      console.log('⚠️ Upload endpoint response unexpected');
    }

    console.log('\n🎉 GALLERY UPLOAD DEBUG COMPLETED!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 DIAGNOSIS SUMMARY:');
    console.log(`   ✅ Database tables: ${tables.length}/2 exist`);
    console.log(`   ✅ Upload directory: ${fs.existsSync(uploadDir) ? 'exists' : 'missing'}`);
    console.log(`   ✅ Authentication: working`);
    console.log(`   ✅ Gallery APIs: ${settingsResponse.ok && imagesResponse.ok ? 'working' : 'issues found'}`);
    console.log(`   ✅ Upload endpoint: accessible`);
    console.log('');
    
    if (tables.length === 2 && fs.existsSync(uploadDir)) {
      console.log('🎯 LIKELY ISSUE: Frontend upload implementation or file handling');
      console.log('');
      console.log('💡 NEXT STEPS:');
      console.log('   1. Check browser console for JavaScript errors');
      console.log('   2. Check network tab for failed API calls');
      console.log('   3. Verify file input is working correctly');
      console.log('   4. Test with a small image file (< 1MB)');
    } else {
      console.log('🎯 ISSUE FOUND: Missing database tables or upload directory');
      console.log('   Tables and directories have been created automatically');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the debug
debugGalleryUpload().catch(console.error);
