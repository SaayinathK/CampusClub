import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pendingCAdmins, setPendingCAdmins] = useState([]);
  const [pendingCommunities, setPendingCommunities] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [statsRes, pendingUsersRes, pendingComRes, pendingEvRes] = await Promise.allSettled([
      api.get('/users/stats'),
      api.get('/users/pending-community-admins'),
      api.get('/communities/all?status=pending'),
      api.get('/events/pending'),
    ]);

    if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
    else toast.error('Failed to load user stats');

    if (pendingUsersRes.status === 'fulfilled') setPendingCAdmins(pendingUsersRes.value.data.data || []);
    else toast.error('Failed to load pending admins');

    if (pendingComRes.status === 'fulfilled') setPendingCommunities(pendingComRes.value.data.data || []);
    else toast.error('Failed to load pending communities');

    if (pendingEvRes.status === 'fulfilled') setPendingEvents(pendingEvRes.value.data.data || []);
    else toast.error('Failed to load pending events');

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const approveUser = async (id, name) => {
    try {
      await api.put(`/users/${id}/approve`);
      toast.success(`${name} approved successfully`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const rejectUser = async (id, name) => {
    const reason = prompt(`Reason for rejecting ${name}:`);
    if (reason === null) return;
    try {
      await api.put(`/users/${id}/reject`, { reason });
      toast.success(`${name} rejected`);
      fetchData();
    } catch (err) {
      toast.error('Failed to reject');
    }
  };

  const approveEvent = async (id, title) => {
    try {
      await api.put(`/events/${id}/approve`);
      toast.success(`"${title}" approved and published!`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve event');
    }
  };

  const rejectEvent = async (id, title) => {
    const reason = prompt(`Reason for rejecting "${title}":`);
    if (reason === null) return;
    try {
      await api.put(`/events/${id}/reject`, { reason });
      toast.success(`"${title}" rejected`);
      fetchData();
    } catch (err) {
      toast.error('Failed to reject event');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      <span className="text-purple-400 font-medium tracking-widest uppercase text-sm animate-pulse">Initializing System Admin Dashboard...</span>
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans text-slate-900 relative overflow-hidden bg-slate-50">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-300/30 rounded-full mix-blend-multiply filter blur-[150px] animate-blob pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-300/30 rounded-full mix-blend-multiply filter blur-[120px] animation-delay-4000 animate-blob pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-10">
        
        {/* Header */}
        <header className="bg-white rounded-3xl p-8 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative group overflow-hidden shadow-md hover:shadow-lg transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-[2px] shadow-sm">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-3xl">
                🚀
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-1 tracking-tight text-slate-900">
                ADMIN <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">DASHBOARD</span>
              </h2>
              <p className="text-slate-500 font-medium">Welcome back, {user?.name} — System Administration</p>
            </div>
          </div>
          
          <div className="flex gap-4 relative z-10">
            <Link to="/admin/users" className="bg-white hover:bg-slate-50 px-6 py-3 rounded-full font-bold text-slate-700 transition-all hover:-translate-y-1 border border-slate-200 shadow-sm flex items-center gap-2">
              👥 Manage Users
            </Link>
            <Link to="/admin/communities" className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-bold text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-1 flex items-center gap-2">
              🏛️ Communities
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Users', value: stats.total, icon: '👥', color: 'text-purple-600', border: 'hover:border-purple-300', gradient: 'from-purple-50 to-transparent', ring: 'shadow-sm hover:shadow-md' },
              { label: 'Pending Approval', value: stats.pending, icon: '⏳', color: 'text-amber-600', border: 'hover:border-amber-300', gradient: 'from-amber-50 to-transparent', ring: 'shadow-sm hover:shadow-md' },
              { label: 'Community Admins', value: stats.communityAdmins, icon: '👑', color: 'text-pink-600', border: 'hover:border-pink-300', gradient: 'from-pink-50 to-transparent', ring: 'shadow-sm hover:shadow-md' },
              { label: 'Students Enroll', value: stats.students, icon: '🎓', color: 'text-cyan-600', border: 'hover:border-cyan-300', gradient: 'from-cyan-50 to-transparent', ring: 'shadow-sm hover:shadow-md' },
            ].map((s, i) => (
              <div key={i} className={`bg-white rounded-3xl p-6 border border-slate-200 transition-all duration-300 hover:-translate-y-1 ${s.border} ${s.ring} relative group overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10 flex justify-between items-start mb-4">
                  <span className="text-3xl drop-shadow-sm">{s.icon}</span>
                </div>
                <div className={`relative z-10 text-4xl font-black ${s.color} mb-2 tracking-tight`}>{s.value}</div>
                <div className="relative z-10 text-sm font-semibold text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Two Column Pending Approvals Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Pending Community Admins */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100 rounded-full filter blur-[80px]" />
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h3 className="text-2xl font-black flex items-center gap-3 mb-1 text-slate-900">
                  <span>👥</span> Pending Admins
                  {pendingCAdmins.length > 0 && (
                    <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-700 font-bold rounded-full border border-amber-200">{pendingCAdmins.length}</span>
                  )}
                </h3>
                <p className="text-sm text-slate-500">Review community admin applications</p>
              </div>
              <Link to="/admin/users?role=community_admin&status=pending" className="text-sm font-bold text-amber-500 hover:text-amber-400 uppercase tracking-widest">View All</Link>
            </div>

            <div className="flex-1 space-y-4 relative z-10">
              {pendingCAdmins.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-10 bg-slate-50 rounded-2xl border border-slate-200 opacity-90">
                  <span className="text-4xl mb-3">✅</span>
                  <p className="text-lg font-bold text-slate-600">All caught up!</p>
                  <p className="text-sm text-slate-500">No pending admin applications.</p>
                </div>
              ) : (
                pendingCAdmins.slice(0, 4).map(u => (
                  <div key={u._id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200 flex items-center justify-center text-xl font-bold shadow-sm text-purple-700">
                          {u.name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg leading-tight text-slate-900">{u.name}</h4>
                          <span className="text-xs text-slate-500">{u.email}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full">Review</span>
                    </div>
                    {u.communityName && (
                      <div className="mb-4 bg-slate-50 p-3 rounded-lg border-l-2 border-purple-400 text-sm pl-4">
                        <div className="flex gap-4 mb-1">
                          <span className="font-medium text-purple-700">🏛️ {u.communityName}</span>
                          <span className="text-slate-500">📂 {u.communityCategory}</span>
                        </div>
                        <p className="text-slate-600 text-xs truncate">{u.communityDescription}</p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button onClick={() => approveUser(u._id, u.name)} className="flex-1 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-bold text-sm transition-colors border border-emerald-500/20 flex items-center justify-center gap-2">
                        ✓ Accept
                      </button>
                      <button onClick={() => rejectUser(u._id, u.name)} className="flex-1 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-bold text-sm transition-colors border border-rose-500/20 flex items-center justify-center gap-2">
                        ✗ Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Communities */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-100 rounded-full filter blur-[80px]" />
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h3 className="text-2xl font-black flex items-center gap-3 mb-1 text-slate-900">
                  <span>🏛️</span> Pending Communities
                  {pendingCommunities.length > 0 && (
                    <span className="text-xs px-2.5 py-1 bg-cyan-100 text-cyan-700 border border-cyan-200 font-bold rounded-full">{pendingCommunities.length}</span>
                  )}
                </h3>
                <p className="text-sm text-slate-500">Review new club submissions</p>
              </div>
              <Link to="/admin/communities" className="text-sm font-bold text-cyan-500 hover:text-cyan-400 uppercase tracking-widest">View All</Link>
            </div>

            <div className="flex-1 space-y-4 relative z-10">
              {pendingCommunities.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-10 bg-slate-50 rounded-2xl border border-slate-200 opacity-90">
                  <span className="text-4xl mb-3">✅</span>
                  <p className="text-lg font-bold text-slate-600">All reviewed!</p>
                  <p className="text-sm text-slate-500">No pending communities.</p>
                </div>
              ) : (
                pendingCommunities.slice(0, 4).map(c => (
                  <div key={c._id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 border border-cyan-200 text-cyan-700 flex items-center justify-center text-2xl shadow-sm shrink-0">
                        {c.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-lg leading-tight truncate pr-2 text-slate-900">{c.name}</h4>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-slate-100 border border-slate-200 text-cyan-700 rounded shrink-0">{c.category}</span>
                        </div>
                        <span className="text-xs text-slate-500 mt-1 block">by {c.admin?.name}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">{c.description}</p>
                    <div className="flex gap-3">
                      <button onClick={async () => {
                        try { await api.put(`/communities/${c._id}/approve`); toast.success('Approved!'); fetchData(); } catch { toast.error('Failed to approve'); }
                      }} className="flex-1 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-bold text-sm transition-colors border border-emerald-500/20 flex items-center justify-center gap-2">
                        ✓ Accept
                      </button>
                      <button onClick={async () => {
                        const reason = prompt('Rejection reason:'); if (!reason) return;
                        try { await api.put(`/communities/${c._id}/reject`, { reason }); toast.success('Rejected'); fetchData(); } catch { toast.error('Failed'); }
                      }} className="flex-1 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-bold text-sm transition-colors border border-rose-500/20 flex items-center justify-center gap-2">
                        ✗ Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Pending Events Section */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-md relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-pink-100 filter blur-[120px] pointer-events-none" />
          
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h3 className="text-2xl font-black flex items-center gap-3 mb-1 text-slate-900">
                <span>📅</span> Event Approvals
                {pendingEvents.length > 0 && (
                  <span className="text-[10px] px-3 py-1.5 bg-pink-100 border border-pink-200 text-pink-700 font-black rounded-sm tracking-wider uppercase">{pendingEvents.length} Pending</span>
                )}
              </h3>
              <p className="text-sm text-slate-500">Review newly created events before they go public</p>
            </div>
            <Link to="/admin/events" className="hidden md:flex text-sm font-bold text-pink-400 bg-pink-500/10 px-6 py-2 rounded-full hover:bg-pink-500/20 border border-pink-500/20 transition-all">Go to Events Mgt →</Link>
          </div>

          <div className="relative z-10">
            {pendingEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-50 rounded-2xl border border-slate-200 opacity-90">
                <span className="text-5xl mb-4">🎉</span>
                <p className="text-xl font-bold text-slate-700 mb-2">Zero pending events!</p>
                <p className="text-slate-500">The calendar is looking clean.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingEvents.map(ev => (
                  <div key={ev._id} className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-pink-300 transition-colors shadow-sm hover:shadow-md border-l-4 border-l-pink-400 flex flex-col">
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <div>
                        <h4 className="font-bold text-xl text-slate-900 mb-1 leading-tight">{ev.title}</h4>
                        <div className="text-xs font-semibold text-slate-500">
                          by <span className="text-pink-600">{ev.community?.name}</span> · {ev.createdBy?.name}
                        </div>
                      </div>
                        <span className="text-[10px] font-black uppercase px-2 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded shrink-0">{ev.category}</span>
                    </div>

                    <p className="text-sm text-slate-500 mb-5 line-clamp-2">{ev.description}</p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="text-xs px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 flex items-center gap-1.5 text-slate-600">
                        <span className="text-pink-600">📅</span> {new Date(ev.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                      </span>
                      {ev.venue && (
                        <span className="text-xs px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 flex items-center gap-1.5 text-slate-600">
                          <span className="text-pink-600">📍</span> {ev.venue}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-3 mt-auto">
                      <button onClick={() => approveEvent(ev._id, ev.title)} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 font-bold text-sm text-white hover:shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:-translate-y-[1px] transition-all flex justify-center items-center gap-2">
                        ✓ Publish
                      </button>
                      <button onClick={() => rejectEvent(ev._id, ev.title)} className="flex-1 py-2.5 rounded-xl bg-slate-800 font-bold text-sm text-rose-400 hover:bg-slate-700 transition-colors border border-rose-500/20 flex justify-center items-center gap-2">
                        ✗ Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}