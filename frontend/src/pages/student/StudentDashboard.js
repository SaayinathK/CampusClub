import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import CommunityFeed from '../../components/CommunityFeed';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, eRes, rRes] = await Promise.all([
          api.get('/memberships/my'),
          api.get('/events?status=published&limit=6'),
          api.get('/events/my-registrations'),
        ]);
        setMemberships(mRes.data.data || []);
        setEvents(eRes.data.data || []);
        setRegistrations(rRes.data.data || []);
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
    <div className="min-h-screen p-6 md:p-10 font-sans text-slate-900 relative overflow-hidden bg-slate-50">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-300/30 rounded-full filter blur-[120px] opacity-60 animate-blob pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-300/30 rounded-full filter blur-[150px] opacity-60 animate-blob animation-delay-2000 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        {/* Welcome Hero Area */}
        <header className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">{user?.name?.split(' ')[0]}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <span className="px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 font-mono text-sm flex items-center gap-2">
                  🆔 {user?.itNumber}
                </span>
                <span className="px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-sm flex items-center gap-2">
                  📧 {user?.email}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              <Link to="/clubs" className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 font-bold text-white shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center gap-2">
                ✨ Explore Clubs
              </Link>
              <Link to="/student/profile" className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-all duration-300 hover:-translate-y-1 flex items-center gap-2 border border-slate-200">
                👤 My Profile
              </Link>
            </div>
          </div>
        </header>

        {/* Floating Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Active Communities', value: approved.length, icon: '🏛️', color: 'from-purple-100 to-purple-50', border: 'group-hover:border-purple-300', text: 'text-purple-700', desc: "You're a member of", link: null },
            { label: 'Pending Requests', value: pending.length, icon: '⏳', color: 'from-amber-100 to-amber-50', border: 'group-hover:border-amber-300', text: 'text-amber-700', desc: 'Awaiting approval', link: null },
            { label: 'My Registrations', value: registrations.length, icon: '📋', color: 'from-cyan-100 to-cyan-50', border: 'group-hover:border-cyan-300', text: 'text-cyan-700', desc: 'Events registered', link: '/student/registrations' },
            { label: 'Member Since', value: new Date(user?.createdAt || Date.now()).getFullYear(), icon: '🎓', color: 'from-emerald-100 to-emerald-50', border: 'group-hover:border-emerald-300', text: 'text-emerald-700', desc: 'Active student', link: null },
          ].map((s, i) => (
            <Link key={i} to={s.link || '#'} className={`group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-lg cursor-pointer overflow-hidden relative ${s.border} ${!s.link ? 'pointer-events-none' : ''}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10 flex justify-between items-start mb-4">
                <span className="text-4xl filter group-hover:scale-110 transition-transform duration-300">{s.icon}</span>
                <span className={`text-4xl font-black ${s.text} opacity-90 group-hover:opacity-100`}>{s.value}</span>
              </div>
              <div className="relative z-10">
                <div className="font-bold text-lg mb-1 tracking-wide text-slate-900">{s.label}</div>
                <div className="text-sm text-slate-500">{s.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Memberships Panel */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-md flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full filter blur-[80px]" />
            <div className="flex justify-between items-end mb-8 relative z-10">
              <div>
                <h3 className="text-2xl font-black flex items-center gap-3 mb-2 text-slate-900">
                  <span className="p-2 bg-purple-50 rounded-xl text-purple-600 border border-purple-100">🏛️</span>
                  My Communities
                </h3>
                <p className="text-slate-500 text-sm font-medium">
                  {approved.length} active · {pending.length} pending
                </p>
              </div>
              <Link to="/clubs" className="text-sm font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-4 py-2 rounded-full hover:bg-cyan-100 transition-colors">Browse →</Link>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 relative z-10 custom-scrollbar">
              {memberships.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-5xl mb-4 opacity-50">🏛️</span>
                  <p className="text-lg font-bold text-slate-600 mb-2">No memberships yet</p>
                  <Link to="/clubs" className="mt-4 px-6 py-2 rounded-full bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 font-bold transition-all">Discover Clubs</Link>
                </div>
              ) : (
                memberships.map(m => {
                  const isTech = m.community?.category === 'Technical';
                  return (
                    <div key={m._id} className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:bg-slate-50 shadow-sm cursor-pointer">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black shrink-0 ${isTech ? 'bg-cyan-50 text-cyan-600 border border-cyan-100' : 'bg-purple-50 text-purple-600 border border-purple-100'} shadow-sm`}>
                        {m.community?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg text-slate-900 mb-1 truncate">{m.community?.name}</h4>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">{m.community?.category}</span>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border ${m.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
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
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-md flex flex-col h-full relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-100 rounded-full filter blur-[80px]" />
            <div className="flex justify-between items-end mb-8 relative z-10">
              <div>
                <h3 className="text-2xl font-black flex items-center gap-3 mb-2 text-slate-900">
                  <span className="p-2 bg-cyan-50 rounded-xl text-cyan-600 border border-cyan-100">📅</span>
                  Upcoming Events
                </h3>
                <p className="text-slate-500 text-sm font-medium">Don't miss these opportunities</p>
              </div>
              <Link to="/events" className="text-sm font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-4 py-2 rounded-full hover:bg-cyan-100 transition-colors">View All →</Link>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 relative z-10 custom-scrollbar">
              {events.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-5xl mb-4 opacity-50">📅</span>
                  <p className="text-lg font-bold text-slate-600">No upcoming events</p>
                </div>
              ) : (
                events.slice(0, 5).map(ev => (
                  <Link key={ev._id} to={`/events/${ev._id}`} className="block group">
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-cyan-300 transition-all duration-300 hover:bg-slate-50 hover:-translate-y-1 shadow-sm hover:shadow-md relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-lg text-slate-900 group-hover:text-cyan-600 transition-colors">{ev.title}</h4>
                        <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full shrink-0">{ev.category}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200"><span className="text-cyan-600">📅</span> {new Date(ev.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200"><span className="text-purple-600">🏛️</span> {ev.community?.name}</span>
                        {ev.location && <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">📍 {ev.location}</span>}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Community Activity Feed */}
        <CommunityFeed />

        {/* Quick Actions Footer */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-50 to-transparent pointer-events-none" />
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 relative z-10 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-slate-300" /> Quick Actions
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            {[
              { icon: '🏛️', label: 'Find Clubs',        link: '/clubs',                    bg: 'hover:bg-cyan-50',    text: 'group-hover:text-cyan-600' },
              { icon: '📅', label: 'Browse Events',      link: '/events',                   bg: 'hover:bg-purple-50',  text: 'group-hover:text-purple-600' },
              { icon: '📋', label: 'My Registrations',   link: '/student/registrations',    bg: 'hover:bg-emerald-50', text: 'group-hover:text-emerald-600' },
              { icon: '🔔', label: 'Notifications',      link: '/student/notifications',    bg: 'hover:bg-yellow-50',  text: 'group-hover:text-yellow-600' },
            ].map((action, idx) => (
              <Link key={idx} to={action.link} className={`group flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all duration-300 ${action.bg}`}>
                <span className="text-3xl mb-3 group-hover:scale-125 transition-transform duration-300 drop-shadow-sm">{action.icon}</span>
                <span className={`text-sm font-bold text-slate-600 transition-colors ${action.text}`}>{action.label}</span>
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