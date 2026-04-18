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
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl glass-dark border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                        
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-1">
                                    {eventTitle} <span className="text-blue-400">Feedbacks</span>
                                </h2>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                    <MessageSquare size={12} className="text-blue-500" />
                                    Community Impressions
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-95"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                            {loading ? (
                                <div className="py-20 text-center">
                                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Loading Feedbacks...</p>
                                </div>
                            ) : feedbacks.length === 0 ? (
                                <div className="py-20 text-center">
                                    <MessageSquare size={48} className="text-gray-700 mx-auto mb-4" />
                                    <p className="text-gray-500 uppercase text-xs font-black italic">No feedbacks shared for this event yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {feedbacks.map((f, i) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            key={i}
                                            className="p-6 rounded-2xl glass border border-white/5 relative overflow-hidden group"
                                        >
                                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                                                        <span className="text-[10px] font-black">{f.username?.[0] || 'A'}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-black uppercase text-white">{f.username || 'Anonymous'}</h4>
                                                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Student Peer</p>
                                                    </div>
                                                </div>
                                                <div className="flex text-yellow-500 gap-0.5">
                                                    {[...Array(5)].map((_, j) => (
                                                        <Star key={j} size={10} className={j < f.rating ? 'fill-current' : 'text-gray-800'} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-300 uppercase leading-loose font-bold pl-2 border-l border-white/5 ml-4">
                                                {f.comment}
                                            </p>
                                            <div className="mt-4 flex justify-end">
                                                <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest italic">
                                                    {new Date(f.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 text-center">
                            <button
                                onClick={onClose}
                                className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
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
