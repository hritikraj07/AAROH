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

export type AssignmentStatus = 'pending' | 'submitted' | 'overdue';

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
