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
  Sparkles,
  Award,
  TrendingUp,
  Zap,
  Globe,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

// ─── Nav config per role ──────────────────────────────────────────────────────
const NAV = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutGrid, desc: 'Overview & analytics', badge: null, color: 'from-blue-500 to-sky-500' },
    { to: '/admin/users', label: 'Users', icon: Users, desc: 'Manage accounts', badge: null, color: 'from-blue-600 to-cyan-500' },
    { to: '/admin/communities', label: 'Communities', icon: Building2, desc: 'Clubs & groups', badge: null, color: 'from-blue-700 to-indigo-500' },
    { to: '/admin/events', label: 'Events', icon: CalendarDays, desc: 'Schedule & manage', badge: '12', color: 'from-sky-500 to-blue-500' },
  ],
  community_admin: [
    { to: '/community-admin', label: 'Dashboard', icon: LayoutGrid, desc: 'Community stats', badge: null, color: 'from-blue-500 to-sky-500' },
    { to: '/community-admin/members', label: 'Members', icon: Users, desc: 'Member management', badge: null, color: 'from-blue-600 to-cyan-500' },
    { to: '/community-admin/events', label: 'Events', icon: CalendarDays, desc: 'Community events', badge: '5', color: 'from-sky-500 to-blue-500' },
  ],
};

const ROLE_LABEL = {
  admin: 'SYSTEM ADMINISTRATOR',
  community_admin: 'COMMUNITY MANAGER',
};

const ROLE_BADGE_COLOR = {
  admin: 'from-blue-600 via-blue-500 to-cyan-600',
  community_admin: 'from-cyan-500 via-blue-500 to-indigo-600',
};

