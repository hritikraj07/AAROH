import {
  User,
  UserRole,
  Course,
  ClassSession,
  AttendanceRecord,
  Assignment,
  Notice,
  CampusEvent,
  LostFoundItem,
  Opportunity,
  NotificationItem,
  GradeRecord,
} from '../types';
import { APP_CONFIG } from '../config';

// Parse role from institutional email domain
export function getUserRoleFromEmail(email: string): UserRole | null {
  const trimmed = email.trim().toLowerCase();
  if (trimmed.endsWith('@admin.aaroh.edu.in')) return 'admin';
  if (trimmed.endsWith('@faculty.aaroh.edu.in')) return 'faculty';
  if (trimmed.endsWith('@aaroh.edu.in')) return 'student';
  return null;
}

// Generate user profile upon domain-validated login
export function generateUserFromEmail(email: string): User {
  const trimmed = email.trim().toLowerCase();
  const role = getUserRoleFromEmail(trimmed) || 'student';
  const localPart = trimmed.split('@')[0];
  const nameParts = localPart.split(/[._-]/).filter(Boolean);
  
  const formattedName = nameParts.length > 0
    ? nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ')
    : role === 'admin'
    ? 'Campus Administrator'
    : role === 'faculty'
    ? 'Faculty Member'
    : 'Aaroh Student';

  const initials = nameParts.length >= 2
    ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
    : localPart.slice(0, 2).toUpperCase() || (role === 'admin' ? 'AD' : role === 'faculty' ? 'FA' : 'ST');

  if (role === 'admin') {
    return {
      id: `usr_adm_${Date.now()}`,
      name: formattedName,
      email: trimmed,
      role: 'admin',
      designation: 'System Administrator',
      department: 'Central Administration',
      avatarInitials: initials,
    };
  }

  if (role === 'faculty') {
    return {
      id: `usr_fac_${Date.now()}`,
      name: formattedName.startsWith('Prof') || formattedName.startsWith('Dr') ? formattedName : `Prof. ${formattedName}`,
      email: trimmed,
      role: 'faculty',
      designation: 'Assistant Professor',
      department: 'Department of Computer Science & Engineering',
      avatarInitials: initials,
    };
  }

  // Default: Student
  return {
    id: `usr_std_${Date.now()}`,
    name: formattedName,
    rollNumber: '22CS042',
    email: trimmed,
    role: 'student',
    designation: 'Undergraduate Scholar',
    program: 'B.Tech',
    department: 'Computer Science & Engineering',
    semester: 5,
    section: 'Section A',
    academicYear: APP_CONFIG.academicSession,
    avatarInitials: initials,
    attendanceMinimum: APP_CONFIG.defaultAttendanceThreshold,
  };
}

// Compatibility alias
export const generateStudentFromEmail = generateUserFromEmail;

// Initialized empty states - all mock data wiped clean for production foundation
export const INITIAL_USER: User | null = null;
export const INITIAL_STUDENT: User | null = null;

// Initial directory users: default demo admin, one demo student, and one demo faculty member
export const INITIAL_USERS: User[] = [
  {
    id: 'usr_adm_demo',
    name: 'Academic Registrar',
    email: 'registrar@admin.aaroh.edu.in',
    role: 'admin',
    designation: 'Campus Administrator',
    department: 'Central Administration',
    avatarInitials: 'AR',
  },
  {
    id: 'usr_std_demo',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@aaroh.edu.in',
    role: 'student',
    designation: 'Undergraduate Scholar',
    rollNumber: '22CS042',
    program: 'B.Tech CSE',
    department: 'Computer Science & Engineering',
    semester: 5,
    section: 'Section A',
    academicYear: APP_CONFIG.academicSession,
    avatarInitials: 'AS',
    attendanceMinimum: APP_CONFIG.defaultAttendanceThreshold,
    classCoordinator: 'Prof. K. Ramanujam',
    savedOpportunityIds: [],
  },
  {
    id: 'usr_std_priya',
    name: 'Priya Patel',
    email: 'priya.patel@aaroh.edu.in',
    role: 'student',
    designation: 'Undergraduate Scholar',
    rollNumber: '22CS088',
    program: 'B.Tech CSE',
    department: 'Computer Science & Engineering',
    semester: 5,
    section: 'Section B',
    academicYear: APP_CONFIG.academicSession,
    avatarInitials: 'PP',
    attendanceMinimum: APP_CONFIG.defaultAttendanceThreshold,
    classCoordinator: 'Prof. K. Ramanujam',
    savedOpportunityIds: [],
  },
  {
    id: 'usr_std_rohan',
    name: 'Rohan Verma',
    email: 'rohan.verma@aaroh.edu.in',
    role: 'student',
    designation: 'Undergraduate Scholar',
    rollNumber: '22CS104',
    program: 'B.Tech CSE',
    department: 'Computer Science & Engineering',
    semester: 5,
    section: 'Section A',
    academicYear: APP_CONFIG.academicSession,
    avatarInitials: 'RV',
    attendanceMinimum: APP_CONFIG.defaultAttendanceThreshold,
    classCoordinator: 'Prof. K. Ramanujam',
    savedOpportunityIds: [],
  },
  {
    id: 'usr_fac_demo',
    name: 'Prof. K. Ramanujam',
    email: 'prof.raman@faculty.aaroh.edu.in',
    role: 'faculty',
    designation: 'Assistant Professor & Class Coordinator',
    department: 'Department of Computer Science & Engineering',
    avatarInitials: 'KR',
  },
];

