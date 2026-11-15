import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  GlobalSearchResult,
} from '../types';
import { StorageService } from '../services/storage';

interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message?: string;
}

interface AppContextType {
  user: User | null;
  role: UserRole | null;
  student: Student | null; // Compatibility alias
  users: User[];
  courses: Course[];
  timetable: ClassSession[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  notices: Notice[];
  events: CampusEvent[];
  lostFound: LostFoundItem[];
  opportunities: Opportunity[];
  notifications: NotificationItem[];
  isAuthenticated: boolean;

  // Counts
  unreadNoticeCount: number;
  pendingAssignmentsCount: number;
  lowAttendanceCount: number;
  unreadNotificationsCount: number;

  // Modals & Panels
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  searchGlobal: (query: string) => GlobalSearchResult[];
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;

  // Feedback Toasts
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;

  // Authentication
  login: (email: string, password?: string) => { success: boolean; error?: string; role?: UserRole };
  loginWithDomain: (email: string, password: string) => { success: boolean; error?: string; role?: UserRole };
  logout: () => void;

  // Student & Academic Actions
  updateAttendanceThreshold: (min: number) => void;
  toggleAssignmentSubmission: (id: string) => void;
  markNoticeRead: (id: string, read?: boolean) => void;
  markAllNoticesRead: () => void;
  toggleEventRegistration: (eventId: string) => { success: boolean; message?: string };
  createLostFoundItem: (item: Omit<LostFoundItem, 'id' | 'status' | 'contactRequestsCount'>) => LostFoundItem;
  toggleResolveItem: (id: string) => void;
  requestContact: (id: string) => boolean;
  toggleSaveOpportunity: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
  refreshData: () => void;

  // Faculty & Admin Management Actions
  createUser: (userData: Omit<User, 'id'>) => User;
  deleteUser: (id: string) => boolean;
  updateUser: (id: string, updates: Partial<User>) => User | null;
  createNotice: (notice: Omit<Notice, 'id' | 'publishedDate' | 'readByCurrentUser'>) => Notice;
  deleteNotice: (id: string) => void;
  togglePinNotice: (id: string) => void;
  createEvent: (event: Omit<CampusEvent, 'id' | 'registeredCount' | 'isRegistered'>) => CampusEvent;
  deleteEvent: (id: string) => void;
  createCourse: (course: Omit<Course, 'id'>) => Course;
  deleteCourse: (id: string) => void;
  createTimetableSession: (session: Omit<ClassSession, 'id'>) => ClassSession;
  deleteTimetableSession: (id: string) => void;
  recordAttendanceEntry: (courseId: string, attendedDelta?: number, totalDelta?: number) => void;
  recordBatchAttendance: (courseId: string, studentMarks: { studentId: string; isPresent: boolean }[]) => void;
  createAssignment: (asg: Omit<Assignment, 'id' | 'status'>) => Assignment;
  updateAssignmentLabStatus: (id: string, labStatus: 'locked' | 'active' | 'closed') => Assignment | null;
  submitCodingAssignment: (id: string, studentCode: string, testResultsSummary?: string) => Assignment | null;
  createOpportunity: (opp: Omit<Opportunity, 'id' | 'isSaved'>) => Opportunity;
  deleteOpportunity: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => StorageService.getAuthUser());
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [courses, setCourses] = useState<Course[]>(() => StorageService.getCourses());
  const [timetable, setTimetable] = useState<ClassSession[]>(() => StorageService.getTimetable());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => StorageService.getAttendance());
  const [assignments, setAssignments] = useState<Assignment[]>(() => StorageService.getAssignments());
  const [notices, setNotices] = useState<Notice[]>(() => StorageService.getNotices());
  const [events, setEvents] = useState<CampusEvent[]>(() => StorageService.getEvents());
  const [lostFound, setLostFound] = useState<LostFoundItem[]>(() => StorageService.getLostFoundItems());
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => StorageService.getOpportunities());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => StorageService.getNotifications());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => StorageService.isAuthenticated());

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const refreshData = useCallback(() => {
    setUser(StorageService.getAuthUser());
    setUsers(StorageService.getUsers());
    setCourses(StorageService.getCourses());
    setTimetable(StorageService.getTimetable());
    setAttendance(StorageService.getAttendance());
    setAssignments(StorageService.getAssignments());
    setNotices(StorageService.getNotices());
    setEvents(StorageService.getEvents());
    setLostFound(StorageService.getLostFoundItems());
    setOpportunities(StorageService.getOpportunities());
    setNotifications(StorageService.getNotifications());
    setIsAuthenticated(StorageService.isAuthenticated());
  }, []);

  useEffect(() => {
    StorageService.initializeData(false);
    window.addEventListener('storage', refreshData);
    return () => window.removeEventListener('storage', refreshData);
  }, [refreshData]);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Keyboard shortcut for Cmd+K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search Global Service
  const searchGlobal = useCallback((query: string) => {
    return StorageService.searchGlobal(query);
  }, []);

  // Counts
  const unreadNoticeCount = notices.filter(n => !n.readByCurrentUser).length;
  const pendingAssignmentsCount = assignments.filter(a => a.status === 'pending' || a.status === 'overdue').length;
  const lowAttendanceCount = attendance.filter(rec => {
    if (user?.id && rec.studentId && rec.studentId !== user.id) return false;
    const pct = rec.total > 0 ? (rec.attended / rec.total) * 100 : 100;
    return pct < (user?.attendanceMinimum || 75);
  }).length;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Domain Auth Login
  const loginWithDomain = (email: string, password = 'demoPassword') => {
    const result = StorageService.loginWithDomain(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthenticated(true);
      setUsers(StorageService.getUsers());
      showToast({
        type: 'success',
        title: `Authenticated as ${result.user.role.toUpperCase()}`,
        message: `Welcome, ${result.user.name} (${result.user.email})`,
      });
      return { success: true, role: result.user.role };
    } else {
      return { success: false, error: result.error || 'Authentication failed' };
    }
  };

  const login = loginWithDomain;

  const logout = () => {
    StorageService.logout();
    setUser(null);
    setIsAuthenticated(false);
    showToast({ type: 'info', title: 'Session Terminated', message: 'You have signed out.' });
  };

  const updateAttendanceThreshold = (min: number) => {
    const updated = StorageService.updateAttendanceThreshold(min);
    if (updated) {
      setUser(updated);
      showToast({ type: 'info', title: `Minimum attendance threshold updated to ${min}%` });
    }
  };

  const toggleAssignmentSubmission = (id: string) => {
    const updated = StorageService.toggleAssignmentSubmission(id);
    if (updated) {
      setAssignments(StorageService.getAssignments());
      const isSub = updated.status === 'submitted';
      showToast({
        type: isSub ? 'success' : 'info',
        title: isSub ? 'Assignment marked as submitted' : 'Assignment returned to pending',
        message: updated.title,
      });
    }
  };

  const markNoticeRead = (id: string, read = true) => {
    StorageService.markNoticeRead(id, read);
    setNotices(StorageService.getNotices());
  };

  const markAllNoticesRead = () => {
    StorageService.markAllNoticesRead();
    setNotices(StorageService.getNotices());
    showToast({ type: 'success', title: 'All notices marked as read' });
  };

  const toggleEventRegistration = (eventId: string) => {
    const result = StorageService.toggleEventRegistration(eventId);
    setEvents(StorageService.getEvents());
    if (result.success && result.event) {
      showToast({
        type: result.event.isRegistered ? 'success' : 'info',
        title: result.message || 'Registration updated',
        message: result.event.title,
      });
    } else {
      showToast({
        type: 'error',
        title: 'Registration failed',
        message: result.message,
      });
    }
    return { success: result.success, message: result.message };
  };

  const createLostFoundItem = (item: Omit<LostFoundItem, 'id' | 'status' | 'contactRequestsCount'>) => {
    const created = StorageService.createLostFoundItem(item);
    setLostFound(StorageService.getLostFoundItems());
    showToast({
      type: 'success',
      title: `${item.type === 'lost' ? 'Lost' : 'Found'} item reported`,
      message: item.title,
    });
    return created;
  };

  const toggleResolveItem = (id: string) => {
    const updated = StorageService.toggleResolveItem(id);
    if (updated) {
      setLostFound(StorageService.getLostFoundItems());
      const isResolved = updated.status === 'resolved';
      showToast({
        type: isResolved ? 'success' : 'info',
        title: isResolved ? 'Item marked as resolved' : 'Item re-opened',
        message: updated.title,
      });
    }
  };

  const requestContact = (id: string) => {
    const res = StorageService.requestContact(id);
    if (res.success) {
      setLostFound(StorageService.getLostFoundItems());
      showToast({
        type: 'success',
        title: 'Contact request sent',
        message: 'The poster has been notified in-app with your student contact details.',
      });
      return true;
    }
    return false;
  };

  const toggleSaveOpportunity = (id: string) => {
    const saved = StorageService.toggleSaveOpportunity(id);
    setOpportunities(StorageService.getOpportunities());
    showToast({
      type: 'info',
      title: saved ? 'Saved to bookmarks' : 'Removed from bookmarks',
    });
  };

  const markNotificationRead = (id: string) => {
    StorageService.markNotificationRead(id);
    setNotifications(StorageService.getNotifications());
  };

  const markAllNotificationsRead = () => {
    StorageService.markAllNotificationsRead();
    setNotifications(StorageService.getNotifications());
    showToast({ type: 'success', title: 'All notifications marked as read' });
  };

  const resetDemoData = () => {
    StorageService.resetDemoData();
    refreshData();
    showToast({
      type: 'info',
      title: 'Foundation Reset',
      message: 'All collections have been reset to empty foundation.',
    });
  };

  // Admin & Faculty Management Actions
  const createNotice = (notice: Omit<Notice, 'id' | 'publishedDate' | 'readByCurrentUser'>) => {
    const created = StorageService.createNotice(notice);
    setNotices(StorageService.getNotices());
    showToast({ type: 'success', title: 'Circular Published', message: notice.title });
    return created;
  };

  const deleteNotice = (id: string) => {
    StorageService.deleteNotice(id);
    setNotices(StorageService.getNotices());
    showToast({ type: 'info', title: 'Notice Deleted' });
  };

  const togglePinNotice = (id: string) => {
    const updated = StorageService.togglePinNotice(id);
    setNotices(StorageService.getNotices());
    if (updated) {
      showToast({
        type: 'info',
        title: updated.isPinned ? 'Notice Pinned' : 'Notice Unpinned',
      });
    }
  };

  const createEvent = (ev: Omit<CampusEvent, 'id' | 'registeredCount' | 'isRegistered'>) => {
    const created = StorageService.createEvent(ev);
    setEvents(StorageService.getEvents());
    showToast({ type: 'success', title: 'Event Created', message: ev.title });
    return created;
  };

  const deleteEvent = (id: string) => {
    StorageService.deleteEvent(id);
    setEvents(StorageService.getEvents());
    showToast({ type: 'info', title: 'Event Removed' });
  };

  const createCourse = (course: Omit<Course, 'id'>) => {
    const created = StorageService.createCourse(course);
    setCourses(StorageService.getCourses());
    showToast({ type: 'success', title: 'Course Added', message: `${course.code}: ${course.name}` });
    return created;
  };

  const deleteCourse = (id: string) => {
    StorageService.deleteCourse(id);
    setCourses(StorageService.getCourses());
    setTimetable(StorageService.getTimetable());
    showToast({ type: 'info', title: 'Course and associated sessions removed' });
  };

  const createTimetableSession = (session: Omit<ClassSession, 'id'>) => {
    const created = StorageService.createTimetableSession(session);
    setTimetable(StorageService.getTimetable());
    showToast({ type: 'success', title: 'Timetable Slot Added' });
    return created;
  };

  const deleteTimetableSession = (id: string) => {
    StorageService.deleteTimetableSession(id);
    setTimetable(StorageService.getTimetable());
    showToast({ type: 'info', title: 'Timetable Slot Removed' });
  };

  const recordAttendanceEntry = (courseId: string, attendedDelta = 1, totalDelta = 1) => {
    StorageService.recordAttendanceEntry(courseId, attendedDelta, totalDelta);
    setAttendance(StorageService.getAttendance());
    showToast({ type: 'success', title: 'Attendance Logged' });
  };

  const createAssignment = (asg: Omit<Assignment, 'id' | 'status'>) => {
    const created = StorageService.createAssignment(asg);
    setAssignments(StorageService.getAssignments());
    showToast({ type: 'success', title: 'Assignment Posted', message: asg.title });
    return created;
  };

  const updateAssignmentLabStatus = (id: string, labStatus: 'locked' | 'active' | 'closed') => {
    const updated = StorageService.updateAssignmentLabStatus(id, labStatus);
    setAssignments(StorageService.getAssignments());
    showToast({
      type: 'info',
      title: 'Lab Session Status Updated',
      message: `Assignment lab status changed to ${labStatus.toUpperCase()}.`,
    });
    return updated;
  };

  const submitCodingAssignment = (id: string, studentCode: string, testResultsSummary?: string) => {
    const updated = StorageService.submitCodingAssignment(id, studentCode, testResultsSummary);
    setAssignments(StorageService.getAssignments());
    showToast({
      type: 'success',
      title: 'Code Submitted Successfully',
      message: 'Your automated lab solution has been verified and recorded.',
    });
    return updated;
  };

  const createUser = (userData: Omit<User, 'id'>) => {
    const created = StorageService.createUser(userData);
    setUsers(StorageService.getUsers());
    showToast({
      type: 'success',
      title: 'User Onboarded',
      message: `${created.name} (${created.role}) has been added to the directory.`,
    });
    return created;
  };

  const deleteUser = (id: string) => {
    const success = StorageService.deleteUser(id);
    if (success) {
      setUsers(StorageService.getUsers());
      showToast({ type: 'info', title: 'User Removed', message: 'User account removed from directory.' });
    }
    return success;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    const updated = StorageService.updateUser(id, updates);
    if (updated) {
      setUsers(StorageService.getUsers());
      showToast({ type: 'success', title: 'User Updated', message: `Profile updated for ${updated.name}.` });
    }
    return updated;
  };

  const recordBatchAttendance = (courseId: string, studentMarks: { studentId: string; isPresent: boolean }[]) => {
    StorageService.recordBatchAttendance(courseId, studentMarks);
    setAttendance(StorageService.getAttendance());
    const presentCount = studentMarks.filter(s => s.isPresent).length;
    showToast({
      type: 'success',
      title: 'Roll Call Submitted',
      message: `Recorded attendance for ${studentMarks.length} students (${presentCount} present).`,
    });
  };

  const createOpportunity = (opp: Omit<Opportunity, 'id' | 'isSaved'>) => {
    const created = StorageService.createOpportunity(opp);
    setOpportunities(StorageService.getOpportunities());
    showToast({
      type: 'success',
      title: 'Opportunity posted successfully',
      message: opp.title,
    });
    return created;
  };

  const deleteOpportunity = (id: string) => {
    StorageService.deleteOpportunity(id);
    setOpportunities(StorageService.getOpportunities());
    showToast({
      type: 'info',
      title: 'Opportunity removed',
      message: 'The listing has been removed from the opportunity board.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        role: user?.role || null,
        student: user, // Compatibility alias
        users,
        courses,
        timetable,
        attendance,
        assignments,
        notices,
        events,
        lostFound,
        opportunities,
        notifications,
        isAuthenticated,
        unreadNoticeCount,
        pendingAssignmentsCount,
        lowAttendanceCount,
        unreadNotificationsCount,
        isSearchOpen,
        openSearch: () => setIsSearchOpen(true),
        closeSearch: () => setIsSearchOpen(false),
        searchGlobal,
        isSettingsOpen,
        openSettings: () => setIsSettingsOpen(true),
        closeSettings: () => setIsSettingsOpen(false),
        toasts,
        showToast,
        dismissToast,
        login,
        loginWithDomain,
        logout,
        updateAttendanceThreshold,
        toggleAssignmentSubmission,
        markNoticeRead,
        markAllNoticesRead,
        toggleEventRegistration,
        createLostFoundItem,
        toggleResolveItem,
        requestContact,
        toggleSaveOpportunity,
        markNotificationRead,
        markAllNotificationsRead,
        resetDemoData,
        refreshData,
        createUser,
        deleteUser,
        updateUser,
        createNotice,
        deleteNotice,
        togglePinNotice,
        createEvent,
        deleteEvent,
        createCourse,
        deleteCourse,
        createTimetableSession,
        deleteTimetableSession,
        recordAttendanceEntry,
        recordBatchAttendance,
        createAssignment,
        updateAssignmentLabStatus,
        submitCodingAssignment,
        createOpportunity,
        deleteOpportunity,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
