#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function checkGuestsTable() {
  console.log('🔍 CHECKING WEDDING_GUESTS TABLE STRUCTURE\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // Check if wedding_guests table exists
    console.log('\n1. 📋 Checking if wedding_guests table exists...');
    const [tables] = await connection.query("SHOW TABLES LIKE 'wedding_guests'");
    
    if (tables.length === 0) {
      console.log('❌ wedding_guests table does not exist!');
      await connection.end();
      return;
    }

    console.log('✅ wedding_guests table exists');

    // Show table structure
    console.log('\n2. 🏗️ Table structure:');
    const [columns] = await connection.query("DESCRIBE wedding_guests");
    console.table(columns);

    // Count records
    console.log('\n3. 📊 Record count:');
    const [countResult] = await connection.query("SELECT COUNT(*) as total FROM wedding_guests");
    console.log(`   Total records: ${countResult[0].total}`);

    // Show sample records if any
    if (countResult[0].total > 0) {
      console.log('\n4. 📄 Sample records:');
      const [records] = await connection.query("SELECT * FROM wedding_guests LIMIT 5");
      console.table(records);
    }

    // Check for active records
    console.log('\n5. 🔍 Active records:');
    const [activeResult] = await connection.query("SELECT COUNT(*) as active_total FROM wedding_guests WHERE is_active = TRUE");
    console.log(`   Active records: ${activeResult[0].active_total}`);

    await connection.end();
    console.log('\n✅ Check completed successfully!');

  } catch (error) {
    console.error('\n❌ Check failed:', error.message);
    console.error('   Error code:', error.code);
    console.error('   SQL State:', error.sqlState);
  }
}

checkGuestsTable();
