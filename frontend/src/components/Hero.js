import React from 'react';

const Hero = () => {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 bg-slate-50">
            {/* Background Blobs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-xl text-blue-700 text-xs font-black uppercase tracking-widest border border-slate-200 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.45)]" />
                    Community platform
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                    COMMUNITY <span className="gradient-text">DASHBOARD</span>
                    <br />
                    <span className="text-slate-900">Manage events with precision</span>
                </h1>
                <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                    A unified hub for clubs and events. Publish events, manage memberships, track registrations, and keep students informed — all in one clean portal.
                </p>

                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                    <button className="w-full md:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95 uppercase tracking-widest">
                        Discover Events
                    </button>
                    <button className="w-full md:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-black text-sm transition-all active:scale-95 uppercase tracking-widest border border-slate-200 shadow-sm">
                        Create Event
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
                    <div>
                        <div className="text-3xl font-black text-slate-900">50+</div>
                        <div className="text-slate-500 text-sm font-semibold">Active Clubs</div>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-slate-900">500+</div>
                        <div className="text-slate-500 text-sm font-semibold">Monthly Events</div>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-slate-900">10k+</div>
                        <div className="text-slate-500 text-sm font-semibold">Total Students</div>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-slate-900">4.9/5</div>
                        <div className="text-slate-500 text-sm font-semibold">User Rating</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
