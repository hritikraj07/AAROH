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

// Initial directory users: default admin preserved as sole initialized user; all other accounts purged
export const INITIAL_USERS: User[] = [
  {
    id: 'usr_adm_demo',
    name: 'Academic Registrar',
    email: 'registrar@admin.aaroh.edu.in',
    role: 'admin',
    password: 'campusSecure2026',
    designation: 'Campus Administrator',
    department: 'Central Administration',
    avatarInitials: 'AR',
  },
];

// Clean initial states: all pre-seeded mock entities wiped clean for zero-data dynamic initialization
export const INITIAL_COURSES: Course[] = [];
export const INITIAL_TIMETABLE: ClassSession[] = [];
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_ASSIGNMENTS: Assignment[] = [];
export const INITIAL_NOTICES: Notice[] = [];
export const INITIAL_EVENTS: CampusEvent[] = [];
export const INITIAL_LOST_FOUND: LostFoundItem[] = [];
export const INITIAL_OPPORTUNITIES: Opportunity[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_GRADES: GradeRecord[] = [];
