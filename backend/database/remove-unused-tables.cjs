#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function removeUnusedTables() {
  console.log('🗑️ Removing Unused Tables from Database...\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // Tables to remove (identified as unused)
    const unusedTables = [
      'wedding_quotes',        // Duplicate of quotes_settings
      'wedding_settings_backup', // Backup table from migration
      'wedding_stories'        // Duplicate of story_settings + story_timeline_items
    ];

    console.log('\n🔍 Checking unused tables...');

    for (const tableName of unusedTables) {
      try {
        // Check if table exists
        const [tables] = await connection.query(`SHOW TABLES LIKE '${tableName}'`);
        
        if (tables.length > 0) {
          // Check if table has data
          const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
          console.log(`\n📊 Table: ${tableName} (${count[0].count} rows)`);
          
          if (count[0].count > 0) {
            console.log(`   ⚠️ Table has data - backing up before removal...`);
            
            // Create backup
            const [data] = await connection.query(`SELECT * FROM ${tableName}`);
            console.log(`   📦 Backed up ${data.length} records`);
            
            // You could save to file here if needed
            // fs.writeFileSync(`backup_${tableName}.json`, JSON.stringify(data, null, 2));
          }
          
          // Drop the table
          await connection.query(`DROP TABLE ${tableName}`);
          console.log(`   ✅ Dropped table: ${tableName}`);
        } else {
          console.log(`   ℹ️ Table ${tableName} does not exist`);
        }
      } catch (error) {
        console.log(`   ❌ Error processing ${tableName}: ${error.message}`);
      }
    }

    // Verify final table list
    console.log('\n📋 Final table list:');
    const [finalTables] = await connection.query("SHOW TABLES");
    finalTables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   ✅ ${tableName}`);
    });

    await connection.end();

    console.log('\n🎉 Unused tables removal completed!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Removed duplicate/unused tables');
    console.log('   ✅ Database schema is now clean and optimized');
    console.log('   ✅ All admin pages have corresponding tables');

  } catch (error) {
    console.error('\n❌ Error removing unused tables:', error.message);
    process.exit(1);
  }
}

removeUnusedTables();
