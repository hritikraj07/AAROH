// Mock localStorage for Node test runner
const store: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { for (const k in store) delete store[k]; },
};

import { StorageService } from '../services/storage';
import { AcademicService } from '../services/academicService';
import { APP_CONFIG } from '../config';

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${msg}`);
  }
}

console.log('--- AAROH CLEAN FOUNDATION TEST SUITE ---');

// 1. Config Check
assert(APP_CONFIG.appName === 'Aaroh', 'App name is Aaroh');
assert(APP_CONFIG.collegeName.includes('Apex'), 'College name configured');

// 2. Storage Initialization: Clean Slate Verification
StorageService.initializeData(true);
assert(!StorageService.isAuthenticated(), 'User is initially unauthenticated');
assert(StorageService.getCourses().length === 0, 'Courses initialized as empty array');
assert(StorageService.getTimetable().length === 0, 'Timetable initialized as empty array');
assert(StorageService.getAttendance().length === 0, 'Attendance initialized as empty array');
assert(StorageService.getAssignments().length === 0, 'Assignments initialized as empty array');
assert(StorageService.getNotices().length === 0, 'Notices initialized as empty array');
assert(StorageService.getEvents().length === 0, 'Events initialized as empty array');
assert(StorageService.getLostFoundItems().length === 0, 'Lost & Found initialized as empty array');
assert(StorageService.getOpportunities().length === 0, 'Opportunities initialized as empty array');

// 3. Domain-Restricted Auth Logic
const invalidDomain = StorageService.loginWithDomain('user@gmail.com', 'password123');
assert(!invalidDomain.success, 'Rejects email not ending with @aaroh.edu.in');
assert(invalidDomain.error?.includes('@aaroh.edu.in') === true, 'Returns domain restriction error');

const emptyPassword = StorageService.loginWithDomain('student@aaroh.edu.in', '');
assert(!emptyPassword.success, 'Rejects empty password');

const validLogin = StorageService.loginWithDomain('aarav.sharma@aaroh.edu.in', 'securePass2026');
assert(validLogin.success, 'Accepts email ending with @aaroh.edu.in');
assert(validLogin.user?.name === 'Aarav Sharma', 'Extracts student name correctly');
assert(validLogin.user?.email === 'aarav.sharma@aaroh.edu.in', 'Saves student email');
assert(validLogin.user?.role === 'student', 'Assigns student role');

const facultyLogin = StorageService.loginWithDomain('prof.raman@faculty.aaroh.edu.in', 'facPass2026');
assert(facultyLogin.success, 'Accepts faculty institutional email');
assert(facultyLogin.user?.role === 'faculty', 'Assigns faculty role');

const adminLogin = StorageService.loginWithDomain('registrar@admin.aaroh.edu.in', 'admPass2026');
assert(adminLogin.success, 'Accepts admin institutional email');
assert(adminLogin.user?.role === 'admin', 'Assigns admin role');
assert(StorageService.isAuthenticated(), 'Storage confirms authenticated state');
assert(!!StorageService.getSessionToken(), 'Session token generated and stored');

// 4. User Directory & Onboarding Management
const initialUsers = StorageService.getUsers();
assert(initialUsers.length >= 3, 'Initial users directory contains default admin, student, and faculty');
assert(initialUsers.some(u => u.role === 'admin'), 'Directory contains default admin');
assert(initialUsers.some(u => u.role === 'student'), 'Directory contains default student');
assert(initialUsers.some(u => u.role === 'faculty'), 'Directory contains default faculty');

// Onboard new student
const onboardedStudent = StorageService.createUser({
  name: 'Devika Patel',
  email: 'devika.patel@aaroh.edu.in',
  role: 'student',
  rollNumber: '23CS089',
  program: 'B.Tech CSE',
  department: 'Computer Science & Engineering',
  semester: 3,
  avatarInitials: 'DP',
});
assert(onboardedStudent.id.startsWith('usr_std_'), 'New student onboarded with unique ID');
assert(StorageService.getUsers().length === initialUsers.length + 1, 'Directory count updated');

// Login with newly onboarded student
const studentLogin = StorageService.loginWithDomain('devika.patel@aaroh.edu.in', 'customPass123');
assert(studentLogin.success, 'Newly onboarded student can login immediately');
assert(studentLogin.role === 'student', 'Granted student role from localStorage user object');
assert(studentLogin.user?.rollNumber === '23CS089', 'Maintains stored student ID');

// Onboard new faculty
const onboardedFaculty = StorageService.createUser({
  name: 'Prof. Rajesh Verma',
  email: 'rajesh.verma@faculty.aaroh.edu.in',
  role: 'faculty',
  department: 'Department of Electrical Engineering',
  designation: 'Associate Professor',
  avatarInitials: 'RV',
});
assert(onboardedFaculty.id.startsWith('usr_fac_'), 'New faculty onboarded with unique ID');

// Login with newly onboarded faculty
const facLogin = StorageService.loginWithDomain('rajesh.verma@faculty.aaroh.edu.in', 'facPass');
assert(facLogin.success, 'Newly onboarded faculty can login immediately');
assert(facLogin.role === 'faculty', 'Granted faculty role from localStorage user object');
assert(facLogin.user?.department === 'Department of Electrical Engineering', 'Maintains stored department');

// 5. State Management: User Actions Write and Read from Storage
const reported = StorageService.createLostFoundItem({
  type: 'lost',
  title: 'Texas Instruments Calculator',
  category: 'Electronics',
  description: 'Left in library reading room',
  location: 'Central Library Floor 2',
  date: '2026-11-15',
  reportedBy: { name: 'Aarav Sharma', studentId: '22CS042', isCurrentUser: true },
});
assert(reported.id.startsWith('lf_'), 'User created lost item with unique id');
assert(StorageService.getLostFoundItems().length === 1, 'Lost item persisted to storage');

const resolved = StorageService.toggleResolveItem(reported.id);
assert(resolved?.status === 'resolved', 'Item marked resolved in storage');

// Contact request
const contact = StorageService.requestContact(reported.id);
assert(contact.success && contact.count === 1, 'Contact request logged');

// Logout flow
StorageService.logout();
assert(!StorageService.isAuthenticated(), 'User logged out and session cleared');
assert(StorageService.getAuthStudent() === null, 'Auth student cleared on logout');

console.log('--- ALL CLEAN FOUNDATION & DOMAIN AUTH CHECKS PASSED ---');
