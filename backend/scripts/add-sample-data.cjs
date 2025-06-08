#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function addSampleGuests() {
  console.log('👥 Adding Sample Guests for URL Parameter Testing...\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wedding_invitation'
    });

    console.log('✅ Connected to database');

    // Get wedding ID
    const [weddings] = await connection.query('SELECT id FROM wedding_settings WHERE is_active = 1 LIMIT 1');
    
    if (weddings.length === 0) {
      console.log('❌ No active wedding found. Please create wedding settings first.');
      return;
    }

    const weddingId = weddings[0].id;
    console.log(`📋 Using wedding ID: ${weddingId}`);

    // Sample guests data
    const sampleGuests = [
      {
        guest_name: 'Ahmad Budi',
        guest_email: 'ahmad.budi@email.com',
        guest_phone: '+62 812 3456 7890',
        guest_count: 2,
        invitation_code: 'AHMAD001'
      },
      {
        guest_name: 'Siti Nurhaliza',
        guest_email: 'siti.nurhaliza@email.com',
        guest_phone: '+62 813 4567 8901',
        guest_count: 1,
        invitation_code: 'SITI002'
      },
      {
        guest_name: 'John Doe',
        guest_email: 'john.doe@email.com',
        guest_phone: '+62 814 5678 9012',
        guest_count: 3,
        invitation_code: 'JOHN003'
      },
      {
        guest_name: 'Jane Smith',
        guest_email: 'jane.smith@email.com',
        guest_phone: '+62 815 6789 0123',
        guest_count: 2,
        invitation_code: 'JANE004'
      },
      {
        guest_name: 'Budi Santoso',
        guest_email: 'budi.santoso@email.com',
        guest_phone: '+62 816 7890 1234',
        guest_count: 4,
        invitation_code: 'BUDI005'
      },
      {
        guest_name: 'Maria Garcia',
        guest_email: 'maria.garcia@email.com',
        guest_phone: '+62 817 8901 2345',
        guest_count: 1,
        invitation_code: 'MARIA006'
      }
    ];

    console.log(`\n📝 Adding ${sampleGuests.length} sample guests...`);

    for (const guest of sampleGuests) {
      // Check if guest already exists
      const [existing] = await connection.query(
        'SELECT id FROM wedding_guests WHERE guest_name = ? AND wedding_id = ?',
        [guest.guest_name, weddingId]
      );

      if (existing.length > 0) {
        console.log(`   ⚠️ Guest "${guest.guest_name}" already exists, skipping...`);
        continue;
      }

      // Insert guest
      const [result] = await connection.query(`
        INSERT INTO wedding_guests (
          wedding_id, guest_name, guest_email, guest_phone, 
          invitation_code, guest_count, rsvp_status, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending', 1)
      `, [
        weddingId,
        guest.guest_name,
        guest.guest_email,
        guest.guest_phone,
        guest.invitation_code,
        guest.guest_count
      ]);

      console.log(`   ✅ Added: ${guest.guest_name} (ID: ${result.insertId})`);
    }

    // Verify guests
    const [allGuests] = await connection.query(`
      SELECT guest_name, guest_email, guest_count, invitation_code, rsvp_status
      FROM wedding_guests 
      WHERE wedding_id = ? AND is_active = 1
      ORDER BY created_at DESC
    `, [weddingId]);

    console.log(`\n📊 Total guests in database: ${allGuests.length}`);
    console.log('\n👥 Guest list:');
    allGuests.forEach((guest, index) => {
      console.log(`   ${index + 1}. ${guest.guest_name} (${guest.guest_count} orang) - ${guest.rsvp_status}`);
      console.log(`      📧 ${guest.guest_email}`);
      console.log(`      🎫 Code: ${guest.invitation_code}`);
      console.log(`      🔗 URL: /main/${guest.guest_name.replace(/\s+/g, '-')}`);
      console.log('');
    });

    await connection.end();

    console.log('🎉 Sample guests added successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Open Guest Management: http://localhost:5173/admin/guest-management');
    console.log('2. Test URL parameters:');
    console.log('   - http://localhost:5173/main/Ahmad-Budi');
    console.log('   - http://localhost:5173/main/John-Doe');
    console.log('   - http://localhost:5173/rsvp/Jane-Smith');
    console.log('3. Check if names appear automatically in the invitation');

  } catch (error) {
    console.error('\n❌ Failed to add sample guests:', error.message);
    process.exit(1);
  }
}

addSampleGuests();
