// Automated verification script for clean foundation & domain auth
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

console.log('--- AAROH VERIFICATION SUITE (CLEAN FOUNDATION) ---');

// Check dist build files
assert(fs.existsSync(path.join(__dirname, '../dist/index.html')), 'dist/index.html exists');
const distHtml = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');
assert(distHtml.includes('Aaroh'), 'HTML contains Aaroh wordmark');

// Check seed data wipe
const seedContent = fs.readFileSync(path.join(__dirname, '../src/data/seed.ts'), 'utf8');
assert(seedContent.includes('export const INITIAL_COURSES: Course[] = [];'), 'Courses wiped to empty array');
assert(seedContent.includes('export const INITIAL_TIMETABLE: ClassSession[] = [];'), 'Timetable wiped to empty array');
assert(seedContent.includes('export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];'), 'Attendance wiped to empty array');
assert(seedContent.includes('export const INITIAL_ASSIGNMENTS: Assignment[] = [];'), 'Assignments wiped to empty array');
assert(seedContent.includes('export const INITIAL_NOTICES: Notice[] = [];'), 'Notices wiped to empty array');
assert(seedContent.includes('export const INITIAL_EVENTS: CampusEvent[] = [];'), 'Events wiped to empty array');
assert(seedContent.includes('export const INITIAL_LOST_FOUND: LostFoundItem[] = [];'), 'Lost & Found wiped to empty array');
assert(seedContent.includes('export const INITIAL_OPPORTUNITIES: Opportunity[] = [];'), 'Opportunities wiped to empty array');

// Check Storage Service for domain authentication
const storageContent = fs.readFileSync(path.join(__dirname, '../src/services/storage.ts'), 'utf8');
assert(storageContent.includes('@aaroh.edu.in'), 'Storage enforces @aaroh.edu.in domain restriction');
assert(storageContent.includes('loginWithDomain'), 'Storage contains loginWithDomain method');
assert(storageContent.includes('SESSION_TOKEN'), 'Storage manages SESSION_TOKEN');

// Check LoginPage for institutional UI and domain restriction
const loginContent = fs.readFileSync(path.join(__dirname, '../src/pages/LoginPage.tsx'), 'utf8');
assert(loginContent.includes('@aaroh.edu.in'), 'LoginPage requires @aaroh.edu.in');
assert(loginContent.includes('Domain Restricted Access'), 'LoginPage displays domain restriction notice');

// Check App.tsx for ProtectedRoute
const appContent = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8');
assert(appContent.includes('<ProtectedRoute>'), 'App.tsx wraps core routes with ProtectedRoute');
assert(appContent.includes('path="/login"'), 'App.tsx defines dedicated /login route');

console.log('--- ALL CLEAN FOUNDATION & AUTH VERIFICATION CHECKS PASSED ---');
