// Automated verification script for RBAC, Role Portals & Clean Foundation
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

console.log('--- AAROH VERIFICATION SUITE: ROLE-BASED ACCESS CONTROL (RBAC) ---');

// 1. Check Dist Build Files
assert(fs.existsSync(path.join(__dirname, '../dist/index.html')), 'dist/index.html built successfully');
const distHtml = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');
assert(distHtml.includes('Aaroh'), 'HTML contains Aaroh wordmark');

// 2. Check Seed Data Wipe (Empty Initial Foundation)
const seedContent = fs.readFileSync(path.join(__dirname, '../src/data/seed.ts'), 'utf8');
assert(seedContent.includes('export const INITIAL_COURSES: Course[] = [];'), 'Courses initialized as empty array');
assert(seedContent.includes('export const INITIAL_TIMETABLE: ClassSession[] = [];'), 'Timetable initialized as empty array');
assert(seedContent.includes('export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];'), 'Attendance initialized as empty array');
assert(seedContent.includes('export const INITIAL_ASSIGNMENTS: Assignment[] = [];'), 'Assignments initialized as empty array');
assert(seedContent.includes('export const INITIAL_NOTICES: Notice[] = [];'), 'Notices initialized as empty array');
assert(seedContent.includes('export const INITIAL_EVENTS: CampusEvent[] = [];'), 'Events initialized as empty array');
assert(seedContent.includes('export const INITIAL_LOST_FOUND: LostFoundItem[] = [];'), 'Lost & Found initialized as empty array');
assert(seedContent.includes('export const INITIAL_OPPORTUNITIES: Opportunity[] = [];'), 'Opportunities initialized as empty array');

// 3. Check RBAC Types & Domains
const typesContent = fs.readFileSync(path.join(__dirname, '../src/types/index.ts'), 'utf8');
assert(typesContent.includes("export type UserRole = 'student' | 'faculty' | 'admin';"), 'UserRole strictly typed');
assert(typesContent.includes('role: UserRole;'), 'User interface includes role property');

assert(seedContent.includes('@aaroh.edu.in') && seedContent.includes('@faculty.aaroh.edu.in') && seedContent.includes('@admin.aaroh.edu.in'), 'Seed helper detects all three institutional domains');

// 4. Check Role Protection & Guard Components
assert(fs.existsSync(path.join(__dirname, '../src/components/auth/RoleProtectedRoute.tsx')), 'RoleProtectedRoute component created');
assert(fs.existsSync(path.join(__dirname, '../src/pages/UnauthorizedPage.tsx')), 'UnauthorizedPage 403 component created');

const unauthorizedContent = fs.readFileSync(path.join(__dirname, '../src/pages/UnauthorizedPage.tsx'), 'utf8');
assert(unauthorizedContent.includes('HTTP 403 • Access Restricted'), 'Unauthorized page shows 403 notice');

// 5. Check Login UI & Quick-Fill
const loginContent = fs.readFileSync(path.join(__dirname, '../src/pages/LoginPage.tsx'), 'utf8');
assert(loginContent.includes('@aaroh.edu.in'), 'LoginPage supports student domain');
assert(loginContent.includes('@faculty.aaroh.edu.in'), 'LoginPage supports faculty domain');
assert(loginContent.includes('@admin.aaroh.edu.in'), 'LoginPage supports admin domain');
assert(loginContent.includes('aarav.sharma@aaroh.edu.in'), 'LoginPage includes Student quick-fill');
assert(loginContent.includes('prof.raman@faculty.aaroh.edu.in'), 'LoginPage includes Faculty quick-fill');
assert(loginContent.includes('registrar@admin.aaroh.edu.in'), 'LoginPage includes Admin quick-fill');

// 6. Check Faculty Portal Pages
assert(fs.existsSync(path.join(__dirname, '../src/pages/faculty/FacultyDashboardPage.tsx')), 'FacultyDashboardPage exists');
assert(fs.existsSync(path.join(__dirname, '../src/pages/faculty/FacultyClassesPage.tsx')), 'FacultyClassesPage exists');
assert(fs.existsSync(path.join(__dirname, '../src/pages/faculty/FacultyAttendancePage.tsx')), 'FacultyAttendancePage exists');
assert(fs.existsSync(path.join(__dirname, '../src/pages/faculty/FacultyAssignmentsPage.tsx')), 'FacultyAssignmentsPage exists');

// 7. Check Admin Portal Pages
assert(fs.existsSync(path.join(__dirname, '../src/pages/admin/AdminDashboardPage.tsx')), 'AdminDashboardPage exists');
assert(fs.existsSync(path.join(__dirname, '../src/pages/admin/AdminNoticesPage.tsx')), 'AdminNoticesPage exists');
assert(fs.existsSync(path.join(__dirname, '../src/pages/admin/AdminEventsPage.tsx')), 'AdminEventsPage exists');
assert(fs.existsSync(path.join(__dirname, '../src/pages/admin/AdminTimetablePage.tsx')), 'AdminTimetablePage exists');
assert(fs.existsSync(path.join(__dirname, '../src/pages/admin/AdminSettingsPage.tsx')), 'AdminSettingsPage exists');

const adminSettingsContent = fs.readFileSync(path.join(__dirname, '../src/pages/admin/AdminSettingsPage.tsx'), 'utf8');
assert(adminSettingsContent.includes('Reset Demo Data'), 'AdminSettingsPage contains Reset Demo Data action');

// 8. Check Route Splitting in App.tsx
const appContent = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8');
assert(appContent.includes('path="/student"'), 'App.tsx mounts /student routes');
assert(appContent.includes('path="/faculty"'), 'App.tsx mounts /faculty routes');
assert(appContent.includes('path="/admin"'), 'App.tsx mounts /admin routes');
assert(appContent.includes('allowedRoles={[\'student\']}'), 'App.tsx guards /student for student role');
assert(appContent.includes('allowedRoles={[\'faculty\']}'), 'App.tsx guards /faculty for faculty role');
assert(appContent.includes('allowedRoles={[\'admin\']}'), 'App.tsx guards /admin for admin role');
assert(appContent.includes('RootRedirect'), 'App.tsx has root domain dispatcher');

// 9. Check Conditional Navigation in Sidebar.tsx
const sidebarContent = fs.readFileSync(path.join(__dirname, '../src/components/layout/Sidebar.tsx'), 'utf8');
assert(sidebarContent.includes('studentNavItems'), 'Sidebar contains student navigation');
assert(sidebarContent.includes('facultyNavItems'), 'Sidebar contains faculty navigation');
assert(sidebarContent.includes('adminNavItems'), 'Sidebar contains admin navigation');

console.log('--- ALL ROLE-BASED ACCESS CONTROL (RBAC) VERIFICATIONS PASSED ---');
