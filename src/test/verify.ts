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

console.log('--- AAROH VERIFICATION TEST SUITE ---');

// 1. Config Check
assert(APP_CONFIG.appName === 'Aaroh', 'App name is Aaroh');
assert(APP_CONFIG.collegeName.includes('Apex'), 'College name configured');

// 2. Storage Initialization
StorageService.initializeData(true);
const student = StorageService.getStudent();
assert(student.rollNumber === '22CS042', 'Seed student is Aarav Sharma (22CS042)');
assert(student.semester === 5, 'Semester is 5');

// 3. Academics & Attendance Analysis
const courses = StorageService.getCourses();
const attendance = StorageService.getAttendance();
assert(courses.length >= 6, 'Loaded all 6 courses');

const analysis = AcademicService.analyzeAttendance(attendance, courses, 75);
const lowCourses = analysis.filter(a => a.isBelowThreshold);
assert(lowCourses.length >= 1, 'At least 1 course flagged under 75% attendance');

// Check CS301 attendance calculation
const cs301 = analysis.find(a => a.course.code === 'CS301');
assert(!!cs301, 'CS301 Operating Systems exists');
if (cs301) {
  assert(cs301.percentage < 75, `CS301 is below threshold (${cs301.percentage}%)`);
  assert(cs301.classesToAttend > 0, `Computed remediation classes: ${cs301.classesToAttend}`);
  console.log(`   CS301 remediation hint: "${cs301.hint}"`);
}

// 4. Timetable and Clash Detection
const timetable = StorageService.getTimetable();
assert(timetable.length > 10, 'Timetable sessions populated');

// Test clash check: Thursday 14:00 - 16:00 is CS303 Networks Lab
const thursdayClash = AcademicService.checkEventClash('2026-11-19', '14:00', '16:00', timetable, courses);
assert(thursdayClash.hasClash, 'Clash detected on Thursday 14:00-16:00 Networks Lab');
assert(thursdayClash.clashingCourse?.code === 'CS303', 'Clashing course is CS303');

// 5. Events Module & Registration
const events = StorageService.getEvents();
assert(events.length >= 5, 'Events loaded');
const hackathon = events.find(e => e.id === 'evt_01');
assert(!!hackathon && hackathon.isRegistered, 'Aarav is registered for Apex Hackathon');

const fullEvent = events.find(e => e.registeredCount >= e.capacity);
assert(!!fullEvent, 'Full event exists for capacity demonstration');

// Test capacity rejection
if (fullEvent) {
  const regResult = StorageService.toggleEventRegistration(fullEvent.id);
  assert(!regResult.success, 'Registration rejected for full event');
}

// 6. Assignments Submission Flow
const assignments = StorageService.getAssignments();
assert(assignments.some(a => a.status === 'overdue'), 'Overdue assignment seeded');
assert(assignments.some(a => a.status === 'pending'), 'Pending assignment seeded');

const asg1 = assignments[0];
const originalStatus = asg1.status;
const toggled = StorageService.toggleAssignmentSubmission(asg1.id);
assert(toggled !== null && toggled.status !== originalStatus, 'Assignment submission toggle works');

// 7. Lost & Found Flow
const lfList = StorageService.getLostFoundItems();
assert(lfList.some(i => i.status === 'resolved'), 'Resolved lost item seeded');
assert(lfList.some(i => i.reportedBy.isCurrentUser), 'Current user has reported item');

const newItem = StorageService.createLostFoundItem({
  type: 'lost',
  title: 'Test Umbrella Blue',
  category: 'Personal Belongings',
  description: 'Left at reception',
  location: 'Admin Reception',
  date: '2026-11-15',
  reportedBy: { name: student.name, isCurrentUser: true },
});
assert(newItem.id.startsWith('lf_'), 'New lost item created with ID');

const resolveTest = StorageService.toggleResolveItem(newItem.id);
assert(resolveTest?.status === 'resolved', 'Item marked resolved');

const contactRes = StorageService.requestContact(lfList[1].id);
assert(contactRes.success && contactRes.count > 0, 'In-app contact requested successfully');

// 8. Opportunities Board Flow
const opps = StorageService.getOpportunities();
assert(opps.length >= 5, 'Opportunities loaded');
const todayStr = new Date().toISOString().split('T')[0];
const expiredOpps = opps.filter(o => o.deadline < todayStr);
assert(expiredOpps.length >= 1, 'Expired opportunity seeded for muted test');

const opp1 = opps[0];
const savedState = StorageService.toggleSaveOpportunity(opp1.id);
assert(typeof savedState === 'boolean', 'Opportunity saved toggle works');

console.log('--- ALL UNIT & INTEGRATION CHECKS PASSED SUCCESSFULLY ---');
