#!/usr/bin/env node

// Reset and rebuild database with correct structure

const mysql = require('mysql2/promise');

async function resetAndRebuildDatabase() {
  console.log('🔄 RESET AND REBUILD DATABASE');
  console.log('═══════════════════════════════════════════════════════════════');
  
  let connection;

  try {
    // Step 1: Connect to MySQL (without specific database)
    console.log('📊 Step 1: Connecting to MySQL server...');
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });
    console.log('✅ Connected to MySQL server');

    // Step 2: Drop and recreate database
    console.log('\n🗑️ Step 2: Dropping existing database...');
    await connection.query('DROP DATABASE IF EXISTS wedding_invitation');
    console.log('✅ Database dropped');

    console.log('\n➕ Step 3: Creating new database...');
    await connection.query('CREATE DATABASE wedding_invitation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Database created');

    // Step 4: Use the new database
    await connection.query('USE wedding_invitation');
    console.log('✅ Using wedding_invitation database');

    // Step 5: Create admin_users table
    console.log('\n👤 Step 5: Creating admin_users table...');
    await connection.query(`
      CREATE TABLE admin_users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        role ENUM('admin', 'editor') DEFAULT 'admin',
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ admin_users table created');

    // Step 6: Create wedding_settings table
    console.log('\n💒 Step 6: Creating wedding_settings table...');
    await connection.query(`
      CREATE TABLE wedding_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wedding_date DATE,
        wedding_time TIME,
        wedding_venue VARCHAR(255),
        wedding_address TEXT,
        wedding_maps_url TEXT,
        reception_date DATE,
        reception_time TIME,
        reception_venue VARCHAR(255),
        reception_address TEXT,
        reception_maps_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES admin_users(id)
      )
    `);
    console.log('✅ wedding_settings table created');

    // Step 7: Create bride_groom table
    console.log('\n👰🤵 Step 7: Creating bride_groom table...');
    await connection.query(`
      CREATE TABLE bride_groom (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wedding_id INT DEFAULT 1,
        groom_first_name VARCHAR(50),
        groom_last_name VARCHAR(50),
        groom_full_name VARCHAR(100),
        groom_parent_names VARCHAR(200),
        groom_photo VARCHAR(255) DEFAULT 'public/images/BrideGroom/groom.jpg',
        bride_first_name VARCHAR(50),
        bride_last_name VARCHAR(50),
        bride_full_name VARCHAR(100),
        bride_parent_names VARCHAR(200),
        bride_photo VARCHAR(255) DEFAULT 'public/images/BrideGroom/bride.jpg',
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
        FOREIGN KEY (created_by) REFERENCES admin_users(id)
      )
    `);
    console.log('✅ bride_groom table created');

    // Step 8: Create bride_groom_detail table
    console.log('\n💕 Step 8: Creating bride_groom_detail table...');
    await connection.query(`
      CREATE TABLE bride_groom_detail (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wedding_id INT DEFAULT 1,
        bride_header_title VARCHAR(255) DEFAULT 'The Bride',
        bride_header_subtitle TEXT,
        bride_label VARCHAR(100) DEFAULT 'Putri dari',
        bride_parent_label VARCHAR(100) DEFAULT 'Bapak & Ibu',
        bride_father_name VARCHAR(100),
        bride_mother_name VARCHAR(100),
        bride_quote TEXT,
        bride_photo VARCHAR(255) DEFAULT 'public/images/BrideGroom/bride.jpg',
        groom_header_title VARCHAR(255) DEFAULT 'The Groom',
        groom_header_subtitle TEXT,
        groom_label VARCHAR(100) DEFAULT 'Putra dari',
        groom_parent_label VARCHAR(100) DEFAULT 'Bapak & Ibu',
        groom_father_name VARCHAR(100),
        groom_mother_name VARCHAR(100),
        groom_quote TEXT,
        groom_photo VARCHAR(255) DEFAULT 'public/images/BrideGroom/groom.jpg',
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
        FOREIGN KEY (created_by) REFERENCES admin_users(id)
      )
    `);
    console.log('✅ bride_groom_detail table created');

    // Step 9: Create guests table
    console.log('\n👥 Step 9: Creating guests table...');
    await connection.query(`
      CREATE TABLE guests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wedding_id INT DEFAULT 1,
        guest_name VARCHAR(100) NOT NULL,
        guest_email VARCHAR(100),
        guest_phone VARCHAR(20),
        invitation_code VARCHAR(20) UNIQUE NOT NULL,
        guest_count INT DEFAULT 1,
        rsvp_status ENUM('pending', 'attending', 'not_attending') DEFAULT 'pending',
        rsvp_message TEXT,
        rsvp_submitted_at TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
        FOREIGN KEY (created_by) REFERENCES admin_users(id)
      )
    `);
    console.log('✅ guests table created');

    // Step 10: Create gallery table
    console.log('\n📸 Step 10: Creating gallery table...');
    await connection.query(`
      CREATE TABLE gallery (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wedding_id INT DEFAULT 1,
        title VARCHAR(255),
        subtitle VARCHAR(255),
        quote_bottom TEXT,
        image_path VARCHAR(500) NOT NULL,
        image_size ENUM('L', 'S') DEFAULT 'L',
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
        FOREIGN KEY (created_by) REFERENCES admin_users(id)
      )
    `);
    console.log('✅ gallery table created');

    // Step 11: Create quotes table
    console.log('\n💬 Step 11: Creating quotes table...');
    await connection.query(`
      CREATE TABLE quotes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wedding_id INT DEFAULT 1,
        quote_text TEXT NOT NULL,
        quote_author VARCHAR(100),
        quote_category VARCHAR(50) DEFAULT 'general',
        quote_image_url VARCHAR(500),
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
        FOREIGN KEY (created_by) REFERENCES admin_users(id)
      )
    `);
    console.log('✅ quotes table created');

    // Step 12: Create story_settings table
    console.log('\n📖 Step 12: Creating story_settings table...');
    await connection.query(`
      CREATE TABLE story_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wedding_id INT DEFAULT 1,
        header_title VARCHAR(255) DEFAULT 'Our Story',
        header_subtitle TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
        FOREIGN KEY (created_by) REFERENCES admin_users(id)
      )
    `);
    console.log('✅ story_settings table created');

    // Step 13: Create story_timeline_items table
    console.log('\n⏰ Step 13: Creating story_timeline_items table...');
    await connection.query(`
      CREATE TABLE story_timeline_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wedding_id INT DEFAULT 1,
        year VARCHAR(10),
        title VARCHAR(255),
        date VARCHAR(100),
        description TEXT,
        icon VARCHAR(10) DEFAULT '💕',
        color VARCHAR(100) DEFAULT 'from-rose-200 to-pink-200',
        bg_color VARCHAR(100) DEFAULT 'from-rose-100/20 to-pink-100/20',
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
        FOREIGN KEY (created_by) REFERENCES admin_users(id)
      )
    `);
    console.log('✅ story_timeline_items table created');

    console.log('\n🎉 DATABASE STRUCTURE CREATED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n📊 Database connection closed');
    }
  }
}

// Run the reset and rebuild
resetAndRebuildDatabase().catch(console.error);
