import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const CATEGORY_ICONS = {
  Technology: '💻', Arts: '🎨', Sports: '⚽', Academic: '📚',
  Cultural: '🎭', Business: '💼', Science: '🔬', Social: '🤝', Other: '🌟',
};

function EventCard({ event, badge, badgeColor }) {
  const spotsLeft = event.maxParticipants
    ? event.maxParticipants - (event.participants?.length || 0)
    : null;

  return (
    <Link
      to={`/events/${event._id}`}
      className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-cyan-300/30 hover:bg-slate-50 transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Category icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-${badgeColor}-500/10 border border-${badgeColor}-500/20 group-hover:scale-105 transition-transform`}>
        {CATEGORY_ICONS[event.category] || '📅'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-${badgeColor}-500/10 text-${badgeColor}-400 border-${badgeColor}-500/20`}>
            {badge}
          </span>
          {!event.isFree && (
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
              💳 LKR {event.ticketPrice}
            </span>
          )}
        </div>
        <h4 className="font-bold text-sm text-slate-900 group-hover:text-cyan-600 transition-colors truncate">
          {event.title}
        </h4>
        <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-slate-400 font-medium">
          <span>📅 {fmt(event.startDate)}</span>
          {event.community?.name && <span>🏛️ {event.community.name}</span>}
          {event.venue && <span>📍 {event.venue}</span>}
          {spotsLeft !== null && (
            <span className={spotsLeft <= 5 ? 'text-rose-400 font-bold' : ''}>
              👥 {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
            </span>
          )}
        </div>
      </div>

      <span className="text-slate-500 group-hover:text-slate-700 text-lg shrink-0 transition-colors">›</span>
    </Link>
  );
}

export default function CommunityFeed() {
  const [feed, setFeed] = useState({ upcoming: [], ongoing: [], recentlyCompleted: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await api.get('/communities/feed');
        setFeed(res.data.data || { upcoming: [], ongoing: [], recentlyCompleted: [] });
        // Auto-select tab with content
        const data = res.data.data || {};
        if (data.ongoing?.length) setActiveTab('ongoing');
        else if (data.upcoming?.length) setActiveTab('upcoming');
        else if (data.recentlyCompleted?.length) setActiveTab('recentlyCompleted');
      } catch {
        // silently fail — feed is non-critical
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const total = feed.upcoming.length + feed.ongoing.length + feed.recentlyCompleted.length;

  const tabs = [
    {
      key: 'upcoming',
      label: 'Upcoming',
      icon: '📅',
      color: 'cyan',
      events: feed.upcoming,
      badge: 'Upcoming',
      badgeColor: 'cyan',
      empty: "No upcoming events from your communities.",
    },
    {
      key: 'ongoing',
      label: 'Happening Now',
      icon: '🔴',
      color: 'emerald',
      events: feed.ongoing,
      badge: 'Live Now',
      badgeColor: 'emerald',
      empty: "No ongoing events right now.",
    },
    {
      key: 'recentlyCompleted',
      label: 'Recently Done',
      icon: '✅',
      color: 'purple',
      events: feed.recentlyCompleted,
      badge: 'Completed',
      badgeColor: 'purple',
      empty: "No recently completed events.",
    },
  ];

  const active = tabs.find(t => t.key === activeTab);

  return (
    <div className="glass-dark rounded-3xl p-6 md:p-8 border border-slate-200 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full mix-blend-screen filter blur-[80px] pointer-events-none" />

      <div className="flex justify-between items-end mb-6 relative z-10">
        <div>
          <h3 className="text-2xl font-black flex items-center gap-3 mb-1">
            <span className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">📡</span>
            What's Happening
          </h3>
          <p className="text-slate-500 text-sm font-medium">
            {loading ? 'Loading...' : total === 0 ? 'Join communities to see their events here' : `Activity from your communities`}
          </p>
        </div>
        <Link to="/events" className="text-sm font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-4 py-2 rounded-full hover:bg-cyan-100 transition-colors shrink-0">
          All Events →
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-slate-100 rounded-xl p-1 relative z-10">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
              activeTab === tab.key
                ? `bg-${tab.color}-100 text-${tab.color}-700 shadow-inner border border-${tab.color}-200`
                : 'text-slate-500 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.events.length > 0 && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                activeTab === tab.key ? `bg-${tab.color}-200 text-${tab.color}-700` : 'bg-white text-slate-500 border border-slate-200'
              }`}>
                {tab.events.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Event list */}
      <div className="flex-1 space-y-3 relative z-10">
        {loading ? (
          <div className="py-10 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest animate-pulse">Loading feed...</span>
          </div>
        ) : active?.events.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-4xl mb-3 opacity-40">{active.icon}</div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{active.empty}</p>
            {total === 0 && (
              <Link to="/clubs" className="inline-block mt-4 px-5 py-2 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-colors">
                Discover Communities →
              </Link>
            )}
          </div>
        ) : (
          active.events.map(ev => (
            <EventCard
              key={ev._id}
              event={ev}
              badge={active.badge}
              badgeColor={active.badgeColor}
            />
          ))
        )}
      </div>
    </div>
  );
}
