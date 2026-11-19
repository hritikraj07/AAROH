import { ClassSession, User } from '../types';

export interface CourseEnrollmentRoster {
  courseId: string;
  courseCode: string;
  courseName: string;
  students: User[];
}

const STORAGE_KEY_COURSE_ENROLLMENTS = 'aaroh_course_enrollments';

// Curated cohort of students across KRMU specializations and sections
export const SEED_COURSE_STUDENTS: Record<string, User[]> = {
  // 1. Python Programming (CS101-AIML)
  c_python_aiml: [
    {
      id: 'usr_std_aarav',
      name: 'Aarav Sharma',
      rollNumber: '22CS042',
      email: 'aarav.sharma@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'AS',
    },
    {
      id: 'usr_std_pankaj',
      name: 'Pankaj Kumar',
      rollNumber: '22CS001',
      email: 'pankaj.kumar@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'PK',
    },
    {
      id: 'usr_std_mohak',
      name: 'Mohak Singhal',
      rollNumber: '22CS002',
      email: 'mohak.singhal@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'MS',
    },
    {
      id: 'usr_std_mukesh',
      name: 'Mukesh Verma',
      rollNumber: '22CS003',
      email: 'mukesh.verma@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'MV',
    },
    {
      id: 'usr_std_rohan',
      name: 'Rohan Mehta',
      rollNumber: '22CS015',
      email: 'rohan.mehta@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'RM',
    },
    {
      id: 'usr_std_sneha',
      name: 'Sneha Patel',
      rollNumber: '22CS028',
      email: 'sneha.patel@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'SP',
    },
  ],

  // 2. Web Development I (CS103-AIML) - Distinct Roster with Priya, Ananya, Devansh
  c_webdev_aiml: [
    {
      id: 'usr_std_aarav',
      name: 'Aarav Sharma',
      rollNumber: '22CS042',
      email: 'aarav.sharma@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'AS',
    },
    {
      id: 'usr_std_sneha',
      name: 'Sneha Patel',
      rollNumber: '22CS028',
      email: 'sneha.patel@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'SP',
    },
    {
      id: 'usr_std_priya',
      name: 'Priya Singh',
      rollNumber: '22CS034',
      email: 'priya.singh@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'PS',
    },
    {
      id: 'usr_std_ananya',
      name: 'Ananya Sengupta',
      rollNumber: '22CS045',
      email: 'ananya.sengupta@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'AN',
    },
    {
      id: 'usr_std_devansh',
      name: 'Devansh Gupta',
      rollNumber: '22CS052',
      email: 'devansh.gupta@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'DG',
    },
    {
      id: 'usr_std_rohan',
      name: 'Rohan Mehta',
      rollNumber: '22CS015',
      email: 'rohan.mehta@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'RM',
    },
  ],

  // 3. Probability & Statistics (MA101-AIML) - Distinct Roster with Isha, Aditya, Priya
  c_prob_stats: [
    {
      id: 'usr_std_aarav',
      name: 'Aarav Sharma',
      rollNumber: '22CS042',
      email: 'aarav.sharma@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'AS',
    },
    {
      id: 'usr_std_pankaj',
      name: 'Pankaj Kumar',
      rollNumber: '22CS001',
      email: 'pankaj.kumar@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'PK',
    },
    {
      id: 'usr_std_mohak',
      name: 'Mohak Singhal',
      rollNumber: '22CS002',
      email: 'mohak.singhal@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'MS',
    },
    {
      id: 'usr_std_isha',
      name: 'Isha Malhotra',
      rollNumber: '22CS061',
      email: 'isha.malhotra@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'IM',
    },
    {
      id: 'usr_std_aditya',
      name: 'Aditya Sharma',
      rollNumber: '22CS070',
      email: 'aditya.sharma@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'AS',
    },
    {
      id: 'usr_std_priya',
      name: 'Priya Singh',
      rollNumber: '22CS034',
      email: 'priya.singh@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'PS',
    },
  ],

  // 4. Basics of Electronics (EC101-AIML) - Section B Cohort
  c_electronics_aiml: [
    {
      id: 'usr_std_aarav',
      name: 'Aarav Sharma',
      rollNumber: '22CS042',
      email: 'aarav.sharma@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'B',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'AS',
    },
    {
      id: 'usr_std_kavita',
      name: 'Kavita Reddy',
      rollNumber: '22CS081',
      email: 'kavita.reddy@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'B',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'KR',
    },
    {
      id: 'usr_std_vikram',
      name: 'Vikram Joshi',
      rollNumber: '22CS089',
      email: 'vikram.joshi@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'B',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'VJ',
    },
    {
      id: 'usr_std_aditya_c',
      name: 'Aditya Chopra',
      rollNumber: '22CS095',
      email: 'aditya.chopra@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'B',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'AC',
    },
    {
      id: 'usr_std_meera',
      name: 'Meera Nambiar',
      rollNumber: '22CS102',
      email: 'meera.nambiar@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'B',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'MN',
    },
    {
      id: 'usr_std_rahul',
      name: 'Rahul Dravid',
      rollNumber: '22CS110',
      email: 'rahul.dravid@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'B',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'RD',
    },
  ],

  // 5. CS Fundamentals & Career Pathways (CS102-AIML)
  c_cs_fundamentals: [
    {
      id: 'usr_std_aarav',
      name: 'Aarav Sharma',
      rollNumber: '22CS042',
      email: 'aarav.sharma@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'AS',
    },
    {
      id: 'usr_std_pankaj',
      name: 'Pankaj Kumar',
      rollNumber: '22CS001',
      email: 'pankaj.kumar@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'PK',
    },
    {
      id: 'usr_std_mukesh',
      name: 'Mukesh Verma',
      rollNumber: '22CS003',
      email: 'mukesh.verma@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'MV',
    },
    {
      id: 'usr_std_devansh',
      name: 'Devansh Gupta',
      rollNumber: '22CS052',
      email: 'devansh.gupta@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'DG',
    },
    {
      id: 'usr_std_ananya',
      name: 'Ananya Sengupta',
      rollNumber: '22CS045',
      email: 'ananya.sengupta@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'AN',
    },
  ],

  // 6. Maker Lab: Tinkering with Technology (ME101-AIML)
  c_maker_lab: [
    {
      id: 'usr_std_aarav',
      name: 'Aarav Sharma',
      rollNumber: '22CS042',
      email: 'aarav.sharma@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'B',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'AS',
    },
    {
      id: 'usr_std_kavita',
      name: 'Kavita Reddy',
      rollNumber: '22CS081',
      email: 'kavita.reddy@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'B',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'KR',
    },
    {
      id: 'usr_std_vikram',
      name: 'Vikram Joshi',
      rollNumber: '22CS089',
      email: 'vikram.joshi@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'B',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'VJ',
    },
    {
      id: 'usr_std_isha',
      name: 'Isha Malhotra',
      rollNumber: '22CS061',
      email: 'isha.malhotra@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'B',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'IM',
    },
    {
      id: 'usr_std_meera',
      name: 'Meera Nambiar',
      rollNumber: '22CS102',
      email: 'meera.nambiar@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI & ML)',
      course: 'B.Tech CSE (AI & ML)',
      semester: 1,
      section: 'B',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'MN',
    },
  ],

  // 7. Core Computer Science (CS101-CORE)
  'CS101-CORE': [
    {
      id: 'usr_std_aarav',
      name: 'Aarav Sharma',
      rollNumber: '22CS042',
      email: 'aarav.sharma@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (Core)',
      course: 'B.Tech CSE (Core)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'AS',
    },
    {
      id: 'usr_std_rohan',
      name: 'Rohan Mehta',
      rollNumber: '22CS015',
      email: 'rohan.mehta@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (Core)',
      course: 'B.Tech CSE (Core)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'RM',
    },
    {
      id: 'usr_std_karan',
      name: 'Karan Singhania',
      rollNumber: '22CS120',
      email: 'karan.singhania@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (Core)',
      course: 'B.Tech CSE (Core)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'KS',
    },
    {
      id: 'usr_std_simran',
      name: 'Simran Kaur',
      rollNumber: '22CS125',
      email: 'simran.kaur@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (Core)',
      course: 'B.Tech CSE (Core)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'SK',
    },
  ],

  // 8. AI & Data Science (DS101-AIDS)
  'DS101-AIDS': [
    {
      id: 'usr_std_aarav',
      name: 'Aarav Sharma',
      rollNumber: '22CS042',
      email: 'aarav.sharma@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI/DS)',
      course: 'B.Tech CSE (AI/DS)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'AS',
    },
    {
      id: 'usr_std_devansh',
      name: 'Devansh Gupta',
      rollNumber: '22CS052',
      email: 'devansh.gupta@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI/DS)',
      course: 'B.Tech CSE (AI/DS)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'DG',
    },
    {
      id: 'usr_std_pooja',
      name: 'Pooja Hegde',
      rollNumber: '22CS130',
      email: 'pooja.hegde@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI/DS)',
      course: 'B.Tech CSE (AI/DS)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'PH',
    },
    {
      id: 'usr_std_tarun',
      name: 'Tarun Grover',
      rollNumber: '22CS135',
      email: 'tarun.grover@aaroh.edu.in',
      role: 'student',
      program: 'B.Tech CSE (AI/DS)',
      course: 'B.Tech CSE (AI/DS)',
      semester: 1,
      section: 'A',
      department: 'Computer Science & Engineering',
      designation: 'Undergraduate Scholar',
      avatarInitials: 'TG',
    },
  ],
};

