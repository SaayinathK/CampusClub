import React from 'react';

const Hero = () => {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <div className="theme-pill mb-5 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.25em]">
                    ✦ Campus operations made elegant
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
                    Manage your campus <br />
                    <span className="text-gradient">with one premium dashboard</span>
                </h1>
                <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                    Publish events, approve communities, track memberships, and keep every student informed with a cleaner, faster, more professional experience.
                </p>

                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                    <button className="theme-button-primary w-full md:w-auto px-8 py-4 text-lg">
                        Discover Events
                    </button>
                    <button className="theme-button-secondary w-full md:w-auto px-8 py-4 text-lg font-bold">
                        Create Event
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
                    <div>
                        <div className="text-3xl font-bold text-slate-900">50+</div>
                        <div className="text-slate-500 text-sm">Active Clubs</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900">500+</div>
                        <div className="text-slate-500 text-sm">Monthly Events</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900">10k+</div>
                        <div className="text-slate-500 text-sm">Total Students</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900">4.9/5</div>
                        <div className="text-slate-500 text-sm">User Rating</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
