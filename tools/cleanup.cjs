#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Removed: ${dirPath}`);
      return true;
    } catch (error) {
      console.log(`❌ Failed to remove ${dirPath}: ${error.message}`);
      return false;
    }
  } else {
    console.log(`⚠️ Directory not found: ${dirPath}`);
    return false;
  }
}

function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed file: ${filePath}`);
      return true;
    } catch (error) {
      console.log(`❌ Failed to remove file ${filePath}: ${error.message}`);
      return false;
    }
  } else {
    console.log(`⚠️ File not found: ${filePath}`);
    return false;
  }
}

console.log('🧹 Cleaning up unused files and folders...\n');

// Folders to remove
const foldersToRemove = [
  'backend',
  'wira-sofi-backend', 
  'wira-sofi-laravel',
  'prisma',
  'src/server',
  'src/tests',
  'src/pages/api',
  'src/lib'
];

// Files to remove
const filesToRemove = [
  'test-api.cjs',
  'test-database.cjs', 
  'test-login.cjs'
];

console.log('📁 Removing unused folders:');
let removedFolders = 0;
for (const folder of foldersToRemove) {
  if (removeDirectory(folder)) {
    removedFolders++;
  }
}

console.log('\n📄 Removing unused files:');
let removedFiles = 0;
for (const file of filesToRemove) {
  if (removeFile(file)) {
    removedFiles++;
  }
}

console.log('\n📊 Cleanup Summary:');
console.log(`   📁 Folders removed: ${removedFolders}/${foldersToRemove.length}`);
console.log(`   📄 Files removed: ${removedFiles}/${filesToRemove.length}`);

console.log('\n✨ Cleanup completed!');
console.log('\n📋 Remaining important files:');
console.log('   - api-server-auth.cjs (Main API server)');
console.log('   - database-seeder.cjs (Database setup)');
console.log('   - system-health-check.cjs (Health monitoring)');
console.log('   - src/ (Frontend source code)');
console.log('   - package.json (Dependencies)');
console.log('   - .env (Environment variables)');

console.log('\n🚀 Project is now cleaner and more organized!');
