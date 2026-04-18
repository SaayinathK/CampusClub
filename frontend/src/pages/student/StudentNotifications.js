import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Users,
  Mail,
  Gift,
  Sparkles,
  Filter,
  Trash2,
  Eye,
  EyeOff,
  ChevronRight,
  Star,
  Zap
} from 'lucide-react';

const TYPE_CONFIG = {
  event_published: { icon: Calendar, label: 'New Event', color: 'blue', gradient: 'from-blue-500 to-cyan-500' },
  event_reminder: { icon: Clock, label: 'Event Reminder', color: 'amber', gradient: 'from-amber-500 to-orange-500' },
  event_rejected: { icon: XCircle, label: 'Event Rejected', color: 'rose', gradient: 'from-rose-500 to-pink-500' },
  event_cancelled: { icon: XCircle, label: 'Event Cancelled', color: 'rose', gradient: 'from-rose-500 to-pink-500' },
  registration_confirmed: { icon: CheckCircle, label: 'Registration Confirmed', color: 'emerald', gradient: 'from-emerald-500 to-teal-500' },
  registration_closing: { icon: Clock, label: 'Registration Closing', color: 'yellow', gradient: 'from-yellow-500 to-amber-500' },
  account_approved: { icon: Users, label: 'Account Approved', color: 'blue', gradient: 'from-blue-500 to-indigo-500' },
  account_rejected: { icon: XCircle, label: 'Account Rejected', color: 'rose', gradient: 'from-rose-500 to-pink-500' },
  receipt_verified: { icon: CheckCircle, label: 'Receipt Verified', color: 'emerald', gradient: 'from-emerald-500 to-teal-500' },
  receipt_rejected: { icon: XCircle, label: 'Receipt Rejected', color: 'rose', gradient: 'from-rose-500 to-pink-500' },
};

const COLOR_CLASSES = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  amber: 'bg-amber-50 border-amber-200 text-amber-700',
  rose: 'bg-rose-50 border-rose-200 text-rose-700',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  slate: 'bg-slate-50 border-slate-200 text-slate-700',
};

const FILTERS = [
  { value: 'all', label: 'All', icon: Bell },
  { value: 'unread', label: 'Unread', icon: Eye },
  { value: 'event_published', label: 'New Events', icon: Calendar },
  { value: 'event_reminder', label: 'Reminders', icon: Clock },
  { value: 'registration_confirmed', label: 'Registrations', icon: CheckCircle },
  { value: 'registration_closing', label: 'Closing Soon', icon: Clock },
  { value: 'event_cancelled', label: 'Cancelled', icon: XCircle },
  { value: 'account_approved', label: 'Approvals', icon: Users },
  { value: 'receipt_verified', label: 'Receipts', icon: Mail },
];

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '';

