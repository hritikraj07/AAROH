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
  SEED_STUDENT,
  SEED_COURSES,
  SEED_TIMETABLE,
  SEED_ATTENDANCE,
  SEED_ASSIGNMENTS,
  SEED_NOTICES,
  SEED_EVENTS,
  SEED_LOST_FOUND,
  SEED_OPPORTUNITIES,
  SEED_NOTIFICATIONS,
} from '../data/seed';

const STORAGE_KEYS = {
  INITIALIZED: 'aaroh_initialized_v1',
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
  // Check & initialize seed data on first boot or forced reset
  initializeData(forceReset = false): void {
    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!initialized || forceReset) {
      setStored(STORAGE_KEYS.STUDENT, SEED_STUDENT);
      setStored(STORAGE_KEYS.COURSES, SEED_COURSES);
      setStored(STORAGE_KEYS.TIMETABLE, SEED_TIMETABLE);
      setStored(STORAGE_KEYS.ATTENDANCE, SEED_ATTENDANCE);
      setStored(STORAGE_KEYS.ASSIGNMENTS, SEED_ASSIGNMENTS);
      setStored(STORAGE_KEYS.NOTICES, SEED_NOTICES);
      setStored(STORAGE_KEYS.EVENTS, SEED_EVENTS);
      setStored(STORAGE_KEYS.LOST_FOUND, SEED_LOST_FOUND);
      setStored(STORAGE_KEYS.OPPORTUNITIES, SEED_OPPORTUNITIES);
      setStored(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
      // Auto-login demo student on first boot
      if (forceReset || !localStorage.getItem(STORAGE_KEYS.AUTH_USER)) {
        setStored(STORAGE_KEYS.AUTH_USER, SEED_STUDENT);
      }
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  },

  // Auth & Student
  getAuthStudent(): Student | null {
    return getStored<Student | null>(STORAGE_KEYS.AUTH_USER, SEED_STUDENT);
  },

  loginAsDemoStudent(): Student {
    setStored(STORAGE_KEYS.AUTH_USER, SEED_STUDENT);
    return SEED_STUDENT;
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  },

  getStudent(): Student {
    return getStored<Student>(STORAGE_KEYS.STUDENT, SEED_STUDENT);
  },

  updateStudent(student: Partial<Student>): Student {
    const current = this.getStudent();
    const updated = { ...current, ...student };
    setStored(STORAGE_KEYS.STUDENT, updated);
    if (this.getAuthStudent()?.id === current.id) {
      setStored(STORAGE_KEYS.AUTH_USER, updated);
    }
    return updated;
  },

  // Courses & Timetable
  getCourses(): Course[] {
    return getStored<Course[]>(STORAGE_KEYS.COURSES, SEED_COURSES);
  },

  getTimetable(): ClassSession[] {
    return getStored<ClassSession[]>(STORAGE_KEYS.TIMETABLE, SEED_TIMETABLE);
  },

  // Attendance
  getAttendance(): AttendanceRecord[] {
    return getStored<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, SEED_ATTENDANCE);
  },

  updateAttendanceThreshold(min: number): Student {
    return this.updateStudent({ attendanceMinimum: min });
  },

  // Assignments
  getAssignments(): Assignment[] {
    return getStored<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, SEED_ASSIGNMENTS);
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
    return getStored<Notice[]>(STORAGE_KEYS.NOTICES, SEED_NOTICES);
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
    return getStored<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
  },

  toggleEventRegistration(eventId: string): { success: boolean; event: CampusEvent; message?: string } {
    const list = this.getEvents();
    const idx = list.findIndex(e => e.id === eventId);
    if (idx === -1) return { success: false, event: list[0], message: 'Event not found' };

    const ev = list[idx];
    if (ev.isRegistered) {
      // Cancel registration
      ev.isRegistered = false;
      ev.registeredCount = Math.max(0, ev.registeredCount - 1);
      ev.registrationId = undefined;
      setStored(STORAGE_KEYS.EVENTS, list);
      return { success: true, event: ev, message: 'Registration cancelled' };
    } else {
      // Capacity check
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
    return getStored<LostFoundItem[]>(STORAGE_KEYS.LOST_FOUND, SEED_LOST_FOUND);
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
    return getStored<Opportunity[]>(STORAGE_KEYS.OPPORTUNITIES, SEED_OPPORTUNITIES);
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
    return getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
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

  // Full Reset to Seed
  resetDemoData(): void {
    this.initializeData(true);
  },
};
