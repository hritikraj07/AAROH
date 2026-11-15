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

// Relative date helper
export const formatRelativeDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const formatRelativeDateTime = (offsetDays: number, hours = 10, minutes = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

export const SEED_STUDENT: Student = {
  id: 'std_2022cs042',
  name: 'Aarav Sharma',
  rollNumber: '22CS042',
  email: 'aarav.sharma@ait.edu.in',
  program: 'B.Tech',
  department: 'Computer Science & Engineering',
  semester: 5,
  section: 'Section A',
  academicYear: APP_CONFIG.academicSession,
  avatarInitials: 'AS',
  attendanceMinimum: APP_CONFIG.defaultAttendanceThreshold,
};

export const SEED_COURSES: Course[] = [
  {
    id: 'c_cs301',
    code: 'CS301',
    name: 'Operating Systems',
    credits: 4,
    facultyName: 'Prof. K. R. Raman',
    facultyEmail: 'kr.raman@ait.edu.in',
    roomDefault: 'LH-102',
    colorTag: 'teal',
  },
  {
    id: 'c_cs302',
    code: 'CS302',
    name: 'Database Management Systems',
    credits: 4,
    facultyName: 'Dr. Shalini Verma',
    facultyEmail: 'shalini.verma@ait.edu.in',
    roomDefault: 'LH-204',
    colorTag: 'blue',
  },
  {
    id: 'c_cs303',
    code: 'CS303',
    name: 'Computer Networks',
    credits: 3,
    facultyName: 'Prof. Amit Deshmukh',
    facultyEmail: 'a.deshmukh@ait.edu.in',
    roomDefault: 'LH-105',
    colorTag: 'indigo',
  },
  {
    id: 'c_cs304',
    code: 'CS304',
    name: 'Design and Analysis of Algorithms',
    credits: 4,
    facultyName: 'Dr. P. Venkat',
    facultyEmail: 'p.venkat@ait.edu.in',
    roomDefault: 'LH-201',
    colorTag: 'emerald',
  },
  {
    id: 'c_cs305',
    code: 'CS305',
    name: 'Web Technologies Lab',
    credits: 2,
    facultyName: 'Prof. Neha Gupta',
    facultyEmail: 'neha.gupta@ait.edu.in',
    roomDefault: 'CS Lab 3',
    colorTag: 'violet',
  },
  {
    id: 'c_hs301',
    code: 'HS301',
    name: 'Professional Ethics & Human Values',
    credits: 2,
    facultyName: 'Dr. Maya Rao',
    facultyEmail: 'maya.rao@ait.edu.in',
    roomDefault: 'LH-108',
    colorTag: 'amber',
  },
];

export const SEED_ATTENDANCE: AttendanceRecord[] = [
  { courseId: 'c_cs301', attended: 25, total: 36 }, // 69.4% (Below 75%! Needs 8 more to hit 75%)
  { courseId: 'c_cs302', attended: 35, total: 40 }, // 87.5% (Safe, can miss 6)
  { courseId: 'c_cs303', attended: 27, total: 32 }, // 84.4% (Safe, can miss 4)
  { courseId: 'c_cs304', attended: 39, total: 44 }, // 88.6% (Safe, can miss 8)
  { courseId: 'c_cs305', attended: 14, total: 16 }, // 87.5% (Safe, can miss 2)
  { courseId: 'c_hs301', attended: 12, total: 18 }, // 66.7% (Below 75%! Needs 6 more to hit 75%)
];

// Weekly Timetable (1 = Monday ... 6 = Saturday)
export const SEED_TIMETABLE: ClassSession[] = [
  // Monday
  { id: 'ts_m1', courseId: 'c_cs301', dayOfWeek: 1, startTime: '09:00', endTime: '10:00', room: 'LH-102', facultyName: 'Prof. K. R. Raman', type: 'Lecture' },
  { id: 'ts_m2', courseId: 'c_cs304', dayOfWeek: 1, startTime: '10:15', endTime: '11:15', room: 'LH-201', facultyName: 'Dr. P. Venkat', type: 'Lecture' },
  { id: 'ts_m3', courseId: 'c_cs302', dayOfWeek: 1, startTime: '11:30', endTime: '12:30', room: 'LH-204', facultyName: 'Dr. Shalini Verma', type: 'Lecture' },
  { id: 'ts_m4', courseId: 'c_cs305', dayOfWeek: 1, startTime: '14:00', endTime: '16:00', room: 'CS Lab 3', facultyName: 'Prof. Neha Gupta', type: 'Lab' },

  // Tuesday
  { id: 'ts_t1', courseId: 'c_cs303', dayOfWeek: 2, startTime: '09:00', endTime: '10:00', room: 'LH-105', facultyName: 'Prof. Amit Deshmukh', type: 'Lecture' },
  { id: 'ts_t2', courseId: 'c_cs301', dayOfWeek: 2, startTime: '10:15', endTime: '11:15', room: 'LH-102', facultyName: 'Prof. K. R. Raman', type: 'Lecture' },
  { id: 'ts_t3', courseId: 'c_hs301', dayOfWeek: 2, startTime: '11:30', endTime: '12:30', room: 'LH-108', facultyName: 'Dr. Maya Rao', type: 'Lecture' },
  { id: 'ts_t4', courseId: 'c_cs304', dayOfWeek: 2, startTime: '14:00', endTime: '15:00', room: 'LH-201', facultyName: 'Dr. P. Venkat', type: 'Tutorial' },

  // Wednesday
  { id: 'ts_w1', courseId: 'c_cs302', dayOfWeek: 3, startTime: '09:00', endTime: '10:00', room: 'LH-204', facultyName: 'Dr. Shalini Verma', type: 'Lecture' },
  { id: 'ts_w2', courseId: 'c_cs304', dayOfWeek: 3, startTime: '10:15', endTime: '11:15', room: 'LH-201', facultyName: 'Dr. P. Venkat', type: 'Lecture' },
  { id: 'ts_w3', courseId: 'c_cs303', dayOfWeek: 3, startTime: '11:30', endTime: '12:30', room: 'LH-105', facultyName: 'Prof. Amit Deshmukh', type: 'Lecture' },
  { id: 'ts_w4', courseId: 'c_cs301', dayOfWeek: 3, startTime: '14:00', endTime: '16:00', room: 'CS Lab 1', facultyName: 'Prof. K. R. Raman', type: 'Lab' },

  // Thursday
  { id: 'ts_th1', courseId: 'c_cs301', dayOfWeek: 4, startTime: '09:00', endTime: '10:00', room: 'LH-102', facultyName: 'Prof. K. R. Raman', type: 'Lecture' },
  { id: 'ts_th2', courseId: 'c_cs302', dayOfWeek: 4, startTime: '10:15', endTime: '11:15', room: 'LH-204', facultyName: 'Dr. Shalini Verma', type: 'Lecture' },
  { id: 'ts_th3', courseId: 'c_hs301', dayOfWeek: 4, startTime: '11:30', endTime: '12:30', room: 'LH-108', facultyName: 'Dr. Maya Rao', type: 'Lecture' },
  { id: 'ts_th4', courseId: 'c_cs303', dayOfWeek: 4, startTime: '14:00', endTime: '16:00', room: 'Networks Lab', facultyName: 'Prof. Amit Deshmukh', type: 'Lab' },

  // Friday
  { id: 'ts_f1', courseId: 'c_cs304', dayOfWeek: 5, startTime: '09:00', endTime: '10:00', room: 'LH-201', facultyName: 'Dr. P. Venkat', type: 'Lecture' },
  { id: 'ts_f2', courseId: 'c_cs303', dayOfWeek: 5, startTime: '10:15', endTime: '11:15', room: 'LH-105', facultyName: 'Prof. Amit Deshmukh', type: 'Lecture' },
  { id: 'ts_f3', courseId: 'c_cs302', dayOfWeek: 5, startTime: '11:30', endTime: '12:30', room: 'LH-204', facultyName: 'Dr. Shalini Verma', type: 'Tutorial' },
  { id: 'ts_f4', courseId: 'c_cs305', dayOfWeek: 5, startTime: '14:00', endTime: '15:30', room: 'CS Lab 3', facultyName: 'Prof. Neha Gupta', type: 'Lab' },

  // Saturday (elective & tutorial)
  { id: 'ts_s1', courseId: 'c_cs301', dayOfWeek: 6, startTime: '09:30', endTime: '11:00', room: 'LH-102', facultyName: 'Prof. K. R. Raman', type: 'Tutorial' },
  { id: 'ts_s2', courseId: 'c_hs301', dayOfWeek: 6, startTime: '11:15', endTime: '12:45', room: 'LH-108', facultyName: 'Dr. Maya Rao', type: 'Tutorial' },
];

export const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg_01',
    courseId: 'c_cs301',
    title: 'Process Synchronization and Semaphores Problem Set',
    description: 'Implement Dining Philosophers and Reader-Writer solutions with POSIX mutexes and semaphores in C.',
    dueDate: formatRelativeDate(1), // Tomorrow!
    maxMarks: 25,
    status: 'pending',
  },
  {
    id: 'asg_02',
    courseId: 'c_cs302',
    title: 'B+ Tree Indexing & Query Cost Analysis',
    description: 'Calculate disk I/O blocks for given index heights and construct query execution plan comparisons.',
    dueDate: formatRelativeDate(3), // In 3 days
    maxMarks: 20,
    status: 'pending',
  },
  {
    id: 'asg_03',
    courseId: 'c_cs304',
    title: 'Dynamic Programming vs Branch-and-Bound Report',
    description: 'Comparative runtime analysis for 0/1 Knapsack with random weight distributions over n=1000 items.',
    dueDate: formatRelativeDate(-2), // 2 days ago: OVERDUE!
    maxMarks: 30,
    status: 'overdue',
  },
  {
    id: 'asg_04',
    courseId: 'c_cs305',
    title: 'RESTful API with JWT Authentication Mockup',
    description: 'Build a student registry backend service with token invalidation and password hashing in Node.js/TypeScript.',
    dueDate: formatRelativeDate(5),
    maxMarks: 50,
    status: 'pending',
  },
  {
    id: 'asg_05',
    courseId: 'c_cs303',
    title: 'Subnetting & RIP/OSPF Packet Trace Analysis',
    description: 'Analyze Wireshark PCAP dumps for convergence timing and packet overhead under router link failure.',
    dueDate: formatRelativeDate(-5),
    maxMarks: 20,
    status: 'submitted',
    submittedAt: formatRelativeDate(-6),
    submissionNote: 'Submitted assignment archive report_22cs042.pdf to course portal.',
  },
  {
    id: 'asg_06',
    courseId: 'c_hs301',
    title: 'Case Study: AI Ethics in Automated Candidate Screening',
    description: '4-page analytical essay on algorithmic bias, fairness metrics, and legal liability in university hiring pipelines.',
    dueDate: formatRelativeDate(8),
    maxMarks: 15,
    status: 'pending',
  },
];

