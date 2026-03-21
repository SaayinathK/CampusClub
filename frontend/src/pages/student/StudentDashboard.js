import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, eRes] = await Promise.all([
          api.get('/memberships/my'),
          api.get('/events?status=published&limit=6'),
        ]);
        setMemberships(mRes.data.data || []);
        setEvents(eRes.data.data || []);
      } catch { toast.error('Failed to load data'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const approved = memberships.filter(m => m.status === 'approved');
  const pending = memberships.filter(m => m.status === 'pending');

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      <span className="text-cyan-400 font-medium tracking-widest uppercase text-sm animate-pulse">Initializing Interface...</span>
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans text-slate-100 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full mix-blend-screen filter blur-[120px] opacity-60 animate-blob pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[150px] opacity-60 animate-blob animation-delay-2000 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        {/* Welcome Hero Area */}
        <header className="glass-dark rounded-3xl p-8 md:p-12 border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">{user?.name?.split(' ')[0]}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <span className="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                  🆔 {user?.itNumber}
                </span>
                <span className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm flex items-center gap-2">
                  📧 {user?.email}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              <Link to="/clubs" className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-2">
                ✨ Explore Clubs
              </Link>
              <Link to="/student/profile" className="px-6 py-3 rounded-full glass hover:bg-white/20 font-bold text-white transition-all duration-300 hover:-translate-y-1 flex items-center gap-2">
                👤 My Profile
              </Link>
            </div>
          </div>
        </header>

        {/* Floating Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Active Communities', value: approved.length, icon: '🏛️', color: 'from-purple-500/20 to-purple-600/5', border: 'group-hover:border-purple-500/50', text: 'text-purple-400', desc: "You're a member of" },
            { label: 'Pending Requests', value: pending.length, icon: '⏳', color: 'from-amber-500/20 to-amber-600/5', border: 'group-hover:border-amber-500/50', text: 'text-amber-400', desc: 'Awaiting approval' },
            { label: 'Upcoming Events', value: events.length, icon: '📅', color: 'from-cyan-500/20 to-cyan-600/5', border: 'group-hover:border-cyan-500/50', text: 'text-cyan-400', desc: 'Happening soon' },
            { label: 'Member Since', value: new Date(user?.createdAt || Date.now()).getFullYear(), icon: '🎓', color: 'from-emerald-500/20 to-emerald-600/5', border: 'group-hover:border-emerald-500/50', text: 'text-emerald-400', desc: 'Active student' },
          ].map((s, i) => (
            <div key={i} className={`group glass-dark p-6 rounded-3xl border border-white/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)] cursor-pointer overflow-hidden relative ${s.border}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10 flex justify-between items-start mb-4">
                <span className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-300">{s.icon}</span>
                <span className={`text-4xl font-black ${s.text} opacity-90 group-hover:opacity-100`}>{s.value}</span>
              </div>
              <div className="relative z-10">
                <div className="font-bold text-lg mb-1 tracking-wide">{s.label}</div>
                <div className="text-sm text-slate-400">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Memberships Panel */}
          <div className="glass-dark rounded-3xl p-6 md:p-8 border border-white/5 flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full mix-blend-screen filter blur-[80px]" />
            <div className="flex justify-between items-end mb-8 relative z-10">
              <div>
                <h3 className="text-2xl font-black flex items-center gap-3 mb-2">
                  <span className="p-2 bg-purple-500/10 rounded-xl text-purple-400">🏛️</span>
                  My Communities
                </h3>
                <p className="text-slate-400 text-sm font-medium">
                  {approved.length} active · {pending.length} pending
                </p>
              </div>
              <Link to="/clubs" className="text-sm font-bold text-cyan-400 bg-cyan-500/10 px-4 py-2 rounded-full hover:bg-cyan-500/20 transition-colors">Browse →</Link>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 relative z-10 custom-scrollbar">
              {memberships.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-black/20 rounded-2xl border border-white/5">
                  <span className="text-5xl mb-4 opacity-50">🏛️</span>
                  <p className="text-lg font-bold text-slate-300 mb-2">No memberships yet</p>
                  <Link to="/clubs" className="mt-4 px-6 py-2 rounded-full bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 font-bold transition-all">Discover Clubs</Link>
                </div>
              ) : (
                memberships.map(m => {
                  const isTech = m.community?.category === 'Technical';
                  return (
                    <div key={m._id} className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all duration-300 hover:bg-white/10 cursor-pointer">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black shrink-0 ${isTech ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'} shadow-lg`}>
                        {m.community?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg text-white mb-1 truncate">{m.community?.name}</h4>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300">{m.community?.category}</span>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${m.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                            {m.status === 'approved' ? '✓ Active' : '⏳ Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Events Panel */}
          <div className="glass-dark rounded-3xl p-6 md:p-8 border border-white/5 flex flex-col h-full relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full mix-blend-screen filter blur-[80px]" />
            <div className="flex justify-between items-end mb-8 relative z-10">
              <div>
                <h3 className="text-2xl font-black flex items-center gap-3 mb-2">
                  <span className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">📅</span>
                  Upcoming Events
                </h3>
                <p className="text-slate-400 text-sm font-medium">Don't miss these opportunities</p>
              </div>
              <Link to="/events" className="text-sm font-bold text-cyan-400 bg-cyan-500/10 px-4 py-2 rounded-full hover:bg-cyan-500/20 transition-colors">View All →</Link>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 relative z-10 custom-scrollbar">
              {events.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-black/20 rounded-2xl border border-white/5">
                  <span className="text-5xl mb-4 opacity-50">📅</span>
                  <p className="text-lg font-bold text-slate-300">No upcoming events</p>
                </div>
              ) : (
                events.slice(0, 5).map(ev => (
                  <Link key={ev._id} to={`/events/${ev._id}`} className="block group">
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all duration-300 hover:bg-cyan-900/10 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(6,182,212,0.1)] relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">{ev.title}</h4>
                        <span className="text-xs font-bold px-3 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-full shrink-0">{ev.category}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-400">
                        <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5"><span className="text-cyan-400">📅</span> {new Date(ev.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5"><span className="text-purple-400">🏛️</span> {ev.community?.name}</span>
                        {ev.location && <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">📍 {ev.location}</span>}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Quick Actions Footer */}
        <div className="glass-dark rounded-3xl p-8 border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent pointer-events-none" />
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 relative z-10 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-slate-600" /> Quick Actions
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            {[
              { icon: '🏛️', label: 'Find Clubs', link: '/clubs', bg: 'hover:bg-cyan-500/20', text: 'group-hover:text-cyan-400' },
              { icon: '📅', label: 'Browse Events', link: '/events', bg: 'hover:bg-purple-500/20', text: 'group-hover:text-purple-400' },
              { icon: '👥', label: 'My Network', link: '/student/network', bg: 'hover:bg-emerald-500/20', text: 'group-hover:text-emerald-400' },
              { icon: '⚙️', label: 'Settings', link: '/student/profile', bg: 'hover:bg-amber-500/20', text: 'group-hover:text-amber-400' },
            ].map((action, idx) => (
              <Link key={idx} to={action.link} className={`group flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all duration-300 ${action.bg}`}>
                <span className="text-3xl mb-3 group-hover:scale-125 transition-transform duration-300 drop-shadow-lg">{action.icon}</span>
                <span className={`text-sm font-bold text-slate-300 transition-colors ${action.text}`}>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}