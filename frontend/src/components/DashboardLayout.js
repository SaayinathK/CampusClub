import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  Users,
  Building2,
  CalendarDays,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Shield,
  Menu,
  ChevronDown,
  Sparkles,
  UserCircle,
  Award,
  Settings,
  HelpCircle,
  BellRing,
  Star,
  Compass,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

// ─── Nav config per role ──────────────────────────────────────────────────────
const NAV = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutGrid, desc: 'Overview & analytics', badge: null },
    { to: '/admin/users', label: 'Users', icon: Users, desc: 'Manage accounts', badge: null },
    { to: '/admin/communities', label: 'Communities', icon: Building2, desc: 'Clubs & groups', badge: null },
    { to: '/admin/events', label: 'Events', icon: CalendarDays, desc: 'Schedule & manage', badge: '6' },
  ],
  community_admin: [
    { to: '/community-admin', label: 'Dashboard', icon: LayoutGrid, desc: 'Community stats', badge: null },
    { to: '/community-admin/members', label: 'Members', icon: Users, desc: 'Member management', badge: null },
    { to: '/community-admin/events', label: 'Events', icon: CalendarDays, desc: 'Community events', badge: '3' },
  ],
};

const ROLE_LABEL = {
  admin: 'SYSTEM ADMINISTRATOR',
  community_admin: 'COMMUNITY MANAGER',
};

const ROLE_BADGE_COLOR = {
  admin: 'from-blue-600 to-indigo-600',
  community_admin: 'from-emerald-600 to-teal-600',
};

