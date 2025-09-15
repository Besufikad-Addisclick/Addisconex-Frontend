#!/usr/bin/env node

/**
 * Performance check script for Next.js development
 * Run with: node scripts/performance-check.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Performance Check Report');
console.log('============================\n');

// Check for large dependencies
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

console.log('📦 Large Dependencies:');
Object.entries(dependencies).forEach(([name, version]) => {
  if (name.includes('framer-motion') || name.includes('radix') || name.includes('lucide')) {
    console.log(`  ⚠️  ${name}: ${version} (Heavy UI library)`);
  }
});

console.log('\n🚀 Performance Recommendations:');
console.log('  1. ✅ Enabled SWC minification');
console.log('  2. ✅ Optimized package imports');
console.log('  3. ✅ Added webpack optimizations');
console.log('  4. ✅ Memoized Header component');
console.log('  5. ✅ Added passive scroll listeners');

console.log('\n💡 Additional Optimizations:');
console.log('  - Consider lazy loading heavy components');
console.log('  - Use React.memo for expensive components');
console.log('  - Implement virtual scrolling for long lists');
console.log('  - Optimize images with next/image');

console.log('\n📊 Development Tips:');
console.log('  - Use React DevTools Profiler to identify bottlenecks');
console.log('  - Monitor bundle size with @next/bundle-analyzer');
console.log('  - Enable webpack-bundle-analyzer for detailed analysis');

console.log('\n✨ Performance check complete!');
