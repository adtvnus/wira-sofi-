const fetch = require('node-fetch');

async function testLogin() {
  console.log('🔐 SIMPLE LOGIN TEST');
  
  try {
    console.log('📤 Sending login request...');
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin'
      })
    });

    console.log(`📊 Response status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    console.log('📥 Response data:', JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('✅ Login successful!');
      console.log(`🔑 Token: ${data.token.substring(0, 20)}...`);
      console.log(`👤 User: ${data.user.fullName} (${data.user.role})`);
    } else {
      console.log('❌ Login failed!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();
