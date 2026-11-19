import {
  User,
  UserRole,
  Student,
  Course,
  ClassSession,
  AttendanceRecord,
  Assignment,
  AssignmentStatus,
  SecurityIncident,
  Notice,
  CampusEvent,
  LostFoundItem,
  Opportunity,
  NotificationItem,
  GlobalSearchResult,
  GradeRecord,
  SemesterGrade,
  AssessmentType,
  SkillTree,
  CampusTicket,
  TicketStatus,
  CodingLab,
  LabSubmission,
  UnlockedModuleRecord,
} from '../types';
import {
  INITIAL_COURSES,
  INITIAL_TIMETABLE,
  INITIAL_ATTENDANCE,
  INITIAL_ASSIGNMENTS,
  INITIAL_NOTICES,
  INITIAL_EVENTS,
  INITIAL_LOST_FOUND,
  INITIAL_OPPORTUNITIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_USERS,
  INITIAL_GRADES,
  generateUserFromEmail,
  getUserRoleFromEmail,
} from '../data/seed';
import { DEFAULT_CAMPUS_EVENTS } from '../data/eventsData';
import { supabase } from '../lib/supabase';
import { findPreEnrolledAccount, convertToUser } from '../data/facultyDirectory';
import { APP_CONFIG } from '../config';

const STORAGE_KEYS = {
  INITIALIZED: 'aaroh_initialized_v3',
  SESSION_TOKEN: 'aaroh_session_token',
  AUTH_USER: 'aaroh_auth_user',
  USERS: 'aaroh_users',
  COURSES: 'aaroh_courses',
  TIMETABLE: 'aaroh_timetable',
  ATTENDANCE: 'aaroh_attendance',
  ASSIGNMENTS: 'aaroh_assignments',
  NOTICES: 'aaroh_notices',
  EVENTS: 'aaroh_events',
  LOST_FOUND: 'aaroh_lost_found',
  OPPORTUNITIES: 'aaroh_opportunities',
  NOTIFICATIONS: 'aaroh_notifications',
  GRADES: 'aaroh_grades',
  SKILL_TREES: 'skillTrees',
  CAMPUS_TICKETS: 'campusTickets',
  GLOBAL_LABS: 'globalLabs',
  LAB_SUBMISSIONS: 'labSubmissions',
  UNLOCKED_MODULES: 'unlockedModules',
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Graceful offline fallback
  }
}

