#!/usr/bin/env node

// Check which database tables are updated by Bride-Groom Management

const mysql = require('mysql2/promise');

async function checkDatabaseTables() {
  console.log('🔍 CHECKING DATABASE TABLES FOR BRIDE-GROOM DATA');
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

    console.log('✅ Connected to database: wedding_invitation\n');

    // Step 1: Show all tables
    console.log('📋 Step 1: All tables in database:');
    const [tables] = await connection.query('SHOW TABLES');
    
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });

    // Step 2: Check couple_settings table (main table)
    console.log('\n📊 Step 2: COUPLE_SETTINGS table (Main Bride-Groom table):');
    console.log('─────────────────────────────────────────────────────');
    
    try {
      const [coupleStructure] = await connection.query('DESCRIBE couple_settings');
      console.log('📋 Table structure:');
      coupleStructure.forEach(column => {
        console.log(`   ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(required)'} ${column.Key ? `[${column.Key}]` : ''}`);
      });

      const [coupleData] = await connection.query('SELECT * FROM couple_settings ORDER BY updated_at DESC LIMIT 3');
      console.log(`\n📊 Current data (${coupleData.length} records):`);
      coupleData.forEach((row, index) => {
        console.log(`   Record ${index + 1}:`);
        console.log(`     ID: ${row.id}, Wedding ID: ${row.wedding_id}, Active: ${row.is_active}`);
        console.log(`     Groom: ${row.groom_first_name} ${row.groom_last_name} (${row.groom_full_name})`);
        console.log(`     Bride: ${row.bride_first_name} ${row.bride_last_name} (${row.bride_full_name})`);
        console.log(`     Groom Parents: ${row.groom_parent_names}`);
        console.log(`     Bride Parents: ${row.bride_parent_names}`);
        console.log(`     Photos: Groom(${row.groom_photo}), Bride(${row.bride_photo})`);
        console.log(`     Created: ${row.created_at}, Updated: ${row.updated_at}`);
        console.log('');
      });
    } catch (error) {
      console.log(`   ❌ Error accessing couple_settings: ${error.message}`);
    }

    // Step 3: Check if data exists in other related tables
    console.log('📊 Step 3: Checking related tables:');
    console.log('─────────────────────────────────────────────────────');

    // Check wedding_settings table
    try {
      const [weddingData] = await connection.query(`
        SELECT id, couple_id, wedding_date, wedding_venue, is_active, created_at, updated_at 
        FROM wedding_settings 
        WHERE is_active = TRUE 
        ORDER BY updated_at DESC 
        LIMIT 1
      `);
      
      console.log('📋 WEDDING_SETTINGS table:');
      if (weddingData.length > 0) {
        const record = weddingData[0];
        console.log(`   ID: ${record.id}, Couple ID: ${record.couple_id}`);
        console.log(`   Wedding Date: ${record.wedding_date}, Venue: ${record.wedding_venue}`);
        console.log(`   Active: ${record.is_active}, Updated: ${record.updated_at}`);
      } else {
        console.log('   No active wedding settings found');
      }
    } catch (error) {
      console.log(`   ❌ Error accessing wedding_settings: ${error.message}`);
    }

    // Check bride_groom_settings table (if exists)
    try {
      const [brideGroomSettings] = await connection.query(`
        SELECT * FROM bride_groom_settings 
        ORDER BY updated_at DESC 
        LIMIT 1
      `);
      
      console.log('\n📋 BRIDE_GROOM_SETTINGS table:');
      if (brideGroomSettings.length > 0) {
        console.log(`   Found ${brideGroomSettings.length} records`);
        brideGroomSettings.forEach(record => {
          console.log(`   ID: ${record.id}, Updated: ${record.updated_at}`);
        });
      } else {
        console.log('   No records found');
      }
    } catch (error) {
      console.log('   ❌ Table bride_groom_settings does not exist');
    }

    // Step 4: Check API endpoint mapping
    console.log('\n🌐 Step 4: API Endpoint Analysis:');
    console.log('─────────────────────────────────────────────────────');
    console.log('📡 Bride-Groom Management API endpoints:');
    console.log('   GET  /api/bride-groom     → Reads from: couple_settings');
    console.log('   PUT  /api/bride-groom/1   → Updates: couple_settings');
    console.log('');
    console.log('📊 SQL Query used by API:');
    console.log('   SELECT * FROM couple_settings WHERE wedding_id = 1 AND is_active = TRUE');
    console.log('');
    console.log('📝 UPDATE Query used by API:');
    console.log('   UPDATE couple_settings SET');
    console.log('     groom_first_name = ?, groom_last_name = ?,');
    console.log('     bride_first_name = ?, bride_last_name = ?,');
    console.log('     groom_parent_names = ?, bride_parent_names = ?,');
    console.log('     updated_at = NOW()');
    console.log('   WHERE wedding_id = ? AND is_active = TRUE');

    // Step 5: Show table relationships
    console.log('\n🔗 Step 5: Table Relationships:');
    console.log('─────────────────────────────────────────────────────');
    console.log('📊 Database Schema Relationships:');
    console.log('');
    console.log('   wedding_settings');
    console.log('   ├── couple_id (FK) → couple_settings.id');
    console.log('   └── created_by (FK) → admin_users.id');
    console.log('');
    console.log('   couple_settings ← Main table for Bride-Groom data');
    console.log('   ├── wedding_id (FK) → wedding_settings.id');
    console.log('   ├── created_by (FK) → admin_users.id');
    console.log('   ├── groom_first_name, groom_last_name');
    console.log('   ├── bride_first_name, bride_last_name');
    console.log('   ├── groom_parent_names, bride_parent_names');
    console.log('   └── groom_photo, bride_photo');

    // Step 6: Summary
    console.log('\n🎯 SUMMARY:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 Bride-Groom Management updates data in:');
    console.log('');
    console.log('   🎯 PRIMARY TABLE: couple_settings');
    console.log('   ├── Table: couple_settings');
    console.log('   ├── Condition: wedding_id = 1 AND is_active = TRUE');
    console.log('   ├── Fields Updated:');
    console.log('   │   • groom_first_name');
    console.log('   │   • groom_last_name');
    console.log('   │   • groom_full_name');
    console.log('   │   • groom_parent_names');
    console.log('   │   • bride_first_name');
    console.log('   │   • bride_last_name');
    console.log('   │   • bride_full_name');
    console.log('   │   • bride_parent_names');
    console.log('   │   • updated_at (automatic)');
    console.log('   └── API Endpoint: PUT /api/bride-groom/1');
    console.log('');
    console.log('   📋 RELATED TABLES (read-only):');
    console.log('   ├── wedding_settings (references couple_settings via couple_id)');
    console.log('   └── admin_users (references via created_by)');

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the check
checkDatabaseTables().catch(console.error);
