#!/usr/bin/env node

// Test if bride_groom_detail_settings table is auto-updated

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

const mysql = require('mysql2/promise');

const API_BASE_URL = 'http://localhost:3001/api';

async function testBrideGroomDetailUpdate() {
  console.log('🔍 TESTING BRIDE_GROOM_DETAIL_SETTINGS AUTO-UPDATE');
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

    // Step 2: Get initial data from both tables
    console.log('\n📋 Step 2: Getting initial data from both tables...');
    
    // couple_settings table
    const [coupleInitial] = await connection.query(`
      SELECT * FROM couple_settings WHERE wedding_id = 1 AND is_active = TRUE
    `);
    
    // bride_groom_detail_settings table
    const [detailInitial] = await connection.query(`
      SELECT * FROM bride_groom_detail_settings WHERE wedding_id = 1 AND is_active = TRUE
    `);

    console.log('📊 INITIAL DATA:');
    console.log('─────────────────────────────────────────────────────');
    
    if (coupleInitial.length > 0) {
      const couple = coupleInitial[0];
      console.log('📋 couple_settings table:');
      console.log(`   Groom: ${couple.groom_first_name} ${couple.groom_last_name}`);
      console.log(`   Bride: ${couple.bride_first_name} ${couple.bride_last_name}`);
      console.log(`   Updated: ${couple.updated_at}`);
    }

    if (detailInitial.length > 0) {
      const detail = detailInitial[0];
      console.log('\n📋 bride_groom_detail_settings table:');
      console.log(`   Groom Header: ${detail.groom_header_title}`);
      console.log(`   Bride Header: ${detail.bride_header_title}`);
      console.log(`   Groom Father: ${detail.groom_father_name}`);
      console.log(`   Bride Father: ${detail.bride_father_name}`);
      console.log(`   Updated: ${detail.updated_at}`);
    }

    // Step 3: Login
    console.log('\n🔐 Step 3: Authenticating...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Authentication successful');

    // Step 4: Send update to bride-groom API
    console.log('\n📤 Step 4: Sending update via Bride-Groom API...');
    const timestamp = new Date().toLocaleTimeString().replace(/:/g, '');
    const testData = {
      groomFirstName: `TestUpdate_${timestamp}`,
      groomLastName: 'Groom',
      groomFullName: `TestUpdate_${timestamp} Groom`,
      groomParentNames: `Test Parents ${timestamp}`,
      brideFirstName: `TestUpdate_${timestamp}`,
      brideLastName: 'Bride',
      brideFullName: `TestUpdate_${timestamp} Bride`,
      brideParentNames: `Test Bride Parents ${timestamp}`
    };

    console.log('📝 Sending test data:');
    console.log(`   Groom: ${testData.groomFirstName} ${testData.groomLastName}`);
    console.log(`   Bride: ${testData.brideFirstName} ${testData.brideLastName}`);

    const updateResponse = await fetch(`${API_BASE_URL}/bride-groom/1`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (!updateResponse.ok) {
      throw new Error(`Update failed: ${updateResponse.status}`);
    }

    console.log('✅ Update request sent successfully');

    // Step 5: Check both tables after update
    console.log('\n🔍 Step 5: Checking both tables after update...');
    
    // Wait a moment for any potential updates
    await new Promise(resolve => setTimeout(resolve, 1000));

    // couple_settings table
    const [coupleAfter] = await connection.query(`
      SELECT * FROM couple_settings WHERE wedding_id = 1 AND is_active = TRUE
    `);
    
    // bride_groom_detail_settings table
    const [detailAfter] = await connection.query(`
      SELECT * FROM bride_groom_detail_settings WHERE wedding_id = 1 AND is_active = TRUE
    `);

    console.log('📊 DATA AFTER UPDATE:');
    console.log('─────────────────────────────────────────────────────');
    
    if (coupleAfter.length > 0) {
      const couple = coupleAfter[0];
      console.log('📋 couple_settings table:');
      console.log(`   Groom: ${couple.groom_first_name} ${couple.groom_last_name}`);
      console.log(`   Bride: ${couple.bride_first_name} ${couple.bride_last_name}`);
      console.log(`   Updated: ${couple.updated_at}`);
      
      // Check if couple_settings was updated
      const coupleUpdated = coupleInitial.length > 0 && 
        new Date(couple.updated_at).getTime() > new Date(coupleInitial[0].updated_at).getTime();
      console.log(`   Status: ${coupleUpdated ? '✅ UPDATED' : '❌ NOT UPDATED'}`);
    }

    if (detailAfter.length > 0) {
      const detail = detailAfter[0];
      console.log('\n📋 bride_groom_detail_settings table:');
      console.log(`   Groom Header: ${detail.groom_header_title}`);
      console.log(`   Bride Header: ${detail.bride_header_title}`);
      console.log(`   Groom Father: ${detail.groom_father_name}`);
      console.log(`   Bride Father: ${detail.bride_father_name}`);
      console.log(`   Updated: ${detail.updated_at}`);
      
      // Check if detail_settings was updated
      const detailUpdated = detailInitial.length > 0 && 
        new Date(detail.updated_at).getTime() > new Date(detailInitial[0].updated_at).getTime();
      console.log(`   Status: ${detailUpdated ? '✅ UPDATED' : '❌ NOT UPDATED'}`);
    }

    // Step 6: Analysis
    console.log('\n🎯 ANALYSIS:');
    console.log('═══════════════════════════════════════════════════════');
    
    const coupleWasUpdated = coupleAfter.length > 0 && coupleInitial.length > 0 &&
      new Date(coupleAfter[0].updated_at).getTime() > new Date(coupleInitial[0].updated_at).getTime();
    
    const detailWasUpdated = detailAfter.length > 0 && detailInitial.length > 0 &&
      new Date(detailAfter[0].updated_at).getTime() > new Date(detailInitial[0].updated_at).getTime();

    console.log('📊 Update Results:');
    console.log(`   couple_settings: ${coupleWasUpdated ? '✅ AUTO-UPDATED' : '❌ NOT UPDATED'}`);
    console.log(`   bride_groom_detail_settings: ${detailWasUpdated ? '✅ AUTO-UPDATED' : '❌ NOT UPDATED'}`);

    console.log('\n🔍 Conclusion:');
    if (detailWasUpdated) {
      console.log('✅ YES: bride_groom_detail_settings IS auto-updated');
      console.log('   The Bride-Groom Management page updates both tables');
    } else {
      console.log('❌ NO: bride_groom_detail_settings is NOT auto-updated');
      console.log('   The Bride-Groom Management page only updates couple_settings');
      console.log('   bride_groom_detail_settings contains separate configuration data');
    }

    // Step 7: Restore original data
    console.log('\n🔄 Step 7: Restoring original data...');
    const originalData = {
      groomFirstName: 'Wira',
      groomLastName: 'Maulana',
      groomFullName: 'Wira Maulana',
      groomParentNames: 'Bapak Ahmad & Ibu Siti',
      brideFirstName: 'Sofi',
      brideLastName: 'Kumala',
      brideFullName: 'Sofi Kumala',
      brideParentNames: 'Bapak Budi & Ibu Rina'
    };

    await fetch(`${API_BASE_URL}/bride-groom/1`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(originalData)
    });

    console.log('✅ Original data restored');

    // Step 8: Show table purposes
    console.log('\n📋 TABLE PURPOSES:');
    console.log('─────────────────────────────────────────────────────');
    console.log('📊 couple_settings:');
    console.log('   • Main bride & groom names');
    console.log('   • Parent names');
    console.log('   • Basic couple information');
    console.log('   • Updated by: Bride-Groom Management page');
    console.log('');
    console.log('📊 bride_groom_detail_settings:');
    console.log('   • Header titles and subtitles');
    console.log('   • Individual father/mother names');
    console.log('   • Quotes and labels');
    console.log('   • Display configuration');
    console.log('   • Updated by: Separate admin page (if exists)');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
testBrideGroomDetailUpdate().catch(console.error);
