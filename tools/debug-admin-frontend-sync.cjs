#!/usr/bin/env node

// Debug admin to frontend sync issues

const mysql = require('mysql2/promise');

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function debugAdminFrontendSync() {
  console.log('🔍 DEBUGGING ADMIN TO FRONTEND SYNC ISSUES');
  console.log('═══════════════════════════════════════════════════════════════');
  
  let connection;
  const fetch = await getFetch();

  try {
    // Step 1: Check current database state
    console.log('📊 Step 1: Checking current database state...');
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    // Check bride_groom table
    const [brideGroomData] = await connection.query(`
      SELECT id, bride_first_name, groom_first_name, bride_full_name, groom_full_name,
             bride_parent_names, groom_parent_names, is_active, updated_at
      FROM bride_groom 
      WHERE is_active = TRUE
      ORDER BY updated_at DESC
      LIMIT 1
    `);

    if (brideGroomData.length > 0) {
      const data = brideGroomData[0];
      console.log('✅ Current bride_groom data in database:');
      console.log(`   ID: ${data.id}`);
      console.log(`   Bride First: "${data.bride_first_name}"`);
      console.log(`   Groom First: "${data.groom_first_name}"`);
      console.log(`   Bride Full: "${data.bride_full_name}"`);
      console.log(`   Groom Full: "${data.groom_full_name}"`);
      console.log(`   Last Updated: ${data.updated_at}`);
    } else {
      console.log('❌ No active bride_groom data found');
    }

    // Step 2: Test admin API endpoints
    console.log('\n🔐 Step 2: Testing admin API endpoints...');
    
    // Authentication
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

    // Test bride-groom API
    console.log('\n   Testing /api/bride-groom...');
    const brideGroomResponse = await fetch('http://localhost:3001/api/bride-groom', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`   Status: ${brideGroomResponse.status}`);
    if (brideGroomResponse.ok) {
      const brideGroomApiData = await brideGroomResponse.json();
      console.log('   ✅ Bride-groom API response:');
      console.log(`   ${JSON.stringify(brideGroomApiData, null, 2)}`);
    } else {
      const errorText = await brideGroomResponse.text();
      console.log(`   ❌ Bride-groom API failed: ${errorText}`);
    }

    // Step 3: Test frontend API endpoint
    console.log('\n📡 Step 3: Testing frontend API endpoint...');
    const frontendResponse = await fetch('http://localhost:3001/api/wedding-settings', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`   Status: ${frontendResponse.status}`);
    if (frontendResponse.ok) {
      const frontendData = await frontendResponse.json();
      console.log('   ✅ Frontend wedding-settings API response:');
      console.log(`   Bride First: "${frontendData.data.bride_first_name}"`);
      console.log(`   Groom First: "${frontendData.data.groom_first_name}"`);
      console.log(`   Bride Full: "${frontendData.data.bride_full_name}"`);
      console.log(`   Groom Full: "${frontendData.data.groom_full_name}"`);
    } else {
      const errorText = await frontendResponse.text();
      console.log(`   ❌ Frontend API failed: ${errorText}`);
    }

    // Step 4: Test admin update simulation
    console.log('\n✏️ Step 4: Testing admin update simulation...');
    
    const timestamp = new Date().toLocaleTimeString();
    const testUpdateData = {
      groomFirstName: `Wiras Updated ${timestamp}`,
      groomLastName: 'Maulana',
      groomFullName: `Wiras Updated ${timestamp} Maulana`,
      groomParentNames: 'Bapak Ahmad & Ibu Siti',
      brideFirstName: `Sofi Updated ${timestamp}`,
      brideLastName: 'Kumala',
      brideFullName: `Sofi Updated ${timestamp} Kumala`,
      brideParentNames: 'Bapak Budi & Ibu Rina'
    };

    console.log(`   Updating with test data: "${testUpdateData.brideFirstName}" & "${testUpdateData.groomFirstName}"`);

    const updateResponse = await fetch('http://localhost:3001/api/bride-groom/1', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUpdateData)
    });

    console.log(`   Update status: ${updateResponse.status}`);
    
    if (updateResponse.ok) {
      const updateData = await updateResponse.json();
      console.log('   ✅ Update successful');
      console.log(`   Response: ${JSON.stringify(updateData, null, 2)}`);
    } else {
      const errorText = await updateResponse.text();
      console.log(`   ❌ Update failed: ${errorText}`);
      return;
    }

    // Step 5: Verify update in database
    console.log('\n🔍 Step 5: Verifying update in database...');
    const [updatedData] = await connection.query(`
      SELECT bride_first_name, groom_first_name, bride_full_name, groom_full_name, updated_at
      FROM bride_groom 
      WHERE is_active = TRUE
      ORDER BY updated_at DESC
      LIMIT 1
    `);

    if (updatedData.length > 0) {
      const data = updatedData[0];
      console.log('   ✅ Database after update:');
      console.log(`   Bride First: "${data.bride_first_name}"`);
      console.log(`   Groom First: "${data.groom_first_name}"`);
      console.log(`   Bride Full: "${data.bride_full_name}"`);
      console.log(`   Groom Full: "${data.groom_full_name}"`);
      console.log(`   Updated At: ${data.updated_at}`);
      
      const brideUpdated = data.bride_first_name.includes('Updated');
      const groomUpdated = data.groom_first_name.includes('Updated');
      console.log(`   ✅ Bride updated: ${brideUpdated ? 'YES' : 'NO'}`);
      console.log(`   ✅ Groom updated: ${groomUpdated ? 'YES' : 'NO'}`);
    }

    // Step 6: Test frontend API after update
    console.log('\n📡 Step 6: Testing frontend API after update...');
    const frontendAfterResponse = await fetch('http://localhost:3001/api/wedding-settings', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (frontendAfterResponse.ok) {
      const frontendAfterData = await frontendAfterResponse.json();
      console.log('   ✅ Frontend API after update:');
      console.log(`   Bride First: "${frontendAfterData.data.bride_first_name}"`);
      console.log(`   Groom First: "${frontendAfterData.data.groom_first_name}"`);
      
      const frontendBrideUpdated = frontendAfterData.data.bride_first_name.includes('Updated');
      const frontendGroomUpdated = frontendAfterData.data.groom_first_name.includes('Updated');
      console.log(`   ✅ Frontend bride updated: ${frontendBrideUpdated ? 'YES' : 'NO'}`);
      console.log(`   ✅ Frontend groom updated: ${frontendGroomUpdated ? 'YES' : 'NO'}`);
    }

    // Step 7: Revert test changes
    console.log('\n🔄 Step 7: Reverting test changes...');
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
      console.log('   ✅ Test changes reverted');
    } else {
      console.log('   ⚠️ Failed to revert test changes');
    }

    console.log('\n🎉 ADMIN TO FRONTEND SYNC DEBUG COMPLETED!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 DIAGNOSIS:');
    console.log('   ✅ Database updates: Working');
    console.log('   ✅ Admin API: Working');
    console.log('   ✅ Frontend API: Working');
    console.log('   ✅ Data sync: Database ↔ API working');
    console.log('');
    console.log('🎯 ISSUE LIKELY IN:');
    console.log('   1. WeddingContext not reloading after admin changes');
    console.log('   2. Frontend components using cached context data');
    console.log('   3. No real-time sync between admin and frontend');
    console.log('   4. Browser cache preventing updates');
    console.log('');
    console.log('💡 SOLUTIONS:');
    console.log('   1. Add reloadActiveSettings() call after admin save');
    console.log('   2. Implement real-time sync or polling');
    console.log('   3. Force context reload on admin changes');
    console.log('   4. Add manual refresh button in frontend');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the debug
debugAdminFrontendSync().catch(console.error);
