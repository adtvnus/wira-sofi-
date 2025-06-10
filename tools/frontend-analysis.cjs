#!/usr/bin/env node

// Frontend Analysis for Wedding Invitation App
const fs = require('fs');
const path = require('path');

class FrontendAnalyzer {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
  }

  analyzePackageJson() {
    console.log('📦 PACKAGE.JSON ANALYSIS');
    console.log('─────────────────────────────────────────────────────');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      // Check essential dependencies
      const essentialDeps = [
        'react', 'react-dom', 'react-router-dom', 
        'tailwindcss', 'vite', 'typescript'
      ];
      
      essentialDeps.forEach(dep => {
        if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
          console.log(`   ✅ ${dep}: PRESENT`);
          this.passed.push(`${dep} dependency found`);
        } else {
          console.log(`   ❌ ${dep}: MISSING`);
          this.issues.push(`Missing essential dependency: ${dep}`);
        }
      });

      // Check scripts
      const essentialScripts = ['dev', 'build', 'backend', 'backend:dev'];
      essentialScripts.forEach(script => {
        if (packageJson.scripts?.[script]) {
          console.log(`   ✅ Script "${script}": PRESENT`);
          this.passed.push(`${script} script configured`);
        } else {
          console.log(`   ❌ Script "${script}": MISSING`);
          this.issues.push(`Missing essential script: ${script}`);
        }
      });

    } catch (error) {
      console.log('   ❌ Package.json: CANNOT READ');
      this.issues.push(`Cannot read package.json: ${error.message}`);
    }
  }

  analyzeSourceStructure() {
    console.log('\n📁 SOURCE CODE STRUCTURE ANALYSIS');
    console.log('─────────────────────────────────────────────────────');
    
    const criticalPaths = [
      { path: 'src', type: 'directory', required: true },
      { path: 'src/App.tsx', type: 'file', required: true },
      { path: 'src/main.tsx', type: 'file', required: true },
      { path: 'src/pages', type: 'directory', required: true },
      { path: 'src/components', type: 'directory', required: true },
      { path: 'src/contexts', type: 'directory', required: true },
      { path: 'src/services', type: 'directory', required: true },
      { path: 'backend', type: 'directory', required: true },
      { path: 'backend/server.cjs', type: 'file', required: true },
      { path: 'backend/database', type: 'directory', required: true }
    ];

    criticalPaths.forEach(item => {
      try {
        const exists = fs.existsSync(item.path);
        const stats = exists ? fs.statSync(item.path) : null;
        
        if (exists && 
            ((item.type === 'directory' && stats.isDirectory()) ||
             (item.type === 'file' && stats.isFile()))) {
          console.log(`   ✅ ${item.path}: EXISTS`);
          this.passed.push(`${item.path} structure correct`);
        } else if (item.required) {
          console.log(`   ❌ ${item.path}: MISSING (REQUIRED)`);
          this.issues.push(`Missing required ${item.type}: ${item.path}`);
        } else {
          console.log(`   ⚠️ ${item.path}: MISSING (OPTIONAL)`);
          this.warnings.push(`Optional ${item.type} missing: ${item.path}`);
        }
      } catch (error) {
        console.log(`   ❌ ${item.path}: CHECK FAILED`);
        this.issues.push(`Cannot check ${item.path}: ${error.message}`);
      }
    });
  }

  analyzeComponents() {
    console.log('\n🧩 COMPONENT ANALYSIS');
    console.log('─────────────────────────────────────────────────────');
    
    const componentDirs = [
      'src/pages/admin',
      'src/pages/user', 
      'src/components',
      'src/layouts'
    ];

    componentDirs.forEach(dir => {
      try {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
          console.log(`   📂 ${dir}: ${files.length} components`);
          
          if (files.length > 0) {
            this.passed.push(`${dir} has components`);
            
            // Check for common issues in components
            files.forEach(file => {
              try {
                const content = fs.readFileSync(path.join(dir, file), 'utf8');
                
                // Check for TypeScript usage
                if (file.endsWith('.tsx') && content.includes('React.FC')) {
                  this.passed.push(`${file} uses proper TypeScript`);
                }
                
                // Check for proper imports
                if (content.includes('import React') || content.includes('import { ')) {
                  this.passed.push(`${file} has proper imports`);
                }
                
                // Check for potential issues
                if (content.includes('any') && content.includes(': any')) {
                  this.warnings.push(`${file} uses 'any' type - consider proper typing`);
                }
                
              } catch (error) {
                this.warnings.push(`Cannot analyze ${file}: ${error.message}`);
              }
            });
          } else {
            this.warnings.push(`${dir} directory is empty`);
          }
        } else {
          this.issues.push(`Component directory missing: ${dir}`);
        }
      } catch (error) {
        this.issues.push(`Cannot analyze ${dir}: ${error.message}`);
      }
    });
  }

  analyzeConfiguration() {
    console.log('\n⚙️ CONFIGURATION ANALYSIS');
    console.log('─────────────────────────────────────────────────────');
    
    const configFiles = [
      { file: 'vite.config.ts', required: true },
      { file: 'tailwind.config.js', required: true },
      { file: 'tsconfig.json', required: true },
      { file: '.env', required: false },
      { file: 'nodemon.json', required: false }
    ];

    configFiles.forEach(config => {
      try {
        if (fs.existsSync(config.file)) {
          console.log(`   ✅ ${config.file}: EXISTS`);
          this.passed.push(`${config.file} configuration present`);
          
          // Basic validation
          const content = fs.readFileSync(config.file, 'utf8');
          if (content.trim().length > 0) {
            this.passed.push(`${config.file} has content`);
          } else {
            this.warnings.push(`${config.file} is empty`);
          }
        } else if (config.required) {
          console.log(`   ❌ ${config.file}: MISSING (REQUIRED)`);
          this.issues.push(`Missing required configuration: ${config.file}`);
        } else {
          console.log(`   ⚠️ ${config.file}: MISSING (OPTIONAL)`);
          this.warnings.push(`Optional configuration missing: ${config.file}`);
        }
      } catch (error) {
        this.issues.push(`Cannot check ${config.file}: ${error.message}`);
      }
    });
  }

  analyzeRouting() {
    console.log('\n🛣️ ROUTING ANALYSIS');
    console.log('─────────────────────────────────────────────────────');
    
    try {
      // Check main App.tsx for routing setup
      if (fs.existsSync('src/App.tsx')) {
        const appContent = fs.readFileSync('src/App.tsx', 'utf8');
        
        if (appContent.includes('BrowserRouter') || appContent.includes('Router')) {
          console.log('   ✅ Router Setup: PRESENT');
          this.passed.push('Router configuration found');
        } else {
          console.log('   ❌ Router Setup: MISSING');
          this.issues.push('Router configuration not found in App.tsx');
        }

        if (appContent.includes('Route')) {
          console.log('   ✅ Routes: CONFIGURED');
          this.passed.push('Routes are configured');
        } else {
          console.log('   ❌ Routes: NOT CONFIGURED');
          this.issues.push('No routes found in App.tsx');
        }
      }

      // Check for route files
      const routeFiles = ['src/routes', 'src/router'];
      let routeConfigFound = false;
      
      routeFiles.forEach(routeDir => {
        if (fs.existsSync(routeDir)) {
          console.log(`   ✅ Route Configuration: ${routeDir}`);
          this.passed.push(`Route configuration in ${routeDir}`);
          routeConfigFound = true;
        }
      });

      if (!routeConfigFound) {
        this.warnings.push('No dedicated route configuration directory found');
      }

    } catch (error) {
      this.issues.push(`Cannot analyze routing: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\n\n📊 FRONTEND ANALYSIS REPORT');
    console.log('═══════════════════════════════════════════════════════');
    
    const totalChecks = this.passed.length + this.issues.length + this.warnings.length;
    const successRate = totalChecks > 0 ? Math.round((this.passed.length / totalChecks) * 100) : 0;
    
    console.log(`✅ Passed: ${this.passed.length}`);
    console.log(`❌ Issues: ${this.issues.length}`);
    console.log(`⚠️ Warnings: ${this.warnings.length}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (this.issues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      this.issues.forEach(issue => console.log(`   ❌ ${issue}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      this.warnings.forEach(warning => console.log(`   ⚠️ ${warning}`));
    }

    console.log('\n🎯 FRONTEND READINESS ASSESSMENT:');
    if (this.issues.length === 0 && successRate >= 90) {
      console.log('✅ FRONTEND: PRODUCTION READY');
    } else if (this.issues.length <= 2 && successRate >= 75) {
      console.log('⚠️ FRONTEND: MOSTLY READY (Minor fixes needed)');
    } else {
      console.log('❌ FRONTEND: NOT READY (Major issues need fixing)');
    }
  }

  async run() {
    console.log('🎨 FRONTEND PRODUCTION READINESS ANALYSIS');
    console.log('═══════════════════════════════════════════════════════\n');
    
    this.analyzePackageJson();
    this.analyzeSourceStructure();
    this.analyzeComponents();
    this.analyzeConfiguration();
    this.analyzeRouting();
    this.generateReport();
  }
}

// Run the analysis
const analyzer = new FrontendAnalyzer();
analyzer.run().catch(console.error);
