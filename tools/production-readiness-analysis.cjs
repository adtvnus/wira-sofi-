#!/usr/bin/env node

// Production Readiness Analysis for Wedding Invitation App
// This script performs comprehensive testing and analysis

const fs = require('fs');
const path = require('path');

// Use dynamic import for node-fetch v3
async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

const API_BASE_URL = 'http://localhost:3001/api';
const FRONTEND_URL = 'http://localhost:5173';

class ProductionReadinessAnalyzer {
  constructor() {
    this.results = {
      security: { score: 0, issues: [], passed: 0, total: 0 },
      performance: { score: 0, issues: [], passed: 0, total: 0 },
      functionality: { score: 0, issues: [], passed: 0, total: 0 },
      reliability: { score: 0, issues: [], passed: 0, total: 0 },
      usability: { score: 0, issues: [], passed: 0, total: 0 },
      deployment: { score: 0, issues: [], passed: 0, total: 0 }
    };
    this.token = null;
    this.fetch = null;
  }

  async initialize() {
    this.fetch = await getFetch();
    console.log('🔍 PRODUCTION READINESS ANALYSIS');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📅 Analysis Date: ${new Date().toISOString()}`);
    console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
    console.log(`🔗 Backend API: ${API_BASE_URL}`);
    console.log('═══════════════════════════════════════════════════════\n');
  }

  async testConnectivity() {
    console.log('1. 🌐 CONNECTIVITY TESTS');
    console.log('─────────────────────────────────────────────────────');
    
    try {
      // Test backend health
      const healthResponse = await this.fetch(`${API_BASE_URL}/health`);
      if (healthResponse.ok) {
        console.log('   ✅ Backend API: ONLINE');
        this.addPass('functionality');
      } else {
        console.log('   ❌ Backend API: OFFLINE');
        this.addIssue('functionality', 'Backend API is not responding');
      }
    } catch (error) {
      console.log('   ❌ Backend API: CONNECTION FAILED');
      this.addIssue('functionality', `Backend connection failed: ${error.message}`);
    }

    // Test database connection (implicit through API)
    try {
      const dbTestResponse = await this.fetch(`${API_BASE_URL}/guests`);
      if (dbTestResponse.status === 401 || dbTestResponse.status === 403) {
        console.log('   ✅ Database: CONNECTED (auth required)');
        this.addPass('functionality');
      } else if (dbTestResponse.ok) {
        console.log('   ✅ Database: CONNECTED');
        this.addPass('functionality');
      } else {
        console.log('   ❌ Database: CONNECTION ISSUES');
        this.addIssue('functionality', 'Database connection issues detected');
      }
    } catch (error) {
      console.log('   ❌ Database: CONNECTION FAILED');
      this.addIssue('functionality', `Database connection failed: ${error.message}`);
    }
  }

  async testAuthentication() {
    console.log('\n2. 🔐 AUTHENTICATION & SECURITY TESTS');
    console.log('─────────────────────────────────────────────────────');
    
    // Test login functionality
    try {
      const loginResponse = await this.fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin' })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        this.token = loginData.token;
        console.log('   ✅ Login: WORKING');
        this.addPass('security');
        
        // Test token validation
        const meResponse = await this.fetch(`${API_BASE_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        
        if (meResponse.ok) {
          console.log('   ✅ Token Validation: WORKING');
          this.addPass('security');
        } else {
          console.log('   ❌ Token Validation: FAILED');
          this.addIssue('security', 'Token validation not working properly');
        }
      } else {
        console.log('   ❌ Login: FAILED');
        this.addIssue('security', 'Login functionality is broken');
      }
    } catch (error) {
      console.log('   ❌ Authentication: SYSTEM ERROR');
      this.addIssue('security', `Authentication system error: ${error.message}`);
    }

