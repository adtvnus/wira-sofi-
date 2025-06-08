#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function addSampleData() {
  console.log('📝 Adding Sample Data to Clean Database...\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // Update wedding settings with real example
    console.log('💒 Updating wedding settings...');
    await connection.query(`
      UPDATE wedding_settings SET
        wedding_title = 'Wedding Invitation',
        wedding_subtitle = 'The Wedding of',
        groom_full_name = 'Wira Saputra',
        groom_first_name = 'Wira',
        groom_parents = 'Bapak Agus Saputra & Ibu Siti Saputra',
        bride_full_name = 'Sofi Andriani',
        bride_first_name = 'Sofi',
        bride_parents = 'Bapak Budi Andriani & Ibu Rina Andriani',
        wedding_date = '2024-12-25',
        wedding_time = '10:00:00',
        wedding_venue = 'Gedung Serbaguna Merdeka',
        wedding_address = 'Jl. Merdeka No. 123, Jakarta Pusat, DKI Jakarta',
        reception_date = '2024-12-25',
        reception_time = '18:00:00',
        reception_venue = 'Hotel Grand Ballroom',
        reception_address = 'Jl. Sudirman No. 456, Jakarta Selatan, DKI Jakarta',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `);

    console.log('✅ Wedding settings updated');

    // Add sample wedding stories
    console.log('📖 Adding wedding stories...');
    const stories = [
      {
        title: 'Pertemuan Pertama',
        content: 'Kami bertemu pertama kali di kampus pada tahun 2020. Saat itu, kami sama-sama mengikuti organisasi mahasiswa dan sering bekerja sama dalam berbagai kegiatan.',
        date: '2020-03-15',
        order: 1
      },
      {
        title: 'Menjadi Teman Dekat',
        content: 'Seiring berjalannya waktu, kami menjadi teman dekat. Kami sering menghabiskan waktu bersama, berbagi cerita, dan saling mendukung dalam setiap langkah.',
        date: '2021-06-20',
        order: 2
      },
      {
        title: 'Hubungan Spesial',
        content: 'Pada tahun 2022, kami memutuskan untuk menjalin hubungan yang lebih serius. Kami merasa cocok satu sama lain dan memiliki visi yang sama untuk masa depan.',
        date: '2022-02-14',
        order: 3
      },
      {
        title: 'Lamaran',
        content: 'Setelah 2 tahun menjalin hubungan, Wira melamar Sofi pada momen yang sangat romantis. Dengan dukungan kedua keluarga, kami memutuskan untuk melanjutkan ke jenjang pernikahan.',
        date: '2024-06-10',
        order: 4
      }
    ];

    for (const story of stories) {
      await connection.query(`
        INSERT INTO wedding_stories (wedding_id, story_title, story_content, story_date, display_order, created_by)
        VALUES (1, ?, ?, ?, ?, 1)
      `, [story.title, story.content, story.date, story.order]);
    }

    console.log(`✅ Added ${stories.length} wedding stories`);

    // Add sample quotes
    console.log('💝 Adding wedding quotes...');
    const quotes = [
      {
        text: 'Cinta sejati tidak pernah berakhir. Kekasih mungkin berpisah, tetapi mereka tidak pernah berpisah.',
        author: 'Paulo Coelho',
        category: 'love',
        image: '/images/quotes/love-quote.jpg',
        order: 1
      },
      {
        text: 'Pernikahan yang sukses membutuhkan jatuh cinta berkali-kali, selalu dengan orang yang sama.',
        author: 'Mignon McLaughlin',
        category: 'marriage',
        image: '/images/quotes/marriage-quote.jpg',
        order: 2
      },
      {
        text: 'Semoga Allah SWT senantiasa memberkahi pernikahan kalian dan memberikan kebahagiaan yang kekal.',
        author: 'Doa Pernikahan',
        category: 'blessing',
        image: '/images/quotes/blessing-quote.jpg',
        order: 3
      }
    ];

    for (const quote of quotes) {
      await connection.query(`
        INSERT INTO wedding_quotes (wedding_id, quote_text, quote_author, quote_category, quote_image_url, display_order, created_by)
        VALUES (1, ?, ?, ?, ?, ?, 1)
      `, [quote.text, quote.author, quote.category, quote.image, quote.order]);
    }

    console.log(`✅ Added ${quotes.length} wedding quotes`);

    // Add 3 sample guests (minimal)
    console.log('👥 Adding sample guests...');
    const sampleGuests = [
      { name: 'Ahmad Budi', email: 'ahmad.budi@email.com', phone: '+62 812 3456 7890', count: 2, category: 'family' },
      { name: 'Siti Nurhaliza', email: 'siti.nurhaliza@email.com', phone: '+62 813 4567 8901', count: 1, category: 'friend' },
      { name: 'John Doe', email: 'john.doe@email.com', phone: '+62 814 5678 9012', count: 3, category: 'colleague' }
    ];

    for (const guest of sampleGuests) {
      const invitationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      await connection.query(`
        INSERT INTO wedding_guests (
          wedding_id, guest_name, guest_email, guest_phone, 
          invitation_code, guest_count, guest_category, created_by
        ) VALUES (1, ?, ?, ?, ?, ?, ?, 1)
      `, [guest.name, guest.email, guest.phone, invitationCode, guest.count, guest.category]);
    }

    console.log(`✅ Added ${sampleGuests.length} sample guests`);

    // Log the activity
    await connection.query(`
      INSERT INTO activity_logs (user_id, action_type, description, ip_address)
      VALUES (1, 'CREATE', 'Sample data added to clean database', '127.0.0.1')
    `);

    await connection.end();

    console.log('\n🎉 Sample data added successfully!');
    
    console.log('\n📊 Database Content:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│                    SAMPLE DATA                          │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ 💒 Wedding Settings: Wira & Sofi                       │');
    console.log('│ 📖 Wedding Stories: 4 timeline stories                 │');
    console.log('│ 💝 Wedding Quotes: 3 meaningful quotes                 │');
    console.log('│ 👥 Sample Guests: 3 guests with different categories   │');
    console.log('│ 📋 Activity Logs: System activities tracked            │');
    console.log('└─────────────────────────────────────────────────────────┘');

    console.log('\n🎯 What You Can Do Now:');
    console.log('   1. 💒 Edit wedding settings in admin panel');
    console.log('   2. 📖 Manage wedding stories timeline');
    console.log('   3. 💝 Add/edit wedding quotes');
    console.log('   4. 👥 Add real guest data');
    console.log('   5. 🖼️ Upload wedding gallery photos');
    console.log('   6. 📊 View RSVP statistics');

    console.log('\n✨ Database is now ready with organized sample data!');

  } catch (error) {
    console.error('\n❌ Adding sample data failed:', error.message);
    process.exit(1);
  }
}

addSampleData();
