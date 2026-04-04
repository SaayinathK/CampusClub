import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate } from
'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { StudentLayout } from './layouts/StudentLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { RoleSelector } from './pages/RoleSelector';
import { Toaster } from 'sonner';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { ActivityFeed } from './pages/student/ActivityFeed';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Notifications } from './pages/student/Notifications';
import { EventManagement } from './pages/admin/EventManagement';
import { EventDetail } from './pages/student/EventDetail';
import { Registrations } from './pages/student/Registrations';
import { Preferences } from './pages/student/Preferences';
import { EventsDirectory } from './pages/student/EventsDirectory';
import { CommunityManagement } from './pages/admin/CommunityManagement';
import { RegistrationManagement } from './pages/admin/RegistrationManagement';
import { PaymentManagement } from './pages/admin/PaymentManagement';
import { AnalyticsDashboard } from './pages/admin/AnalyticsDashboard';
import { Attendance } from './pages/admin/Attendance';
import { AdminNotifications } from './pages/admin/AdminNotifications';
import { Reports } from './pages/admin/Reports';
import { AuthPage } from './pages/AuthPage';
import { getDefaultRoute } from './lib/auth';

const FullPageLoader = () =>
<div className="flex min-h-screen items-center justify-center bg-slate-50">
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-600 shadow-sm">
      Loading...
    </div>
  </div>;

const ProtectedRoute = ({
  allowedRole,
  children
}) => {
  const { role, user, isInitializing } = useAuth();
  if (isInitializing) {
    return <FullPageLoader />;
  }
  if (!user) {
    return <Navigate to={`/login/${allowedRole}`} replace />;
  }
  if (role !== allowedRole) {
    return <Navigate to={getDefaultRoute(role)} replace />;
  }
  return <>{children}</>;
};

const HomeRoute = () => {
  const { user, role, isInitializing } = useAuth();

  if (isInitializing) {
    return <FullPageLoader />;
  }

  if (user) {
    return <Navigate to={getDefaultRoute(role)} replace />;
  }

  return <RoleSelector />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/login/:role" element={<AuthPage mode="login" />} />
      <Route path="/register/:role" element={<AuthPage mode="register" />} />

      {/* Student Routes */}
      <Route
        path="/"
        element={
        <ProtectedRoute allowedRole="student">
            <StudentLayout />
          </ProtectedRoute>
        }>
        
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="communities" element={<EventsDirectory />} />
        <Route path="events" element={<EventsDirectory />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="feed" element={<ActivityFeed />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="registrations" element={<Registrations />} />
        <Route path="preferences" element={<Preferences />} />
        <Route path="profile" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
        <ProtectedRoute allowedRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
        
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="communities" element={<CommunityManagement />} />
        <Route path="events" element={<EventManagement />} />
        <Route path="registrations" element={<RegistrationManagement />} />
        <Route path="payments" element={<PaymentManagement />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>);

};
export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </Router>
      </NotificationProvider>
    </AuthProvider>);

}
