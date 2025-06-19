const mysql = require('mysql2/promise');

async function fixMySQLPacketSize() {
  let connection;
  
  try {
    console.log('🔧 Fixing MySQL max_allowed_packet size...\n');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });
    
    console.log('✅ Database connected\n');
    
    // Check current max_allowed_packet
    console.log('📊 CHECKING CURRENT MAX_ALLOWED_PACKET:');
    const [currentPacket] = await connection.query(`
      SHOW VARIABLES LIKE 'max_allowed_packet'
    `);
    
    if (currentPacket.length > 0) {
      const currentSize = parseInt(currentPacket[0].Value);
      const currentSizeMB = (currentSize / (1024 * 1024)).toFixed(2);
      console.log(`   Current max_allowed_packet: ${currentSize} bytes (${currentSizeMB} MB)`);
      
      // Check if it's already large enough (16MB = 16777216 bytes)
      const targetSize = 16 * 1024 * 1024; // 16MB
      
      if (currentSize >= targetSize) {
        console.log('✅ max_allowed_packet is already large enough');
      } else {
        console.log(`❌ max_allowed_packet is too small (need at least 16MB)`);
        console.log('\n🔧 SETTING MAX_ALLOWED_PACKET TO 16MB...');
        
        try {
          // Set for current session
          await connection.query(`SET SESSION max_allowed_packet = ${targetSize}`);
          console.log('✅ Session max_allowed_packet set to 16MB');
          
          // Set globally (requires SUPER privilege)
          await connection.query(`SET GLOBAL max_allowed_packet = ${targetSize}`);
          console.log('✅ Global max_allowed_packet set to 16MB');
          
        } catch (error) {
          console.log('⚠️ Could not set global max_allowed_packet (may need SUPER privilege)');
          console.log('   Error:', error.message);
          console.log('\n💡 MANUAL SOLUTION:');
          console.log('   1. Add to MySQL configuration file (my.cnf or my.ini):');
          console.log('      [mysqld]');
          console.log('      max_allowed_packet = 16M');
          console.log('   2. Restart MySQL server');
          console.log('   3. Or run as MySQL admin: SET GLOBAL max_allowed_packet = 16777216;');
        }
      }
    }
    
    // Check other relevant settings
    console.log('\n📊 CHECKING OTHER MYSQL SETTINGS:');
    
    const settings = [
      'max_allowed_packet',
      'innodb_buffer_pool_size',
      'key_buffer_size',
      'tmp_table_size',
      'max_heap_table_size'
    ];
    
    for (const setting of settings) {
      try {
        const [result] = await connection.query(`SHOW VARIABLES LIKE '${setting}'`);
        if (result.length > 0) {
          const value = result[0].Value;
          const valueMB = isNaN(value) ? value : (parseInt(value) / (1024 * 1024)).toFixed(2) + ' MB';
          console.log(`   ${setting}: ${valueMB}`);
        }
      } catch (error) {
        console.log(`   ${setting}: Could not retrieve`);
      }
    }
    
    console.log('\n✅ MySQL packet size check completed!');
    console.log('\n🚀 Now try uploading images in bride-groom-management');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixMySQLPacketSize();
