#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function simpleTableCheck() {
  console.log('🔍 SIMPLE TABLE CHECK');
  console.log('═══════════════════════════════════════════════════════');
  
  let connection;

  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });
    console.log('✅ Connected to database');

    // Check all tables
    const [tables] = await connection.query(`SHOW TABLES`);
    console.log('\n📋 All tables:');
    const tableNames = [];
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      tableNames.push(tableName);
      console.log(`   ${index + 1}. ${tableName}`);
    });

    // Check specific tables
    console.log('\n🔍 Checking specific tables:');
    const checkTables = ['couple_settings', 'bride_groom_detail_settings', 'bride_groom', 'bride_groom_detail'];
    
    checkTables.forEach(tableName => {
      const exists = tableNames.includes(tableName);
      console.log(`   ${tableName}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    });

    // If bride_groom exists, show its data
    if (tableNames.includes('bride_groom')) {
      console.log('\n📊 bride_groom table data:');
      const [data] = await connection.query(`SELECT * FROM bride_groom WHERE is_active = TRUE LIMIT 1`);
      if (data.length > 0) {
        console.log(`   Bride: ${data[0].bride_first_name} ${data[0].bride_last_name}`);
        console.log(`   Groom: ${data[0].groom_first_name} ${data[0].groom_last_name}`);
      }
    }

    // If bride_groom_detail exists, show its data
    if (tableNames.includes('bride_groom_detail')) {
      console.log('\n📊 bride_groom_detail table data:');
      const [data] = await connection.query(`SELECT * FROM bride_groom_detail WHERE is_active = TRUE LIMIT 1`);
      if (data.length > 0) {
        console.log(`   Found ${data.length} records`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

simpleTableCheck().catch(console.error);
