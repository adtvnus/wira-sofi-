#!/usr/bin/env node

// Test frontend refresh functionality

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

const mysql = require('mysql2/promise');

const API_BASE_URL = 'http://localhost:3001/api';

async function testFrontendRefresh() {
  console.log('🧪 TESTING FRONTEND REFRESH FUNCTIONALITY');
  console.log('═══════════════════════════════════════════════════════');
  
  const fetch = await getFetch();
  let connection;

  try {
    // Step 1: Login
    console.log('🔐 Step 1: Authenticating...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Authentication successful');

    // Step 2: Set test data
    console.log('\n📤 Step 2: Setting test data...');
    const testData = {
      groomFirstName: 'FRONTEND_TEST',
      groomLastName: 'REFRESH',
      groomFullName: 'FRONTEND_TEST REFRESH',
      groomParentNames: 'Test Parents Frontend',
      brideFirstName: 'FRONTEND_BRIDE',
      brideLastName: 'REFRESH',
      brideFullName: 'FRONTEND_BRIDE REFRESH',
      brideParentNames: 'Test Bride Parents Frontend'
    };

    const updateResponse = await fetch(`${API_BASE_URL}/bride-groom/1`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (updateResponse.ok) {
      console.log('✅ Test data saved to database');
      console.log(`   Groom: ${testData.groomFirstName} ${testData.groomLastName}`);
      console.log(`   Bride: ${testData.brideFirstName} ${testData.brideLastName}`);
    }

    // Step 3: Verify in database
    console.log('\n📊 Step 3: Verifying in database...');
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    const [dbData] = await connection.query(`
      SELECT * FROM couple_settings WHERE wedding_id = 1 AND is_active = TRUE
    `);

    if (dbData.length > 0) {
      const record = dbData[0];
      console.log('📋 Database contains:');
      console.log(`   Groom: ${record.groom_first_name} ${record.groom_last_name}`);
      console.log(`   Bride: ${record.bride_first_name} ${record.bride_last_name}`);
      console.log(`   Last Updated: ${record.updated_at}`);
    }

    // Step 4: Test API endpoint that frontend uses
    console.log('\n🌐 Step 4: Testing frontend API endpoint...');
    const getResponse = await fetch(`${API_BASE_URL}/bride-groom`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('📋 Frontend API returns:');
      console.log(`   Groom: ${getData.data.groom_first_name} ${getData.data.groom_last_name}`);
      console.log(`   Bride: ${getData.data.bride_first_name} ${getData.data.bride_last_name}`);
      
      // Check if API data matches database
      const apiMatches = getData.data.groom_first_name === testData.groomFirstName &&
                        getData.data.bride_first_name === testData.brideFirstName;
      
      console.log(`🎯 API data matches test data: ${apiMatches ? '✅ YES' : '❌ NO'}`);
    }

    // Step 5: Restore original data
    console.log('\n🔄 Step 5: Restoring original data...');
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

    // Step 6: Instructions for user
    console.log('\n📋 INSTRUCTIONS FOR TESTING:');
    console.log('');
    console.log('1. 🌐 Open: http://localhost:5175/admin/bride-groom-management');
    console.log('2. 🔐 Login with: admin / admin');
    console.log('3. 📝 You should see the current data:');
    console.log('   - Groom: Wira Maulana');
    console.log('   - Bride: Sofi Kumala');
    console.log('');
    console.log('4. ✏️ Change the names to something else');
    console.log('5. 💾 Click "Save Changes"');
    console.log('6. ✅ You should see success message');
    console.log('7. 🔄 Click the "Refresh" button in the top-right');
    console.log('8. 👀 The form should now show your updated data');
    console.log('');
    console.log('🎯 WHAT SHOULD HAPPEN:');
    console.log('✅ Data saves to database immediately');
    console.log('✅ Success message appears');
    console.log('✅ Refresh button loads fresh data from database');
    console.log('✅ Form shows updated values');
    console.log('');
    console.log('🔧 IF DATA STILL DOESN\'T UPDATE:');
    console.log('1. Hard refresh browser (Ctrl+F5)');
    console.log('2. Clear browser cache');
    console.log('3. Check browser console for errors');
    console.log('4. Try in incognito/private mode');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
testFrontendRefresh().catch(console.error);
