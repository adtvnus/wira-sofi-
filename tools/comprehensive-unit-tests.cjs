#!/usr/bin/env node

// Comprehensive Unit Tests for Wedding Invitation Application
// This script performs detailed testing of all components

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

const fs = require('fs');
const mysql = require('mysql2/promise');

const API_BASE_URL = 'http://localhost:3001/api';

class ComprehensiveUnitTester {
  constructor() {
    this.fetch = null;
    this.token = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
  }

  async initialize() {
    this.fetch = await getFetch();
    console.log('🧪 COMPREHENSIVE UNIT TESTS');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📅 Test Date: ${new Date().toISOString()}`);
    console.log('═══════════════════════════════════════════════════════\n');
  }

  async runTest(testName, testFunction) {
    try {
      console.log(`🔍 Testing: ${testName}`);
      const result = await testFunction();
      
      if (result.success) {
        console.log(`   ✅ PASSED: ${result.message || 'Test completed successfully'}`);
        this.testResults.passed++;
      } else {
        console.log(`   ❌ FAILED: ${result.message || 'Test failed'}`);
        this.testResults.failed++;
      }
      
      this.testResults.total++;
      this.testResults.details.push({
        name: testName,
        success: result.success,
        message: result.message,
        details: result.details || null
      });
      
    } catch (error) {
      console.log(`   💥 ERROR: ${error.message}`);
      this.testResults.failed++;
      this.testResults.total++;
      this.testResults.details.push({
        name: testName,
        success: false,
        message: error.message,
        details: null
      });
    }
  }

  async testDatabaseConnection() {
    try {
      const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'wedding_invitation'
      });
      
      await connection.ping();
      await connection.end();
      
      return { 
        success: true, 
        message: 'Database connection successful' 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Database connection failed: ${error.message}` 
      };
    }
  }

  async testDatabaseSchema() {
    try {
      const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'wedding_invitation'
      });
      
      const [tables] = await connection.query('SHOW TABLES');
      const requiredTables = [
        'admin_users', 'user_sessions', 'wedding_guests', 'wedding_settings',
        'couple_settings', 'quotes_settings', 'story_settings', 'gallery_settings',
        'rsvp_settings', 'thanks_settings', 'invited_settings'
      ];
      
      const existingTables = tables.map(row => Object.values(row)[0]);
      const missingTables = requiredTables.filter(table => !existingTables.includes(table));
      
      await connection.end();
      
      if (missingTables.length === 0) {
        return { 
          success: true, 
          message: `All ${requiredTables.length} required tables exist`,
          details: { existingTables: existingTables.length, requiredTables: requiredTables.length }
        };
      } else {
        return { 
          success: false, 
          message: `Missing tables: ${missingTables.join(', ')}`,
          details: { missing: missingTables, existing: existingTables }
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Schema check failed: ${error.message}` 
      };
    }
  }

  async testAdminUserExists() {
    try {
      const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'wedding_invitation'
      });
      
      const [users] = await connection.query(
        'SELECT id, username, is_active FROM admin_users WHERE username = ? AND is_active = TRUE',
        ['admin']
      );
      
      await connection.end();
      
      if (users.length > 0) {
        return { 
          success: true, 
          message: 'Admin user exists and is active',
          details: { userId: users[0].id, username: users[0].username }
        };
      } else {
        return { 
          success: false, 
          message: 'Admin user not found or inactive' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Admin user check failed: ${error.message}` 
      };
    }
  }

  async testAPIHealth() {
    try {
      const response = await this.fetch(`${API_BASE_URL}/health`);
      
      if (response.ok) {
        const data = await response.json();
        return { 
          success: true, 
          message: 'API health check passed',
          details: data
        };
      } else {
        return { 
          success: false, 
          message: `API health check failed with status ${response.status}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `API health check error: ${error.message}` 
      };
    }
  }

  async testAuthentication() {
    try {
      const response = await this.fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin' })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.token) {
          this.token = data.token;
          return { 
            success: true, 
            message: 'Authentication successful',
            details: { hasToken: !!data.token, user: data.user }
          };
        } else {
          return { 
            success: false, 
            message: 'Authentication response invalid' 
          };
        }
      } else {
        const errorData = await response.text();
        return { 
          success: false, 
          message: `Authentication failed: ${response.status} - ${errorData}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Authentication error: ${error.message}` 
      };
    }
  }

  async testTokenValidation() {
    if (!this.token) {
      return { 
        success: false, 
        message: 'No token available for validation' 
      };
    }

    try {
      const response = await this.fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          success: true, 
          message: 'Token validation successful',
          details: data
        };
      } else {
        return { 
          success: false, 
          message: `Token validation failed: ${response.status}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Token validation error: ${error.message}` 
      };
    }
  }

  async testGuestCRUD() {
    if (!this.token) {
      return { 
        success: false, 
        message: 'No authentication token for CRUD test' 
      };
    }

    try {
      // Test CREATE
      const createResponse = await this.fetch(`${API_BASE_URL}/guests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          guestName: `Unit Test Guest ${Date.now()}`,
          guestEmail: 'unittest@example.com',
          guestPhone: '081234567890',
          guestCount: 1
        })
      });

      if (!createResponse.ok) {
        return { 
          success: false, 
          message: `Guest CREATE failed: ${createResponse.status}` 
        };
      }

      const createData = await createResponse.json();
      const guestId = createData.data?.id;

      if (!guestId) {
        return { 
          success: false, 
          message: 'Guest CREATE did not return valid ID' 
        };
      }

      // Test READ
      const readResponse = await this.fetch(`${API_BASE_URL}/guests`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      if (!readResponse.ok) {
        return { 
          success: false, 
          message: `Guest READ failed: ${readResponse.status}` 
        };
      }

      // Test UPDATE
      const updateResponse = await this.fetch(`${API_BASE_URL}/guests/${guestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          guestName: `Updated Unit Test Guest ${Date.now()}`,
          guestEmail: 'updated@example.com',
          guestPhone: '081234567890',
          guestCount: 2
        })
      });

      if (!updateResponse.ok) {
        return { 
          success: false, 
          message: `Guest UPDATE failed: ${updateResponse.status}` 
        };
      }

      // Test DELETE
      const deleteResponse = await this.fetch(`${API_BASE_URL}/guests/${guestId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      if (!deleteResponse.ok) {
        return { 
          success: false, 
          message: `Guest DELETE failed: ${deleteResponse.status}` 
        };
      }

      return { 
        success: true, 
        message: 'Guest CRUD operations successful',
        details: { guestId, operations: ['CREATE', 'READ', 'UPDATE', 'DELETE'] }
      };

    } catch (error) {
      return { 
        success: false, 
        message: `Guest CRUD error: ${error.message}` 
      };
    }
  }

  async testFileStructure() {
    const criticalFiles = [
      'package.json',
      'backend/server.cjs',
      'backend/database/setup.cjs',
      'src/App.tsx',
      'src/main.tsx',
      'vite.config.ts',
      'tailwind.config.js'
    ];

    const missingFiles = [];
    const existingFiles = [];

    for (const file of criticalFiles) {
      if (fs.existsSync(file)) {
        existingFiles.push(file);
      } else {
        missingFiles.push(file);
      }
    }

    if (missingFiles.length === 0) {
      return { 
        success: true, 
        message: `All ${criticalFiles.length} critical files exist`,
        details: { existing: existingFiles.length, total: criticalFiles.length }
      };
    } else {
      return { 
        success: false, 
        message: `Missing critical files: ${missingFiles.join(', ')}`,
        details: { missing: missingFiles, existing: existingFiles }
      };
    }
  }

  async runAllTests() {
    await this.initialize();

    console.log('1. 🗄️ DATABASE TESTS');
    console.log('─────────────────────────────────────────────────────');
    await this.runTest('Database Connection', () => this.testDatabaseConnection());
    await this.runTest('Database Schema', () => this.testDatabaseSchema());
    await this.runTest('Admin User Exists', () => this.testAdminUserExists());

    console.log('\n2. 🌐 API TESTS');
    console.log('─────────────────────────────────────────────────────');
    await this.runTest('API Health Check', () => this.testAPIHealth());
    await this.runTest('Authentication', () => this.testAuthentication());
    await this.runTest('Token Validation', () => this.testTokenValidation());

    console.log('\n3. 🎯 FUNCTIONALITY TESTS');
    console.log('─────────────────────────────────────────────────────');
    await this.runTest('Guest CRUD Operations', () => this.testGuestCRUD());

    console.log('\n4. 📁 STRUCTURE TESTS');
    console.log('─────────────────────────────────────────────────────');
    await this.runTest('File Structure', () => this.testFileStructure());

    this.generateReport();
  }

  generateReport() {
    console.log('\n\n🎯 UNIT TEST REPORT');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📊 Tests Passed: ${this.testResults.passed}/${this.testResults.total}`);
    console.log(`📊 Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
    console.log(`📊 Failed Tests: ${this.testResults.failed}`);

    if (this.testResults.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.testResults.details
        .filter(test => !test.success)
        .forEach((test, index) => {
          console.log(`   ${index + 1}. ${test.name}: ${test.message}`);
        });
    }

    console.log('\n✅ PASSED TESTS:');
    this.testResults.details
      .filter(test => test.success)
      .forEach((test, index) => {
        console.log(`   ${index + 1}. ${test.name}: ${test.message}`);
      });

    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.total,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        successRate: (this.testResults.passed / this.testResults.total) * 100
      },
      details: this.testResults.details
    };

    fs.writeFileSync('tools/unit-test-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Detailed report saved to: tools/unit-test-report.json');
  }
}

// Run the tests
const tester = new ComprehensiveUnitTester();
tester.runAllTests().catch(console.error);
