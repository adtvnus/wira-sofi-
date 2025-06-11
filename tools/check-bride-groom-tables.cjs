#!/usr/bin/env node

// Check bride-groom tables and fix missing tables

const mysql = require('mysql2/promise');

async function checkBrideGroomTables() {
  console.log('🔍 CHECKING BRIDE-GROOM TABLES FOR MISSING TABLES');
  console.log('═══════════════════════════════════════════════════════════════');
  
  let connection;

  try {
    // Connect to database
    console.log('📊 Connecting to database...');
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });
    console.log('✅ Database connected');

    // Check all existing tables
    console.log('\n📋 Checking existing tables...');
    const [tables] = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'wedding_invitation'
      ORDER BY table_name
    `);

    console.log('✅ Existing tables:');
    const existingTables = [];
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.table_name}`);
      existingTables.push(table.table_name);
    });

    // Check for bride-groom related tables
    console.log('\n🔍 Checking bride-groom related tables...');
    const brideGroomTables = [
      'couple_settings',
      'bride_groom_detail_settings', 
      'bride_groom',
      'bride_groom_detail'
    ];

    const missingBrideGroomTables = brideGroomTables.filter(table => !existingTables.includes(table));
    const existingBrideGroomTables = brideGroomTables.filter(table => existingTables.includes(table));
    
    console.log('✅ Existing bride-groom tables:');
    existingBrideGroomTables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table}`);
    });

    if (missingBrideGroomTables.length > 0) {
      console.log('\n❌ Missing bride-groom tables:');
      missingBrideGroomTables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table}`);
      });
    }

    // Check bride_groom table structure (if exists)
    if (existingTables.includes('bride_groom')) {
      console.log('\n📋 bride_groom table structure:');
      const [brideCols] = await connection.query(`DESCRIBE bride_groom`);
      brideCols.forEach((col, index) => {
        console.log(`   ${index + 1}. ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });

      // Check data in bride_groom
      const [brideData] = await connection.query(`SELECT * FROM bride_groom WHERE is_active = TRUE LIMIT 1`);
      if (brideData.length > 0) {
        console.log('\n✅ bride_groom sample data:');
        const data = brideData[0];
        console.log(`   ID: ${data.id}`);
        console.log(`   Bride First: "${data.bride_first_name}"`);
        console.log(`   Groom First: "${data.groom_first_name}"`);
        console.log(`   Bride Full: "${data.bride_full_name}"`);
        console.log(`   Groom Full: "${data.groom_full_name}"`);
      }
    }

    // Check bride_groom_detail table structure (if exists)
    if (existingTables.includes('bride_groom_detail')) {
      console.log('\n📋 bride_groom_detail table structure:');
      const [detailCols] = await connection.query(`DESCRIBE bride_groom_detail`);
      detailCols.forEach((col, index) => {
        console.log(`   ${index + 1}. ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }

    console.log('\n🔍 DIAGNOSIS:');
    console.log('   Error 1: Table \'wedding_invitation.couple_settings\' doesn\'t exist');
    console.log('   Error 2: Table \'wedding_invitation.bride_groom_detail_settings\' doesn\'t exist');
    console.log('');
    console.log('   Reality check:');
    console.log(`   - couple_settings exists: ${existingTables.includes('couple_settings') ? 'YES' : 'NO'}`);
    console.log(`   - bride_groom_detail_settings exists: ${existingTables.includes('bride_groom_detail_settings') ? 'YES' : 'NO'}`);
    console.log(`   - bride_groom exists: ${existingTables.includes('bride_groom') ? 'YES' : 'NO'}`);
    console.log(`   - bride_groom_detail exists: ${existingTables.includes('bride_groom_detail') ? 'YES' : 'NO'}`);
    console.log('');
    console.log('💡 SOLUTIONS:');
    console.log('   1. Fix backend API to use correct table names');
    console.log('   2. Or create missing tables if needed');
    console.log('   3. Map existing tables to API endpoints');
    console.log('   4. Update bride-groom management to use existing tables');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n📊 Database connection closed');
    }
  }
}

// Run the check
checkBrideGroomTables().catch(console.error);
