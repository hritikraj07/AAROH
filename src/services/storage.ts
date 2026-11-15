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
import {
  INITIAL_STUDENT,
  INITIAL_COURSES,
  INITIAL_TIMETABLE,
  INITIAL_ATTENDANCE,
  INITIAL_ASSIGNMENTS,
  INITIAL_NOTICES,
  INITIAL_EVENTS,
  INITIAL_LOST_FOUND,
  INITIAL_OPPORTUNITIES,
  INITIAL_NOTIFICATIONS,
  generateStudentFromEmail,
} from '../data/seed';

const STORAGE_KEYS = {
  INITIALIZED: 'aaroh_initialized_v2',
  SESSION_TOKEN: 'aaroh_session_token',
  AUTH_USER: 'aaroh_auth_user',
  STUDENT: 'aaroh_student',
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

// Generic localStorage reader with fallback
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

// Generic localStorage writer
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
      // Clear all legacy mock data and seed empty collections
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
        // In full reset, also clear existing auth session
        localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
        localStorage.removeItem(STORAGE_KEYS.STUDENT);
      }
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  },

  // Authentication & Domain-Restricted Auth
  isAuthenticated(): boolean {
    const token = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    const user = this.getAuthStudent();
    return !!token && !!user;
  },

  getSessionToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
  },

  loginWithDomain(email: string, password: string): { success: boolean; error?: string; student?: Student; token?: string } {
    const trimmedEmail = email.trim().toLowerCase();
    const domain = '@aaroh.edu.in';

    if (!trimmedEmail.endsWith(domain)) {
      return {
        success: false,
        error: `Access restricted: Please enter an institutional email ending with ${domain}`,
      };
    }

    if (!password || password.trim().length === 0) {
      return {
        success: false,
        error: 'Please enter a valid password',
      };
    }

    // Generate authenticated student profile from verified email
    const student = generateStudentFromEmail(trimmedEmail);
    const token = `aaroh_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, token);
    setStored(STORAGE_KEYS.AUTH_USER, student);
    setStored(STORAGE_KEYS.STUDENT, student);

    return {
      success: true,
      student,
      token,
    };
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    localStorage.removeItem(STORAGE_KEYS.STUDENT);
  },

  getAuthStudent(): Student | null {
    return getStored<Student | null>(STORAGE_KEYS.AUTH_USER, null);
  },

  getStudent(): Student | null {
    return getStored<Student | null>(STORAGE_KEYS.STUDENT, this.getAuthStudent());
  },

  updateStudent(studentUpdate: Partial<Student>): Student | null {
    const current = this.getStudent();
    if (!current) return null;
    const updated = { ...current, ...studentUpdate };
    setStored(STORAGE_KEYS.STUDENT, updated);
    setStored(STORAGE_KEYS.AUTH_USER, updated);
    return updated;
  },

  // Courses & Timetable
  getCourses(): Course[] {
    return getStored<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  },

  getTimetable(): ClassSession[] {
    return getStored<ClassSession[]>(STORAGE_KEYS.TIMETABLE, INITIAL_TIMETABLE);
  },

  // Attendance
  getAttendance(): AttendanceRecord[] {
    return getStored<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  },

  updateAttendanceThreshold(min: number): Student | null {
    return this.updateStudent({ attendanceMinimum: min });
  },

  // Assignments
  getAssignments(): Assignment[] {
    return getStored<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
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
    return getStored<LostFoundItem[]>(STORAGE_KEYS.LOST_FOUND, INITIAL_LOST_FOUND);
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
    return updated;
  },

  requestContact(id: string): { success: boolean; count: number } {
    const list = this.getLostFoundItems();
    const idx = list.findIndex(i => i.id === id);
    if (idx === -1) return { success: false, count: 0 };

    list[idx].contactRequestsCount = (list[idx].contactRequestsCount || 0) + 1;
    list[idx].hasUserRequestedContact = true;
    setStored(STORAGE_KEYS.LOST_FOUND, list);
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

  // Full reset to empty foundation
  resetDemoData(): void {
    this.initializeData(true);
  },
};
