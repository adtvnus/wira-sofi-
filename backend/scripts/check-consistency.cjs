#!/usr/bin/env node

const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabaseConsistency() {
  console.log('🔍 Checking Database Consistency...\n');

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // Check if all required tables exist
    const requiredTables = [
      'admin_users',
      'wedding_settings', 
      'wedding_guests',
      'user_sessions',
      'activity_logs'
    ];

    console.log('\n📋 Checking Required Tables:');
    for (const table of requiredTables) {
      try {
        const [rows] = await connection.query(`SHOW TABLES LIKE '${table}'`);
        if (rows.length > 0) {
          console.log(`   ✅ ${table} - EXISTS`);
          
          // Check table structure
          const [columns] = await connection.query(`DESCRIBE ${table}`);
          console.log(`      Columns: ${columns.length}`);
          
          // Check record count
          const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
          console.log(`      Records: ${count[0].count}`);
        } else {
          console.log(`   ❌ ${table} - MISSING`);
        }
      } catch (error) {
        console.log(`   ❌ ${table} - ERROR: ${error.message}`);
      }
    }

    // Check admin_users table structure
    console.log('\n👤 Admin Users Table Analysis:');
    try {
      const [columns] = await connection.query(`DESCRIBE admin_users`);
      const requiredColumns = ['id', 'username', 'email', 'password_hash', 'full_name', 'role', 'is_active'];
      
      for (const reqCol of requiredColumns) {
        const exists = columns.find(col => col.Field === reqCol);
        if (exists) {
          console.log(`   ✅ ${reqCol} - ${exists.Type} ${exists.Null === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
        } else {
          console.log(`   ❌ ${reqCol} - MISSING`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Error checking admin_users: ${error.message}`);
    }

    // Check wedding_guests table structure
    console.log('\n👥 Wedding Guests Table Analysis:');
    try {
      const [columns] = await connection.query(`DESCRIBE wedding_guests`);
      const requiredColumns = ['id', 'wedding_id', 'guest_name', 'guest_email', 'guest_phone', 'invitation_code', 'guest_count', 'rsvp_status'];
      
      for (const reqCol of requiredColumns) {
        const exists = columns.find(col => col.Field === reqCol);
        if (exists) {
          console.log(`   ✅ ${reqCol} - ${exists.Type}`);
        } else {
          console.log(`   ❌ ${reqCol} - MISSING`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Error checking wedding_guests: ${error.message}`);
    }

    // Check foreign key relationships
    console.log('\n🔗 Foreign Key Relationships:');
    try {
      const [fks] = await connection.query(`
        SELECT 
          TABLE_NAME,
          COLUMN_NAME,
          CONSTRAINT_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE REFERENCED_TABLE_SCHEMA = '${process.env.DB_NAME || 'wedding_invitation'}'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      
      if (fks.length > 0) {
        fks.forEach(fk => {
          console.log(`   ✅ ${fk.TABLE_NAME}.${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
        });
      } else {
        console.log('   ⚠️ No foreign key relationships found');
      }
    } catch (error) {
      console.log(`   ❌ Error checking foreign keys: ${error.message}`);
    }

    // Check indexes
    console.log('\n📊 Index Analysis:');
    for (const table of requiredTables) {
      try {
        const [indexes] = await connection.query(`SHOW INDEX FROM ${table}`);
        const uniqueIndexes = [...new Set(indexes.map(idx => idx.Key_name))];
        console.log(`   ${table}: ${uniqueIndexes.length} indexes (${uniqueIndexes.join(', ')})`);
      } catch (error) {
        console.log(`   ❌ ${table}: Error checking indexes`);
      }
    }

    // Test data integrity
    console.log('\n🧪 Data Integrity Tests:');
    
    // Test admin users
    try {
      const [adminUsers] = await connection.query(`
        SELECT COUNT(*) as count, 
               COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_count
        FROM admin_users
      `);
      console.log(`   👤 Admin Users: ${adminUsers[0].count} total, ${adminUsers[0].active_count} active`);
    } catch (error) {
      console.log(`   ❌ Admin users test failed: ${error.message}`);
    }

    // Test wedding settings
    try {
      const [settings] = await connection.query(`
        SELECT COUNT(*) as count
        FROM wedding_settings
        WHERE is_active = 1
      `);
      console.log(`   💒 Wedding Settings: ${settings[0].count} active configurations`);
    } catch (error) {
      console.log(`   ❌ Wedding settings test failed: ${error.message}`);
    }

    // Test guests
    try {
      const [guests] = await connection.query(`
        SELECT COUNT(*) as total,
               COUNT(CASE WHEN rsvp_status = 'pending' THEN 1 END) as pending,
               COUNT(CASE WHEN rsvp_status = 'confirmed' THEN 1 END) as confirmed,
               COUNT(CASE WHEN rsvp_status = 'declined' THEN 1 END) as declined
        FROM wedding_guests
        WHERE is_active = 1
      `);
      console.log(`   👥 Guests: ${guests[0].total} total (${guests[0].pending} pending, ${guests[0].confirmed} confirmed, ${guests[0].declined} declined)`);
    } catch (error) {
      console.log(`   ❌ Guests test failed: ${error.message}`);
    }

    await connection.end();

    console.log('\n📋 Database Consistency Check Complete!');
    console.log('\nIf any issues were found, run: node database-seeder.cjs');

  } catch (error) {
    console.error('\n❌ Database consistency check failed:', error.message);
    process.exit(1);
  }
}

checkDatabaseConsistency();
