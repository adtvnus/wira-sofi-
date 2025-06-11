const mysql = require('mysql2/promise');

async function debugStorySave() {
  let connection;
  
  try {
    console.log('🔍 Debugging Story Save Process...\n');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });
    
    console.log('✅ Database connected\n');
    
    // Check current story settings
    console.log('📊 CURRENT STORY SETTINGS:');
    const [storyRows] = await connection.query(`
      SELECT id, header_title, header_subtitle, is_active, created_at, updated_at
      FROM story_settings 
      WHERE wedding_id = 1
      ORDER BY updated_at DESC
    `);
    
    if (storyRows.length === 0) {
      console.log('❌ No story settings found');
    } else {
      storyRows.forEach((row, i) => {
        console.log(`   📝 Setting ${i + 1}:`);
        console.log(`      ID: ${row.id}`);
        console.log(`      Title: "${row.header_title}"`);
        console.log(`      Subtitle: "${row.header_subtitle}"`);
        console.log(`      Active: ${row.is_active === 1 ? 'YES' : 'NO'}`);
        console.log(`      Created: ${row.created_at}`);
        console.log(`      Updated: ${row.updated_at}`);
        console.log('');
      });
    }
    
    // Check current timeline items
    console.log('📊 CURRENT TIMELINE ITEMS:');
    const [timelineRows] = await connection.query(`
      SELECT id, title, year, date, description, icon, color, bg_color, is_active, display_order, created_at, updated_at
      FROM story_timeline_items 
      WHERE wedding_id = 1
      ORDER BY display_order ASC, updated_at DESC
    `);
    
    if (timelineRows.length === 0) {
      console.log('❌ No timeline items found');
    } else {
      console.log(`   Found ${timelineRows.length} timeline items:`);
      timelineRows.forEach((item, i) => {
        console.log(`   📝 Item ${i + 1}:`);
        console.log(`      ID: ${item.id}`);
        console.log(`      Title: "${item.title}"`);
        console.log(`      Year: "${item.year}"`);
        console.log(`      Date: "${item.date}"`);
        console.log(`      Description: "${item.description}"`);
        console.log(`      Icon: "${item.icon}"`);
        console.log(`      Color: "${item.color}"`);
        console.log(`      BG Color: "${item.bg_color}"`);
        console.log(`      Active: ${item.is_active === 1 ? 'YES' : 'NO'}`);
        console.log(`      Display Order: ${item.display_order}`);
        console.log(`      Created: ${item.created_at}`);
        console.log(`      Updated: ${item.updated_at}`);
        console.log('');
      });
    }
    
    // Simulate API response
    console.log('🔍 SIMULATED API RESPONSE (/api/story-settings/public):');
    
    const activeStorySettings = storyRows.filter(row => row.is_active === 1);
    const activeTimelineItems = timelineRows.filter(item => item.is_active === 1);
    
    const storySettings = activeStorySettings.length > 0 ? activeStorySettings[0] : {
      header_title: 'Our Love Story',
      header_subtitle: 'Perjalanan Cinta Kami'
    };
    
    const timelineItems = activeTimelineItems.map(item => ({
      year: item.year,
      title: item.title,
      date: item.date,
      description: item.description,
      icon: item.icon,
      color: item.color,
      bgColor: item.bg_color || 'from-rose-100/20 to-pink-100/20',
      isActive: true
    }));
    
    const apiResponse = {
      success: true,
      data: {
        title: storySettings.header_title,
        subtitle: storySettings.header_subtitle,
        timelineItems
      }
    };
    
    console.log(JSON.stringify(apiResponse, null, 2));
    
    console.log('\n📊 ANALYSIS:');
    console.log(`   Total Story Settings: ${storyRows.length}`);
    console.log(`   Active Story Settings: ${activeStorySettings.length}`);
    console.log(`   Total Timeline Items: ${timelineRows.length}`);
    console.log(`   Active Timeline Items: ${activeTimelineItems.length}`);
    
    if (activeTimelineItems.length === 0) {
      console.log('\n❌ NO ACTIVE TIMELINE ITEMS!');
      console.log('   This is why Story.tsx shows "No story timeline available"');
      
      if (timelineRows.length > 0) {
        console.log('\n💡 SOLUTION: Activate timeline items');
        console.log('   Run: UPDATE story_timeline_items SET is_active = 1 WHERE wedding_id = 1');
      } else {
        console.log('\n💡 SOLUTION: Add timeline items in admin');
        console.log('   Go to: http://localhost:5173/admin/story-management');
      }
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

debugStorySave();
