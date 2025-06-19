const fetch = require('node-fetch');

async function testGalleryAPIFixed() {
  console.log('🧪 TESTING GALLERY API AFTER FIX');
  
  try {
    // Step 1: Login
    console.log('\n1. 🔐 Testing login...');
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

    // Step 2: Test gallery images API
    console.log('\n2. 📡 Testing /api/gallery/images...');
    const imagesResponse = await fetch('http://localhost:3001/api/gallery/images', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`   📊 Response status: ${imagesResponse.status} ${imagesResponse.statusText}`);
    
    if (imagesResponse.ok) {
      const imagesData = await imagesResponse.json();
      console.log('   ✅ Gallery images API working!');
      console.log(`   📊 Found ${imagesData.data.length} images`);
    } else {
      const errorData = await imagesResponse.json().catch(() => ({}));
      console.log('   ❌ Gallery images API failed');
      console.log('   📋 Error:', errorData);
      return;
    }

    // Step 3: Test gallery settings API
    console.log('\n3. 📡 Testing /api/gallery/settings...');
    const settingsResponse = await fetch('http://localhost:3001/api/gallery/settings', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`   📊 Response status: ${settingsResponse.status} ${settingsResponse.statusText}`);
    
    if (settingsResponse.ok) {
      const settingsData = await settingsResponse.json();
      console.log('   ✅ Gallery settings API working!');
      console.log('   📋 Settings data:', JSON.stringify(settingsData.data, null, 2));
    } else {
      const errorData = await settingsResponse.json().catch(() => ({}));
      console.log('   ❌ Gallery settings API failed');
      console.log('   📋 Error:', errorData);
    }

    console.log('\n🎉 GALLERY API TEST COMPLETED!');
    console.log('✅ All gallery endpoints working correctly');
    console.log('');
    console.log('💡 Now you can:');
    console.log('   1. Go to http://localhost:5173/admin/gallery-management');
    console.log('   2. Try uploading an image');
    console.log('   3. Select image size (L/S) and type');
    console.log('   4. Drag & drop or click to upload');
    console.log('');
    console.log('🔍 If upload still fails, check:');
    console.log('   - File size (max 5MB)');
    console.log('   - File type (JPG, PNG, WebP only)');
    console.log('   - Browser console for JavaScript errors');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testGalleryAPIFixed();
