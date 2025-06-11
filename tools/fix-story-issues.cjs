const mysql = require('mysql2/promise');

async function fixStoryIssues() {
  let connection;
  
  try {
    console.log('🔧 Fixing Story Issues...\n');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });
    
    console.log('✅ Database connected\n');
    
    // Fix 1: Activate all timeline items
    console.log('🔧 FIXING ISSUE 1: Activating all timeline items...');
    const [result1] = await connection.query(`
      UPDATE story_timeline_items 
      SET is_active = 1, updated_at = NOW()
      WHERE wedding_id = 1 AND is_active = 0
    `);
    
    console.log(`✅ Activated ${result1.affectedRows} timeline items`);
    
    // Fix 2: Update story settings with proper title and subtitle
    console.log('\n🔧 FIXING ISSUE 2: Updating story settings...');
    const [result2] = await connection.query(`
      UPDATE story_settings 
      SET 
        header_title = 'Our Love Story',
        header_subtitle = 'Perjalanan Cinta Kami',
        updated_at = NOW()
      WHERE wedding_id = 1 AND (header_title IS NULL OR header_title = 'null')
    `);
    
    console.log(`✅ Updated ${result2.affectedRows} story settings`);
    
    // Verify fixes
    console.log('\n📊 VERIFICATION - STORY SETTINGS:');
    const [storyRows] = await connection.query(`
      SELECT header_title, header_subtitle, is_active
      FROM story_settings 
      WHERE wedding_id = 1 AND is_active = 1
    `);
    
    if (storyRows.length > 0) {
      const story = storyRows[0];
      console.log(`   Title: "${story.header_title}"`);
      console.log(`   Subtitle: "${story.header_subtitle}"`);
      console.log(`   Active: ${story.is_active === 1 ? 'YES' : 'NO'}`);
    }
    
    console.log('\n📊 VERIFICATION - TIMELINE ITEMS:');
    const [timelineRows] = await connection.query(`
      SELECT title, year, is_active, display_order
      FROM story_timeline_items 
      WHERE wedding_id = 1
      ORDER BY display_order ASC
    `);
    
    timelineRows.forEach((item, i) => {
      console.log(`   📝 Item ${i + 1}: "${item.title}" (${item.year}) - Active: ${item.is_active === 1 ? 'YES' : 'NO'}`);
    });
    
    console.log('\n🔍 SIMULATED NEW API RESPONSE:');
    
    const activeTimelineItems = timelineRows.filter(item => item.is_active === 1);
    const apiResponse = {
      success: true,
      data: {
        title: storyRows[0]?.header_title || 'Our Love Story',
        subtitle: storyRows[0]?.header_subtitle || 'Perjalanan Cinta Kami',
        timelineItems: activeTimelineItems.map(item => ({
          year: item.year,
          title: item.title,
          isActive: true
        }))
      }
    };
    
    console.log(JSON.stringify(apiResponse, null, 2));
    
    console.log('\n📊 FINAL ANALYSIS:');
    console.log(`   Active Timeline Items: ${activeTimelineItems.length}`);
    console.log(`   Story Settings Fixed: ${result2.affectedRows > 0 ? 'YES' : 'NO'}`);
    console.log(`   Timeline Items Fixed: ${result1.affectedRows > 0 ? 'YES' : 'NO'}`);
    
    if (activeTimelineItems.length > 0) {
      console.log('\n✅ SUCCESS: Story.tsx should now display timeline items!');
    } else {
      console.log('\n❌ ISSUE: Still no active timeline items');
    }
    
    console.log('\n✅ Fix completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixStoryIssues();
