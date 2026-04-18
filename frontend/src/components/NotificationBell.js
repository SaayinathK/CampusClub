import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const TYPE_ICON = {
  event_published: '🚀',
  event_reminder:  '⏰',
  event_rejected:  '❌',
  event_cancelled: '🚫',
  registration_confirmed: '✅',
  registration_closing: '⌛',
  account_approved: '✅',
  account_rejected: '⚠️',
  receipt_verified: '🧾',
  receipt_rejected: '🧾',
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [open, setOpen]                   = useState(false);
  const ref = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      // silently fail — bell is non-critical
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(n => n.map(x => ({ ...x, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(n => n.map(x => x._id === id ? { ...x, read: true } : x));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  const handleOpen = () => {
    setOpen(o => !o);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all text-slate-500 hover:text-slate-900"
        title="Notifications"
      >
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(37,99,235,0.35)] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[300] overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
            <span className="text-xs font-black uppercase tracking-widest text-slate-900">Notifications</span>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors"
                >
                  Mark all read
                </button>
              )}
              <Link to="/student/notifications" onClick={() => setOpen(false)} className="text-[10px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors">
                View all
              </Link>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-slate-500">
                <div className="text-3xl mb-2">🔕</div>
                <p className="text-xs font-bold uppercase tracking-widest">All caught up!</p>
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n._id}
                  onClick={() => markRead(n._id)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors flex gap-3 items-start ${!n.read ? 'bg-blue-50' : ''}`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{TYPE_ICON[n.type] || '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`text-xs font-bold truncate ${!n.read ? 'text-slate-900' : 'text-slate-600'}`}>{n.title}</p>
                      {!n.read && <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
