import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BellRing, ChevronDown, ChevronLeft, Crown, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ROLE_ROUTES = {
    admin: '/admin',
    community_admin: '/community-admin',
    student: '/student',
};

const NOTIFICATION_ROUTES = {
    admin: '/admin/notifications',
    community_admin: '/community-admin/notifications',
    student: '/student/notifications',
};

const ROLE_BADGES = {
    admin: 'SYSTEM ADMIN',
    community_admin: 'COMMUNITY ADMIN',
    student: 'STUDENT',
    external: 'EXTERNAL',
    sliit: 'SLIIT',
};

const NAV_ITEMS_BY_ROLE = {
    admin: [
        { label: 'HOME', to: '/' },
        { label: 'USERS', to: '/admin/users' },
        { label: 'EVENTS', to: '/admin/events' },
    ],
    community_admin: [
        { label: 'HOME', to: '/' },
        { label: 'MEMBERS', to: '/community-admin/members' },
        { label: 'EVENTS', to: '/community-admin/events' },
    ],
    student: [
        { label: 'HOME', to: '/' },
        { label: 'DASHBOARD', to: '/student' },
        { label: 'EVENTS', to: '/events' },
        { label: 'CLUBS', to: '/clubs' },
    ],
    default: [
        { label: 'HOME', to: '/' },
        { label: 'EVENTS', to: '/events' },
        { label: 'CLUBS', to: '/clubs' },
    ],
};

const SEARCH_ITEMS_BY_ROLE = {
    admin: [
        { label: 'Dashboard', to: '/admin', keywords: ['home', 'admin', 'dashboard', 'overview'] },
        { label: 'Users', to: '/admin/users', keywords: ['user', 'accounts', 'members'] },
        { label: 'Communities', to: '/admin/communities', keywords: ['clubs', 'communities', 'groups'] },
        { label: 'Events', to: '/admin/events', keywords: ['event', 'calendar'] },
        { label: 'Notifications', to: '/admin/notifications', keywords: ['notification', 'alerts', 'bell'] },
    ],
    community_admin: [
        { label: 'Dashboard', to: '/community-admin', keywords: ['home', 'dashboard', 'community'] },
        { label: 'Members', to: '/community-admin/members', keywords: ['member', 'users'] },
        { label: 'Events', to: '/community-admin/events', keywords: ['event', 'calendar'] },
        { label: 'Notifications', to: '/community-admin/notifications', keywords: ['notification', 'alerts', 'bell'] },
    ],
    student: [
        { label: 'Dashboard', to: '/student', keywords: ['home', 'dashboard'] },
        { label: 'Events', to: '/events', keywords: ['event', 'calendar'] },
        { label: 'Clubs', to: '/clubs', keywords: ['club', 'community'] },
        { label: 'Profile', to: '/student/profile', keywords: ['profile', 'account'] },
        { label: 'Registrations', to: '/student/registrations', keywords: ['registration', 'tickets'] },
        { label: 'Notifications', to: '/student/notifications', keywords: ['notification', 'alerts', 'bell'] },
    ],
    default: [
        { label: 'Home', to: '/', keywords: ['home'] },
        { label: 'Events', to: '/events', keywords: ['event', 'calendar'] },
        { label: 'Clubs', to: '/clubs', keywords: ['club', 'community'] },
    ],
};

const getInitial = (value) => {
    const text = value || '?';
    return text.charAt(0).toUpperCase();
};

