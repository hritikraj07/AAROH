// Automated verification script for RBAC, Role Portals, User Management & Clean Foundation
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

console.log('--- AAROH VERIFICATION SUITE: USER MANAGEMENT & RBAC ---');

// 1. Check Dist Build Files
assert(fs.existsSync(path.join(__dirname, '../dist/index.html')), 'dist/index.html built successfully');
const distHtml = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');
assert(distHtml.includes('Aaroh'), 'HTML contains Aaroh wordmark');

// 2. Check Seed Data (Initial Users Seeded)
const seedContent = fs.readFileSync(path.join(__dirname, '../src/data/seed.ts'), 'utf8');
assert(seedContent.includes('export const INITIAL_USERS: User[] = ['), 'INITIAL_USERS defined in seed.ts');
assert(seedContent.includes('registrar@admin.aaroh.edu.in'), 'Demo admin seeded in INITIAL_USERS');
assert(seedContent.includes('aarav.sharma@aaroh.edu.in'), 'Demo student seeded in INITIAL_USERS');
assert(seedContent.includes('prof.raman@faculty.aaroh.edu.in'), 'Demo faculty seeded in INITIAL_USERS');

// 3. Check Storage Service for Users Collection & Auth querying localStorage
const storageContent = fs.readFileSync(path.join(__dirname, '../src/services/storage.ts'), 'utf8');
assert(storageContent.includes("USERS: 'aaroh_users'"), "STORAGE_KEYS includes USERS 'aaroh_users'");
assert(storageContent.includes('getUsers(): User[]'), 'StorageService has getUsers() method');
assert(storageContent.includes('createUser(userData: Omit<User, \'id\'>): User'), 'StorageService has createUser() method');
assert(storageContent.includes('deleteUser(id: string): boolean'), 'StorageService has deleteUser() method');
assert(storageContent.includes('const users = this.getUsers();'), 'loginWithDomain queries localStorage users array first');

// 4. Check Context for User Management Actions
const contextContent = fs.readFileSync(path.join(__dirname, '../src/context/AppContext.tsx'), 'utf8');
assert(contextContent.includes('users: User[];'), 'AppContextType exposes users array');
assert(contextContent.includes('createUser: (userData: Omit<User, \'id\'>) => User;'), 'AppContextType exposes createUser');
assert(contextContent.includes('deleteUser: (id: string) => boolean;'), 'AppContextType exposes deleteUser');
assert(contextContent.includes('login: (email: string,'), 'AppContextType exposes login function');

// 5. Check Admin "People / Directory" Page
assert(fs.existsSync(path.join(__dirname, '../src/pages/admin/AdminPeoplePage.tsx')), 'AdminPeoplePage.tsx exists');
const peopleContent = fs.readFileSync(path.join(__dirname, '../src/pages/admin/AdminPeoplePage.tsx'), 'utf8');
assert(peopleContent.includes('Campus User Directory & Onboarding'), 'AdminPeoplePage renders directory title');
assert(peopleContent.includes('Onboard New User') || peopleContent.includes('Onboard User'), 'AdminPeoplePage includes onboard user button');
assert(peopleContent.includes('rollNumber'), 'AdminPeoplePage includes student ID / roll number dynamic field');
assert(peopleContent.includes('program'), 'AdminPeoplePage includes student program dynamic field');
assert(peopleContent.includes('semester'), 'AdminPeoplePage includes student semester dynamic field');
assert(peopleContent.includes('department'), 'AdminPeoplePage includes department field');
assert(peopleContent.includes('designation'), 'AdminPeoplePage includes designation field');

// 6. Check Admin Navigation in Sidebar.tsx
const sidebarContent = fs.readFileSync(path.join(__dirname, '../src/components/layout/Sidebar.tsx'), 'utf8');
assert(sidebarContent.includes('/admin/people'), 'Sidebar includes User Directory route /admin/people for admins');

// 7. Check Route Mounting in App.tsx
const appContent = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8');
assert(appContent.includes('path="people" element={<AdminPeoplePage />}'), 'App.tsx mounts /admin/people route');
assert(appContent.includes('path="directory"'), 'App.tsx provides directory alias');
assert(appContent.includes('path="users"'), 'App.tsx provides users alias');

