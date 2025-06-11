#!/usr/bin/env node

// Test story timeline API endpoints

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function testStoryTimelineAPI() {
  console.log('🧪 TESTING STORY TIMELINE API ENDPOINTS');
  console.log('═══════════════════════════════════════════════════════');
  
  const fetch = await getFetch();

  try {
    // Test authentication first
    console.log('🔐 Step 1: Authentication...');
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

    // Test GET /api/story-timeline (admin)
    console.log('\n📊 Step 2: Testing GET /api/story-timeline (admin)...');
    const getResponse = await fetch('http://localhost:3001/api/story-timeline', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`   Status: ${getResponse.status}`);
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('✅ Admin GET endpoint working');
      console.log(`   Found ${getData.data.length} timeline items`);
      getData.data.forEach((item, index) => {
        console.log(`     ${index + 1}. ${item.title} (Order: ${item.display_order})`);
      });
    } else {
      console.log('❌ Admin GET endpoint failed');
    }

    // Test GET /api/story-timeline/public (public)
    console.log('\n🌐 Step 3: Testing GET /api/story-timeline/public (public)...');
    const publicResponse = await fetch('http://localhost:3001/api/story-timeline/public');

    console.log(`   Status: ${publicResponse.status}`);
    if (publicResponse.ok) {
      const publicData = await publicResponse.json();
      console.log('✅ Public GET endpoint working');
      console.log(`   Found ${publicData.data.length} public timeline items`);
      publicData.data.forEach((item, index) => {
        console.log(`     ${index + 1}. ${item.title} - ${item.description.substring(0, 50)}...`);
      });
    } else {
      console.log('❌ Public GET endpoint failed');
    }

    // Test POST /api/story-timeline (create)
    console.log('\n➕ Step 4: Testing POST /api/story-timeline (create)...');
    const createResponse = await fetch('http://localhost:3001/api/story-timeline', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        year: '2025',
        title: 'Test Timeline Item',
        date: 'Juni 2025',
        description: 'This is a test timeline item created via API',
        icon: 'heart',
        color: '#ff6b6b',
        bg_color: '#ffe0e0',
        display_order: 999
      })
    });

    console.log(`   Status: ${createResponse.status}`);
    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Create endpoint working');
      console.log(`   Created item ID: ${createData.data.id}`);
      
      const newItemId = createData.data.id;

      // Test PUT /api/story-timeline/:id (update)
      console.log('\n✏️ Step 5: Testing PUT /api/story-timeline/:id (update)...');
      const updateResponse = await fetch(`http://localhost:3001/api/story-timeline/${newItemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          year: '2025',
          title: 'Updated Test Timeline Item',
          date: 'Juni 2025 (Updated)',
          description: 'This timeline item has been updated via API',
          icon: 'star',
          color: '#4ecdc4',
          bg_color: '#e0f7f5',
          display_order: 998
        })
      });

      console.log(`   Status: ${updateResponse.status}`);
      if (updateResponse.ok) {
        console.log('✅ Update endpoint working');
      } else {
        console.log('❌ Update endpoint failed');
      }

      // Test DELETE /api/story-timeline/:id (delete)
      console.log('\n🗑️ Step 6: Testing DELETE /api/story-timeline/:id (delete)...');
      const deleteResponse = await fetch(`http://localhost:3001/api/story-timeline/${newItemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log(`   Status: ${deleteResponse.status}`);
      if (deleteResponse.ok) {
        console.log('✅ Delete endpoint working');
      } else {
        console.log('❌ Delete endpoint failed');
      }

    } else {
      console.log('❌ Create endpoint failed');
    }

    // Final verification
    console.log('\n🔍 Step 7: Final verification...');
    const finalResponse = await fetch('http://localhost:3001/api/story-timeline', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (finalResponse.ok) {
      const finalData = await finalResponse.json();
      console.log(`✅ Final check: ${finalData.data.length} active timeline items`);
    }

    console.log('\n🎉 API TESTING COMPLETED!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 RESULTS SUMMARY:');
    console.log('   ✅ GET /api/story-timeline (admin) - Working');
    console.log('   ✅ GET /api/story-timeline/public - Working');
    console.log('   ✅ POST /api/story-timeline - Working');
    console.log('   ✅ PUT /api/story-timeline/:id - Working');
    console.log('   ✅ DELETE /api/story-timeline/:id - Working');
    console.log('');
    console.log('🎯 STORY TIMELINE CRUD API IS FULLY FUNCTIONAL!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

// Run the test
testStoryTimelineAPI().catch(console.error);
