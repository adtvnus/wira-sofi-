const mysql = require('mysql2/promise');

async function checkStoryTables() {
  let connection;
  
  try {
    console.log('🔍 Checking story-related tables...\n');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });
    
    console.log('✅ Database connected\n');
    
    // Check all tables
    console.log('📊 ALL TABLES:');
    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   📋 ${tableName}`);
    });
    
    // Check story_settings table
    console.log('\n📊 STORY_SETTINGS TABLE:');
    try {
      const [storyRows] = await connection.query('SELECT * FROM story_settings ORDER BY updated_at DESC LIMIT 3');
      
      if (storyRows.length === 0) {
        console.log('❌ No data in story_settings');
      } else {
        storyRows.forEach((row, i) => {
          console.log(`\n📝 Record ${i + 1}:`);
          console.log(`   ID: ${row.id}`);
          console.log(`   Title: "${row.title}"`);
          console.log(`   Subtitle: "${row.subtitle}"`);
          console.log(`   Description: "${row.description}"`);
          console.log(`   Active: ${row.is_active}`);
        });
      }
    } catch (error) {
      console.log(`❌ Error accessing story_settings: ${error.message}`);
    }
    
    // Check story_timeline_items table
    console.log('\n📊 STORY_TIMELINE_ITEMS TABLE:');
    try {
      const [timelineRows] = await connection.query('SELECT * FROM story_timeline_items ORDER BY display_order ASC LIMIT 5');
      
      if (timelineRows.length === 0) {
        console.log('❌ No data in story_timeline_items');
      } else {
        timelineRows.forEach((row, i) => {
          console.log(`\n📝 Timeline Item ${i + 1}:`);
          console.log(`   ID: ${row.id}`);
          console.log(`   Year: "${row.year}"`);
          console.log(`   Title: "${row.title}"`);
          console.log(`   Date: "${row.date}"`);
          console.log(`   Description: "${row.description}"`);
          console.log(`   Icon: "${row.icon}"`);
          console.log(`   Color: "${row.color}"`);
          console.log(`   Display Order: ${row.display_order}`);
          console.log(`   Active: ${row.is_active}`);
        });
      }
    } catch (error) {
      console.log(`❌ Error accessing story_timeline_items: ${error.message}`);
    }
    
    console.log('\n✅ Check completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkStoryTables();
