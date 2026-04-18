import React from 'react';

const Footer = () => {
    return (
        <footer className="py-12 border-t border-slate-200 bg-white/85 backdrop-blur-xl">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_10px_20px_rgba(14,165,233,0.25)]">
                                <span className="text-white font-bold text-sm">C</span>
                            </div>
                            <span className="text-xl font-bold text-slate-900">ClubSphere</span>
                        </div>
                        <p className="text-slate-600 max-w-xs">The central hub for campus activities, approvals, memberships, and event coordination.</p>
                    </div>

                    <div className="flex gap-8">
                        <a href="#" className="text-slate-500 hover:text-slate-900 transition-colors">Twitter</a>
                        <a href="#" className="text-slate-500 hover:text-slate-900 transition-colors">Instagram</a>
                        <a href="#" className="text-slate-500 hover:text-slate-900 transition-colors">Facebook</a>
                        <a href="#" className="text-slate-500 hover:text-slate-900 transition-colors">LinkedIn</a>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">© 2026 ClubSphere. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="text-slate-500 hover:text-slate-900 text-sm">Privacy Policy</a>
                        <a href="#" className="text-slate-500 hover:text-slate-900 text-sm">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