const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const confirmLogout = () => {
        logout();
        setShowUserMenu(false);
        setShowLogoutModal(false);
        navigate('/');
    };

    const dashboardRoute = ROLE_ROUTES[user?.role];
    const profileName = user?.name || user?.username || 'admin';
    const profileRole = ROLE_BADGES[user?.role] || (user?.role || 'USER').toUpperCase();
    const navItems = NAV_ITEMS_BY_ROLE[user?.role] || NAV_ITEMS_BY_ROLE.default;
    const notificationTarget = user ? (NOTIFICATION_ROUTES[user.role] || '/student/notifications') : '/signin';
    const searchItems = SEARCH_ITEMS_BY_ROLE[user?.role] || SEARCH_ITEMS_BY_ROLE.default;

    const filteredSearchItems = searchQuery.trim()
        ? searchItems
            .filter((item) => {
                const q = searchQuery.trim().toLowerCase();
                if (item.label.toLowerCase().includes(q)) return true;
                return item.keywords.some((k) => k.includes(q));
            })
            .slice(0, 6)
        : [];

    const runSearch = useCallback((query) => {
        const q = (query || '').trim().toLowerCase();
        if (!q) return;

        const bestMatch = searchItems.find((item) => {
            if (item.label.toLowerCase().includes(q)) return true;
            return item.keywords.some((k) => k.includes(q));
        });

        if (bestMatch) {
            navigate(bestMatch.to);
            setSearchQuery('');
            setShowSearchSuggestions(false);
        }
    }, [navigate, searchItems]);

    const onSearchSubmit = (e) => {
        e.preventDefault();
        runSearch(searchQuery);
    };

    const fetchUnreadCount = useCallback(async () => {
        if (!user) {
            setUnreadCount(0);
            return;
        }
        try {
            const res = await api.get('/notifications');
            setUnreadCount(res.data?.unreadCount || 0);
        } catch {
            setUnreadCount(0);
        }
    }, [user]);

    useEffect(() => {
        fetchUnreadCount();
        if (!user) return;
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount, user]);

    return (
        <>
            <nav className="fixed inset-x-0 top-0 z-50 h-24 bg-[#f4f6f8]/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_4px_14px_rgba(15,23,42,0.08)]">
                <div className="mx-auto h-full max-w-[1920px] px-4">
                    <div className="flex h-full items-center justify-between gap-4">
                        <div className="flex items-center gap-3 shrink-0 min-w-[240px]">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/45 to-cyan-500/45 blur-md" />
                                <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white shadow-lg">
                                    <Crown size={16} className="text-yellow-300" />
                                </div>
                            </div>
                            <div className="leading-none">
                                <p className="text-[22px] font-black text-slate-800 tracking-tight">CAMPUS CLUB</p>
                                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-600 mt-1">Management Portal</p>
                            </div>
                        </div>

                        <nav className="hidden xl:flex items-center gap-1 rounded-full border border-slate-200 bg-white/70 px-1.5 py-1 shadow-inner">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    to={item.to}
                                    className="rounded-full px-4 py-1.5 text-[14px] font-semibold uppercase tracking-[0.04em] text-slate-600 hover:bg-white hover:text-slate-900 transition-all"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center justify-end gap-2.5 shrink-0 min-w-[430px]">
                            <div className="hidden lg:block relative w-[320px]">
                                <form onSubmit={onSearchSubmit} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/75 px-3 py-2 shadow-sm">
                                    <Search size={16} className="text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setShowSearchSuggestions(true);
                                        }}
                                        onFocus={() => setShowSearchSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 120)}
                                        placeholder="Search pages..."
                                        className="w-full bg-transparent text-[14px] text-slate-600 placeholder:text-slate-400 focus:outline-none"
                                    />
                                    <span className="hidden xl:inline text-[13px] text-slate-400 font-mono">Enter</span>
                                </form>

                                {showSearchSuggestions && filteredSearchItems.length > 0 && (
                                    <div className="absolute top-[calc(100%+8px)] left-0 right-0 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden z-[70]">
                                        {filteredSearchItems.map((item) => (
                                            <button
                                                key={item.to}
                                                type="button"
                                                onClick={() => runSearch(item.label)}
                                                className="w-full px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {user ? (
                                <>
                                    <Link
                                        to={notificationTarget}
                                        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
                                        title="Notifications"
                                    >
                                        <BellRing size={16} />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-blue-500 text-white text-[8px] font-bold flex items-center justify-center shadow-md">
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </span>
                                        )}
                                    </Link>

                                    <div className="relative">
                                        <button
                                            onClick={() => setShowUserMenu((v) => !v)}
                                            className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white/85 py-1.5 pl-1.5 pr-2.5 shadow-sm hover:bg-white transition-all"
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-black text-[13px] shadow-md">
                                                {getInitial(profileName)}
                                            </div>
                                            <div className="text-left leading-tight">
                                                <p className="text-[8px] font-black uppercase tracking-[0.08em] text-blue-600">{profileRole}</p>
                                                <p className="text-[11px] font-semibold text-slate-700">{profileName}</p>
                                            </div>
                                            <ChevronDown size={13} className="text-slate-400" />
                                        </button>

                                        {showUserMenu && (
                                            <div className="absolute right-0 mt-2 w-36 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                                                <Link
                                                    to={dashboardRoute || '/profile'}
                                                    onClick={() => setShowUserMenu(false)}
                                                    className="block px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                                                >
                                                    Open Dashboard
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setShowUserMenu(false);
                                                        setShowLogoutModal(true);
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50"
                                                >
                                                    Sign Out
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => navigate(dashboardRoute || '/')}
                                        className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100/80 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-all"
                                        title="Go to Dashboard"
                                    >
                                        <ChevronLeft size={15} />
                                    </button>
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link to="/signin" className="px-3.5 py-2 rounded-full border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all">
                                        Sign In
                                    </Link>
                                    <Link to="/signup" className="px-3.5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold shadow-md hover:opacity-95 transition-all">
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>

                        <button className="xl:hidden text-slate-700 p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)} />
                    <div className="relative bg-white border border-slate-200 rounded-3xl p-8 w-full max-w-sm mx-4 shadow-2xl shadow-slate-200/70 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm mb-2">Sign Out?</h3>
                                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                    You're signed in as <span className="text-slate-900 font-bold">{profileName}</span>.<br />
                                    Are you sure you want to sign out?
                                </p>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 font-black uppercase text-[10px] tracking-widest transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="flex-1 py-3 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 hover:text-red-700 font-black uppercase text-[10px] tracking-widest transition-all active:scale-95"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
