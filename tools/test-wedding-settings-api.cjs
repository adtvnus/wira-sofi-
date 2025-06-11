#!/usr/bin/env node

// Test wedding settings API after fixing bride/groom data

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function testWeddingSettingsAPI() {
  console.log('🧪 TESTING WEDDING SETTINGS API AFTER BRIDE/GROOM FIX');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const fetch = await getFetch();

  try {
    // Test wedding settings API
    console.log('📡 Testing /api/wedding-settings...');
    const response = await fetch('http://localhost:3001/api/wedding-settings');
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Wedding settings API response:');
      console.log(`   Success: ${data.success}`);
      
      if (data.data) {
        const settings = data.data;
        console.log('\n📊 Wedding Settings Data:');
        console.log(`   ID: ${settings.id}`);
        console.log(`   Wedding Date: ${settings.wedding_date}`);
        console.log(`   Wedding Venue: ${settings.wedding_venue}`);
        console.log(`   Is Active: ${settings.is_active}`);
        
        console.log('\n👰 Bride Data:');
        console.log(`   First Name: "${settings.bride_first_name}"`);
        console.log(`   Last Name: "${settings.bride_last_name}"`);
        console.log(`   Full Name: "${settings.bride_full_name}"`);
        console.log(`   Parents: "${settings.bride_parent_names}"`);
        
        console.log('\n🤵 Groom Data:');
        console.log(`   First Name: "${settings.groom_first_name}"`);
        console.log(`   Last Name: "${settings.groom_last_name}"`);
        console.log(`   Full Name: "${settings.groom_full_name}"`);
        console.log(`   Parents: "${settings.groom_parent_names}"`);
        
        console.log('\n🎯 Frontend Mapping Check:');
        const brideFirstOk = settings.bride_first_name && settings.bride_first_name !== 'Pengantin Wanita';
        const groomFirstOk = settings.groom_first_name && settings.groom_first_name !== 'Pengantin Pria';
        
        console.log(`   ✅ Bride First Name: ${brideFirstOk ? 'HAS DATA' : 'DEFAULT/EMPTY'}`);
        console.log(`   ✅ Groom First Name: ${groomFirstOk ? 'HAS DATA' : 'DEFAULT/EMPTY'}`);
        
        if (brideFirstOk && groomFirstOk) {
          console.log('\n🎉 SUCCESS: Bride & Groom names are available!');
          console.log('');
          console.log('📱 Frontend should now show:');
          console.log(`   - Bride: ${settings.bride_first_name}`);
          console.log(`   - Groom: ${settings.groom_first_name}`);
          console.log('');
          console.log('💡 If names still not showing in frontend:');
          console.log('   1. Hard refresh browser (Ctrl+F5)');
          console.log('   2. Check WeddingContext loading');
          console.log('   3. Check browser console for errors');
        } else {
          console.log('\n⚠️ Names are still default values');
          console.log('   Check bride_groom table data');
        }
      } else {
        console.log('❌ No data in response');
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ API failed: ${errorText}`);
    }

    console.log('\n🎉 WEDDING SETTINGS API TEST COMPLETED!');
    console.log('═══════════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testWeddingSettingsAPI().catch(console.error);
