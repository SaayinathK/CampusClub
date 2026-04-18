import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['Technology', 'Arts', 'Sports', 'Academic', 'Cultural', 'Business', 'Science', 'Social', 'Other'];

const CATEGORY_ICONS = {
  Technology: '💻', Arts: '🎨', Sports: '⚽', Academic: '📚',
  Cultural: '🎭', Business: '💼', Science: '🔬', Social: '🤝', Other: '🌟',
};
const getCategoryIcon = (cat) => CATEGORY_ICONS[cat] || '🏛️';

const EVENT_STATUS_COLOR = {
  published: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', 
  pending_approval: 'text-amber-400 bg-amber-500/10 border-amber-500/20', 
  rejected: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  draft: 'text-slate-400 bg-slate-500/10 border-slate-500/20', 
  completed: 'text-purple-400 bg-purple-500/10 border-purple-500/20', 
  cancelled: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
};
const EVENT_STATUS_LABEL = {
  published: '✓ Published', pending_approval: '⏳ Pending', rejected: '❌ Rejected',
  draft: '📝 Draft', completed: '✅ Completed', cancelled: '🚫 Cancelled',
};

export default function CommunityAdminDashboard() {
  const { user } = useAuth();
  const [community, setCommunity]     = useState(null);
  const [events, setEvents]           = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('overview');

  // Profile edit state
  const [form, setForm]               = useState({});
  const [saving, setSaving]           = useState(false);
  const [profileTab, setProfileTab]   = useState('edit');

  const fetchData = async () => {
    setLoading(true);
    try {
      const communityRes = await api.get('/communities/my/profile');
      const c = communityRes.data.data;
      setCommunity(c);
      setForm({
        name: c.name, description: c.description, category: c.category,
        logo: c.logo || '', coverImage: c.coverImage || '',
        socialLinks: c.socialLinks || {},
      });
      const [eventsRes, requestsRes] = await Promise.all([
        api.get('/events/my-community'),
        api.get(`/communities/${c._id}/join-requests`),
      ]);
      setEvents(eventsRes.data.data || []);
      setJoinRequests(requestsRes.data.data || []);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setSocial = (k, v) => setForm(p => ({ ...p, socialLinks: { ...p.socialLinks, [k]: v } }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/communities/${community._id}`, form);
      toast.success('Community profile updated!');
      const res = await api.get('/communities/my/profile');
      setCommunity(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleJoinRequest = async (communityId, requestId, action, userName) => {
    try {
      await api.put(
        `/communities/${communityId}/join-requests/${requestId}/${action}`,
        action === 'reject' ? { reason: prompt('Reason (optional):') || '' } : {}
      );
      toast.success(`Request ${action}ed for ${userName}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      <span className="text-cyan-400 font-medium tracking-widest uppercase text-sm animate-pulse">Initializing Portal...</span>
    </div>
  );

  const tabs = [
    { id: 'overview',  label: 'Overview',    icon: '📊' },
    { id: 'requests',  label: `Join Requests${joinRequests.length > 0 ? ` (${joinRequests.length})` : ''}`, icon: '👋', badge: joinRequests.length },
    { id: 'events',    label: 'Events',       icon: '📅' },
    { id: 'community', label: 'Community',    icon: '🏛️' },
  ];

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans text-slate-900 relative overflow-hidden bg-slate-50">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-300/30 rounded-full filter blur-[150px] animate-blob pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-300/30 rounded-full filter blur-[120px] animation-delay-4000 animate-blob pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-10">
        
        {/* Header */}
        <header className="bg-white rounded-3xl p-8 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative group overflow-hidden shadow-md">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 p-[2px] shadow-sm">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-3xl">
                🏛️
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-1 tracking-tight text-slate-900">
                COMMUNITY <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">DASHBOARD</span>
              </h2>
              <p className="text-slate-500 font-medium">{community?.name} — Management Portal</p>
            </div>
          </div>
          
          <div className="flex gap-4 relative z-10">
            <Link to="/community-admin/events" className="bg-white hover:bg-slate-50 px-6 py-3 rounded-full font-bold text-slate-700 transition-all hover:-translate-y-1 border border-slate-200 shadow-sm flex items-center gap-2">
              <span>📅</span> Manage Events
            </Link>
            <Link to="/community-admin/members" className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 font-bold text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-1 flex items-center gap-2">
              <span>👥</span> View Members
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        {community && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Members', value: community.members?.length || 0, icon: '👥', color: 'text-cyan-600', border: 'hover:border-cyan-300', gradient: 'from-cyan-50 to-transparent', ring: 'shadow-sm hover:shadow-md' },
              { label: 'Pending Requests', value: joinRequests.length, icon: '⏳', color: 'text-amber-600', border: 'hover:border-amber-300', gradient: 'from-amber-50 to-transparent', ring: 'shadow-sm hover:shadow-md' },
              { label: 'Total Events', value: events.length, icon: '📅', color: 'text-purple-600', border: 'hover:border-purple-300', gradient: 'from-purple-50 to-transparent', ring: 'shadow-sm hover:shadow-md' },
              { label: 'Published Events', value: events.filter(e => e.status === 'published').length, icon: '🚀', color: 'text-emerald-600', border: 'hover:border-emerald-300', gradient: 'from-emerald-50 to-transparent', ring: 'shadow-sm hover:shadow-md' },
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

        {/* Tab Navigation */}
        <div className="flex gap-2 md:gap-4 overflow-x-auto custom-scrollbar pb-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-all shrink-0 ${activeTab === tab.id ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 shadow-sm'}`}>
              <span className="text-lg">{tab.icon}</span> 
              <span>{tab.label}</span>
              {tab.badge > 0 && activeTab !== tab.id && (
                 <span className="ml-1 px-2 py-0.5 bg-cyan-600 text-white rounded-full text-[10px]">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg min-h-[500px]">
          <div className="p-8 md:p-12 relative z-10">

            {/* ── Overview Tab ── */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* Join Requests */}
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900">
                        <span className="p-2 bg-amber-100 rounded-xl text-amber-600 border border-amber-200">👋</span> Join Requests
                      </h3>
                      <p className="text-slate-500 text-sm mt-1">Review applicant requests</p>
                    </div>
                    {joinRequests.length > 5 && (
                      <button onClick={() => setActiveTab('requests')} className="text-sm font-bold text-amber-600 py-2 hover:text-amber-500 hover:underline">View All →</button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {joinRequests.length === 0 ? (
                      <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200 opacity-90 flex flex-col items-center">
                        <span className="text-4xl mb-3">✅</span>
                        <p className="text-lg font-bold text-slate-700">Inbox zero!</p>
                        <p className="text-slate-500 text-sm">No pending join requests.</p>
                      </div>
                    ) : (
                      joinRequests.slice(0, 5).map(req => (
                        <div key={req._id} className="p-5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-amber-300 hover:shadow-md shadow-sm transition-all group relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-xl font-bold shadow-sm shrink-0 text-purple-700 border border-purple-200">
                              {req.user?.name?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 text-lg leading-tight truncate">{req.user?.name}</h4>
                              <p className="text-xs font-mono text-cyan-600 mb-2 truncate">{req.user?.itNumber}</p>
                              {req.message && (
                                <p className="text-sm text-slate-600 italic px-3 py-2 bg-slate-50 rounded-lg border-l-2 border-purple-300 mb-4 line-clamp-2">"{req.message}"</p>
                              )}
                              <div className="flex gap-2">
                                <button onClick={() => handleJoinRequest(community._id, req._id, 'approve', req.user?.name)} className="px-4 py-1.5 flex-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold text-sm hover:bg-emerald-100 transition-colors">✓ Accept</button>
                                <button onClick={() => handleJoinRequest(community._id, req._id, 'reject', req.user?.name)} className="px-4 py-1.5 flex-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 font-bold text-sm hover:bg-rose-100 transition-colors">✗ Decline</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent Events */}
                <div className="space-y-6">
                   <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900">
                        <span className="p-2 bg-purple-100 rounded-xl text-purple-600 border border-purple-200">📅</span> Recent Events
                      </h3>
                      <p className="text-slate-500 text-sm mt-1">Snapshot of your timeline</p>
                    </div>
                    {events.length > 5 && (
                      <Link to="/community-admin/events" className="text-sm font-bold text-purple-600 py-2 hover:text-purple-500 hover:underline">All Events →</Link>
                    )}
                  </div>

                  <div className="space-y-4">
                    {events.length === 0 ? (
                       <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200 opacity-90 flex flex-col items-center">
                        <span className="text-4xl mb-3">📅</span>
                        <p className="text-lg font-bold text-slate-700">Nothing planned yet.</p>
                        <Link to="/community-admin/events" className="mt-4 px-6 py-2 bg-purple-50 text-purple-600 border border-purple-200 rounded-full font-bold hover:bg-purple-100 transition-all text-sm">Create Event</Link>
                      </div>
                    ) : (
                      events.slice(0, 5).map(ev => (
                        <div key={ev._id} className="p-5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 hover:-translate-y-1 transition-all group cursor-default shadow-sm hover:shadow-md">
                          <div className="flex justify-between items-start gap-4 mb-3">
                            <h4 className="font-bold text-lg text-slate-900 group-hover:text-cyan-600 transition-colors leading-tight">{ev.title}</h4>
                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border shrink-0 ${EVENT_STATUS_COLOR[ev.status] || 'text-slate-500 border-slate-200 bg-slate-100'}`}>
                              {EVENT_STATUS_LABEL[ev.status] || ev.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                             <div className="flex items-center gap-1.5"><span className="text-purple-600">📅</span> {new Date(ev.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                             <div className="flex items-center gap-1.5"><span className="text-cyan-600">👥</span> {ev.participants?.length || 0} participants</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* ── Join Requests Tab ── */}
            {activeTab === 'requests' && (
              <div className="max-w-4xl mx-auto">
                <div className="mb-10 text-center">
                  <h3 className="text-3xl font-black mb-2 text-slate-900">All Pending Requests</h3>
                  <p className="text-slate-500">Manage people looking to join your community</p>
                </div>
                {joinRequests.length === 0 ? (
                  <div className="p-16 text-center bg-slate-50 border border-slate-200 rounded-3xl flex flex-col items-center justify-center">
                     <span className="text-6xl mb-6">✅</span>
                     <p className="text-2xl font-bold text-slate-700">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {joinRequests.map(req => (
                      <div key={req._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-5 mb-5">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200 flex items-center justify-center text-2xl font-black shadow-sm text-amber-600 shrink-0">
                            {req.user?.name?.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-xl text-slate-900">{req.user?.name}</h4>
                            <p className="text-slate-500 text-xs mt-1">{req.user?.email}</p>
                            <p className="text-cyan-600 font-mono text-xs">{req.user?.itNumber}</p>
                          </div>
                        </div>
                        {req.message && (
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-600 italic mb-5 relative">
                             <span className="absolute -top-3 left-4 bg-white border border-slate-200 px-2 text-xs text-slate-500 not-italic font-bold rounded-sm">Message</span>
                            "{req.message}"
                          </div>
                        )}
                        <div className="flex gap-3">
                           <button onClick={() => handleJoinRequest(community._id, req._id, 'approve', req.user?.name)} className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:shadow-md transition-all flex items-center justify-center gap-2">✓ Approve</button>
                           <button onClick={() => handleJoinRequest(community._id, req._id, 'reject', req.user?.name)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:border-rose-200 hover:text-rose-600 transition-colors flex items-center justify-center gap-2 bg-slate-50">✗ Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Events Tab ── */}
            {activeTab === 'events' && (
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 text-center md:text-left">
                  <div>
                    <h3 className="text-3xl font-black mb-2 text-slate-900">Community Events</h3>
                    <p className="text-slate-500">Complete overview of your hosted activities</p>
                  </div>
                  <Link to="/community-admin/events" className="px-6 py-3 rounded-full bg-purple-600 font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-white hover:bg-purple-700">
                     <span>➕</span> Create Event
                  </Link>
                </div>

                {events.length === 0 ? (
                  <div className="p-16 text-center bg-slate-50 border border-slate-200 rounded-3xl flex flex-col items-center justify-center">
                     <span className="text-6xl mb-6">📅</span>
                     <p className="text-2xl font-bold mb-2 text-slate-700">The calendar is empty</p>
                     <p className="text-slate-500">Launch an engaging event to attract more members.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {events.map(ev => (
                      <div key={ev._id} className="bg-white border border-slate-200 shadow-sm p-6 rounded-3xl hover:border-purple-300 transition-all hover:shadow-md group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                           <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md border shadow-sm ${EVENT_STATUS_COLOR[ev.status] || 'text-slate-500 border-slate-200 bg-slate-100'}`}>
                              {EVENT_STATUS_LABEL[ev.status] || ev.status}
                           </span>
                        </div>
                        <h4 className="font-bold text-xl text-slate-900 group-hover:text-cyan-600 transition-colors leading-tight pr-24 mb-3">{ev.title}</h4>
                        
                        <div className="flex flex-col gap-2 mb-4">
                           <div className="flex items-center gap-2 text-sm text-slate-500"><span className="text-purple-600">📅</span> {new Date(ev.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                           <div className="flex items-center gap-2 text-sm text-slate-500"><span className="text-cyan-600">👥</span> {ev.participants?.length || 0} Registered Particpiants</div>
                        </div>

                        {ev.description && (
                          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm text-slate-600 line-clamp-2">
                             {ev.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Community Profile Tab ── */}
            {activeTab === 'community' && (
              <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Status Banner */}
                {community?.status !== 'approved' && (
                  <div className={`p-6 rounded-2xl flex items-center gap-5 border shadow-2xl ${community?.status === 'pending' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0 ${community?.status === 'pending' ? 'bg-amber-500/20 text-amber-500' : 'bg-rose-500/20 text-rose-500'}`}>
                      {community?.status === 'pending' ? '⏳' : '❌'}
                    </div>
                    <div>
                      <h4 className={`text-xl font-bold mb-1 ${community?.status === 'pending' ? 'text-amber-500' : 'text-rose-500'}`}>
                        {community?.status === 'pending' ? 'Pending Approval' : 'Registration Rejected'}
                      </h4>
                      <p className="text-sm text-slate-300">
                         {community?.status === 'pending' ? 'System administrators are currently reviewing your community. You may continue to update your profile in the meantime.' : 'Your community application was rejected. Please reach out to the system administrator.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Profile Card */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg">
                  {/* Cover */}
                  <div className="h-48 relative bg-slate-100">
                    {form.coverImage ? (
                      <img src={form.coverImage} className="w-full h-full object-cover" alt="Cover" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 via-purple-100 to-slate-200" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>

                  {/* Identity */}
                  <div className="px-8 pb-8 relative -mt-16">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left mb-8">
                      <div className="w-32 h-32 rounded-2xl border-4 border-white bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-5xl font-black shadow-md shrink-0 overflow-hidden relative z-10">
                        {form.logo ? <img src={form.logo} className="w-full h-full object-cover" alt="Logo" /> : form.name?.charAt(0)}
                      </div>
                      <div className="flex-1 pb-2">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">{form.name || 'Community Name'}</h2>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                           {form.category && (
                             <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-bold text-slate-600 flex items-center gap-1.5">
                               {getCategoryIcon(form.category)} {form.category}
                             </span>
                           )}
                           <span className={`px-3 py-1 rounded-full text-xs font-bold border ${community?.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : community?.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                             {community?.status === 'approved' ? '✓ Approved' : community?.status === 'pending' ? '⏳ Pending' : '✗ Rejected'}
                           </span>
                        </div>
                      </div>
                    </div>

                    {/* Sub Tab Navigation */}
                    <div className="flex justify-center md:justify-start border-b border-slate-200 mb-8">
                      {[{ id: 'edit', label: 'Edit Profile', icon: '✏️' }, { id: 'preview', label: 'Preview', icon: '👁️' }].map(t => (
                        <button key={t.id} onClick={() => setProfileTab(t.id)} className={`px-6 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${profileTab === t.id ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'}`}>
                           <span>{t.icon}</span> {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Edit Form */}
                    {profileTab === 'edit' && (
                      <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><span className="text-cyan-600">🏷️</span> Name *</label>
                            <input value={form.name || ''} onChange={e => set('name', e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium" placeholder="Community Name" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><span className="text-purple-600">📂</span> Category *</label>
                            <select value={form.category || ''} onChange={e => set('category', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium appearance-none">
                              {CATEGORIES.map(c => <option key={c} value={c} className="bg-white">{getCategoryIcon(c)} {c}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><span>📝</span> Description *</label>
                          <textarea rows="5" value={form.description || ''} onChange={e => set('description', e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium resize-y" placeholder="Summarize your community's purpose..." />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><span>🖼️</span> Logo URL</label>
                            <input value={form.logo || ''} onChange={e => set('logo', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-cyan-500 transition-all font-medium" placeholder="https://..." />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><span>🎨</span> Cover Image URL</label>
                            <input value={form.coverImage || ''} onChange={e => set('coverImage', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-cyan-500 transition-all font-medium" placeholder="https://..." />
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-200">
                           <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><span>🔗</span> Social Channels</h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {[
                                { key: 'website', label: '🌐 Website', placeholder: 'https://...' },
                                { key: 'facebook', label: '📘 Facebook', placeholder: 'https://facebook.com/...' },
                                { key: 'instagram', label: '📷 Instagram', placeholder: 'https://instagram.com/...' },
                                { key: 'twitter', label: '🐦 Twitter', placeholder: 'https://twitter.com/...' },
                              ].map(s => (
                                <div key={s.key} className="relative">
                                  <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-cyan-600">{s.label}</label>
                                  <input value={form.socialLinks?.[s.key] || ''} onChange={e => setSocial(s.key, e.target.value)} placeholder={s.placeholder} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-cyan-500 transition-all text-sm" />
                                </div>
                              ))}
                           </div>
                        </div>

                        <button type="submit" disabled={saving} className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 font-bold text-lg text-white hover:shadow-lg transition-all flex justify-center items-center gap-2 mt-4">
                          {saving ? 'Saving...' : '💾 Update Profile'}
                        </button>
                      </form>
                    )}

                    {/* Preview */}
                    {profileTab === 'preview' && (
                      <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
                         <div className="mb-6 pb-6 border-b border-slate-200">
                           <h4 className="text-lg font-bold text-cyan-600 mb-2">About</h4>
                           <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{form.description || 'No description provided.'}</p>
                         </div>
                         {Object.keys(form.socialLinks || {}).filter(k => form.socialLinks[k]).length > 0 && (
                            <div>
                              <h4 className="text-lg font-bold text-cyan-600 mb-4">Connect</h4>
                              <div className="flex flex-wrap gap-3">
                                {Object.entries(form.socialLinks).map(([k, v]) => v && (
                                  <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-medium text-sm flex items-center gap-2 transition-all capitalize hover:text-cyan-700 hover:border-cyan-300">
                                     {k} <span className="opacity-50">↗</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                         )}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}