// Course code to ID alias mapping
const COURSE_CODE_TO_ID_MAP: Record<string, string> = {
  'CS101-AIML': 'c_python_aiml',
  'MA101-AIML': 'c_prob_stats',
  'CS103-AIML': 'c_webdev_aiml',
  'EC101-AIML': 'c_electronics_aiml',
  'CS102-AIML': 'c_cs_fundamentals',
  'ME101-AIML': 'c_maker_lab',
  'CS101-CORE': 'CS101-CORE',
  'PH101-CORE': 'CS101-CORE',
  'DS101-AIDS': 'DS101-AIDS',
  'DS102-AIDS': 'DS101-AIDS',
};

/**
 * Retrieve user-configured or custom course enrollments from localStorage.
 */
export function getCourseEnrollmentOverrides(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COURSE_ENROLLMENTS);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Save custom course enrollments to localStorage non-destructively.
 */
export function saveCourseEnrollmentOverride(courseIdOrCode: string, studentIds: string[]): void {
  try {
    const current = getCourseEnrollmentOverrides();
    current[courseIdOrCode] = Array.isArray(studentIds) ? studentIds : [];
    localStorage.setItem(STORAGE_KEY_COURSE_ENROLLMENTS, JSON.stringify(current));
  } catch {
    // Graceful offline fallback
  }
}

