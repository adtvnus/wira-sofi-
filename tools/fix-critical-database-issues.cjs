#!/usr/bin/env node

// Fix critical database issues - table naming mismatch

const mysql = require('mysql2/promise');

async function fixCriticalDatabaseIssues() {
  console.log('🔧 FIXING CRITICAL DATABASE ISSUES');
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
    
    // Check current table structure
    console.log('\n🔍 CHECKING CURRENT TABLE STRUCTURE...');
    
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(table => Object.values(table)[0]);
    
    console.log('Current tables:', tableNames);
    
    // Fix 1: Rename couple_settings to bride_groom
    console.log('\n🔧 FIX 1: Renaming couple_settings to bride_groom...');
    
    if (tableNames.includes('couple_settings') && !tableNames.includes('bride_groom')) {
      try {
        await connection.execute('RENAME TABLE couple_settings TO bride_groom');
        console.log('✅ Successfully renamed couple_settings to bride_groom');
      } catch (error) {
        console.log('❌ Error renaming table:', error.message);
      }
    } else if (tableNames.includes('bride_groom')) {
      console.log('✅ bride_groom table already exists');
    } else {
      console.log('❌ couple_settings table not found');
    }
    
    // Fix 2: Rename bride_groom_detail_settings to bride_groom_detail
    console.log('\n🔧 FIX 2: Renaming bride_groom_detail_settings to bride_groom_detail...');
    
    if (tableNames.includes('bride_groom_detail_settings') && !tableNames.includes('bride_groom_detail')) {
      try {
        await connection.execute('RENAME TABLE bride_groom_detail_settings TO bride_groom_detail');
        console.log('✅ Successfully renamed bride_groom_detail_settings to bride_groom_detail');
      } catch (error) {
        console.log('❌ Error renaming table:', error.message);
      }
    } else if (tableNames.includes('bride_groom_detail')) {
      console.log('✅ bride_groom_detail table already exists');
    } else {
      console.log('❌ bride_groom_detail_settings table not found');
    }
    
    // Fix 3: Rename wedding_guests to guests
    console.log('\n🔧 FIX 3: Renaming wedding_guests to guests...');
    
    if (tableNames.includes('wedding_guests') && !tableNames.includes('guests')) {
      try {
        await connection.execute('RENAME TABLE wedding_guests TO guests');
        console.log('✅ Successfully renamed wedding_guests to guests');
      } catch (error) {
        console.log('❌ Error renaming table:', error.message);
      }
    } else if (tableNames.includes('guests')) {
      console.log('✅ guests table already exists');
    } else {
      console.log('❌ wedding_guests table not found');
    }
    
    // Fix 4: Rename gallery_images to gallery
    console.log('\n🔧 FIX 4: Renaming gallery_images to gallery...');
    
    if (tableNames.includes('gallery_images') && !tableNames.includes('gallery')) {
      try {
        await connection.execute('RENAME TABLE gallery_images TO gallery');
        console.log('✅ Successfully renamed gallery_images to gallery');
      } catch (error) {
        console.log('❌ Error renaming table:', error.message);
      }
    } else if (tableNames.includes('gallery')) {
      console.log('✅ gallery table already exists');
    } else {
      console.log('❌ gallery_images table not found');
    }
    
    // Fix 5: Rename quotes_settings to quotes
    console.log('\n🔧 FIX 5: Renaming quotes_settings to quotes...');
    
    if (tableNames.includes('quotes_settings') && !tableNames.includes('quotes')) {
      try {
        await connection.execute('RENAME TABLE quotes_settings TO quotes');
        console.log('✅ Successfully renamed quotes_settings to quotes');
      } catch (error) {
        console.log('❌ Error renaming table:', error.message);
      }
    } else if (tableNames.includes('quotes')) {
      console.log('✅ quotes table already exists');
    } else {
      console.log('❌ quotes_settings table not found');
    }
    
    // Verify changes
    console.log('\n✅ VERIFICATION - Updated table structure:');
    const [newTables] = await connection.execute('SHOW TABLES');
    const newTableNames = newTables.map(table => Object.values(table)[0]);
    
    console.log('Updated tables:', newTableNames.sort());
    
    // Check if critical tables now exist
    const criticalTables = ['bride_groom', 'bride_groom_detail', 'guests', 'gallery', 'quotes'];
    
    console.log('\n🎯 CRITICAL TABLES STATUS:');
    criticalTables.forEach(tableName => {
      const exists = newTableNames.includes(tableName);
      console.log(`   ${exists ? '✅' : '❌'} ${tableName}: ${exists ? 'EXISTS' : 'MISSING'}`);
    });
    
    // Test data access
    console.log('\n🧪 TESTING DATA ACCESS...');
    
    for (const tableName of criticalTables) {
      if (newTableNames.includes(tableName)) {
        try {
          const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
          console.log(`   ✅ ${tableName}: ${count[0].count} rows`);
        } catch (error) {
          console.log(`   ❌ ${tableName}: Error accessing - ${error.message}`);
        }
      }
    }
    
    console.log('\n🎉 CRITICAL DATABASE FIXES COMPLETED!');
    console.log('');
    console.log('📋 SUMMARY OF CHANGES:');
    console.log('   ✅ couple_settings → bride_groom');
    console.log('   ✅ bride_groom_detail_settings → bride_groom_detail');
    console.log('   ✅ wedding_guests → guests');
    console.log('   ✅ gallery_images → gallery');
    console.log('   ✅ quotes_settings → quotes');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('   1. Test Bride-Groom Management page');
    console.log('   2. Test Gallery Management page');
    console.log('   3. Test Quotes Management page');
    console.log('   4. Test Guest Management page');
    console.log('   5. Clean test data from tables');
    
  } catch (error) {
    console.error('❌ Database operation failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n👋 Database connection closed');
    }
  }
}

// Run the fixes
fixCriticalDatabaseIssues().catch(console.error);
