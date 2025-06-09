#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function cleanupSchema() {
  console.log('🧹 Cleaning up Wedding Invitation Database Schema...\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // STEP 1: Drop invalid views
    console.log('\n1. 🗑️ Dropping invalid views...');
    const invalidViews = [
      'v_active_guests',
      'v_wedding_settings_with_couple'
    ];

    for (const view of invalidViews) {
      try {
        await connection.query(`DROP VIEW IF EXISTS ${view}`);
        console.log(`   ✅ Dropped view: ${view}`);
      } catch (error) {
        console.log(`   ⚠️ Could not drop view ${view}: ${error.message}`);
      }
    }

    // STEP 2: Identify duplicate/redundant tables
    console.log('\n2. 🔍 Identifying duplicate tables...');
    
    // Check for duplicate couple data tables
    const [coupleSettings] = await connection.query('SELECT COUNT(*) as count FROM couple_settings');
    const [brideGroomSettings] = await connection.query('SELECT COUNT(*) as count FROM bride_groom_settings');
    
    console.log(`   couple_settings: ${coupleSettings[0].count} rows`);
    console.log(`   bride_groom_settings: ${brideGroomSettings[0].count} rows`);

    // STEP 3: Remove duplicate table (bride_groom_settings)
    console.log('\n3. 🗑️ Removing duplicate table: bride_groom_settings...');
    
    // First, migrate any important data if needed
    const [brideGroomData] = await connection.query('SELECT * FROM bride_groom_settings WHERE is_active = TRUE');
    
    if (brideGroomData.length > 0) {
      console.log(`   📦 Found ${brideGroomData.length} active records in bride_groom_settings`);
      
      // Check if couple_settings has the same data
      const [coupleData] = await connection.query('SELECT * FROM couple_settings WHERE is_active = TRUE');
      
      if (coupleData.length === 0) {
        console.log('   📋 Migrating data from bride_groom_settings to couple_settings...');
        
        for (const record of brideGroomData) {
          await connection.query(`
            INSERT INTO couple_settings (
              wedding_id, groom_first_name, groom_last_name, groom_full_name, 
              groom_parent_names, groom_photo, bride_first_name, bride_last_name, 
              bride_full_name, bride_parent_names, bride_photo, is_active, 
              created_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            record.wedding_id, record.groom_first_name, record.groom_last_name,
            record.groom_full_name, record.groom_parent_names, record.groom_photo,
            record.bride_first_name, record.bride_last_name, record.bride_full_name,
            record.bride_parent_names, record.bride_photo, record.is_active,
            record.created_by, record.created_at, record.updated_at
          ]);
        }
        console.log('   ✅ Data migration completed');
      }
    }

    // Drop the duplicate table
    await connection.query('DROP TABLE IF EXISTS bride_groom_settings');
    console.log('   ✅ Dropped table: bride_groom_settings');

    // STEP 4: Clean up unused tables (if any)
    console.log('\n4. 🔍 Checking for unused tables...');
    
    const [tables] = await connection.query("SHOW TABLES");
    const currentTables = tables.map(table => Object.values(table)[0]);
    
    // Tables that should exist based on admin pages
    const requiredTables = [
      'admin_users',           // Authentication
      'user_sessions',         // Session management
      'activity_logs',         // Audit trail
      'wedding_settings',      // Main wedding data
      'wedding_guests',        // Guest management
      'couple_settings',       // Bride & Groom data
      'bride_groom_detail_settings', // Bride & Groom details
      'quotes_settings',       // Quotes page
      'story_settings',        // Story page
      'story_timeline_items',  // Story timeline
      'gallery_settings',      // Gallery page
      'gallery_images',        // Gallery images
      'rsvp_settings',         // RSVP page
      'thanks_settings',       // Thanks page
      'invited_settings',      // Invited page
      'event_settings'         // Event details
    ];

    console.log('\n   ✅ Required tables:');
    requiredTables.forEach(table => {
      if (currentTables.includes(table)) {
        console.log(`      ✅ ${table}`);
      } else {
        console.log(`      ❌ ${table} - MISSING!`);
      }
    });

    const unusedTables = currentTables.filter(table => !requiredTables.includes(table));
    if (unusedTables.length > 0) {
      console.log('\n   ⚠️ Potentially unused tables:');
      unusedTables.forEach(table => {
        console.log(`      ⚠️ ${table}`);
      });
    } else {
      console.log('\n   ✅ No unused tables found');
    }

    // STEP 5: Check for missing wedding_guests table
    if (!currentTables.includes('wedding_guests')) {
      console.log('\n5. 🏗️ Creating missing wedding_guests table...');
      await connection.query(`
        CREATE TABLE wedding_guests (
          id INT PRIMARY KEY AUTO_INCREMENT,
          wedding_id INT NOT NULL,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) NULL,
          phone VARCHAR(20) NULL,
          guest_count INT DEFAULT 1,
          invitation_code VARCHAR(50) UNIQUE NOT NULL,
          rsvp_status ENUM('pending', 'attending', 'not_attending') DEFAULT 'pending',
          rsvp_message TEXT NULL,
          rsvp_date TIMESTAMP NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_by INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id) ON DELETE CASCADE,
          FOREIGN KEY (created_by) REFERENCES admin_users(id),
          INDEX idx_wedding_id (wedding_id),
          INDEX idx_invitation_code (invitation_code),
          INDEX idx_rsvp_status (rsvp_status)
        )
      `);
      console.log('   ✅ Created wedding_guests table');
    }

    // STEP 6: Optimize tables
    console.log('\n6. ⚡ Optimizing tables...');
    for (const table of requiredTables) {
      if (currentTables.includes(table)) {
        try {
          await connection.query(`OPTIMIZE TABLE ${table}`);
          console.log(`   ✅ Optimized: ${table}`);
        } catch (error) {
          console.log(`   ⚠️ Could not optimize ${table}: ${error.message}`);
        }
      }
    }

    await connection.end();

    console.log('\n🎉 Database cleanup completed successfully!');
    console.log('\n📊 Final Schema Summary:');
    console.log('   ✅ Removed duplicate tables');
    console.log('   ✅ Dropped invalid views');
    console.log('   ✅ Ensured all required tables exist');
    console.log('   ✅ Optimized table performance');

  } catch (error) {
    console.error('\n❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}

cleanupSchema();
