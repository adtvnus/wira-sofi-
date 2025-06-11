const mysql = require('mysql2/promise');

async function debugStoryAPI() {
  let connection;
  
  try {
    console.log('🔍 Debugging Story API data...\n');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });
    
    console.log('✅ Database connected\n');
    
    // Simulate the exact query from API
    console.log('📊 STORY SETTINGS (API Query):');
    const [storyRows] = await connection.query(`
      SELECT header_title as title, header_subtitle as subtitle
      FROM story_settings 
      WHERE wedding_id = 1 AND is_active = 1
      ORDER BY updated_at DESC 
      LIMIT 1
    `);
    
    console.log('Story Settings Result:', storyRows);
    
    // Simulate the exact timeline query from API
    console.log('\n📊 TIMELINE ITEMS (API Query):');
    const [timelineRows] = await connection.query(`
      SELECT year, title, date, description, icon, color, bg_color, display_order
      FROM story_timeline_items 
      WHERE wedding_id = 1 AND is_active = 1
      ORDER BY display_order ASC
    `);
    
    console.log('Timeline Items Result:');
    timelineRows.forEach((item, i) => {
      console.log(`   📝 Item ${i + 1}:`);
      console.log(`      Year: "${item.year}"`);
      console.log(`      Title: "${item.title}"`);
      console.log(`      Date: "${item.date}"`);
      console.log(`      Description: "${item.description}"`);
      console.log(`      Icon: "${item.icon}"`);
      console.log(`      Color: "${item.color}"`);
      console.log(`      BG Color: "${item.bg_color}"`);
      console.log(`      Display Order: ${item.display_order}`);
    });
    
    // Check what the API would return
    const storySettings = storyRows.length > 0 ? storyRows[0] : {
      title: 'Our Love Story',
      subtitle: 'Perjalanan Cinta Kami'
    };
    
    const timelineItems = timelineRows.map(item => ({
      year: item.year,
      title: item.title,
      date: item.date,
      description: item.description,
      icon: item.icon,
      color: item.color,
      bgColor: item.bg_color || 'from-rose-100/20 to-pink-100/20'
    }));
    
    const apiResponse = {
      success: true,
      data: {
        ...storySettings,
        timelineItems
      }
    };
    
    console.log('\n🔍 SIMULATED API RESPONSE:');
    console.log(JSON.stringify(apiResponse, null, 2));
    
    console.log('\n📊 ANALYSIS:');
    console.log(`   Story Settings Found: ${storyRows.length > 0 ? 'YES' : 'NO'}`);
    console.log(`   Timeline Items Count: ${timelineRows.length}`);
    console.log(`   Timeline Items Active: ${timelineRows.length} (all should be active)`);
    
    if (timelineRows.length === 0) {
      console.log('\n❌ NO ACTIVE TIMELINE ITEMS FOUND!');
      console.log('   This explains why Story.tsx shows "No story timeline available"');
      
      // Check if there are any timeline items at all
      const [allTimelineRows] = await connection.query(`
        SELECT id, title, year, is_active, display_order
        FROM story_timeline_items 
        WHERE wedding_id = 1
        ORDER BY display_order ASC
      `);
      
      console.log('\n📊 ALL TIMELINE ITEMS (including inactive):');
      allTimelineRows.forEach((item, i) => {
        console.log(`   📝 Item ${i + 1}: "${item.title}" (${item.year}) - Active: ${item.is_active === 1 ? 'YES' : 'NO'}`);
      });
    }
    
    console.log('\n✅ Debug completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

debugStoryAPI();
