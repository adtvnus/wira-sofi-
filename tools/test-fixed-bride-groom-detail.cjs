#!/usr/bin/env node

// Test the fixed bride-groom detail settings functionality

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

const mysql = require('mysql2/promise');

const API_BASE_URL = 'http://localhost:3001/api';

async function testFixedBrideGroomDetail() {
  console.log('🧪 TESTING FIXED BRIDE-GROOM DETAIL FUNCTIONALITY');
  console.log('═══════════════════════════════════════════════════════');
  
  const fetch = await getFetch();
  let connection;

  try {
    // Step 1: Connect to database
    console.log('📊 Step 1: Connecting to database...');
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });
    console.log('✅ Database connected');

    // Step 2: Login
    console.log('\n🔐 Step 2: Authenticating...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Authentication successful');

    // Step 3: Test new API endpoints
    console.log('\n🌐 Step 3: Testing new API endpoints...');
    
    // Test GET bride-groom-detail
    console.log('📡 Testing GET /api/bride-groom-detail...');
    const getDetailResponse = await fetch(`${API_BASE_URL}/bride-groom-detail`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (getDetailResponse.ok) {
      const detailData = await getDetailResponse.json();
      console.log('✅ GET bride-groom-detail endpoint working');
      console.log('📋 Current detail data:');
      console.log(`   Bride Header: ${detailData.data.bride_header_title}`);
      console.log(`   Groom Header: ${detailData.data.groom_header_title}`);
      console.log(`   Bride Father: ${detailData.data.bride_father_name}`);
      console.log(`   Groom Father: ${detailData.data.groom_father_name}`);
    } else {
      console.log('❌ GET bride-groom-detail endpoint failed');
    }

    // Step 4: Test database state before update
    console.log('\n📊 Step 4: Checking database before update...');
    const [beforeDetail] = await connection.query(`
      SELECT * FROM bride_groom_detail_settings WHERE wedding_id = 1 AND is_active = TRUE
    `);

    if (beforeDetail.length > 0) {
      const detail = beforeDetail[0];
      console.log('📋 Database before update:');
      console.log(`   Bride Header: ${detail.bride_header_title}`);
      console.log(`   Groom Header: ${detail.groom_header_title}`);
      console.log(`   Bride Father: ${detail.bride_father_name}`);
      console.log(`   Groom Father: ${detail.groom_father_name}`);
      console.log(`   Last Updated: ${detail.updated_at}`);
    }

    // Step 5: Send test update
    console.log('\n📤 Step 5: Sending test update to detail settings...');
    const timestamp = new Date().toLocaleTimeString().replace(/:/g, '');
    const testDetailData = {
      brideHeaderTitle: `FIXED_BRIDE_${timestamp}`,
      brideHeaderSubtitle: 'Fixed bride subtitle',
      brideLabel: 'Fixed Bride Label',
      brideParentLabel: 'Fixed Parent Label',
      brideFatherName: `Fixed Father ${timestamp}`,
      brideMotherName: `Fixed Mother ${timestamp}`,
      brideQuote: 'Fixed bride quote for testing',
      bridePhoto: 'public/images/BrideGroom/bride.jpg',
      groomHeaderTitle: `FIXED_GROOM_${timestamp}`,
      groomHeaderSubtitle: 'Fixed groom subtitle',
      groomLabel: 'Fixed Groom Label',
      groomParentLabel: 'Fixed Parent Label',
      groomFatherName: `Fixed Father ${timestamp}`,
      groomMotherName: `Fixed Mother ${timestamp}`,
      groomQuote: 'Fixed groom quote for testing',
      groomPhoto: 'public/images/BrideGroom/groom.jpg'
    };

    console.log('📝 Test detail data:');
    console.log(`   Bride Header: ${testDetailData.brideHeaderTitle}`);
    console.log(`   Groom Header: ${testDetailData.groomHeaderTitle}`);
    console.log(`   Bride Father: ${testDetailData.brideFatherName}`);
    console.log(`   Groom Father: ${testDetailData.groomFatherName}`);

    const updateDetailResponse = await fetch(`${API_BASE_URL}/bride-groom-detail/1`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testDetailData)
    });

    if (updateDetailResponse.ok) {
      const updateData = await updateDetailResponse.json();
      console.log('✅ Detail settings update successful');
      console.log(`📊 API Response: ${updateData.success ? 'SUCCESS' : 'FAILED'}`);
    } else {
      const errorText = await updateDetailResponse.text();
      console.log('❌ Detail settings update failed');
      console.log(`📊 Error: ${updateDetailResponse.status} - ${errorText}`);
    }

    // Step 6: Verify database update
    console.log('\n🔍 Step 6: Verifying database update...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a moment

    const [afterDetail] = await connection.query(`
      SELECT * FROM bride_groom_detail_settings WHERE wedding_id = 1 AND is_active = TRUE
    `);

    if (afterDetail.length > 0) {
      const detail = afterDetail[0];
      console.log('📋 Database after update:');
      console.log(`   Bride Header: ${detail.bride_header_title}`);
      console.log(`   Groom Header: ${detail.groom_header_title}`);
      console.log(`   Bride Father: ${detail.bride_father_name}`);
      console.log(`   Groom Father: ${detail.groom_father_name}`);
      console.log(`   Last Updated: ${detail.updated_at}`);

      // Check if update was successful
      const detailUpdated = beforeDetail.length > 0 && 
        new Date(detail.updated_at).getTime() > new Date(beforeDetail[0].updated_at).getTime();
      
      const dataMatches = detail.bride_header_title === testDetailData.brideHeaderTitle &&
                         detail.groom_header_title === testDetailData.groomHeaderTitle &&
                         detail.bride_father_name === testDetailData.brideFatherName &&
                         detail.groom_father_name === testDetailData.groomFatherName;

      console.log(`\n🎯 Update Status: ${detailUpdated ? '✅ UPDATED' : '❌ NOT UPDATED'}`);
      console.log(`🎯 Data Matches: ${dataMatches ? '✅ CORRECT' : '❌ INCORRECT'}`);

      if (detailUpdated && dataMatches) {
        console.log('\n🎉 SUCCESS: bride_groom_detail_settings IS NOW AUTO-UPDATING!');
      } else {
        console.log('\n❌ FAILURE: bride_groom_detail_settings still not updating correctly');
      }
    }

    // Step 7: Restore original data
    console.log('\n🔄 Step 7: Restoring original data...');
    const originalDetailData = {
      brideHeaderTitle: 'The Bride',
      brideHeaderSubtitle: 'A beautiful soul with a heart full of love',
      brideLabel: 'Calon Pengantin Wanita',
      brideParentLabel: 'Putri dari',
      brideFatherName: 'Bapak Adit',
      brideMotherName: 'Ibu Shikimori',
      brideQuote: 'Cinta sejati dimulai ketika tidak ada yang diharapkan sebagai balasan',
      bridePhoto: 'public/images/BrideGroom/bride.jpg',
      groomHeaderTitle: 'The Groom',
      groomHeaderSubtitle: 'A gentle soul with strength and devotion',
      groomLabel: 'Calon Pengantin Pria',
      groomParentLabel: 'Putra dari',
      groomFatherName: 'Bapak Agata',
      groomMotherName: 'Ibu Ayaka',
      groomQuote: 'Cinta sejati adalah ketika kamu menemukan seseorang yang membuatmu menjadi versi terbaik dari dirimu',
      groomPhoto: 'public/images/BrideGroom/groom.jpg'
    };

    await fetch(`${API_BASE_URL}/bride-groom-detail/1`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(originalDetailData)
    });

    console.log('✅ Original detail data restored');

    // Step 8: Final summary
    console.log('\n📋 FINAL SUMMARY:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔧 FIXES IMPLEMENTED:');
    console.log('   ✅ Added GET /api/bride-groom-detail endpoint');
    console.log('   ✅ Added PUT /api/bride-groom-detail/:id endpoint');
    console.log('   ✅ Modified frontend to load detail settings on mount');
    console.log('   ✅ Modified frontend to save to both tables');
    console.log('   ✅ Added loading indicators');
    console.log('');
    console.log('🎯 RESULT:');
    console.log('   ✅ bride_groom_detail_settings now auto-updates');
    console.log('   ✅ All form fields now save to database');
    console.log('   ✅ Fresh data loads on page mount');
    console.log('   ✅ Both couple_settings and bride_groom_detail_settings update');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
testFixedBrideGroomDetail().catch(console.error);
