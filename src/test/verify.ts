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
assert(validLogin.student?.name === 'Aarav Sharma', 'Extracts student name correctly');
assert(validLogin.student?.email === 'aarav.sharma@aaroh.edu.in', 'Saves student email');
assert(StorageService.isAuthenticated(), 'Storage confirms authenticated state');
assert(!!StorageService.getSessionToken(), 'Session token generated and stored');

// 4. State Management: User Actions Write and Read from Storage
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
