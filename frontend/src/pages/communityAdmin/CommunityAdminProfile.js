import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const CATEGORIES = ['Technology', 'Arts', 'Sports', 'Academic', 'Cultural', 'Business', 'Science', 'Social', 'Other'];

export default function CommunityAdminProfile() {
  const [community, setCommunity] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');

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
    }).catch(() => toast.error('Failed to load profile')).finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setSocial = (k, v) => setForm(p => ({ ...p, socialLinks: { ...p.socialLinks, [k]: v } }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/communities/${community._id}`, form);
      toast.success('Community profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Technology: '💻', Arts: '🎨', Sports: '⚽', Academic: '📚',
      Cultural: '🎭', Business: '💼', Science: '🔬', Social: '🤝', Other: '🌟'
    };
    return icons[category] || '🏛️';
  };

  if (loading) return (
     <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
        <span className="text-pink-400 font-bold tracking-widest uppercase text-sm animate-pulse">Initializing Profile...</span>
     </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans text-slate-100 relative overflow-hidden bg-[#020617]">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full mix-blend-screen filter blur-[150px] animate-blob pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-600/10 rounded-full mix-blend-screen filter blur-[150px] animation-delay-4000 animate-blob pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black mb-1 tracking-tight flex items-center gap-4">
              <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-pink-500 text-white shadow-lg flex items-center justify-center text-3xl leading-none">🏛️</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400 leading-tight">COMMUNITY SETUP</span>
            </h1>
            <p className="text-slate-400 font-medium ml-[72px]">Manage and customize your club's public perception</p>
          </div>
          <Link to="/community-admin" className="glass hover:bg-white/10 px-6 py-3 rounded-full font-bold text-white transition-all hover:-translate-y-1 border border-white/10 flex items-center gap-2 text-sm uppercase tracking-wider backdrop-blur-xl">
            ← Dashboard
          </Link>
        </header>

        {/* Status Banner */}
        {community?.status !== 'approved' && (
          <div className={`glass-dark rounded-2xl p-5 border-l-4 flex items-center gap-4 shadow-xl ${community?.status === 'pending' ? 'border-l-amber-500 border-white/5 bg-amber-500/5' : 'border-l-rose-500 border-white/5 bg-rose-500/5'}`}>
            <span className="text-4xl drop-shadow-md">{community?.status === 'pending' ? '⏳' : '❌'}</span>
            <div>
              <h3 className={`font-black text-lg ${community?.status === 'pending' ? 'text-amber-400' : 'text-rose-400'}`}>
                {community?.status === 'pending' ? 'Pending Approval' : 'Application Rejected'}
              </h3>
              <p className="text-slate-300 text-sm mt-0.5">
                {community?.status === 'pending' 
                  ? 'Your community is awaiting System Admin review. You can customize the profile offline in the meantime.' 
                  : 'Your community was rejected. Review feedback and contact administration.'}
              </p>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="glass-dark rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
          
          {/* Cover Art Wrapper */}
          <div className="relative group/cover">
             {form.coverImage ? (
               <div className="h-44 md:h-64 bg-cover bg-center relative" style={{ backgroundImage: `url(${form.coverImage})` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-black/30" />
               </div>
             ) : (
               <div className="h-44 md:h-64 bg-gradient-to-br from-cyan-900 via-slate-800 to-pink-900 relative">
                  <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
                  <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent" />
               </div>
             )}
             <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-300 border border-white/10 shadow-lg">Cover Header</span>
          </div>
          
          <div className="px-6 md:px-10 pb-10 relative">
             <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-20 sm:-mt-24 mb-10 text-center sm:text-left relative z-10">
                <div 
                   className="w-36 h-36 md:w-44 md:h-44 rounded-3xl border-4 border-[#020617] bg-black flex items-center justify-center text-6xl font-black text-white shadow-[0_20px_40px_rgba(0,0,0,0.6)] shrink-0 bg-cover bg-center overflow-hidden relative group/logo"
                   style={form.logo ? { backgroundImage: `url(${form.logo})` } : {}}
                >
                   {!form.logo && (
                     <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center">
                       {form.name?.charAt(0)}
                     </div>
                   )}
                </div>
                
                <div className="flex-1 pb-2 min-w-0">
                   <h2 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight truncate px-2 sm:px-0">
                     {form.name || 'Untitled Community'}
                   </h2>
                   <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                     <span className={`px-3 py-1.5 border text-xs font-black uppercase tracking-widest flex items-center gap-2 rounded-md ${community?.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : community?.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                       <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]"></span> {community?.status}
                     </span>
                     <span className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border border-white/10 text-white text-xs font-black uppercase tracking-widest flex items-center gap-1.5 rounded-md">
                       {getCategoryIcon(form.category)} {form.category}
                     </span>
                   </div>
                </div>
             </div>

             <div className="flex justify-center sm:justify-start gap-8 border-b border-white/5 mb-8">
               {[
                 { id: 'edit', label: 'Edit Configuration', icon: '⚙️' },
                 { id: 'preview', label: 'Live Preview', icon: '👁️' }
               ].map(t => (
                 <button
                   key={t.id}
                   onClick={() => setActiveTab(t.id)}
                   className={`pb-4 font-bold text-sm uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${activeTab === t.id ? 'border-pink-400 text-pink-400' : 'border-transparent text-slate-400 hover:text-white hover:border-white/20'}`}
                 >
                   <span className="text-lg leading-none">{t.icon}</span> {t.label}
                 </button>
               ))}
             </div>

             {activeTab === 'edit' ? (
                <form onSubmit={handleSave} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2 group">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                         <span className="text-cyan-400">🏷️</span> Community Name
                       </label>
                       <input 
                         required 
                         value={form.name || ''} 
                         onChange={e => set('name', e.target.value)} 
                         className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium"
                         placeholder="The official title"
                       />
                     </div>
                     <div className="space-y-2 group">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                         <span className="text-pink-400">📂</span> Primary Category
                       </label>
                       <select 
                         value={form.category || ''} 
                         onChange={e => set('category', e.target.value)}
                         className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all font-medium appearance-none cursor-pointer"
                       >
                         {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{getCategoryIcon(c)} {c}</option>)}
                       </select>
                     </div>
                  </div>

                  <div className="space-y-2 group relative">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                       <span className="text-purple-400">📝</span> Charter / Description
                     </label>
                     <textarea 
                       required 
                       rows={5} 
                       value={form.description || ''} 
                       onChange={e => set('description', e.target.value)} 
                       className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium resize-y leading-relaxed"
                       placeholder="Detail your club's vision, routine activities, and member expectations..."
                     />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 rounded-3xl bg-white/5 border border-white/5">
                     <div className="space-y-2 group">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                         <span className="text-blue-400">🖼️</span> Emblem / Logo URL
                       </label>
                       <input 
                         value={form.logo || ''} 
                         onChange={e => set('logo', e.target.value)} 
                         className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm font-mono placeholder:font-sans"
                         placeholder="https://imgur.com/...png"
                       />
                     </div>
                     <div className="space-y-2 group">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                         <span className="text-emerald-400">🎨</span> Cover Header URL
                       </label>
                       <input 
                         value={form.coverImage || ''} 
                         onChange={e => set('coverImage', e.target.value)} 
                         className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm font-mono placeholder:font-sans"
                         placeholder="https://imgur.com/...jpg"
                       />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                       <span className="text-yellow-400">🔗</span> External Social Links
                     </label>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {[
                         { key: 'website', label: '🌐 Official Site', placeholder: 'https://...' },
                         { key: 'facebook', label: '📘 Facebook Page', placeholder: 'https://facebook.com/...' },
                         { key: 'instagram', label: '📷 Instagram Profile', placeholder: 'https://instagram.com/...' },
                         { key: 'twitter', label: '🐦 X / Twitter', placeholder: 'https://twitter.com/...' }
                       ].map(s => (
                         <div key={s.key} className="flex flex-col gap-1.5 focus-within:text-white text-slate-400">
                           <span className="text-[10px] uppercase font-black tracking-widest ml-1">{s.label}</span>
                           <input 
                             value={form.socialLinks?.[s.key] || ''} 
                             onChange={e => setSocial(s.key, e.target.value)} 
                             className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-2.5 text-white focus:border-white/30 focus:bg-white/5 transition-all outline-none text-sm placeholder:text-white/20"
                             placeholder={s.placeholder}
                           />
                         </div>
                       ))}
                     </div>
                  </div>

                  <div className="pt-8 border-t border-white/5">
                     <button 
                       type="submit" 
                       disabled={saving}
                       className="w-full md:w-auto px-10 py-4 rounded-xl font-black text-white uppercase tracking-widest bg-gradient-to-r from-cyan-500 to-pink-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 hover:-translate-y-1"
                     >
                       {saving ? 'Transmitting...' : '💾 Save Profile Architecture'}
                     </button>
                  </div>
                </form>
             ) : (
                <div className="bg-black/30 rounded-3xl p-8 border border-white/5 shadow-inner">
                   <h3 className="text-xl font-bold text-pink-400 mb-6 flex items-center gap-2">
                     <span className="animate-pulse w-2 h-2 rounded-full bg-pink-500" /> Active Preview Data
                   </h3>
                   <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                     <div>
                       <dt className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Display Name</dt>
                       <dd className="text-white font-medium">{form.name || '—'}</dd>
                     </div>
                     <div>
                       <dt className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Categorization</dt>
                       <dd className="text-white font-medium flex items-center gap-2">{form.category ? <>{getCategoryIcon(form.category)} {form.category}</> : '—'}</dd>
                     </div>
                     <div className="sm:col-span-2">
                       <dt className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Public Charter</dt>
                       <dd className="text-slate-300 text-sm leading-relaxed max-w-2xl">{form.description || '—'}</dd>
                     </div>
                     {Object.entries(form.socialLinks || {}).some(([_, v]) => v) && (
                       <div className="sm:col-span-2 border-t border-white/5 pt-6 mt-2">
                         <dt className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Linked Networks</dt>
                         <dd className="flex flex-wrap gap-3">
                           {Object.entries(form.socialLinks).map(([k, v]) => v && (
                             <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all capitalize flex items-center gap-2">
                               {k} ↗
                             </a>
                           ))}
                         </dd>
                       </div>
                     )}
                   </dl>
                </div>
             )}
          </div>
        </div>

        {/* Global Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { label: 'Registered Members', value: community?.members?.length || 0, icon: '👥', color: 'text-cyan-400' },
             { label: 'Archived & Live Events', value: community?.events?.length || 0, icon: '📅', color: 'text-pink-400' },
             { label: 'Date of Origin', value: new Date(community?.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }), icon: '🎂', color: 'text-purple-400' },
             { label: 'Operational Status', value: community?.status === 'approved' ? 'Online' : 'Offline', icon: '⚡', color: community?.status === 'approved' ? 'text-emerald-400' : 'text-amber-400' }
           ].map((s, i) => (
             <div key={i} className="glass-dark rounded-3xl p-6 border border-white/5 text-center flex flex-col justify-center items-center hover:bg-white/5 transition-colors group">
                <span className="text-3xl mb-3 opacity-80 group-hover:scale-125 transition-transform">{s.icon}</span>
                <span className={`text-2xl font-black mb-1 tracking-tight ${s.color}`}>{s.value}</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">{s.label}</span>
             </div>
           ))}
        </div>

      </div>
    </div>
  );
}