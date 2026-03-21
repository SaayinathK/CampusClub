import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        
        const checkUser = () => {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                } catch (e) {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        window.addEventListener('scroll', handleScroll);
        checkUser();
        
        // Check frequently in case of internal transitions that don't trigger remounts
        const interval = setInterval(checkUser, 1000);
        window.addEventListener('storage', checkUser);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('storage', checkUser);
            clearInterval(interval);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/signin';
    };

    return (
        <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'py-4 glass-dark shadow-2xl border-b border-white/5' : 'py-6 bg-transparent'}`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                            <span className="text-white font-black text-2xl tracking-tighter">C</span>
                        </div>
                        <div className="absolute -inset-1 bg-blue-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 uppercase tracking-tighter leading-none">
                            Club Hub
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500 mt-1.5 opacity-80">
                            The Campus Elite
                        </span>
                    </div>
                </Link>

                <div className="hidden lg:flex items-center gap-10 uppercase font-black text-[10px] tracking-[0.25em] text-gray-400">
                    <Link to="/" className="hover:text-white hover:translate-y-[-1px] transition-all duration-300">Home</Link>
                    <Link to="/events" className="hover:text-white hover:translate-y-[-1px] transition-all duration-300 border-b border-transparent hover:border-blue-500/50 pb-1">Events</Link>
                    <a href="#clubs" className="hover:text-white hover:translate-y-[-1px] transition-all duration-300">Clubs</a>

                    <div className="h-4 w-px bg-white/10 mx-2"></div>

                    {!user ? (
                        <div className="flex items-center gap-4">
                            <Link to="/signin">
                                <button className="px-8 py-3 rounded-2xl glass-dark border border-white/5 hover:bg-white/10 transition-all active:scale-95 text-white font-black uppercase tracking-widest text-[10px]">
                                    Sign In
                                </button>
                            </Link>
                            <Link to="/signup" className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                                <button className="relative px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black transition-all shadow-xl active:scale-95 uppercase tracking-widest text-[10px]">
                                    Register
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-6 animate-in fade-in slide-in-from-right-4 duration-700">
                            <Link to="/profile" className="flex items-center gap-3 group relative px-4 py-2 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                    <span className="text-[12px] text-white font-black">{user.username[0].toUpperCase()}</span>
                                </div>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-blue-400 text-[8px] font-black tracking-widest uppercase mb-1">Authenticated</span>
                                    <span className="text-white font-black tracking-widest uppercase text-[10px]">{user.username}</span>
                                </div>
                            </Link>
                            
                            <button 
                                onClick={handleLogout}
                                className="group p-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
                                title="Exit Dashboard"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button className="lg:hidden text-white p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
