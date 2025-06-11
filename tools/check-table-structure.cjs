#!/usr/bin/env node

// Check table structure for bride/groom data

const mysql = require('mysql2/promise');

async function checkTableStructure() {
  console.log('🔍 CHECKING TABLE STRUCTURE FOR BRIDE/GROOM DATA');
  console.log('═══════════════════════════════════════════════════════');
  
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

    // Check all tables
    console.log('\n📋 Checking all tables...');
    const [tables] = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'wedding_invitation'
      ORDER BY table_name
    `);

    console.log('✅ Available tables:');
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.table_name}`);
    });

    // Check wedding_settings table structure
    console.log('\n📋 Checking wedding_settings table structure...');
    try {
      const [weddingCols] = await connection.query(`
        DESCRIBE wedding_settings
      `);
      
      console.log('✅ wedding_settings columns:');
      weddingCols.forEach((col, index) => {
        console.log(`   ${index + 1}. ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } catch (error) {
      console.log('❌ wedding_settings table does not exist');
    }

    // Check bride_groom_management table structure
    console.log('\n📋 Checking bride_groom_management table structure...');
    try {
      const [brideCols] = await connection.query(`
        DESCRIBE bride_groom_management
      `);
      
      console.log('✅ bride_groom_management columns:');
      brideCols.forEach((col, index) => {
        console.log(`   ${index + 1}. ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });

      // Check data in bride_groom_management
      const [brideData] = await connection.query(`
        SELECT * FROM bride_groom_management ORDER BY updated_at DESC LIMIT 1
      `);
      
      if (brideData.length > 0) {
        console.log('\n✅ Latest bride_groom_management data:');
        const data = brideData[0];
        Object.keys(data).forEach(key => {
          console.log(`   ${key}: "${data[key] || 'NULL'}"`);
        });
      } else {
        console.log('\n❌ No data in bride_groom_management table');
      }
    } catch (error) {
      console.log('❌ bride_groom_management table does not exist');
    }

    // Check other potential tables
    const potentialTables = ['couples', 'wedding_couple', 'bride_groom', 'wedding_data'];
    
    for (const tableName of potentialTables) {
      console.log(`\n📋 Checking ${tableName} table...`);
      try {
        const [cols] = await connection.query(`DESCRIBE ${tableName}`);
        console.log(`✅ ${tableName} columns:`);
        cols.forEach((col, index) => {
          console.log(`   ${index + 1}. ${col.Field} (${col.Type})`);
        });

        const [data] = await connection.query(`SELECT * FROM ${tableName} LIMIT 1`);
        if (data.length > 0) {
          console.log(`✅ Sample data from ${tableName}:`);
          Object.keys(data[0]).forEach(key => {
            console.log(`   ${key}: "${data[0][key] || 'NULL'}"`);
          });
        }
      } catch (error) {
        console.log(`❌ ${tableName} table does not exist`);
      }
    }

    console.log('\n🎯 ANALYSIS & SOLUTION:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Frontend expects data from WeddingContext which calls:');
    console.log('- API: /api/wedding-settings');
    console.log('- Maps database fields to context fields');
    console.log('');
    console.log('Need to check:');
    console.log('1. Which table actually stores bride/groom names');
    console.log('2. What are the correct column names');
    console.log('3. Update API endpoint to use correct table/columns');
    console.log('4. Update WeddingContext mapping');

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
checkTableStructure().catch(console.error);
