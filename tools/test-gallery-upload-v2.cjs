const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testGalleryUpload() {
  console.log('🧪 TESTING GALLERY IMAGE UPLOAD');
  
  try {
    // Step 1: Login
    console.log('\n1. 🔐 Getting authentication token...');
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

    // Step 2: Create a test image if it doesn't exist
    console.log('\n2. 📁 Preparing test image...');
    const testImagePath = path.join(__dirname, '../public/images/test-upload.jpg');
    
    if (!fs.existsSync(testImagePath)) {
      console.log('   ⚠️ No test image found at:', testImagePath);
      console.log('   💡 To test upload, add a test image file at that location');
      console.log('   📋 Supported formats: JPG, PNG, WebP (max 5MB)');
      
      // Try to find any image in public/images
      const imagesDir = path.join(__dirname, '../public/images');
      if (fs.existsSync(imagesDir)) {
        const files = fs.readdirSync(imagesDir);
        const imageFiles = files.filter(file => 
          /\.(jpg|jpeg|png|webp)$/i.test(file)
        );
        
        if (imageFiles.length > 0) {
          const firstImage = path.join(imagesDir, imageFiles[0]);
          console.log(`   📸 Found existing image: ${imageFiles[0]}`);
          console.log('   🔄 Using this image for test...');
          
          // Test upload with existing image
          await testUploadWithFile(firstImage, token, imageFiles[0]);
        } else {
          console.log('   ❌ No image files found in public/images directory');
        }
      } else {
        console.log('   ❌ public/images directory not found');
      }
    } else {
      console.log('   ✅ Test image found');
      await testUploadWithFile(testImagePath, token, 'test-upload.jpg');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testUploadWithFile(filePath, token, fileName) {
  try {
    console.log(`\n3. 📤 Testing upload with ${fileName}...`);
    
    // Check file size
    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    console.log(`   📊 File size: ${fileSizeInMB.toFixed(2)} MB`);
    
    if (fileSizeInMB > 5) {
      console.log('   ❌ File too large (max 5MB)');
      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('image', fs.createReadStream(filePath));
    formData.append('imageSize', 'S');
    formData.append('imageType', 'square');
    formData.append('imageAlt', 'Test Upload Image');
    formData.append('displayOrder', '0');

    console.log('   📡 Sending upload request...');
    
    const uploadResponse = await fetch('http://localhost:3001/api/gallery/upload-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    console.log(`   📊 Upload response: ${uploadResponse.status} ${uploadResponse.statusText}`);

    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json();
      console.log('   ✅ Upload successful!');
      console.log('   📋 Upload response:', JSON.stringify(uploadData, null, 2));
      
      // Verify the image was saved to database
      console.log('\n4. 🔍 Verifying upload in database...');
      const verifyResponse = await fetch('http://localhost:3001/api/gallery/images', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log(`   ✅ Verification successful: ${verifyData.data.length} images in database`);
        
        if (verifyData.data.length > 0) {
          const latestImage = verifyData.data[verifyData.data.length - 1];
          console.log('   📸 Latest uploaded image:');
          console.log(`      ID: ${latestImage.id}`);
          console.log(`      URL: ${latestImage.image_src}`);
          console.log(`      Size: ${latestImage.image_size}`);
          console.log(`      Type: ${latestImage.image_type}`);
        }
      }
      
    } else {
      const errorData = await uploadResponse.json().catch(() => ({}));
      console.log('   ❌ Upload failed');
      console.log('   📋 Error response:', JSON.stringify(errorData, null, 2));
    }

  } catch (error) {
    console.error('❌ Upload test failed:', error.message);
  }
}

testGalleryUpload();