export const SEED_NOTICES: Notice[] = [
  {
    id: 'not_01',
    title: 'Mid-Semester Examination Schedule: Autumn 2026',
    content: 'The Mid-Semester Examinations for B.Tech Semesters 3, 5, and 7 will commence from 24th November 2026. Hall tickets will be issued through the academic ERP starting Friday. Students with attendance below 75% are advised to consult their respective Faculty Advisors immediately.',
    category: 'Exams',
    department: 'Controller of Examinations',
    publishedDate: formatRelativeDate(0), // Today
    isPinned: true,
    attachments: [
      { name: 'MidSem_TimeTable_Autumn2026.pdf', size: '284 KB', type: 'application/pdf' },
      { name: 'Seating_Matrix_Block_A_B.pdf', size: '1.2 MB', type: 'application/pdf' },
    ],
    readByCurrentUser: false,
  },
  {
    id: 'not_02',
    title: 'Mandatory Submission: Course Registration Verification Slips',
    content: 'All Semester 5 students must submit their signed course registration verification slips to the CSE Department Office (Cabin 204) by 5:00 PM this Thursday. Failure to submit will result in withholding of lab examination slots.',
    category: 'Academic',
    department: 'Department of Computer Science & Engineering',
    publishedDate: formatRelativeDate(-1), // Yesterday
    isPinned: true,
    attachments: [
      { name: 'Course_Verification_Form_V2.pdf', size: '115 KB', type: 'application/pdf' },
    ],
    readByCurrentUser: false,
  },
  {
    id: 'not_03',
    title: 'Campus Recruitment Drive: Oracle Cloud Infrastructure (OCI)',
    content: 'Oracle OCI will conduct an on-campus hiring drive for Summer Interns 2027 and FTE Software Engineers. Eligibility: B.Tech CSE/IT with CGPA >= 7.5 and no active backlogs. Online coding round on Hackerrank scheduled for Saturday.',
    category: 'Placements',
    department: 'Training & Placement Cell',
    publishedDate: formatRelativeDate(-2),
    isPinned: false,
    attachments: [
      { name: 'Oracle_OCI_Job_Description_2026.pdf', size: '420 KB', type: 'application/pdf' },
    ],
    readByCurrentUser: true,
  },
  {
    id: 'not_04',
    title: 'Hostel Maintenance & Water Supply Interruption Notice',
    content: 'Routine pipeline maintenance and water tank cleaning will be conducted in Boys Hostel 3 & Girls Hostel 2 tomorrow between 09:30 AM and 01:30 PM. Inhabitants are requested to store adequate water beforehand.',
    category: 'Administration',
    department: 'Chief Warden Office',
    publishedDate: formatRelativeDate(-3),
    isPinned: false,
    readByCurrentUser: true,
  },
  {
    id: 'not_05',
    title: 'Central Library Extended Hours for Examination Period',
    content: 'Starting next Monday, the Central Library reading halls will remain open 24 hours a day until the conclusion of the Mid-Semester Examinations. Night security and Wi-Fi access points have been reinforced across all floors.',
    category: 'General',
    department: 'Central Library',
    publishedDate: formatRelativeDate(-4),
    isPinned: false,
    readByCurrentUser: true,
  },
  {
    id: 'not_06',
    title: 'Call for Papers: 14th National Student Computing Symposium',
    content: 'Undergraduate and postgraduate researchers are invited to submit original research papers in Systems, Machine Learning, and Cryptography. Selected papers will be published in the IEEE Student Branch proceedings.',
    category: 'Academic',
    department: 'Research & Innovation Council',
    publishedDate: formatRelativeDate(-6),
    isPinned: false,
    attachments: [
      { name: 'CFP_Symposium_Template.docx', size: '88 KB', type: 'application/msword' },
    ],
    readByCurrentUser: true,
  },
];

