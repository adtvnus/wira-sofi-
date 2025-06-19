const mysql = require('mysql2/promise');
const fetch = require('node-fetch');

async function debugGalleryAPI() {
  console.log('🔍 DEBUGGING GALLERY API ERROR');
  
  try {
    // Step 1: Check database directly
    console.log('\n1. 🗄️ Checking database directly...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    // Check if gallery_images table exists and structure
    console.log('   📋 Checking gallery_images table...');
    try {
      const [columns] = await connection.query('DESCRIBE gallery_images');
      console.log('   ✅ gallery_images table structure:');
      columns.forEach(col => {
        console.log(`      ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key ? col.Key : ''}`);
      });
    } catch (error) {
      console.log('   ❌ Error describing gallery_images:', error.message);
    }

    // Try to query gallery_images directly
    console.log('\n   📊 Testing direct query...');
    try {
      const [images] = await connection.query(`
        SELECT
          id, image_src, absolute_path, image_alt, image_type, image_size,
          display_order, is_active, created_at, updated_at
        FROM gallery_images
        WHERE wedding_id = 1
        ORDER BY display_order ASC, created_at DESC
      `);
      console.log(`   ✅ Direct query successful: ${images.length} images found`);
    } catch (error) {
      console.log('   ❌ Direct query failed:', error.message);
      
      // Try simpler query
      try {
        const [simpleImages] = await connection.query('SELECT COUNT(*) as count FROM gallery_images');
        console.log(`   📊 Simple count query: ${simpleImages[0].count} total images`);
      } catch (simpleError) {
        console.log('   ❌ Even simple query failed:', simpleError.message);
      }
    }

    // Check foreign key constraints
    console.log('\n   🔗 Checking foreign key constraints...');
    try {
      const [constraints] = await connection.query(`
        SELECT 
          CONSTRAINT_NAME, 
          TABLE_NAME, 
          COLUMN_NAME, 
          REFERENCED_TABLE_NAME, 
          REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = 'wedding_invitation' 
        AND TABLE_NAME = 'gallery_images' 
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      
      if (constraints.length > 0) {
        console.log('   📋 Foreign key constraints:');
        constraints.forEach(constraint => {
          console.log(`      ${constraint.CONSTRAINT_NAME}: ${constraint.COLUMN_NAME} -> ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`);
        });
      } else {
        console.log('   ✅ No foreign key constraints found');
      }
    } catch (error) {
      console.log('   ❌ Error checking constraints:', error.message);
    }

    await connection.end();

    // Step 2: Test API with detailed logging
    console.log('\n2. 🔌 Testing API with detailed logging...');
    
    // Login first
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });

    if (!loginResponse.ok) {
      console.log('   ❌ Login failed');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('   ✅ Login successful');

    // Test gallery images API
    console.log('\n   📡 Testing /api/gallery/images...');
    const galleryResponse = await fetch('http://localhost:3001/api/gallery/images', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`   📊 Response status: ${galleryResponse.status} ${galleryResponse.statusText}`);
    
    if (galleryResponse.ok) {
      const galleryData = await galleryResponse.json();
      console.log('   ✅ API call successful');
      console.log('   📥 Response:', JSON.stringify(galleryData, null, 2));
    } else {
      const errorData = await galleryResponse.json().catch(() => ({}));
      console.log('   ❌ API call failed');
      console.log('   📋 Error response:', JSON.stringify(errorData, null, 2));
    }

    // Test gallery settings API
    console.log('\n   📡 Testing /api/gallery/settings...');
    const settingsResponse = await fetch('http://localhost:3001/api/gallery/settings', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`   📊 Settings response status: ${settingsResponse.status} ${settingsResponse.statusText}`);
    
    if (settingsResponse.ok) {
      const settingsData = await settingsResponse.json();
      console.log('   ✅ Settings API call successful');
      console.log('   📥 Settings response:', JSON.stringify(settingsData, null, 2));
    } else {
      const errorData = await settingsResponse.json().catch(() => ({}));
      console.log('   ❌ Settings API call failed');
      console.log('   📋 Settings error response:', JSON.stringify(errorData, null, 2));
    }

    console.log('\n🎯 DIAGNOSIS COMPLETE!');
    console.log('💡 Check the backend server logs for more detailed error information');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugGalleryAPI();
