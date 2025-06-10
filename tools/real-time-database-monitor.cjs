#!/usr/bin/env node

// Real-time database monitor to verify auto-update functionality

const mysql = require('mysql2/promise');

async function monitorDatabase() {
  console.log('🔍 REAL-TIME DATABASE MONITOR');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 Monitoring couple_settings table for changes...');
  console.log('🕐 Press Ctrl+C to stop monitoring\n');

  let connection;
  let lastUpdateTime = null;
  let lastData = null;

  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    // Get initial data
    const [initialData] = await connection.query(`
      SELECT * FROM couple_settings WHERE wedding_id = 1 AND is_active = TRUE
    `);

    if (initialData.length > 0) {
      lastData = initialData[0];
      lastUpdateTime = lastData.updated_at;

      console.log('📋 INITIAL DATA:');
      console.log(`   Groom: ${lastData.groom_first_name} ${lastData.groom_last_name}`);
      console.log(`   Bride: ${lastData.bride_first_name} ${lastData.bride_last_name}`);
      console.log(`   Groom Parents: ${lastData.groom_parent_names}`);
      console.log(`   Bride Parents: ${lastData.bride_parent_names}`);
      console.log(`   Last Updated: ${lastData.updated_at}`);
      console.log('');
    }

    console.log('🎯 INSTRUCTIONS:');
    console.log('1. Open: http://localhost:5175/admin/bride-groom-management');
    console.log('2. Login with: admin / admin');
    console.log('3. Change any names in the form');
    console.log('4. Click "Save Changes"');
    console.log('5. Watch this monitor for real-time database changes');
    console.log('');
    console.log('⏳ Waiting for changes...\n');

    // Monitor every 1 second
    const monitorInterval = setInterval(async () => {
      try {
        const [currentData] = await connection.query(`
          SELECT * FROM couple_settings WHERE wedding_id = 1 AND is_active = TRUE
        `);

        if (currentData.length > 0) {
          const current = currentData[0];

          // Check if data has changed
          if (current.updated_at.getTime() !== lastUpdateTime?.getTime()) {
            const now = new Date().toLocaleTimeString();

            console.log(`🔄 [${now}] DATABASE CHANGE DETECTED!`);
            console.log('─────────────────────────────────────────────────────');

            if (lastData) {
              console.log('📊 BEFORE:');
              console.log(`   Groom: ${lastData.groom_first_name} ${lastData.groom_last_name}`);
              console.log(`   Bride: ${lastData.bride_first_name} ${lastData.bride_last_name}`);
              console.log(`   Groom Parents: ${lastData.groom_parent_names}`);
              console.log(`   Bride Parents: ${lastData.bride_parent_names}`);
              console.log(`   Updated: ${lastData.updated_at}`);
              console.log('');
            }

            console.log('📊 AFTER:');
            console.log(`   Groom: ${current.groom_first_name} ${current.groom_last_name}`);
            console.log(`   Bride: ${current.bride_first_name} ${current.bride_last_name}`);
            console.log(`   Groom Parents: ${current.groom_parent_names}`);
            console.log(`   Bride Parents: ${current.bride_parent_names}`);
            console.log(`   Updated: ${current.updated_at}`);

            // Check what changed
            const changes = [];
            if (lastData) {
              if (lastData.groom_first_name !== current.groom_first_name) {
                changes.push(`Groom First Name: "${lastData.groom_first_name}" → "${current.groom_first_name}"`);
              }
              if (lastData.groom_last_name !== current.groom_last_name) {
                changes.push(`Groom Last Name: "${lastData.groom_last_name}" → "${current.groom_last_name}"`);
              }
              if (lastData.bride_first_name !== current.bride_first_name) {
                changes.push(`Bride First Name: "${lastData.bride_first_name}" → "${current.bride_first_name}"`);
              }
              if (lastData.bride_last_name !== current.bride_last_name) {
                changes.push(`Bride Last Name: "${lastData.bride_last_name}" → "${current.bride_last_name}"`);
              }
              if (lastData.groom_parent_names !== current.groom_parent_names) {
                changes.push(`Groom Parents: "${lastData.groom_parent_names}" → "${current.groom_parent_names}"`);
              }
              if (lastData.bride_parent_names !== current.bride_parent_names) {
                changes.push(`Bride Parents: "${lastData.bride_parent_names}" → "${current.bride_parent_names}"`);
              }
            }

            if (changes.length > 0) {
              console.log('\n🔄 CHANGES DETECTED:');
              changes.forEach(change => console.log(`   • ${change}`));
            }

            console.log('\n✅ CONFIRMED: Database auto-updated successfully!');
            console.log('═══════════════════════════════════════════════════════\n');

            // Update tracking variables
            lastData = current;
            lastUpdateTime = current.updated_at;
          }
        }
      } catch (error) {
        console.error('❌ Monitor error:', error.message);
      }
    }, 1000); // Check every 1 second

    // Handle Ctrl+C gracefully
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Stopping monitor...');
      clearInterval(monitorInterval);
      if (connection) {
        await connection.end();
      }
      console.log('✅ Monitor stopped');
      process.exit(0);
    });

    // Keep the process running
    await new Promise(() => {}); // Run indefinitely

  } catch (error) {
    console.error('❌ Monitor failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the monitor
monitorDatabase().catch(console.error);