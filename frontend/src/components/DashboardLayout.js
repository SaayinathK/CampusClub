import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

// ─── Nav config per role ──────────────────────────────────────────────────────
const NAV = {
  admin: [
    { to: '/admin',               label: 'Dashboard',    icon: '⊞' },
    { to: '/admin/users',         label: 'All Users',    icon: '👤' },
    { to: '/admin/communities',   label: 'Communities',  icon: '🏛️' },
    { to: '/admin/events',        label: 'Events',       icon: '📅' },
  ],
  community_admin: [
    { to: '/community-admin',              label: 'Dashboard',     icon: '⊞' },
    { to: '/community-admin/members',      label: 'Members',       icon: '👥' },
    { to: '/community-admin/events',       label: 'Events',        icon: '📅' },
  ],
};

const ROLE_LABEL = {
  admin: 'System Admin',
  community_admin: 'Community Admin',
};

const ROLE_COLOR = {
  admin: 'text-pink-400',
  community_admin: 'text-purple-400',
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = NAV[user?.role] || [];
  const handleLogout = () => { logout(); navigate('/'); };

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen pt-[104px] bg-[#020617] font-sans">
      
      {/* Dynamic Background Effects (optional bleed over from pages) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full mix-blend-screen filter blur-[150px] animate-blob" />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] md:hidden"
        />
      )}

      {/* ── Sidebar ── */}
      <aside 
        className={`fixed top-[104px] left-0 bottom-0 z-[201] flex flex-col bg-[#0f172a]/90 backdrop-blur-3xl border-r border-white/5 transition-all duration-300 ease-in-out shadow-[10px_0_30px_rgba(0,0,0,0.5)] ${collapsed ? 'w-20' : 'w-[240px]'} max-md:${mobileOpen ? 'translate-x-0 w-[240px]' : '-translate-x-full'}`}
      >
        {/* Collapse toggle (Desktop only) */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className={`hidden md:flex items-center p-3 text-slate-400 hover:text-white transition-colors border-b border-white/5 bg-white/[0.02] hover:bg-white/5 ${collapsed ? 'justify-center' : 'justify-end'}`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <div className="w-7 h-7 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all text-[10px] font-black shadow-inner">
             {collapsed ? '❯' : '❮'}
          </div>
        </button>

        {/* Notification Bell — always visible */}
        <div className={`px-3 py-3 border-b border-white/5 flex ${collapsed && !mobileOpen ? 'justify-center' : 'justify-end'}`}>
          <NotificationBell />
        </div>

        {/* Role badge */}
        {(!collapsed || mobileOpen) && (
          <div className="p-6 border-b border-white/5 shrink-0 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className={`text-[9px] font-black uppercase tracking-widest mb-2 flex items-center gap-2 ${ROLE_COLOR[user?.role] || 'text-cyan-400'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor] animate-pulse" />
              {ROLE_LABEL[user?.role] || 'User'}
            </div>
            <div className="text-white font-black text-xl truncate tracking-tight mb-1 drop-shadow-md">
              {user?.name}
            </div>
            {user?.role === 'community_admin' && user?.managedCommunity && (
              <div className="text-xs text-slate-400 font-medium truncate flex items-center gap-2 bg-black/30 border border-white/5 py-1 px-2.5 rounded-md w-max mt-2">
                <span className="opacity-50">🏛️</span> {user.managedCommunity.name}
              </div>
            )}
          </div>
        )}

        {/* Nav Items (Custom Scrollbar Hide) */}
        <nav className="flex-1 py-5 overflow-y-auto overflow-x-hidden space-y-1.5 px-3 relative z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/community-admin'}
              className={({ isActive }) => `
                group flex items-center gap-3.5 rounded-xl transition-all duration-300 relative
                ${collapsed && !mobileOpen ? 'justify-center p-3.5 text-center' : 'justify-start px-4 py-3'}
                ${isActive 
                  ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-white/10' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-1.5 bg-gradient-to-b from-purple-400 to-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" />}
                  <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'opacity-70 group-hover:scale-110 group-hover:opacity-100 group-hover:-rotate-3'}`}>
                    {item.icon}
                  </span>
                  {(!collapsed || mobileOpen) && (
                    <span className={`font-black tracking-wider uppercase text-xs -mt-0.5 truncate ${isActive ? 'text-white' : ''}`}>
                      {item.label}
                    </span>
                  )}
                  {(collapsed && !mobileOpen) && (
                    <span className="absolute left-[calc(100%+12px)] bg-[#0f172a] border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap z-[300] opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-xl translate-x-1 group-hover:translate-x-0">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/5 shrink-0 bg-black/20">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3.5 rounded-xl transition-all duration-300 relative text-rose-500 hover:text-white hover:bg-rose-500 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] border border-transparent hover:border-rose-500
              ${collapsed && !mobileOpen ? 'justify-center p-3.5' : 'justify-start px-4 py-3'}
            `}
          >
            <span className="text-xl transition-transform duration-300 group-hover:scale-110 opacity-80 group-hover:opacity-100">⏻</span>
            {(!collapsed || mobileOpen) && <span className="font-black uppercase tracking-widest text-[10px] mt-0.5">Sign Out</span>}
            {(collapsed && !mobileOpen) && (
              <span className="absolute left-[calc(100%+12px)] bg-rose-950 border border-rose-500/30 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap z-[300] opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-xl translate-x-1 group-hover:translate-x-0">
                Sign Out
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile menu sticky button (floating) */}
      <button 
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-full flex items-center justify-center text-white shadow-[0_10px_25px_rgba(168,85,247,0.5)] z-[190] hover:scale-110 active:scale-95 transition-all outline-none border-4 border-[#020617]"
      >
        <span className="text-2xl leading-none -mt-0.5">☰</span>
      </button>

      {/* ── Main content wrap ── */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ease-in-out relative z-10 ${collapsed ? 'md:ml-20' : 'md:ml-[240px]'}`}>
        {children}
      </div>

    </div>
  );
}
