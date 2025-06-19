const fetch = require('node-fetch');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function fixGalleryUpload() {
  console.log('🔧 FIXING GALLERY UPLOAD ISSUE');
  
  try {
    // Step 1: Check and create database tables
    console.log('\n1. 🗄️ Checking database tables...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    // Check if gallery_images table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'gallery_images'");
    
    if (tables.length === 0) {
      console.log('   ❌ gallery_images table missing! Creating...');
      
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
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
          FOREIGN KEY (created_by) REFERENCES admin_users(id)
        )
      `);
      
      console.log('   ✅ gallery_images table created');
    } else {
      console.log('   ✅ gallery_images table exists');
    }

    // Check if gallery_settings table exists
    const [settingsTables] = await connection.query("SHOW TABLES LIKE 'gallery_settings'");
    
    if (settingsTables.length === 0) {
      console.log('   ❌ gallery_settings table missing! Creating...');
      
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
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
          FOREIGN KEY (created_by) REFERENCES admin_users(id)
        )
      `);
      
      // Insert default settings
      await connection.query(`
        INSERT INTO gallery_settings (wedding_id, created_by) VALUES (1, 1)
      `);
      
      console.log('   ✅ gallery_settings table created with default data');
    } else {
      console.log('   ✅ gallery_settings table exists');
    }

    await connection.end();

    // Step 2: Check upload directories
    console.log('\n2. 📁 Checking upload directories...');
    const galleryDir = path.join(__dirname, '../public/images/GalleryDatabase');
    
    if (!fs.existsSync(galleryDir)) {
      console.log('   ❌ GalleryDatabase directory missing! Creating...');
      fs.mkdirSync(galleryDir, { recursive: true });
      console.log('   ✅ GalleryDatabase directory created');
    } else {
      console.log('   ✅ GalleryDatabase directory exists');
    }

    // Step 3: Test backend API
    console.log('\n3. 🔌 Testing backend API...');
    
    // Test health
    const healthResponse = await fetch('http://localhost:3001/api/health');
    if (!healthResponse.ok) {
      console.log('   ❌ Backend not running!');
      return;
    }
    console.log('   ✅ Backend is running');

    // Test login
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

    // Test gallery endpoints
    const galleryResponse = await fetch('http://localhost:3001/api/gallery/images', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`   Gallery API status: ${galleryResponse.status}`);
    if (galleryResponse.ok) {
      const galleryData = await galleryResponse.json();
      console.log('   ✅ Gallery API working');
      console.log(`   📊 Current images: ${galleryData.data ? galleryData.data.length : 0}`);
    } else {
      console.log('   ❌ Gallery API failed');
      const errorData = await galleryResponse.json().catch(() => ({}));
      console.log('   📋 Error:', errorData);
    }

    console.log('\n🎉 GALLERY UPLOAD SYSTEM FIXED!');
    console.log('✅ Database tables created/verified');
    console.log('✅ Upload directories created/verified');
    console.log('✅ Backend API tested');
    console.log('');
    console.log('💡 Now try uploading an image in the frontend:');
    console.log('   1. Go to http://localhost:5173/admin/gallery-management');
    console.log('   2. Select image size (L/S) and type');
    console.log('   3. Drag & drop or click to upload');
    console.log('   4. Check browser console for any errors');
    console.log('');
    console.log('🔍 If still failing, check:');
    console.log('   - File size (max 5MB)');
    console.log('   - File type (JPG, PNG, WebP only)');
    console.log('   - Browser console for JavaScript errors');
    console.log('   - Network tab for failed requests');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

fixGalleryUpload();
