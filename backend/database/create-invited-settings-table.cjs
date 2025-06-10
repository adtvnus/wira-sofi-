const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'wedding_invitation'
};

async function createInvitedSettingsTable() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('📋 Creating invited_settings table...');
    
    // Create invited_settings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS invited_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        wedding_id INT NOT NULL DEFAULT 1,
        header_title VARCHAR(255) NOT NULL DEFAULT "You're Invited",
        header_subtitle TEXT,
        event_title VARCHAR(255) NOT NULL DEFAULT 'Wedding Ceremony',
        event_name VARCHAR(255),
        event_date DATE,
        event_time TIME,
        venue_name VARCHAR(255),
        venue_address TEXT,
        google_maps_url TEXT,
        save_the_date_title VARCHAR(255) DEFAULT 'Save the Date',
        save_the_date_message TEXT,
        is_enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT,
        INDEX idx_wedding_id (wedding_id),
        INDEX idx_is_enabled (is_enabled)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ invited_settings table created successfully!');
    
    // Insert default data
    console.log('📝 Inserting default invited settings...');
    
    await connection.execute(`
      INSERT IGNORE INTO invited_settings (
        wedding_id, header_title, header_subtitle, event_title, event_name,
        event_date, event_time, venue_name, venue_address, google_maps_url,
        save_the_date_title, save_the_date_message, is_enabled, created_by
      ) VALUES (
        1, 
        "You're Invited",
        "We would be honored by your presence",
        "Wedding Ceremony",
        "Akad Nikah",
        "2025-09-26",
        "12:00:00",
        "Gedung C Teknik, Universitas Riau",
        "Jl. HR. Soebrantas, Simpang Baru, Kec. Tampan, Kota Pekanbaru, Riau",
        "",
        "Save the Date",
        "We can't wait to celebrate with you!",
        TRUE,
        1
      )
    `);
    
    console.log('✅ Default invited settings inserted successfully!');
    
    // Verify the table
    const [rows] = await connection.execute('SELECT * FROM invited_settings WHERE wedding_id = 1');
    console.log('📊 Current invited settings:', rows[0]);
    
  } catch (error) {
    console.error('❌ Error creating invited_settings table:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the script
if (require.main === module) {
  createInvitedSettingsTable()
    .then(() => {
      console.log('🎉 Invited settings table setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = createInvitedSettingsTable;
