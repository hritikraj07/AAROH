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
  },
  {
    id: 'usr_fac_demo',
    name: 'Prof. K. Ramanujam',
    email: 'prof.raman@faculty.aaroh.edu.in',
    role: 'faculty',
    designation: 'Assistant Professor',
    department: 'Department of Computer Science & Engineering',
    avatarInitials: 'KR',
  },
];
export const INITIAL_COURSES: Course[] = [
  {
    id: 'crs_cs301',
    code: 'CS301',
    name: 'Operating Systems & System Architecture',
    credits: 4,
    facultyName: 'Prof. K. Ramanujam',
    facultyEmail: 'prof.raman@faculty.aaroh.edu.in',
    roomDefault: 'LH-101',
    colorTag: 'teal',
  },
  {
    id: 'crs_cs303',
    code: 'CS303',
    name: 'Database Management Systems',
    credits: 4,
    facultyName: 'Prof. K. Ramanujam',
    facultyEmail: 'prof.raman@faculty.aaroh.edu.in',
    roomDefault: 'LH-102',
    colorTag: 'blue',
  },
  {
    id: 'crs_cs305',
    code: 'CS305',
    name: 'Computer Networks & Distributed Protocols',
    credits: 3,
    facultyName: 'Prof. K. Ramanujam',
    facultyEmail: 'prof.raman@faculty.aaroh.edu.in',
    roomDefault: 'Room 304',
    colorTag: 'amber',
  },
];

export const INITIAL_TIMETABLE: ClassSession[] = [
  {
    id: 'sess_1',
    courseId: 'crs_cs301',
    courseCode: 'CS301',
    courseName: 'Operating Systems & System Architecture',
    dayOfWeek: 1, // Monday
    startTime: '09:00',
    endTime: '10:30',
    room: 'LH-101',
    facultyName: 'Prof. K. Ramanujam',
    facultyEmail: 'prof.raman@faculty.aaroh.edu.in',
    type: 'Lecture',
    program: 'B.Tech CSE',
    semester: 5,
  },
  {
    id: 'sess_2',
    courseId: 'crs_cs303',
    courseCode: 'CS303',
    courseName: 'Database Management Systems',
    dayOfWeek: 2, // Tuesday
    startTime: '10:45',
    endTime: '12:15',
    room: 'LH-102',
    facultyName: 'Prof. K. Ramanujam',
    facultyEmail: 'prof.raman@faculty.aaroh.edu.in',
    type: 'Lecture',
    program: 'B.Tech CSE',
    semester: 5,
  },
  {
    id: 'sess_3',
    courseId: 'crs_cs301',
    courseCode: 'CS301',
    courseName: 'Operating Systems Lab',
    dayOfWeek: 3, // Wednesday
    startTime: '14:00',
    endTime: '16:00',
    room: 'CS Lab 2',
    facultyName: 'Prof. K. Ramanujam',
    facultyEmail: 'prof.raman@faculty.aaroh.edu.in',
    type: 'Lab',
    program: 'B.Tech CSE',
    semester: 5,
  },
  {
    id: 'sess_4',
    courseId: 'crs_cs303',
    courseCode: 'CS303',
    courseName: 'Database Management Systems',
    dayOfWeek: 4, // Thursday
    startTime: '09:00',
    endTime: '10:30',
    room: 'LH-102',
    facultyName: 'Prof. K. Ramanujam',
    facultyEmail: 'prof.raman@faculty.aaroh.edu.in',
    type: 'Lecture',
    program: 'B.Tech CSE',
    semester: 5,
  },
  {
    id: 'sess_5',
    courseId: 'crs_cs301',
    courseCode: 'CS301',
    courseName: 'Operating Systems Tutorial',
    dayOfWeek: 5, // Friday
    startTime: '11:00',
    endTime: '12:30',
    room: 'LH-101',
    facultyName: 'Prof. K. Ramanujam',
    facultyEmail: 'prof.raman@faculty.aaroh.edu.in',
    type: 'Tutorial',
    program: 'B.Tech CSE',
    semester: 5,
  },
  {
    id: 'sess_6',
    courseId: 'crs_cs305',
    courseCode: 'CS305',
    courseName: 'Computer Networks',
    dayOfWeek: 6, // Saturday
    startTime: '10:00',
    endTime: '11:30',
    room: 'Room 304',
    facultyName: 'Prof. K. Ramanujam',
    facultyEmail: 'prof.raman@faculty.aaroh.edu.in',
    type: 'Lecture',
    program: 'B.Tech CSE',
    semester: 5,
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    courseId: 'crs_cs301',
    studentId: 'usr_std_demo',
    attended: 18,
    total: 22,
  },
  {
    courseId: 'crs_cs303',
    studentId: 'usr_std_demo',
    attended: 14,
    total: 20,
  },
  {
    courseId: 'crs_cs305',
    studentId: 'usr_std_demo',
    attended: 19,
    total: 20,
  },
];
export const INITIAL_ASSIGNMENTS: Assignment[] = [];
export const INITIAL_NOTICES: Notice[] = [];
export const INITIAL_EVENTS: CampusEvent[] = [];
export const INITIAL_LOST_FOUND: LostFoundItem[] = [];
export const INITIAL_OPPORTUNITIES: Opportunity[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
