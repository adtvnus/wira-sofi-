const mysql = require('mysql2/promise');

async function debugThanksSettings() {
  let connection;
  
  try {
    console.log('🔍 Debugging Thanks Settings...\n');
    
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
      console.log('\n❌ THANKS_SETTINGS TABLE NOT FOUND!');
      console.log('   This is why the API returns 500 error');
      
      console.log('\n🔧 CREATING THANKS_SETTINGS TABLE...');
      
      // Create thanks_settings table
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
      
      // Insert default data
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
      console.log('\n📊 THANKS_SETTINGS TABLE STRUCTURE:');
      const [columns] = await connection.query(`
        DESCRIBE thanks_settings
      `);
      
      columns.forEach(col => {
        console.log(`   📝 ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'} ${col.Default ? `default: ${col.Default}` : ''}`);
      });
      
      console.log('\n📊 CURRENT THANKS_SETTINGS DATA:');
      const [rows] = await connection.query(`
        SELECT * FROM thanks_settings ORDER BY created_at DESC LIMIT 1
      `);
      
      if (rows.length === 0) {
        console.log('   ❌ No data found in thanks_settings table');
        
        console.log('\n🔧 INSERTING DEFAULT DATA...');
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
        const settings = rows[0];
        console.log(`   📝 ID: ${settings.id}`);
        console.log(`   📝 Header Title: "${settings.header_title}"`);
        console.log(`   📝 Header Subtitle: "${settings.header_subtitle}"`);
        console.log(`   📝 Main Message: "${settings.main_message}"`);
        console.log(`   📝 Sub Message: "${settings.sub_message}"`);
        console.log(`   📝 Couple Names: "${settings.couple_names}"`);
        console.log(`   📝 Show Social Media: ${settings.show_social_media}`);
        console.log(`   📝 Created: ${settings.created_at}`);
        console.log(`   📝 Updated: ${settings.updated_at}`);
      }
    }
    
    console.log('\n✅ Thanks settings debug completed!');
    console.log('\n🚀 Now try to save thanks settings in admin panel');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

debugThanksSettings();