// ─── Sidebar Nav Item Component ────────────────────────────────────────────────
const SidebarNavItem = ({ item, isActive, collapsed, mobileOpen }) => {
  const Icon = item.icon || LayoutGrid;
  return (
    <NavLink
      to={item.to}
      end={item.to === '/admin' || item.to === '/community-admin'}
      className={`
        group relative flex items-center gap-4 rounded-xl transition-all duration-300
        ${collapsed && !mobileOpen ? 'justify-center py-3.5 px-0' : 'px-4 py-3'}
        ${isActive
          ? 'bg-gradient-to-r from-blue-500/15 via-sky-500/10 to-cyan-500/15 text-blue-700 shadow-sm'
          : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 hover:shadow-sm'
        }
      `}
    >
      <div className={`relative transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
        <Icon size={20} className={`shrink-0 transition-all duration-300 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-20 -z-10"
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
      </div>
      
      {(!collapsed || mobileOpen) && (
        <div className="flex-1 flex items-center justify-between">
          <div>
            <span className={`text-[13px] font-semibold tracking-tight ${isActive ? 'text-blue-700' : 'text-slate-700'}`}>
              {item.label}
            </span>
            <p className="text-[9px] text-slate-400 mt-0.5">{item.desc}</p>
          </div>
          {item.badge && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2 py-0.5 text-[9px] font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full shadow-sm"
            >
              {item.badge}
            </motion.span>
          )}
        </div>
      )}

      {/* Premium Tooltip */}
      {collapsed && !mobileOpen && (
        <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-[11px] font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 whitespace-nowrap shadow-xl backdrop-blur-lg bg-opacity-95">
          <div className="flex flex-col">
            <span>{item.label}</span>
            <span className="text-[8px] text-slate-300 font-normal">{item.desc}</span>
          </div>
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45" />
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

  const navItems = NAV[user?.role] || [];
  const roleColor = ROLE_BADGE_COLOR[user?.role] || 'from-blue-600 to-cyan-600';

  const handleLogout = () => { logout(); navigate('/'); };

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const sidebarVariants = {
    expanded: { width: 300, transition: { type: 'spring', stiffness: 400, damping: 35 } },
    collapsed: { width: 88, transition: { type: 'spring', stiffness: 400, damping: 35 } }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 font-sans text-slate-900 overflow-x-hidden">

      {/* ── Premium Animated Background ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -right-40 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/20 via-cyan-400/20 to-sky-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-400/15 via-blue-400/15 to-indigo-400/15 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-transparent via-blue-400/5 to-transparent rotate-45 blur-3xl" />
        
        {/* Animated particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0.3
            }}
            animate={{
              y: [null, -30, 30, -30],
              x: [null, 20, -20, 20],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

      <Navbar />

      {/* Main Flex Container */}
      <div className="flex pt-24">
        {/* Mobile Backdrop */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200] md:hidden"
            />
          )}
        </AnimatePresence>

        {/* ── Premium Sidebar ── */}
        <motion.aside
          initial={false}
          animate={mobileOpen ? { x: 0, width: 300 } : (collapsed ? 'collapsed' : 'expanded')}
          variants={sidebarVariants}
          className={`fixed top-24 bottom-0 left-0 z-[40] flex flex-col bg-white/70 backdrop-blur-xl border-r border-white/40 shadow-2xl transition-transform duration-300 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* User Card Area */}
          {(!collapsed || mobileOpen) && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 pt-4 pb-2 shrink-0"
            >
              <div className="relative rounded-2xl bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-md border border-white/50 p-4 shadow-lg">
                <div className="absolute top-2 right-2">
                  <Zap size={12} className="text-yellow-500" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl blur-md opacity-60" />
                    <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                      <Shield size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-800 leading-tight capitalize">{user?.name?.split(' ')[0] || 'Administrator'}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className={`text-[7px] font-bold bg-gradient-to-r ${roleColor} bg-clip-text text-transparent uppercase tracking-wider`}>
                        {ROLE_LABEL[user?.role] || 'SYSTEM ADMIN'}
                      </div>
                      <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Search Bar inside Sidebar */}
          {(!collapsed || mobileOpen) && (
            <div className="px-4 pt-1 pb-2 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search menu..."
                  className="w-full bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-600 focus:outline-none focus:border-blue-300 focus:bg-white/80 transition-all"
                />
              </div>
            </div>
          )}

          {/* Navigation Wrapper */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 custom-sidebar-scroll">
            <div className={`px-2 text-[9px] font-bold text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text uppercase tracking-[0.2em] ${collapsed && !mobileOpen ? 'text-center' : ''}`}>
              {(!collapsed || mobileOpen) ? 'MAIN MENU' : '⚡'}
            </div>

            <nav className="space-y-1">
              {navItems.map((item, idx) => {
                const isDashboardRoot = item.to === '/admin' || item.to === '/community-admin';
                const isActive = location.pathname === item.to || (!isDashboardRoot && location.pathname.startsWith(`${item.to}/`));
                return (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <SidebarNavItem
                      item={item}
                      isActive={isActive}
                      collapsed={collapsed}
                      mobileOpen={mobileOpen}
                    />
                  </motion.div>
                );
              })}
            </nav>

            {/* Quick Actions Section */}
            {(!collapsed || mobileOpen) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-4 mt-4 border-t border-white/30"
              >
                <div className="px-2 mb-3 text-[9px] font-bold text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text uppercase tracking-[0.2em]">
                  QUICK ACTIONS
                </div>
                <div className="space-y-1">
                  {[
                    { icon: Sparkles, label: 'Create Event', color: 'from-blue-500 to-sky-500', to: '/events/create' },
                    { icon: Award, label: 'New Community', color: 'from-cyan-500 to-blue-500', to: '/communities/create' },
                    { icon: TrendingUp, label: 'View Analytics', color: 'from-indigo-500 to-blue-500', to: '/analytics' },
                    { icon: Globe, label: 'Explore Trends', color: 'from-sky-500 to-cyan-500', to: '/trends' }
                  ].map((action, idx) => (
                    <Link
                      key={idx}
                      to={action.to}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-white/50 transition-all group"
                    >
                      <div className={`p-1.5 rounded-lg bg-gradient-to-r ${action.color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                        <action.icon size={14} className="text-white" />
                      </div>
                      <span className="text-xs font-medium">{action.label}</span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {/* System Status */}
            {(!collapsed || mobileOpen) && (
              <div className="pt-4 mt-4 border-t border-white/30">
                <div className="flex items-center justify-between px-2 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-75" />
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700">System Online</span>
                  </div>
                  <Clock size={12} className="text-emerald-600" />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-3 py-4 border-t border-white/30 shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className={`
                group w-full flex items-center gap-3 rounded-xl py-3 transition-all duration-200 font-medium
                ${collapsed && !mobileOpen ? 'justify-center px-0' : 'px-4'}
                text-slate-500 hover:bg-gradient-to-r hover:from-rose-50 hover:to-orange-50 hover:text-rose-600
              `}
            >
              <LogOut size={18} className={`shrink-0 transition-all duration-300 ${collapsed && !mobileOpen ? '' : 'group-hover:translate-x-1'}`} />
              {(!collapsed || mobileOpen) && (
                <span className="text-[13px] font-semibold tracking-tight">Sign Out</span>
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && !mobileOpen && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-gradient-to-r from-rose-600 to-orange-600 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-xl">
                  Sign Out
                </div>
              )}
            </motion.button>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className={`flex-1 transition-all duration-300 ease-in-out ${collapsed ? 'md:ml-[88px]' : 'md:ml-[300px]'}`}>
            <div className="p-4 md:p-6 lg:p-8 relative z-10">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 12, scale: 0.995 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.995 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Menu Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-[190] flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 text-white shadow-2xl shadow-blue-200 transition-all hover:shadow-xl"
      >
        <Menu size={22} />
      </motion.button>

      {/* Scrollbar Styling */}
      <style>{`
        .custom-sidebar-scroll::-webkit-scrollbar { width: 0px; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: rgba(241, 245, 249, 0.5); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #3b82f6, #06b6d4); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: linear-gradient(135deg, #2563eb, #0891b2); }
        .animation-delay-2000 { animation-delay: 2s; }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
        
        /* Custom gradient text animations */
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradientShift 3s ease infinite;
        }
      `}</style>
    </div>
  );
}