    // Test unauthorized access protection
    try {
      const unauthorizedResponse = await this.fetch(`${API_BASE_URL}/guests`);
      if (unauthorizedResponse.status === 401 || unauthorizedResponse.status === 403) {
        console.log('   ✅ Unauthorized Protection: WORKING');
        this.addPass('security');
      } else {
        console.log('   ❌ Unauthorized Protection: VULNERABLE');
        this.addIssue('security', 'API endpoints are not properly protected');
      }
    } catch (error) {
      console.log('   ⚠️ Unauthorized Protection: CANNOT TEST');
      this.addIssue('security', 'Cannot test unauthorized access protection');
    }
  }

  async testCoreFeatures() {
    console.log('\n3. 🎯 CORE FUNCTIONALITY TESTS');
    console.log('─────────────────────────────────────────────────────');
    
    if (!this.token) {
      console.log('   ❌ Cannot test features: No authentication token');
      this.addIssue('functionality', 'Authentication required for feature testing');
      return;
    }

    const features = [
      { name: 'Guest Management', endpoint: '/guests', method: 'GET' },
      { name: 'RSVP System', endpoint: '/rsvp', method: 'GET' },
      { name: 'Wedding Settings', endpoint: '/wedding-settings', method: 'GET' },
      { name: 'Invited Settings', endpoint: '/invited-settings', method: 'GET' },
      { name: 'Quotes Management', endpoint: '/quotes', method: 'GET' },
      { name: 'Gallery Management', endpoint: '/gallery', method: 'GET' },
      { name: 'Dashboard Stats', endpoint: '/dashboard/stats', method: 'GET' }
    ];

    for (const feature of features) {
      try {
        const response = await this.fetch(`${API_BASE_URL}${feature.endpoint}`, {
          method: feature.method,
          headers: { 'Authorization': `Bearer ${this.token}` }
        });

        if (response.ok) {
          console.log(`   ✅ ${feature.name}: WORKING`);
          this.addPass('functionality');
        } else {
          console.log(`   ❌ ${feature.name}: ERROR (${response.status})`);
          this.addIssue('functionality', `${feature.name} endpoint returning ${response.status}`);
        }
      } catch (error) {
        console.log(`   ❌ ${feature.name}: FAILED`);
        this.addIssue('functionality', `${feature.name} failed: ${error.message}`);
      }
    }
  }

  async testDataOperations() {
    console.log('\n4. 📊 DATA OPERATIONS TESTS');
    console.log('─────────────────────────────────────────────────────');
    
    if (!this.token) {
      console.log('   ❌ Cannot test data operations: No authentication token');
      return;
    }

    // Test CREATE operation
    try {
      const createResponse = await this.fetch(`${API_BASE_URL}/guests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          guestName: `Production Test ${Date.now()}`,
          guestEmail: 'prodtest@example.com',
          guestPhone: '081234567890',
          guestCount: 1
        })
      });

      if (createResponse.ok) {
        console.log('   ✅ CREATE Operations: WORKING');
        this.addPass('functionality');
        
        const createData = await createResponse.json();
        const guestId = createData.data?.id;
        
        // Test UPDATE operation
        if (guestId) {
          try {
            const updateResponse = await this.fetch(`${API_BASE_URL}/guests/${guestId}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                guestName: `Updated Test ${Date.now()}`,
                guestEmail: 'updated@example.com',
                guestPhone: '081234567890',
                guestCount: 2
              })
            });

            if (updateResponse.ok) {
              console.log('   ✅ UPDATE Operations: WORKING');
              this.addPass('functionality');
            } else {
              console.log('   ❌ UPDATE Operations: FAILED');
              this.addIssue('functionality', 'UPDATE operations not working');
            }
          } catch (error) {
            console.log('   ❌ UPDATE Operations: ERROR');
            this.addIssue('functionality', `UPDATE error: ${error.message}`);
          }

          // Test DELETE operation
          try {
            const deleteResponse = await this.fetch(`${API_BASE_URL}/guests/${guestId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (deleteResponse.ok) {
              console.log('   ✅ DELETE Operations: WORKING');
              this.addPass('functionality');
            } else {
              console.log('   ❌ DELETE Operations: FAILED');
              this.addIssue('functionality', 'DELETE operations not working');
            }
          } catch (error) {
            console.log('   ❌ DELETE Operations: ERROR');
            this.addIssue('functionality', `DELETE error: ${error.message}`);
          }
        }
      } else {
        console.log('   ❌ CREATE Operations: FAILED');
        this.addIssue('functionality', 'CREATE operations not working');
      }
    } catch (error) {
      console.log('   ❌ Data Operations: SYSTEM ERROR');
      this.addIssue('functionality', `Data operations error: ${error.message}`);
    }
  }

  addPass(category) {
    this.results[category].passed++;
    this.results[category].total++;
  }

  addIssue(category, issue) {
    this.results[category].issues.push(issue);
    this.results[category].total++;
  }

  async testFileStructure() {
    console.log('\n5. 📁 FILE STRUCTURE & CONFIGURATION TESTS');
    console.log('─────────────────────────────────────────────────────');

    const criticalFiles = [
      { path: 'package.json', required: true },
      { path: 'backend/server.cjs', required: true },
      { path: 'backend/database/setup.cjs', required: true },
      { path: 'src/App.tsx', required: true },
      { path: '.env', required: false },
      { path: 'vite.config.ts', required: true },
      { path: 'tailwind.config.js', required: true }
    ];

    for (const file of criticalFiles) {
      try {
        if (fs.existsSync(file.path)) {
          console.log(`   ✅ ${file.path}: EXISTS`);
          this.addPass('deployment');
        } else if (file.required) {
          console.log(`   ❌ ${file.path}: MISSING (REQUIRED)`);
          this.addIssue('deployment', `Critical file missing: ${file.path}`);
        } else {
          console.log(`   ⚠️ ${file.path}: MISSING (OPTIONAL)`);
          this.addPass('deployment');
        }
      } catch (error) {
        console.log(`   ❌ ${file.path}: CHECK FAILED`);
        this.addIssue('deployment', `Cannot check file: ${file.path}`);
      }
    }
  }

  async testSecurity() {
    console.log('\n6. 🔒 SECURITY ANALYSIS');
    console.log('─────────────────────────────────────────────────────');

    // Check for hardcoded credentials
    try {
      const serverContent = fs.readFileSync('backend/server.cjs', 'utf8');

      // Check for specific hardcoded patterns (not just any mention of admin/password)
      const hardcodedPatterns = [
        /username:\s*['"]admin['"]/i,
        /password:\s*['"]admin['"]/i,
        /'admin'.*'admin'/,
        /"admin".*"admin"/,
        /Username:\s*admin\s*Password:\s*admin/i
      ];

      const hasHardcodedCredentials = hardcodedPatterns.some(pattern => pattern.test(serverContent));

      if (hasHardcodedCredentials) {
        console.log('   ⚠️ Hardcoded Credentials: DETECTED');
        this.addIssue('security', 'Hardcoded admin credentials found in server code');
      } else {
        console.log('   ✅ Hardcoded Credentials: NOT FOUND');
        this.addPass('security');
      }

      // Check for JWT secret
      if (serverContent.includes('JWT_SECRET') || serverContent.includes('process.env')) {
        console.log('   ✅ JWT Configuration: PROPER');
        this.addPass('security');
      } else {
        console.log('   ❌ JWT Configuration: MISSING');
        this.addIssue('security', 'JWT secret configuration not found');
      }

      // Check for CORS configuration
      if (serverContent.includes('cors')) {
        console.log('   ✅ CORS Configuration: PRESENT');
        this.addPass('security');
      } else {
        console.log('   ❌ CORS Configuration: MISSING');
        this.addIssue('security', 'CORS configuration not found');
      }

    } catch (error) {
      console.log('   ❌ Security Analysis: FAILED');
      this.addIssue('security', `Cannot analyze security: ${error.message}`);
    }
  }

  calculateScores() {
    for (const category in this.results) {
      const result = this.results[category];
      if (result.total > 0) {
        result.score = Math.round((result.passed / result.total) * 100);
      }
    }
  }

  generateReport() {
    console.log('\n\n🎯 PRODUCTION READINESS REPORT');
    console.log('═══════════════════════════════════════════════════════');

    const categories = [
      { key: 'security', name: '🔒 Security', weight: 25 },
      { key: 'functionality', name: '🎯 Functionality', weight: 30 },
      { key: 'reliability', name: '⚡ Reliability', weight: 20 },
      { key: 'deployment', name: '🚀 Deployment', weight: 15 },
      { key: 'performance', name: '📈 Performance', weight: 10 }
    ];

    let overallScore = 0;
    let totalWeight = 0;

    categories.forEach(category => {
      const result = this.results[category.key];
      console.log(`\n${category.name}: ${result.score}% (${result.passed}/${result.total} tests passed)`);

      if (result.issues.length > 0) {
        result.issues.forEach(issue => {
          console.log(`   ❌ ${issue}`);
        });
      }

      overallScore += result.score * category.weight;
      totalWeight += category.weight;
    });

    const finalScore = Math.round(overallScore / totalWeight);

    console.log('\n═══════════════════════════════════════════════════════');
    console.log(`🏆 OVERALL PRODUCTION READINESS: ${finalScore}%`);
    console.log('═══════════════════════════════════════════════════════');

    // Production readiness assessment
    if (finalScore >= 90) {
      console.log('✅ STATUS: READY FOR PRODUCTION');
      console.log('🎉 The application is production-ready with minimal issues.');
    } else if (finalScore >= 75) {
      console.log('⚠️ STATUS: MOSTLY READY (Minor Issues)');
      console.log('🔧 Address the issues above before production deployment.');
    } else if (finalScore >= 60) {
      console.log('❌ STATUS: NOT READY (Major Issues)');
      console.log('🚨 Significant issues need to be resolved before production.');
    } else {
      console.log('🚫 STATUS: NOT PRODUCTION READY');
      console.log('💥 Critical issues prevent production deployment.');
    }

    this.generateRecommendations(finalScore);
  }

  generateRecommendations(score) {
    console.log('\n📋 RECOMMENDATIONS:');
    console.log('─────────────────────────────────────────────────────');

    if (score < 90) {
      console.log('🔧 IMMEDIATE ACTIONS NEEDED:');

      // Security recommendations
      if (this.results.security.score < 80) {
        console.log('   • Implement proper environment variable configuration');
        console.log('   • Remove hardcoded credentials');
        console.log('   • Add rate limiting for API endpoints');
        console.log('   • Implement proper session management');
      }

      // Functionality recommendations
      if (this.results.functionality.score < 80) {
        console.log('   • Fix broken API endpoints');
        console.log('   • Implement proper error handling');
        console.log('   • Add input validation');
        console.log('   • Test all CRUD operations');
      }

      // Deployment recommendations
      if (this.results.deployment.score < 80) {
        console.log('   • Create production build configuration');
        console.log('   • Set up environment-specific configs');
        console.log('   • Implement database migration scripts');
        console.log('   • Add health check endpoints');
      }
    }

    console.log('\n🚀 PRODUCTION DEPLOYMENT CHECKLIST:');
    console.log('   □ Environment variables configured');
    console.log('   □ Database properly set up and seeded');
    console.log('   □ SSL/HTTPS configured');
    console.log('   □ Domain and hosting configured');
    console.log('   □ Backup strategy implemented');
    console.log('   □ Monitoring and logging set up');
    console.log('   □ Error tracking implemented');
    console.log('   □ Performance optimization completed');
  }

  async run() {
    await this.initialize();
    await this.testConnectivity();
    await this.testAuthentication();
    await this.testCoreFeatures();
    await this.testDataOperations();
    await this.testFileStructure();
    await this.testSecurity();

    this.calculateScores();
    this.generateReport();
  }
}

// Initialize and run analysis
const analyzer = new ProductionReadinessAnalyzer();
analyzer.run().catch(console.error);
