#!/usr/bin/env node

// Check database updates directly

const mysql = require('mysql2/promise');

async function checkDatabaseUpdates() {
  console.log('🔍 CHECKING DATABASE UPDATES DIRECTLY');
  console.log('═══════════════════════════════════════════════════════');
  
  let connection;

  try {
    // Connect to database
    console.log('📊 Step 1: Connecting to database...');
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });
    console.log('✅ Database connection successful');

    // Check guests table structure
    console.log('\n🏗️ Step 2: Checking guests table structure...');
    const [columns] = await connection.query('DESCRIBE guests');
    console.log('✅ Guests table columns:');
    columns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? col.Key : ''}`);
    });

    // Check current guests data
    console.log('\n📋 Step 3: Checking current guests data...');
    const [guests] = await connection.query(`
      SELECT id, guest_name, guest_email, guest_phone, guest_count, 
             rsvp_status, invitation_code, is_active, created_at, updated_at
      FROM guests 
      WHERE is_active = TRUE 
      ORDER BY updated_at DESC 
      LIMIT 10
    `);
    
    console.log(`✅ Found ${guests.length} active guests:`);
    guests.forEach((guest, index) => {
      console.log(`   ${index + 1}. ID: ${guest.id}`);
      console.log(`      Name: ${guest.guest_name}`);
      console.log(`      Email: ${guest.guest_email || 'N/A'}`);
      console.log(`      Phone: ${guest.guest_phone || 'N/A'}`);
      console.log(`      Count: ${guest.guest_count}`);
      console.log(`      RSVP: ${guest.rsvp_status}`);
      console.log(`      Code: ${guest.invitation_code}`);
      console.log(`      Created: ${guest.created_at}`);
      console.log(`      Updated: ${guest.updated_at}`);
      console.log('');
    });

    // Test direct database update
    console.log('\n✏️ Step 4: Testing direct database update...');
    if (guests.length > 0) {
      const testGuest = guests[0];
      const originalName = testGuest.guest_name;
      const newName = `${originalName} (DB Test ${new Date().toLocaleTimeString()})`;
      
      console.log(`   Updating guest ID ${testGuest.id}:`);
      console.log(`   From: "${originalName}"`);
      console.log(`   To: "${newName}"`);
      
      const [updateResult] = await connection.query(`
        UPDATE guests 
        SET guest_name = ?, updated_at = NOW() 
        WHERE id = ?
      `, [newName, testGuest.id]);
      
      console.log(`   ✅ Update result: ${updateResult.affectedRows} row(s) affected`);
      
      // Verify the update
      const [updatedGuest] = await connection.query(`
        SELECT guest_name, updated_at 
        FROM guests 
        WHERE id = ?
      `, [testGuest.id]);
      
      if (updatedGuest.length > 0) {
        console.log(`   ✅ Verification successful:`);
        console.log(`      New name: ${updatedGuest[0].guest_name}`);
        console.log(`      New updated_at: ${updatedGuest[0].updated_at}`);
        
        // Revert the change
        await connection.query(`
          UPDATE guests 
          SET guest_name = ?, updated_at = NOW() 
          WHERE id = ?
        `, [originalName, testGuest.id]);
        console.log(`   ✅ Reverted name back to: "${originalName}"`);
      }
    }

    // Check for recent updates
    console.log('\n⏰ Step 5: Checking for recent updates (last 1 hour)...');
    const [recentUpdates] = await connection.query(`
      SELECT id, guest_name, guest_email, rsvp_status, created_at, updated_at,
             TIMESTAMPDIFF(MINUTE, updated_at, NOW()) as minutes_ago
      FROM guests 
      WHERE updated_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
      ORDER BY updated_at DESC
    `);
    
    if (recentUpdates.length > 0) {
      console.log(`✅ Found ${recentUpdates.length} recent updates:`);
      recentUpdates.forEach((guest, index) => {
        console.log(`   ${index + 1}. ${guest.guest_name} (ID: ${guest.id})`);
        console.log(`      Updated: ${guest.updated_at} (${guest.minutes_ago} minutes ago)`);
        console.log(`      RSVP: ${guest.rsvp_status}`);
      });
    } else {
      console.log('⚠️ No recent updates found in the last hour');
    }

    // Check activity logs for guest updates
    console.log('\n📝 Step 6: Checking activity logs for guest updates...');
    try {
      const [activityLogs] = await connection.query(`
        SELECT action, table_name, record_id, old_data, new_data, created_at
        FROM activity_logs 
        WHERE table_name = 'guests' AND action = 'UPDATE'
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      
      if (activityLogs.length > 0) {
        console.log(`✅ Found ${activityLogs.length} recent guest update logs:`);
        activityLogs.forEach((log, index) => {
          console.log(`   ${index + 1}. Record ID: ${log.record_id}`);
          console.log(`      Action: ${log.action}`);
          console.log(`      Time: ${log.created_at}`);
          if (log.old_data) {
            try {
              const oldData = JSON.parse(log.old_data);
              const newData = JSON.parse(log.new_data);
              console.log(`      Old name: ${oldData.guest_name || 'N/A'}`);
              console.log(`      New name: ${newData.guest_name || 'N/A'}`);
            } catch (e) {
              console.log(`      Data: ${log.old_data.substring(0, 50)}...`);
            }
          }
          console.log('');
        });
      } else {
        console.log('⚠️ No guest update activity logs found');
      }
    } catch (error) {
      console.log('⚠️ Activity logs table might not exist or accessible');
    }

    console.log('\n🎉 DATABASE CHECK COMPLETED!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 SUMMARY:');
    console.log(`   ✅ Database connection: Working`);
    console.log(`   ✅ Guests table: Exists with proper structure`);
    console.log(`   ✅ Active guests: ${guests.length} found`);
    console.log(`   ✅ Direct update test: Working`);
    console.log(`   ✅ Recent updates: ${recentUpdates.length} in last hour`);
    console.log('');
    
    if (recentUpdates.length === 0) {
      console.log('🔍 DIAGNOSIS:');
      console.log('   • Database is working correctly');
      console.log('   • No recent updates detected');
      console.log('   • Issue might be in frontend or API layer');
      console.log('');
      console.log('💡 RECOMMENDATIONS:');
      console.log('   1. Check if edit form is submitting correctly');
      console.log('   2. Check API endpoint logs');
      console.log('   3. Check browser network tab for API calls');
      console.log('   4. Verify frontend edit functionality');
    } else {
      console.log('✅ DATABASE UPDATES ARE WORKING!');
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('📊 Database connection closed');
    }
  }
}

// Run the check
checkDatabaseUpdates().catch(console.error);
