#!/usr/bin/env node

// Unit Tests for Wedding Invitation Application
// This script performs unit testing on critical components

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Use dynamic import for node-fetch v3
async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

const API_BASE_URL = 'http://localhost:3001/api';

class UnitTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      tests: []
    };
    this.token = null;
    this.fetch = null;
  }

  async initialize() {
    this.fetch = await getFetch();
    console.log('🧪 UNIT TESTING SUITE');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📅 Test Date: ${new Date().toISOString()}`);
    console.log(`🔗 API Base: ${API_BASE_URL}`);
    console.log('═══════════════════════════════════════════════════════\n');
  }

  async authenticate() {
    console.log('🔐 AUTHENTICATION TESTS');
    console.log('─────────────────────────────────────────────────────');
    
    try {
      // Use environment credentials
      const adminUsername = process.env.ADMIN_USERNAME || 'admin';
      const adminPassword = process.env.ADMIN_PASSWORD || 'WeddingAdmin2025!@#SecurePassword';

      console.log(`   Using credentials: ${adminUsername} / ${'*'.repeat(adminPassword.length)}`);

      const response = await this.fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });

      if (response.ok) {
        const data = await response.json();
        this.token = data.token;
        this.addTest('Authentication', 'Login with valid credentials', true);
        console.log('   ✅ Login: SUCCESS');
      } else {
        this.addTest('Authentication', 'Login with valid credentials', false);
        console.log('   ❌ Login: FAILED');
        return false;
      }
    } catch (error) {
      this.addTest('Authentication', 'Login system availability', false);
      console.log('   ❌ Login: ERROR');
      return false;
    }

    // Test invalid credentials
    try {
      const response = await this.fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'invalid', password: 'invalid' })
      });

      if (response.status === 401) {
        this.addTest('Authentication', 'Reject invalid credentials', true);
        console.log('   ✅ Invalid Login Rejection: SUCCESS');
      } else {
        this.addTest('Authentication', 'Reject invalid credentials', false);
        console.log('   ❌ Invalid Login Rejection: FAILED');
      }
    } catch (error) {
      this.addTest('Authentication', 'Invalid credentials handling', false);
      console.log('   ❌ Invalid Login Test: ERROR');
    }

    return true;
  }

  async testGuestManagement() {
    console.log('\n👥 GUEST MANAGEMENT TESTS');
    console.log('─────────────────────────────────────────────────────');
    
    if (!this.token) {
      console.log('   ❌ Cannot test: No authentication token');
      return;
    }

    const testGuest = {
      guestName: `Unit Test Guest ${Date.now()}`,
      guestEmail: 'unittest@example.com',
      guestPhone: '081234567890',
      guestCount: 2
    };

    let guestId = null;

    // Test CREATE
    try {
      const response = await this.fetch(`${API_BASE_URL}/guests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testGuest)
      });

      if (response.ok) {
        const data = await response.json();
        guestId = data.data?.id;
        this.addTest('Guest Management', 'Create new guest', true);
        console.log('   ✅ CREATE Guest: SUCCESS');
      } else {
        this.addTest('Guest Management', 'Create new guest', false);
        console.log('   ❌ CREATE Guest: FAILED');
      }
    } catch (error) {
      this.addTest('Guest Management', 'Create guest operation', false);
      console.log('   ❌ CREATE Guest: ERROR');
    }

    // Test READ
    try {
      const response = await this.fetch(`${API_BASE_URL}/guests`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const hasGuests = data.data && Array.isArray(data.data) && data.data.length > 0;
        this.addTest('Guest Management', 'Read guests list', hasGuests);
        console.log(`   ${hasGuests ? '✅' : '❌'} READ Guests: ${hasGuests ? 'SUCCESS' : 'NO DATA'}`);
      } else {
        this.addTest('Guest Management', 'Read guests list', false);
        console.log('   ❌ READ Guests: FAILED');
      }
    } catch (error) {
      this.addTest('Guest Management', 'Read guests operation', false);
      console.log('   ❌ READ Guests: ERROR');
    }

    // Test UPDATE
    if (guestId) {
      try {
        const updatedGuest = { ...testGuest, guestName: `Updated ${testGuest.guestName}` };
        const response = await this.fetch(`${API_BASE_URL}/guests/${guestId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedGuest)
        });

        if (response.ok) {
          this.addTest('Guest Management', 'Update guest', true);
          console.log('   ✅ UPDATE Guest: SUCCESS');
        } else {
          this.addTest('Guest Management', 'Update guest', false);
          console.log('   ❌ UPDATE Guest: FAILED');
        }
      } catch (error) {
        this.addTest('Guest Management', 'Update guest operation', false);
        console.log('   ❌ UPDATE Guest: ERROR');
      }

      // Test DELETE
      try {
        const response = await this.fetch(`${API_BASE_URL}/guests/${guestId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${this.token}` }
        });

        if (response.ok) {
          this.addTest('Guest Management', 'Delete guest', true);
          console.log('   ✅ DELETE Guest: SUCCESS');
        } else {
          this.addTest('Guest Management', 'Delete guest', false);
          console.log('   ❌ DELETE Guest: FAILED');
        }
      } catch (error) {
        this.addTest('Guest Management', 'Delete guest operation', false);
        console.log('   ❌ DELETE Guest: ERROR');
      }
    }
  }

  async testWeddingSettings() {
    console.log('\n⚙️ WEDDING SETTINGS TESTS');
    console.log('─────────────────────────────────────────────────────');
    
    if (!this.token) {
      console.log('   ❌ Cannot test: No authentication token');
      return;
    }

    // Test GET wedding settings
    try {
      const response = await this.fetch(`${API_BASE_URL}/wedding-settings`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const hasSettings = data.success && data.data;
        this.addTest('Wedding Settings', 'Retrieve settings', hasSettings);
        console.log(`   ${hasSettings ? '✅' : '❌'} GET Settings: ${hasSettings ? 'SUCCESS' : 'NO DATA'}`);
      } else {
        this.addTest('Wedding Settings', 'Retrieve settings', false);
        console.log('   ❌ GET Settings: FAILED');
      }
    } catch (error) {
      this.addTest('Wedding Settings', 'Settings retrieval', false);
      console.log('   ❌ GET Settings: ERROR');
    }

    // Test PUT wedding settings
    try {
      const testSettings = {
        weddingDate: '2025-12-31',
        weddingTime: '14:00',
        weddingVenue: 'Unit Test Venue',
        weddingAddress: 'Test Address 123',
        receptionDate: '2025-12-31',
        receptionTime: '18:00',
        receptionVenue: 'Test Reception Venue',
        receptionAddress: 'Test Reception Address 456'
      };

      const response = await this.fetch(`${API_BASE_URL}/wedding-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testSettings)
      });

      if (response.ok) {
        this.addTest('Wedding Settings', 'Update settings', true);
        console.log('   ✅ PUT Settings: SUCCESS');
      } else {
        this.addTest('Wedding Settings', 'Update settings', false);
        console.log('   ❌ PUT Settings: FAILED');
      }
    } catch (error) {
      this.addTest('Wedding Settings', 'Settings update', false);
      console.log('   ❌ PUT Settings: ERROR');
    }
  }

  async testQuotesManagement() {
    console.log('\n💬 QUOTES MANAGEMENT TESTS');
    console.log('─────────────────────────────────────────────────────');
    
    if (!this.token) {
      console.log('   ❌ Cannot test: No authentication token');
      return;
    }

    // Test GET quotes
    try {
      const response = await this.fetch(`${API_BASE_URL}/quotes`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const hasQuotes = data.success;
        this.addTest('Quotes Management', 'Retrieve quotes', hasQuotes);
        console.log(`   ${hasQuotes ? '✅' : '❌'} GET Quotes: ${hasQuotes ? 'SUCCESS' : 'FAILED'}`);
      } else {
        this.addTest('Quotes Management', 'Retrieve quotes', false);
        console.log('   ❌ GET Quotes: FAILED');
      }
    } catch (error) {
      this.addTest('Quotes Management', 'Quotes retrieval', false);
      console.log('   ❌ GET Quotes: ERROR');
    }

    // Test POST quote
    try {
      const testQuote = {
        quoteText: `Unit test quote ${Date.now()}`,
        quoteAuthor: 'Unit Test Author',
        quoteCategory: 'general',
        displayOrder: 1
      };

      const response = await this.fetch(`${API_BASE_URL}/quotes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testQuote)
      });

      if (response.ok) {
        this.addTest('Quotes Management', 'Create quote', true);
        console.log('   ✅ POST Quote: SUCCESS');
      } else {
        this.addTest('Quotes Management', 'Create quote', false);
        console.log('   ❌ POST Quote: FAILED');
      }
    } catch (error) {
      this.addTest('Quotes Management', 'Quote creation', false);
      console.log('   ❌ POST Quote: ERROR');
    }
  }

  addTest(category, description, passed) {
    this.results.tests.push({
      category,
      description,
      passed,
      timestamp: new Date().toISOString()
    });
    
    if (passed) {
      this.results.passed++;
    } else {
      this.results.failed++;
    }
    this.results.total++;
  }

  generateReport() {
    console.log('\n\n📊 UNIT TEST RESULTS');
    console.log('═══════════════════════════════════════════════════════');
    
    const successRate = this.results.total > 0 ? 
      Math.round((this.results.passed / this.results.total) * 100) : 0;
    
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📊 Total: ${this.results.total}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    console.log('\n📋 TEST BREAKDOWN BY CATEGORY:');
    console.log('─────────────────────────────────────────────────────');
    
    const categories = {};
    this.results.tests.forEach(test => {
      if (!categories[test.category]) {
        categories[test.category] = { passed: 0, total: 0 };
      }
      categories[test.category].total++;
      if (test.passed) categories[test.category].passed++;
    });

    Object.keys(categories).forEach(category => {
      const cat = categories[category];
      const rate = Math.round((cat.passed / cat.total) * 100);
      console.log(`   ${category}: ${rate}% (${cat.passed}/${cat.total})`);
    });

    if (this.results.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      console.log('─────────────────────────────────────────────────────');
      this.results.tests
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`   ❌ ${test.category}: ${test.description}`);
        });
    }

    console.log('\n🎯 UNIT TEST ASSESSMENT:');
    console.log('─────────────────────────────────────────────────────');
    
    if (successRate >= 95) {
      console.log('✅ EXCELLENT: All critical functionality working');
    } else if (successRate >= 85) {
      console.log('✅ GOOD: Most functionality working, minor issues');
    } else if (successRate >= 70) {
      console.log('⚠️ FAIR: Some functionality issues need attention');
    } else {
      console.log('❌ POOR: Major functionality issues detected');
    }

    return successRate;
  }

  async run() {
    await this.initialize();
    
    const authSuccess = await this.authenticate();
    if (authSuccess) {
      await this.testGuestManagement();
      await this.testWeddingSettings();
      await this.testQuotesManagement();
    }
    
    return this.generateReport();
  }
}

// Run the unit tests
const tester = new UnitTester();
tester.run().then(successRate => {
  console.log(`\n🏆 FINAL UNIT TEST SCORE: ${successRate}%`);
  process.exit(successRate >= 85 ? 0 : 1);
}).catch(console.error);
