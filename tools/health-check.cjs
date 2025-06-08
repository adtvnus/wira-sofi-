#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

async function systemHealthCheck() {
  console.log('🏥 Wedding Invitation System Health Check\n');
  console.log('=' .repeat(60));

  let overallHealth = true;
  const issues = [];

  // 1. Environment Variables Check
  console.log('\n1. 🔧 Environment Variables:');
  const requiredEnvVars = [
    'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME', 
    'JWT_SECRET', 'VITE_API_URL'
  ];
  
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (value) {
      console.log(`   ✅ ${envVar}: ${envVar.includes('SECRET') ? '***' : value}`);
    } else {
      console.log(`   ❌ ${envVar}: MISSING`);
      issues.push(`Missing environment variable: ${envVar}`);
      overallHealth = false;
    }
  }

  // 2. Database Connection Check
  console.log('\n2. 🗄️ Database Connection:');
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wedding_invitation'
    });

    console.log('   ✅ Database connection successful');
    
    // Check tables
    const requiredTables = ['admin_users', 'wedding_settings', 'wedding_guests'];
    for (const table of requiredTables) {
      const [rows] = await connection.query(`SHOW TABLES LIKE '${table}'`);
      if (rows.length > 0) {
        console.log(`   ✅ Table ${table} exists`);
      } else {
        console.log(`   ❌ Table ${table} missing`);
        issues.push(`Missing database table: ${table}`);
        overallHealth = false;
      }
    }

    await connection.end();
  } catch (error) {
    console.log(`   ❌ Database connection failed: ${error.message}`);
    issues.push(`Database connection error: ${error.message}`);
    overallHealth = false;
  }

  // 3. API Server Check
  console.log('\n3. 🚀 API Server:');
  const apiUrl = process.env.VITE_API_URL || 'http://localhost:3001/api';
  
  try {
    const response = await fetch(`${apiUrl}/health`);
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ API server is running');
      console.log(`   📊 Status: ${data.status}`);
    } else {
      console.log(`   ❌ API server returned status: ${response.status}`);
      issues.push(`API server returned non-200 status: ${response.status}`);
      overallHealth = false;
    }
  } catch (error) {
    console.log(`   ❌ API server unreachable: ${error.message}`);
    issues.push(`API server unreachable: ${error.message}`);
    overallHealth = false;
  }

  // 4. Authentication System Check
  console.log('\n4. 🔐 Authentication System:');
  try {
    // Test login
    const loginResponse = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      if (loginData.success && loginData.token) {
        console.log('   ✅ Login system working');
        
        // Test token verification
        const meResponse = await fetch(`${apiUrl}/auth/me`, {
          headers: { 'Authorization': `Bearer ${loginData.token}` }
        });

        if (meResponse.ok) {
          console.log('   ✅ Token verification working');
        } else {
          console.log('   ❌ Token verification failed');
          issues.push('Token verification not working');
          overallHealth = false;
        }
      } else {
        console.log('   ❌ Login response invalid');
        issues.push('Login system returning invalid response');
        overallHealth = false;
      }
    } else {
      console.log('   ❌ Login failed');
      issues.push('Login system not working');
      overallHealth = false;
    }
  } catch (error) {
    console.log(`   ❌ Authentication test failed: ${error.message}`);
    issues.push(`Authentication system error: ${error.message}`);
    overallHealth = false;
  }

  // 5. CRUD Operations Check
  console.log('\n5. 📝 CRUD Operations:');
  try {
    // Get token first
    const loginResponse = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });
    
    if (loginResponse.ok) {
      const { token } = await loginResponse.json();
      
      // Test GET guests
      const getResponse = await fetch(`${apiUrl}/guests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (getResponse.ok) {
        console.log('   ✅ GET operations working');
        
        // Test POST (create guest)
        const postResponse = await fetch(`${apiUrl}/guests`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            guestName: 'Health Check Test',
            guestEmail: 'test@healthcheck.com',
            guestPhone: '+62123456789',
            guestCount: 1
          })
        });
        
        if (postResponse.ok) {
          const postData = await postResponse.json();
          console.log('   ✅ POST operations working');
          
          // Test DELETE
          const deleteResponse = await fetch(`${apiUrl}/guests/${postData.data.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (deleteResponse.ok) {
            console.log('   ✅ DELETE operations working');
          } else {
            console.log('   ❌ DELETE operations failed');
            issues.push('DELETE operations not working');
            overallHealth = false;
          }
        } else {
          console.log('   ❌ POST operations failed');
          issues.push('POST operations not working');
          overallHealth = false;
        }
      } else {
        console.log('   ❌ GET operations failed');
        issues.push('GET operations not working');
        overallHealth = false;
      }
    }
  } catch (error) {
    console.log(`   ❌ CRUD operations test failed: ${error.message}`);
    issues.push(`CRUD operations error: ${error.message}`);
    overallHealth = false;
  }

  // 6. File System Check
  console.log('\n6. 📁 File System:');
  const fs = require('fs');
  const requiredDirs = ['uploads', 'src', 'src/pages', 'src/components'];
  
  for (const dir of requiredDirs) {
    if (fs.existsSync(dir)) {
      console.log(`   ✅ Directory ${dir} exists`);
    } else {
      console.log(`   ❌ Directory ${dir} missing`);
      issues.push(`Missing directory: ${dir}`);
      overallHealth = false;
    }
  }

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📋 HEALTH CHECK SUMMARY');
  console.log('=' .repeat(60));

  if (overallHealth) {
    console.log('🎉 SYSTEM STATUS: HEALTHY ✅');
    console.log('All components are working correctly!');
  } else {
    console.log('⚠️  SYSTEM STATUS: ISSUES DETECTED ❌');
    console.log('\n🔧 Issues found:');
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
    
    console.log('\n💡 Recommended actions:');
    console.log('   1. Run: node database-seeder.cjs');
    console.log('   2. Restart API server: node api-server-auth.cjs');
    console.log('   3. Check environment variables in .env file');
    console.log('   4. Ensure MySQL is running');
  }

  console.log('\n🚀 System Components:');
  console.log('   - Frontend: http://localhost:5173 or http://localhost:5174');
  console.log('   - API Server: http://localhost:3001');
  console.log('   - Admin Login: http://localhost:5173/admin/login');
  console.log('   - Database: MySQL on localhost:3306');

  return overallHealth;
}

systemHealthCheck().then(healthy => {
  process.exit(healthy ? 0 : 1);
});
