import React from 'react';

const Footer = () => {
    return (
        <footer className="py-12 border-t border-gray-200 bg-white">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                                <span className="text-white font-bold text-sm">C</span>
                            </div>
                            <span className="text-xl font-bold text-slate-900">Club Hub</span>
                        </div>
                        <p className="text-gray-500 max-w-xs">The central hub for all campus activities and student organizations.</p>
                    </div>

                    <div className="flex gap-8">
                        <a href="#" className="text-slate-500 hover:text-slate-900 transition-colors">Twitter</a>
                        <a href="#" className="text-slate-500 hover:text-slate-900 transition-colors">Instagram</a>
                        <a href="#" className="text-slate-500 hover:text-slate-900 transition-colors">Facebook</a>
                        <a href="#" className="text-slate-500 hover:text-slate-900 transition-colors">LinkedIn</a>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">© 2026 Club Hub. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="text-gray-500 hover:text-slate-900 text-sm">Privacy Policy</a>
                        <a href="#" className="text-gray-500 hover:text-slate-900 text-sm">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
