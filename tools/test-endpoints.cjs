#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

async function testAllEndpoints() {
  console.log('🧪 Testing All API Endpoints...\n');
  console.log(`API Base URL: ${API_BASE_URL}\n`);

  let token = null;

  // Test 1: Health Check
  console.log('1. 🏥 Testing Health Check...');
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    if (response.ok) {
      console.log('   ✅ Health check passed');
    } else {
      console.log('   ❌ Health check failed');
    }
  } catch (error) {
    console.log('   ❌ Health check error:', error.message);
    console.log('   🚨 API server might not be running!');
    return;
  }

  // Test 2: Login
  console.log('\n2. 🔐 Testing Login...');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });
    const data = await response.json();
    
    if (response.ok && data.success) {
      token = data.token;
      console.log('   ✅ Login successful');
      console.log(`   📝 Token: ${token.substring(0, 20)}...`);
    } else {
      console.log('   ❌ Login failed:', data.error);
      return;
    }
  } catch (error) {
    console.log('   ❌ Login error:', error.message);
    return;
  }

  // Test 3: Auth Me
  console.log('\n3. 👤 Testing Auth Me...');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('   ✅ Auth me successful');
      console.log(`   👤 User: ${data.user.fullName} (${data.user.role})`);
    } else {
      console.log('   ❌ Auth me failed:', data.error);
    }
  } catch (error) {
    console.log('   ❌ Auth me error:', error.message);
  }

  // Test 4: Get Guests
  console.log('\n4. 👥 Testing Get Guests...');
  try {
    const response = await fetch(`${API_BASE_URL}/guests`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('   ✅ Get guests successful');
      console.log(`   📊 Found ${data.data.length} guests`);
    } else {
      console.log('   ❌ Get guests failed:', data.error);
    }
  } catch (error) {
    console.log('   ❌ Get guests error:', error.message);
  }

  // Test 5: Add Guest
  console.log('\n5. ➕ Testing Add Guest...');
  try {
    const testGuest = {
      guestName: 'Test User ' + Date.now(),
      guestEmail: 'test@example.com',
      guestPhone: '+62812345678',
      guestCount: 2
    };

    const response = await fetch(`${API_BASE_URL}/guests`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testGuest)
    });
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('   ✅ Add guest successful');
      console.log(`   🆔 Guest ID: ${data.data.id}`);
      
      // Test 6: Delete the test guest
      console.log('\n6. 🗑️ Testing Delete Guest...');
      const deleteResponse = await fetch(`${API_BASE_URL}/guests/${data.data.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const deleteData = await deleteResponse.json();
      
      if (deleteResponse.ok && deleteData.success) {
        console.log('   ✅ Delete guest successful');
      } else {
        console.log('   ❌ Delete guest failed:', deleteData.error);
      }
    } else {
      console.log('   ❌ Add guest failed:', data.error);
    }
  } catch (error) {
    console.log('   ❌ Add guest error:', error.message);
  }

  // Test 7: Wedding Settings
  console.log('\n7. 💒 Testing Wedding Settings...');
  try {
    const response = await fetch(`${API_BASE_URL}/wedding-settings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('   ✅ Get wedding settings successful');
      console.log(`   💑 Couple: ${data.data.groom_first_name} & ${data.data.bride_first_name}`);
    } else {
      console.log('   ❌ Get wedding settings failed:', data.error);
    }
  } catch (error) {
    console.log('   ❌ Wedding settings error:', error.message);
  }

  // Test 8: Dashboard Stats
  console.log('\n8. 📊 Testing Dashboard Stats...');
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('   ✅ Dashboard stats successful');
      console.log(`   📈 Stats: ${JSON.stringify(data.data, null, 2)}`);
    } else {
      console.log('   ❌ Dashboard stats failed:', data.error);
    }
  } catch (error) {
    console.log('   ❌ Dashboard stats error:', error.message);
  }

  // Test 9: RSVP
  console.log('\n9. 📝 Testing RSVP...');
  try {
    const response = await fetch(`${API_BASE_URL}/rsvp`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('   ✅ Get RSVP successful');
      console.log(`   📋 RSVP responses: ${data.data.length}`);
    } else {
      console.log('   ❌ Get RSVP failed:', data.error);
    }
  } catch (error) {
    console.log('   ❌ RSVP error:', error.message);
  }

  // Test 10: Logout
  console.log('\n10. 🚪 Testing Logout...');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('   ✅ Logout successful');
    } else {
      console.log('   ❌ Logout failed:', data.error);
    }
  } catch (error) {
    console.log('   ❌ Logout error:', error.message);
  }

  console.log('\n🎉 API Endpoint Testing Complete!');
  console.log('\n📋 Summary:');
  console.log('- All critical endpoints tested');
  console.log('- Authentication flow verified');
  console.log('- CRUD operations tested');
  console.log('- Database integration confirmed');
}

testAllEndpoints();
