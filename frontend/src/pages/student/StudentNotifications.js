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
    <div className="min-h-screen p-6 md:p-10 font-sans text-slate-900 relative overflow-hidden bg-slate-50">
      {/* Background blobs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-300/30 rounded-full filter blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-300/30 rounded-full filter blur-[150px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10 space-y-6">

        {/* Header */}
        <header className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black mb-1 tracking-tight flex items-center gap-3">
              <span className="text-3xl">🔔</span>
              <span>
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-3 text-sm font-black px-2.5 py-1 rounded-full bg-purple-600 text-white shadow-sm">
                    {unreadCount} new
                  </span>
                )}
              </span>
            </h1>
            <p className="text-slate-500 text-sm font-medium">Stay on top of your campus activity</p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="px-4 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 font-black text-xs uppercase tracking-widest hover:bg-purple-100 transition-colors"
              >
                Mark All Read
              </button>
            )}
            <Link to="/student" className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 font-bold text-sm text-slate-700 border border-slate-200 shadow-sm transition-all">
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
                    ? 'bg-purple-50 border-purple-200 text-purple-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {f.label}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                    filter === f.value ? 'bg-purple-200 text-purple-800' : 'bg-slate-100 text-slate-500'
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
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <span className="text-purple-600 text-sm font-bold uppercase tracking-widest animate-pulse">Loading...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm text-slate-900">
            <div className="text-6xl mb-4">🔕</div>
            <h3 className="text-xl font-black mb-2">
              {filter === 'unread' ? 'All caught up!' : 'No notifications'}
            </h3>
            <p className="text-slate-500 text-sm">
              {filter === 'unread'
                ? 'You have no unread notifications.'
                : `No ${filter === 'all' ? '' : filter.replace(/_/g, ' ')} notifications yet.`}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-sm">
            {filtered.map(n => {
              const cfg = TYPE_CONFIG[n.type] || { icon: '📌', label: n.type, color: 'slate' };
              return (
                <button
                  key={n._id}
                  onClick={() => !n.read && markRead(n._id)}
                  className={`w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors flex gap-4 items-start group ${
                    !n.read ? 'bg-purple-50' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 bg-${cfg.color}-50 border border-${cfg.color}-200 group-hover:scale-105 transition-transform`}>
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className={`text-sm font-black leading-tight ${!n.read ? 'text-slate-900' : 'text-slate-600'}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-purple-600 mt-1.5 shadow-sm" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-2">{n.message}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-${cfg.color}-50 text-${cfg.color}-700 border-${cfg.color}-200`}>
                        {cfg.label}
                      </span>
                      <span className="text-[10px] text-slate-400">{fmt(n.createdAt)}</span>
                      {n.event && (
                        <Link
                          to={`/events/${n.event._id || n.event}`}
                          onClick={e => e.stopPropagation()}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest"
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
