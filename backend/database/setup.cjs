#!/usr/bin/env node

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function setupDatabase() {
  console.log('🗄️ Setting up Wedding Invitation Database with Authentication...\n');

  try {
    // Connect to MySQL server (without database)
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: ''
    });

    console.log('✅ Connected to MySQL server');

    // Drop and create database
    await connection.query('DROP DATABASE IF EXISTS wedding_invitation');
    await connection.query('CREATE DATABASE wedding_invitation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await connection.query('USE wedding_invitation');
    
    console.log('✅ Database created: wedding_invitation');

    // Create admin_users table
    await connection.query(`
      CREATE TABLE admin_users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role ENUM('super_admin', 'admin', 'editor') DEFAULT 'admin',
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create wedding_settings table
    await connection.query(`
      CREATE TABLE wedding_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        groom_full_name VARCHAR(100) NOT NULL,
        groom_first_name VARCHAR(50) NOT NULL,
        groom_parents VARCHAR(200),
        bride_full_name VARCHAR(100) NOT NULL,
        bride_first_name VARCHAR(50) NOT NULL,
        bride_parents VARCHAR(200),
        wedding_date DATE NOT NULL,
        wedding_time TIME NOT NULL,
        wedding_venue VARCHAR(200) NOT NULL,
        wedding_address TEXT NOT NULL,
        reception_date DATE,
        reception_time TIME,
        reception_venue VARCHAR(200),
        reception_address TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES admin_users(id)
      )
    `);

    // Create wedding_guests table
    await connection.query(`
      CREATE TABLE wedding_guests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        wedding_id INT NOT NULL,
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
        FOREIGN KEY (created_by) REFERENCES admin_users(id),
        INDEX idx_guest_name (guest_name),
        INDEX idx_invitation_code (invitation_code),
        INDEX idx_rsvp_status (rsvp_status)
      )
    `);

    // Create user_sessions table
    await connection.query(`
      CREATE TABLE user_sessions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES admin_users(id),
        INDEX idx_session_token (session_token),
        INDEX idx_expires_at (expires_at)
      )
    `);

    // Create activity_logs table
    await connection.query(`
      CREATE TABLE activity_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        action VARCHAR(50) NOT NULL,
        table_name VARCHAR(50) NOT NULL,
        record_id INT,
        old_values JSON,
        new_values JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES admin_users(id)
      )
    `);

    console.log('✅ All tables created successfully');

    // Hash password for admin user
    const passwordHash = await bcrypt.hash('admin123', 10);

    // Insert default admin user
    await connection.query(`
      INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES 
      ('admin', 'admin@wedding.com', ?, 'Wedding Admin', 'super_admin')
    `, [passwordHash]);

    // Insert sample wedding settings
    await connection.query(`
      INSERT INTO wedding_settings (
        groom_full_name, groom_first_name, groom_parents,
        bride_full_name, bride_first_name, bride_parents,
        wedding_date, wedding_time, wedding_venue, wedding_address,
        created_by
      ) VALUES (
        'Wira Saputra', 'Wira', 'Bapak Agus Saputra & Ibu Siti Saputra',
        'Sofi Andriani', 'Sofi', 'Bapak Budi Andriani & Ibu Rina Andriani',
        '2024-12-25', '10:00:00', 'Gedung Serbaguna', 'Jl. Merdeka No. 123, Jakarta',
        1
      )
    `);

    console.log('✅ Sample data inserted');

    // Create views
    await connection.query(`
      CREATE VIEW v_active_guests AS
      SELECT 
        g.*,
        w.groom_first_name,
        w.bride_first_name,
        w.wedding_date,
        w.wedding_venue
      FROM wedding_guests g
      JOIN wedding_settings w ON g.wedding_id = w.id
      WHERE g.is_active = TRUE AND w.is_active = TRUE
    `);

    console.log('✅ Database views created');

    // Show summary
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n📊 Database setup complete!');
    console.log(`📋 Created ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    console.log('\n🔐 Default Admin Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Email: admin@wedding.com');

    console.log('\n🚀 Next steps:');
    console.log('1. Start API server: node api-server-auth.js');
    console.log('2. Access admin login: http://localhost:5173/admin/login');
    console.log('3. Login with admin credentials');
    console.log('4. Start managing wedding data!');

    await connection.end();

  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
