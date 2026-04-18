import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';
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
    <section className="dashboard-container pt-28 pb-6">
      <div className="surface-panel rounded-[2rem] p-6 md:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/8 via-teal-500/5 to-blue-600/10 pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="theme-pill mb-4 w-max text-[10px] font-black uppercase tracking-[0.3em]">
            Campus operations unified
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
            <span className="text-slate-900">Manage clubs, events, and approvals</span>{' '}
            <span className="text-gradient">from one polished portal.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-slate-500 leading-relaxed">
            ClubSphere keeps administrators, community leaders, and students aligned with a single experience for event discovery, membership, notifications, and approvals.
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-3">
          <Link to="/events" className="theme-button-secondary px-5 py-3 text-sm font-black uppercase tracking-[0.2em]">
            Explore Events
          </Link>
          <Link to="/signup" className="theme-button-primary px-5 py-3 text-sm font-black uppercase tracking-[0.2em]">
            Join Campus Hub
          </Link>
        </div>
      </div>
    </section>

    <EventCarousel events={events} />
    <Features />
    <Committees />
    <section className="py-24 bg-gradient-to-b from-transparent via-sky-500/5 to-transparent">
      <div className="dashboard-container">
        <div className="surface-panel rounded-[2rem] px-6 py-12 md:px-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-transparent pointer-events-none" />
          <p className="relative z-10 text-[10px] font-black uppercase tracking-[0.45em] text-teal-700/80 mb-4">Built for campus operations</p>
          <h2 className="relative z-10 text-3xl md:text-6xl font-black mb-6 uppercase tracking-tight leading-tight font-display">Ready to boost your campus life?</h2>
          <p className="relative z-10 max-w-3xl mx-auto text-slate-500 mb-8">
            Use the same platform to publish events, approve communities, manage members, and keep every student informed in real time.
          </p>
          <Link to="/signup" className="relative z-10 inline-flex">
            <button className="theme-button-primary px-10 py-4 text-sm uppercase tracking-[0.25em] font-black">
              Join Club Hub Now
            </button>
          </Link>
        </div>
      </div>
    </section>
  </>
);

const PAGE_BACKDROPS = [
  {
    match: /^\/$/,
    image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=2070&auto=format&fit=crop',
    veil: 'from-sky-100/70 via-white/70 to-cyan-100/45',
  },
  {
    match: /^\/events(\/.*)?$/,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2070&auto=format&fit=crop',
    veil: 'from-indigo-100/70 via-white/72 to-sky-100/45',
  },
  {
    match: /^\/clubs$/,
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop',
    veil: 'from-cyan-100/65 via-white/74 to-blue-100/40',
  },
  {
    match: /^\/profile$/,
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2070&auto=format&fit=crop',
    veil: 'from-slate-100/75 via-white/75 to-cyan-100/38',
  },
  {
    match: /^\/signin$/,
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop',
    veil: 'from-blue-100/70 via-white/76 to-cyan-100/38',
  },
  {
    match: /^\/signup$/,
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2070&auto=format&fit=crop',
    veil: 'from-teal-100/65 via-white/78 to-blue-100/40',
  },
  {
    match: /^\/student(\/.*)?$/,
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop',
    veil: 'from-sky-100/68 via-white/74 to-indigo-100/42',
  },
  {
    match: /^\/admin(\/.*)?$/,
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=2070&auto=format&fit=crop',
    veil: 'from-slate-100/75 via-white/76 to-blue-100/38',
  },
  {
    match: /^\/community-admin(\/.*)?$/,
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop',
    veil: 'from-cyan-100/68 via-white/76 to-slate-100/40',
  },
];

const FALLBACK_BACKDROP = {
  image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop',
  veil: 'from-slate-100/70 via-white/78 to-sky-100/40',
};

const getBackdropConfig = (pathname) => {
  const matched = PAGE_BACKDROPS.find((entry) => entry.match.test(pathname));
  return matched || FALLBACK_BACKDROP;
};

function App() {
  const [events] = useState(initialEvents);

  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ToastContainer position="top-right" autoClose={3000} theme="light" />
        <AppShell events={events} />
      </Router>
    </AuthProvider>
  );
}

function AppShell({ events }) {
  const location = useLocation();
  const showStudentShell = !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/community-admin');
  const backdrop = getBackdropConfig(location.pathname);

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent text-slate-900">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <img
          src={backdrop.image}
          alt="Campus visual atmosphere"
          className="h-full w-full object-cover opacity-[0.24] route-bg-pan"
        />
        <div className={`absolute inset-0 bg-gradient-to-b ${backdrop.veil}`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.50),rgba(244,248,253,0.22))]" />
        <div className="absolute -top-24 -right-20 h-80 w-80 rounded-full bg-sky-400/25 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -left-24 h-96 w-96 rounded-full bg-cyan-400/18 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 right-1/4 h-80 w-80 rounded-full bg-blue-500/12 blur-3xl animate-blob animation-delay-4000" />
      </div>
      {showStudentShell && <Navbar />}
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <Routes location={location}>
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
          </motion.div>
        </AnimatePresence>
      </main>
      {showStudentShell && <Footer />}
    </div>
  );
}

export default App;
