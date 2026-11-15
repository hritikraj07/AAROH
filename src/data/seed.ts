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
    savedOpportunityIds: ['opp_1'],
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
const getRelativeDateTime = (hoursFromNow: number): string => {
  const d = new Date();
  d.setTime(d.getTime() + hoursFromNow * 60 * 60 * 1000);
  return d.toISOString();
};

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg_1',
    courseId: 'crs_cs301',
    title: 'Process Synchronization & Semaphore Lab Report',
    description: 'Implement dining philosophers and producer-consumer problem using POSIX semaphores and mutex locks. Submit source code and benchmark report.',
    dueDate: getRelativeDateTime(18), // Due in 18 hours (under 48h)
    maxMarks: 25,
    status: 'pending',
  },
  {
    id: 'asg_2',
    courseId: 'crs_cs303',
    title: 'B+ Tree Indexing & Query Optimization Worksheet',
    description: 'Solve theoretical problems on multi-level indexing, calculate disk access costs, and write query execution trees.',
    dueDate: getRelativeDateTime(72), // Due in 72 hours (outside 48h)
    maxMarks: 30,
    status: 'pending',
  },
];
const getRelativeDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'not_1',
    title: 'Mid-Term Examination Schedule & Room Allotment',
    content: 'The official schedule for Autumn Semester Mid-Term Examinations is released. Students must check their assigned exam halls and report 15 minutes prior to commencement.',
    category: 'Exams',
    department: 'Office of the Controller of Examinations',
    publishedDate: getRelativeDate(-2),
    isPinned: true,
    readByCurrentUser: false,
  },
  {
    id: 'not_2',
    title: 'Central Library Extended Hours for Capstone Projects',
    content: 'The Central Library reading hall and digital resources center will remain operational until 11:00 PM on weekdays to facilitate academic research and semester project submissions.',
    category: 'Academic',
    department: 'University Library System',
    publishedDate: getRelativeDate(-4),
    isPinned: false,
    readByCurrentUser: true,
  },
];

export const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: 'evt_1',
    title: 'Aaroh Annual Inter-College Hackathon 2026',
    description: 'A 36-hour sprint challenging multidisciplinary student teams to build intelligent solutions for smart campuses and urban sustainability.',
    category: 'Tech',
    date: getRelativeDate(5),
    startTime: '09:00',
    endTime: '18:00',
    venue: 'Auditorium Complex - Hall A',
    organizer: 'Computing & Innovation Society',
    capacity: 120,
    registeredCount: 48,
    isRegistered: false,
  },
  {
    id: 'evt_2',
    title: 'Workshop: Distributed Systems with Go & Docker',
    description: 'Hands-on technical workshop covering concurrency patterns, microservice architectures, and Docker containerization.',
    category: 'Workshops',
    date: getRelativeDate(8),
    startTime: '14:00',
    endTime: '17:00',
    venue: 'CS Seminar Hall 2',
    organizer: 'Department of Computer Science',
    capacity: 75,
    registeredCount: 30,
    isRegistered: false,
  },
];

export const INITIAL_LOST_FOUND: LostFoundItem[] = [];
export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp_1',
    title: 'Google Summer of Code (GSoC) 2026',
    organization: 'Google Open Source',
    type: 'Internship',
    deadline: getRelativeDate(1), // Due tomorrow (well within 48h window)
    mode: 'Remote',
    eligibility: 'All enrolled undergraduate students in STEM disciplines',
    stipendPrize: '₹45,000 / month ($1,500 – $3,000 total stipend)',
    applyLink: 'https://summerofcode.withgoogle.com',
    description: 'Work with open source contributor organizations on 12-week or 22-week programming projects under the guidance of dedicated technical mentors.',
    isSaved: true,
  },
  {
    id: 'opp_2',
    title: 'Smart India Hackathon 2026 (Software Edition)',
    organization: 'Ministry of Education & AICTE',
    type: 'Hackathon',
    deadline: getRelativeDate(5),
    mode: 'On-site',
    eligibility: 'Teams of 6 students with at least 1 female teammate',
    stipendPrize: '₹1,00,000 Prize Pool per Problem Statement',
    applyLink: 'https://sih.gov.in',
    description: 'Nationwide product-building challenge seeking digital solutions for ministry departments, public sector challenges, and green energy logistics.',
    isSaved: false,
  },
  {
    id: 'opp_3',
    title: 'Software Engineering Summer Intern',
    organization: 'Microsoft India R&D',
    type: 'Internship',
    deadline: getRelativeDate(14),
    mode: 'On-site',
    eligibility: 'Pre-final Year B.Tech / Dual Degree students (Batch of 2027)',
    stipendPrize: '₹1,25,000 / month + Housing Allowance',
    applyLink: 'https://careers.microsoft.com',
    description: 'Build enterprise cloud tools, distributed systems, and modern web infrastructure alongside senior core engineering teams in Hyderabad / Bangalore.',
    isSaved: false,
  },
  {
    id: 'opp_4',
    title: 'ACM ICPC Asia-Amritapuri Regional Championship',
    organization: 'International Collegiate Programming Contest',
    type: 'Competition',
    deadline: getRelativeDate(28),
    mode: 'On-site',
    eligibility: 'Teams of 3 university students with coach endorsement',
    stipendPrize: 'World Finals Qualification & ₹2,50,000 Cash Awards',
    applyLink: 'https://icpc.global',
    description: 'The premier algorithmic programming championship testing mathematical reasoning, data structures, and high-pressure team problem solving.',
    isSaved: false,
  },
  {
    id: 'opp_5',
    title: 'ISRO Geo-Spatial AI Challenge',
    organization: 'Indian Space Research Organisation',
    type: 'Competition',
    deadline: getRelativeDate(-3), // Expired!
    mode: 'Remote',
    eligibility: 'Undergraduate and postgraduate students across India',
    stipendPrize: '₹75,000 Cash Prize & Research Citation',
    applyLink: 'https://isro.gov.in',
    description: 'Computer vision and multi-spectral satellite imagery segmentation competition to automatically classify terrain, wetlands, and urbanization.',
    isSaved: false,
  },
];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
