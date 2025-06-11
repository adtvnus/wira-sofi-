#!/usr/bin/env node

// Check for static tables that don't update from CRUD operations

const mysql = require('mysql2/promise');

async function checkStaticTables() {
  console.log('🔍 CHECKING FOR STATIC TABLES IN DATABASE');
  console.log('═══════════════════════════════════════════════════════');
  
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });
    
    console.log('✅ Connected to database');
    
    // Get all tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📊 FOUND TABLES:');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });
    
    console.log('\n🔍 ANALYZING EACH TABLE FOR STATIC DATA:');
    console.log('═══════════════════════════════════════════════════════');
    
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      
      console.log(`\n📋 TABLE: ${tableName}`);
      console.log('─'.repeat(50));
      
      try {
        // Get table structure
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log('   Columns:', columns.map(col => col.Field).join(', '));
        
        // Get row count
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        const rowCount = countResult[0].count;
        console.log(`   Row count: ${rowCount}`);
        
        // Get sample data (first 3 rows)
        const [sampleData] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 3`);
        
        if (sampleData.length > 0) {
          console.log('   Sample data:');
          sampleData.forEach((row, index) => {
            console.log(`     Row ${index + 1}:`, JSON.stringify(row, null, 2));
          });
        } else {
          console.log('   ⚠️ Table is empty');
        }
        
        // Check if table has CRUD endpoints
        const hasCrudEndpoints = await checkCrudEndpoints(tableName);
        console.log(`   CRUD endpoints: ${hasCrudEndpoints ? '✅ Available' : '❌ Missing'}`);
        
        // Analyze if data looks static
        const isStatic = analyzeStaticData(tableName, sampleData, rowCount);
        if (isStatic.isStatic) {
          console.log(`   🚨 POTENTIALLY STATIC: ${isStatic.reason}`);
        } else {
          console.log(`   ✅ Dynamic data detected`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error analyzing table: ${error.message}`);
      }
    }
    
    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('═══════════════════════════════════════════════════════');
    
    // Check specific known issues
    await checkSpecificIssues(connection);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n👋 Database connection closed');
    }
  }
}

function checkCrudEndpoints(tableName) {
  // List of tables that should have CRUD endpoints
  const crudTables = [
    'bride_groom',
    'bride_groom_detail', 
    'wedding_settings',
    'guests',
    'rsvp',
    'gallery',
    'quotes',
    'thanks_settings',
    'invited_settings'
  ];
  
  return crudTables.includes(tableName);
}

function analyzeStaticData(tableName, sampleData, rowCount) {
  // Check for signs of static data
  
  // Tables that are expected to be static
  const expectedStaticTables = ['admin_users', 'activity_logs'];
  if (expectedStaticTables.includes(tableName)) {
    return { isStatic: false, reason: 'Expected to be static' };
  }
  
  // Check for hardcoded/test data patterns
  if (sampleData.length > 0) {
    const firstRow = sampleData[0];
    const values = Object.values(firstRow).join(' ').toLowerCase();
    
    // Look for test/placeholder data
    if (values.includes('test') || values.includes('sample') || values.includes('placeholder')) {
      return { isStatic: true, reason: 'Contains test/placeholder data' };
    }
    
    // Check for very old timestamps (indicating no recent updates)
    for (const [key, value] of Object.entries(firstRow)) {
      if (key.includes('created') || key.includes('updated')) {
        if (value && typeof value === 'string') {
          const date = new Date(value);
          const daysSinceUpdate = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceUpdate > 30) {
            return { isStatic: true, reason: `No updates in ${Math.floor(daysSinceUpdate)} days` };
          }
        }
      }
    }
  }
  
  // Check if table has only 1 row (might be configuration)
  if (rowCount === 1) {
    return { isStatic: true, reason: 'Single row table (possibly configuration)' };
  }
  
  return { isStatic: false, reason: 'Appears dynamic' };
}

async function checkSpecificIssues(connection) {
  console.log('\n🔍 CHECKING SPECIFIC KNOWN ISSUES:');
  
  try {
    // Check defaultWeddingData usage
    console.log('\n1. 📊 Checking for hardcoded default data usage...');
    
    // Check bride_groom table
    const [brideGroomData] = await connection.execute('SELECT * FROM bride_groom LIMIT 1');
    if (brideGroomData.length > 0) {
      const data = brideGroomData[0];
      console.log('   Bride-Groom data:', {
        groom: `${data.groom_first_name} ${data.groom_last_name}`,
        bride: `${data.bride_first_name} ${data.bride_last_name}`,
        lastUpdated: data.updated_at || 'No timestamp'
      });
    }
    
    // Check wedding_settings table
    const [weddingSettings] = await connection.execute('SELECT * FROM wedding_settings LIMIT 1');
    if (weddingSettings.length > 0) {
      const settings = weddingSettings[0];
      console.log('   Wedding settings:', {
        eventDate: settings.event_date,
        venue: settings.venue_name,
        lastUpdated: settings.updated_at || 'No timestamp'
      });
    }
    
    // Check for tables that might need CRUD but don't have it
    console.log('\n2. 🔧 Tables that might need CRUD endpoints:');
    
    const [allTables] = await connection.execute('SHOW TABLES');
    for (const table of allTables) {
      const tableName = Object.values(table)[0];
      
      // Skip system tables
      if (['admin_users', 'activity_logs'].includes(tableName)) continue;
      
      const hasCrud = checkCrudEndpoints(tableName);
      if (!hasCrud) {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`   ❌ ${tableName} (${count[0].count} rows) - No CRUD endpoints`);
      }
    }
    
    // Check for data that should be dynamic but isn't
    console.log('\n3. 🔄 Checking for data that should update but might be static:');
    
    // Check if frontend components are using database data or hardcoded data
    const criticalTables = ['bride_groom', 'wedding_settings', 'quotes', 'gallery'];
    
    for (const tableName of criticalTables) {
      try {
        const [data] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 1`);
        if (data.length > 0) {
          const row = data[0];
          
          // Check for updated_at field
          if (row.updated_at) {
            const lastUpdate = new Date(row.updated_at);
            const hoursAgo = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
            
            if (hoursAgo > 24) {
              console.log(`   ⚠️ ${tableName}: Last updated ${Math.floor(hoursAgo)} hours ago`);
            } else {
              console.log(`   ✅ ${tableName}: Recently updated (${Math.floor(hoursAgo)} hours ago)`);
            }
          } else {
            console.log(`   ❌ ${tableName}: No updated_at timestamp`);
          }
        }
      } catch (error) {
        console.log(`   ❌ ${tableName}: Error checking - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking specific issues:', error.message);
  }
}

// Run the check
checkStaticTables().catch(console.error);