/**
 * Resolves the clean, course-specific student roster for a given course or session.
 * Guarantees that switching courses loads ONLY students enrolled in that specific course.
 */
export function getEnrolledStudentsForCourse(
  courseIdOrCode?: string | null,
  session?: Partial<ClassSession> | null,
  allUsers?: User[]
): User[] {
  const normKey = (courseIdOrCode || session?.courseId || session?.courseCode || '').trim();
  if (!normKey) return [];

  const canonicalKey = COURSE_CODE_TO_ID_MAP[normKey.toUpperCase()] || COURSE_CODE_TO_ID_MAP[normKey] || normKey;

  // 1. Check if there are custom explicit enrollments in localStorage
  const overrides = getCourseEnrollmentOverrides();
  const explicitStudentIds = overrides[normKey] || overrides[canonicalKey];

  const pool = Array.isArray(allUsers) && allUsers.length > 0
    ? allUsers.filter(u => u && u.role === 'student')
    : [];

  if (Array.isArray(explicitStudentIds) && explicitStudentIds.length > 0) {
    const matched = pool.filter(st => explicitStudentIds.includes(st.id) || (st.rollNumber && explicitStudentIds.includes(st.rollNumber)));
    if (matched.length > 0) return matched;
  }

  // 2. Check if students have explicit enrolledCourseIds property set
  if (pool.length > 0) {
    const explicitlyEnrolled = pool.filter(st => {
      if (!Array.isArray(st.enrolledCourseIds)) return false;
      return (
        st.enrolledCourseIds.includes(normKey) ||
        st.enrolledCourseIds.includes(canonicalKey) ||
        st.enrolledCourseIds.includes(session?.courseCode || '')
      );
    });
    if (explicitlyEnrolled.length > 0) return explicitlyEnrolled;
  }

  // 3. Check curated course seed cohorts
  const seedCohort = SEED_COURSE_STUDENTS[canonicalKey] || SEED_COURSE_STUDENTS[normKey];
  if (Array.isArray(seedCohort) && seedCohort.length > 0) {
    // If pool has dynamic updates for these students, merge updated data
    if (pool.length > 0) {
      const merged = seedCohort.map(seedSt => {
        const liveMatch = pool.find(
          u => u.id === seedSt.id || (u.rollNumber && seedSt.rollNumber && u.rollNumber === seedSt.rollNumber)
        );
        return liveMatch ? { ...seedSt, ...liveMatch } : seedSt;
      });
      return merged;
    }
    return [...seedCohort];
  }

  // 4. Fallback: Audience filtering based on session program, semester, and section
  if (session && pool.length > 0) {
    const sessionProg = (session.program || '').toLowerCase().trim();
    const sessionSem = session.semester ? Number(session.semester) : undefined;
    const sessionSec = (session.section || session.division || '').toLowerCase().trim();

    const audienceFiltered = pool.filter(st => {
      if (!st) return false;
      const stProg = (st.course || st.program || '').toLowerCase().trim();

      // Program match
      if (sessionProg && stProg) {
        const isAiml = (stProg === 'b.tech cse (ai & ml)' || stProg === 'b.tech cse (ai/ml)') &&
                       (sessionProg === 'b.tech cse (ai & ml)' || sessionProg === 'b.tech cse (ai/ml)');
        if (!isAiml && !stProg.includes(sessionProg) && !sessionProg.includes(stProg)) {
          return false;
        }
      }

      // Semester match
      if (sessionSem && st.semester && Number(st.semester) !== sessionSem) {
        return false;
      }

      // Section match
      if (sessionSec && (st.section || st.division)) {
        const stSec = (st.section || st.division || '').replace(/section/i, '').toLowerCase().trim();
        const normSec = sessionSec.replace(/section/i, '').trim();
        if (normSec && stSec && stSec !== normSec) {
          return false;
        }
      }

      return true;
    });

    if (audienceFiltered.length > 0) {
      return audienceFiltered;
    }
  }

  // 5. Zero-enrollment safety: return empty array so UI can show proper empty state
  return [];
}
