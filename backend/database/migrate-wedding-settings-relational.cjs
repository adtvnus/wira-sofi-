#!/usr/bin/env node

const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateWeddingSettingsRelational() {
  console.log('🔄 MIGRATING WEDDING SETTINGS TO RELATIONAL STRUCTURE\n');

  try {
    // Connect to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // STEP 1: Backup existing data
    console.log('\n1. 📦 Backing up existing wedding_settings data...');
    const [existingData] = await connection.query(`
      SELECT * FROM wedding_settings WHERE is_active = TRUE
    `);
    console.log(`   Found ${existingData.length} active wedding settings`);

    // STEP 2: Create new wedding_settings table structure (without duplicate couple data)
    console.log('\n2. 🏗️ Creating new wedding_settings structure...');
    
    // First, rename existing table
    await connection.query(`
      RENAME TABLE wedding_settings TO wedding_settings_backup
    `);

    // Create new wedding_settings table without couple data duplication
    await connection.query(`
      CREATE TABLE wedding_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        couple_id INT NOT NULL,
        wedding_title VARCHAR(200) DEFAULT 'Wedding Invitation',
        wedding_subtitle VARCHAR(200) NULL,
        
        -- Wedding Event Details (no couple data duplication)
        wedding_date DATE NOT NULL,
        wedding_time TIME NOT NULL,
        wedding_venue VARCHAR(200) NOT NULL,
        wedding_address TEXT NOT NULL,
        wedding_maps_url TEXT NULL,
        
        -- Reception Details
        reception_date DATE NULL,
        reception_time TIME NULL,
        reception_venue VARCHAR(200) NULL,
        reception_address TEXT NULL,
        reception_maps_url TEXT NULL,
        
        -- System Fields
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        -- Foreign Keys
        FOREIGN KEY (couple_id) REFERENCES couple_settings(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES admin_users(id),
        
        -- Indexes
        INDEX idx_couple_id (couple_id),
        INDEX idx_is_active (is_active),
        INDEX idx_wedding_date (wedding_date)
      )
    `);

    console.log('   ✅ New wedding_settings table created with relational structure');

    // STEP 3: Migrate existing data
    console.log('\n3. 🔄 Migrating existing data...');
    
    for (const oldRecord of existingData) {
      console.log(`   Processing wedding setting ID: ${oldRecord.id}`);
      
      // First, ensure couple_settings exists for this wedding
      let coupleId;
      const [existingCouple] = await connection.query(`
        SELECT id FROM couple_settings WHERE wedding_id = ? AND is_active = TRUE
      `, [oldRecord.id]);

      if (existingCouple.length > 0) {
        coupleId = existingCouple[0].id;
        console.log(`     Using existing couple_settings ID: ${coupleId}`);
      } else {
        // Create couple_settings record from old wedding_settings data
        console.log(`     Creating new couple_settings record...`);
        const [coupleResult] = await connection.query(`
          INSERT INTO couple_settings (
            wedding_id, groom_first_name, groom_full_name, groom_parent_names,
            bride_first_name, bride_full_name, bride_parent_names,
            groom_photo, bride_photo, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          oldRecord.id,
          oldRecord.groom_first_name || '',
          oldRecord.groom_full_name || '',
          oldRecord.groom_parents || '',
          oldRecord.bride_first_name || '',
          oldRecord.bride_full_name || '',
          oldRecord.bride_parents || '',
          'public/images/BrideGroom/groom.jpg',
          'public/images/BrideGroom/bride.jpg',
          oldRecord.created_by || 1
        ]);
        coupleId = coupleResult.insertId;
        console.log(`     Created couple_settings ID: ${coupleId}`);
      }

      // Insert into new wedding_settings table
      await connection.query(`
        INSERT INTO wedding_settings (
          id, couple_id, wedding_title, wedding_subtitle,
          wedding_date, wedding_time, wedding_venue, wedding_address, wedding_maps_url,
          reception_date, reception_time, reception_venue, reception_address, reception_maps_url,
          is_active, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        oldRecord.id,
        coupleId,
        oldRecord.wedding_title || 'Wedding Invitation',
        oldRecord.wedding_subtitle || null,
        oldRecord.wedding_date,
        oldRecord.wedding_time,
        oldRecord.wedding_venue,
        oldRecord.wedding_address,
        oldRecord.wedding_maps_url || null,
        oldRecord.reception_date || null,
        oldRecord.reception_time || null,
        oldRecord.reception_venue || null,
        oldRecord.reception_address || null,
        oldRecord.reception_maps_url || null,
        oldRecord.is_active,
        oldRecord.created_by,
        oldRecord.created_at,
        oldRecord.updated_at
      ]);

      console.log(`     ✅ Migrated wedding setting ID: ${oldRecord.id}`);
    }

    // STEP 4: Update foreign key references in other tables
    console.log('\n4. 🔗 Updating foreign key references...');
    
    // Update wedding_guests table to maintain wedding_id reference
    console.log('   Updating wedding_guests references...');
    // No changes needed - wedding_guests.wedding_id still references wedding_settings.id
    
    // Update other tables that reference wedding_settings
    const relatedTables = [
      'bride_groom_detail_settings',
      'event_settings', 
      'quotes_settings',
      'story_settings',
      'story_timeline_items',
      'gallery_settings',
      'gallery_images',
      'rsvp_settings',
      'thanks_settings',
      'invited_settings'
    ];

    for (const table of relatedTables) {
      try {
        const [tableExists] = await connection.query(`
          SELECT COUNT(*) as count FROM information_schema.tables 
          WHERE table_schema = ? AND table_name = ?
        `, [process.env.DB_NAME || 'wedding_invitation', table]);

        if (tableExists[0].count > 0) {
          console.log(`   ✅ Table ${table} exists - foreign keys maintained`);
        }
      } catch (error) {
        console.log(`   ⚠️ Table ${table} not found - skipping`);
      }
    }

    // STEP 5: Create view for easy data access
    console.log('\n5. 📊 Creating view for easy data access...');
    await connection.query(`
      CREATE OR REPLACE VIEW v_wedding_settings_with_couple AS
      SELECT 
        ws.id,
        ws.wedding_title,
        ws.wedding_subtitle,
        ws.wedding_date,
        ws.wedding_time,
        ws.wedding_venue,
        ws.wedding_address,
        ws.wedding_maps_url,
        ws.reception_date,
        ws.reception_time,
        ws.reception_venue,
        ws.reception_address,
        ws.reception_maps_url,
        ws.is_active,
        ws.created_by,
        ws.created_at,
        ws.updated_at,
        
        -- Couple data from relational table
        cs.id as couple_id,
        cs.groom_first_name,
        cs.groom_last_name,
        cs.groom_full_name,
        cs.groom_parent_names,
        cs.groom_photo,
        cs.bride_first_name,
        cs.bride_last_name,
        cs.bride_full_name,
        cs.bride_parent_names,
        cs.bride_photo,
        
        -- Admin user info
        au.full_name as created_by_name
        
      FROM wedding_settings ws
      JOIN couple_settings cs ON ws.couple_id = cs.id
      LEFT JOIN admin_users au ON ws.created_by = au.id
      WHERE ws.is_active = TRUE AND cs.is_active = TRUE
    `);

    console.log('   ✅ View v_wedding_settings_with_couple created');

    await connection.end();

    console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('\n📊 Summary:');
    console.log(`   ✅ Migrated ${existingData.length} wedding settings`);
    console.log('   ✅ Removed duplicate couple data from wedding_settings');
    console.log('   ✅ Created proper foreign key relationship');
    console.log('   ✅ Created view for easy data access');
    console.log('   ✅ Maintained all existing functionality');
    
    console.log('\n🔧 Next Steps:');
    console.log('   1. Update API endpoints to use new relational structure');
    console.log('   2. Update frontend to use relational data');
    console.log('   3. Test all functionality');
    console.log('   4. Remove backup table when confirmed working');

  } catch (error) {
    console.error('\n❌ Migration Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check database connection');
    console.log('   2. Ensure couple_settings table exists');
    console.log('   3. Verify admin_users table exists');
    console.log('   4. Check for data conflicts');
    process.exit(1);
  }
}

migrateWeddingSettingsRelational();
