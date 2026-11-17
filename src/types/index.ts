export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
  department: string;
  designation?: string; // e.g. "Assistant Professor", "Academic Registrar", "Student"
  // Student-specific fields
  rollNumber?: string;
  program?: string;
  semester?: number;
  section?: string;
  academicYear?: string;
  attendanceMinimum?: number; // default 75%
  classCoordinator?: string; // Assigned faculty mentor / coordinator
  savedOpportunityIds?: string[]; // Saved opportunities per user
}

// Student is an alias of User for full backward compatibility
export type Student = User;

export interface Course {
  id: string;
  code: string; // e.g. "CS301"
  name: string; // e.g. "Operating Systems"
  credits: number;
  facultyName: string;
  facultyEmail: string;
  roomDefault: string;
  colorTag: string; // badge accent
}

export type ClassType = 'Lecture' | 'Lab' | 'Tutorial';

export interface ClassSession {
  id: string;
  courseId: string;
  courseCode?: string;
  courseName?: string;
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6; // 1 = Monday ... 6 = Saturday
  startTime: string; // "09:00" (24h format)
  endTime: string;   // "10:30"
  room: string;
  facultyName: string;
  facultyEmail?: string;
  type: ClassType;
  program?: string;  // e.g. "B.Tech CSE"
  semester?: number; // e.g. 5
}

export interface AttendanceRecord {
  courseId: string;
  studentId?: string;
  studentEmail?: string;
  attended: number;
  total: number;
}

export type AssessmentType = 'Mid-Sem' | 'End-Sem' | 'Automated Coding Labs';

export interface SemesterGrade {
  id: string;
  studentId: string;
  studentName?: string;
  studentRoll?: string;
  studentEmail?: string;
  semester: number; // 1 to 8
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  assessmentType: AssessmentType;
  marks: number; // 0-100
  maxMarks: number; // 100
  updatedAt?: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  studentName?: string;
  studentRoll?: string;
  studentEmail?: string;
  courseId: string;
  courseCode?: string;
  courseName?: string;
  semester: number;
  assessmentType: AssessmentType;
  marksScored: number;
  maxMarks: number;
  grade?: string; // 'A+', 'A', 'B+', 'B', 'C', 'F'
  credits?: number;
  updatedAt?: string;
}

export type AssignmentStatus = 'pending' | 'submitted' | 'overdue' | 'graded' | 'failed' | 'SECURITY_BREACH';
export type AssignmentType = 'standard' | 'coding';
export type LabStatus = 'locked' | 'active' | 'closed';

export interface SecurityIncident {
  strikes: number;
  reason: string;
  trigger: 'FOCUS_LOST' | 'BIOMETRIC_ANOMALY';
  timestamp: string;
  capturedCode?: string;
  details?: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string; // ISO string or YYYY-MM-DD
  maxMarks: number;
  status: AssignmentStatus;
  submittedAt?: string;
  submissionNote?: string;
  studentId?: string;
  studentEmail?: string;
  studentName?: string;
  securityIncident?: SecurityIncident;

  // Live Lab / Coding Assignment additions
  type?: 'standard' | 'coding';
  language?: string;
  starterCode?: string;
  testCases?: TestCase[];
  labStatus?: 'locked' | 'active' | 'closed';
  studentCode?: string;
  testResultsSummary?: string;
}

export interface CodingLab {
  id: string;
  title: string;
  problemStatement: string;
  starterCode: string;
  semester: number | string;
  subject: string;
  courseId?: string;
  windowStartTime: string;
  windowEndTime: string;
  createdAt: string;
  createdByFacultyId?: string;
  createdByFacultyName?: string;
}

export interface LabSubmission {
  id: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  labId: string;
  submittedCode: string;
  timestamp: string;
  status: 'PENDING_REVIEW' | 'REVIEWED' | 'SECURITY_BREACH';
  securityIncident?: SecurityIncident;
}

export type NoticeCategory = 'Academic' | 'Exams' | 'Administration' | 'Placements' | 'General';

export interface NoticeAttachment {
  name: string;
  size: string;
  type: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  department: string;
  publishedDate: string; // YYYY-MM-DD
  isPinned: boolean;
  attachments?: NoticeAttachment[];
  readByCurrentUser: boolean;
}

export type EventCategory = 'Tech' | 'Cultural' | 'Sports' | 'Workshops' | 'Clubs';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  startTime: string; // "14:00"
  endTime: string;   // "16:00"
  venue: string;
  organizer: string;
  capacity: number;
  registeredCount: number;
  isRegistered: boolean;
  registrationId?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface Registration {
  id: string;
  eventId: string;
  studentId: string;
  registeredAt: string;
}

export type LostFoundType = 'lost' | 'found';
export type LostFoundCategory = 'Electronics' | 'ID & Cards' | 'Keys & Wallets' | 'Books & Notes' | 'Personal Belongings';
export type LostFoundStatus = 'open' | 'resolved';

export interface LostFoundItem {
  id: string;
  type: LostFoundType;
  title: string;
  category: LostFoundCategory;
  description: string;
  location: string;
  date: string; // YYYY-MM-DD
  status: LostFoundStatus;
  reportedBy: {
    id?: string;
    email?: string;
    name: string;
    studentId?: string;
    isCurrentUser: boolean;
  };
  contactRequestsCount: number;
  hasUserRequestedContact?: boolean;
  resolvedAt?: string;
  imageUrl?: string;
  imageIcon?: string;
}

export type OpportunityType = 'Internship' | 'Hackathon' | 'Competition';
export type OpportunityMode = 'Remote' | 'On-site' | 'Hybrid';

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  type: OpportunityType;
  deadline: string; // YYYY-MM-DD
  mode: OpportunityMode;
  eligibility: string;
  stipendPrize: string;
  applyLink: string;
  // Backward-compatible properties
  compensation?: string;
  applyUrl?: string;
  description?: string;
  isSaved?: boolean;
}

export type NotificationType = 'notice' | 'deadline' | 'attendance' | 'event';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: NotificationType;
  read: boolean;
  actionUrl?: string;
}

export type GlobalSearchResultType = 'Notice' | 'Event' | 'Opportunity';

export interface GlobalSearchResult {
  id: string;
  type: GlobalSearchResultType;
  title: string;
  subtitle: string;
  url: string;
}

// B.Tech Skill Tree & Gamified RPG Curriculum
export interface SkillTreeNode {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  prerequisiteId?: string;
  prerequisiteTitle?: string;
  level: number; // Tier 1, 2, 3, 4, 5
  requiredLabKeyword?: string;
  isCompleted?: boolean;
}

export interface SkillTree {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  nodes: SkillTreeNode[];
  updatedAt: string;
}

// Aaroh Smart Campus Heatmap & AI Ticketing System
export type TicketCategory = 'Plumbing' | 'IT' | 'Electrical' | 'General';
export type TicketPriority = 'Low' | 'Medium' | 'Critical';
export type TicketStatus = 'Reported' | 'In Progress' | 'Resolved';
export type CampusBuilding = 'Academic Blocks' | 'Hostels' | 'Library' | 'Canteen';

export interface CampusTicket {
  id: string;
  location: CampusBuilding | string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  summary: string; // 3-word summary
  status: TicketStatus;
  submitterRole: UserRole; // 'student' | 'faculty' | 'admin'
  submitterId?: string;
  submitterName?: string;
  createdAt: string; // ISO date string
  updatedAt?: string;
}


