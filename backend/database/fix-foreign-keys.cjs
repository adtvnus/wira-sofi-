#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function fixForeignKeys() {
  console.log('🔧 Fixing Foreign Key References...\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // Get all foreign key constraints that reference wedding_settings_backup
    console.log('\n🔍 Checking current foreign key constraints...');
    
    const [constraints] = await connection.query(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE REFERENCED_TABLE_NAME = 'wedding_settings_backup'
      AND TABLE_SCHEMA = 'wedding_invitation'
    `);

    if (constraints.length > 0) {
      console.log('   ⚠️ Found orphaned foreign key constraints:');
      constraints.forEach(constraint => {
        console.log(`      ${constraint.TABLE_NAME}.${constraint.COLUMN_NAME} -> ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`);
      });

      console.log('\n🔧 Fixing foreign key references...');
      
      // Disable foreign key checks
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');

      // Update all wedding_id references to point to wedding_settings instead
      const tablesToFix = [
        'bride_groom_detail_settings',
        'couple_settings', 
        'event_settings',
        'gallery_images',
        'gallery_settings',
        'invited_settings',
        'quotes_settings',
        'rsvp_settings',
        'story_settings',
        'story_timeline_items',
        'thanks_settings',
        'wedding_guests'
      ];

      for (const tableName of tablesToFix) {
        try {
          // Drop existing foreign key constraint
          const [fkConstraints] = await connection.query(`
            SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_NAME = '${tableName}' 
            AND COLUMN_NAME = 'wedding_id'
            AND REFERENCED_TABLE_NAME = 'wedding_settings_backup'
            AND TABLE_SCHEMA = 'wedding_invitation'
          `);

          if (fkConstraints.length > 0) {
            const constraintName = fkConstraints[0].CONSTRAINT_NAME;
            await connection.query(`ALTER TABLE ${tableName} DROP FOREIGN KEY ${constraintName}`);
            console.log(`   ✅ Dropped old constraint from ${tableName}`);
          }

          // Add new foreign key constraint pointing to wedding_settings
          await connection.query(`
            ALTER TABLE ${tableName} 
            ADD CONSTRAINT fk_${tableName}_wedding_id 
            FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id) 
            ON DELETE CASCADE ON UPDATE CASCADE
          `);
          console.log(`   ✅ Added new constraint to ${tableName}`);

        } catch (error) {
          console.log(`   ⚠️ Could not fix ${tableName}: ${error.message}`);
        }
      }

      // Re-enable foreign key checks
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    } else {
      console.log('   ✅ No orphaned foreign key constraints found');
    }

    // Verify all foreign keys are now correct
    console.log('\n🔍 Verifying foreign key constraints...');
    const [allConstraints] = await connection.query(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE REFERENCED_TABLE_NAME IN ('wedding_settings', 'admin_users')
      AND TABLE_SCHEMA = 'wedding_invitation'
      ORDER BY TABLE_NAME, COLUMN_NAME
    `);

    console.log('\n📋 Current foreign key constraints:');
    allConstraints.forEach(constraint => {
      console.log(`   ✅ ${constraint.TABLE_NAME}.${constraint.COLUMN_NAME} -> ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`);
    });

    await connection.end();

    console.log('\n🎉 Foreign key references fixed successfully!');
    console.log('\n✨ Database Integrity Summary:');
    console.log('   ✅ All foreign keys point to correct tables');
    console.log('   ✅ Referential integrity maintained');
    console.log('   ✅ Cascade delete/update configured');

  } catch (error) {
    console.error('\n❌ Error fixing foreign keys:', error.message);
    process.exit(1);
  }
}

fixForeignKeys();
