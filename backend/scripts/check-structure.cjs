#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function checkTableStructure() {
  console.log('🔍 Checking Table Structure...\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // Check users table structure
    console.log('\n👤 Users table structure:');
    const [userColumns] = await connection.query("DESCRIBE users");
    userColumns.forEach(col => {
      console.log(`   ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
    });

    // Check users table data
    console.log('\n👤 Users table data:');
    const [users] = await connection.query("SELECT * FROM users");
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`   User: ${JSON.stringify(user, null, 2)}`);
    });

    // Check all table structures
    console.log('\n📋 All table structures:');
    const [tables] = await connection.query("SHOW TABLES");
    
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`\n📊 Table: ${tableName}`);
      const [columns] = await connection.query(`DESCRIBE ${tableName}`);
      columns.forEach(col => {
        console.log(`   ${col.Field} - ${col.Type}`);
      });
    }

    await connection.end();

  } catch (error) {
    console.error('\n❌ Failed to check table structure:', error.message);
    process.exit(1);
  }
}

checkTableStructure();
