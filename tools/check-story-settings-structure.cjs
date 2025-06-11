const mysql = require('mysql2/promise');

async function checkStorySettingsStructure() {
  let connection;
  
  try {
    console.log('🔍 Checking story_settings table structure...\n');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });
    
    console.log('✅ Database connected\n');
    
    // Check story_settings table structure
    console.log('📊 STORY_SETTINGS TABLE STRUCTURE:');
    const [columns] = await connection.query('DESCRIBE story_settings');
    
    columns.forEach(col => {
      console.log(`   📋 ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
    });
    
    // Check story_timeline_items table structure
    console.log('\n📊 STORY_TIMELINE_ITEMS TABLE STRUCTURE:');
    const [timelineColumns] = await connection.query('DESCRIBE story_timeline_items');
    
    timelineColumns.forEach(col => {
      console.log(`   📋 ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
    });
    
    console.log('\n✅ Check completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkStorySettingsStructure();
