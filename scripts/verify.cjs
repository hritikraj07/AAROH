// Standalone verification script for Node.js
const fs = require('fs');
const path = require('path');

function assert(cond, msg) {
  if (!cond) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${msg}`);
  }
}

console.log('--- AAROH VERIFICATION SUITE (AUTOMATED) ---');

// Check dist build files
assert(fs.existsSync(path.join(__dirname, '../dist/index.html')), 'dist/index.html exists');
const distHtml = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');
assert(distHtml.includes('Aaroh'), 'HTML contains Aaroh wordmark');
assert(distHtml.includes('Apex Institute of Technology'), 'HTML contains college title');

// Check self-hosted fonts in dist/assets
const assetFiles = fs.readdirSync(path.join(__dirname, '../dist/assets'));
const fontFiles = assetFiles.filter(f => f.endsWith('.woff') || f.endsWith('.woff2'));
assert(fontFiles.length >= 10, `Self-hosted IBM Plex Sans fonts bundled (${fontFiles.length} files)`);

console.log(`✅ Self-hosted fonts verified: ${fontFiles.slice(0, 3).join(', ')}...`);

// Check Config file
const configTs = fs.readFileSync(path.join(__dirname, '../src/config.ts'), 'utf8');
assert(configTs.includes("appName: 'Aaroh'"), 'config.ts defines appName as Aaroh');
assert(configTs.includes('Apex Institute of Technology'), 'config.ts defines collegeName');

// Check All Core Pages
const pages = [
  'DashboardPage.tsx',
  'AcademicsPage.tsx',
  'NoticesPage.tsx',
  'EventsPage.tsx',
  'LostFoundPage.tsx',
  'OpportunitiesPage.tsx',
  'LoginPage.tsx',
];

pages.forEach(p => {
  assert(fs.existsSync(path.join(__dirname, '../src/pages', p)), `Page src/pages/${p} exists`);
});

// Check README.md
assert(fs.existsSync(path.join(__dirname, '../README.md')), 'README.md exists');
const readme = fs.readFileSync(path.join(__dirname, '../README.md'), 'utf8');
assert(readme.includes('Aaroh'), 'README mentions Aaroh');
assert(readme.includes('22CS042'), 'README contains demo login credentials');
assert(readme.includes('npm run dev'), 'README contains dev instructions');

console.log('--- ALL AUTOMATED CHECKS AND ARTIFACTS VERIFIED ---');