export const SEED_EVENTS: CampusEvent[] = [
  {
    id: 'evt_01',
    title: 'Apex Hackathon 2026: 36-Hour Campus Sprint',
    description: 'The flagship annual hackathon of Apex Institute of Technology. Build high-impact solutions across AI, Web3, CleanTech, and Campus Automation. Mentors from top tech firms will be present onsite throughout the night.',
    category: 'Tech',
    date: formatRelativeDate(2),
    startTime: '10:00',
    endTime: '18:00',
    venue: 'Main Auditorium & Innovation Lab',
    organizer: 'AIT Coding Club & ACM Student Chapter',
    capacity: 150,
    registeredCount: 142,
    isRegistered: true, // Aarav is registered!
    registrationId: 'reg_demo_01',
  },
  {
    id: 'evt_02',
    title: 'Hands-on Workshop: High-Performance Linux Kernel Tracing',
    description: 'Deep dive into eBPF, perf, and ftrace tools with senior Linux systems engineers. Bring your laptops with Ubuntu 22.04 LTS or Fedora installed.',
    category: 'Workshops',
    // Date intentionally scheduled on day 4 at 14:00 - 16:00 to trigger class clash with Thursday 14:00 Networks Lab!
    date: formatRelativeDate(4),
    startTime: '14:00',
    endTime: '16:00',
    venue: 'Seminar Hall 2, Dept of CSE',
    organizer: 'FOSS Club AIT',
    capacity: 60,
    registeredCount: 38,
    isRegistered: false,
  },
  {
    id: 'evt_03',
    title: 'Tarang 2026: Inter-Department Battle of the Bands',
    description: 'An evening of live original music and rock covers by student bands representing different engineering disciplines. Food stalls and open acoustic jam from 5:00 PM.',
    category: 'Cultural',
    date: formatRelativeDate(6),
    startTime: '17:30',
    endTime: '21:30',
    venue: 'Open Air Amphitheatre',
    organizer: 'Cultural Council (AIT)',
    capacity: 500,
    registeredCount: 500, // FULL EVENT! Demonstrates full capacity state
    isRegistered: false,
  },
  {
    id: 'evt_04',
    title: 'Inter-Collegiate Badminton Championship: Quarter-Finals',
    description: 'Cheer for the AIT Badminton Varsity team as they take on National College in Men\'s and Women\'s singles and doubles matches.',
    category: 'Sports',
    date: formatRelativeDate(1),
    startTime: '16:30',
    endTime: '19:00',
    venue: 'Indoor Sports Complex, Court 1 & 2',
    organizer: 'Department of Physical Education',
    capacity: 120,
    registeredCount: 65,
    isRegistered: false,
  },
  {
    id: 'evt_05',
    title: 'Robotics Club Showcase: Autonomous Quadcopter Demo',
    description: 'Live field demonstrations of student-built autonomous obstacle-avoidance drones and ground rovers using ROS2 and LiDAR sensors.',
    category: 'Clubs',
    date: formatRelativeDate(5),
    startTime: '15:00',
    endTime: '17:00',
    venue: 'Robotics Workshop Ground, Mech Block',
    organizer: 'Robotics Club (AIT)',
    capacity: 80,
    registeredCount: 52,
    isRegistered: false,
  },
];