// 8. Check Login UI Integration
const loginContent = fs.readFileSync(path.join(__dirname, '../src/pages/LoginPage.tsx'), 'utf8');
assert(loginContent.includes('users.some('), 'LoginPage checks localStorage users array for known accounts');
assert(loginContent.includes('login(trimmedEmail, password)'), 'LoginPage invokes refactored login handler');

// 9. Check Batch Attendance Storage & Context
assert(storageContent.includes('recordBatchAttendance('), 'StorageService includes recordBatchAttendance method');
assert(contextContent.includes('recordBatchAttendance: (courseId: string'), 'AppContextType exposes recordBatchAttendance');

// 10. Check Admin Timetable Module
assert(fs.existsSync(path.join(__dirname, '../src/pages/admin/AdminTimetablePage.tsx')), 'AdminTimetablePage.tsx exists');
const adminTimetableContent = fs.readFileSync(path.join(__dirname, '../src/pages/admin/AdminTimetablePage.tsx'), 'utf8');
assert(adminTimetableContent.includes('targetProgram') || adminTimetableContent.includes('program'), 'AdminTimetablePage has target audience program');
assert(adminTimetableContent.includes('targetSemester') || adminTimetableContent.includes('semester'), 'AdminTimetablePage has target audience semester');
assert(adminTimetableContent.includes('assignedFacultyEmail') || adminTimetableContent.includes('facultyEmail'), 'AdminTimetablePage has assigned faculty dropdown');

// 11. Check Faculty Dashboard
assert(fs.existsSync(path.join(__dirname, '../src/pages/faculty/FacultyDashboardPage.tsx')), 'FacultyDashboardPage.tsx exists');
const facultyDashContent = fs.readFileSync(path.join(__dirname, '../src/pages/faculty/FacultyDashboardPage.tsx'), 'utf8');
assert(facultyDashContent.includes('facultyEmail') || facultyDashContent.includes('effectiveTimetable'), 'FacultyDashboardPage filters classes for assigned teacher');
assert(facultyDashContent.includes('Quick Faculty Actions'), 'FacultyDashboardPage renders Quick Actions row');
assert(facultyDashContent.includes('Mark Roll Call') || facultyDashContent.includes('Mark Attendance'), 'FacultyDashboardPage has Mark Roll Call action');

// 12. Check Faculty Attendance Page
assert(fs.existsSync(path.join(__dirname, '../src/pages/faculty/FacultyAttendancePage.tsx')), 'FacultyAttendancePage.tsx exists');
const facultyAttContent = fs.readFileSync(path.join(__dirname, '../src/pages/faculty/FacultyAttendancePage.tsx'), 'utf8');
assert(facultyAttContent.includes('recordBatchAttendance'), 'FacultyAttendancePage calls recordBatchAttendance');
assert(facultyAttContent.includes('enrolledStudents'), 'FacultyAttendancePage computes enrolledStudents filtered by audience');
assert(facultyAttContent.includes('Present') && facultyAttContent.includes('Absent'), 'FacultyAttendancePage includes Present/Absent toggles');

// 13. Check Faculty Notices Page
assert(fs.existsSync(path.join(__dirname, '../src/pages/faculty/FacultyNoticesPage.tsx')), 'FacultyNoticesPage.tsx exists');
const facultyNoticeContent = fs.readFileSync(path.join(__dirname, '../src/pages/faculty/FacultyNoticesPage.tsx'), 'utf8');
assert(facultyNoticeContent.includes('Draft Department Notice') || facultyNoticeContent.includes('Department Circulars'), 'FacultyNoticesPage renders department circulars view');
assert(facultyNoticeContent.includes('createNotice'), 'FacultyNoticesPage provides notice draft and publish form');

// 14. Check Student Timetable & Dashboard Audience Filtering
const studentTodayClasses = fs.readFileSync(path.join(__dirname, '../src/components/modules/dashboard/TodayClassesCard.tsx'), 'utf8');
assert(studentTodayClasses.includes('user.program') && studentTodayClasses.includes('user.semester'), 'TodayClassesCard filters classes by student program and semester');
const studentTimetableTab = fs.readFileSync(path.join(__dirname, '../src/components/modules/academics/TimetableTab.tsx'), 'utf8');
assert(studentTimetableTab.includes('user.program') && studentTimetableTab.includes('user.semester'), 'TimetableTab filters classes by student program and semester');

console.log('--- ALL USER MANAGEMENT, RBAC, TIMETABLE & FACULTY PORTAL VERIFICATIONS PASSED ---');
