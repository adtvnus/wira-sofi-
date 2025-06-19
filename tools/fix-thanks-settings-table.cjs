const mysql = require('mysql2/promise');

async function fixThanksSettingsTable() {
  let connection;
  
  try {
    console.log('🔧 Fixing Thanks Settings Table...\n');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });
    
    console.log('✅ Database connected\n');
    
    // Check if thanks_settings table exists
    console.log('📊 CHECKING THANKS_SETTINGS TABLE:');
    const [tableExists] = await connection.query(`
      SELECT COUNT(*) as count FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_name = 'thanks_settings'
    `);
    
    console.log(`   Table exists: ${tableExists[0].count > 0 ? 'YES' : 'NO'}`);
    
    if (tableExists[0].count === 0) {
      console.log('\n🔧 CREATING THANKS_SETTINGS TABLE...');
      
      // Create thanks_settings table with all required columns
      await connection.query(`
        CREATE TABLE thanks_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          header_title VARCHAR(255) DEFAULT 'Thank You',
          header_subtitle VARCHAR(255) DEFAULT 'Terima Kasih',
          main_message TEXT DEFAULT 'Terima kasih atas kehadiran dan doa restu yang telah diberikan untuk pernikahan kami.',
          sub_message TEXT DEFAULT 'Semoga Allah SWT membalas kebaikan kalian semua.',
          couple_names VARCHAR(255) DEFAULT 'Wira & Sofi',
          blessing_quote_arabic TEXT DEFAULT 'بَارَكَ اللهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
          blessing_quote_translation TEXT DEFAULT 'Semoga Allah memberkahi kalian berdua, dan memberkahi kalian, serta menyatukan kalian dalam kebaikan.',
          background_image VARCHAR(500) DEFAULT '',
          show_social_media BOOLEAN DEFAULT true,
          social_media_instagram VARCHAR(255) DEFAULT '',
          social_media_facebook VARCHAR(255) DEFAULT '',
          social_media_twitter VARCHAR(255) DEFAULT '',
          created_by INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Thanks_settings table created successfully');
      
    } else {
      console.log('\n📊 CHECKING TABLE STRUCTURE:');
      const [columns] = await connection.query(`
        DESCRIBE thanks_settings
      `);
      
      const existingColumns = columns.map(col => col.Field);
      console.log('   Existing columns:', existingColumns.join(', '));
      
      // Check for missing social media columns
      const requiredColumns = [
        'social_media_instagram',
        'social_media_facebook', 
        'social_media_twitter'
      ];
      
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log('\n🔧 ADDING MISSING COLUMNS:');
        console.log('   Missing columns:', missingColumns.join(', '));
        
        for (const column of missingColumns) {
          console.log(`   Adding column: ${column}`);
          await connection.query(`
            ALTER TABLE thanks_settings 
            ADD COLUMN ${column} VARCHAR(255) DEFAULT ''
          `);
        }
        
        console.log('✅ Missing columns added successfully');
      } else {
        console.log('✅ All required columns exist');
      }
    }
    
    // Insert default data if table is empty
    console.log('\n📊 CHECKING DATA:');
    const [rows] = await connection.query(`
      SELECT COUNT(*) as count FROM thanks_settings
    `);
    
    if (rows[0].count === 0) {
      console.log('   No data found, inserting default data...');
      
      await connection.query(`
        INSERT INTO thanks_settings (
          header_title, header_subtitle, main_message, sub_message, couple_names,
          blessing_quote_arabic, blessing_quote_translation, background_image,
          show_social_media, social_media_instagram, social_media_facebook, social_media_twitter,
          created_by
        ) VALUES (
          'Thank You',
          'Terima Kasih',
          'Terima kasih atas kehadiran dan doa restu yang telah diberikan untuk pernikahan kami.',
          'Semoga Allah SWT membalas kebaikan kalian semua.',
          'Wira & Sofi',
          'بَارَكَ اللهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
          'Semoga Allah memberkahi kalian berdua, dan memberkahi kalian, serta menyatukan kalian dalam kebaikan.',
          '',
          true,
          '',
          '',
          '',
          1
        )
      `);
      
      console.log('✅ Default thanks settings inserted');
    } else {
      console.log(`   Found ${rows[0].count} existing records`);
    }
    
    // Verify final structure
    console.log('\n📊 FINAL TABLE STRUCTURE:');
    const [finalColumns] = await connection.query(`
      DESCRIBE thanks_settings
    `);
    
    finalColumns.forEach(col => {
      console.log(`   📝 ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'} ${col.Default !== null ? `default: ${col.Default}` : ''}`);
    });
    
    console.log('\n✅ Thanks settings table fix completed!');
    console.log('\n🚀 Now try to save thanks settings in admin panel');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixThanksSettingsTable();
