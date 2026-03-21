import React from 'react';

const Hero = () => {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background Blobs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <div className="inline-block mb-4 px-4 py-1 rounded-full glass-dark text-blue-400 text-sm font-medium border border-blue-500/20">
                    ✨ The Ultimate Campus Experience
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                    Manage Your Campus <br />
                    <span className="text-gradient">Events with Precision</span>
                </h1>
                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                    From workshops to fest - organize, promote and track campus events flawlessly. Join Club Hub and elevate your campus community.
                </p>

                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                    <button className="w-full md:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all shadow-xl shadow-blue-500/30 active:scale-95">
                        Discover Events
                    </button>
                    <button className="w-full md:w-auto px-8 py-4 rounded-xl glass hover:bg-white/10 text-white font-bold text-lg transition-all active:scale-95">
                        Create Event
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
                    <div>
                        <div className="text-3xl font-bold">50+</div>
                        <div className="text-gray-500 text-sm">Active Clubs</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold">500+</div>
                        <div className="text-gray-500 text-sm">Monthly Events</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold">10k+</div>
                        <div className="text-gray-500 text-sm">Total Students</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold">4.9/5</div>
                        <div className="text-gray-500 text-sm">User Rating</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