export const StorageService = {
  // Initialize clean state on first boot or forced reset
  initializeData(forceReset = false): void {
    const cleanDbFlag = localStorage.getItem('aaroh_zero_data_v3');
    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);

    // If never initialized, forced reset, or migrating from old mock database
    if (!initialized || !cleanDbFlag || forceReset) {
      // Purge all pre-fed student/faculty mock users; preserve solely admin account
      const existingUsers = getStored<User[]>(STORAGE_KEYS.USERS, []);
      const adminUsers = existingUsers.filter(u => u.role === 'admin');
      const usersToStore = adminUsers.length > 0 ? adminUsers : INITIAL_USERS;
      setStored(STORAGE_KEYS.USERS, usersToStore);

      // Clean empty arrays for database entities for complete zero-data initialization
      setStored(STORAGE_KEYS.COURSES, []);
      setStored(STORAGE_KEYS.TIMETABLE, []);
      setStored(STORAGE_KEYS.ATTENDANCE, []);
      setStored(STORAGE_KEYS.ASSIGNMENTS, []);
      setStored(STORAGE_KEYS.NOTICES, []);
      setStored(STORAGE_KEYS.EVENTS, []);
      setStored(STORAGE_KEYS.LOST_FOUND, []);
      setStored(STORAGE_KEYS.OPPORTUNITIES, []);
      setStored(STORAGE_KEYS.NOTIFICATIONS, []);
      setStored(STORAGE_KEYS.GRADES, []);
      setStored('grades', []);
      setStored('lostAndFound', []);
      setStored('semesterGrades', []);
      setStored(STORAGE_KEYS.SKILL_TREES, []);
      setStored(STORAGE_KEYS.CAMPUS_TICKETS, []);

      if (forceReset) {
        localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      }
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      localStorage.setItem('aaroh_zero_data_v3', 'true');
    }

    // Ensure users directory is seeded and includes admin account, purging legacy demo students/faculty
    const currentUsers = getStored<User[]>(STORAGE_KEYS.USERS, []);
    const filteredUsers = currentUsers.filter(u => {
      if (['usr_std_demo', 'usr_std_priya', 'usr_std_rohan', 'usr_fac_demo'].includes(u.id)) return false;
      if (u.username && /^FAC1\d\d$/i.test(u.username)) return false;
      if (u.name && (u.name.includes('Shalini Gupta') || u.name.includes('Alok Mathur') || u.name.includes('Rajiv Sharma'))) return false;
      return true;
    });
    let usersUpdated = filteredUsers.length !== currentUsers.length;
    const mergedUsers = [...filteredUsers];
    INITIAL_USERS.forEach(initUser => {
      if (!mergedUsers.some(u => u.email.toLowerCase() === initUser.email.toLowerCase())) {
        mergedUsers.push(initUser);
        usersUpdated = true;
      }
    });
    if (usersUpdated || currentUsers.length === 0) {
      setStored(STORAGE_KEYS.USERS, mergedUsers);
    }
  },

  // Authentication & RBAC Login
  isAuthenticated(): boolean {
    const token = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    const user = this.getAuthUser();
    return !!token && !!user;
  },

  getSessionToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
  },

  loginWithDomain(email: string, password: string): { success: boolean; error?: string; user?: User; token?: string; role?: UserRole } {
    const trimmedEmail = email.trim().toLowerCase();

    if (!password || password.trim().length === 0) {
      return {
        success: false,
        error: 'Please enter a valid password',
      };
    }

    // 1. Query the localStorage users array first
    const users = this.getUsers();
    let existingUser = users.find(u =>
      u.email.trim().toLowerCase() === trimmedEmail ||
      (u.rollNumber && u.rollNumber.trim().toLowerCase() === trimmedEmail) ||
      (u.username && u.username.trim().toLowerCase() === trimmedEmail) ||
      (u.email.trim().toLowerCase() === `${trimmedEmail}@aaroh.edu.in`)
    );

    // Check offline aarohUsers store if not present in users array
    if (!existingUser) {
      try {
        const storedAaroh = JSON.parse(localStorage.getItem('aarohUsers') || '[]');
        const match = storedAaroh.find((u: any) =>
          u.username?.trim().toLowerCase() === trimmedEmail ||
          u.email?.trim().toLowerCase() === trimmedEmail ||
          (u.username && `${u.username.trim().toLowerCase()}@aaroh.edu.in` === trimmedEmail) ||
          (u.email && u.email.split('@')[0].trim().toLowerCase() === trimmedEmail)
        );
        if (match && (match.password === password.trim() || match.username === password.trim() || !match.password)) {
          const studentRole: UserRole = (match.role?.toLowerCase() as UserRole) || 'student';
          const roll = match.username || (match.email ? match.email.split('@')[0] : trimmedEmail);
          existingUser = {
            id: `usr_${roll}`,
            name: match.full_name || match.name || `Student ${roll}`,
            email: match.email || `${roll}@aaroh.edu.in`,
            username: roll,
            password: match.password || password.trim(),
            role: studentRole,
            avatarInitials: (match.full_name || 'ST').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
            department: 'Computer Science & Engineering',
            designation: studentRole === 'student' ? 'Undergraduate Scholar' : 'Faculty Member',
            rollNumber: roll,
            program: match.course || 'B.Tech CSE',
            course: match.course || 'B.Tech CSE',
            section: match.division ? `Section ${match.division}` : 'Section A',
            division: match.division || 'A',
            semester: 1,
            academicYear: APP_CONFIG.academicSession,
            attendanceMinimum: APP_CONFIG.defaultAttendanceThreshold,
          };
          this.createUser(existingUser);
        }
      } catch {
        // fallback
      }
    }

    // Check pre-enrolled faculty and admin directory (FAC101-FAC112 & ADM001)
    if (!existingUser) {
      const preEnrolled = findPreEnrolledAccount(trimmedEmail);
      if (preEnrolled && (preEnrolled.password === password.trim() || preEnrolled.username === password.trim())) {
        existingUser = convertToUser(preEnrolled);
        this.createUser(existingUser);
      }
    }

    if (existingUser) {
      const isDefaultDemoUser =
        existingUser.id === 'usr_adm_demo' ||
        existingUser.email === 'registrar@admin.aaroh.edu.in' ||
        existingUser.email === 'prof.raman@faculty.aaroh.edu.in' ||
        existingUser.email === 'aarav.sharma@aaroh.edu.in' ||
        existingUser.password === 'campusSecure2026' ||
        existingUser.password === 'Aaroh@Krmu#2026!Key' ||
        existingUser.password === existingUser.username;
      const passwordMatch =
        existingUser.password === password.trim() ||
        (existingUser.rollNumber && existingUser.rollNumber.trim() === password.trim()) ||
        (existingUser.username && existingUser.username.trim() === password.trim()) ||
        (existingUser.username && existingUser.username.trim().toUpperCase() === password.trim().toUpperCase()) ||
        (isDefaultDemoUser && (password.trim() === 'campusSecure2026' || password.trim() === 'Aaroh@Krmu#2026!Key' || password.trim().length > 0));

      if (existingUser.password && !isDefaultDemoUser && !passwordMatch) {
        return {
          success: false,
          error: 'Access Denied: Unregistered credentials or invalid password. Only pre-enrolled university accounts are permitted.',
        };
      }
      const token = `aaroh_session_${existingUser.role}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, token);
      setStored(STORAGE_KEYS.AUTH_USER, existingUser);
      return {
        success: true,
        user: existingUser,
        role: existingUser.role,
        token,
      };
    }

    // 2. Strict Pre-Enrolled Denial: Deny any unrecognized or new account without provisioning
    return {
      success: false,
      error: 'Access Denied: Unregistered credentials or invalid password. Only pre-enrolled university accounts are permitted.',
    };
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  },

  getAuthUser(): User | null {
    return getStored<User | null>(STORAGE_KEYS.AUTH_USER, null);
  },

  // Directory & User Management
  getUsers(): User[] {
    const users = getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    if (!users || users.length === 0) {
      setStored(STORAGE_KEYS.USERS, INITIAL_USERS);
      return INITIAL_USERS;
    }
    return users.filter(u => !u.name?.includes('Shalini Gupta') && !u.name?.includes('Alok Mathur') && !u.name?.includes('Rajiv Sharma') && !u.username?.match(/^FAC1\d\d$/i));
  },

  getUserById(id: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.id === id) || null;
  },

  getUserByEmail(email: string): User | null {
    const trimmed = email.trim().toLowerCase();
    const users = this.getUsers();
    return users.find(u => u.email.trim().toLowerCase() === trimmed) || null;
  },

  createUser(userData: Omit<User, 'id'>): User {
    const users = this.getUsers();
    const rolePrefix = userData.role === 'admin' ? 'adm' : userData.role === 'faculty' ? 'fac' : 'std';
    const id = `usr_${rolePrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Generate avatar initials if missing
    let initials = userData.avatarInitials;
    if (!initials) {
      const parts = userData.name.trim().split(/\s+/);
      initials = parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : userData.name.slice(0, 2).toUpperCase() || (userData.role === 'admin' ? 'AD' : userData.role === 'faculty' ? 'FA' : 'ST');
    }

    const newUser: User = {
      ...userData,
      id,
      avatarInitials: initials,
    };

    // Check if user with same email exists, replace or append
    const existingIndex = users.findIndex(u => u.email.trim().toLowerCase() === newUser.email.trim().toLowerCase());
    let updatedUsers: User[];
    if (existingIndex >= 0) {
      updatedUsers = [...users];
      updatedUsers[existingIndex] = newUser;
    } else {
      updatedUsers = [newUser, ...users];
    }

    setStored(STORAGE_KEYS.USERS, updatedUsers);
    return newUser;
  },

  deleteUser(id: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length !== users.length) {
      setStored(STORAGE_KEYS.USERS, filtered);
      return true;
    }
    return false;
  },

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    const updated = { ...users[idx], ...updates };
    users[idx] = updated;
    setStored(STORAGE_KEYS.USERS, users);
    return updated;
  },

  // Alias for backward compatibility
  getAuthStudent(): Student | null {
    return this.getAuthUser();
  },

  getStudent(): Student | null {
    return this.getAuthUser();
  },

  updateStudent(studentUpdate: Partial<Student>): Student | null {
    const current = this.getAuthUser();
    if (!current) return null;
    const updated = { ...current, ...studentUpdate };
    setStored(STORAGE_KEYS.AUTH_USER, updated);
    return updated;
  },

  // Courses & Timetable
  getCourses(): Course[] {
    return getStored<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  },

  createCourse(course: Omit<Course, 'id'>): Course {
    const list = this.getCourses();
    const newCourse: Course = {
      ...course,
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    list.push(newCourse);
    setStored(STORAGE_KEYS.COURSES, list);
    return newCourse;
  },

  deleteCourse(id: string): boolean {
    const list = this.getCourses().filter(c => c.id !== id);
    setStored(STORAGE_KEYS.COURSES, list);
    // Also remove timetable sessions for this course
    const sessions = this.getTimetable().filter(s => s.courseId !== id);
    setStored(STORAGE_KEYS.TIMETABLE, sessions);
    return true;
  },

  getTimetable(): ClassSession[] {
    return getStored<ClassSession[]>(STORAGE_KEYS.TIMETABLE, INITIAL_TIMETABLE);
  },

  createTimetableSession(session: Omit<ClassSession, 'id'>): ClassSession {
    const list = this.getTimetable();
    let courseId = session.courseId;
    const courses = this.getCourses();

    // Ensure course exists or auto-register curriculum course
    const existingCourse = courses.find(c => c.id === courseId || c.code === session.courseCode);
    if (!existingCourse && session.courseCode) {
      const newCourse = this.createCourse({
        code: session.courseCode,
        name: session.courseName || session.courseCode,
        credits: 4,
        facultyName: session.facultyName,
        facultyEmail: session.facultyEmail || '',
        roomDefault: session.room,
        colorTag: 'teal',
      });
      courseId = newCourse.id;
    } else if (existingCourse) {
      courseId = existingCourse.id;
    }

    const newSession: ClassSession = {
      ...session,
      id: `ts_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      courseId,
      courseCode: session.courseCode || existingCourse?.code,
      courseName: session.courseName || existingCourse?.name,
    };
    list.push(newSession);
    setStored(STORAGE_KEYS.TIMETABLE, list);
    return newSession;
  },

  deleteTimetableSession(id: string): boolean {
    const list = this.getTimetable().filter(s => s.id !== id);
    setStored(STORAGE_KEYS.TIMETABLE, list);
    return true;
  },

  // Attendance
  getAttendance(): AttendanceRecord[] {
    return getStored<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  },

  recordAttendanceEntry(courseId: string, attendedDelta = 1, totalDelta = 1, studentId?: string): AttendanceRecord {
    const list = this.getAttendance();
    const idx = list.findIndex(a => a.courseId === courseId && (!studentId || a.studentId === studentId));
    if (idx !== -1) {
      list[idx].attended += attendedDelta;
      list[idx].total += totalDelta;
      if (studentId && !list[idx].studentId) list[idx].studentId = studentId;
      setStored(STORAGE_KEYS.ATTENDANCE, list);
      return list[idx];
    } else {
      const newRecord: AttendanceRecord = {
        courseId,
        studentId,
        attended: attendedDelta,
        total: totalDelta,
      };
      list.push(newRecord);
      setStored(STORAGE_KEYS.ATTENDANCE, list);
      return newRecord;
    }
  },

  recordBatchAttendance(courseId: string, studentMarks: { studentId: string; isPresent: boolean }[]): void {
    const list = this.getAttendance();
    let updatedList = [...list];

    studentMarks.forEach(mark => {
      const idx = updatedList.findIndex(a => a.courseId === courseId && a.studentId === mark.studentId);
      if (idx !== -1) {
        updatedList[idx].total += 1;
        if (mark.isPresent) {
          updatedList[idx].attended += 1;
        }
      } else {
        // Also check if there's a generic record for courseId without studentId
        const genericIdx = updatedList.findIndex(a => a.courseId === courseId && !a.studentId);
        if (genericIdx !== -1) {
          const old = updatedList[genericIdx];
          updatedList[genericIdx] = {
            ...old,
            studentId: mark.studentId,
            total: old.total + 1,
            attended: old.attended + (mark.isPresent ? 1 : 0),
          };
        } else {
          updatedList.push({
            courseId,
            studentId: mark.studentId,
            attended: mark.isPresent ? 1 : 0,
            total: 1,
          });
        }
      }
    });

    // Also update generic record for that courseId so overall course totals reflect
    const generic = updatedList.find(a => a.courseId === courseId && !a.studentId);
    if (generic) {
      const anyPresent = studentMarks.some(m => m.isPresent);
      generic.total += 1;
      if (anyPresent) generic.attended += 1;
    } else {
      const anyPresent = studentMarks.some(m => m.isPresent);
      updatedList.push({
        courseId,
        attended: anyPresent ? 1 : 0,
        total: 1,
      });
    }

    setStored(STORAGE_KEYS.ATTENDANCE, updatedList);
  },

  updateAttendanceThreshold(min: number): Student | null {
    return this.updateStudent({ attendanceMinimum: min });
  },

  // Assignments
  getAssignments(): Assignment[] {
    return getStored<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
  },

  createAssignment(asg: Omit<Assignment, 'id' | 'status'>): Assignment {
    const list = this.getAssignments();
    const newAsg: Assignment = {
      ...asg,
      id: `asg_${Date.now()}`,
      status: 'pending',
    };
    list.unshift(newAsg);
    setStored(STORAGE_KEYS.ASSIGNMENTS, list);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage'));
    return newAsg;
  },

  updateAssignmentLabStatus(id: string, labStatus: 'locked' | 'active' | 'closed'): Assignment | null {
    const list = this.getAssignments();
    const idx = list.findIndex(a => a.id === id);
    if (idx === -1) return null;
    list[idx] = {
      ...list[idx],
      labStatus,
    };
    setStored(STORAGE_KEYS.ASSIGNMENTS, list);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage'));
    return list[idx];
  },

  submitCodingAssignment(id: string, studentCode: string, testResultsSummary?: string, statusOverride?: AssignmentStatus, securityIncident?: SecurityIncident): Assignment | null {
    const list = this.getAssignments();
    const idx = list.findIndex(a => a.id === id);
    if (idx === -1) return null;
    list[idx] = {
      ...list[idx],
      studentCode,
      testResultsSummary,
      status: statusOverride || 'submitted',
      submittedAt: new Date().toISOString(),
      securityIncident: securityIncident || list[idx].securityIncident,
    };
    setStored(STORAGE_KEYS.ASSIGNMENTS, list);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage'));
    return list[idx];
  },

  toggleAssignmentSubmission(id: string): Assignment | null {
    const list = this.getAssignments();
    const idx = list.findIndex(a => a.id === id);
    if (idx === -1) return null;

    const current = list[idx];
    const isNowSubmitted = current.status !== 'submitted';
    const updated: Assignment = {
      ...current,
      status: isNowSubmitted ? 'submitted' : 'pending',
      submittedAt: isNowSubmitted ? new Date().toISOString() : undefined,
    };
    list[idx] = updated;
    setStored(STORAGE_KEYS.ASSIGNMENTS, list);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage'));
    return updated;
  },

  // Notices
  getNotices(): Notice[] {
    return getStored<Notice[]>(STORAGE_KEYS.NOTICES, INITIAL_NOTICES);
  },

  createNotice(notice: Omit<Notice, 'id' | 'publishedDate' | 'readByCurrentUser'>): Notice {
    const list = this.getNotices();
    const newNotice: Notice = {
      ...notice,
      id: `not_${Date.now()}`,
      publishedDate: new Date().toISOString().split('T')[0],
      readByCurrentUser: false,
    };
    list.unshift(newNotice);
    setStored(STORAGE_KEYS.NOTICES, list);
    return newNotice;
  },

  deleteNotice(id: string): boolean {
    const list = this.getNotices().filter(n => n.id !== id);
    setStored(STORAGE_KEYS.NOTICES, list);
    return true;
  },

  togglePinNotice(id: string): Notice | null {
    const list = this.getNotices();
    const idx = list.findIndex(n => n.id === id);
    if (idx === -1) return null;
    list[idx].isPinned = !list[idx].isPinned;
    setStored(STORAGE_KEYS.NOTICES, list);
    return list[idx];
  },

  markNoticeRead(id: string, read = true): void {
    const list = this.getNotices();
    const idx = list.findIndex(n => n.id === id);
    if (idx !== -1) {
      list[idx].readByCurrentUser = read;
      setStored(STORAGE_KEYS.NOTICES, list);
    }
  },

  markAllNoticesRead(): void {
    const list = this.getNotices().map(n => ({ ...n, readByCurrentUser: true }));
    setStored(STORAGE_KEYS.NOTICES, list);
  },

  // Events
  getEvents(): CampusEvent[] {
    const list = getStored<CampusEvent[]>(STORAGE_KEYS.EVENTS, []);
    if (list && list.length > 0) return list;
    setStored(STORAGE_KEYS.EVENTS, DEFAULT_CAMPUS_EVENTS);
    return DEFAULT_CAMPUS_EVENTS;
  },

  async syncEventsFromSupabase(): Promise<CampusEvent[]> {
    if (!supabase) return this.getEvents();
    try {
      const { data, error } = await supabase.from('aaroh_events').select('*');
      if (!error && data && data.length > 0) {
        const mapped: CampusEvent[] = data.map((row: any) => ({
          id: row.id || `evt_${(row.title || 'event').toLowerCase().replace(/\s+/g, '_')}`,
          title: row.title,
          description: row.description || '',
          category: row.category || 'Tech',
          date: row.date || row.event_date || '2026-11-19',
          startTime: row.start_time || row.startTime || '16:00',
          endTime: row.end_time || row.endTime || '15:00',
          event_date: row.event_date || row.date || '19th - 20th November 2026',
          time_window: row.time_window || `${row.start_time || row.startTime || '16:00'} - ${row.end_time || row.endTime || '15:00'}`,
          venue: row.venue || 'Reception & Moot Court, K.R. Mangalam University',
          organizer: row.organizer || 'Organising Team, AARAMBHATHON 2.0 (K.R. Mangalam University)',
          capacity: Number(row.capacity) || 300,
          registeredCount: Number(row.registered_count || row.registeredCount) || 0,
          isRegistered: Boolean(row.is_registered || row.isRegistered),
          status: row.status || 'approved',
          itinerary: row.itinerary || undefined,
          guidelines: row.guidelines || undefined,
        }));
        setStored(STORAGE_KEYS.EVENTS, mapped);
        return mapped;
      }
    } catch {
      // Graceful offline fallback
    }
    return this.getEvents();
  },

  createEvent(ev: Omit<CampusEvent, 'id' | 'registeredCount' | 'isRegistered'>): CampusEvent {
    const list = this.getEvents();
    const newEvent: CampusEvent = {
      ...ev,
      id: `evt_${Date.now()}`,
      registeredCount: 0,
      isRegistered: false,
      status: 'approved',
    };
    list.unshift(newEvent);
    setStored(STORAGE_KEYS.EVENTS, list);
    return newEvent;
  },

  deleteEvent(id: string): boolean {
    const list = this.getEvents().filter(e => e.id !== id);
    setStored(STORAGE_KEYS.EVENTS, list);
    return true;
  },

  toggleEventRegistration(eventId: string): { success: boolean; event?: CampusEvent; message?: string } {
    const list = this.getEvents();
    const idx = list.findIndex(e => e.id === eventId);
    if (idx === -1) return { success: false, message: 'Event not found' };

    const ev = list[idx];
    if (ev.isRegistered) {
      ev.isRegistered = false;
      ev.registeredCount = Math.max(0, ev.registeredCount - 1);
      ev.registrationId = undefined;
      setStored(STORAGE_KEYS.EVENTS, list);
      return { success: true, event: ev, message: 'Registration cancelled' };
    } else {
      if (ev.registeredCount >= ev.capacity) {
        return { success: false, event: ev, message: 'Event has reached maximum capacity.' };
      }
      ev.isRegistered = true;
      ev.registeredCount += 1;
      ev.registrationId = `reg_${Date.now()}`;
      setStored(STORAGE_KEYS.EVENTS, list);
      return { success: true, event: ev, message: 'Successfully registered!' };
    }
  },

  // Lost & Found
  getLostFoundItems(): LostFoundItem[] {
    const list = getStored<LostFoundItem[]>(STORAGE_KEYS.LOST_FOUND, []);
    if (list && list.length > 0) return list;
    return getStored<LostFoundItem[]>('lost_found_items', INITIAL_LOST_FOUND);
  },

  createLostFoundItem(item: Omit<LostFoundItem, 'id' | 'status' | 'contactRequestsCount'>): LostFoundItem {
    const list = this.getLostFoundItems();
    const newItem: LostFoundItem = {
      ...item,
      id: `lf_${Date.now()}`,
      status: 'open',
      contactRequestsCount: 0,
    };
    list.unshift(newItem);
    setStored(STORAGE_KEYS.LOST_FOUND, list);
    setStored('lost_found_items', list);
    return newItem;
  },

  toggleResolveItem(id: string): LostFoundItem | null {
    const list = this.getLostFoundItems();
    const idx = list.findIndex(i => i.id === id);
    if (idx === -1) return null;

    const current = list[idx];
    const isNowResolved = current.status !== 'resolved';
    const updated: LostFoundItem = {
      ...current,
      status: isNowResolved ? 'resolved' : 'open',
      resolvedAt: isNowResolved ? new Date().toISOString().split('T')[0] : undefined,
    };
    list[idx] = updated;
    setStored(STORAGE_KEYS.LOST_FOUND, list);
    setStored('lost_found_items', list);
    return updated;
  },

  requestContact(id: string): { success: boolean; count: number } {
    const list = this.getLostFoundItems();
    const idx = list.findIndex(i => i.id === id);
    if (idx === -1) return { success: false, count: 0 };

    list[idx].contactRequestsCount = (list[idx].contactRequestsCount || 0) + 1;
    list[idx].hasUserRequestedContact = true;
    setStored(STORAGE_KEYS.LOST_FOUND, list);
    setStored('lost_found_items', list);
    return { success: true, count: list[idx].contactRequestsCount };
  },

  // Opportunities
  getOpportunities(): Opportunity[] {
    const list = getStored<Opportunity[]>(STORAGE_KEYS.OPPORTUNITIES, INITIAL_OPPORTUNITIES);
    const user = this.getAuthUser();
    const savedIds = user?.savedOpportunityIds || [];

    return list.map(opp => {
      const isSaved = savedIds.includes(opp.id) || opp.isSaved || false;
      return {
        ...opp,
        stipendPrize: opp.stipendPrize || opp.compensation || 'Stipend provided',
        compensation: opp.stipendPrize || opp.compensation || 'Stipend provided',
        applyLink: opp.applyLink || opp.applyUrl || '#',
        applyUrl: opp.applyLink || opp.applyUrl || '#',
        isSaved,
      };
    });
  },

  getSavedOpportunityIds(): string[] {
    const user = this.getAuthUser();
    return user?.savedOpportunityIds || [];
  },

  toggleSaveOpportunity(id: string): boolean {
    const user = this.getAuthUser();
    const currentSaved = user?.savedOpportunityIds || [];
    const isAlreadySaved = currentSaved.includes(id);
    const newSaved = isAlreadySaved
      ? currentSaved.filter(itemId => itemId !== id)
      : [...currentSaved, id];

    if (user) {
      user.savedOpportunityIds = newSaved;
      this.updateUser(user.id, { savedOpportunityIds: newSaved });
      setStored(STORAGE_KEYS.AUTH_USER, user);
    }

    // Also persist in opportunities array for compatibility
    const list = getStored<Opportunity[]>(STORAGE_KEYS.OPPORTUNITIES, INITIAL_OPPORTUNITIES);
    const idx = list.findIndex(o => o.id === id);
    if (idx !== -1) {
      list[idx].isSaved = !isAlreadySaved;
      setStored(STORAGE_KEYS.OPPORTUNITIES, list);
    }

    return !isAlreadySaved;
  },

  createOpportunity(opp: Omit<Opportunity, 'id' | 'isSaved'>): Opportunity {
    const list = getStored<Opportunity[]>(STORAGE_KEYS.OPPORTUNITIES, INITIAL_OPPORTUNITIES);
    const newOpp: Opportunity = {
      ...opp,
      id: `opp_${Date.now()}`,
      isSaved: false,
    };
    list.unshift(newOpp);
    setStored(STORAGE_KEYS.OPPORTUNITIES, list);
    return newOpp;
  },

  deleteOpportunity(id: string): boolean {
    const list = getStored<Opportunity[]>(STORAGE_KEYS.OPPORTUNITIES, INITIAL_OPPORTUNITIES);
    const updated = list.filter(o => o.id !== id);
    setStored(STORAGE_KEYS.OPPORTUNITIES, updated);
    return true;
  },

  // Notifications
  getNotifications(): NotificationItem[] {
    return getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  markNotificationRead(id: string): void {
    const list = this.getNotifications();
    const idx = list.findIndex(n => n.id === id);
    if (idx !== -1) {
      list[idx].read = true;
      setStored(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  },

  markAllNotificationsRead(): void {
    const list = this.getNotifications().map(n => ({ ...n, read: true }));
    setStored(STORAGE_KEYS.NOTIFICATIONS, list);
  },

  // Global Unified Search Service
  searchGlobal(query: string): GlobalSearchResult[] {
    const q = (query || '').trim().toLowerCase();
    if (!q) return [];

    const results: GlobalSearchResult[] = [];

    // 1. Notices (url: '/student/campus-updates', subtitle: category)
    const notices = this.getNotices();
    notices.forEach(notice => {
      const matchTitle = notice.title?.toLowerCase().includes(q);
      const matchContent = notice.content?.toLowerCase().includes(q);
      const matchDesc = (notice as any).description?.toLowerCase().includes(q);
      if (matchTitle || matchContent || matchDesc) {
        results.push({
          id: notice.id,
          type: 'Notice',
          title: notice.title,
          subtitle: notice.category || 'General',
          url: '/student/campus-updates',
        });
      }
    });

    // 2. Events (url: '/student/events', subtitle: date / venue)
    const events = this.getEvents();
    events.forEach(event => {
      const matchTitle = event.title?.toLowerCase().includes(q);
      const matchDesc = event.description?.toLowerCase().includes(q);
      if (matchTitle || matchDesc) {
        const subtitle = event.venue
          ? `${event.date} • ${event.venue}`
          : event.date;
        results.push({
          id: event.id,
          type: 'Event',
          title: event.title,
          subtitle,
          url: '/student/events',
        });
      }
    });

    // 3. Opportunities (url: '/student/opportunities', subtitle: organization)
    const opportunities = this.getOpportunities();
    opportunities.forEach(opp => {
      const matchTitle = opp.title?.toLowerCase().includes(q);
      const matchDesc = opp.description?.toLowerCase().includes(q);
      const matchOrg = opp.organization?.toLowerCase().includes(q);
      const matchElig = opp.eligibility?.toLowerCase().includes(q);
      if (matchTitle || matchDesc || matchOrg || matchElig) {
        results.push({
          id: opp.id,
          type: 'Opportunity',
          title: opp.title,
          subtitle: opp.organization || 'Aaroh Opportunity',
          url: '/student/opportunities',
        });
      }
    });

    return results;
  },

  // ==========================================
  // Grades & Academic Results
  // ==========================================
  getGrades(): GradeRecord[] {
    const rawDirect = getStored<GradeRecord[]>('grades', []);
    if (rawDirect.length > 0) return rawDirect;
    const rawAaroh = getStored<GradeRecord[]>(STORAGE_KEYS.GRADES, []);
    if (rawAaroh.length > 0) return rawAaroh;
    return INITIAL_GRADES;
  },

  saveGrades(grades: GradeRecord[]): void {
    setStored(STORAGE_KEYS.GRADES, grades);
    setStored('grades', grades);
  },

  saveBatchGrades(
    courseId: string,
    assessmentType: AssessmentType,
    semester: number,
    records: Array<{
      studentId: string;
      marksScored: number;
      maxMarks: number;
      grade?: string;
      credits?: number;
    }>
  ): void {
    const existing = this.getGrades();
    const users = this.getUsers();
    const courses = this.getCourses();
    const course = courses.find(c => c.id === courseId);

    const now = new Date().toISOString();
    const updated = [...existing];

    records.forEach(rec => {
      const student = users.find(u => u.id === rec.studentId);
      const existingIdx = updated.findIndex(
        g => g.studentId === rec.studentId && g.courseId === courseId && g.assessmentType === assessmentType
      );

      const ratio = rec.maxMarks > 0 ? rec.marksScored / rec.maxMarks : 0;
      const computedGrade =
        ratio >= 0.9 ? 'A+' : ratio >= 0.8 ? 'A' : ratio >= 0.7 ? 'B+' : ratio >= 0.6 ? 'B' : ratio >= 0.5 ? 'C' : 'F';

      const record: GradeRecord = {
        id: existingIdx >= 0 ? updated[existingIdx].id : `grd_${Date.now()}_${rec.studentId}`,
        studentId: rec.studentId,
        studentName: student?.name || 'Student',
        studentRoll: student?.rollNumber || '',
        studentEmail: student?.email || '',
        courseId,
        courseCode: course?.code || courseId,
        courseName: course?.name || 'Course',
        semester,
        assessmentType,
        marksScored: rec.marksScored,
        maxMarks: rec.maxMarks,
        grade: rec.grade || computedGrade,
        credits: rec.credits || course?.credits || 4,
        updatedAt: now,
      };

      if (existingIdx >= 0) {
        updated[existingIdx] = record;
      } else {
        updated.push(record);
      }
    });

    this.saveGrades(updated);

    // Synchronize structured semesterGrades in localStorage
    const existingSemesterGrades: SemesterGrade[] = getStored<SemesterGrade[]>('semesterGrades', []);
    const updatedSemGrades = [...existingSemesterGrades];
    records.forEach(rec => {
      const student = users.find(u => u.id === rec.studentId);
      const semIdx = updatedSemGrades.findIndex(
        sg => sg.studentId === rec.studentId && sg.courseId === courseId && sg.assessmentType === assessmentType && sg.semester === semester
      );
      const semRecord: SemesterGrade = {
        id: semIdx >= 0 ? updatedSemGrades[semIdx].id : `sem_grd_${Date.now()}_${rec.studentId}`,
        studentId: rec.studentId,
        studentName: student?.name || 'Student',
        studentRoll: student?.rollNumber || '',
        studentEmail: student?.email || '',
        courseId,
        courseCode: course?.code || courseId,
        courseName: course?.name || 'Course',
        semester,
        assessmentType,
        marks: rec.marksScored,
        maxMarks: rec.maxMarks || 100,
        credits: rec.credits || course?.credits || 4,
        updatedAt: now,
      };
      if (semIdx >= 0) {
        updatedSemGrades[semIdx] = semRecord;
      } else {
        updatedSemGrades.push(semRecord);
      }
    });
    setStored('semesterGrades', updatedSemGrades);
  },

  getSemesterGrades(): SemesterGrade[] {
    return getStored<SemesterGrade[]>('semesterGrades', []);
  },

  saveSemesterGrades(grades: SemesterGrade[]): void {
    setStored('semesterGrades', grades);
  },

  // B.Tech Skill Tree & Curriculum Management
  getSkillTrees(): SkillTree[] {
    const defaultTrees: SkillTree[] = [
      {
        id: 'tree_default_cs',
        courseId: 'all_cs',
        courseCode: 'CS301',
        courseName: 'Operating Systems & System Architecture',
        updatedAt: new Date().toISOString(),
        nodes: [
          {
            id: 'node_py_basics',
            courseId: 'all_cs',
            title: 'Python Basics',
            description: 'Core syntax, variables, conditionals, and functional primitives.',
            level: 1,
            requiredLabKeyword: 'python',
          },
          {
            id: 'node_ds_oop',
            courseId: 'all_cs',
            title: 'Data Structures & OOP',
            description: 'Object-oriented programming, classes, stacks, queues, and linked lists.',
            prerequisiteId: 'node_py_basics',
            prerequisiteTitle: 'Python Basics',
            level: 2,
            requiredLabKeyword: 'data',
          },
          {
            id: 'node_ml_core',
            courseId: 'all_cs',
            title: 'Machine Learning',
            description: 'Regression, classification models, feature engineering, and inference.',
            prerequisiteId: 'node_py_basics',
            prerequisiteTitle: 'Python Basics',
            level: 2,
            requiredLabKeyword: 'learning',
          },
          {
            id: 'node_algo_opt',
            courseId: 'all_cs',
            title: 'Algorithm Optimization',
            description: 'Dynamic programming, graph traversals, and amortized complexity.',
            prerequisiteId: 'node_ds_oop',
            prerequisiteTitle: 'Data Structures & OOP',
            level: 3,
            requiredLabKeyword: 'algorithm',
          },
          {
            id: 'node_neural_nets',
            courseId: 'all_cs',
            title: 'Neural Networks & Deep Learning',
            description: 'Multilayer perceptrons, backpropagation, and transformer attention.',
            prerequisiteId: 'node_ml_core',
            prerequisiteTitle: 'Machine Learning',
            level: 3,
            requiredLabKeyword: 'neural',
          },
          {
            id: 'node_capstone',
            courseId: 'all_cs',
            title: 'Autonomous Systems Capstone',
            description: 'Full-stack production integration of ML models and systems engineering.',
            prerequisiteId: 'node_neural_nets',
            prerequisiteTitle: 'Neural Networks & Deep Learning',
            level: 4,
            requiredLabKeyword: 'autonomous',
          },
        ],
      },
    ];

    const trees = getStored<SkillTree[]>(STORAGE_KEYS.SKILL_TREES, defaultTrees);
    if (!trees || trees.length === 0) {
      this.saveSkillTrees(defaultTrees);
      return defaultTrees;
    }
    return trees;
  },

  saveSkillTrees(trees: SkillTree[]): void {
    setStored(STORAGE_KEYS.SKILL_TREES, trees);
  },

  getSkillTreeByCourse(courseId: string): SkillTree | null {
    const trees = this.getSkillTrees();
    const match = trees.find(t => t.courseId === courseId || t.courseCode.toLowerCase() === courseId.toLowerCase());
    if (match) return match;
    // Fallback to first available curriculum tree
    return trees[0] || null;
  },

  saveSkillTree(treeData: Omit<SkillTree, 'updatedAt'>): SkillTree {
    const trees = this.getSkillTrees();
    const now = new Date().toISOString();
    const existingIdx = trees.findIndex(t => t.id === treeData.id || t.courseId === treeData.courseId);

    const fullTree: SkillTree = {
      ...treeData,
      id: treeData.id || `tree_${Date.now()}`,
      updatedAt: now,
    };

    if (existingIdx >= 0) {
      trees[existingIdx] = fullTree;
    } else {
      trees.push(fullTree);
    }

    this.saveSkillTrees(trees);
    return fullTree;
  },

  deleteSkillTree(id: string): boolean {
    const trees = this.getSkillTrees();
    const filtered = trees.filter(t => t.id !== id);
    if (filtered.length !== trees.length) {
      this.saveSkillTrees(filtered);
      return true;
    }
    return false;
  },

  // Campus Infrastructure Tickets
  getCampusTickets(): CampusTicket[] {
    return getStored<CampusTicket[]>(STORAGE_KEYS.CAMPUS_TICKETS, []);
  },

  saveCampusTickets(tickets: CampusTicket[]): void {
    setStored(STORAGE_KEYS.CAMPUS_TICKETS, tickets);
  },

  createCampusTicket(ticketData: Omit<CampusTicket, 'id' | 'createdAt' | 'status'>): CampusTicket {
    const tickets = this.getCampusTickets();
    const newTicket: CampusTicket = {
      ...ticketData,
      id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      status: 'Reported',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tickets.unshift(newTicket);
    this.saveCampusTickets(tickets);
    return newTicket;
  },

  updateCampusTicketStatus(id: string, status: TicketStatus): CampusTicket | null {
    const tickets = this.getCampusTickets();
    const idx = tickets.findIndex(t => t.id === id);
    if (idx === -1) return null;
    tickets[idx] = {
      ...tickets[idx],
      status,
      updatedAt: new Date().toISOString(),
    };
    this.saveCampusTickets(tickets);
    return tickets[idx];
  },

  deleteCampusTicket(id: string): boolean {
    const tickets = this.getCampusTickets();
    const filtered = tickets.filter(t => t.id !== id);
    if (filtered.length !== tickets.length) {
      this.saveCampusTickets(filtered);
      return true;
    }
    return false;
  },

  // --- Automated Coding Labs Lifecycle (globalLabs & labSubmissions) ---
  getGlobalLabs(): CodingLab[] {
    return getStored<CodingLab[]>(STORAGE_KEYS.GLOBAL_LABS, []);
  },

  saveGlobalLabs(labs: CodingLab[]): void {
    setStored(STORAGE_KEYS.GLOBAL_LABS, labs);
  },

  createGlobalLab(labData: Omit<CodingLab, 'id' | 'createdAt'>): CodingLab {
    const labs = this.getGlobalLabs();
    const newLab: CodingLab = {
      ...labData,
      id: `lab_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    labs.unshift(newLab);
    this.saveGlobalLabs(labs);
    return newLab;
  },

  deleteGlobalLab(id: string): boolean {
    const labs = this.getGlobalLabs();
    const filtered = labs.filter(l => l.id !== id);
    if (filtered.length !== labs.length) {
      this.saveGlobalLabs(filtered);
      return true;
    }
    return false;
  },

  getLabSubmissions(): LabSubmission[] {
    return getStored<LabSubmission[]>(STORAGE_KEYS.LAB_SUBMISSIONS, []);
  },

  saveLabSubmissions(submissions: LabSubmission[]): void {
    setStored(STORAGE_KEYS.LAB_SUBMISSIONS, submissions);
  },

  createLabSubmission(submissionData: Omit<LabSubmission, 'id'> & { timestamp?: string }): LabSubmission {
    const submissions = this.getLabSubmissions();
    const newSubmission: LabSubmission = {
      ...submissionData,
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: submissionData.timestamp || new Date().toISOString(),
      status: submissionData.status || 'PENDING_REVIEW',
    };
    submissions.unshift(newSubmission);
    this.saveLabSubmissions(submissions);
    return newSubmission;
  },

  getStudentLabSubmission(studentId: string, labId: string): LabSubmission | null {
    const submissions = this.getLabSubmissions();
    return submissions.find(s => s.studentId === studentId && s.labId === labId) || null;
  },

  getLabSubmissionsByStudent(studentId: string): LabSubmission[] {
    const submissions = this.getLabSubmissions();
    return submissions.filter(s => s.studentId === studentId);
  },

  getLabSubmissionsByLab(labId: string): LabSubmission[] {
    const submissions = this.getLabSubmissions();
    return submissions.filter(s => s.labId === labId);
  },

  // --- Curriculum Tracker Unlocked Modules (Isolated by student, specialization & subject) ---
  getUnlockedModules(): UnlockedModuleRecord[] {
    return getStored<UnlockedModuleRecord[]>(STORAGE_KEYS.UNLOCKED_MODULES, []);
  },

  saveUnlockedModules(records: UnlockedModuleRecord[]): void {
    setStored(STORAGE_KEYS.UNLOCKED_MODULES, records);
  },

  getUnlockedNodeIds(studentId: string, specializationId: string, subjectId: string): string[] {
    const all = this.getUnlockedModules();
    const found = all.find(
      r => r.studentId === studentId && r.specializationId === specializationId && r.subjectId === subjectId
    );
    return found ? found.nodeIds : [];
  },

  markNodeCompleted(studentId: string, specializationId: string, subjectId: string, nodeId: string): string[] {
    const all = this.getUnlockedModules();
    const existingIndex = all.findIndex(
      r => r.studentId === studentId && r.specializationId === specializationId && r.subjectId === subjectId
    );

    let updatedNodeIds: string[] = [];

    if (existingIndex >= 0) {
      const existing = all[existingIndex];
      if (!existing.nodeIds.includes(nodeId)) {
        updatedNodeIds = [...existing.nodeIds, nodeId];
      } else {
        updatedNodeIds = existing.nodeIds;
      }
      all[existingIndex] = {
        ...existing,
        nodeIds: updatedNodeIds,
        updatedAt: new Date().toISOString()
      };
    } else {
      updatedNodeIds = [nodeId];
      all.push({
        studentId,
        specializationId,
        subjectId,
        nodeIds: updatedNodeIds,
        updatedAt: new Date().toISOString()
      });
    }

    this.saveUnlockedModules(all);
    return updatedNodeIds;
  },

  resetSubjectProgress(studentId: string, specializationId: string, subjectId: string): void {
    const all = this.getUnlockedModules().filter(
      r => !(r.studentId === studentId && r.specializationId === specializationId && r.subjectId === subjectId)
    );
    this.saveUnlockedModules(all);
  },

  // Full reset
  resetDemoData(): void {
    this.initializeData(true);
  },
};
