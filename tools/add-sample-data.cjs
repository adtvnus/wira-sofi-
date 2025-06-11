#!/usr/bin/env node

// Add sample data to the database

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function addSampleData() {
  console.log('📊 ADDING SAMPLE DATA TO DATABASE');
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

    // Step 1: Add admin user
    console.log('\n👤 Step 1: Adding admin user...');
    const hashedPassword = await bcrypt.hash('admin', 10);
    await connection.query(`
      INSERT INTO admin_users (username, password, full_name, email, role)
      VALUES ('admin', ?, 'Administrator', 'admin@wedding.com', 'admin')
    `, [hashedPassword]);
    console.log('✅ Admin user created (username: admin, password: admin)');

    // Step 2: Add wedding settings
    console.log('\n💒 Step 2: Adding wedding settings...');
    await connection.query(`
      INSERT INTO wedding_settings (
        wedding_date, wedding_time, wedding_venue, wedding_address, wedding_maps_url,
        reception_date, reception_time, reception_venue, reception_address, reception_maps_url,
        created_by
      ) VALUES (
        '2024-12-25', '10:00:00', 'Gedung Pernikahan Indah', 'Jl. Cinta Sejati No. 123, Jakarta', 'https://maps.google.com/wedding',
        '2024-12-25', '18:00:00', 'Ballroom Hotel Mewah', 'Jl. Bahagia No. 456, Jakarta', 'https://maps.google.com/reception',
        1
      )
    `);
    console.log('✅ Wedding settings added');

    // Step 3: Add bride & groom data
    console.log('\n👰🤵 Step 3: Adding bride & groom data...');
    await connection.query(`
      INSERT INTO bride_groom (
        wedding_id, groom_first_name, groom_last_name, groom_full_name, groom_parent_names,
        bride_first_name, bride_last_name, bride_full_name, bride_parent_names,
        created_by
      ) VALUES (
        1, 'Wiras', 'Maulana', 'Wiras Maulana', 'Bapak Ahmad & Ibu Siti',
        'Sofi', 'Kumala', 'Sofi Kumala', 'Bapak Budi & Ibu Rina',
        1
      )
    `);
    console.log('✅ Bride & groom data added');

    // Step 4: Add bride & groom detail
    console.log('\n💕 Step 4: Adding bride & groom detail...');
    await connection.query(`
      INSERT INTO bride_groom_detail (
        wedding_id, bride_header_title, bride_header_subtitle, bride_father_name, bride_mother_name, bride_quote,
        groom_header_title, groom_header_subtitle, groom_father_name, groom_mother_name, groom_quote,
        created_by
      ) VALUES (
        1, 'The Bride', 'Putri cantik yang penuh kasih sayang', 'Budi Santoso', 'Rina Kumala', 'Cinta adalah kebahagiaan yang paling indah',
        'The Groom', 'Putra yang bertanggung jawab dan penyayang', 'Ahmad Maulana', 'Siti Nurhaliza', 'Bersamamu, hidup terasa sempurna',
        1
      )
    `);
    console.log('✅ Bride & groom detail added');

    // Step 5: Add sample guests
    console.log('\n👥 Step 5: Adding sample guests...');
    const guests = [
      { name: 'Keluarga Besar Santoso', email: 'santoso@email.com', phone: '081234567890', count: 4 },
      { name: 'Keluarga Besar Maulana', email: 'maulana@email.com', phone: '081234567891', count: 5 },
      { name: 'Teman Kuliah Sofi', email: 'teman.sofi@email.com', phone: '081234567892', count: 2 },
      { name: 'Teman Kerja Wiras', email: 'teman.wiras@email.com', phone: '081234567893', count: 3 },
      { name: 'Sahabat Dekat', email: 'sahabat@email.com', phone: '081234567894', count: 2 }
    ];

    for (let i = 0; i < guests.length; i++) {
      const guest = guests[i];
      const invitationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      await connection.query(`
        INSERT INTO guests (wedding_id, guest_name, guest_email, guest_phone, invitation_code, guest_count, created_by)
        VALUES (1, ?, ?, ?, ?, ?, 1)
      `, [guest.name, guest.email, guest.phone, invitationCode, guest.count]);
    }
    console.log(`✅ ${guests.length} sample guests added`);

    // Step 6: Add sample gallery
    console.log('\n📸 Step 6: Adding sample gallery...');
    const galleryItems = [
      { title: 'Pre-Wedding Shoot', subtitle: 'Momen romantis sebelum hari bahagia', quote: 'Cinta yang tulus selalu indah', path: 'public/images/GalleryDatabase/prewedding1.jpg', size: 'L' },
      { title: 'Engagement', subtitle: 'Saat janji suci diucapkan', quote: 'Bersamamu adalah kebahagiaan', path: 'public/images/GalleryDatabase/engagement1.jpg', size: 'S' },
      { title: 'Family Moment', subtitle: 'Kebahagiaan bersama keluarga', quote: 'Keluarga adalah segalanya', path: 'public/images/GalleryDatabase/family1.jpg', size: 'L' }
    ];

    for (let i = 0; i < galleryItems.length; i++) {
      const item = galleryItems[i];
      await connection.query(`
        INSERT INTO gallery (wedding_id, title, subtitle, quote_bottom, image_path, image_size, display_order, created_by)
        VALUES (1, ?, ?, ?, ?, ?, ?, 1)
      `, [item.title, item.subtitle, item.quote, item.path, item.size, i + 1]);
    }
    console.log(`✅ ${galleryItems.length} gallery items added`);

    // Step 7: Add sample quotes
    console.log('\n💬 Step 7: Adding sample quotes...');
    const quotes = [
      { text: 'Cinta sejati tidak pernah berakhir. Kekasih mungkin berpisah, tetapi mereka tidak pernah berpisah sepenuhnya', author: 'Paulo Coelho', category: 'love' },
      { text: 'Pernikahan adalah tentang menjadi tim. Anda akan menghadapi dunia bersama-sama', author: 'Anonymous', category: 'marriage' },
      { text: 'Dalam pernikahan, cinta bukanlah perasaan semata, tetapi keputusan untuk mencintai setiap hari', author: 'Gary Chapman', category: 'commitment' }
    ];

    for (let i = 0; i < quotes.length; i++) {
      const quote = quotes[i];
      await connection.query(`
        INSERT INTO quotes (wedding_id, quote_text, quote_author, quote_category, display_order, created_by)
        VALUES (1, ?, ?, ?, ?, 1)
      `, [quote.text, quote.author, quote.category, i + 1]);
    }
    console.log(`✅ ${quotes.length} quotes added`);

    // Step 8: Add story settings
    console.log('\n📖 Step 8: Adding story settings...');
    await connection.query(`
      INSERT INTO story_settings (wedding_id, header_title, header_subtitle, created_by)
      VALUES (1, 'Kisah Cinta Kami', 'Perjalanan cinta Wiras dan Sofi dimulai dari pertemuan sederhana hingga janji suci yang akan mereka ikrarkan', 1)
    `);
    console.log('✅ Story settings added');

    // Step 9: Add story timeline items
    console.log('\n⏰ Step 9: Adding story timeline items...');
    const timelineItems = [
      {
        year: '2020',
        title: 'Pertemuan Pertama',
        date: 'Januari 2020',
        description: 'Wiras dan Sofi bertemu pertama kali di kampus. Pertemuan yang tidak disengaja ini menjadi awal dari kisah cinta yang indah.',
        icon: '👫',
        color: 'from-amber-200 to-orange-200',
        bgColor: 'from-amber-100/20 to-orange-100/20',
        order: 1
      },
      {
        year: '2021',
        title: 'Menjadi Teman Dekat',
        date: 'Maret 2021',
        description: 'Setelah sering bertemu dan mengobrol, Wiras dan Sofi menjadi teman dekat. Mereka saling berbagi cerita dan mimpi.',
        icon: '💕',
        color: 'from-rose-200 to-pink-200',
        bgColor: 'from-rose-100/20 to-pink-100/20',
        order: 2
      },
      {
        year: '2022',
        title: 'Hubungan Spesial',
        date: 'Februari 2022',
        description: 'Pada hari Valentine, Wiras menyatakan perasaannya kepada Sofi. Mereka memutuskan untuk menjalin hubungan yang lebih serius.',
        icon: '💍',
        color: 'from-purple-200 to-violet-200',
        bgColor: 'from-purple-100/20 to-violet-100/20',
        order: 3
      },
      {
        year: '2024',
        title: 'Lamaran',
        date: 'Juni 2024',
        description: 'Setelah 2 tahun menjalin hubungan, Wiras melamar Sofi pada momen yang sangat romantis. Dengan dukungan kedua keluarga, mereka memutuskan untuk melanjutkan ke jenjang pernikahan.',
        icon: '👰🤵',
        color: 'from-emerald-200 to-teal-200',
        bgColor: 'from-emerald-100/20 to-teal-100/20',
        order: 4
      }
    ];

    for (const item of timelineItems) {
      await connection.query(`
        INSERT INTO story_timeline_items (
          wedding_id, year, title, date, description, icon, color, bg_color, display_order, created_by
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, [item.year, item.title, item.date, item.description, item.icon, item.color, item.bgColor, item.order]);
    }
    console.log(`✅ ${timelineItems.length} timeline items added`);

    console.log('\n🎉 SAMPLE DATA ADDED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 DATABASE SUMMARY:');
    console.log('   ✅ Admin user: admin / admin');
    console.log('   ✅ Wedding settings: 1 record');
    console.log('   ✅ Bride & groom: Wiras & Sofi');
    console.log(`   ✅ Guests: ${guests.length} records`);
    console.log(`   ✅ Gallery: ${galleryItems.length} items`);
    console.log(`   ✅ Quotes: ${quotes.length} quotes`);
    console.log(`   ✅ Story timeline: ${timelineItems.length} items`);
    console.log('');
    console.log('🚀 Database ready for use!');

  } catch (error) {
    console.error('❌ Error adding sample data:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n📊 Database connection closed');
    }
  }
}

// Run the sample data insertion
addSampleData().catch(console.error);
