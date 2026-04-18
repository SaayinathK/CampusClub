import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

// ─── Nav config per role ──────────────────────────────────────────────────────
const NAV = {
  admin: [
    { to: '/admin',               label: 'Dashboard',    icon: '▦' },
    { to: '/admin/users',         label: 'Users',        icon: '👤' },
    { to: '/admin/communities',   label: 'Communities',  icon: '🏛️' },
    { to: '/admin/events',        label: 'Events',       icon: '📅' },
  ],
  community_admin: [
    { to: '/community-admin',              label: 'Dashboard',     icon: '▦' },
    { to: '/community-admin/members',      label: 'Members',       icon: '👥' },
    { to: '/community-admin/events',       label: 'Events',        icon: '📅' },
    { to: '/community-admin/profile',      label: 'Profile',       icon: '⚙︎' },
  ],
};

const ROLE_LABEL = {
  admin: 'System Admin',
  community_admin: 'Community Admin',
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
    <div className="flex min-h-screen pt-[104px] bg-slate-50 font-sans">
      
      {/* Dynamic Background Effects (optional bleed over from pages) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-[-120px] w-[520px] h-[520px] bg-blue-400/18 rounded-full mix-blend-multiply filter blur-[150px] animate-blob" />
        <div className="absolute bottom-[-160px] right-[-120px] w-[620px] h-[620px] bg-indigo-400/14 rounded-full mix-blend-multiply filter blur-[160px] animate-blob animation-delay-2000" />
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
        className={`fixed top-[104px] left-0 bottom-0 z-[201] flex flex-col bg-white/85 backdrop-blur-2xl border-r border-slate-200 transition-all duration-300 ease-in-out shadow-sm ${collapsed ? 'w-20' : 'w-[264px]'} max-md:${mobileOpen ? 'translate-x-0 w-[264px]' : '-translate-x-full'}`}
      >
        {/* Brand */}
        <div className={`px-4 pt-5 pb-4 border-b border-slate-200 ${collapsed && !mobileOpen ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center gap-3 ${collapsed && !mobileOpen ? 'justify-center' : ''}`}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/15 border border-blue-600/20">
              <span className="text-white font-black text-lg tracking-tight">C</span>
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="leading-tight min-w-0">
                <div className="text-[11px] font-black uppercase tracking-[0.26em] text-blue-600">Campus Club</div>
                <div className="text-xs text-slate-500 font-semibold truncate">{ROLE_LABEL[user?.role] || 'Dashboard'}</div>
              </div>
            )}
          </div>
        </div>

        {/* Collapse toggle (Desktop only) */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className={`hidden md:flex items-center px-3 py-2.5 text-slate-500 hover:text-slate-900 transition-colors border-b border-slate-200 bg-slate-50/70 hover:bg-slate-100 ${collapsed ? 'justify-center' : 'justify-end'}`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all text-[10px] font-black shadow-sm text-slate-600">
             {collapsed ? '❯' : '❮'}
          </div>
        </button>

        {/* Notification Bell — always visible */}
        <div className={`px-4 py-3 border-b border-slate-200 flex ${collapsed && !mobileOpen ? 'justify-center' : 'justify-between'} items-center`}>
          {(!collapsed || mobileOpen) && (
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Updates</div>
          )}
          <NotificationBell />
        </div>

        {/* Role badge */}
        {(!collapsed || mobileOpen) && (
          <>
            <div className="px-4 py-4 relative">
              <div className="text-[9px] font-black uppercase tracking-[0.28em] mb-2 flex items-center gap-2 text-blue-600">
                <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor] animate-pulse" />
                {ROLE_LABEL[user?.role] || 'User'}
              </div>

              <div className="text-slate-900 font-black text-lg truncate tracking-tight mb-1">
                {user?.name}
              </div>

              {user?.role === 'community_admin' && user?.managedCommunity && (
                <div className="text-xs text-slate-600 font-semibold truncate flex items-center gap-2 bg-slate-100 border border-slate-200 py-1 px-2.5 rounded-lg w-max mt-2">
                  <span className="opacity-50">🏛️</span> {user.managedCommunity.name}
                </div>
              )}
            </div>
          </>
        )}

        {/* Nav Items (Custom Scrollbar Hide) */}
        <nav className="flex-1 py-5 overflow-y-auto overflow-x-hidden space-y-1.5 px-3.5 relative z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/community-admin'}
              className={({ isActive }) => `
                group flex items-center gap-3.5 rounded-xl transition-all duration-300 relative
                ${collapsed && !mobileOpen ? 'justify-center p-3.5 text-center' : 'justify-start px-4 py-3'}
                ${isActive 
                  ? 'bg-blue-50 text-blue-800 border border-blue-200 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'}
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-1.5 bg-blue-600 rounded-r-full" />}
                  <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'opacity-80 group-hover:scale-110 group-hover:opacity-100 group-hover:-rotate-3'}`}>
                    {item.icon}
                  </span>
                  {(!collapsed || mobileOpen) && (
                    <span className={`font-black tracking-[0.18em] uppercase text-[11px] -mt-0.5 truncate ${isActive ? 'text-blue-800' : ''}`}>
                      {item.label}
                    </span>
                  )}
                  {(collapsed && !mobileOpen) && (
                    <span className="absolute left-[calc(100%+12px)] bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap z-[300] opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-xl translate-x-1 group-hover:translate-x-0">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Secondary links */}
        <div className={`px-3.5 pb-4 ${collapsed && !mobileOpen ? 'space-y-2' : 'space-y-2'} border-t border-slate-200 pt-4 bg-slate-50/50`}>
          <a
            href="mailto:support@campusclub.local"
            className={`group flex items-center gap-3 rounded-xl border border-transparent hover:border-slate-200 hover:bg-white transition-all text-slate-600 hover:text-slate-900 ${collapsed && !mobileOpen ? 'justify-center p-3.5' : 'px-4 py-3'}`}
            title="Contact support"
          >
            <span className="text-xl opacity-80 group-hover:opacity-100">✉️</span>
            {(!collapsed || mobileOpen) && (
              <span className="font-black uppercase tracking-[0.18em] text-[11px]">Support</span>
            )}
          </a>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-slate-200 shrink-0 bg-slate-50">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3.5 rounded-xl transition-all duration-300 relative text-rose-600 hover:text-white hover:bg-rose-600 hover:shadow-md border border-transparent hover:border-rose-600
              ${collapsed && !mobileOpen ? 'justify-center p-3.5' : 'justify-start px-4 py-3'}
            `}
          >
            <span className="text-xl transition-transform duration-300 group-hover:scale-110 opacity-80 group-hover:opacity-100">⏻</span>
            {(!collapsed || mobileOpen) && <span className="font-black uppercase tracking-[0.22em] text-[11px] mt-0.5">Sign Out</span>}
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
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg z-[190] hover:scale-110 active:scale-95 transition-all outline-none border-4 border-slate-50"
      >
        <span className="text-2xl leading-none -mt-0.5">☰</span>
      </button>

      {/* ── Main content wrap ── */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ease-in-out relative z-10 ${collapsed ? 'md:ml-20' : 'md:ml-[264px]'}`}>
        {children}
      </div>

    </div>
  );
}
