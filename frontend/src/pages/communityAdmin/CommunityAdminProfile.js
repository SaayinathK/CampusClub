import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { 
  Globe, Shield, LayoutDashboard, Edit3, Eye, 
  MapPin, Link2, Facebook, Instagram, Twitter, 
  Zap, Clock, ShieldCheck, XCircle, Camera, CheckSquare,
   ArrowLeft, Share2, Info, Image as ImageIcon, Users, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Technology', 'Arts', 'Sports', 'Academic', 'Cultural', 'Business', 'Science', 'Social', 'Other'];

export default function CommunityAdminProfile() {
  const [community, setCommunity] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('configuration');

  useEffect(() => {
    api.get('/communities/my/profile').then(res => {
      const c = res.data.data;
      setCommunity(c);
      setForm({ 
        name: c.name, 
        description: c.description, 
        category: c.category, 
        logo: c.logo || '', 
        coverImage: c.coverImage || '', 
        socialLinks: c.socialLinks || {} 
      });
    }).catch(() => toast.error('Neural synchronization failure: Identity unreachable'))
    .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setSocial = (k, v) => setForm(p => ({ ...p, socialLinks: { ...p.socialLinks, [k]: v } }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/communities/${community._id}`, form);
      toast.success('Institutional specifications updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Synchronization abort');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="py-40 flex flex-col items-center justify-center animate-pulse opacity-50">
       <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Initializing Identity Buffer</p>
    </div>
  );

  const tabs = [
    { id: 'configuration', label: 'Tactical Config', icon: Edit3 },
    { id: 'preview', label: 'Nodes Preview', icon: Eye },
  ];

  const rise = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-10 animate-in fade-in duration-700">
      
      {/* Header Command */}
      <div className="flex items-center justify-between px-2">
         <Link to="/community-admin" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
            <ArrowLeft size={14} strokeWidth={3} /> Terminal Dashboard
         </Link>
         <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400 tracking-widest">
            <Globe size={14} /> Institutional identity Control
         </div>
      </div>

      <div className="card-modern overflow-hidden bg-white">
          {/* Institutional Hero */}
          <div className="relative h-48 bg-slate-100 overflow-hidden group">
             {form.coverImage ? (
                <img src={form.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]" alt="Cover" />
             ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700" />
             )}
             <div className="absolute inset-0 bg-black/30" />
             <div className="absolute bottom-4 right-6 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-[8px] font-black uppercase tracking-widest text-white/50">
                Institutional Banner Node
             </div>
          </div>

          <div className="px-10 pb-10">
             <div className="flex flex-col md:flex-row items-center md:items-end gap-8 -mt-16 mb-10 relative z-10">
                <div className="relative group">
                   <div className="w-40 h-40 rounded-[2.5rem] border-[6px] border-white bg-blue-600 flex items-center justify-center text-5xl font-black text-white shadow-2xl overflow-hidden shrink-0">
                      {form.logo ? <img src={form.logo} className="w-full h-full object-cover" alt="Logo" /> : form.name?.charAt(0)}
                   </div>
                   <div className="absolute bottom-2 right-2 w-10 h-10 rounded-xl bg-blue-600 border-4 border-white flex items-center justify-center text-white shadow-lg">
                      <Camera size={18} strokeWidth={3} />
                   </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-2">
                   <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest border border-blue-100 uppercase tracking-widest">
                         {form.category} SECTOR
                      </div>
                      <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${community?.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                         <div className={`w-1.5 h-1.5 rounded-full ${community?.status === 'approved' ? 'bg-emerald-500' : 'bg-amber-500'}`} /> {community?.status} Registry
                      </div>
                   </div>
                   <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none">{form.name || 'Untitled Entity'}</h2>
                   <p className="text-slate-500 font-medium text-sm max-w-xl uppercase tracking-wider">Mission Control Node established {new Date(community?.createdAt).getFullYear()}.</p>
                </div>
             </div>

             {/* Registry Control Interface */}
             {community?.status !== 'approved' && (
                <div className="mb-10 p-6 rounded-3xl bg-slate-900 border-none relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
                   <div className="absolute top-0 right-0 p-6 opacity-10"><ShieldCheck size={80} fill="white" /></div>
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${community?.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {community?.status === 'pending' ? <Clock size={32} /> : <XCircle size={32} />}
                   </div>
                   <div className="space-y-1 text-center md:text-left">
                      <h4 className={`text-lg font-black uppercase tracking-tight leading-none ${community?.status === 'pending' ? 'text-amber-400' : 'text-rose-400'}`}>
                         {community?.status === 'pending' ? 'Clearance Processing' : 'Access Denied'}
                      </h4>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest opacity-80">
                         {community?.status === 'pending' ? 'Neural audit in progress across the institutional grid.' : 'Operational sequence aborted by global board admins.'}
                      </p>
                   </div>
                </div>
             )}

             {/* Tabbed Configuration Control */}
             <div className="flex gap-10 border-b border-slate-100 mb-10">
                {tabs.map(tab => (
                   <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-5 relative text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-900'}`}
                   >
                      <tab.icon size={18} />
                      {tab.label}
                      {activeTab === tab.id && (
                         <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />
                      )}
                   </button>
                ))}
             </div>

             <motion.div initial={rise.initial} animate={rise.animate} transition={{ duration: 0.5 }}>
                {activeTab === 'configuration' ? (
                   <form onSubmit={handleSave} className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <LayoutDashboard size={14} className="text-blue-500" /> Operational Alias
                            </label>
                            <input
                               value={form.name || ''}
                               onChange={e => set('name', e.target.value)}
                               required
                               className="w-full h-14 input-modern px-6 text-sm font-bold uppercase"
                               placeholder="Assign Alias..."
                            />
                         </div>

                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <Shield size={14} className="text-blue-500" /> Department Sector
                            </label>
                            <select
                               value={form.category || ''}
                               onChange={e => set('category', e.target.value)}
                               className="w-full h-14 input-modern px-6 text-sm font-bold appearance-none bg-white cursor-pointer"
                            >
                               {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Info size={14} className="text-blue-500" /> Tactical Charter / Description
                         </label>
                         <textarea
                            rows={5}
                            value={form.description || ''}
                            onChange={e => set('description', e.target.value)}
                            required
                            placeholder="Detail your operational vision, tactical goals, and member expectations..."
                            className="w-full input-modern p-6 h-40 resize-none text-sm font-medium leading-relaxed"
                         />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-8 rounded-[2rem] bg-slate-100/50 border border-slate-100">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <CheckSquare size={14} className="text-blue-500" /> Logo Registry Node (URL)
                            </label>
                            <input
                               value={form.logo || ''}
                               onChange={e => set('logo', e.target.value)}
                               className="w-full h-12 input-modern px-5 text-[11px] font-mono"
                               placeholder="https://..."
                            />
                         </div>
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <ImageIcon size={14} className="text-blue-500" /> Cover Array Node (URL)
                            </label>
                            <input
                               value={form.coverImage || ''}
                               onChange={e => set('coverImage', e.target.value)}
                               className="w-full h-12 input-modern px-5 text-[11px] font-mono"
                               placeholder="https://..."
                            />
                         </div>
                      </div>

                      <div className="space-y-6">
                         <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Share2 size={14} className="text-blue-600" /> External Comm-Link Matrix
                         </h4>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                               { key: 'website', label: 'Global Portal', icon: Globe },
                               { key: 'facebook', label: 'Face Comm', icon: Facebook },
                               { key: 'instagram', label: 'Insta Feed', icon: Instagram },
                               { key: 'twitter', label: 'Neural TWT', icon: Twitter },
                            ].map(s => (
                               <div key={s.key} className="relative group">
                                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-blue-600 transition-colors">
                                     <s.icon size={16} />
                                  </div>
                                  <input
                                     value={form.socialLinks?.[s.key] || ''}
                                     onChange={e => setSocial(s.key, e.target.value)}
                                     placeholder={s.label}
                                     className="w-full h-12 input-modern pl-14 pr-6 text-xs font-bold"
                                  />
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="pt-10 flex justify-end">
                         <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary h-14 px-12 text-xs font-black uppercase flex items-center gap-3 shadow-xl"
                         >
                            {saving ? 'Synchronizing Archive...' : <><Zap size={18} /> Update Institutional Specs</>}
                         </button>
                      </div>
                   </form>
                ) : (
                   <div className="space-y-12 animate-in fade-in duration-500 pt-6">
                      <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-8">
                         <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] flex items-center gap-2">
                               <Info size={14} /> Tactical Summary
                            </h4>
                            <p className="text-slate-600 text-lg leading-relaxed font-medium">{form.description || 'Institutional Charter documentation pending upload.'}</p>
                         </div>

                         {Object.values(form.socialLinks || {}).some(v => v) && (
                            <div className="space-y-6 pt-6 border-t border-slate-200">
                               <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                  <Link2 size={14} /> Propagation Nodes
                               </h4>
                               <div className="flex flex-wrap gap-4">
                                  {Object.entries(form.socialLinks || {}).map(([k, v]) => v && (
                                     <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="h-12 px-6 rounded-xl bg-white border border-slate-100 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                                        {k} Node <Link2 size={12} />
                                     </a>
                                  ))}
                               </div>
                            </div>
                         )}
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                         {[
                            { label: 'Network Size', value: community?.members?.length || 0, icon: Users, color: 'text-blue-600' },
                            { label: 'Scenario Log', value: community?.events?.length || 0, icon: Calendar, color: 'text-indigo-600' },
                            { label: 'Origin Cycle', value: new Date(community?.createdAt).getFullYear(), icon: Clock, color: 'text-slate-400' },
                            { label: 'Grid Status', value: community?.status === 'approved' ? 'ONLINE' : 'LOCKED', icon: ShieldCheck, color: community?.status === 'approved' ? 'text-emerald-500' : 'text-amber-500' },
                         ].map((s, i) => (
                            <div key={i} className="card-modern p-6 text-center space-y-1 bg-white border-none shadow-lg">
                               <div className="flex justify-center mb-2"><s.icon size={20} className={s.color} /></div>
                               <div className="text-xl font-black text-slate-900 leading-none">{s.value}</div>
                               <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{s.label}</div>
                            </div>
                         ))}
                      </div>
                   </div>
                )}
             </motion.div>
          </div>

          <div className="bg-slate-950 p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5">
             <div className="flex items-center gap-3 text-white/40 uppercase font-black text-[9px] tracking-[0.3em]">
                <ShieldCheck size={12} /> Institutional Integrity Active
             </div>
             <div className="text-white/20 text-[9px] font-black uppercase tracking-widest">
                Identity Cluster - Node 02.4.X - Secured
             </div>
          </div>
      </div>
    </div>
  );
}