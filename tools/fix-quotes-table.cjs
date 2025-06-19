const mysql = require('mysql2/promise');

async function fixQuotesTable() {
  console.log('🔧 FIXING QUOTES TABLE STRUCTURE');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // Check if quotes_settings table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'quotes_settings'");
    
    if (tables.length === 0) {
      console.log('📋 Creating quotes_settings table...');
      
      // Create quotes_settings table (expected by backend)
      await connection.query(`
        CREATE TABLE quotes_settings (
          id INT PRIMARY KEY AUTO_INCREMENT,
          wedding_id INT NOT NULL DEFAULT 1,
          quote_text TEXT NOT NULL,
          quote_author VARCHAR(100) DEFAULT '',
          quote_image VARCHAR(500) DEFAULT '',
          is_active BOOLEAN DEFAULT TRUE,
          created_by INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
          FOREIGN KEY (created_by) REFERENCES admin_users(id)
        )
      `);
      
      console.log('✅ quotes_settings table created');
      
      // Insert sample quote
      await connection.query(`
        INSERT INTO quotes_settings (wedding_id, quote_text, quote_author, created_by) 
        VALUES (1, 'Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day.', 'Unknown', 1)
      `);
      
      console.log('✅ Sample quote inserted');
    } else {
      console.log('✅ quotes_settings table already exists');
    }

    // Check if gallery_settings table exists
    const [galleryTables] = await connection.query("SHOW TABLES LIKE 'gallery_settings'");
    
    if (galleryTables.length === 0) {
      console.log('📋 Creating gallery_settings table...');
      
      await connection.query(`
        CREATE TABLE gallery_settings (
          id INT PRIMARY KEY AUTO_INCREMENT,
          wedding_id INT NOT NULL DEFAULT 1,
          gallery_title VARCHAR(255) DEFAULT 'Our Gallery',
          gallery_subtitle VARCHAR(255) DEFAULT 'Beautiful Moments',
          bottom_quote TEXT DEFAULT 'Every picture tells our love story',
          is_active BOOLEAN DEFAULT TRUE,
          created_by INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
          FOREIGN KEY (created_by) REFERENCES admin_users(id)
        )
      `);
      
      await connection.query(`
        CREATE TABLE gallery_images (
          id INT PRIMARY KEY AUTO_INCREMENT,
          gallery_id INT NOT NULL,
          image_url VARCHAR(500) NOT NULL,
          image_caption VARCHAR(255) DEFAULT '',
          image_size ENUM('L', 'S') DEFAULT 'L',
          display_order INT DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_by INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (gallery_id) REFERENCES gallery_settings(id),
          FOREIGN KEY (created_by) REFERENCES admin_users(id)
        )
      `);
      
      // Insert default gallery settings
      await connection.query(`
        INSERT INTO gallery_settings (wedding_id, created_by) VALUES (1, 1)
      `);
      
      console.log('✅ gallery_settings and gallery_images tables created');
    }

    // Check if story_settings table exists
    const [storyTables] = await connection.query("SHOW TABLES LIKE 'story_settings'");
    
    if (storyTables.length === 0) {
      console.log('📋 Creating story_settings table...');
      
      await connection.query(`
        CREATE TABLE story_settings (
          id INT PRIMARY KEY AUTO_INCREMENT,
          wedding_id INT NOT NULL DEFAULT 1,
          story_title VARCHAR(255) DEFAULT 'Our Love Story',
          story_subtitle VARCHAR(255) DEFAULT 'How We Met',
          is_active BOOLEAN DEFAULT TRUE,
          created_by INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
          FOREIGN KEY (created_by) REFERENCES admin_users(id)
        )
      `);
      
      await connection.query(`
        CREATE TABLE story_timeline_items (
          id INT PRIMARY KEY AUTO_INCREMENT,
          story_id INT NOT NULL,
          timeline_year VARCHAR(10) NOT NULL,
          timeline_title VARCHAR(255) NOT NULL,
          timeline_date VARCHAR(100) NOT NULL,
          timeline_description TEXT NOT NULL,
          timeline_icon VARCHAR(50) DEFAULT 'heart',
          timeline_color VARCHAR(20) DEFAULT '#FF6B6B',
          timeline_bg_color VARCHAR(20) DEFAULT '#FFE5E5',
          display_order INT DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_by INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (story_id) REFERENCES story_settings(id),
          FOREIGN KEY (created_by) REFERENCES admin_users(id)
        )
      `);
      
      // Insert default story settings
      await connection.query(`
        INSERT INTO story_settings (wedding_id, created_by) VALUES (1, 1)
      `);
      
      console.log('✅ story_settings and story_timeline_items tables created');
    }

    // Check if couple_settings table exists
    const [coupleTables] = await connection.query("SHOW TABLES LIKE 'couple_settings'");
    
    if (coupleTables.length === 0) {
      console.log('📋 Creating couple_settings table...');
      
      await connection.query(`
        CREATE TABLE couple_settings (
          id INT PRIMARY KEY AUTO_INCREMENT,
          wedding_id INT NOT NULL DEFAULT 1,
          groom_first_name VARCHAR(100) DEFAULT 'Wira',
          bride_first_name VARCHAR(100) DEFAULT 'Sofi',
          is_active BOOLEAN DEFAULT TRUE,
          created_by INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
          FOREIGN KEY (created_by) REFERENCES admin_users(id)
        )
      `);
      
      await connection.query(`
        CREATE TABLE bride_groom_detail_settings (
          id INT PRIMARY KEY AUTO_INCREMENT,
          couple_id INT NOT NULL,
          groom_full_name VARCHAR(200) DEFAULT 'Wira Saputra',
          groom_father_name VARCHAR(100) DEFAULT 'Bapak Agus',
          groom_mother_name VARCHAR(100) DEFAULT 'Ibu Siti',
          groom_photo VARCHAR(500) DEFAULT '',
          bride_full_name VARCHAR(200) DEFAULT 'Sofi Andriani',
          bride_father_name VARCHAR(100) DEFAULT 'Bapak Budi',
          bride_mother_name VARCHAR(100) DEFAULT 'Ibu Rina',
          bride_photo VARCHAR(500) DEFAULT '',
          is_active BOOLEAN DEFAULT TRUE,
          created_by INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (couple_id) REFERENCES couple_settings(id),
          FOREIGN KEY (created_by) REFERENCES admin_users(id)
        )
      `);
      
      // Insert default couple settings
      await connection.query(`
        INSERT INTO couple_settings (wedding_id, created_by) VALUES (1, 1)
      `);
      
      const [coupleResult] = await connection.query(`SELECT id FROM couple_settings WHERE wedding_id = 1`);
      const coupleId = coupleResult[0].id;
      
      await connection.query(`
        INSERT INTO bride_groom_detail_settings (couple_id, created_by) VALUES (?, 1)
      `, [coupleId]);
      
      console.log('✅ couple_settings and bride_groom_detail_settings tables created');
    }

    // Check if invited_settings table exists
    const [invitedTables] = await connection.query("SHOW TABLES LIKE 'invited_settings'");
    
    if (invitedTables.length === 0) {
      console.log('📋 Creating invited_settings table...');
      
      await connection.query(`
        CREATE TABLE invited_settings (
          id INT PRIMARY KEY AUTO_INCREMENT,
          wedding_id INT NOT NULL DEFAULT 1,
          header_title VARCHAR(255) DEFAULT 'You Are Invited',
          header_subtitle VARCHAR(255) DEFAULT 'Wedding Invitation',
          event_title VARCHAR(255) DEFAULT 'Wedding Ceremony',
          event_name VARCHAR(255) DEFAULT 'Wira & Sofi Wedding',
          event_date DATE DEFAULT '2024-12-25',
          event_time TIME DEFAULT '10:00:00',
          venue_name VARCHAR(255) DEFAULT 'Gedung Serbaguna',
          venue_address TEXT DEFAULT 'Jl. Merdeka No. 123, Jakarta',
          google_maps_url TEXT DEFAULT '',
          save_the_date_title VARCHAR(255) DEFAULT 'Save The Date',
          save_the_date_message TEXT DEFAULT 'We would love to have you join us on our special day',
          is_active BOOLEAN DEFAULT TRUE,
          created_by INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
          FOREIGN KEY (created_by) REFERENCES admin_users(id)
        )
      `);
      
      // Insert default invited settings
      await connection.query(`
        INSERT INTO invited_settings (wedding_id, created_by) VALUES (1, 1)
      `);
      
      console.log('✅ invited_settings table created');
    }

    // Check if rsvp_settings table exists
    const [rsvpTables] = await connection.query("SHOW TABLES LIKE 'rsvp_settings'");
    
    if (rsvpTables.length === 0) {
      console.log('📋 Creating rsvp_settings table...');
      
      await connection.query(`
        CREATE TABLE rsvp_settings (
          id INT PRIMARY KEY AUTO_INCREMENT,
          wedding_id INT NOT NULL DEFAULT 1,
          header_title VARCHAR(255) DEFAULT 'RSVP',
          header_subtitle VARCHAR(255) DEFAULT 'Please Confirm Your Attendance',
          description TEXT DEFAULT 'We would be honored by your presence at our wedding celebration',
          deadline_date DATE DEFAULT '2024-12-20',
          contact_phone VARCHAR(20) DEFAULT '',
          contact_email VARCHAR(100) DEFAULT '',
          ceremony_time VARCHAR(100) DEFAULT '10:00 AM',
          reception_time VARCHAR(100) DEFAULT '12:00 PM',
          is_enabled BOOLEAN DEFAULT TRUE,
          created_by INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (wedding_id) REFERENCES wedding_settings(id),
          FOREIGN KEY (created_by) REFERENCES admin_users(id)
        )
      `);
      
      // Insert default RSVP settings
      await connection.query(`
        INSERT INTO rsvp_settings (wedding_id, created_by) VALUES (1, 1)
      `);
      
      console.log('✅ rsvp_settings table created');
    }

    await connection.end();
    
    console.log('\n🎉 ALL REQUIRED TABLES CREATED SUCCESSFULLY!');
    console.log('📋 Tables now available for:');
    console.log('   - Quotes Management');
    console.log('   - Gallery Management');
    console.log('   - Story Management');
    console.log('   - Bride & Groom Management');
    console.log('   - Invited Page Management');
    console.log('   - RSVP Management');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixQuotesTable();
