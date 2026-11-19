import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { RoleProtectedRoute } from './components/auth/RoleProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Student Portal Pages
import { DashboardPage as StudentDashboardPage } from './pages/DashboardPage';
import { AcademicsPage } from './pages/AcademicsPage';
import { NoticesPage } from './pages/NoticesPage';
import { EventsPage } from './pages/EventsPage';
import { LostFoundPage } from './pages/LostFoundPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { StudentCodeWorkspacePage } from './pages/StudentCodeWorkspacePage';
import { StudentCodingLabsPage } from './pages/StudentCodingLabsPage';
import { ErrorBlock } from './components/ui/oversized-404-numeral';

const CampusMapPage = React.lazy(() => import('./pages/CampusMapPage'));

// Faculty Portal Pages
import { FacultyDashboardPage } from './pages/faculty/FacultyDashboardPage';
import { FacultyClassesPage } from './pages/faculty/FacultyClassesPage';
import { FacultyAttendancePage } from './pages/faculty/FacultyAttendancePage';
import { FacultyAssignmentsPage } from './pages/faculty/FacultyAssignmentsPage';
import { FacultyNoticesPage } from './pages/faculty/FacultyNoticesPage';
import { FacultyGradebookPage } from './pages/faculty/FacultyGradebookPage';

// Admin Portal Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminPeoplePage } from './pages/admin/AdminPeoplePage';
import { AdminNoticesPage } from './pages/admin/AdminNoticesPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { AdminTimetablePage } from './pages/admin/AdminTimetablePage';
import { AdminOpportunitiesPage } from './pages/admin/AdminOpportunitiesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminCurriculumPage } from './pages/admin/AdminCurriculumPage';
import { AdminAttendancePage } from './pages/admin/AdminAttendancePage';

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
        <Route path="labs" element={<StudentCodingLabsPage />} />
        <Route path="coding-labs" element={<StudentCodingLabsPage />} />
        <Route path="assignments" element={<Navigate to="/student/academics?tab=assignments" replace />} />
        <Route path="assignments/code/:id" element={<StudentCodeWorkspacePage />} />
        <Route path="notices" element={<NoticesPage />} />
        <Route path="campus-updates" element={<NoticesPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="lost-found" element={<LostFoundPage />} />
        <Route path="opportunities" element={<OpportunitiesPage />} />
        <Route
          path="campus-map"
          element={
            <React.Suspense fallback={<div className="p-8 text-center text-slate-500 font-mono text-xs">Loading Campus Model...</div>}>
              <CampusMapPage />
            </React.Suspense>
          }
        />
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
        <Route path="gradebook" element={<FacultyGradebookPage />} />
        <Route path="assignments" element={<FacultyAssignmentsPage />} />
        <Route path="notices" element={<FacultyNoticesPage />} />
        <Route
          path="campus-map"
          element={
            <React.Suspense fallback={<div className="p-8 text-center text-slate-500 font-mono text-xs">Loading Campus Model...</div>}>
              <CampusMapPage />
            </React.Suspense>
          }
        />
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
        <Route path="attendance" element={<AdminAttendancePage />} />
        <Route path="curriculum" element={<AdminCurriculumPage />} />
        <Route path="curriculum-builder" element={<Navigate to="/admin/curriculum" replace />} />
        <Route path="opportunities" element={<AdminOpportunitiesPage />} />
        <Route
          path="campus-map"
          element={
            <React.Suspense fallback={<div className="p-8 text-center text-slate-500 font-mono text-xs">Loading Campus Model...</div>}>
              <CampusMapPage />
            </React.Suspense>
          }
        />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Backward-Compatibility & Deep-link Aliases */}
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="/people" element={<Navigate to="/admin/people" replace />} />
      <Route path="/directory" element={<Navigate to="/admin/people" replace />} />
      <Route path="/curriculum" element={<Navigate to="/admin/curriculum" replace />} />
      <Route path="/academics" element={<Navigate to="/student/academics" replace />} />
      <Route path="/assignments" element={<Navigate to="/student/academics?tab=assignments" replace />} />
      <Route path="/notices" element={<Navigate to="/student/notices" replace />} />
      <Route path="/campus-updates" element={<Navigate to="/student/campus-updates" replace />} />
      <Route path="/events" element={<Navigate to="/student/events" replace />} />
      <Route path="/lost-found" element={<Navigate to="/student/lost-found" replace />} />
      <Route path="/opportunities" element={<Navigate to="/student/opportunities" replace />} />
      <Route path="/campus-map" element={<Navigate to="/student/campus-map" replace />} />
      <Route path="/404" element={<ErrorBlock />} />

      {/* Fallback Catch-all */}
      <Route path="*" element={<ErrorBlock />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
