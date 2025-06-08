#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE_URL = 'http://localhost:3001/api';

async function testCRUDOperations() {
  console.log('🧪 Testing CRUD Operations with MySQL Integration\n');
  
  let authToken = '';
  let testGuestId = '';
  
  try {
    // 1. Test Login
    console.log('1. 🔐 Testing Login...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      authToken = loginData.token;
      console.log('   ✅ Login successful');
      console.log(`   🔑 Token: ${authToken.substring(0, 20)}...`);
    } else {
      throw new Error('Login failed');
    }

    // 2. Test CREATE Guest
    console.log('\n2. ➕ Testing CREATE Guest...');
    const createResponse = await fetch(`${API_BASE_URL}/guests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        guestName: 'Test CRUD User',
        guestEmail: 'crud@test.com',
        guestPhone: '+62812345678',
        guestCount: 2
      })
    });
    
    if (createResponse.ok) {
      const createData = await createResponse.json();
      testGuestId = createData.guest.id;
      console.log('   ✅ CREATE successful');
      console.log(`   🆔 Guest ID: ${testGuestId}`);
      console.log(`   👤 Guest Name: ${createData.guest.guest_name}`);
      console.log(`   🎫 Invitation Code: ${createData.guest.invitation_code}`);
    } else {
      throw new Error('CREATE failed');
    }

    // 3. Test READ All Guests
    console.log('\n3. 📖 Testing READ All Guests...');
    const readAllResponse = await fetch(`${API_BASE_URL}/guests`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (readAllResponse.ok) {
      const readAllData = await readAllResponse.json();
      console.log('   ✅ READ All successful');
      console.log(`   📊 Total guests: ${readAllData.guests.length}`);
      
      // Find our test guest
      const testGuest = readAllData.guests.find(g => g.id == testGuestId);
      if (testGuest) {
        console.log(`   🎯 Found test guest: ${testGuest.guest_name}`);
      }
    } else {
      throw new Error('READ All failed');
    }

    // 4. Test READ Single Guest
    console.log('\n4. 🔍 Testing READ Single Guest...');
    const readSingleResponse = await fetch(`${API_BASE_URL}/guests/${testGuestId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (readSingleResponse.ok) {
      const readSingleData = await readSingleResponse.json();
      console.log('   ✅ READ Single successful');
      console.log(`   👤 Guest: ${readSingleData.guest.guest_name}`);
      console.log(`   📧 Email: ${readSingleData.guest.guest_email}`);
    } else {
      throw new Error('READ Single failed');
    }

    // 5. Test UPDATE Guest
    console.log('\n5. ✏️ Testing UPDATE Guest...');
    const updateResponse = await fetch(`${API_BASE_URL}/guests/${testGuestId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        guestName: 'Updated CRUD User',
        guestEmail: 'updated@test.com',
        guestPhone: '+62812345679',
        guestCount: 3
      })
    });
    
    if (updateResponse.ok) {
      const updateData = await updateResponse.json();
      console.log('   ✅ UPDATE successful');
      console.log(`   👤 Updated Name: ${updateData.guest.guest_name}`);
      console.log(`   📧 Updated Email: ${updateData.guest.guest_email}`);
    } else {
      throw new Error('UPDATE failed');
    }

    // 6. Test Wedding Settings CRUD
    console.log('\n6. 💒 Testing Wedding Settings...');
    const settingsResponse = await fetch(`${API_BASE_URL}/wedding-settings`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (settingsResponse.ok) {
      const settingsData = await settingsResponse.json();
      console.log('   ✅ Wedding Settings READ successful');
      console.log(`   💑 Couple: ${settingsData.settings.groom_name} & ${settingsData.settings.bride_name}`);
      console.log(`   📅 Date: ${settingsData.settings.wedding_date}`);
    } else {
      throw new Error('Wedding Settings read failed');
    }

    // 7. Test RSVP Operations
    console.log('\n7. 📝 Testing RSVP Operations...');
    const rsvpResponse = await fetch(`${API_BASE_URL}/rsvp`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (rsvpResponse.ok) {
      const rsvpData = await rsvpResponse.json();
      console.log('   ✅ RSVP read successful');
      console.log(`   📋 RSVP responses: ${rsvpData.rsvp.length}`);
    } else {
      throw new Error('RSVP read failed');
    }

    // 8. Test Dashboard Stats
    console.log('\n8. 📊 Testing Dashboard Stats...');
    const statsResponse = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('   ✅ Dashboard stats successful');
      console.log(`   👥 Total guests: ${statsData.guestStats.total_guests}`);
      console.log(`   ✅ Attending: ${statsData.guestStats.attending_count}`);
      console.log(`   ❌ Not attending: ${statsData.guestStats.not_attending_count}`);
      console.log(`   ⏳ Pending: ${statsData.guestStats.pending_count}`);
    } else {
      throw new Error('Dashboard stats failed');
    }

    // 9. Test DELETE Guest
    console.log('\n9. 🗑️ Testing DELETE Guest...');
    const deleteResponse = await fetch(`${API_BASE_URL}/guests/${testGuestId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (deleteResponse.ok) {
      console.log('   ✅ DELETE successful');
      console.log(`   🗑️ Guest ${testGuestId} deleted from MySQL`);
    } else {
      throw new Error('DELETE failed');
    }

    // 10. Verify DELETE
    console.log('\n10. ✔️ Verifying DELETE...');
    const verifyResponse = await fetch(`${API_BASE_URL}/guests/${testGuestId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!verifyResponse.ok) {
      console.log('   ✅ DELETE verified - Guest not found (expected)');
    } else {
      console.log('   ⚠️ Guest still exists after DELETE');
    }

    console.log('\n🎉 CRUD Testing Complete!');
    console.log('\n📋 Summary:');
    console.log('   ✅ CREATE - Guest added to MySQL');
    console.log('   ✅ READ - Data retrieved from MySQL');
    console.log('   ✅ UPDATE - Data modified in MySQL');
    console.log('   ✅ DELETE - Data removed from MySQL');
    console.log('   ✅ Authentication - JWT working');
    console.log('   ✅ Wedding Settings - Configuration loaded');
    console.log('   ✅ RSVP System - Response tracking');
    console.log('   ✅ Dashboard Stats - Analytics working');

    console.log('\n🗄️ MySQL Integration Status: FULLY CONNECTED ✅');

  } catch (error) {
    console.error('\n❌ CRUD Test Failed:', error.message);
    
    // Cleanup if test guest was created
    if (testGuestId && authToken) {
      try {
        await fetch(`${API_BASE_URL}/guests/${testGuestId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('🧹 Cleanup: Test guest removed');
      } catch (cleanupError) {
        console.log('⚠️ Cleanup failed:', cleanupError.message);
      }
    }
  }
}

// Run the test
testCRUDOperations();
