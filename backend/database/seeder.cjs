#!/usr/bin/env node

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function seedDatabase() {
  console.log('🌱 Seeding Wedding Invitation Database...\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await connection.query('DELETE FROM activity_logs');
    await connection.query('DELETE FROM user_sessions');
    await connection.query('DELETE FROM wedding_guests');
    await connection.query('DELETE FROM wedding_settings');
    await connection.query('DELETE FROM admin_users');

    // Reset auto increment
    await connection.query('ALTER TABLE admin_users AUTO_INCREMENT = 1');
    await connection.query('ALTER TABLE wedding_settings AUTO_INCREMENT = 1');
    await connection.query('ALTER TABLE wedding_guests AUTO_INCREMENT = 1');

    console.log('✅ Database cleared');

    // Create admin users with easy passwords
    const adminUsers = [
      {
        username: 'admin',
        email: 'admin@wedding.com',
        password: 'admin',
        fullName: 'Super Admin',
        role: 'super_admin'
      },
      {
        username: 'wira',
        email: 'wira@wedding.com',
        password: 'wira123',
        fullName: 'Wira Saputra',
        role: 'admin'
      },
      {
        username: 'sofi',
        email: 'sofi@wedding.com',
        password: 'sofi123',
        fullName: 'Sofi Andriani',
        role: 'admin'
      },
      {
        username: 'demo',
        email: 'demo@wedding.com',
        password: '123',
        fullName: 'Demo User',
        role: 'editor'
      }
    ];

    console.log('👥 Creating admin users...');
    for (const user of adminUsers) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      
      const [result] = await connection.query(`
        INSERT INTO admin_users (username, email, password_hash, full_name, role, is_active)
        VALUES (?, ?, ?, ?, ?, TRUE)
      `, [user.username, user.email, passwordHash, user.fullName, user.role]);

      console.log(`   ✅ Created: ${user.username} (${user.role}) - Password: ${user.password}`);
    }

    // Create wedding settings
    console.log('💒 Creating wedding settings...');
    const [weddingResult] = await connection.query(`
      INSERT INTO wedding_settings (
        groom_full_name, groom_first_name, groom_parents,
        bride_full_name, bride_first_name, bride_parents,
        wedding_date, wedding_time, wedding_venue, wedding_address,
        reception_date, reception_time, reception_venue, reception_address,
        created_by, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
    `, [
      'Wira Saputra', 'Wira', 'Bapak Agus Saputra & Ibu Siti Saputra',
      'Sofi Andriani', 'Sofi', 'Bapak Budi Andriani & Ibu Rina Andriani',
      '2024-12-25', '10:00:00', 'Gedung Serbaguna Merdeka', 'Jl. Merdeka No. 123, Jakarta Pusat',
      '2024-12-25', '18:00:00', 'Hotel Grand Ballroom', 'Jl. Sudirman No. 456, Jakarta Selatan',
      1
    ]);

    console.log('✅ Wedding settings created');

    // Create sample guests
    const sampleGuests = [
      { name: 'Ahmad Budi Santoso', email: 'ahmad.budi@email.com', phone: '+62 812 3456 7890', count: 2 },
      { name: 'Siti Nurhaliza', email: 'siti.nurhaliza@email.com', phone: '+62 813 4567 8901', count: 1 },
      { name: 'John Doe', email: 'john.doe@email.com', phone: '+62 814 5678 9012', count: 3 },
      { name: 'Jane Smith', email: 'jane.smith@email.com', phone: '+62 815 6789 0123', count: 2 },
      { name: 'Budi Santoso', email: 'budi.santoso@email.com', phone: '+62 816 7890 1234', count: 4 },
      { name: 'Maria Garcia', email: 'maria.garcia@email.com', phone: '+62 817 8901 2345', count: 1 },
      { name: 'Aditya Nugraha Pratama Saiya', email: 'aditya.nugraha@email.com', phone: '+62 818 9012 3456', count: 2 },
      { name: 'Dewi Sartika', email: 'dewi.sartika@email.com', phone: '+62 819 0123 4567', count: 1 },
      { name: 'Rudi Hermawan', email: 'rudi.hermawan@email.com', phone: '+62 820 1234 5678', count: 3 },
      { name: 'Lisa Permata', email: 'lisa.permata@email.com', phone: '+62 821 2345 6789', count: 2 }
    ];

    console.log('👥 Creating sample guests...');
    for (const guest of sampleGuests) {
      const invitationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      await connection.query(`
        INSERT INTO wedding_guests (
          wedding_id, guest_name, guest_email, guest_phone, 
          invitation_code, guest_count, rsvp_status, created_by, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, TRUE)
      `, [weddingResult.insertId, guest.name, guest.email, guest.phone, invitationCode, guest.count, 1]);

      console.log(`   ✅ Added guest: ${guest.name}`);
    }

    await connection.end();

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n🔐 Login Credentials:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│                    ADMIN ACCOUNTS                       │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Username: admin     | Password: admin     | Super Admin │');
    console.log('│ Username: wira      | Password: wira123   | Admin       │');
    console.log('│ Username: sofi      | Password: sofi123   | Admin       │');
    console.log('│ Username: demo      | Password: 123       | Editor      │');
    console.log('└─────────────────────────────────────────────────────────┘');
    
    console.log('\n📊 Database Summary:');
    console.log(`   👥 Admin Users: ${adminUsers.length}`);
    console.log(`   💒 Wedding Settings: 1`);
    console.log(`   🎊 Sample Guests: ${sampleGuests.length}`);
    
    console.log('\n🚀 Ready to use:');
    console.log('   1. Start API server: node api-server-auth.cjs');
    console.log('   2. Access login: http://localhost:5173/admin/login');
    console.log('   3. Use any of the credentials above');
    console.log('   4. Enjoy the wedding invitation system!');

  } catch (error) {
    console.error('\n❌ Database seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