export const SEED_LOST_FOUND: LostFoundItem[] = [
  {
    id: 'lf_01',
    type: 'lost',
    title: 'Logitech MX Master 3S Mouse (Space Gray)',
    category: 'Electronics',
    description: 'Left behind on the desk near the window in CS Lab 3 during yesterday afternoon\'s lab session. Has a tiny white circular sticker on the underside.',
    location: 'CS Lab 3 (Window side desk 14)',
    date: formatRelativeDate(-1),
    status: 'open',
    reportedBy: {
      name: 'Aarav Sharma', // Posted by current user! Can mark resolved.
      isCurrentUser: true,
    },
    contactRequestsCount: 2,
    imageIcon: 'mouse',
  },
  {
    id: 'lf_02',
    type: 'found',
    title: 'Scientific Calculator Casio fx-991EX ClassWiz',
    category: 'Electronics',
    description: 'Found on the third row bench after the CS304 algorithms lecture. Engraved with initials "RK" on the sliding cover.',
    location: 'Lecture Hall LH-201',
    date: formatRelativeDate(-2),
    status: 'open',
    reportedBy: {
      name: 'Divya Iyer',
      isCurrentUser: false,
    },
    contactRequestsCount: 1,
    imageIcon: 'calculator',
  },
  {
    id: 'lf_03',
    type: 'found',
    title: 'Blue Campus Identity Card with Navy Lanyard',
    category: 'ID & Cards',
    description: 'Student ID card belonging to Rohan Sen (Roll: 23EC088, Semester 3). Handed over to the Ground Floor Security Desk.',
    location: 'Central Library Stairs / Security Desk',
    date: formatRelativeDate(0), // Today
    status: 'open',
    reportedBy: {
      name: 'Campus Security Officer',
      isCurrentUser: false,
    },
    contactRequestsCount: 0,
    imageIcon: 'badge',
  },
  {
    id: 'lf_04',
    type: 'lost',
    title: 'Titan Fastrack Watch with Black Leather Strap',
    category: 'Personal Belongings',
    description: 'Misplaced in the Sports Complex locker room before the basketball practice on Tuesday evening.',
    location: 'Indoor Sports Complex Men\'s Locker Room',
    date: formatRelativeDate(-3),
    status: 'open',
    reportedBy: {
      name: 'Manish Kumar',
      isCurrentUser: false,
    },
    contactRequestsCount: 3,
    imageIcon: 'watch',
  },
  {
    id: 'lf_05',
    type: 'found',
    title: 'Set of 3 Keys with a Red Ferrari Keyring',
    category: 'Keys & Wallets',
    description: 'Found on the lawn near the cafeteria benches during lunchtime.',
    location: 'Student Activity Center Lawn',
    date: formatRelativeDate(-4),
    status: 'resolved', // Resolved demonstration item!
    reportedBy: {
      name: 'Pooja Nair',
      isCurrentUser: false,
    },
    contactRequestsCount: 4,
    resolvedAt: formatRelativeDate(-1),
    imageIcon: 'key',
  },
];