export default function StudentNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [viewMode, setViewMode] = useState('list');

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
      toast.success('Marked as read');
    } catch {
      toast.error('Failed to update notification');
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all read');
    }
  };

  const clearRead = async () => {
    try {
      await api.delete('/notifications/read-all');
      setNotifications(prev => prev.filter(n => !n.read));
      toast.success('Read notifications cleared');
    } catch {
      toast.error('Failed to clear read notifications');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const countFor = (f) => {
    if (f === 'all') return notifications.length;
    if (f === 'unread') return unreadCount;
    return notifications.filter(n => n.type === f).length;
  };

  const totalCount = notifications.length;
  const dashboardByRole = {
    admin: '/admin',
    community_admin: '/community-admin',
    student: '/student',
  };
  const dashboardRoute = dashboardByRole[user?.role] || '/';
  const roleLabelByRole = {
    admin: 'Admin',
    community_admin: 'Community Admin',
    student: 'Student',
  };
  const roleLabel = roleLabelByRole[user?.role] || 'Campus';

  return (
    <div className="min-h-screen px-6 pb-6 pt-28 md:px-10 md:pb-10 md:pt-32 font-sans bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 overflow-hidden">
      
      {/* Premium Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -right-40 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/20 via-cyan-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-400/15 via-blue-400/15 to-indigo-400/15 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-gradient-to-r from-transparent via-blue-100/10 to-transparent rotate-12 blur-2xl" />
        
        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0
            }}
            animate={{
              y: [null, -50, 50, -50],
              x: [null, 30, -30, 30],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 7,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      <div className="max-w-5xl mx-auto relative z-10 space-y-6">
        {/* Premium Header */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl p-8 md:p-10 bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-cyan-400/5" />
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-md opacity-60 animate-pulse" />
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                    <Bell size={28} className="text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                    Notifications
                  </h1>
                  <p className="text-slate-500 text-sm font-medium mt-1">Stay updated with your {roleLabel.toLowerCase()} activities</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <motion.div 
                  className="px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                    Total: {totalCount}
                  </span>
                </motion.div>
                {unreadCount > 0 && (
                  <motion.div 
                    className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                      Unread: {unreadCount}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-white/50 text-slate-500'}`}
                >
                  <Eye size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'bg-white/50 text-slate-500'}`}
                >
                  <Sparkles size={18} />
                </motion.button>
              </div>
              
              {unreadCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={markAllRead}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all"
                >
                  Mark All Read
                </motion.button>
              )}
              
              {notifications.some(n => n.read) && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearRead}
                  className="px-5 py-2.5 rounded-xl bg-white/50 backdrop-blur-sm border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all"
                >
                  Clear Read
                </motion.button>
              )}
              
              <Link to={dashboardRoute}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 rounded-xl bg-white/50 backdrop-blur-sm border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all"
                >
                  ← {roleLabel} Dashboard
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.header>

        {/* Premium Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => {
              const count = countFor(f.value);
              const Icon = f.icon;
              const isActive = filter === f.value;
              return (
                <motion.button
                  key={f.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(f.value)}
                  className={`
                    relative px-4 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-white/50 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-white/80'
                    }
                  `}
                >
                  <Icon size={14} />
                  {f.label}
                  {count > 0 && (
                    <span className={`
                      px-1.5 py-0.5 rounded-full text-[9px] font-black
                      ${isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}
                    `}>
                      {count}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Notifications Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[50vh] gap-6"
            >
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Bell size={24} className="text-blue-600 animate-pulse" />
                </div>
              </div>
              <span className="text-blue-600 text-sm font-bold uppercase tracking-wider animate-pulse">
                Loading notifications...
              </span>
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative rounded-3xl p-16 text-center bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-cyan-50/30 rounded-3xl" />
              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-7xl mb-6"
                >
                  🔔
                </motion.div>
                <h3 className="text-2xl font-black mb-3 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
                </h3>
                <p className="text-slate-500 text-sm">
                  {filter === 'unread'
                    ? "You've read all your notifications. Great job staying organized!"
                    : `No ${filter === 'all' ? '' : filter.replace(/_/g, ' ')} notifications at the moment.`}
                </p>
                {filter !== 'all' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilter('all')}
                    className="mt-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold"
                  >
                    View all notifications
                  </motion.button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}
            >
              <AnimatePresence>
                {filtered.map((n, idx) => {
                  const cfg = TYPE_CONFIG[n.type] || { icon: Bell, label: n.type, color: 'slate', gradient: 'from-slate-500 to-slate-600' };
                  const Icon = cfg.icon;
                  const colorClasses = COLOR_CLASSES[cfg.color] || COLOR_CLASSES.slate;
                  
                  return (
                    <motion.div
                      key={n._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: viewMode === 'grid' ? 1.02 : 1.01, y: -2 }}
                      className={`
                        relative group rounded-2xl border transition-all duration-300 overflow-hidden
                        ${!n.read 
                          ? 'bg-gradient-to-br from-blue-50/90 to-cyan-50/90 border-blue-200/60 shadow-xl' 
                          : 'bg-white/80 backdrop-blur-sm border-slate-200/60 hover:shadow-lg'
                        }
                      `}
                    >
                      {/* Premium gradient border */}
                      {!n.read && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                      )}
                      
                      <div className="p-6">
                        <div className="flex gap-4">
                          {/* Icon with premium animation */}
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-r ${cfg.gradient} shadow-lg`}
                          >
                            <Icon size={24} className="text-white" />
                            {!n.read && (
                              <motion.div
                                className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              />
                            )}
                          </motion.div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div>
                                <p className={`text-sm font-black leading-tight ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                                  {n.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r ${cfg.gradient} text-white`}>
                                    {cfg.label}
                                  </span>
                                  <span className="text-[9px] text-slate-400">{fmt(n.createdAt)}</span>
                                </div>
                              </div>
                              
                              {!n.read && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => markRead(n._id)}
                                  className="shrink-0 text-[9px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
                                >
                                  Mark read
                                </motion.button>
                              )}
                            </div>
                            
                            <p className="text-xs text-slate-600 leading-relaxed mb-3">{n.message}</p>
                            
                            <div className="flex items-center gap-3 flex-wrap">
                              {n.event && (
                                <Link
                                  to={`/events/${n.event._id || n.event}`}
                                  onClick={e => e.stopPropagation()}
                                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider flex items-center gap-1 group"
                                >
                                  View Event 
                                  <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                              )}
                              
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => deleteNotification(n._id)}
                                className="text-[9px] font-bold text-rose-600 hover:text-rose-700 uppercase tracking-wider flex items-center gap-1 ml-auto"
                              >
                                <Trash2 size={10} />
                                Delete
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}