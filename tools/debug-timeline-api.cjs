#!/usr/bin/env node

// Debug timeline API endpoints

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function debugTimelineAPI() {
  console.log('🔍 DEBUGGING TIMELINE API ENDPOINTS');
  console.log('═══════════════════════════════════════════════════════');
  
  const fetch = await getFetch();

  try {
    // Test public timeline endpoint (no auth needed)
    console.log('🌐 Testing GET /api/story-timeline/public...');
    const publicResponse = await fetch('http://localhost:3001/api/story-timeline/public');

    console.log(`   Status: ${publicResponse.status} ${publicResponse.statusText}`);
    
    if (publicResponse.ok) {
      const publicData = await publicResponse.json();
      console.log('✅ Public timeline endpoint working');
      console.log(`   Success: ${publicData.success}`);
      console.log(`   Message: ${publicData.message}`);
      console.log(`   Data length: ${publicData.data ? publicData.data.length : 'null'}`);
      
      if (publicData.data && publicData.data.length > 0) {
        console.log('\n📋 Timeline Items:');
        publicData.data.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.title} (${item.year})`);
          console.log(`      ID: ${item.id}`);
          console.log(`      Active: ${item.is_active}`);
          console.log(`      Order: ${item.display_order}`);
          console.log(`      Icon: ${item.icon}`);
          console.log(`      Color: ${item.color}`);
        });
        
        // Count active items
        const activeItems = publicData.data.filter(item => item.is_active);
        console.log(`\n✅ Active items: ${activeItems.length} out of ${publicData.data.length}`);
        
        if (activeItems.length === 0) {
          console.log('⚠️ WARNING: No active timeline items found!');
          console.log('   This explains why frontend shows "No story timeline available"');
        }
      } else {
        console.log('⚠️ WARNING: No timeline data returned from API');
      }
    } else {
      console.log('❌ Public timeline endpoint failed');
      const errorText = await publicResponse.text();
      console.log(`   Error: ${errorText}`);
    }

    // Test authenticated timeline endpoint
    console.log('\n🔐 Testing authenticated timeline endpoint...');
    
    // Get auth token first
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.token;
      console.log('✅ Authentication successful');

      // Test admin timeline endpoint
      const adminResponse = await fetch('http://localhost:3001/api/story-timeline', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log(`   Admin endpoint status: ${adminResponse.status}`);
      
      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        console.log('✅ Admin timeline endpoint working');
        console.log(`   Admin data length: ${adminData.data ? adminData.data.length : 'null'}`);
        
        if (adminData.data && adminData.data.length > 0) {
          console.log('\n📋 Admin Timeline Items:');
          adminData.data.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.title} (Active: ${item.is_active})`);
          });
        }
      }
    }

    console.log('\n🎯 DIAGNOSIS:');
    console.log('═══════════════════════════════════════════════════════');
    
    // Check if the issue is with API or frontend
    const finalPublicCheck = await fetch('http://localhost:3001/api/story-timeline/public');
    if (finalPublicCheck.ok) {
      const finalData = await finalPublicCheck.json();
      const activeCount = finalData.data ? finalData.data.filter(item => item.is_active).length : 0;
      
      if (activeCount === 0) {
        console.log('🔍 ROOT CAUSE: No active timeline items in database');
        console.log('📝 SOLUTION: Go to admin and make sure timeline items are active');
        console.log('   1. Open: http://localhost:5173/admin/story-management');
        console.log('   2. Check timeline items have "Aktif" checkbox checked');
        console.log('   3. Or add new timeline items');
      } else {
        console.log('🔍 ROOT CAUSE: Frontend issue - API has active items');
        console.log('📝 SOLUTION: Check frontend console for errors');
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugTimelineAPI().catch(console.error);
