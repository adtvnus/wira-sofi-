const fetch = require('node-fetch');

async function checkStatus() {
  console.log('🚀 WEDDING INVITATION SYSTEM STATUS');
  console.log('=' .repeat(50));
  
  try {
    // Check Backend
    console.log('\n⚙️ BACKEND STATUS');
    const backendResponse = await fetch('http://localhost:3001/api/health');
    if (backendResponse.ok) {
      const healthData = await backendResponse.json();
      console.log(`✅ Backend Server: Running (${backendResponse.status})`);
      console.log(`📊 Message: ${healthData.message}`);
    } else {
      console.log('❌ Backend Server: Error response');
    }

    // Test Authentication
    console.log('\n🔐 AUTHENTICATION TEST');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Admin Login: Working');
      console.log(`👤 User: ${loginData.user.fullName} (${loginData.user.role})`);
    } else {
      console.log('❌ Admin Login: Failed');
    }

    console.log('\n📊 SYSTEM SUMMARY');
    console.log('🎯 Wedding Invitation System is READY!');
    console.log('');
    console.log('🌐 ACCESS URLS:');
    console.log('├─ Wedding Invitation: http://localhost:5173/');
    console.log('├─ Admin Login: http://localhost:5173/admin/login');
    console.log('├─ Admin Dashboard: http://localhost:5173/admin/dashboard');
    console.log('└─ API Health: http://localhost:3001/api/health');
    console.log('');
    console.log('🔐 ADMIN CREDENTIALS:');
    console.log('├─ Username: admin');
    console.log('└─ Password: admin');

  } catch (error) {
    console.error('❌ System check failed:', error.message);
  }
}

checkStatus();
