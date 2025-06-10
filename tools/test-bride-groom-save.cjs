#!/usr/bin/env node

// Test script to verify Bride-Groom data saving to database

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

const mysql = require('mysql2/promise');

const API_BASE_URL = 'http://localhost:3001/api';

async function testBrideGroomSave() {
  console.log('🧪 TESTING BRIDE-GROOM DATA SAVE TO DATABASE');
  console.log('═══════════════════════════════════════════════════════');
  
  const fetch = await getFetch();
  let token = null;

  try {
    // Step 1: Login to get token
    console.log('🔐 Step 1: Authenticating...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    if (!loginData.success || !loginData.token) {
      throw new Error('Login response invalid');
    }

    token = loginData.token;
    console.log('✅ Authentication successful');

    // Step 2: Check current data in database
    console.log('\n📊 Step 2: Checking current database data...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    const [beforeData] = await connection.query(`
      SELECT * FROM couple_settings WHERE wedding_id = 1 AND is_active = TRUE
    `);

    console.log('📋 Current data in database:');
    if (beforeData.length > 0) {
      console.log(`   Groom: ${beforeData[0].groom_first_name} ${beforeData[0].groom_last_name}`);
      console.log(`   Bride: ${beforeData[0].bride_first_name} ${beforeData[0].bride_last_name}`);
      console.log(`   Groom Parents: ${beforeData[0].groom_parent_names || 'Not set'}`);
      console.log(`   Bride Parents: ${beforeData[0].bride_parent_names || 'Not set'}`);
    } else {
      console.log('   No data found');
    }

    // Step 3: Send test data via API
    console.log('\n📤 Step 3: Sending test data via API...');
    const testData = {
      groomFirstName: 'Test Groom',
      groomLastName: 'Updated',
      groomFullName: 'Test Groom Updated',
      groomParentNames: 'Bapak Test & Ibu Test',
      brideFirstName: 'Test Bride',
      brideLastName: 'Updated',
      brideFullName: 'Test Bride Updated',
      brideParentNames: 'Bapak Test2 & Ibu Test2'
    };

    console.log('📝 Test data to save:');
    console.log(`   Groom: ${testData.groomFirstName} ${testData.groomLastName}`);
    console.log(`   Bride: ${testData.brideFirstName} ${testData.brideLastName}`);
    console.log(`   Groom Parents: ${testData.groomParentNames}`);
    console.log(`   Bride Parents: ${testData.brideParentNames}`);

    const saveResponse = await fetch(`${API_BASE_URL}/bride-groom/1`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (!saveResponse.ok) {
      const errorText = await saveResponse.text();
      throw new Error(`Save failed: ${saveResponse.status} - ${errorText}`);
    }

    const saveData = await saveResponse.json();
    if (!saveData.success) {
      throw new Error(`Save response failed: ${saveData.error || 'Unknown error'}`);
    }

    console.log('✅ API save request successful');

    // Step 4: Verify data was saved to database
    console.log('\n🔍 Step 4: Verifying data in database...');
    const [afterData] = await connection.query(`
      SELECT * FROM couple_settings WHERE wedding_id = 1 AND is_active = TRUE
    `);

    if (afterData.length === 0) {
      throw new Error('No data found in database after save');
    }

    const savedData = afterData[0];
    console.log('📋 Data in database after save:');
    console.log(`   Groom: ${savedData.groom_first_name} ${savedData.groom_last_name}`);
    console.log(`   Bride: ${savedData.bride_first_name} ${savedData.bride_last_name}`);
    console.log(`   Groom Parents: ${savedData.groom_parent_names || 'Not set'}`);
    console.log(`   Bride Parents: ${savedData.bride_parent_names || 'Not set'}`);

    // Step 5: Verify data matches what we sent
    console.log('\n✅ Step 5: Verification Results:');
    const verifications = [
      { field: 'Groom First Name', sent: testData.groomFirstName, saved: savedData.groom_first_name },
      { field: 'Groom Last Name', sent: testData.groomLastName, saved: savedData.groom_last_name },
      { field: 'Bride First Name', sent: testData.brideFirstName, saved: savedData.bride_first_name },
      { field: 'Bride Last Name', sent: testData.brideLastName, saved: savedData.bride_last_name },
      { field: 'Groom Parents', sent: testData.groomParentNames, saved: savedData.groom_parent_names },
      { field: 'Bride Parents', sent: testData.brideParentNames, saved: savedData.bride_parent_names }
    ];

    let allMatch = true;
    verifications.forEach(({ field, sent, saved }) => {
      const matches = sent === saved;
      console.log(`   ${field}: ${matches ? '✅' : '❌'} ${matches ? 'MATCH' : 'MISMATCH'}`);
      if (!matches) {
        console.log(`     Sent: "${sent}"`);
        console.log(`     Saved: "${saved}"`);
        allMatch = false;
      }
    });

    await connection.end();

    console.log('\n🎯 FINAL RESULT:');
    if (allMatch) {
      console.log('✅ SUCCESS: All data saved correctly to database!');
      console.log('✅ The Bride-Groom Management page DOES automatically save to database');
    } else {
      console.log('❌ FAILURE: Some data did not save correctly');
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.log('❌ The Bride-Groom Management page may NOT be saving to database correctly');
  }
}

// Run the test
testBrideGroomSave().catch(console.error);
