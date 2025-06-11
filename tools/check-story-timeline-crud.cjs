#!/usr/bin/env node

// Check story_timeline_items CRUD status

const mysql = require('mysql2/promise');

async function checkStoryTimelineCrud() {
  console.log('🔍 CHECKING STORY_TIMELINE_ITEMS CRUD STATUS');
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
    
    // Check if story_timeline_items table exists
    console.log('\n📊 CHECKING TABLE EXISTENCE...');
    const [tables] = await connection.execute('SHOW TABLES LIKE "story_timeline_items"');
    
    if (tables.length === 0) {
      console.log('❌ story_timeline_items table does not exist');
      return;
    }
    
    console.log('✅ story_timeline_items table exists');
    
    // Check table structure
    console.log('\n🔍 TABLE STRUCTURE:');
    const [columns] = await connection.execute('DESCRIBE story_timeline_items');
    console.log('Columns:');
    columns.forEach(col => {
      console.log(`   ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? col.Key : ''}`);
    });
    
    // Check current data
    console.log('\n📋 CURRENT DATA:');
    const [rows] = await connection.execute('SELECT * FROM story_timeline_items ORDER BY display_order ASC, created_at ASC');
    console.log(`Found ${rows.length} records:`);
    
    if (rows.length > 0) {
      rows.forEach((row, index) => {
        console.log(`\n   Record ${index + 1}:`);
        console.log(`     ID: ${row.id}`);
        console.log(`     Title: ${row.title || 'N/A'}`);
        console.log(`     Date: ${row.event_date || 'N/A'}`);
        console.log(`     Description: ${row.description ? row.description.substring(0, 50) + '...' : 'N/A'}`);
        console.log(`     Display Order: ${row.display_order || 'N/A'}`);
        console.log(`     Active: ${row.is_active ? 'YES' : 'NO'}`);
        console.log(`     Created: ${row.created_at || 'N/A'}`);
        console.log(`     Updated: ${row.updated_at || 'N/A'}`);
      });
    } else {
      console.log('   ⚠️ No data found in table');
    }
    
    // Check if there are API endpoints for story timeline
    console.log('\n🔍 CHECKING API ENDPOINTS...');
    
    // Test authentication first
    const fetch = await import('node-fetch').then(m => m.default);
    
    try {
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
      
      // Test story timeline endpoints
      const endpoints = [
        '/api/story-timeline',
        '/api/story-timeline-items',
        '/api/story/timeline',
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
    
    // Check if data looks static or dynamic
    console.log('\n🔍 DATA ANALYSIS:');
    
    if (rows.length > 0) {
      // Check for test/placeholder data
      const hasTestData = rows.some(row => 
        (row.title && row.title.toLowerCase().includes('test')) ||
        (row.description && row.description.toLowerCase().includes('test')) ||
        (row.title && row.title.toLowerCase().includes('sample'))
      );
      
      if (hasTestData) {
        console.log('⚠️ Contains test/placeholder data');
      } else {
        console.log('✅ Data appears to be production-ready');
      }
      
      // Check if data has been recently updated
      const recentUpdates = rows.filter(row => {
        if (!row.updated_at) return false;
        const updateDate = new Date(row.updated_at);
        const daysSinceUpdate = (Date.now() - updateDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate < 7; // Updated in last 7 days
      });
      
      if (recentUpdates.length > 0) {
        console.log(`✅ ${recentUpdates.length} records updated recently (last 7 days)`);
      } else {
        console.log('⚠️ No recent updates detected - may be static data');
      }
      
      // Check for proper ordering
      const hasProperOrder = rows.every((row, index) => {
        if (index === 0) return true;
        return row.display_order >= rows[index - 1].display_order;
      });
      
      if (hasProperOrder) {
        console.log('✅ Records have proper display order');
      } else {
        console.log('⚠️ Display order may need adjustment');
      }
    }
    
    // Recommendations
    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('═══════════════════════════════════════════════════════');
    
    if (rows.length === 0) {
      console.log('📝 ACTIONS NEEDED:');
      console.log('   1. Add sample story timeline data');
      console.log('   2. Create API endpoints for CRUD operations');
      console.log('   3. Build admin page for story timeline management');
    } else {
      console.log('📝 CURRENT STATUS:');
      console.log(`   ✅ Table exists with ${rows.length} records`);
      console.log('   ❌ No dedicated CRUD API endpoints found');
      console.log('   ❌ No admin management page');
      
      console.log('\n📝 ACTIONS NEEDED:');
      console.log('   1. Create API endpoints: GET, POST, PUT, DELETE /api/story-timeline');
      console.log('   2. Build admin page: Story Timeline Management');
      console.log('   3. Add frontend integration for public story display');
      console.log('   4. Clean test data if any exists');
    }
    
    console.log('\n🔧 IMPLEMENTATION PRIORITY:');
    console.log('   🔥 HIGH: Create CRUD API endpoints');
    console.log('   ⚡ MEDIUM: Build admin management page');
    console.log('   📋 LOW: Clean and organize existing data');
    
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
checkStoryTimelineCrud().catch(console.error);
