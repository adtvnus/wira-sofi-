#!/usr/bin/env node

const mysql = require('mysql2/promise');
require('dotenv').config();

async function createWeddingCRUDTables() {
  console.log('🗄️ Creating Wedding CRUD Tables...\n');

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

    // 1. Couple Settings Table
    console.log('📝 Creating couple_settings table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS couple_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wedding_id INT NOT NULL,
        groom_first_name VARCHAR(50) NOT NULL,
        groom_last_name VARCHAR(50),
        groom_full_name VARCHAR(100),
        groom_parent_names VARCHAR(200),
        groom_photo VARCHAR(255),
        bride_first_name VARCHAR(50) NOT NULL,
        bride_last_name VARCHAR(50),
        bride_full_name VARCHAR(100),
        bride_parent_names VARCHAR(200),
        bride_photo VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
        FOREIGN KEY (created_by) REFERENCES admin_users(id)
      )
    `);

    // 2. Bride Groom Detail Settings Table
    console.log('📝 Creating bride_groom_detail_settings table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bride_groom_detail_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wedding_id INT NOT NULL,
        
        -- Bride Settings
        bride_header_title VARCHAR(100) DEFAULT 'The Bride',
        bride_header_subtitle TEXT,
        bride_label VARCHAR(100),
        bride_parent_label VARCHAR(100),
        bride_father_name VARCHAR(100),
        bride_mother_name VARCHAR(100),
        bride_quote TEXT,
        bride_photo VARCHAR(255),
        
        -- Groom Settings
        groom_header_title VARCHAR(100) DEFAULT 'The Groom',
        groom_header_subtitle TEXT,
        groom_label VARCHAR(100),
        groom_parent_label VARCHAR(100),
        groom_father_name VARCHAR(100),
        groom_mother_name VARCHAR(100),
        groom_quote TEXT,
        groom_photo VARCHAR(255),
        
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
        FOREIGN KEY (created_by) REFERENCES admin_users(id)
      )
    `);

    // 3. Event Settings Table
    console.log('📝 Creating event_settings table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS event_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wedding_id INT NOT NULL,
        event_name VARCHAR(100) NOT NULL,
        event_date VARCHAR(100),
        event_time VARCHAR(50),
        venue_name VARCHAR(200),
        venue_address TEXT,
        map_url TEXT,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
        FOREIGN KEY (created_by) REFERENCES admin_users(id)
      )
    `);

    // 4. Quotes Settings Table (Enhanced)
    console.log('📝 Creating quotes_settings table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS quotes_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wedding_id INT NOT NULL,
        header_title VARCHAR(100) DEFAULT 'Words of Love',
        header_subtitle TEXT,
        bottom_message TEXT,
        quotes_image VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
        FOREIGN KEY (created_by) REFERENCES admin_users(id)
      )
    `);

    // 5. Story Settings Table
    console.log('📝 Creating story_settings table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS story_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wedding_id INT NOT NULL,
        header_title VARCHAR(100) DEFAULT 'Our Story',
        header_subtitle TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
        FOREIGN KEY (created_by) REFERENCES admin_users(id)
      )
    `);

    // 6. Story Timeline Items Table
    console.log('📝 Creating story_timeline_items table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS story_timeline_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wedding_id INT NOT NULL,
        year VARCHAR(10),
        title VARCHAR(100),
        date VARCHAR(100),
        description TEXT,
        icon VARCHAR(10),
        color VARCHAR(100),
        bg_color VARCHAR(100),
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
        FOREIGN KEY (created_by) REFERENCES admin_users(id)
      )
    `);

    // 7. Gallery Settings Table
    console.log('📝 Creating gallery_settings table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS gallery_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wedding_id INT NOT NULL,
        header_title VARCHAR(100) DEFAULT 'Our Gallery',
        header_subtitle TEXT,
        bottom_quote TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
        FOREIGN KEY (created_by) REFERENCES admin_users(id)
      )
    `);

    // 8. Gallery Images Table
    console.log('📝 Creating gallery_images table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wedding_id INT NOT NULL,
        image_src VARCHAR(255),
        image_alt VARCHAR(200),
        image_type ENUM('landscape', 'square', 'portrait') DEFAULT 'landscape',
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
        FOREIGN KEY (created_by) REFERENCES admin_users(id)
      )
    `);

    // 9. RSVP Settings Table
    console.log('📝 Creating rsvp_settings table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS rsvp_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wedding_id INT NOT NULL,
        header_title VARCHAR(100) DEFAULT 'RSVP',
        header_subtitle TEXT,
        description TEXT,
        deadline_date VARCHAR(100),
        contact_phone VARCHAR(20),
        contact_email VARCHAR(100),
        ceremony_time VARCHAR(100),
        reception_time VARCHAR(100),
        is_enabled BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
        FOREIGN KEY (created_by) REFERENCES admin_users(id)
      )
    `);

    // 10. Thanks Settings Table
    console.log('📝 Creating thanks_settings table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS thanks_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wedding_id INT NOT NULL,
        header_title VARCHAR(100) DEFAULT 'Thank You',
        header_subtitle VARCHAR(100),
        main_message TEXT,
        sub_message TEXT,
        couple_names VARCHAR(100),
        blessing_quote_arabic TEXT,
        blessing_quote_translation TEXT,
        background_image VARCHAR(255),
        show_social_media BOOLEAN DEFAULT FALSE,
        instagram VARCHAR(100),
        facebook VARCHAR(100),
        twitter VARCHAR(100),
        contact_phone VARCHAR(20),
        contact_email VARCHAR(100),
        contact_address TEXT,
        is_enabled BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
        FOREIGN KEY (created_by) REFERENCES admin_users(id)
      )
    `);

    // 11. Invited Settings Table
    console.log('📝 Creating invited_settings table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS invited_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wedding_id INT NOT NULL,
        header_title VARCHAR(100) DEFAULT 'You are Invited',
        header_subtitle TEXT,
        event_title VARCHAR(100),
        event_name VARCHAR(100),
        event_date VARCHAR(100),
        event_time VARCHAR(50),
        venue_name VARCHAR(200),
        venue_address TEXT,
        google_maps_url TEXT,
        save_the_date_title VARCHAR(100),
        save_the_date_message TEXT,
        is_enabled BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
        FOREIGN KEY (created_by) REFERENCES admin_users(id)
      )
    `);

    // Now populate with default data
    console.log('\n📝 Populating default data...');

    // 1. Insert Couple Settings
    await connection.query(`
      INSERT IGNORE INTO couple_settings (
        wedding_id, groom_first_name, groom_last_name, groom_full_name, groom_parent_names, groom_photo,
        bride_first_name, bride_last_name, bride_full_name, bride_parent_names, bride_photo, created_by
      ) VALUES (1, 'Wira', 'Maulana', 'Wira Maulana', 'Bapak Ahmad & Ibu Siti', 'public/images/BrideGroom/groom.jpg',
                'Sofi', 'Kumala', 'Sofi Kumala', 'Bapak Budi & Ibu Rina', 'public/images/BrideGroom/bride.jpg', 1)
    `);

    // 2. Insert Bride Groom Detail Settings
    await connection.query(`
      INSERT IGNORE INTO bride_groom_detail_settings (
        wedding_id, bride_header_title, bride_header_subtitle, bride_label, bride_parent_label,
        bride_father_name, bride_mother_name, bride_quote, bride_photo,
        groom_header_title, groom_header_subtitle, groom_label, groom_parent_label,
        groom_father_name, groom_mother_name, groom_quote, groom_photo, created_by
      ) VALUES (
        1, 'The Bride', 'A beautiful soul with a heart full of love', 'Calon Pengantin Wanita', 'Putri dari',
        'Bapak Adit', 'Ibu Shikimori', 'Cinta sejati dimulai ketika tidak ada yang diharapkan sebagai balasan', 'public/images/BrideGroom/bride.jpg',
        'The Groom', 'A gentle soul with strength and devotion', 'Calon Pengantin Pria', 'Putra dari',
        'Bapak Agata', 'Ibu Ayaka', 'Cinta sejati adalah ketika kamu menemukan seseorang yang membuatmu menjadi versi terbaik dari dirimu', 'public/images/BrideGroom/groom.jpg', 1
      )
    `);

    // 3. Insert Event Settings
    await connection.query(`
      INSERT IGNORE INTO event_settings (
        wedding_id, event_name, event_date, event_time, venue_name, venue_address, map_url, display_order, created_by
      ) VALUES (
        1, 'Akad Nikah', 'Jumat, 26 September 2025', '12.00 WIB', 'Gedung C Teknik, Universitas Riau',
        'Jl. HR. Soebrantas, Simpang Baru, Kec. Tampan, Kota Pekanbaru, Riau',
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.668857089829!2d101.35013931475436!3d0.4637126997291157!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31aa706cd2fd9b5f%3A0x7a4f8e4f4f4f4f4f!2sUniversitas%20Riau!5e0!3m2!1sen!2sid!4v1635123456789!5m2!1sen!2sid',
        1, 1
      )
    `);

    // 4. Insert Quotes Settings
    await connection.query(`
      INSERT IGNORE INTO quotes_settings (
        wedding_id, header_title, header_subtitle, bottom_message, quotes_image, created_by
      ) VALUES (
        1, 'Words of Love', 'Kata-kata indah tentang cinta dan pernikahan',
        'Love is the bridge between two hearts', 'public/images/Quotes/quotes.jpg', 1
      )
    `);

    // 5. Insert Story Settings
    await connection.query(`
      INSERT IGNORE INTO story_settings (
        wedding_id, header_title, header_subtitle, created_by
      ) VALUES (
        1, 'Our Story', 'Perjalanan cinta kami dimulai dari pertemuan sederhana hingga janji suci yang akan kami ikrarkan', 1
      )
    `);

    // 6. Insert Story Timeline Items
    const timelineItems = [
      ['1', '2019', 'First Meet', 'Agustus 2019', 'Kami pertama kali bertemu dalam Ospek Perkuliahan. Dalam masa kuliah kami hanya teman biasa.', '👫', 'from-amber-200 to-orange-200', 'from-amber-100/20 to-orange-100/20', 1],
      ['2', '2020', 'Relationship', '25 Februari 2020', 'Kami mengikat janji sebagai pasangan kekasih.', '💕', 'from-rose-200 to-pink-200', 'from-rose-100/20 to-pink-100/20', 2],
      ['3', '2023', 'Engagement', '25 Februari 2023', 'Lika-liku hubungan kami lalui bersama hingga kami memutuskan untuk bertunangan pada 25 Februari 2023.', '💍', 'from-purple-200 to-violet-200', 'from-purple-100/20 to-violet-100/20', 3],
      ['4', '2025', 'Married', '26 September 2025', 'Kami memutuskan untuk mengikat janji suci pernikahan pada 26 September 2025.', '👰🤵', 'from-emerald-200 to-teal-200', 'from-emerald-100/20 to-teal-100/20', 4]
    ];

    for (const item of timelineItems) {
      await connection.query(`
        INSERT IGNORE INTO story_timeline_items (
          wedding_id, year, title, date, description, icon, color, bg_color, display_order, created_by
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, item.slice(1));
    }

    await connection.end();

    console.log('\n🎉 All Wedding CRUD Tables Created Successfully!');
    console.log('📊 Tables created:');
    console.log('   1. couple_settings ✅');
    console.log('   2. bride_groom_detail_settings ✅');
    console.log('   3. event_settings ✅');
    console.log('   4. quotes_settings ✅');
    console.log('   5. story_settings ✅');
    console.log('   6. story_timeline_items ✅');
    console.log('   7. gallery_settings ✅');
    console.log('   8. gallery_images ✅');
    console.log('   9. rsvp_settings ✅');
    console.log('   10. thanks_settings ✅');
    console.log('   11. invited_settings ✅');

    console.log('\n📝 Default data populated ✅');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

createWeddingCRUDTables();
