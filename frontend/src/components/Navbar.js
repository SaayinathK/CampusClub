import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const ROLE_ROUTES = {
    admin: '/admin',
    community_admin: '/community-admin',
    student: '/student',
};

const ROLE_LABELS = {
    admin: 'Admin',
    community_admin: 'Club Admin',
    student: 'Student',
    external: 'External',
    sliit: 'SLIIT',
};

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const confirmLogout = () => {
        logout();
        setShowLogoutModal(false);
        navigate('/');
    };

    const dashboardRoute = ROLE_ROUTES[user?.role];

    return (
        <>
            <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${isScrolled ? 'py-3' : 'py-5'}`}>
                <div className="container mx-auto px-4 sm:px-6">
                    <div className={`flex items-center justify-between gap-4 rounded-[1.75rem] px-4 sm:px-6 py-3 transition-all duration-500 ${isScrolled ? 'surface-panel border border-slate-200 shadow-2xl shadow-sky-950/10' : 'bg-white/70 backdrop-blur-2xl border border-slate-200'}`}>
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_12px_30px_rgba(14,165,233,0.24)]">
                                <span className="text-white font-black text-lg tracking-tighter">S</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase tracking-[0.35em] text-slate-900 leading-none">
                                    Student Portal
                                </span>
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-8 uppercase font-black text-[10px] tracking-[0.25em] text-slate-600">
                            <Link to="/" className="transition-all duration-300 hover:text-slate-900">Home</Link>
                            <Link to="/events" className="transition-all duration-300 hover:text-slate-900 border-b border-transparent hover:border-cyan-400/50 pb-1">Events</Link>
                            <Link to="/clubs" className="transition-all duration-300 hover:text-slate-900 border-b border-transparent hover:border-cyan-400/50 pb-1">Clubs</Link>

                            <div className="h-4 w-px bg-slate-200 mx-2"></div>

                            {!user ? (
                                <div className="flex items-center gap-4">
                                    <Link to="/signin" className="theme-button-secondary px-6 py-3 text-[10px] font-black uppercase tracking-[0.25em]">
                                        Sign In
                                    </Link>
                                    <Link to="/signup" className="theme-button-primary px-6 py-3 text-[10px] font-black uppercase tracking-[0.25em]">
                                        Register
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-700">
                                    <NotificationBell />
                                    <Link to={dashboardRoute || '/profile'} className="flex items-center gap-3 group relative px-4 py-2 rounded-2xl bg-white border border-slate-200 hover:border-cyan-300/30 transition-all shadow-sm">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-110 transition-transform">
                                            <span className="text-[12px] text-white font-black">{(user.name || user.username || '?')[0].toUpperCase()}</span>
                                        </div>
                                        <div className="flex flex-col items-start leading-none">
                                            <span className="text-cyan-600 text-[8px] font-black tracking-widest uppercase mb-1">{ROLE_LABELS[user.role] || user.role}</span>
                                            <span className="text-slate-900 font-black tracking-widest uppercase text-[10px]">{user.name || user.username}</span>
                                        </div>
                                    </Link>

                                    <button
                                        onClick={() => setShowLogoutModal(true)}
                                        className="group p-2.5 rounded-xl bg-white hover:bg-red-50 text-slate-500 hover:text-rose-500 transition-all border border-slate-200 hover:border-red-200"
                                        title="Sign Out"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button className="lg:hidden text-slate-700 p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Logout Confirmation Modal */}
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
                                    You're signed in as <span className="text-slate-900 font-bold">{user?.name || user?.username}</span>.<br />
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
