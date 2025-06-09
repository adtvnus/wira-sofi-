#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function checkThanksTable() {
  console.log('🔍 CHECKING THANKS_SETTINGS TABLE\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // Check if thanks_settings table exists
    console.log('\n1. 📋 Checking if thanks_settings table exists...');
    const [tables] = await connection.query("SHOW TABLES LIKE 'thanks_settings'");
    
    if (tables.length === 0) {
      console.log('❌ thanks_settings table does not exist!');
      
      // Create the table
      console.log('\n2. 🏗️ Creating thanks_settings table...');
      await connection.query(`
        CREATE TABLE thanks_settings (
          id INT PRIMARY KEY AUTO_INCREMENT,
          header_title VARCHAR(255) DEFAULT 'Thank You',
          header_subtitle VARCHAR(255) DEFAULT 'Terima Kasih',
          main_message TEXT,
          sub_message TEXT,
          couple_names VARCHAR(255),
          blessing_quote_arabic TEXT,
          blessing_quote_translation TEXT,
          background_image VARCHAR(500),
          show_social_media BOOLEAN DEFAULT FALSE,
          social_media_instagram VARCHAR(255),
          social_media_facebook VARCHAR(255),
          social_media_twitter VARCHAR(255),
          created_by INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_created_at (created_at)
        )
      `);
      
      console.log('✅ thanks_settings table created successfully');
      
      // Insert default data
      console.log('\n3. 📝 Inserting default thanks settings...');
      await connection.query(`
        INSERT INTO thanks_settings (
          header_title, header_subtitle, main_message, sub_message, couple_names,
          blessing_quote_arabic, blessing_quote_translation, background_image,
          show_social_media, social_media_instagram, social_media_facebook, social_media_twitter,
          created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'Thank You',
        'Terima Kasih',
        'Atas kehadiran, doa, dan restu yang telah diberikan dalam hari bahagia kami, kami mengucapkan terima kasih yang sebesar-besarnya.',
        'Semoga keberkahan dan kebahagiaan senantiasa menyertai kita semua.',
        'Wira & Sofi',
        'Barakallahu lakuma wa baraka alaikuma wa jama\'a bainakuma fi khair',
        'Semoga Allah memberkati kalian dan menyatukan kalian dalam kebaikan',
        '',
        false,
        '',
        '',
        '',
        1
      ]);
      
      console.log('✅ Default thanks settings inserted');
      
    } else {
      console.log('✅ thanks_settings table exists');

      // Show table structure
      console.log('\n2. 🏗️ Table structure:');
      const [columns] = await connection.query("DESCRIBE thanks_settings");
      console.table(columns);

      // Count records
      console.log('\n3. 📊 Record count:');
      const [countResult] = await connection.query("SELECT COUNT(*) as total FROM thanks_settings");
      console.log(`   Total records: ${countResult[0].total}`);

      // Show sample records if any
      if (countResult[0].total > 0) {
        console.log('\n4. 📄 Sample records:');
        const [records] = await connection.query("SELECT * FROM thanks_settings LIMIT 3");
        console.table(records);
      } else {
        console.log('\n4. 📝 No records found, inserting default...');
        await connection.query(`
          INSERT INTO thanks_settings (
            header_title, header_subtitle, main_message, sub_message, couple_names,
            blessing_quote_arabic, blessing_quote_translation, background_image,
            show_social_media, social_media_instagram, social_media_facebook, social_media_twitter,
            created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          'Thank You',
          'Terima Kasih',
          'Atas kehadiran, doa, dan restu yang telah diberikan dalam hari bahagia kami, kami mengucapkan terima kasih yang sebesar-besarnya.',
          'Semoga keberkahan dan kebahagiaan senantiasa menyertai kita semua.',
          'Wira & Sofi',
          'Barakallahu lakuma wa baraka alaikuma wa jama\'a bainakuma fi khair',
          'Semoga Allah memberkati kalian dan menyatukan kalian dalam kebaikan',
          '',
          false,
          '',
          '',
          '',
          1
        ]);
        
        console.log('✅ Default thanks settings inserted');
      }
    }

    await connection.end();
    console.log('\n✅ Check completed successfully!');

  } catch (error) {
    console.error('\n❌ Check failed:', error.message);
    console.error('   Error code:', error.code);
    console.error('   SQL State:', error.sqlState);
  }
}

checkThanksTable();
