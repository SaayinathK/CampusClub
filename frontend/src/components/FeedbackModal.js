import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Star } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose, eventId, eventTitle }) => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && eventId) {
            const fetchFeedbacks = async () => {
                setLoading(true);
                try {
                    const res = await fetch(`http://localhost:5001/api/feedback/${eventId}`);
                    const data = await res.json();
                    if (res.ok) {
                        setFeedbacks(data);
                    }
                } catch (err) {
                    console.error('Error fetching feedbacks:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchFeedbacks();
        }
    }, [isOpen, eventId]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                        
                        {/* Header */}
                        <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-white/90 backdrop-blur-xl">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-1">
                                    {eventTitle} <span className="text-blue-700">Feedbacks</span>
                                </h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                    <MessageSquare size={12} className="text-blue-600" />
                                    Community Impressions
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all active:scale-95 border border-slate-200"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 max-h-[60vh] overflow-y-auto">
                            {loading ? (
                                <div className="py-20 text-center">
                                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Loading Feedbacks...</p>
                                </div>
                            ) : feedbacks.length === 0 ? (
                                <div className="py-20 text-center">
                                    <MessageSquare size={48} className="text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500 uppercase text-xs font-black italic">No feedbacks shared for this event yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {feedbacks.map((f, i) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            key={i}
                                            className="p-6 rounded-2xl bg-white border border-slate-200 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-100 text-blue-700">
                                                        <span className="text-[10px] font-black">{f.username?.[0] || 'A'}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-black uppercase text-slate-900">{f.username || 'Anonymous'}</h4>
                                                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Student Peer</p>
                                                    </div>
                                                </div>
                                                <div className="flex text-yellow-500 gap-0.5">
                                                    {[...Array(5)].map((_, j) => (
                                                        <Star key={j} size={10} className={j < f.rating ? 'fill-current' : 'text-slate-200'} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-700 leading-loose font-semibold pl-3 border-l border-slate-200 ml-4">
                                                {f.comment}
                                            </p>
                                            <div className="mt-4 flex justify-end">
                                                <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest italic">
                                                    {new Date(f.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-200 text-center bg-slate-50">
                            <button
                                onClick={onClose}
                                className="px-8 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 border border-slate-200"
                            >
                                Close View
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default FeedbackModal;
