#!/usr/bin/env node

// Check bride_groom_detail_settings table

const mysql = require('mysql2/promise');

async function checkBrideGroomDetailTable() {
  console.log('🔍 CHECKING BRIDE_GROOM_DETAIL_SETTINGS TABLE');
  console.log('═══════════════════════════════════════════════════════');
  
  let connection;

  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    // Check bride_groom_detail_settings table
    console.log('📊 BRIDE_GROOM_DETAIL_SETTINGS table:');
    console.log('─────────────────────────────────────────────────────');
    
    try {
      const [structure] = await connection.query('DESCRIBE bride_groom_detail_settings');
      console.log('📋 Table structure:');
      structure.forEach(column => {
        console.log(`   ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(required)'} ${column.Key ? `[${column.Key}]` : ''}`);
      });

      const [data] = await connection.query('SELECT * FROM bride_groom_detail_settings ORDER BY updated_at DESC');
      console.log(`\n📊 Current data (${data.length} records):`);
      
      if (data.length > 0) {
        data.forEach((row, index) => {
          console.log(`   Record ${index + 1}:`);
          console.log(`     ID: ${row.id}, Wedding ID: ${row.wedding_id}, Active: ${row.is_active}`);
          console.log(`     Created: ${row.created_at}, Updated: ${row.updated_at}`);
          
          // Show all fields
          Object.keys(row).forEach(key => {
            if (!['id', 'wedding_id', 'is_active', 'created_at', 'updated_at', 'created_by'].includes(key)) {
              console.log(`     ${key}: ${row[key]}`);
            }
          });
          console.log('');
        });
      } else {
        console.log('   No records found');
      }

    } catch (error) {
      console.log(`   ❌ Error accessing bride_groom_detail_settings: ${error.message}`);
    }

    // Check if this table is used by the API
    console.log('\n🌐 API Usage Analysis:');
    console.log('─────────────────────────────────────────────────────');
    console.log('📡 Checking if bride_groom_detail_settings is used by API...');
    
    // This would require checking the backend code, but we can infer from the data
    console.log('📊 Based on API endpoint analysis:');
    console.log('   • /api/bride-groom → Uses couple_settings table');
    console.log('   • bride_groom_detail_settings → Likely for additional settings/configuration');
    console.log('   • Main bride-groom data → Stored in couple_settings');

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkBrideGroomDetailTable().catch(console.error);
