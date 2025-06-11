#!/usr/bin/env node

// Deep debug guest management real-time issues

const mysql = require('mysql2/promise');

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function deepDebugGuestRealtime() {
  console.log('🔍 DEEP DEBUG: GUEST MANAGEMENT REAL-TIME ISSUES');
  console.log('═══════════════════════════════════════════════════════════════');
  
  let connection;
  const fetch = await getFetch();

  try {
    // Step 1: Connect to database and check current state
    console.log('📊 Step 1: Checking current database state...');
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    // Get current guest count and latest guests
    const [currentGuests] = await connection.query(`
      SELECT id, guest_name, guest_email, guest_count, rsvp_status, 
             invitation_code, is_active, created_at, updated_at
      FROM guests 
      WHERE is_active = TRUE 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log(`✅ Current database state:`);
    console.log(`   Total active guests: ${currentGuests.length}`);
    console.log(`   Latest guests:`);
    currentGuests.forEach((guest, index) => {
      console.log(`   ${index + 1}. ID: ${guest.id} | Name: ${guest.guest_name}`);
      console.log(`      Created: ${guest.created_at}`);
      console.log(`      Updated: ${guest.updated_at}`);
    });

    // Step 2: Test authentication
    console.log('\n🔐 Step 2: Testing authentication...');
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

    // Step 3: Test API GET endpoint
    console.log('\n📡 Step 3: Testing API GET endpoint...');
    const getResponse = await fetch('http://localhost:3001/api/guests', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`   GET /api/guests status: ${getResponse.status}`);
    
    if (getResponse.ok) {
      const getData = await getResponse.json();
      const apiGuests = getData.data || [];
      console.log(`   ✅ API returned ${apiGuests.length} guests`);
      
      if (apiGuests.length > 0) {
        console.log(`   Latest API guest: ${apiGuests[0].guest_name} (ID: ${apiGuests[0].id})`);
      }
    } else {
      const errorText = await getResponse.text();
      console.log(`   ❌ API GET failed: ${errorText}`);
      return;
    }

    // Step 4: Monitor database in real-time while adding guest
    console.log('\n➕ Step 4: Real-time monitoring while adding guest...');
    
    // Get initial count
    const [initialCount] = await connection.query(`
      SELECT COUNT(*) as count FROM guests WHERE is_active = TRUE
    `);
    const startCount = initialCount[0].count;
    console.log(`   Initial database count: ${startCount}`);

    // Create test guest
    const timestamp = Date.now();
    const testGuest = {
      guestName: `Deep Test Guest ${timestamp}`,
      guestEmail: `deeptest${timestamp}@example.com`,
      guestPhone: '081234567890',
      guestCount: 1
    };

    console.log(`   Creating guest: "${testGuest.guestName}"`);
    console.log(`   Timestamp: ${timestamp}`);

    // Add guest via API
    const addResponse = await fetch('http://localhost:3001/api/guests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testGuest)
    });

    console.log(`   POST /api/guests status: ${addResponse.status}`);
    
    let newGuestId = null;
    if (addResponse.ok) {
      const addData = await addResponse.json();
      newGuestId = addData.data?.id;
      console.log(`   ✅ API response successful`);
      console.log(`   New guest ID: ${newGuestId}`);
      console.log(`   Response data: ${JSON.stringify(addData.data, null, 2)}`);
    } else {
      const errorText = await addResponse.text();
      console.log(`   ❌ API POST failed: ${errorText}`);
      return;
    }

    // Immediate database check
    console.log('\n🔍 Step 5: Immediate database verification...');
    const [immediateCount] = await connection.query(`
      SELECT COUNT(*) as count FROM guests WHERE is_active = TRUE
    `);
    const afterCount = immediateCount[0].count;
    console.log(`   Database count after add: ${afterCount}`);
    console.log(`   Count increased: ${afterCount > startCount ? 'YES ✅' : 'NO ❌'}`);

    if (newGuestId) {
      const [newGuestCheck] = await connection.query(`
        SELECT * FROM guests WHERE id = ?
      `, [newGuestId]);
      
      if (newGuestCheck.length > 0) {
        const guest = newGuestCheck[0];
        console.log(`   ✅ New guest found in database:`);
        console.log(`      ID: ${guest.id}`);
        console.log(`      Name: ${guest.guest_name}`);
        console.log(`      Email: ${guest.guest_email}`);
        console.log(`      Phone: ${guest.guest_phone}`);
        console.log(`      Count: ${guest.guest_count}`);
        console.log(`      RSVP: ${guest.rsvp_status}`);
        console.log(`      Code: ${guest.invitation_code}`);
        console.log(`      Active: ${guest.is_active}`);
        console.log(`      Created: ${guest.created_at}`);
        console.log(`      Updated: ${guest.updated_at}`);
      } else {
        console.log(`   ❌ New guest NOT found in database`);
      }
    }

    // Step 6: Test API GET again to see if new guest appears
    console.log('\n📡 Step 6: Testing API GET after add...');
    const getAfterResponse = await fetch('http://localhost:3001/api/guests', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (getAfterResponse.ok) {
      const getAfterData = await getAfterResponse.json();
      const apiGuestsAfter = getAfterData.data || [];
      console.log(`   API count after add: ${apiGuestsAfter.length}`);
      
      const foundInApi = apiGuestsAfter.find(g => g.id === newGuestId);
      console.log(`   New guest in API: ${foundInApi ? 'YES ✅' : 'NO ❌'}`);
      
      if (foundInApi) {
        console.log(`   API guest data: ${JSON.stringify(foundInApi, null, 2)}`);
      }
    }

    // Step 7: Test multiple rapid adds to see pattern
    console.log('\n⚡ Step 7: Testing multiple rapid adds...');
    const rapidIds = [];
    
    for (let i = 1; i <= 3; i++) {
      console.log(`   Rapid add ${i}/3...`);
      
      const rapidGuest = {
        guestName: `Rapid Test ${i} ${timestamp}`,
        guestEmail: `rapid${i}${timestamp}@example.com`,
        guestPhone: '081234567890',
        guestCount: 1
      };
      
      const rapidResponse = await fetch('http://localhost:3001/api/guests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rapidGuest)
      });

      if (rapidResponse.ok) {
        const rapidData = await rapidResponse.json();
        const rapidId = rapidData.data?.id;
        rapidIds.push(rapidId);
        console.log(`   ✅ Rapid add ${i} successful: ID ${rapidId}`);
        
        // Immediate database check
        const [rapidCheck] = await connection.query(`
          SELECT COUNT(*) as count FROM guests WHERE is_active = TRUE
        `);
        console.log(`   Database count: ${rapidCheck[0].count}`);
      } else {
        console.log(`   ❌ Rapid add ${i} failed`);
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Step 8: Final comprehensive check
    console.log('\n🔍 Step 8: Final comprehensive check...');
    
    // Database count
    const [finalDbCount] = await connection.query(`
      SELECT COUNT(*) as count FROM guests WHERE is_active = TRUE
    `);
    
    // API count
    const finalApiResponse = await fetch('http://localhost:3001/api/guests', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    let finalApiCount = 0;
    if (finalApiResponse.ok) {
      const finalApiData = await finalApiResponse.json();
      finalApiCount = finalApiData.data ? finalApiData.data.length : 0;
    }
    
    console.log(`   Final database count: ${finalDbCount[0].count}`);
    console.log(`   Final API count: ${finalApiCount}`);
    console.log(`   Consistency: ${finalDbCount[0].count === finalApiCount ? 'YES ✅' : 'NO ❌'}`);
    console.log(`   Total added: ${finalDbCount[0].count - startCount}`);

    // Step 9: Check recent database activity
    console.log('\n📊 Step 9: Checking recent database activity...');
    const [recentGuests] = await connection.query(`
      SELECT id, guest_name, created_at, updated_at
      FROM guests 
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      ORDER BY created_at DESC
    `);
    
    console.log(`   Recent guests (last 5 minutes): ${recentGuests.length}`);
    recentGuests.forEach((guest, index) => {
      console.log(`   ${index + 1}. ID: ${guest.id} | Name: ${guest.guest_name}`);
      console.log(`      Created: ${guest.created_at}`);
    });

    // Step 10: Clean up test guests
    console.log('\n🗑️ Step 10: Cleaning up test guests...');
    const allTestIds = [newGuestId, ...rapidIds].filter(id => id);
    
    for (const guestId of allTestIds) {
      const deleteResponse = await fetch(`http://localhost:3001/api/guests/${guestId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (deleteResponse.ok) {
        console.log(`   ✅ Deleted test guest ID: ${guestId}`);
      } else {
        console.log(`   ❌ Failed to delete test guest ID: ${guestId}`);
      }
    }

    console.log('\n🎉 DEEP DEBUG COMPLETED!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 DIAGNOSIS SUMMARY:');
    console.log(`   ✅ Database operations: ${afterCount > startCount ? 'WORKING' : 'ISSUE FOUND'}`);
    console.log(`   ✅ API operations: ${finalApiCount > 0 ? 'WORKING' : 'ISSUE FOUND'}`);
    console.log(`   ✅ Data consistency: ${finalDbCount[0].count === finalApiCount ? 'CONSISTENT' : 'INCONSISTENT'}`);
    console.log(`   ✅ Real-time updates: ${recentGuests.length > 0 ? 'WORKING' : 'NOT WORKING'}`);
    console.log('');
    
    if (afterCount > startCount && finalApiCount > 0) {
      console.log('🎯 CONCLUSION: Backend is working correctly');
      console.log('   Issue is likely in frontend/browser layer');
      console.log('');
      console.log('💡 FRONTEND TROUBLESHOOTING:');
      console.log('   1. Hard refresh browser (Ctrl+F5)');
      console.log('   2. Check browser console for errors');
      console.log('   3. Check network tab for failed requests');
      console.log('   4. Try incognito mode');
      console.log('   5. Clear browser cache completely');
    } else {
      console.log('🎯 CONCLUSION: Backend issue found');
      console.log('   Need to investigate API or database layer');
    }

  } catch (error) {
    console.error('❌ Deep debug failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the deep debug
deepDebugGuestRealtime().catch(console.error);
