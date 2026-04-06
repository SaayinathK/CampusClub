import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import EventCarousel from './components/EventCarousel';
import Features from './components/Features';
import Committees from './components/Committees';
import Footer from './components/Footer';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Clubs from './pages/Clubs';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import { initialEvents } from './constants';
import { AuthProvider } from './context/AuthContext';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCommunities from './pages/admin/AdminCommunities';
import AdminEvents from './pages/admin/AdminEvents';

// Community Admin Pages
import CommunityAdminDashboard from './pages/communityAdmin/CommunityAdminDashboard';
import CommunityAdminProfile from './pages/communityAdmin/CommunityAdminProfile';
import CommunityAdminMembers from './pages/communityAdmin/CommunityAdminMembers';
import CommunityAdminEvents from './pages/communityAdmin/CommunityAdminEvents';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentRegistrations from './pages/student/StudentRegistrations';
import StudentNotifications from './pages/student/StudentNotifications';


const Home = ({ events }) => (
  <>
    <EventCarousel events={events} />
    <Features />
    <Committees />
    <section className="py-24 bg-gradient-to-b from-transparent to-blue-900/10">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-widest leading-tight font-display">Ready to boost your campus life?</h2>
        <Link to="/signup">
          <button className="px-10 py-4 rounded-xl bg-white text-black font-black text-lg hover:bg-gray-200 transition-all active:scale-95 shadow-2xl shadow-white/10 uppercase tracking-[0.2em] font-display">
            Join Club Hub Now
          </button>
        </Link>
      </div>
    </section>
  </>
);

function App() {
  const [events] = useState(initialEvents);

  return (
    <AuthProvider>
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <div className="min-h-screen">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home events={events} />} />
            <Route path="/events" element={
              <ProtectedRoute message="Please sign in to browse campus events.">
                <Events />
              </ProtectedRoute>
            } />
            <Route path="/clubs" element={
              <ProtectedRoute message="Please sign in to browse campus clubs.">
                <Clubs />
              </ProtectedRoute>
            } />
            <Route path="/events/:id" element={
              <ProtectedRoute message="Please sign in to view event details.">
                <EventDetails />
              </ProtectedRoute>
            } />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Admin — wrapped in sidebar layout */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout><AdminDashboard /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout><AdminUsers /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/communities" element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout><AdminCommunities /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/events" element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout><AdminEvents /></DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Community Admin — wrapped in sidebar layout */}
            <Route path="/community-admin" element={
              <ProtectedRoute roles={['community_admin']}>
                <DashboardLayout><CommunityAdminDashboard /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/community-admin/profile" element={
              <ProtectedRoute roles={['community_admin']}>
                <DashboardLayout><CommunityAdminProfile /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/community-admin/members" element={
              <ProtectedRoute roles={['community_admin']}>
                <DashboardLayout><CommunityAdminMembers /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/community-admin/events" element={
              <ProtectedRoute roles={['community_admin']}>
                <DashboardLayout><CommunityAdminEvents /></DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Student */}
            <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/profile" element={<ProtectedRoute roles={['student']}><StudentProfile /></ProtectedRoute>} />
            <Route path="/student/registrations" element={<ProtectedRoute roles={['student']}><StudentRegistrations /></ProtectedRoute>} />
            <Route path="/student/notifications" element={<ProtectedRoute roles={['student']}><StudentNotifications /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;
