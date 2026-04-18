import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const TYPE_CONFIG = {
  event_published:      { icon: '🚀', label: 'New Event',             color: 'blue' },
  event_reminder:       { icon: '⏰', label: 'Event Reminder',        color: 'amber' },
  event_rejected:       { icon: '❌', label: 'Event Rejected',        color: 'rose' },
  event_cancelled:      { icon: '🚫', label: 'Event Cancelled',       color: 'rose' },
  registration_confirmed:{ icon: '✅', label: 'Registration Confirmed', color: 'emerald' },
  registration_closing: { icon: '⌛', label: 'Registration Closing',  color: 'yellow' },
};

const FILTERS = [
  { value: 'all',    label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'event_published',       label: 'New Events' },
  { value: 'event_reminder',        label: 'Reminders' },
  { value: 'registration_confirmed', label: 'Registrations' },
  { value: 'registration_closing',  label: 'Closing Soon' },
  { value: 'event_cancelled',       label: 'Cancelled' },
];

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed'); }
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

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans text-slate-100 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full mix-blend-screen filter blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full mix-blend-screen filter blur-[150px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10 space-y-6">

        {/* Header */}
        <header className="glass-dark rounded-3xl p-8 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black mb-1 tracking-tight flex items-center gap-3">
              <span className="text-3xl">🔔</span>
              <span>
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-3 text-sm font-black px-2.5 py-1 rounded-full bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.6)]">
                    {unreadCount} new
                  </span>
                )}
              </span>
            </h1>
            <p className="text-slate-400 text-sm font-medium">Stay on top of your campus activity</p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-black text-xs uppercase tracking-widest hover:bg-purple-500/20 transition-colors"
              >
                Mark All Read
              </button>
            )}
            <Link to="/student" className="px-5 py-2.5 rounded-full glass hover:bg-white/10 font-bold text-sm text-white border border-white/10 transition-all">
              ← Dashboard
            </Link>
          </div>
        </header>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => {
            const count = countFor(f.value);
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all border flex items-center gap-2 ${
                  filter === f.value
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                    : 'border-white/10 text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {f.label}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                    filter === f.value ? 'bg-purple-500/40 text-purple-200' : 'bg-white/10 text-slate-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notifications list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] gap-4">
            <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <span className="text-purple-400 text-sm font-bold uppercase tracking-widest animate-pulse">Loading...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-dark rounded-3xl p-16 text-center border border-white/5">
            <div className="text-6xl mb-4">🔕</div>
            <h3 className="text-xl font-black mb-2">
              {filter === 'unread' ? 'All caught up!' : 'No notifications'}
            </h3>
            <p className="text-slate-400 text-sm">
              {filter === 'unread'
                ? 'You have no unread notifications.'
                : `No ${filter === 'all' ? '' : filter.replace(/_/g, ' ')} notifications yet.`}
            </p>
          </div>
        ) : (
          <div className="glass-dark rounded-3xl border border-white/5 overflow-hidden divide-y divide-white/5">
            {filtered.map(n => {
              const cfg = TYPE_CONFIG[n.type] || { icon: '📌', label: n.type, color: 'slate' };
              return (
                <button
                  key={n._id}
                  onClick={() => !n.read && markRead(n._id)}
                  className={`w-full text-left px-6 py-4 hover:bg-white/5 transition-colors flex gap-4 items-start group ${
                    !n.read ? 'bg-purple-500/5' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 bg-${cfg.color}-500/10 border border-${cfg.color}-500/20 group-hover:scale-105 transition-transform`}>
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className={`text-sm font-black leading-tight ${!n.read ? 'text-white' : 'text-slate-300'}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-purple-400 mt-1.5 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-2">{n.message}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-${cfg.color}-500/10 text-${cfg.color}-400 border-${cfg.color}-500/20`}>
                        {cfg.label}
                      </span>
                      <span className="text-[10px] text-slate-600">{fmt(n.createdAt)}</span>
                      {n.event && (
                        <Link
                          to={`/events/${n.event._id || n.event}`}
                          onClick={e => e.stopPropagation()}
                          className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest"
                        >
                          View Event →
                        </Link>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
