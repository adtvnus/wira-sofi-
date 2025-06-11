#!/usr/bin/env node

// Check bride and groom data in database

const mysql = require('mysql2/promise');

async function checkBrideGroomData() {
  console.log('🔍 CHECKING BRIDE & GROOM DATA');
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

    // Check wedding_settings table
    console.log('\n📋 Checking wedding_settings table...');
    const [weddingSettings] = await connection.query(`
      SELECT id, bride_first_name, bride_full_name, groom_first_name, groom_full_name, is_active
      FROM wedding_settings 
      ORDER BY updated_at DESC
      LIMIT 3
    `);

    if (weddingSettings.length > 0) {
      console.log(`✅ Found ${weddingSettings.length} wedding settings records:`);
      weddingSettings.forEach((record, index) => {
        console.log(`   ${index + 1}. ID: ${record.id} | Active: ${record.is_active}`);
        console.log(`      Bride: "${record.bride_first_name || 'NULL'}" | "${record.bride_full_name || 'NULL'}"`);
        console.log(`      Groom: "${record.groom_first_name || 'NULL'}" | "${record.groom_full_name || 'NULL'}"`);
      });
    } else {
      console.log('❌ No wedding_settings records found');
    }

    // Check bride_groom_management table
    console.log('\n📋 Checking bride_groom_management table...');
    const [brideGroomMgmt] = await connection.query(`
      SELECT id, bride_name, groom_name, is_active, created_at
      FROM bride_groom_management 
      ORDER BY updated_at DESC
      LIMIT 3
    `);

    if (brideGroomMgmt.length > 0) {
      console.log(`✅ Found ${brideGroomMgmt.length} bride-groom management records:`);
      brideGroomMgmt.forEach((record, index) => {
        console.log(`   ${index + 1}. ID: ${record.id} | Active: ${record.is_active}`);
        console.log(`      Bride: "${record.bride_name || 'NULL'}"`);
        console.log(`      Groom: "${record.groom_name || 'NULL'}"`);
        console.log(`      Created: ${record.created_at}`);
      });
    } else {
      console.log('❌ No bride_groom_management records found');
    }

    // Insert sample data if no data exists
    if (weddingSettings.length === 0) {
      console.log('\n➕ Creating sample wedding settings data...');
      await connection.query(`
        INSERT INTO wedding_settings (
          bride_first_name, bride_full_name, bride_parents,
          groom_first_name, groom_full_name, groom_parents,
          wedding_date, wedding_venue, is_active
        ) VALUES (
          'Sofi', 'Sofi Rahmawati', 'Bapak & Ibu Rahmawati',
          'Wira', 'Wira Pratama', 'Bapak & Ibu Pratama',
          '2024-12-25', 'Gedung Pernikahan', TRUE
        )
      `);
      console.log('✅ Sample wedding settings created');
    }

    if (brideGroomMgmt.length === 0) {
      console.log('\n➕ Creating sample bride-groom management data...');
      await connection.query(`
        INSERT INTO bride_groom_management (
          bride_name, groom_name, bride_parents, groom_parents,
          wedding_date, wedding_venue, is_active
        ) VALUES (
          'Sofi Rahmawati', 'Wira Pratama', 
          'Bapak & Ibu Rahmawati', 'Bapak & Ibu Pratama',
          '2024-12-25', 'Gedung Pernikahan', TRUE
        )
      `);
      console.log('✅ Sample bride-groom management created');
    }

    // Final check
    console.log('\n🔍 Final verification...');
    const [finalCheck] = await connection.query(`
      SELECT bride_first_name, groom_first_name 
      FROM wedding_settings 
      WHERE is_active = TRUE 
      ORDER BY updated_at DESC 
      LIMIT 1
    `);

    if (finalCheck.length > 0) {
      const data = finalCheck[0];
      console.log('✅ Active wedding settings found:');
      console.log(`   Bride First Name: "${data.bride_first_name || 'NULL'}"`);
      console.log(`   Groom First Name: "${data.groom_first_name || 'NULL'}"`);
      
      if (data.bride_first_name && data.groom_first_name) {
        console.log('\n🎉 BRIDE & GROOM NAMES ARE IN DATABASE!');
        console.log('');
        console.log('💡 If names not showing in frontend:');
        console.log('   1. Check frontend WeddingContext loading');
        console.log('   2. Hard refresh browser (Ctrl+F5)');
        console.log('   3. Check browser console for errors');
        console.log('   4. Check API endpoint /api/wedding-settings');
      } else {
        console.log('\n⚠️ Names exist but some are empty');
      }
    } else {
      console.log('❌ No active wedding settings found');
    }

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
checkBrideGroomData().catch(console.error);
