import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import { StorageService } from '../services/storage';

interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message?: string;
}

interface AppContextType {
  student: Student | null;
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
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;

  // Feedback Toasts
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;

  // Authentication & Actions
  loginWithDomain: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Ensure storage is initialized on mount
  useEffect(() => {
    StorageService.initializeData(false);
  }, []);

  const [student, setStudent] = useState<Student | null>(() => StorageService.getStudent());
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
    setStudent(StorageService.getStudent());
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

  // Keyboard shortcut for Cmd+K / Ctrl+K search
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

  // Computed counts
  const unreadNoticeCount = notices.filter(n => !n.readByCurrentUser).length;
  const pendingAssignmentsCount = assignments.filter(a => a.status === 'pending' || a.status === 'overdue').length;
  const lowAttendanceCount = attendance.filter(rec => {
    const pct = rec.total > 0 ? (rec.attended / rec.total) * 100 : 100;
    return pct < (student?.attendanceMinimum || 75);
  }).length;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Domain-Restricted Auth Login
  const loginWithDomain = (email: string, password: string) => {
    const result = StorageService.loginWithDomain(email, password);
    if (result.success && result.student) {
      setStudent(result.student);
      setIsAuthenticated(true);
      showToast({
        type: 'success',
        title: 'Authentication Successful',
        message: `Welcome, ${result.student.name} (${result.student.email})`,
      });
      return { success: true };
    } else {
      return { success: false, error: result.error || 'Authentication failed' };
    }
  };

  const logout = () => {
    StorageService.logout();
    setStudent(null);
    setIsAuthenticated(false);
    showToast({ type: 'info', title: 'Session Ended', message: 'You have been signed out safely.' });
  };

  const updateAttendanceThreshold = (min: number) => {
    const updated = StorageService.updateAttendanceThreshold(min);
    if (updated) {
      setStudent(updated);
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
      message: 'All collections have been reset to clean production foundation.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        student,
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
        isSettingsOpen,
        openSettings: () => setIsSettingsOpen(true),
        closeSettings: () => setIsSettingsOpen(false),
        toasts,
        showToast,
        dismissToast,
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
