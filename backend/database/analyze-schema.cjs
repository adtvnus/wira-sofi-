#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function analyzeSchema() {
  console.log('🔍 Analyzing Wedding Invitation Database Schema...\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // Get all tables
    console.log('\n📋 Current Database Tables:');
    const [tables] = await connection.query("SHOW TABLES");
    
    const tableList = [];
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      tableList.push(tableName);
      
      // Get table info
      const [columns] = await connection.query(`DESCRIBE ${tableName}`);
      const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      
      console.log(`\n📊 Table: ${tableName} (${count[0].count} rows)`);
      columns.forEach(col => {
        const key = col.Key ? ` [${col.Key}]` : '';
        const nullable = col.Null === 'YES' ? ' (nullable)' : ' (required)';
        console.log(`   ${col.Field} - ${col.Type}${key}${nullable}`);
      });
    }

    // Analyze table usage based on admin pages
    console.log('\n\n🎯 ANALYSIS: Table Usage vs Admin Pages');
    console.log('='.repeat(50));

    const adminPages = [
      'Dashboard',
      'GuestManagement', 
      'InvitedManagement',
      'RsvpManagement',
      'ThanksManagement', 
      'QuotesManagement',
      'BrideGroomManagement',
      'StoryManagement',
      'GalleryManagement',
      'WeddingSettings'
    ];

    const tableUsage = {
      // Core tables (always needed)
      'admin_users': { used: true, pages: ['Login', 'Authentication'], priority: 'HIGH' },
      'user_sessions': { used: true, pages: ['Authentication'], priority: 'HIGH' },
      'activity_logs': { used: true, pages: ['Audit Trail'], priority: 'MEDIUM' },
      
      // Wedding data tables
      'wedding_settings': { used: true, pages: ['WeddingSettings', 'Dashboard'], priority: 'HIGH' },
      'wedding_guests': { used: true, pages: ['GuestManagement'], priority: 'HIGH' },
      
      // Content management tables
      'couple_settings': { used: true, pages: ['BrideGroomManagement'], priority: 'HIGH' },
      'bride_groom_detail_settings': { used: true, pages: ['BrideGroomManagement'], priority: 'HIGH' },
      'quotes_settings': { used: true, pages: ['QuotesManagement'], priority: 'HIGH' },
      'story_settings': { used: true, pages: ['StoryManagement'], priority: 'HIGH' },
      'story_timeline_items': { used: true, pages: ['StoryManagement'], priority: 'HIGH' },
      'gallery_settings': { used: true, pages: ['GalleryManagement'], priority: 'HIGH' },
      'gallery_images': { used: true, pages: ['GalleryManagement'], priority: 'HIGH' },
      'rsvp_settings': { used: true, pages: ['RsvpManagement'], priority: 'HIGH' },
      'thanks_settings': { used: true, pages: ['ThanksManagement'], priority: 'HIGH' },
      'invited_settings': { used: true, pages: ['InvitedManagement'], priority: 'HIGH' },
      'event_settings': { used: true, pages: ['WeddingSettings'], priority: 'HIGH' },
    };

    console.log('\n✅ USED TABLES:');
    tableList.forEach(tableName => {
      if (tableUsage[tableName]) {
        const usage = tableUsage[tableName];
        console.log(`   ✅ ${tableName} - ${usage.priority} - Used by: ${usage.pages.join(', ')}`);
      }
    });

    console.log('\n❌ POTENTIALLY UNUSED TABLES:');
    tableList.forEach(tableName => {
      if (!tableUsage[tableName]) {
        console.log(`   ❌ ${tableName} - Not mapped to any admin page`);
      }
    });

    // Check for missing tables
    console.log('\n⚠️ MISSING TABLES (if any):');
    const expectedTables = Object.keys(tableUsage);
    const missingTables = expectedTables.filter(table => !tableList.includes(table));
    
    if (missingTables.length > 0) {
      missingTables.forEach(table => {
        console.log(`   ⚠️ ${table} - Expected but not found`);
      });
    } else {
      console.log('   ✅ All expected tables are present');
    }

    await connection.end();

    console.log('\n\n🎯 RECOMMENDATIONS:');
    console.log('='.repeat(50));
    console.log('1. ✅ Keep all HIGH priority tables');
    console.log('2. 🔍 Review MEDIUM priority tables for actual usage');
    console.log('3. ❌ Consider removing unused tables');
    console.log('4. 🧹 Clean up any orphaned data');

  } catch (error) {
    console.error('\n❌ Error analyzing schema:', error.message);
    process.exit(1);
  }
}

analyzeSchema();