export const SEED_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp_01',
    title: 'Software Development Engineering Intern (Systems)',
    organization: 'Directi Media',
    type: 'Internship',
    deadline: formatRelativeDate(6), // 6 days left
    mode: 'Hybrid',
    eligibility: 'B.Tech CSE/IT, Sem 5 or 7, Proficient in C++/Go, OS & Networking concepts',
    compensation: '₹60,000 / month',
    description: 'Work alongside the distributed systems team optimizing high-throughput ad-exchange network layers and latency-critical cache proxies.',
    applyUrl: 'https://careers.directi.com/jobs/intern-systems',
    isSaved: true,
  },
  {
    id: 'opp_02',
    title: 'Smart India Hackathon (SIH 2026) - Internal Selection',
    organization: 'Ministry of Education & AIT Innovation Cell',
    type: 'Hackathon',
    deadline: formatRelativeDate(2), // 2 days left! Urgent!
    mode: 'On-site',
    eligibility: 'Teams of 6 students (minimum 1 female member), All B.Tech years eligible',
    compensation: '₹1,00,000 per Problem Statement',
    description: 'Official institute round to nominate top 35 teams for the National Grand Finale across Hardware and Software editions.',
    applyUrl: 'https://innovation.ait.edu.in/sih-2026',
    isSaved: false,
  },
  {
    id: 'opp_03',
    title: 'Full Stack Web Engineering Intern',
    organization: 'Postman Labs',
    type: 'Internship',
    deadline: formatRelativeDate(12),
    mode: 'Remote',
    eligibility: 'Open to 3rd & 4th year undergraduate engineering students. Strong React & Node skills.',
    compensation: '₹45,000 / month',
    description: 'Contribute directly to the developer experience toolchain, API client collections, and open-source specs.',
    applyUrl: 'https://postman.com/company/careers',
    isSaved: false,
  },
  {
    id: 'opp_04',
    title: 'ACM ICPC Regional Preliminary Contest 2026',
    organization: 'ACM India Council',
    type: 'Competition',
    deadline: formatRelativeDate(18),
    mode: 'Remote',
    eligibility: 'Enrolled college students in teams of 3. Standard ICPC eligibility criteria apply.',
    compensation: 'Global Finals Qualification + ₹75,000 Regionals Prize',
    description: 'The premier global competitive programming contest. Algorithmic problem solving under strict time and memory constraints.',
    applyUrl: 'https://icpc.global/regionals/finder/amritapuri-2026',
    isSaved: true,
  },
  {
    id: 'opp_05',
    title: 'Google Summer of Code (GSoC) Mentorship Track',
    organization: 'Open Source Initiative & AIT Chapter',
    type: 'Internship',
    deadline: formatRelativeDate(-4), // EXPIRED! Demonstrates muted expired styling & sorting to bottom
    mode: 'Remote',
    eligibility: 'Students 18+ with active GitHub profiles and open source PRs.',
    compensation: '$1,500 - $3,000 Stipend',
    description: 'Call for student proposal reviews for the upcoming international summer open source cohort. Application window has closed.',
    applyUrl: 'https://summerofcode.withgoogle.com',
    isSaved: false,
  },
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_01',
    title: 'Low Attendance Alert: CS301',
    message: 'Your attendance in Operating Systems is 69.4% (below required 75%). You must attend 8 upcoming classes to restore eligibility.',
    timestamp: 'Today, 09:15 AM',
    type: 'attendance',
    read: false,
    actionUrl: '/academics?tab=attendance',
  },
  {
    id: 'notif_02',
    title: 'Assignment Due Tomorrow',
    message: 'CS301: Process Synchronization and Semaphores Problem Set is due tomorrow at 11:59 PM.',
    timestamp: 'Today, 08:00 AM',
    type: 'deadline',
    read: false,
    actionUrl: '/academics?tab=assignments',
  },
  {
    id: 'notif_03',
    title: 'New Exam Circular Published',
    message: 'Mid-Semester Examination Schedule for Autumn 2026 has been published by CoE.',
    timestamp: 'Yesterday, 04:30 PM',
    type: 'notice',
    read: true,
    actionUrl: '/notices',
  },
  {
    id: 'notif_04',
    title: 'Hackathon Registration Confirmed',
    message: 'You have been registered for Apex Hackathon 2026. Reporting time is 09:30 AM at the Main Auditorium.',
    timestamp: '2 days ago',
    type: 'event',
    read: true,
    actionUrl: '/events',
  },
];