// Clean initial states: all pre-seeded mock entities wiped clean for production foundation
export const INITIAL_COURSES: Course[] = [];
export const INITIAL_TIMETABLE: ClassSession[] = [];
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    courseId: 'cs_core',
    studentId: 'usr_std_demo',
    studentEmail: 'aarav.sharma@aaroh.edu.in',
    attended: 22,
    total: 25,
  },
  {
    courseId: 'cs_core',
    studentId: 'usr_std_priya',
    studentEmail: 'priya.patel@aaroh.edu.in',
    attended: 11,
    total: 16,
  },
  {
    courseId: 'cs_core',
    studentId: 'usr_std_rohan',
    studentEmail: 'rohan.verma@aaroh.edu.in',
    attended: 20,
    total: 24,
  },
];
export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg_lab_aarav_1',
    courseId: 'CS301',
    title: 'Automated Coding Lab: Frontend State Machine & UI',
    description: 'Implement a reactive state management pipeline and accessible design system.',
    dueDate: '2026-11-25',
    maxMarks: 100,
    status: 'graded',
    type: 'coding',
    language: 'JavaScript',
    starterCode: '// Frontend state engine starter',
    testResultsSummary: '✅ Test 1 Passed | ✅ Test 2 Passed',
    submittedAt: '2026-11-12T11:00:00.000Z',
    studentId: 'usr_std_demo',
    studentEmail: 'aarav.sharma@aaroh.edu.in',
  },
  {
    id: 'asg_lab_priya_1',
    courseId: 'CS302',
    title: 'Automated Coding Lab: Distributed Cache & Python Microservices',
    description: 'Implement distributed consensus and memory cache synchronization in Python.',
    dueDate: '2026-11-25',
    maxMarks: 100,
    status: 'graded',
    type: 'coding',
    language: 'Python',
    starterCode: '# Python distributed cache starter',
    testResultsSummary: '✅ Test 1 Passed | ✅ Test 2 Passed',
    submittedAt: '2026-11-13T15:30:00.000Z',
    studentId: 'usr_std_priya',
    studentEmail: 'priya.patel@aaroh.edu.in',
  },
  {
    id: 'asg_lab_1',
    courseId: 'cs_core',
    title: 'Automated Coding Lab 1: Memory Allocation',
    description: 'Implement memory allocation system calls in C/C++.',
    dueDate: '2026-11-20',
    maxMarks: 100,
    status: 'submitted',
    type: 'coding',
    language: 'C++',
    starterCode: '// Memory allocator starter code',
    testResultsSummary: '❌ Test 1 Failed: Segfault in custom allocator | ❌ Test 2 Failed',
    submittedAt: '2026-11-10T14:30:00.000Z',
    studentId: 'usr_std_rohan',
    studentEmail: 'rohan.verma@aaroh.edu.in',
  },
  {
    id: 'asg_lab_2',
    courseId: 'cs_core',
    title: 'Automated Coding Lab 2: Process Scheduling',
    description: 'Simulate Round Robin and Priority preemptive task schedulers.',
    dueDate: '2026-11-22',
    maxMarks: 100,
    status: 'submitted',
    type: 'coding',
    language: 'Python',
    starterCode: '# Process scheduler starter',
    testResultsSummary: '❌ Test 1 Failed: Deadlock in worker pool | ❌ Test 2 Failed',
    submittedAt: '2026-11-14T16:00:00.000Z',
    studentId: 'usr_std_rohan',
    studentEmail: 'rohan.verma@aaroh.edu.in',
  },
];
export const INITIAL_NOTICES: Notice[] = [];
export const INITIAL_EVENTS: CampusEvent[] = [];
export const INITIAL_LOST_FOUND: LostFoundItem[] = [
  {
    id: 'lf_lost_1',
    type: 'lost',
    title: 'Lost: ASUS TUF Gaming Laptop',
    category: 'Electronics',
    description: 'Dark grey ASUS TUF Gaming Laptop in black sleeve, left near Library Lab 3 table.',
    location: 'Central Library Lab 3',
    date: '2026-11-14',
    status: 'open',
    reportedBy: {
      id: 'usr_std_demo',
      email: 'aarav.sharma@aaroh.edu.in',
      name: 'Aarav Sharma',
      studentId: 'usr_std_demo',
      isCurrentUser: true,
    },
    contactRequestsCount: 0,
  },
  {
    id: 'lf_found_1',
    type: 'found',
    title: 'Found: Black ASUS Laptop',
    category: 'Electronics',
    description: 'Black ASUS Gaming Laptop found on study desk in 2nd floor reading hall with charger.',
    location: 'Central Library 2nd Floor',
    date: '2026-11-15',
    status: 'open',
    reportedBy: {
      id: 'usr_std_priya',
      email: 'priya.patel@aaroh.edu.in',
      name: 'Priya Patel',
      studentId: 'usr_std_priya',
      isCurrentUser: false,
    },
    contactRequestsCount: 1,
  },
];
export const INITIAL_OPPORTUNITIES: Opportunity[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_GRADES: GradeRecord[] = [
  {
    id: 'grd_1',
    studentId: 'usr_std_demo',
    studentName: 'Aarav Sharma',
    studentRoll: '22CS042',
    studentEmail: 'aarav.sharma@aaroh.edu.in',
    courseId: 'CS301',
    courseCode: 'CS301',
    courseName: 'Operating Systems & Concurrency',
    semester: 5,
    assessmentType: 'Mid-Sem',
    marksScored: 44,
    maxMarks: 50,
    grade: 'A+',
    credits: 4,
    updatedAt: '2026-11-10T10:00:00Z',
  },
  {
    id: 'grd_2',
    studentId: 'usr_std_demo',
    studentName: 'Aarav Sharma',
    studentRoll: '22CS042',
    studentEmail: 'aarav.sharma@aaroh.edu.in',
    courseId: 'CS302',
    courseCode: 'CS302',
    courseName: 'Database Management Systems',
    semester: 5,
    assessmentType: 'Mid-Sem',
    marksScored: 41,
    maxMarks: 50,
    grade: 'A',
    credits: 4,
    updatedAt: '2026-11-10T10:00:00Z',
  },
  {
    id: 'grd_3',
    studentId: 'usr_std_demo',
    studentName: 'Aarav Sharma',
    studentRoll: '22CS042',
    studentEmail: 'aarav.sharma@aaroh.edu.in',
    courseId: 'CS303',
    courseCode: 'CS303',
    courseName: 'Computer Networks & Protocols',
    semester: 5,
    assessmentType: 'Mid-Sem',
    marksScored: 38,
    maxMarks: 50,
    grade: 'B+',
    credits: 3,
    updatedAt: '2026-11-10T10:00:00Z',
  },
  {
    id: 'grd_4',
    studentId: 'usr_std_demo',
    studentName: 'Aarav Sharma',
    studentRoll: '22CS042',
    studentEmail: 'aarav.sharma@aaroh.edu.in',
    courseId: 'CS304',
    courseCode: 'CS304',
    courseName: 'Design & Analysis of Algorithms',
    semester: 5,
    assessmentType: 'Mid-Sem',
    marksScored: 46,
    maxMarks: 50,
    grade: 'A+',
    credits: 4,
    updatedAt: '2026-11-10T10:00:00Z',
  },
  {
    id: 'grd_5',
    studentId: 'usr_std_demo',
    studentName: 'Aarav Sharma',
    studentRoll: '22CS042',
    studentEmail: 'aarav.sharma@aaroh.edu.in',
    courseId: 'CS301',
    courseCode: 'CS301',
    courseName: 'Operating Systems & Concurrency',
    semester: 5,
    assessmentType: 'End-Sem',
    marksScored: 86,
    maxMarks: 100,
    grade: 'A',
    credits: 4,
    updatedAt: '2026-11-12T10:00:00Z',
  },
  {
    id: 'grd_6',
    studentId: 'usr_std_priya',
    studentName: 'Priya Patel',
    studentRoll: '22CS088',
    studentEmail: 'priya.patel@aaroh.edu.in',
    courseId: 'CS301',
    courseCode: 'CS301',
    courseName: 'Operating Systems & Concurrency',
    semester: 5,
    assessmentType: 'Mid-Sem',
    marksScored: 42,
    maxMarks: 50,
    grade: 'A',
    credits: 4,
    updatedAt: '2026-11-10T10:00:00Z',
  },
];
