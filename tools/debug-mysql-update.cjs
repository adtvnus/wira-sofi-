#!/usr/bin/env node

// Debug script to check why MySQL data is not updating

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

const mysql = require('mysql2/promise');

const API_BASE_URL = 'http://localhost:3001/api';

async function debugMySQLUpdate() {
  console.log('🔍 DEBUGGING MYSQL UPDATE ISSUE');
  console.log('═══════════════════════════════════════════════════════');
  
  const fetch = await getFetch();
  let connection;

  try {
    // Step 1: Check database connection
    console.log('📊 Step 1: Checking database connection...');
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });
    
    await connection.ping();
    console.log('✅ Database connection successful');

    // Step 2: Check table structure
    console.log('\n📋 Step 2: Checking table structure...');
    const [tableInfo] = await connection.query(`
      DESCRIBE couple_settings
    `);
    
    console.log('📋 Table structure:');
    tableInfo.forEach(column => {
      console.log(`   ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(not null)'} ${column.Key ? `[${column.Key}]` : ''}`);
    });

    // Step 3: Check current data
    console.log('\n📊 Step 3: Checking current data in couple_settings...');
    const [currentData] = await connection.query(`
      SELECT * FROM couple_settings ORDER BY created_at DESC
    `);
    
    console.log(`📊 Found ${currentData.length} records in couple_settings:`);
    currentData.forEach((row, index) => {
      console.log(`   Record ${index + 1}:`);
      console.log(`     ID: ${row.id}, Wedding ID: ${row.wedding_id}, Active: ${row.is_active}`);
      console.log(`     Groom: ${row.groom_first_name} ${row.groom_last_name}`);
      console.log(`     Bride: ${row.bride_first_name} ${row.bride_last_name}`);
      console.log(`     Created: ${row.created_at}, Updated: ${row.updated_at}`);
    });

    // Step 4: Test authentication
    console.log('\n🔐 Step 4: Testing authentication...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    if (!loginData.success || !loginData.token) {
      throw new Error('Login response invalid');
    }

    const token = loginData.token;
    console.log('✅ Authentication successful');
    console.log(`🔑 Token: ${token.substring(0, 20)}...`);

    // Step 5: Test API endpoint directly
    console.log('\n🌐 Step 5: Testing API endpoint...');
    
    // First, get current data via API
    const getResponse = await fetch(`${API_BASE_URL}/bride-groom`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('📊 Current data via API:');
      console.log(JSON.stringify(getData.data, null, 2));
    } else {
      console.log('❌ Failed to get data via API:', getResponse.status);
    }

    // Step 6: Try to update with debug data
    console.log('\n📤 Step 6: Attempting update with debug data...');
    const debugData = {
      groomFirstName: 'DEBUG_GROOM',
      groomLastName: 'TEST',
      groomFullName: 'DEBUG_GROOM TEST',
      groomParentNames: 'DEBUG PARENTS',
      brideFirstName: 'DEBUG_BRIDE',
      brideLastName: 'TEST',
      brideFullName: 'DEBUG_BRIDE TEST',
      brideParentNames: 'DEBUG PARENTS'
    };

    console.log('📝 Sending debug data:');
    console.log(JSON.stringify(debugData, null, 2));

    const updateResponse = await fetch(`${API_BASE_URL}/bride-groom/1`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(debugData)
    });

    console.log(`📡 API Response Status: ${updateResponse.status}`);
    
    if (updateResponse.ok) {
      const updateData = await updateResponse.json();
      console.log('📊 API Response:');
      console.log(JSON.stringify(updateData, null, 2));
    } else {
      const errorText = await updateResponse.text();
      console.log('❌ API Error Response:');
      console.log(errorText);
    }

    // Step 7: Check if data actually changed in database
    console.log('\n🔍 Step 7: Checking if data changed in database...');
    const [afterData] = await connection.query(`
      SELECT * FROM couple_settings WHERE wedding_id = 1 AND is_active = TRUE ORDER BY updated_at DESC LIMIT 1
    `);

    if (afterData.length > 0) {
      const record = afterData[0];
      console.log('📊 Latest record in database:');
      console.log(`   ID: ${record.id}`);
      console.log(`   Groom: ${record.groom_first_name} ${record.groom_last_name}`);
      console.log(`   Bride: ${record.bride_first_name} ${record.bride_last_name}`);
      console.log(`   Updated: ${record.updated_at}`);
      
      // Check if it matches our debug data
      const matches = record.groom_first_name === debugData.groomFirstName && 
                     record.bride_first_name === debugData.brideFirstName;
      
      console.log(`🎯 Data update status: ${matches ? '✅ SUCCESS' : '❌ FAILED'}`);
      
      if (!matches) {
        console.log('\n🔍 Debugging why update failed...');
        
        // Check if there are multiple records
        const [allRecords] = await connection.query(`
          SELECT * FROM couple_settings ORDER BY created_at DESC
        `);
        
        console.log(`📊 Total records in table: ${allRecords.length}`);
        allRecords.forEach((row, index) => {
          console.log(`   Record ${index + 1}: ID=${row.id}, Wedding_ID=${row.wedding_id}, Active=${row.is_active}`);
        });
        
        // Check if wedding_id = 1 exists
        const [wedding1Records] = await connection.query(`
          SELECT * FROM couple_settings WHERE wedding_id = 1
        `);
        
        console.log(`📊 Records with wedding_id = 1: ${wedding1Records.length}`);
        
        if (wedding1Records.length === 0) {
          console.log('❌ PROBLEM FOUND: No records with wedding_id = 1');
          console.log('💡 SOLUTION: The API is trying to update wedding_id = 1, but no such record exists');
        }
      }
    } else {
      console.log('❌ No records found with wedding_id = 1 and is_active = TRUE');
    }

    // Step 8: Check server logs
    console.log('\n📋 Step 8: Recommendations...');
    console.log('🔍 To debug further:');
    console.log('   1. Check server console logs for SQL errors');
    console.log('   2. Verify the wedding_id parameter in the API call');
    console.log('   3. Check if the UPDATE query is actually executing');
    console.log('   4. Verify database permissions');

  } catch (error) {
    console.error('\n❌ DEBUG FAILED:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the debug
debugMySQLUpdate().catch(console.error);
