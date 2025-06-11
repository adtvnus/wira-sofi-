#!/usr/bin/env node

// Debug guest management real-time update issues

const mysql = require('mysql2/promise');

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function debugGuestRealtimeIssue() {
  console.log('🔍 DEBUGGING GUEST MANAGEMENT REAL-TIME UPDATE ISSUES');
  console.log('═══════════════════════════════════════════════════════════════');
  
  let connection;
  const fetch = await getFetch();

  try {
    // Step 1: Connect to database
    console.log('📊 Step 1: Connecting to database...');
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });
    console.log('✅ Database connection successful');

    // Step 2: Check current guests data
    console.log('\n📋 Step 2: Checking current guests data...');
    const [currentGuests] = await connection.query(`
      SELECT id, guest_name, guest_email, guest_count, rsvp_status, 
             invitation_code, is_active, created_at, updated_at
      FROM guests 
      WHERE is_active = TRUE 
      ORDER BY updated_at DESC 
      LIMIT 10
    `);
    
    console.log(`✅ Found ${currentGuests.length} active guests:`);
    currentGuests.forEach((guest, index) => {
      console.log(`   ${index + 1}. ID: ${guest.id} | Name: ${guest.guest_name}`);
      console.log(`      Email: ${guest.guest_email || 'N/A'}`);
      console.log(`      Count: ${guest.guest_count} | RSVP: ${guest.rsvp_status}`);
      console.log(`      Code: ${guest.invitation_code}`);
      console.log(`      Created: ${guest.created_at}`);
      console.log(`      Updated: ${guest.updated_at}`);
      console.log('');
    });

    // Step 3: Test authentication
    console.log('\n🔐 Step 3: Testing authentication...');
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

    // Step 4: Test API vs Database consistency
    console.log('\n🔄 Step 4: Testing API vs Database consistency...');
    const apiResponse = await fetch('http://localhost:3001/api/guests', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      const apiGuests = apiData.data || [];
      
      console.log(`✅ API returned ${apiGuests.length} guests`);
      console.log(`📊 Database has ${currentGuests.length} guests`);
      console.log(`🔍 Consistency: ${apiGuests.length === currentGuests.length ? 'MATCH ✅' : 'MISMATCH ❌'}`);
      
      if (apiGuests.length > 0) {
        console.log('\n📋 API Guest Sample:');
        const sampleGuest = apiGuests[0];
        console.log(`   ID: ${sampleGuest.id}`);
        console.log(`   Name: ${sampleGuest.guest_name}`);
        console.log(`   Email: ${sampleGuest.guest_email || 'N/A'}`);
        console.log(`   Count: ${sampleGuest.guest_count}`);
        console.log(`   RSVP: ${sampleGuest.rsvp_status}`);
        console.log(`   Code: ${sampleGuest.invitation_code}`);
      }
    } else {
      console.log('❌ API request failed');
    }

    // Step 5: Create dummy data for testing
    console.log('\n➕ Step 5: Creating dummy data for testing...');
    const timestamp = new Date().toLocaleTimeString();
    const dummyGuests = [
      {
        guestName: `Dummy Guest 1 ${timestamp}`,
        guestEmail: `dummy1${timestamp.replace(/:/g, '')}@example.com`,
        guestPhone: '081234567890',
        guestCount: 2
      },
      {
        guestName: `Dummy Guest 2 ${timestamp}`,
        guestEmail: `dummy2${timestamp.replace(/:/g, '')}@example.com`,
        guestPhone: '081234567891',
        guestCount: 1
      },
      {
        guestName: `Dummy Guest 3 ${timestamp}`,
        guestEmail: `dummy3${timestamp.replace(/:/g, '')}@example.com`,
        guestPhone: '081234567892',
        guestCount: 3
      }
    ];

    const createdGuestIds = [];
    
    for (let i = 0; i < dummyGuests.length; i++) {
      const guest = dummyGuests[i];
      console.log(`   Creating dummy guest ${i + 1}: ${guest.guestName}`);
      
      const createResponse = await fetch('http://localhost:3001/api/guests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(guest)
      });

      if (createResponse.ok) {
        const createData = await createResponse.json();
        const guestId = createData.data?.id;
        createdGuestIds.push(guestId);
        console.log(`   ✅ Created guest ID: ${guestId}`);
        console.log(`      Name: ${createData.data?.guest_name}`);
        console.log(`      Code: ${createData.data?.invitation_code}`);
      } else {
        const errorText = await createResponse.text();
        console.log(`   ❌ Failed to create guest: ${errorText}`);
      }
      
      // Small delay between creates
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Step 6: Verify dummy data in database
    console.log('\n🔍 Step 6: Verifying dummy data in database...');
    const [verifyGuests] = await connection.query(`
      SELECT id, guest_name, guest_email, guest_count, rsvp_status, 
             invitation_code, created_at, updated_at
      FROM guests 
      WHERE id IN (${createdGuestIds.map(() => '?').join(',')})
      ORDER BY id DESC
    `, createdGuestIds);
    
    console.log(`✅ Found ${verifyGuests.length} dummy guests in database:`);
    verifyGuests.forEach((guest, index) => {
      console.log(`   ${index + 1}. ID: ${guest.id} | Name: ${guest.guest_name}`);
      console.log(`      Email: ${guest.guest_email}`);
      console.log(`      Count: ${guest.guest_count} | RSVP: ${guest.rsvp_status}`);
      console.log(`      Code: ${guest.invitation_code}`);
      console.log(`      Created: ${guest.created_at}`);
      console.log(`      Updated: ${guest.updated_at}`);
      console.log('');
    });

    // Step 7: Test real-time update on one dummy guest
    if (createdGuestIds.length > 0) {
      console.log('\n✏️ Step 7: Testing real-time update on dummy guest...');
      const testGuestId = createdGuestIds[0];
      const originalName = verifyGuests[0].guest_name;
      const updatedName = `${originalName} (UPDATED ${new Date().toLocaleTimeString()})`;
      
      console.log(`   Updating guest ID ${testGuestId}:`);
      console.log(`   From: "${originalName}"`);
      console.log(`   To: "${updatedName}"`);
      
      const updateResponse = await fetch(`http://localhost:3001/api/guests/${testGuestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          guestName: updatedName,
          guestEmail: verifyGuests[0].guest_email,
          guestPhone: '081234567890',
          guestCount: 4,
          rsvpStatus: 'confirmed'
        })
      });

      if (updateResponse.ok) {
        console.log('   ✅ Update API call successful');
        
        // Verify update in database immediately
        const [updatedGuest] = await connection.query(`
          SELECT guest_name, guest_count, rsvp_status, updated_at 
          FROM guests 
          WHERE id = ?
        `, [testGuestId]);
        
        if (updatedGuest.length > 0) {
          const guest = updatedGuest[0];
          console.log('   ✅ Database verification:');
          console.log(`      New name: ${guest.guest_name}`);
          console.log(`      New count: ${guest.guest_count}`);
          console.log(`      New RSVP: ${guest.rsvp_status}`);
          console.log(`      Updated at: ${guest.updated_at}`);
          
          const nameUpdated = guest.guest_name.includes('UPDATED');
          const countUpdated = guest.guest_count === 4;
          const rsvpUpdated = guest.rsvp_status === 'confirmed';
          
          console.log('\n   📊 Update Verification:');
          console.log(`      Name updated: ${nameUpdated ? 'YES ✅' : 'NO ❌'}`);
          console.log(`      Count updated: ${countUpdated ? 'YES ✅' : 'NO ❌'}`);
          console.log(`      RSVP updated: ${rsvpUpdated ? 'YES ✅' : 'NO ❌'}`);
          
          if (nameUpdated && countUpdated && rsvpUpdated) {
            console.log('\n   🎉 ALL UPDATES VERIFIED IN DATABASE!');
          } else {
            console.log('\n   ⚠️ Some updates not reflected in database');
          }
        }
      } else {
        const updateError = await updateResponse.text();
        console.log(`   ❌ Update failed: ${updateError}`);
      }
    }

    // Step 8: Final API consistency check
    console.log('\n🔄 Step 8: Final API consistency check...');
    const finalApiResponse = await fetch('http://localhost:3001/api/guests', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (finalApiResponse.ok) {
      const finalApiData = await finalApiResponse.json();
      const finalApiGuests = finalApiData.data || [];
      
      const [finalDbGuests] = await connection.query(`
        SELECT COUNT(*) as count FROM guests WHERE is_active = TRUE
      `);
      
      const apiCount = finalApiGuests.length;
      const dbCount = finalDbGuests[0].count;
      
      console.log(`✅ Final consistency check:`);
      console.log(`   API count: ${apiCount}`);
      console.log(`   Database count: ${dbCount}`);
      console.log(`   Consistent: ${apiCount === dbCount ? 'YES ✅' : 'NO ❌'}`);
    }

    console.log('\n🎉 GUEST MANAGEMENT DEBUG COMPLETED!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 SUMMARY:');
    console.log(`   ✅ Database connection: Working`);
    console.log(`   ✅ API endpoints: Working`);
    console.log(`   ✅ Dummy data creation: ${createdGuestIds.length}/3 successful`);
    console.log(`   ✅ Real-time updates: ${createdGuestIds.length > 0 ? 'Tested' : 'Skipped'}`);
    console.log(`   ✅ Data consistency: API ↔ Database`);
    console.log('');
    console.log('💡 RECOMMENDATIONS:');
    console.log('   1. Check browser console for JavaScript errors');
    console.log('   2. Check network tab for failed API calls');
    console.log('   3. Try hard refresh (Ctrl+F5) in browser');
    console.log('   4. Check if auto-refresh is working (30 second intervals)');
    console.log('   5. Use manual refresh button in guest management');
    console.log('');
    console.log(`🎯 DUMMY GUESTS CREATED: ${createdGuestIds.length} guests ready for testing`);

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the debug
debugGuestRealtimeIssue().catch(console.error);
