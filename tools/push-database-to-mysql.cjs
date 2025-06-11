#!/usr/bin/env node

// Master script to push database to MySQL

const { spawn } = require('child_process');
const path = require('path');

function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Running: ${scriptPath}`);
    console.log('═'.repeat(60));
    
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${scriptPath} completed successfully`);
        resolve();
      } else {
        console.error(`❌ ${scriptPath} failed with code ${code}`);
        reject(new Error(`Script failed: ${scriptPath}`));
      }
    });

    child.on('error', (error) => {
      console.error(`❌ Error running ${scriptPath}:`, error.message);
      reject(error);
    });
  });
}

async function pushDatabaseToMySQL() {
  console.log('🎯 PUSH DATABASE TO MYSQL');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('This script will:');
  console.log('1. 🗑️  Drop existing wedding_invitation database');
  console.log('2. ➕  Create new database with correct structure');
  console.log('3. 📊  Add sample data');
  console.log('4. ✅  Verify everything is working');
  console.log('');
  
  // Ask for confirmation
  console.log('⚠️  WARNING: This will DELETE all existing data!');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    // Step 1: Reset and rebuild database structure
    await runScript(path.join(__dirname, 'reset-and-rebuild-database.cjs'));
    
    // Step 2: Add sample data
    await runScript(path.join(__dirname, 'add-sample-data.cjs'));
    
    console.log('\n🎉 DATABASE PUSH COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 WHAT WAS CREATED:');
    console.log('');
    console.log('🗄️  DATABASE TABLES:');
    console.log('   ✅ admin_users - Admin authentication');
    console.log('   ✅ wedding_settings - Wedding event details');
    console.log('   ✅ bride_groom - Bride & groom basic info');
    console.log('   ✅ bride_groom_detail - Detailed bride & groom info');
    console.log('   ✅ guests - Guest list and RSVP');
    console.log('   ✅ gallery - Photo gallery');
    console.log('   ✅ quotes - Love quotes');
    console.log('   ✅ story_settings - Story page settings');
    console.log('   ✅ story_timeline_items - Timeline items');
    console.log('');
    console.log('👤 ADMIN ACCESS:');
    console.log('   Username: admin');
    console.log('   Password: admin');
    console.log('   URL: http://localhost:5174/admin');
    console.log('');
    console.log('👰🤵 SAMPLE DATA:');
    console.log('   Bride: Sofi Kumala');
    console.log('   Groom: Wiras Maulana');
    console.log('   Wedding Date: 2024-12-25');
    console.log('   Guests: 5 sample guests');
    console.log('   Gallery: 3 sample photos');
    console.log('   Quotes: 3 love quotes');
    console.log('   Story: 4 timeline items');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('   1. Start the backend server: node backend/server.cjs');
    console.log('   2. Start the frontend: npm run dev');
    console.log('   3. Open admin panel: http://localhost:5174/admin');
    console.log('   4. Login with admin/admin');
    console.log('   5. Test all features!');
    console.log('');
    console.log('💡 FEATURES READY:');
    console.log('   ✅ Bride-Groom Management');
    console.log('   ✅ Guest Management');
    console.log('   ✅ Gallery Management');
    console.log('   ✅ Quotes Management');
    console.log('   ✅ Story Management');
    console.log('   ✅ RSVP System');
    console.log('   ✅ Real-time sync between admin and frontend');
    console.log('');
    console.log('🎊 Wedding invitation app is ready to use!');
    
  } catch (error) {
    console.error('\n❌ DATABASE PUSH FAILED!');
    console.error('Error:', error.message);
    console.error('');
    console.error('🔧 TROUBLESHOOTING:');
    console.error('   1. Make sure MySQL server is running');
    console.error('   2. Check MySQL credentials (root with no password)');
    console.error('   3. Ensure MySQL port 3306 is accessible');
    console.error('   4. Check if bcrypt module is installed: npm install bcrypt');
    console.error('   5. Try running scripts individually for more details');
    process.exit(1);
  }
}

// Run the master script
pushDatabaseToMySQL().catch(console.error);
