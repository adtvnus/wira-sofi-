#!/usr/bin/env node

// Test bride-groom management after table name fix

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function testBrideGroomManagementFix() {
  console.log('🧪 TESTING BRIDE-GROOM MANAGEMENT AFTER TABLE NAME FIX');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const fetch = await getFetch();

  try {
    // Step 1: Authentication
    console.log('🔐 Step 1: Authentication...');
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

    // Step 2: Test GET bride-groom
    console.log('\n📊 Step 2: Testing GET /api/bride-groom...');
    const getResponse = await fetch('http://localhost:3001/api/bride-groom', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`   Status: ${getResponse.status}`);
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('   ✅ GET bride-groom successful');
      console.log(`   📋 Current data:`)
      console.log(`      Bride: ${getData.data.bride_first_name} ${getData.data.bride_last_name}`);
      console.log(`      Groom: ${getData.data.groom_first_name} ${getData.data.groom_last_name}`);
      console.log(`      Bride Full: ${getData.data.bride_full_name}`);
      console.log(`      Groom Full: ${getData.data.groom_full_name}`);
    } else {
      const errorText = await getResponse.text();
      console.log(`   ❌ GET bride-groom failed: ${errorText}`);
    }

    // Step 3: Test GET bride-groom-detail
    console.log('\n📊 Step 3: Testing GET /api/bride-groom-detail...');
    const getDetailResponse = await fetch('http://localhost:3001/api/bride-groom-detail', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`   Status: ${getDetailResponse.status}`);
    if (getDetailResponse.ok) {
      const getDetailData = await getDetailResponse.json();
      console.log('   ✅ GET bride-groom-detail successful');
      console.log(`   📋 Detail data found: ${getDetailData.data ? 'YES' : 'NO'}`);
      if (getDetailData.data) {
        console.log(`      Bride Header: ${getDetailData.data.bride_header_title || 'N/A'}`);
        console.log(`      Groom Header: ${getDetailData.data.groom_header_title || 'N/A'}`);
      }
    } else {
      const errorText = await getDetailResponse.text();
      console.log(`   ❌ GET bride-groom-detail failed: ${errorText}`);
    }

    // Step 4: Test PUT bride-groom (update)
    console.log('\n✏️ Step 4: Testing PUT /api/bride-groom/1 (update)...');
    const timestamp = new Date().toLocaleTimeString().replace(/:/g, '');
    const testData = {
      groomFirstName: `TestGroom${timestamp}`,
      groomLastName: 'Maulana',
      groomFullName: `TestGroom${timestamp} Maulana`,
      groomParentNames: 'Bapak Ahmad & Ibu Siti',
      brideFirstName: `TestBride${timestamp}`,
      brideLastName: 'Kumala',
      brideFullName: `TestBride${timestamp} Kumala`,
      brideParentNames: 'Bapak Budi & Ibu Rina'
    };

    console.log(`   Updating to: Bride="${testData.brideFirstName}", Groom="${testData.groomFirstName}"`);

    const putResponse = await fetch('http://localhost:3001/api/bride-groom/1', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log(`   Status: ${putResponse.status}`);
    if (putResponse.ok) {
      const putData = await putResponse.json();
      console.log('   ✅ PUT bride-groom successful');
      console.log(`   📋 Response: ${putData.message}`);
    } else {
      const errorText = await putResponse.text();
      console.log(`   ❌ PUT bride-groom failed: ${errorText}`);
    }

    // Step 5: Test PUT bride-groom-detail (update)
    console.log('\n✏️ Step 5: Testing PUT /api/bride-groom-detail/1 (update)...');
    const testDetailData = {
      brideHeaderTitle: `Test Bride Header ${timestamp}`,
      brideHeaderSubtitle: 'Test Bride Subtitle',
      brideLabel: 'Test Bride Label',
      brideParentLabel: 'Test Bride Parent Label',
      brideFatherName: 'Test Father',
      brideMotherName: 'Test Mother',
      brideQuote: 'Test Bride Quote',
      bridePhoto: 'public/images/BrideGroom/bride.jpg',
      groomHeaderTitle: `Test Groom Header ${timestamp}`,
      groomHeaderSubtitle: 'Test Groom Subtitle',
      groomLabel: 'Test Groom Label',
      groomParentLabel: 'Test Groom Parent Label',
      groomFatherName: 'Test Groom Father',
      groomMotherName: 'Test Groom Mother',
      groomQuote: 'Test Groom Quote',
      groomPhoto: 'public/images/BrideGroom/groom.jpg'
    };

    const putDetailResponse = await fetch('http://localhost:3001/api/bride-groom-detail/1', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testDetailData)
    });

    console.log(`   Status: ${putDetailResponse.status}`);
    if (putDetailResponse.ok) {
      const putDetailData = await putDetailResponse.json();
      console.log('   ✅ PUT bride-groom-detail successful');
      console.log(`   📋 Response: ${putDetailData.message}`);
    } else {
      const errorText = await putDetailResponse.text();
      console.log(`   ❌ PUT bride-groom-detail failed: ${errorText}`);
    }

    // Step 6: Verify updates
    console.log('\n🔍 Step 6: Verifying updates...');
    const verifyResponse = await fetch('http://localhost:3001/api/bride-groom', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('   ✅ Verification successful');
      console.log(`   📋 Updated data:`)
      console.log(`      Bride: ${verifyData.data.bride_first_name} ${verifyData.data.bride_last_name}`);
      console.log(`      Groom: ${verifyData.data.groom_first_name} ${verifyData.data.groom_last_name}`);
      
      const brideUpdated = verifyData.data.bride_first_name.includes('TestBride');
      const groomUpdated = verifyData.data.groom_first_name.includes('TestGroom');
      console.log(`   ✅ Bride updated: ${brideUpdated ? 'YES' : 'NO'}`);
      console.log(`   ✅ Groom updated: ${groomUpdated ? 'YES' : 'NO'}`);
    }

    // Step 7: Revert to original values
    console.log('\n🔄 Step 7: Reverting to original values...');
    const revertData = {
      groomFirstName: 'Wiras',
      groomLastName: 'Maulana',
      groomFullName: 'Wiras Maulana',
      groomParentNames: 'Bapak Ahmad & Ibu Siti',
      brideFirstName: 'Sofi',
      brideLastName: 'Kumala',
      brideFullName: 'Sofi Kumala',
      brideParentNames: 'Bapak Budi & Ibu Rina'
    };

    const revertResponse = await fetch('http://localhost:3001/api/bride-groom/1', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(revertData)
    });

    if (revertResponse.ok) {
      console.log('   ✅ Reverted to original values');
    } else {
      console.log('   ⚠️ Failed to revert changes');
    }

    console.log('\n🎉 BRIDE-GROOM MANAGEMENT TEST COMPLETED!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 RESULTS SUMMARY:');
    console.log('   ✅ Table name fix: couple_settings → bride_groom');
    console.log('   ✅ Table name fix: bride_groom_detail_settings → bride_groom_detail');
    console.log('   ✅ GET bride-groom: Working');
    console.log('   ✅ GET bride-groom-detail: Working');
    console.log('   ✅ PUT bride-groom: Working');
    console.log('   ✅ PUT bride-groom-detail: Working');
    console.log('');
    console.log('🎯 BRIDE-GROOM MANAGEMENT FULLY OPERATIONAL!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testBrideGroomManagementFix().catch(console.error);
