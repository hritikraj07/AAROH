import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { RoleProtectedRoute } from './components/auth/RoleProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

// Student Portal Pages
import { DashboardPage as StudentDashboardPage } from './pages/DashboardPage';
import { AcademicsPage } from './pages/AcademicsPage';
import { NoticesPage } from './pages/NoticesPage';
import { EventsPage } from './pages/EventsPage';
import { LostFoundPage } from './pages/LostFoundPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';

// Faculty Portal Pages
import { FacultyDashboardPage } from './pages/faculty/FacultyDashboardPage';
import { FacultyClassesPage } from './pages/faculty/FacultyClassesPage';
import { FacultyAttendancePage } from './pages/faculty/FacultyAttendancePage';
import { FacultyAssignmentsPage } from './pages/faculty/FacultyAssignmentsPage';

// Admin Portal Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminPeoplePage } from './pages/admin/AdminPeoplePage';
import { AdminNoticesPage } from './pages/admin/AdminNoticesPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { AdminTimetablePage } from './pages/admin/AdminTimetablePage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Root Dispatcher: routes authenticated users to their specific portal
const RootRedirect: React.FC = () => {
  const { isAuthenticated, role } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  switch (role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'faculty':
      return <Navigate to="/faculty" replace />;
    case 'student':
    default:
      return <Navigate to="/student" replace />;
  }
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Authentication & Guard Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Root Domain Dispatcher */}
      <Route path="/" element={<RootRedirect />} />

      {/* 1. Student Portal (/student/*) */}
      <Route
        path="/student"
        element={
          <RoleProtectedRoute allowedRoles={['student']}>
            <Layout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<StudentDashboardPage />} />
        <Route path="dashboard" element={<Navigate to="/student" replace />} />
        <Route path="academics" element={<AcademicsPage />} />
        <Route path="notices" element={<NoticesPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="lost-found" element={<LostFoundPage />} />
        <Route path="opportunities" element={<OpportunitiesPage />} />
      </Route>

      {/* 2. Faculty Portal (/faculty/*) */}
      <Route
        path="/faculty"
        element={
          <RoleProtectedRoute allowedRoles={['faculty']}>
            <Layout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<FacultyDashboardPage />} />
        <Route path="dashboard" element={<Navigate to="/faculty" replace />} />
        <Route path="classes" element={<FacultyClassesPage />} />
        <Route path="attendance" element={<FacultyAttendancePage />} />
        <Route path="assignments" element={<FacultyAssignmentsPage />} />
      </Route>

      {/* 3. Admin Portal (/admin/*) */}
      <Route
        path="/admin"
        element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <Layout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="dashboard" element={<Navigate to="/admin" replace />} />
        <Route path="people" element={<AdminPeoplePage />} />
        <Route path="directory" element={<Navigate to="/admin/people" replace />} />
        <Route path="users" element={<Navigate to="/admin/people" replace />} />
        <Route path="notices" element={<AdminNoticesPage />} />
        <Route path="events" element={<AdminEventsPage />} />
        <Route path="timetable" element={<AdminTimetablePage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Backward-Compatibility & Deep-link Aliases */}
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="/people" element={<Navigate to="/admin/people" replace />} />
      <Route path="/directory" element={<Navigate to="/admin/people" replace />} />
      <Route path="/academics" element={<Navigate to="/student/academics" replace />} />
      <Route path="/notices" element={<Navigate to="/student/notices" replace />} />
      <Route path="/events" element={<Navigate to="/student/events" replace />} />
      <Route path="/lost-found" element={<Navigate to="/student/lost-found" replace />} />
      <Route path="/opportunities" element={<Navigate to="/student/opportunities" replace />} />

      {/* Fallback Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
