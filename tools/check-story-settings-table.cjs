#!/usr/bin/env node

// Check story_settings table structure and data

const mysql = require('mysql2/promise');

async function checkStorySettingsTable() {
  console.log('🔍 CHECKING STORY_SETTINGS TABLE');
  console.log('═══════════════════════════════════════════════════════');
  
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });
    
    console.log('✅ Connected to database');
    
    // Check if story_settings table exists
    console.log('\n📊 CHECKING TABLE EXISTENCE...');
    const [tables] = await connection.execute('SHOW TABLES LIKE "story_settings"');
    
    if (tables.length === 0) {
      console.log('❌ story_settings table does not exist');
      return;
    }
    
    console.log('✅ story_settings table exists');
    
    // Check table structure
    console.log('\n🔍 TABLE STRUCTURE:');
    const [columns] = await connection.execute('DESCRIBE story_settings');
    console.log('Columns:');
    columns.forEach(col => {
      console.log(`   ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? col.Key : ''}`);
    });
    
    // Check current data
    console.log('\n📋 CURRENT DATA:');
    const [rows] = await connection.execute('SELECT * FROM story_settings ORDER BY created_at DESC');
    console.log(`Found ${rows.length} records:`);
    
    if (rows.length > 0) {
      rows.forEach((row, index) => {
        console.log(`\n   Record ${index + 1}:`);
        console.log(`     ID: ${row.id}`);
        console.log(`     Wedding ID: ${row.wedding_id}`);
        console.log(`     Header Title: ${row.header_title || 'N/A'}`);
        console.log(`     Header Subtitle: ${row.header_subtitle ? row.header_subtitle.substring(0, 50) + '...' : 'N/A'}`);
        console.log(`     Active: ${row.is_active ? 'YES' : 'NO'}`);
        console.log(`     Created: ${row.created_at || 'N/A'}`);
        console.log(`     Updated: ${row.updated_at || 'N/A'}`);
      });
    } else {
      console.log('   ⚠️ No data found in table');
    }
    
    // Check for API endpoints
    console.log('\n🔍 CHECKING API ENDPOINTS...');
    
    const fetch = await import('node-fetch').then(m => m.default);
    
    try {
      // Test authentication first
      const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin' })
      });
      
      if (!loginResponse.ok) {
        console.log('❌ Cannot authenticate to test API endpoints');
        return;
      }
      
      const loginData = await loginResponse.json();
      const token = loginData.token;
      console.log('✅ Authentication successful');
      
      // Test story settings endpoints
      const endpoints = [
        '/api/story-settings',
        '/api/story/settings',
        '/api/story'
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`\n   Testing: ${endpoint}`);
          const response = await fetch(`http://localhost:3001${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          console.log(`     Status: ${response.status} ${response.statusText}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`     ✅ Endpoint working`);
            console.log(`     Response: ${JSON.stringify(data, null, 2).substring(0, 200)}...`);
          } else {
            console.log(`     ❌ Endpoint failed`);
          }
        } catch (error) {
          console.log(`     ❌ Error: ${error.message}`);
        }
      }
      
    } catch (error) {
      console.log('❌ Error testing API endpoints:', error.message);
    }
    
    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('═══════════════════════════════════════════════════════');
    
    if (rows.length === 0) {
      console.log('📝 ACTIONS NEEDED:');
      console.log('   1. Add default story settings data');
      console.log('   2. Create API endpoints for CRUD operations');
      console.log('   3. Update frontend to use database instead of context');
    } else {
      console.log('📝 CURRENT STATUS:');
      console.log(`   ✅ Table exists with ${rows.length} records`);
      console.log('   ❌ Need to check if API endpoints exist');
      console.log('   ❌ Need to update frontend to use database');
      
      console.log('\n📝 ACTIONS NEEDED:');
      console.log('   1. Create API endpoints: GET, PUT /api/story-settings');
      console.log('   2. Update frontend to use API instead of context');
      console.log('   3. Add real-time auto-save functionality');
      console.log('   4. Test integration with story management page');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n👋 Database connection closed');
    }
  }
}

// Run the check
checkStorySettingsTable().catch(console.error);
