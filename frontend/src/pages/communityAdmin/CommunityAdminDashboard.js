import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, Calendar, Clock, ArrowRight, Compass, ShieldCheck, 
  Settings, LayoutDashboard, CheckCircle2, XCircle, 
  MessageSquare, Edit3, Eye, Globe, Facebook, Instagram, Twitter, 
   Briefcase, Award, Zap, ChevronRight, Hash, Mail, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Technology', 'Arts', 'Sports', 'Academic', 'Cultural', 'Business', 'Science', 'Social', 'Other'];

const CATEGORY_ICONS = {
  Technology: Zap, Arts: Edit3, Sports: Award, Academic: Briefcase,
  Cultural: Globe, Business: Briefcase, Science: Zap, Social: Users, Other: Award,
};

const EVENT_STATUS_CONFIG = {
  published: { label: 'Active', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2 },
  pending_approval: { label: 'Auditing', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Clock },
  rejected: { label: 'Denied', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: XCircle },
  draft: { label: 'Static', color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-100', icon: Edit3 },
  completed: { label: 'Archived', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: ShieldCheck },
  cancelled: { label: 'Aborted', color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-100', icon: XCircle },
};

export default function CommunityAdminDashboard() {
  const { user } = useAuth();
  const [community, setCommunity]     = useState(null);
  const [events, setEvents]           = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('overview');

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
      toast.error('Failed to synchronize administration portal');
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
      toast.success('Institutional profile updated');
      const res = await api.get('/communities/my/profile');
      setCommunity(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update sequence failure');
    } finally {
      setSaving(false);
    }
  };

  const handleJoinRequest = async (communityId, requestId, action, userName) => {
    try {
      await api.put(
        `/communities/${communityId}/join-requests/${requestId}/${action}`,
        action === 'reject' ? { reason: prompt('Reason for rejection (optional):') || '' } : {}
      );
      toast.success(`Request ${action}ed for node: ${userName}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failure');
    }
  };

  if (loading) return (
    <div className="py-40 flex flex-col items-center justify-center animate-pulse opacity-50">
       <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Initializing Command Portal</p>
    </div>
  );

  const tabs = [
    { id: 'overview',  label: 'Tactical Overview', icon: LayoutDashboard },
    { id: 'requests',  label: 'Join Requests', icon: Users, badge: joinRequests.length },
    { id: 'events',    label: 'Mission Calendar', icon: Calendar },
    { id: 'community', label: 'Entity Profile', icon: Globe },
  ];

  const rise = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans text-slate-900 relative overflow-hidden bg-transparent animate-in fade-in duration-700">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full mix-blend-screen filter blur-[150px] animate-blob pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full mix-blend-screen filter blur-[150px] animation-delay-4000 animate-blob pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">

      {/* Header Command */}
      <motion.header initial={rise.initial} animate={rise.animate} transition={{ duration: 0.6 }} className="surface-panel rounded-[2.5rem] p-8 md:p-10 border border-blue-100 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-400/5 to-blue-600/10 opacity-90 pointer-events-none" />
          <div className="absolute right-0 top-0 w-64 h-full hidden xl:block pointer-events-none opacity-55">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop"
              alt="Community dashboard"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-white/25 via-white/60 to-transparent" />
          </div>
          
          <div className="flex items-center gap-5 md:gap-6 relative z-10 min-w-0">
             <div className="w-16 h-16 rounded-[1.35rem] bg-gradient-to-br from-cyan-400 to-blue-500 p-[2px] shadow-[0_0_20px_rgba(6,182,212,0.25)] shrink-0">
                <div className="w-full h-full bg-white rounded-[1.25rem] flex items-center justify-center text-3xl shadow-sm">⚡</div>
             </div>
             <div className="min-w-0">
                <h2 className="text-3xl md:text-5xl font-black mb-2 tracking-tight leading-none">
                   COMMUNITY <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">DASHBOARD</span>
                </h2>
                <p className="text-slate-500 font-medium text-sm md:text-base">
                   {community?.name} — Unified command center for members, requests, and events
                </p>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 relative z-10 w-full xl:w-auto xl:justify-end">
             <Link to="/community-admin/events" className="px-6 py-3 rounded-full font-bold text-blue-700 transition-all hover:-translate-y-1 border border-blue-200 bg-blue-50/70 hover:bg-blue-100 flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-sm">
                <Calendar size={16} /> Events
             </Link>
             <Link to="/community-admin/members" className="px-6 py-3 rounded-full font-bold text-white transition-all hover:-translate-y-1 flex items-center justify-center gap-2 text-sm uppercase tracking-wider bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-[0_10px_28px_rgba(37,99,235,0.28)]">
                <Users size={16} strokeWidth={3} /> Members
             </Link>
          </div>
      </motion.header>

      {/* Metrics Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Authorized Personnel', value: community.members?.length || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Pending Access Requests', value: joinRequests.length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
            { label: 'Scenario Inventory', value: events.length, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Active Deployments', value: events.filter(e => e.status === 'published').length, icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          ].map((stat, i) => (
             <motion.div 
               key={i} 
               initial={{ opacity: 0, scale: 0.95 }} 
               animate={{ opacity: 1, scale: 1 }} 
               transition={{ duration: 0.4, delay: i * 0.05 }}
               className="card-modern p-8 flex items-center justify-between transition-all group bg-white"
             >
                <div className="space-y-4">
                   <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-all`}>
                      <stat.icon size={22} strokeWidth={2.5} />
                   </div>
                   <div className="space-y-1">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</div>
                      <div className="text-3xl font-black text-slate-900 leading-none">{stat.value}</div>
                   </div>
                </div>
             </motion.div>
          ))}
      </div>

      {/* Control Tabs */}
      <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar">
         {tabs.map(tab => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all border shrink-0 ${activeTab === tab.id ? 'bg-blue-600 border-blue-600 text-white shadow-blue-500/20 shadow-lg scale-105' : 'bg-white border-slate-100 text-slate-400 hover:text-slate-900 hover:border-blue-200'}`}
            >
               <tab.icon size={16} />
               {tab.label}
               {tab.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${activeTab === tab.id ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                     {tab.badge}
                  </span>
               )}
            </button>
         ))}
      </div>

      <div className="min-h-[600px]">
         <AnimatePresence mode="wait">
            <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.3 }}
            >
               {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                     {/* Incoming Requests Snapshot */}
                     <div className="space-y-6">
                        <div className="flex justify-between items-center px-2">
                           <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                              <Users size={16} className="text-blue-600" /> Identity Access Buffer
                           </h3>
                           <button onClick={() => setActiveTab('requests')} className="text-[9px] font-black text-blue-600 uppercase tracking-widest px-3 py-1 rounded-lg bg-blue-50">View Registry</button>
                        </div>
                        <div className="card-modern p-6 space-y-4">
                           {joinRequests.length === 0 ? (
                              <div className="py-24 text-center opacity-30 italic space-y-4">
                                 <CheckCircle2 size={48} className="mx-auto" />
                                 <p className="text-[10px] font-black uppercase tracking-widest">Registry Zero: All nodes cleared</p>
                              </div>
                           ) : (
                              joinRequests.slice(0, 5).map(req => (
                                 <div key={req._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4 group hover:bg-white hover:border-blue-200 transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl font-black shadow-md">
                                       {req.user?.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <h4 className="text-sm font-bold text-slate-900 truncate leading-none mb-1 uppercase">{req.user?.name}</h4>
                                       <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{req.user?.itNumber}</div>
                                    </div>
                                    <div className="flex gap-2">
                                       <button onClick={() => handleJoinRequest(community._id, req._id, 'approve', req.user?.name)} className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all">
                                          <CheckCircle2 size={16} strokeWidth={2.5} />
                                       </button>
                                       <button onClick={() => handleJoinRequest(community._id, req._id, 'reject', req.user?.name)} className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all">
                                          <XCircle size={16} strokeWidth={2.5} />
                                       </button>
                                    </div>
                                 </div>
                              ))
                           )}
                        </div>
                     </div>

                     {/* Recent Deployments Snapshot */}
                     <div className="space-y-6">
                        <div className="flex justify-between items-center px-2">
                           <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                              <Calendar size={16} className="text-blue-600" /> Active Scenario Feed
                           </h3>
                           <button onClick={() => setActiveTab('events')} className="text-[9px] font-black text-blue-600 uppercase tracking-widest px-3 py-1 rounded-lg bg-blue-50">Mission Control</button>
                        </div>
                        <div className="card-modern p-6 space-y-4">
                           {events.length === 0 ? (
                              <div className="py-24 text-center opacity-30 italic space-y-4">
                                 <Calendar size={48} className="mx-auto" />
                                 <p className="text-[10px] font-black uppercase tracking-widest">No active deployments</p>
                              </div>
                           ) : (
                              events.slice(0, 5).map(ev => {
                                 const cfg = EVENT_STATUS_CONFIG[ev.status] || { icon: Calendar, color: 'text-slate-400', bg: 'bg-slate-50' };
                                 return (
                                    <div key={ev._id} className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center justify-between hover:border-blue-200 hover:shadow-lg transition-all group">
                                       <div className="flex items-center gap-4">
                                          <div className={`w-12 h-12 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center`}>
                                             <cfg.icon size={20} strokeWidth={2.5} />
                                          </div>
                                          <div>
                                             <h4 className="text-sm font-black text-slate-900 leading-none mb-1 group-hover:text-blue-600 transition-colors uppercase">{ev.title}</h4>
                                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(ev.startDate).toLocaleDateString()}</p>
                                          </div>
                                       </div>
                                       <div className="flex items-center gap-2">
                                          <div className="text-right">
                                             <div className="text-xs font-black text-slate-900">{ev.participants?.length || 0}</div>
                                             <div className="text-[8px] font-black text-slate-400 uppercase">Participants</div>
                                          </div>
                                          <ChevronRight size={14} className="text-slate-300" />
                                       </div>
                                    </div>
                                 );
                              })
                           )}
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'requests' && (
                  <div className="max-w-4xl mx-auto space-y-8">
                     <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Identity Access Buffer</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Full registry of pending personnel applications</p>
                     </div>
                     {joinRequests.length === 0 ? (
                        <div className="card-modern py-32 text-center bg-white space-y-6">
                           <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 mx-auto shadow-inner">
                              <CheckCircle2 size={48} />
                           </div>
                           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Identity Buffer Synchronized: No pending nodes</p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {joinRequests.map(req => (
                              <div key={req._id} className="card-modern p-8 space-y-6 hover:shadow-2xl transition-all bg-white border-none">
                                 <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black shadow-xl shrink-0">
                                       {req.user?.name?.charAt(0)}
                                    </div>
                                    <div className="space-y-1">
                                       <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">{req.user?.name}</h4>
                                       <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{req.user?.itNumber}</div>
                                       <div className="text-[10px] font-bold text-slate-400 lowercase">{req.user?.email}</div>
                                    </div>
                                 </div>
                                 {req.message && (
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-[13px] font-medium text-slate-600 leading-relaxed italic relative">
                                       <MessageSquare size={16} className="text-slate-200 absolute -top-2 -left-2" />
                                       "{req.message}"
                                    </div>
                                 )}
                                 <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => handleJoinRequest(community._id, req._id, 'approve', req.user?.name)} className="btn-primary h-12 text-[10px] font-black">✓ Authorize</button>
                                    <button onClick={() => handleJoinRequest(community._id, req._id, 'reject', req.user?.name)} className="btn-secondary h-12 text-[10px] font-black border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200">✗ Reject node</button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               )}

               {activeTab === 'events' && (
                  <div className="max-w-5xl mx-auto space-y-8">
                     <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left space-y-2">
                           <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Mission Control</h3>
                           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Operational log of all coordinated scenarios</p>
                        </div>
                        <Link to="/community-admin/events" className="btn-primary h-14 px-10 text-[10px] font-black uppercase flex items-center gap-2 shadow-xl">
                           <LayoutDashboard size={18} /> Master Calendar
                        </Link>
                     </div>

                     {events.length === 0 ? (
                        <div className="card-modern py-32 text-center bg-white space-y-6">
                           <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 mx-auto shadow-inner">
                              <Calendar size={48} />
                           </div>
                           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Deployment Registry Empty: Initialize first scenario</p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {events.map(ev => {
                              const cfg = EVENT_STATUS_CONFIG[ev.status] || { icon: Calendar, color: 'text-slate-400', bg: 'bg-slate-50' };
                              return (
                                 <div key={ev._id} className="card-modern overflow-hidden group hover:border-blue-300 transition-all bg-white border-none shadow-lg">
                                    <div className="h-2 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="p-8 space-y-6">
                                       <div className="flex justify-between items-start">
                                          <div className={`px-3 py-1 rounded-lg ${cfg.bg} ${cfg.color} text-[8px] font-black uppercase tracking-widest border border-current opacity-60`}>
                                             {cfg.label} Node
                                          </div>
                                          <div className="text-right">
                                             <div className="text-lg font-black text-slate-900 leading-none">{ev.participants?.length || 0}</div>
                                             <div className="text-[8px] font-black text-slate-400 uppercase">Authorized</div>
                                          </div>
                                       </div>
                                       <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight group-hover:text-blue-600 transition-colors">{ev.title}</h4>
                                       <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                          <div className="flex items-center gap-2"><Calendar size={14} className="text-blue-600" /> {new Date(ev.startDate).toLocaleDateString()}</div>
                                          <div className="flex items-center gap-2"><ChevronRight size={14} className="text-blue-600" /> Scenario Data</div>
                                       </div>
                                       {ev.description && (
                                          <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed italic">"{ev.description}"</p>
                                       )}
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     )}
                  </div>
               )}

               {activeTab === 'community' && (
                  <div className="max-w-4xl mx-auto space-y-10">
                     {/* Entity Status Alert */}
                     {community?.status !== 'approved' && (
                        <div className="card-modern p-10 bg-slate-900 border-none relative overflow-hidden text-center md:text-left">
                           <div className="absolute top-0 right-0 p-10 opacity-10"><ShieldCheck size={120} fill="white" /></div>
                           <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                              <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center shrink-0 ${community?.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                 {community?.status === 'pending' ? <Clock size={40} strokeWidth={2.5} /> : <XCircle size={40} strokeWidth={2.5} />}
                              </div>
                              <div className="space-y-2">
                                 <h4 className={`text-2xl font-black uppercase tracking-tight leading-none ${community?.status === 'pending' ? 'text-amber-400' : 'text-rose-400'}`}>
                                    {community?.status === 'pending' ? 'Authorization Pending' : 'Registry Failure'}
                                 </h4>
                                 <p className="text-slate-400 text-sm font-medium italic opacity-80 uppercase tracking-wide">
                                    {community?.status === 'pending' ? 'Institutional oversight board is currently auditing your entity specs. Operation restricted.' : 'Sequence aborted by global administration. Inspect reject logs for details.'}
                                 </p>
                              </div>
                           </div>
                        </div>
                     )}

                     {/* Profile Configuration Matrix */}
                     <div className="card-modern overflow-hidden bg-white border-none shadow-2xl">
                        <div className="h-48 bg-slate-100 relative group overflow-hidden">
                           {form.coverImage ? (
                              <img src={form.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]" alt="Cover" />
                           ) : (
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700" />
                           )}
                           <div className="absolute inset-0 bg-black/20" />
                        </div>

                        <div className="px-10 pb-10">
                           <div className="flex flex-col md:flex-row items-center md:items-end gap-8 -mt-16 mb-10 relative z-10">
                              <div className="w-40 h-40 rounded-[2.5rem] border-[6px] border-white bg-blue-600 flex items-center justify-center text-5xl font-black text-white shadow-2xl overflow-hidden shrink-0">
                                 {form.logo ? <img src={form.logo} className="w-full h-full object-cover" alt="Logo" /> : form.name?.charAt(0)}
                              </div>
                              <div className="flex-1 text-center md:text-left space-y-2">
                                 <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{form.name || 'Entity Node'}</h2>
                                 <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest px-3 py-1 rounded-lg bg-blue-50 border border-blue-100">
                                       {form.category && <><Zap size={10} /> {form.category}</>}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                       Registry Status: <span className="text-slate-950">{community?.status?.toUpperCase()}</span>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="flex gap-10 border-b border-slate-100 mb-10">
                              {[{ id: 'edit', label: 'Matrix Config', icon: Edit3 }, { id: 'preview', label: 'Node Preview', icon: Eye }].map(t => (
                                 <button key={t.id} onClick={() => setProfileTab(t.id)} className={`pb-5 relative text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${profileTab === t.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-900'}`}>
                                    <t.icon size={18} /> {t.label}
                                    {profileTab === t.id && (
                                       <motion.div layoutId="sub-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />
                                    )}
                                 </button>
                              ))}
                           </div>

                           {profileTab === 'edit' && (
                              <form onSubmit={handleSave} className="space-y-10">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Settings size={14} className="text-blue-600" /> Entity Label</label>
                                       <input value={form.name || ''} onChange={e => set('name', e.target.value)} required className="w-full input-modern h-14 px-6 text-sm font-bold uppercase" />
                                    </div>
                                    <div className="space-y-4">
                                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><LayoutDashboard size={14} className="text-blue-600" /> Operation Sector</label>
                                       <select value={form.category || ''} onChange={e => set('category', e.target.value)} className="w-full input-modern h-14 px-6 text-sm font-bold appearance-none">
                                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                       </select>
                                    </div>
                                 </div>

                                 <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Edit3 size={14} className="text-blue-600" /> Tactical Charter / Description</label>
                                    <textarea rows="5" value={form.description || ''} onChange={e => set('description', e.target.value)} required className="w-full input-modern p-6 h-40 resize-none text-sm font-medium leading-relaxed" />
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logo Data Node (URL)</label>
                                       <input value={form.logo || ''} onChange={e => set('logo', e.target.value)} className="w-full input-modern h-12 px-6 text-xs font-medium" />
                                    </div>
                                    <div className="space-y-4">
                                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cover Array Node (URL)</label>
                                       <input value={form.coverImage || ''} onChange={e => set('coverImage', e.target.value)} className="w-full input-modern h-12 px-6 text-xs font-medium" />
                                    </div>
                                 </div>

                                 <div className="pt-10 border-t border-slate-100">
                                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-8">Social Comm-Link Alignment</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                       {[
                                          { key: 'website', label: 'Global Node', icon: Globe },
                                          { key: 'facebook', label: 'Social Face', icon: Facebook },
                                          { key: 'instagram', label: 'Visual Insta', icon: Instagram },
                                          { key: 'twitter', label: 'Transmission TWT', icon: Twitter },
                                       ].map(s => (
                                          <div key={s.key} className="relative group">
                                             <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-blue-600 transition-colors"><s.icon size={16} /></div>
                                             <input value={form.socialLinks?.[s.key] || ''} onChange={e => setSocial(s.key, e.target.value)} placeholder={s.label} className="w-full input-modern h-12 pl-14 pr-6 text-xs font-bold" />
                                          </div>
                                       ))}
                                    </div>
                                 </div>

                                 <div className="pt-10 flex justify-end">
                                    <button type="submit" disabled={saving} className="btn-primary h-14 px-12 text-xs font-black uppercase flex items-center gap-3 shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                                       {saving ? 'Synchronizing Archive...' : <><Zap size={18} /> Update Institutional Matrix</>}
                                    </button>
                                 </div>
                              </form>
                           )}

                           {profileTab === 'preview' && (
                              <div className="space-y-10 animate-in fade-in duration-500 pt-10 px-4">
                                 <div className="space-y-6">
                                    <h4 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] border-l-4 border-blue-600 pl-4">Strategic Overview</h4>
                                    <p className="text-slate-600 text-lg leading-relaxed font-medium">{form.description || 'Charter data pending Institutional upload.'}</p>
                                 </div>
                                 
                                 {Object.values(form.socialLinks || {}).some(v => v) && (
                                    <div className="space-y-6">
                                       <h4 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] border-l-4 border-blue-600 pl-4">Comms Grid Status</h4>
                                       <div className="flex flex-wrap gap-4">
                                          {Object.entries(form.socialLinks || {}).map(([k, v]) => v && (
                                             <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="h-12 px-6 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                                                {k} <ExternalLink size={12} />
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
            </motion.div>
         </AnimatePresence>
      </div>

      {/* Global Oversight Footer */}
      <div className="flex items-center justify-between px-6 opacity-30">
         <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.4em] text-slate-950">
            <ShieldCheck size={14} /> Neural Admin Hub v4.2.0-STBL
         </div>
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
               <Hash size={12} /> Institutional ID: {community?._id}
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
               <Mail size={12} /> Admin Node: {user?.email}
            </div>
         </div>
      </div>

         </div>
    </div>
  );
}
