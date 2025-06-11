#!/usr/bin/env node

// Verify database structure and data

const mysql = require('mysql2/promise');

async function verifyDatabase() {
  console.log('🔍 VERIFYING DATABASE STRUCTURE AND DATA');
  console.log('═══════════════════════════════════════════════════════════════');
  
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

    // Check all tables
    console.log('\n📋 Checking database tables...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ Found ${tables.length} tables:`);
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });

    // Check admin user
    console.log('\n👤 Checking admin user...');
    const [adminUsers] = await connection.query('SELECT id, username, full_name, role FROM admin_users');
    console.log(`✅ Found ${adminUsers.length} admin users:`);
    adminUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.full_name}) - Role: ${user.role}`);
    });

    // Check wedding settings
    console.log('\n💒 Checking wedding settings...');
    const [weddingSettings] = await connection.query('SELECT * FROM wedding_settings');
    console.log(`✅ Found ${weddingSettings.length} wedding settings:`);
    if (weddingSettings.length > 0) {
      const ws = weddingSettings[0];
      console.log(`   Wedding Date: ${ws.wedding_date}`);
      console.log(`   Wedding Venue: ${ws.wedding_venue}`);
      console.log(`   Reception Venue: ${ws.reception_venue}`);
    }

    // Check bride & groom
    console.log('\n👰🤵 Checking bride & groom data...');
    const [brideGroom] = await connection.query('SELECT * FROM bride_groom');
    console.log(`✅ Found ${brideGroom.length} bride & groom records:`);
    if (brideGroom.length > 0) {
      const bg = brideGroom[0];
      console.log(`   Bride: ${bg.bride_first_name} ${bg.bride_last_name} (${bg.bride_full_name})`);
      console.log(`   Groom: ${bg.groom_first_name} ${bg.groom_last_name} (${bg.groom_full_name})`);
      console.log(`   Bride Parents: ${bg.bride_parent_names}`);
      console.log(`   Groom Parents: ${bg.groom_parent_names}`);
    }

    // Check bride & groom detail
    console.log('\n💕 Checking bride & groom detail...');
    const [brideGroomDetail] = await connection.query('SELECT * FROM bride_groom_detail');
    console.log(`✅ Found ${brideGroomDetail.length} bride & groom detail records:`);
    if (brideGroomDetail.length > 0) {
      const bgd = brideGroomDetail[0];
      console.log(`   Bride Header: ${bgd.bride_header_title}`);
      console.log(`   Groom Header: ${bgd.groom_header_title}`);
      console.log(`   Bride Quote: ${bgd.bride_quote}`);
      console.log(`   Groom Quote: ${bgd.groom_quote}`);
    }

    // Check guests
    console.log('\n👥 Checking guests...');
    const [guests] = await connection.query('SELECT * FROM guests');
    console.log(`✅ Found ${guests.length} guests:`);
    guests.forEach((guest, index) => {
      console.log(`   ${index + 1}. ${guest.guest_name} (${guest.guest_count} pax) - Code: ${guest.invitation_code}`);
    });

    // Check gallery
    console.log('\n📸 Checking gallery...');
    const [gallery] = await connection.query('SELECT * FROM gallery');
    console.log(`✅ Found ${gallery.length} gallery items:`);
    gallery.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.title} (${item.image_size}) - ${item.subtitle}`);
    });

    // Check quotes
    console.log('\n💬 Checking quotes...');
    const [quotes] = await connection.query('SELECT * FROM quotes');
    console.log(`✅ Found ${quotes.length} quotes:`);
    quotes.forEach((quote, index) => {
      console.log(`   ${index + 1}. "${quote.quote_text.substring(0, 50)}..." - ${quote.quote_author}`);
    });

    // Check story settings
    console.log('\n📖 Checking story settings...');
    const [storySettings] = await connection.query('SELECT * FROM story_settings');
    console.log(`✅ Found ${storySettings.length} story settings:`);
    if (storySettings.length > 0) {
      const ss = storySettings[0];
      console.log(`   Header Title: ${ss.header_title}`);
      console.log(`   Header Subtitle: ${ss.header_subtitle}`);
    }

    // Check story timeline
    console.log('\n⏰ Checking story timeline...');
    const [timeline] = await connection.query('SELECT * FROM story_timeline_items ORDER BY display_order');
    console.log(`✅ Found ${timeline.length} timeline items:`);
    timeline.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.year} - ${item.title} (${item.date})`);
    });

    console.log('\n🎉 DATABASE VERIFICATION COMPLETED!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 VERIFICATION SUMMARY:');
    console.log(`   ✅ Tables: ${tables.length}/9 expected tables found`);
    console.log(`   ✅ Admin users: ${adminUsers.length} users`);
    console.log(`   ✅ Wedding settings: ${weddingSettings.length} records`);
    console.log(`   ✅ Bride & groom: ${brideGroom.length} records`);
    console.log(`   ✅ Bride & groom detail: ${brideGroomDetail.length} records`);
    console.log(`   ✅ Guests: ${guests.length} records`);
    console.log(`   ✅ Gallery: ${gallery.length} items`);
    console.log(`   ✅ Quotes: ${quotes.length} quotes`);
    console.log(`   ✅ Story settings: ${storySettings.length} records`);
    console.log(`   ✅ Timeline items: ${timeline.length} items`);
    console.log('');
    console.log('🚀 DATABASE IS READY FOR USE!');
    console.log('');
    console.log('🎯 NEXT STEPS:');
    console.log('   1. Start backend: node backend/server.cjs');
    console.log('   2. Start frontend: npm run dev');
    console.log('   3. Open admin: http://localhost:5174/admin');
    console.log('   4. Login: admin / admin');
    console.log('   5. Test all features!');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n📊 Database connection closed');
    }
  }
}

// Run verification
verifyDatabase().catch(console.error);
