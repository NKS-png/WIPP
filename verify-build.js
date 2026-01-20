#!/usr/bin/env node

/**
 * Build Verification Script for Vercel Deployment
 * Checks for common issues that cause "Cannot find module entry.mjs" errors
 */

import { readdir, stat, readFile } from 'fs/promises';
import { join } from 'path';

console.log('🔍 Verifying build configuration...\n');

const issues = [];
const warnings = [];

// Check 1: Verify astro.config.mjs
try {
  const config = await readFile('astro.config.mjs', 'utf-8');
  if (!config.includes('@astrojs/vercel')) {
    issues.push('❌ Missing @astrojs/vercel adapter in astro.config.mjs');
  } else {
    console.log('✅ Vercel adapter configured');
  }
  
  if (!config.includes("output: 'server'")) {
    issues.push('❌ Missing server output mode in astro.config.mjs');
  } else {
    console.log('✅ Server output mode configured');
  }
} catch (error) {
  issues.push('❌ Cannot read astro.config.mjs');
}

// Check 2: Verify package.json
try {
  const pkg = JSON.parse(await readFile('package.json', 'utf-8'));
  
  if (!pkg.dependencies['@astrojs/vercel']) {
    issues.push('❌ Missing @astrojs/vercel dependency');
  } else {
    console.log('✅ Vercel dependency installed');
  }
  
  if (!pkg.dependencies['astro']) {
    issues.push('❌ Missing astro dependency');
  } else {
    console.log('✅ Astro dependency installed');
  }
} catch (error) {
  issues.push('❌ Cannot read package.json');
}

// Check 3: Look for problematic imports
const checkFile = async (filePath) => {
  try {
    const content = await readFile(filePath, 'utf-8');
    
    // Check for problematic patterns
    if (content.includes("import { readFile } from 'fs/promises'")) {
      warnings.push(`⚠️  Direct fs/promises import in ${filePath}`);
    }
    
    if (content.includes('window.crypto.subtle') && filePath.includes('/api/')) {
      warnings.push(`⚠️  Web Crypto API usage in server file ${filePath}`);
    }
    
    if (content.includes('crypto.randomUUID()') && filePath.includes('/api/')) {
      warnings.push(`⚠️  crypto.randomUUID() usage in server file ${filePath}`);
    }
    
  } catch (error) {
    // Ignore files that can't be read
  }
};

// Check 4: Scan source files
const scanDirectory = async (dir) => {
  try {
    const entries = await readdir(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stats = await stat(fullPath);
      
      if (stats.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
        await scanDirectory(fullPath);
      } else if (entry.endsWith('.astro') || entry.endsWith('.ts') || entry.endsWith('.js')) {
        await checkFile(fullPath);
      }
    }
  } catch (error) {
    // Ignore directories that can't be read
  }
};

await scanDirectory('src');

// Check 5: Verify critical files exist
const criticalFiles = [
  'astro.config.mjs',
  'package.json',
  'src/lib/supabase.js',
  'src/lib/autoEncryption.js'
];

for (const file of criticalFiles) {
  try {
    await stat(file);
    console.log(`✅ ${file} exists`);
  } catch (error) {
    issues.push(`❌ Missing critical file: ${file}`);
  }
}

// Report results
console.log('\n📊 Build Verification Results:');

if (issues.length === 0) {
  console.log('✅ No critical issues found');
} else {
  console.log('\n🚨 Critical Issues:');
  issues.forEach(issue => console.log(issue));
}

if (warnings.length === 0) {
  console.log('✅ No warnings');
} else {
  console.log('\n⚠️  Warnings:');
  warnings.forEach(warning => console.log(warning));
}

console.log('\n🚀 Build Commands:');
console.log('npm install');
console.log('npm run build');

if (issues.length === 0) {
  console.log('\n✅ Ready for deployment!');
  process.exit(0);
} else {
  console.log('\n❌ Fix issues before deploying');
  process.exit(1);
}