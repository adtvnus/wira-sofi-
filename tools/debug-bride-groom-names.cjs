#!/usr/bin/env node

// Debug bride and groom names not showing in frontend

const mysql = require('mysql2/promise');

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function debugBrideGroomNames() {
  console.log('🔍 DEBUGGING BRIDE & GROOM NAMES NOT SHOWING IN FRONTEND');
  console.log('═══════════════════════════════════════════════════════════════');
  
  let connection;
  const fetch = await getFetch();

  try {
    // Step 1: Check database for bride/groom data
    console.log('📊 Step 1: Checking database for bride/groom data...');
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    // Check wedding_settings table
    const [weddingSettings] = await connection.query(`
      SELECT id, bride_first_name, bride_full_name, bride_parents,
             groom_first_name, groom_full_name, groom_parents,
             wedding_date, wedding_venue, is_active, created_at, updated_at
      FROM wedding_settings 
      WHERE is_active = TRUE
      ORDER BY updated_at DESC
      LIMIT 1
    `);

    if (weddingSettings.length > 0) {
      const settings = weddingSettings[0];
      console.log('✅ Found active wedding settings in database:');
      console.log(`   ID: ${settings.id}`);
      console.log(`   Bride First Name: "${settings.bride_first_name || 'NULL'}"`);
      console.log(`   Bride Full Name: "${settings.bride_full_name || 'NULL'}"`);
      console.log(`   Bride Parents: "${settings.bride_parents || 'NULL'}"`);
      console.log(`   Groom First Name: "${settings.groom_first_name || 'NULL'}"`);
      console.log(`   Groom Full Name: "${settings.groom_full_name || 'NULL'}"`);
      console.log(`   Groom Parents: "${settings.groom_parents || 'NULL'}"`);
      console.log(`   Wedding Date: "${settings.wedding_date || 'NULL'}"`);
      console.log(`   Wedding Venue: "${settings.wedding_venue || 'NULL'}"`);
      console.log(`   Is Active: ${settings.is_active}`);
      console.log(`   Created: ${settings.created_at}`);
      console.log(`   Updated: ${settings.updated_at}`);
    } else {
      console.log('❌ No active wedding settings found in database');
    }

    // Check bride_groom_management table
    const [brideGroomData] = await connection.query(`
      SELECT id, bride_name, groom_name, bride_parents, groom_parents,
             wedding_date, wedding_venue, is_active, created_at, updated_at
      FROM bride_groom_management 
      WHERE is_active = TRUE
      ORDER BY updated_at DESC
      LIMIT 1
    `);

    if (brideGroomData.length > 0) {
      const bgData = brideGroomData[0];
      console.log('\n✅ Found bride-groom management data:');
      console.log(`   ID: ${bgData.id}`);
      console.log(`   Bride Name: "${bgData.bride_name || 'NULL'}"`);
      console.log(`   Groom Name: "${bgData.groom_name || 'NULL'}"`);
      console.log(`   Bride Parents: "${bgData.bride_parents || 'NULL'}"`);
      console.log(`   Groom Parents: "${bgData.groom_parents || 'NULL'}"`);
      console.log(`   Wedding Date: "${bgData.wedding_date || 'NULL'}"`);
      console.log(`   Wedding Venue: "${bgData.wedding_venue || 'NULL'}"`);
      console.log(`   Is Active: ${bgData.is_active}`);
      console.log(`   Created: ${bgData.created_at}`);
      console.log(`   Updated: ${bgData.updated_at}`);
    } else {
      console.log('\n❌ No bride-groom management data found');
    }

    // Step 2: Test API endpoints
    console.log('\n📡 Step 2: Testing API endpoints...');
    
    // Test wedding settings API
    console.log('   Testing /api/wedding-settings...');
    const weddingSettingsResponse = await fetch('http://localhost:3001/api/wedding-settings');
    console.log(`   Status: ${weddingSettingsResponse.status}`);
    
    if (weddingSettingsResponse.ok) {
      const weddingSettingsData = await weddingSettingsResponse.json();
      console.log('   ✅ Wedding settings API response:');
      console.log(`   ${JSON.stringify(weddingSettingsData, null, 2)}`);
    } else {
      const errorText = await weddingSettingsResponse.text();
      console.log(`   ❌ Wedding settings API failed: ${errorText}`);
    }

    // Test bride-groom management API
    console.log('\n   Testing /api/bride-groom-management...');
    const brideGroomResponse = await fetch('http://localhost:3001/api/bride-groom-management');
    console.log(`   Status: ${brideGroomResponse.status}`);
    
    if (brideGroomResponse.ok) {
      const brideGroomApiData = await brideGroomResponse.json();
      console.log('   ✅ Bride-groom management API response:');
      console.log(`   ${JSON.stringify(brideGroomApiData, null, 2)}`);
    } else {
      const errorText = await brideGroomResponse.text();
      console.log(`   ❌ Bride-groom management API failed: ${errorText}`);
    }

    // Step 3: Check if data exists but names are empty
    console.log('\n🔍 Step 3: Analyzing data completeness...');
    
    let hasWeddingData = weddingSettings.length > 0;
    let hasBrideGroomData = brideGroomData.length > 0;
    
    if (hasWeddingData) {
      const ws = weddingSettings[0];
      const brideNameEmpty = !ws.bride_first_name || ws.bride_first_name.trim() === '';
      const groomNameEmpty = !ws.groom_first_name || ws.groom_first_name.trim() === '';
      
      console.log('   Wedding Settings Analysis:');
      console.log(`   ✅ Has wedding settings record: ${hasWeddingData}`);
      console.log(`   ${brideNameEmpty ? '❌' : '✅'} Bride first name: ${brideNameEmpty ? 'EMPTY' : 'HAS DATA'}`);
      console.log(`   ${groomNameEmpty ? '❌' : '✅'} Groom first name: ${groomNameEmpty ? 'EMPTY' : 'HAS DATA'}`);
    }
    
    if (hasBrideGroomData) {
      const bg = brideGroomData[0];
      const brideNameEmpty = !bg.bride_name || bg.bride_name.trim() === '';
      const groomNameEmpty = !bg.groom_name || bg.groom_name.trim() === '';
      
      console.log('\n   Bride-Groom Management Analysis:');
      console.log(`   ✅ Has bride-groom record: ${hasBrideGroomData}`);
      console.log(`   ${brideNameEmpty ? '❌' : '✅'} Bride name: ${brideNameEmpty ? 'EMPTY' : 'HAS DATA'}`);
      console.log(`   ${groomNameEmpty ? '❌' : '✅'} Groom name: ${groomNameEmpty ? 'EMPTY' : 'HAS DATA'}`);
    }

    // Step 4: Check frontend context default values
    console.log('\n🎯 Step 4: Frontend context analysis...');
    console.log('   Frontend expects data from WeddingContext:');
    console.log('   - weddingData.couple.brideFirstName');
    console.log('   - weddingData.couple.groomFirstName');
    console.log('   - weddingData.couple.brideLastName');
    console.log('   - weddingData.couple.groomLastName');
    console.log('');
    console.log('   Context loads data via reloadActiveSettings() from:');
    console.log('   - API: /api/wedding-settings');
    console.log('   - Maps: bride_first_name → brideFirstName');
    console.log('   - Maps: groom_first_name → groomFirstName');

    // Step 5: Provide diagnosis and solutions
    console.log('\n🎉 DIAGNOSIS & SOLUTIONS:');
    console.log('═══════════════════════════════════════════════════════════════');
    
    if (!hasWeddingData && !hasBrideGroomData) {
      console.log('❌ ISSUE: No bride/groom data in database');
      console.log('');
      console.log('💡 SOLUTIONS:');
      console.log('   1. Go to /admin/bride-groom-management');
      console.log('   2. Add bride and groom names');
      console.log('   3. Save the data');
      console.log('   4. Check if data syncs to wedding_settings table');
    } else if (hasWeddingData) {
      const ws = weddingSettings[0];
      const brideEmpty = !ws.bride_first_name || ws.bride_first_name.trim() === '';
      const groomEmpty = !ws.groom_first_name || ws.groom_first_name.trim() === '';
      
      if (brideEmpty || groomEmpty) {
        console.log('❌ ISSUE: Bride/groom names are empty in database');
        console.log('');
        console.log('💡 SOLUTIONS:');
        console.log('   1. Update wedding_settings table directly:');
        console.log(`      UPDATE wedding_settings SET`);
        console.log(`        bride_first_name = 'Nama Bride',`);
        console.log(`        groom_first_name = 'Nama Groom'`);
        console.log(`      WHERE id = ${ws.id};`);
        console.log('');
        console.log('   2. Or use admin panel to update names');
      } else {
        console.log('✅ ISSUE: Data exists but frontend not loading');
        console.log('');
        console.log('💡 SOLUTIONS:');
        console.log('   1. Check frontend WeddingContext loading');
        console.log('   2. Check API endpoint /api/wedding-settings');
        console.log('   3. Check browser console for errors');
        console.log('   4. Hard refresh frontend (Ctrl+F5)');
      }
    }

    console.log('\n📱 QUICK TEST:');
    console.log('   1. Open browser developer tools');
    console.log('   2. Go to frontend page');
    console.log('   3. Check console for WeddingContext logs');
    console.log('   4. Check Network tab for API calls');
    console.log('   5. Look for /api/wedding-settings request');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the debug
debugBrideGroomNames().catch(console.error);