// ─── Sidebar Nav Item Component ────────────────────────────────────────────────
const SidebarNavItem = ({ item, isActive, collapsed, mobileOpen }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === '/admin' || item.to === '/community-admin'}
      className={`
        group relative flex items-center gap-4 rounded-xl transition-all duration-300
        ${collapsed && !mobileOpen ? 'justify-center py-3.5 px-0' : 'px-4 py-3'}
        ${isActive
          ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 border-l-4 border-blue-500'
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/80'
        }
      `}
    >
      <Icon size={20} className={`shrink-0 transition-all duration-300 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
      {(!collapsed || mobileOpen) && (
        <div className="flex-1 flex items-center justify-between">
          <span className={`text-[13px] font-semibold tracking-tight ${isActive ? 'text-blue-700' : 'text-slate-700'}`}>
            {item.label}
          </span>
          {item.badge && (
            <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-100 text-rose-600 rounded-full">
              {item.badge}
            </span>
          )}
        </div>
      )}

      {/* Tooltip for collapsed state */}
      {collapsed && !mobileOpen && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-[10px] font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-lg">
          {item.label}
        </div>
      )}
    </NavLink>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [greeting, setGreeting] = useState('');

  const navItems = NAV[user?.role] || [];
  const roleColor = ROLE_BADGE_COLOR[user?.role] || 'from-blue-600 to-indigo-600';

  const handleLogout = () => { logout(); navigate('/'); };

  // Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showUserMenu && !e.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  const sidebarVariants = {
    expanded: { width: 280, transition: { type: 'spring', stiffness: 400, damping: 35 } },
    collapsed: { width: 80, transition: { type: 'spring', stiffness: 400, damping: 35 } }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 font-sans text-slate-900 overflow-x-hidden">

      {/* ── Premium Animated Background ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-400/15 to-blue-400/15 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-gradient-to-r from-transparent via-blue-100/10 to-transparent rotate-12 blur-2xl" />
      </div>

      {/* ── Glassmorphism Top Header ── */}
      <header className="fixed top-0 left-0 right-0 h-16 z-[250] flex items-center justify-between px-6 md:px-8 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        {/* Left: Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl blur-md opacity-50" />
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
              <span className="text-xl font-black tracking-tight">C</span>
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="text-base font-black tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent leading-none">CAMPUS CLUB</div>
            <div className="text-[8px] font-bold text-blue-500 uppercase tracking-[0.2em] mt-0.5">MANAGEMENT PORTAL</div>
          </div>
        </div>

        {/* Center: Quick Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-0.5 bg-white/50 backdrop-blur-sm rounded-full p-0.5 border border-slate-200/50 shadow-sm">
          <Link to="/" className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:text-blue-600 transition-all rounded-full hover:bg-white/80">Home</Link>
          <Link to="/events" className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:text-blue-600 transition-all rounded-full hover:bg-white/80">Events</Link>
          <Link to="/clubs" className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:text-blue-600 transition-all rounded-full hover:bg-white/80">Clubs</Link>
          <Link to="/discover" className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:text-blue-600 transition-all rounded-full hover:bg-white/80">Discover</Link>
        </nav>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-slate-200/50 shadow-sm">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none min-w-[140px]"
            />
            <kbd className="hidden lg:block text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">⌘K</kbd>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
              <BellRing size={18} className="text-slate-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative user-menu-container">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                {(user?.name || 'A')[0].toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col items-start leading-tight">
                <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">{user?.role === 'admin' ? 'ADMIN' : 'MANAGER'}</span>
                <span className="text-[11px] font-semibold text-slate-700">{user?.name?.split(' ')[0] || 'Admin'}</span>
              </div>
              <ChevronDown size={12} className="text-slate-400 group-hover:text-slate-600 transition-colors hidden md:block" />
            </button>

            {/* Premium Dropdown Menu */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
                      <UserCircle size={14} /> Profile Settings
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
                      <Settings size={14} /> Account Preferences
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
                      <HelpCircle size={14} /> Help & Support
                    </button>
                  </div>
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Collapse Toggle (Desktop) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg bg-white/50 backdrop-blur-sm border border-slate-200/50 text-slate-500 hover:bg-slate-100 transition-all"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </header>

      {/* Main Flex Container */}
      <div className="flex pt-16">
        {/* Mobile Backdrop */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[200] md:hidden"
            />
          )}
        </AnimatePresence>

        {/* ── Premium Sidebar ── */}
        <motion.aside
          initial={false}
          animate={mobileOpen ? { x: 0, width: 280 } : (collapsed ? 'collapsed' : 'expanded')}
          variants={sidebarVariants}
          className={`fixed inset-y-0 left-0 pt-16 z-[201] flex flex-col bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-xl transition-transform duration-300 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* User Card Area */}
          {(!collapsed || mobileOpen) && (
            <div className="px-4 pt-5 pb-3 shrink-0">
              <div className="rounded-xl bg-gradient-to-br from-slate-50/90 to-white/90 border border-slate-100/50 p-3 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg blur-sm opacity-40" />
                    <div className="relative h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                      <Shield size={16} className="text-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-800 leading-tight capitalize">{user?.name?.split(' ')[0] || 'Administrator'}</div>
                    <div className={`text-[8px] font-bold bg-gradient-to-r ${roleColor} bg-clip-text text-transparent uppercase tracking-wider mt-0.5`}>
                      {ROLE_LABEL[user?.role] || 'SYSTEM ADMIN'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Greeting */}
          {(!collapsed || mobileOpen) && (
            <div className="px-4 py-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="text-base">👋</span>
                <span>{greeting}, {user?.name?.split(' ')[0] || 'Admin'}</span>
              </div>
            </div>
          )}

          {/* Search Bar inside Sidebar */}
          {(!collapsed || mobileOpen) && (
            <div className="px-4 py-2 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search menu..."
                  className="w-full bg-slate-50/80 backdrop-blur-sm border border-slate-100 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-600 focus:outline-none focus:border-blue-300 focus:bg-white transition-all"
                />
              </div>
            </div>
          )}

          {/* Navigation Wrapper */}
          <div className="flex-1 overflow-y-auto px-3 py-5 space-y-5 custom-sidebar-scroll">
            <div className={`px-2 text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] ${collapsed && !mobileOpen ? 'text-center' : ''}`}>
              {(!collapsed || mobileOpen) ? 'MAIN MENU' : '•••'}
            </div>

            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to || (item.to !== '/admin' && location.pathname.startsWith(item.to));
                return (
                  <SidebarNavItem
                    key={item.to}
                    item={item}
                    isActive={isActive}
                    collapsed={collapsed}
                    mobileOpen={mobileOpen}
                  />
                );
              })}
            </nav>

            {/* Quick Actions Section */}
            {(!collapsed || mobileOpen) && (
              <div className="pt-4 mt-4 border-t border-slate-100">
                <div className="px-2 mb-2 text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">QUICK ACTIONS</div>
                <div className="space-y-0.5">
                  <Link to="/events/create" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-xs font-medium">
                    <Sparkles size={14} className="text-amber-500" />
                    Create Event
                  </Link>
                  <Link to="/communities/create" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-xs font-medium">
                    <Award size={14} className="text-emerald-500" />
                    New Community
                  </Link>
                  <Link to="/analytics" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-xs font-medium">
                    <TrendingUp size={14} className="text-purple-500" />
                    View Analytics
                  </Link>
                </div>
              </div>
            )}

            {/* Activity Status */}
            {(!collapsed || mobileOpen) && (
              <div className="pt-4 mt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 px-2 py-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-medium text-slate-400">System Online</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-3 py-4 border-t border-slate-100 shrink-0">
            <button
              onClick={handleLogout}
              className={`
                group w-full flex items-center gap-3 rounded-lg py-2.5 transition-all duration-200 font-medium
                ${collapsed && !mobileOpen ? 'justify-center px-0' : 'px-3'}
                text-slate-500 hover:bg-rose-50 hover:text-rose-600
              `}
            >
              <LogOut size={16} className={`shrink-0 transition-transform ${collapsed && !mobileOpen ? '' : 'group-hover:translate-x-0.5'}`} />
              {(!collapsed || mobileOpen) && (
                <span className="text-[12px] tracking-tight">Sign Out</span>
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && !mobileOpen && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-rose-600 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-xl">
                  Sign Out
                </div>
              )}
            </button>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className={`flex-1 transition-all duration-300 ease-in-out ${collapsed ? 'md:ml-[80px]' : 'md:ml-[280px]'}`}>
            <div className="p-4 md:p-6 lg:p-8 relative z-10">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Menu Trigger Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-[190] flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 transition-all active:scale-95 hover:shadow-xl"
      >
        <Menu size={20} />
      </button>

      {/* Scrollbar Styling */}
      <style>{`
        .custom-sidebar-scroll::-webkit-scrollbar { width: 0px; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .animation-delay-2000 { animation-delay: 2s; }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}