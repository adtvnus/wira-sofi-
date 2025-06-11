const mysql = require('mysql2/promise');

async function activateTimelineItems() {
  let connection;
  
  try {
    console.log('🔧 Activating all timeline items...\n');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });
    
    console.log('✅ Database connected\n');
    
    // Check current status
    console.log('📊 CURRENT TIMELINE ITEMS STATUS:');
    const [currentItems] = await connection.query(`
      SELECT id, title, year, is_active 
      FROM story_timeline_items 
      WHERE wedding_id = 1 
      ORDER BY display_order ASC
    `);
    
    if (currentItems.length === 0) {
      console.log('❌ No timeline items found');
      return;
    }
    
    currentItems.forEach((item, i) => {
      console.log(`   📝 Item ${i + 1}: "${item.title}" (${item.year}) - Active: ${item.is_active === 1 ? 'YES' : 'NO'}`);
    });
    
    // Activate all timeline items
    console.log('\n🔄 Activating all timeline items...');
    const [result] = await connection.query(`
      UPDATE story_timeline_items 
      SET is_active = 1, updated_at = NOW()
      WHERE wedding_id = 1
    `);
    
    console.log(`✅ Updated ${result.affectedRows} timeline items`);
    
    // Check updated status
    console.log('\n📊 UPDATED TIMELINE ITEMS STATUS:');
    const [updatedItems] = await connection.query(`
      SELECT id, title, year, is_active 
      FROM story_timeline_items 
      WHERE wedding_id = 1 
      ORDER BY display_order ASC
    `);
    
    updatedItems.forEach((item, i) => {
      console.log(`   📝 Item ${i + 1}: "${item.title}" (${item.year}) - Active: ${item.is_active === 1 ? 'YES' : 'NO'}`);
    });
    
    console.log('\n✅ All timeline items activated successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

activateTimelineItems();
