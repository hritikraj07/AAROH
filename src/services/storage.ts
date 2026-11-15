import {
  User,
  UserRole,
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
  generateUserFromEmail,
  getUserRoleFromEmail,
} from '../data/seed';

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
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

export const StorageService = {
  // Initialize clean state on first boot or forced reset
  initializeData(forceReset = false): void {
    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!initialized || forceReset) {
      setStored(STORAGE_KEYS.USERS, INITIAL_USERS);
      setStored(STORAGE_KEYS.COURSES, INITIAL_COURSES);
      setStored(STORAGE_KEYS.TIMETABLE, INITIAL_TIMETABLE);
      setStored(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
      setStored(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
      setStored(STORAGE_KEYS.NOTICES, INITIAL_NOTICES);
      setStored(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
      setStored(STORAGE_KEYS.LOST_FOUND, INITIAL_LOST_FOUND);
      setStored(STORAGE_KEYS.OPPORTUNITIES, INITIAL_OPPORTUNITIES);
      setStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);

      if (forceReset) {
        localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      }
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }

    // Ensure users directory is seeded even if previously initialized
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      setStored(STORAGE_KEYS.USERS, INITIAL_USERS);
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
    const existingUser = users.find(u => u.email.trim().toLowerCase() === trimmedEmail);

    if (existingUser) {
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

    // 2. If not found in localStorage, verify institutional domain restriction
    const role = getUserRoleFromEmail(trimmedEmail);
    if (!role) {
      return {
        success: false,
        error: 'Account not found in directory. Institutional emails must end with @aaroh.edu.in (Student), @faculty.aaroh.edu.in (Faculty), or @admin.aaroh.edu.in (Admin).',
      };
    }

    // Auto-provision valid domain email into directory
    const newUser = generateUserFromEmail(trimmedEmail);
    this.createUser(newUser);

    const token = `aaroh_session_${role}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, token);
    setStored(STORAGE_KEYS.AUTH_USER, newUser);

    return {
      success: true,
      user: newUser,
      role: newUser.role,
      token,
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
    return users;
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
    return newAsg;
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
    return getStored<CampusEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
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
    return getStored<Opportunity[]>(STORAGE_KEYS.OPPORTUNITIES, INITIAL_OPPORTUNITIES);
  },

  toggleSaveOpportunity(id: string): boolean {
    const list = this.getOpportunities();
    const idx = list.findIndex(o => o.id === id);
    if (idx === -1) return false;

    list[idx].isSaved = !list[idx].isSaved;
    setStored(STORAGE_KEYS.OPPORTUNITIES, list);
    return list[idx].isSaved;
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

  // Full reset
  resetDemoData(): void {
    this.initializeData(true);
  },
};
