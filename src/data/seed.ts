import {
  Student,
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

// Clean foundation helper for generating student profiles upon domain-validated login
export function generateStudentFromEmail(email: string): Student {
  const localPart = email.split('@')[0];
  const nameParts = localPart.split(/[._-]/).filter(Boolean);
  const formattedName = nameParts.length > 0
    ? nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ')
    : 'Aaroh Student';
  
  const initials = nameParts.length >= 2
    ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
    : localPart.slice(0, 2).toUpperCase() || 'AS';

  return {
    id: `std_${Date.now()}`,
    name: formattedName,
    rollNumber: '22CS042',
    email: email.trim().toLowerCase(),
    program: 'B.Tech',
    department: 'Computer Science & Engineering',
    semester: 5,
    section: 'Section A',
    academicYear: APP_CONFIG.academicSession,
    avatarInitials: initials,
    attendanceMinimum: APP_CONFIG.defaultAttendanceThreshold,
  };
}

// Initialized empty states - all mock data wiped clean for production foundation
export const INITIAL_STUDENT: Student | null = null;
export const INITIAL_COURSES: Course[] = [];
export const INITIAL_TIMETABLE: ClassSession[] = [];
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_ASSIGNMENTS: Assignment[] = [];
export const INITIAL_NOTICES: Notice[] = [];
export const INITIAL_EVENTS: CampusEvent[] = [];
export const INITIAL_LOST_FOUND: LostFoundItem[] = [];
export const INITIAL_OPPORTUNITIES: Opportunity[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
