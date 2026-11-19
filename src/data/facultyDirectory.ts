import { User } from '../types';
import { APP_CONFIG } from '../config';

export interface PreEnrolledAccount {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'Faculty' | 'Admin';
  full_name: string;
  course: string;
  division: string;
  designation: string;
  department: string;
}

export const PRE_ENROLLED_FACULTY: PreEnrolledAccount[] = [
  {
    id: 'FAC101',
    username: 'FAC101',
    email: 'fac101@aaroh.edu.in',
    password: 'FAC101',
    role: 'Faculty',
    full_name: 'Prof. Rajiv Sharma',
    course: 'B.Tech CSE',
    division: 'A',
    designation: 'Professor & Programme Chair',
    department: 'Department of Computer Science & Engineering',
  },
  {
    id: 'FAC102',
    username: 'FAC102',
    email: 'fac102@aaroh.edu.in',
    password: 'FAC102',
    role: 'Faculty',
    full_name: 'Dr. Anita Desai',
    course: 'B.Tech CSE (AI & ML)',
    division: 'A',
    designation: 'Associate Professor',
    department: 'Department of Computer Science & Engineering',
  },
  {
    id: 'FAC103',
    username: 'FAC103',
    email: 'fac103@aaroh.edu.in',
    password: 'FAC103',
    role: 'Faculty',
    full_name: 'Dr. Vikram Malhotra',
    course: 'B.Tech CSE (AI/DS)',
    division: 'A',
    designation: 'Associate Professor',
    department: 'Department of Computer Science & Engineering',
  },
  {
    id: 'FAC104',
    username: 'FAC104',
    email: 'fac104@aaroh.edu.in',
    password: 'FAC104',
    role: 'Faculty',
    full_name: 'Prof. Sandeep Verma',
    course: 'B.Tech CSE (Cyber Security) EC-Council',
    division: 'A',
    designation: 'Assistant Professor',
    department: 'Department of Computer Science & Engineering',
  },
  {
    id: 'FAC105',
    username: 'FAC105',
    email: 'fac105@aaroh.edu.in',
    password: 'FAC105',
    role: 'Faculty',
    full_name: 'Dr. Meenakshi Sundaram',
    course: 'B.Tech CSE (DS) IBM',
    division: 'A',
    designation: 'Associate Professor',
    department: 'Department of Computer Science & Engineering',
  },
  {
    id: 'FAC106',
    username: 'FAC106',
    email: 'fac106@aaroh.edu.in',
    password: 'FAC106',
    role: 'Faculty',
    full_name: 'Prof. Arjun Nair',
    course: 'B.Tech CSE (Robotics & AI)',
    division: 'A',
    designation: 'Assistant Professor',
    department: 'Department of Computer Science & Engineering',
  },
  {
    id: 'FAC107',
    username: 'FAC107',
    email: 'fac107@aaroh.edu.in',
    password: 'FAC107',
    role: 'Faculty',
    full_name: 'Dr. Priya Singhania',
    course: 'B.Tech CSE (UX OR UI)',
    division: 'A',
    designation: 'Assistant Professor',
    department: 'Department of Computer Science & Engineering',
  },
  {
    id: 'FAC108',
    username: 'FAC108',
    email: 'fac108@aaroh.edu.in',
    password: 'FAC108',
    role: 'Faculty',
    full_name: 'Prof. Harish Chandra',
    course: 'BCA (SP AI & DS)',
    division: 'A',
    designation: 'Senior Lecturer',
    department: 'Department of Computer Applications',
  },
  {
    id: 'FAC109',
    username: 'FAC109',
    email: 'fac109@aaroh.edu.in',
    password: 'FAC109',
    role: 'Faculty',
    full_name: 'Dr. Neha Kapoor',
    course: 'BCA (H) (Sp AI & DS) (Research)',
    division: 'A',
    designation: 'Assistant Professor',
    department: 'Department of Computer Applications',
  },
  {
    id: 'FAC110',
    username: 'FAC110',
    email: 'fac110@aaroh.edu.in',
    password: 'FAC110',
    role: 'Faculty',
    full_name: 'Prof. Tarun Joshi',
    course: 'BCA (Cyber Security)',
    division: 'A',
    designation: 'Assistant Professor',
    department: 'Department of Computer Applications',
  },
  {
    id: 'FAC111',
    username: 'FAC111',
    email: 'fac111@aaroh.edu.in',
    password: 'FAC111',
    role: 'Faculty',
    full_name: 'Dr. Ritu Aggarwal',
    course: 'BCA (Hons./ Hons. with Research)',
    division: 'A',
    designation: 'Associate Professor',
    department: 'Department of Computer Applications',
  },
  {
    id: 'FAC112',
    username: 'FAC112',
    email: 'fac112@aaroh.edu.in',
    password: 'FAC112',
    role: 'Faculty',
    full_name: 'Prof. Ramanujam Iyengar',
    course: 'MCA',
    division: 'A',
    designation: 'Professor',
    department: 'Department of Computer Applications',
  },
];

export const PRE_ENROLLED_ADMIN: PreEnrolledAccount = {
  id: 'ADM001',
  username: 'ADM001',
  email: 'adm001@aaroh.edu.in',
  password: 'ADM001',
  role: 'Admin',
  full_name: 'Central Institutional Administrator (ADM001)',
  course: 'All Programmes',
  division: 'HQ',
  designation: 'Chief Academic Registrar',
  department: 'Central Administration',
};

export const ALL_INSTITUTIONAL_ACCOUNTS: PreEnrolledAccount[] = [
  ...PRE_ENROLLED_FACULTY,
  PRE_ENROLLED_ADMIN,
];

export function findPreEnrolledAccount(identifier: string): PreEnrolledAccount | undefined {
  const clean = identifier.trim().toLowerCase();
  const cleanNoAt = clean.replace(/@.*$/, '');
  return ALL_INSTITUTIONAL_ACCOUNTS.find(
    acc =>
      acc.email.toLowerCase() === clean ||
      acc.username.toLowerCase() === clean ||
      acc.username.toLowerCase() === cleanNoAt ||
      acc.email.toLowerCase() === `${cleanNoAt}@aaroh.edu.in`
  );
}

export function convertToUser(account: PreEnrolledAccount): User {
  const role = account.role.toLowerCase() as 'faculty' | 'admin';
  return {
    id: `usr_${account.username.toLowerCase()}`,
    name: account.full_name,
    email: account.email,
    username: account.username,
    password: account.password,
    role,
    avatarInitials: account.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
    department: account.department,
    designation: account.designation,
    course: account.course,
    program: account.course,
    division: account.division,
    section: `Section ${account.division}`,
    semester: 1,
    academicYear: APP_CONFIG.academicSession,
    attendanceMinimum: APP_CONFIG.defaultAttendanceThreshold,
  };
}
