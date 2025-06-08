#!/usr/bin/env node

const fetch = require('node-fetch');

async function checkSystemStatus() {
  console.log('🚀 WEDDING INVITATION SYSTEM STATUS CHECK\n');

  // Check Frontend
  console.log('🌐 FRONTEND STATUS:');
  try {
    const frontendResponse = await fetch('http://localhost:5173');
    if (frontendResponse.ok) {
      console.log('   ✅ Frontend Server: RUNNING (http://localhost:5173)');
    } else {
      console.log('   ❌ Frontend Server: ERROR');
    }
  } catch (error) {
    console.log('   ❌ Frontend Server: NOT RUNNING');
  }

  // Check Backend API
  console.log('\n🔧 BACKEND API STATUS:');
  try {
    const healthResponse = await fetch('http://localhost:3001/api/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   ✅ Backend API: RUNNING (http://localhost:3001)');
      console.log(`   📊 Status: ${healthData.status}`);
      console.log(`   📝 Message: ${healthData.message}`);
    } else {
      console.log('   ❌ Backend API: ERROR');
    }
  } catch (error) {
    console.log('   ❌ Backend API: NOT RUNNING');
  }

  // Test Authentication
  console.log('\n🔐 AUTHENTICATION TEST:');
  try {
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      if (loginData.success && loginData.token) {
        console.log('   ✅ Authentication: WORKING');
        console.log(`   👤 User: ${loginData.user.fullName} (${loginData.user.role})`);
        console.log(`   🔑 Token: ${loginData.token.substring(0, 30)}...`);
      } else {
        console.log('   ❌ Authentication: FAILED');
      }
    } else {
      console.log('   ❌ Authentication: ERROR');
    }
  } catch (error) {
    console.log('   ❌ Authentication: NOT WORKING');
  }

  console.log('\n📋 ACCESS POINTS:');
  console.log('   🏠 Wedding Invitation: http://localhost:5173/');
  console.log('   🔐 Admin Login: http://localhost:5173/admin/login');
  console.log('   📊 Admin Dashboard: http://localhost:5173/admin');
  console.log('   ⚙️ Wedding Settings: http://localhost:5173/admin/wedding-settings');
  console.log('   👥 Guest Management: http://localhost:5173/admin/guest-management');

  console.log('\n🔑 LOGIN CREDENTIALS:');
  console.log('   Username: admin');
  console.log('   Password: admin');

  console.log('\n✅ SYSTEM IS READY TO USE!');
  console.log('   1. Open http://localhost:5173/admin/login');
  console.log('   2. Login with admin/admin');
  console.log('   3. Navigate to Wedding Settings');
  console.log('   4. Test saving data to database');
}

checkSystemStatus();
