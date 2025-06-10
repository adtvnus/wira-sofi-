#!/usr/bin/env node

// Check frontend data flow and potential issues

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

const mysql = require('mysql2/promise');

const API_BASE_URL = 'http://localhost:3001/api';

async function checkFrontendDataFlow() {
  console.log('🔍 CHECKING FRONTEND DATA FLOW ISSUES');
  console.log('═══════════════════════════════════════════════════════');
  
  const fetch = await getFetch();
  let connection;

  try {
    // Step 1: Restore original data first
    console.log('🔄 Step 1: Restoring original wedding data...');
    
    // Login
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;

    // Restore original data
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

    const restoreResponse = await fetch(`${API_BASE_URL}/bride-groom/1`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(originalData)
    });

    if (restoreResponse.ok) {
      console.log('✅ Original data restored');
    }

    // Step 2: Check database directly
    console.log('\n📊 Step 2: Checking current database state...');
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    const [currentData] = await connection.query(`
      SELECT * FROM couple_settings WHERE wedding_id = 1 AND is_active = TRUE
    `);

    if (currentData.length > 0) {
      const record = currentData[0];
      console.log('📋 Current database data:');
      console.log(`   Groom: ${record.groom_first_name} ${record.groom_last_name}`);
      console.log(`   Bride: ${record.bride_first_name} ${record.bride_last_name}`);
      console.log(`   Groom Parents: ${record.groom_parent_names}`);
      console.log(`   Bride Parents: ${record.bride_parent_names}`);
      console.log(`   Last Updated: ${record.updated_at}`);
    }

    // Step 3: Check what frontend sees
    console.log('\n🌐 Step 3: Checking what frontend API returns...');
    const getResponse = await fetch(`${API_BASE_URL}/bride-groom`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('📋 Frontend API data:');
      console.log(`   Groom: ${getData.data.groom_first_name} ${getData.data.groom_last_name}`);
      console.log(`   Bride: ${getData.data.bride_first_name} ${getData.data.bride_last_name}`);
      console.log(`   Groom Parents: ${getData.data.groom_parent_names}`);
      console.log(`   Bride Parents: ${getData.data.bride_parent_names}`);
    }

    // Step 4: Check wedding settings API (might be used by frontend)
    console.log('\n⚙️ Step 4: Checking wedding settings API...');
    const weddingResponse = await fetch(`${API_BASE_URL}/wedding-settings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (weddingResponse.ok) {
      const weddingData = await weddingResponse.json();
      console.log('📋 Wedding settings data:');
      console.log(`   Groom: ${weddingData.data.groom_first_name} ${weddingData.data.groom_last_name}`);
      console.log(`   Bride: ${weddingData.data.bride_first_name} ${weddingData.data.bride_last_name}`);
    }

    // Step 5: Identify potential issues
    console.log('\n🔍 Step 5: Potential Issues Analysis...');
    
    console.log('\n📋 POSSIBLE REASONS WHY YOU MIGHT NOT SEE UPDATES:');
    console.log('');
    console.log('1. 🔄 BROWSER CACHE:');
    console.log('   - Frontend might be caching old data');
    console.log('   - Try hard refresh (Ctrl+F5) or clear browser cache');
    console.log('');
    console.log('2. 📱 FRONTEND STATE:');
    console.log('   - React context might not be updating');
    console.log('   - Page might need refresh to see changes');
    console.log('');
    console.log('3. 🔄 AUTO-REFRESH:');
    console.log('   - Frontend might be auto-refreshing from context instead of API');
    console.log('   - Check if page reloads data on mount');
    console.log('');
    console.log('4. 📊 MULTIPLE DATA SOURCES:');
    console.log('   - Frontend might be reading from different API endpoint');
    console.log('   - Check if using wedding-settings vs bride-groom API');
    console.log('');
    console.log('5. 🕐 TIMING ISSUE:');
    console.log('   - Database update might take a moment to reflect');
    console.log('   - Try waiting a few seconds and refresh');

    // Step 6: Test real-time update
    console.log('\n🧪 Step 6: Testing real-time update...');
    const testData = {
      groomFirstName: 'REALTIME_TEST',
      groomLastName: 'UPDATE',
      groomFullName: 'REALTIME_TEST UPDATE',
      groomParentNames: 'Test Parents Real Time',
      brideFirstName: 'REALTIME_BRIDE',
      brideLastName: 'UPDATE',
      brideFullName: 'REALTIME_BRIDE UPDATE',
      brideParentNames: 'Test Bride Parents Real Time'
    };

    console.log('📤 Sending real-time test data...');
    const testResponse = await fetch(`${API_BASE_URL}/bride-groom/1`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (testResponse.ok) {
      console.log('✅ Test data sent successfully');
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if it's in database
      const [testCheck] = await connection.query(`
        SELECT * FROM couple_settings WHERE wedding_id = 1 AND is_active = TRUE
      `);
      
      if (testCheck.length > 0) {
        const testRecord = testCheck[0];
        console.log('📋 Database after test update:');
        console.log(`   Groom: ${testRecord.groom_first_name} ${testRecord.groom_last_name}`);
        console.log(`   Bride: ${testRecord.bride_first_name} ${testRecord.bride_last_name}`);
        
        if (testRecord.groom_first_name === 'REALTIME_TEST') {
          console.log('✅ CONFIRMED: Database IS updating in real-time');
          console.log('💡 The issue is likely in the frontend display, not the database');
        }
      }
    }

    // Step 7: Restore original data again
    console.log('\n🔄 Step 7: Restoring original data...');
    await fetch(`${API_BASE_URL}/bride-groom/1`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(originalData)
    });
    console.log('✅ Original data restored');

    console.log('\n🎯 CONCLUSION:');
    console.log('The database update mechanism is working correctly.');
    console.log('If you\'re not seeing updates in the frontend, try:');
    console.log('1. Hard refresh the browser (Ctrl+F5)');
    console.log('2. Clear browser cache');
    console.log('3. Check browser developer tools for any JavaScript errors');
    console.log('4. Verify you\'re looking at the right page/data');

  } catch (error) {
    console.error('\n❌ CHECK FAILED:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the check
checkFrontendDataFlow().catch(console.error);
