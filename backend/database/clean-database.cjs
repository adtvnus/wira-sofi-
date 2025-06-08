#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

async function cleanDatabase() {
  console.log('🧹 Cleaning and Reorganizing Wedding Invitation Database...\n');

  try {
    // Connect to MySQL server (without database)
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL server');

    // Read and execute clean schema
    console.log('📋 Reading clean schema...');
    const schemaPath = path.join(__dirname, 'clean-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('🗑️ Dropping old database and creating clean structure...');
    await connection.query(schema);

    console.log('✅ Clean database structure created');

    // Connect to the new database
    await connection.changeUser({ database: 'wedding_invitation' });

    // Create proper admin user with hashed password
    console.log('👤 Creating admin user with proper password...');
    const adminPassword = 'admin';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await connection.query(`
      UPDATE admin_users 
      SET password_hash = ? 
      WHERE username = 'admin'
    `, [passwordHash]);

    console.log('✅ Admin user password set');

    // Log the cleanup activity
    await connection.query(`
      INSERT INTO activity_logs (user_id, action_type, description, ip_address)
      VALUES (1, 'CREATE', 'Database cleaned and reorganized with new schema', '127.0.0.1')
    `);

    await connection.end();

    console.log('\n🎉 Database cleaning completed successfully!');
    
    console.log('\n📊 New Database Structure:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│                    CLEAN DATABASE                       │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ 🔐 Authentication Tables:                               │');
    console.log('│    • admin_users (User management)                     │');
    console.log('│    • user_sessions (Session tracking)                  │');
    console.log('│                                                         │');
    console.log('│ 💒 Wedding Configuration:                               │');
    console.log('│    • wedding_settings (Main config)                    │');
    console.log('│    • wedding_stories (Story timeline)                  │');
    console.log('│    • wedding_quotes (Quotes & messages)                │');
    console.log('│                                                         │');
    console.log('│ 👥 Guest Management:                                    │');
    console.log('│    • wedding_guests (Guest & RSVP data)                │');
    console.log('│                                                         │');
    console.log('│ 🖼️ Media Management:                                    │');
    console.log('│    • wedding_gallery (Photos & images)                 │');
    console.log('│                                                         │');
    console.log('│ 📋 System Monitoring:                                   │');
    console.log('│    • activity_logs (Activity tracking)                 │');
    console.log('│                                                         │');
    console.log('│ 👁️ Views for Easy Access:                               │');
    console.log('│    • v_active_guests (Active guest view)               │');
    console.log('│    • v_rsvp_summary (RSVP statistics)                  │');
    console.log('└─────────────────────────────────────────────────────────┘');

    console.log('\n🔑 Login Credentials:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│                    ADMIN ACCESS                         │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Username: admin                                         │');
    console.log('│ Password: admin                                         │');
    console.log('│ Role: Super Admin                                       │');
    console.log('└─────────────────────────────────────────────────────────┘');

    console.log('\n✨ Benefits of Clean Structure:');
    console.log('   🗂️ Organized tables by functionality');
    console.log('   🔗 Proper foreign key relationships');
    console.log('   📊 Optimized indexes for performance');
    console.log('   👁️ Views for easy data access');
    console.log('   🧹 No dummy data - clean start');
    console.log('   📈 Scalable structure for future features');

    console.log('\n🚀 Next Steps:');
    console.log('   1. Start backend: npm run backend');
    console.log('   2. Start frontend: npm run dev');
    console.log('   3. Login: http://localhost:5173/admin/login');
    console.log('   4. Configure wedding settings');
    console.log('   5. Add real guest data');

    console.log('\n🎊 Database is now clean and ready for production use!');

  } catch (error) {
    console.error('\n❌ Database cleaning failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

cleanDatabase();
