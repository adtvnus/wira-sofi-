const mysql = require('mysql2/promise');

async function createGalleryTextSettings() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost', 
      user: 'root', 
      password: '', 
      database: 'wedding_invitation'
    });
    
    await conn.query('DROP TABLE IF EXISTS gallery_text_settings');
    
    await conn.query(`
      CREATE TABLE gallery_text_settings (
        id INT PRIMARY KEY AUTO_INCREMENT, 
        wedding_id INT NOT NULL DEFAULT 1, 
        header_title VARCHAR(255) DEFAULT 'Our Gallery', 
        header_subtitle VARCHAR(255) DEFAULT 'Beautiful moments', 
        bottom_quote TEXT DEFAULT 'Every picture tells a story', 
        is_active BOOLEAN DEFAULT TRUE, 
        created_by INT DEFAULT 1, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    await conn.query('INSERT INTO gallery_text_settings (wedding_id, created_by) VALUES (1, 1)');
    
    console.log('✅ gallery_text_settings table created and populated');
    
    await conn.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createGalleryTextSettings();
