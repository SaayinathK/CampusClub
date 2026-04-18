import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { 
  User, Shield, Lock, Save, ArrowLeft, Mail, Hash, 
   UserCircle, Info, Calendar, Settings, Key, Fingerprint, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentProfile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('identity');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Identity specifications updated');
    } catch {
      toast.error('Specification update failure');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'identity', label: 'Identity Protocol', icon: UserCircle },
    { id: 'security', label: 'Security Firewall', icon: Shield },
  ];

  const rise = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-10 animate-in fade-in duration-700">
      
      {/* Header Command */}
      <div className="flex items-center justify-between px-2">
         <Link to="/student" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
            <ArrowLeft size={14} strokeWidth={3} /> Terminal Dashboard
         </Link>
         <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400 tracking-widest">
            <Settings size={14} /> Account Configuration Mode
         </div>
      </div>

      <div className="card-modern overflow-hidden bg-white">
          {/* Elite Profile Hero */}
          <div className="relative h-48 bg-slate-100 overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700" />
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
             <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          <div className="px-10 pb-10">
             <div className="flex flex-col md:flex-row items-center md:items-end gap-8 -mt-16 mb-10 relative z-10">
                <div className="relative group">
                   <div className="w-40 h-40 rounded-[2.5rem] border-[6px] border-white bg-blue-600 flex items-center justify-center text-5xl font-black text-white shadow-2xl overflow-hidden">
                      {user?.name?.charAt(0).toUpperCase()}
                   </div>
                   <div className="absolute bottom-2 right-2 w-10 h-10 rounded-xl bg-emerald-500 border-4 border-white flex items-center justify-center text-white shadow-lg">
                      <CheckCircle2 size={18} strokeWidth={3} />
                   </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-2">
                   <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest border border-blue-100">
                         {user?.role} NODE
                      </div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional ID: {user?.itNumber}</div>
                   </div>
                   <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">{user?.name}</h2>
                   <p className="text-slate-500 font-medium text-sm max-w-xl">Member of the SLIIT Institutional Cluster since {new Date(user?.createdAt).getFullYear()}.</p>
                </div>
             </div>

             {/* Tabbed Interface Control */}
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
                {activeTab === 'identity' ? (
                   <form onSubmit={handleSave} className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <User size={14} className="text-blue-500" /> Full Legal Alias
                            </label>
                            <input
                               value={form.name}
                               onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                               required
                               className="w-full input-modern h-14 px-6 text-sm font-bold uppercase tracking-wide"
                               placeholder="Assign Alias..."
                            />
                         </div>

                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <Mail size={14} className="text-blue-500" /> Authorized Email Node
                            </label>
                            <div className="relative group">
                               <input
                                  value={user?.email || ''}
                                  disabled
                                  className="w-full input-modern h-14 px-6 bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed border-none font-bold"
                               />
                               <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-black uppercase">
                                  <Lock size={10} /> Verified
                               </div>
                            </div>
                         </div>

                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <Hash size={14} className="text-blue-500" /> Institutional Registry Number
                            </label>
                            <div className="relative group">
                               <input
                                  value={user?.itNumber || ''}
                                  disabled
                                  className="w-full input-modern h-14 px-6 bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed border-none font-bold"
                               />
                               <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-200 text-slate-500 border border-slate-300 text-[8px] font-black uppercase">
                                  <Lock size={10} /> Static
                               </div>
                            </div>
                         </div>

                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <Calendar size={14} className="text-blue-500" /> Account Creation Sequence
                            </label>
                            <div className="w-full h-14 px-6 flex items-center bg-slate-50 rounded-2xl border border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest">
                               {new Date(user?.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Info size={14} className="text-blue-500" /> Identity Bio / Objectives
                         </label>
                         <textarea
                            rows={4}
                            value={form.bio}
                            onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                            placeholder="Log your interests, tactical skills, or community objectives..."
                            className="w-full input-modern p-6 h-40 resize-none text-sm font-medium leading-relaxed"
                         />
                      </div>

                      <div className="pt-8 flex justify-end">
                         <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary h-14 px-12 text-xs font-black uppercase flex items-center gap-3 shadow-xl"
                         >
                            {saving ? 'Synchronizing Cluster...' : <><Save size={18} /> Update Specifications</>}
                         </button>
                      </div>
                   </form>
                ) : (
                   <div className="py-20 text-center max-w-xl mx-auto space-y-10">
                      <div className="w-24 h-24 rounded-[2.5rem] bg-blue-50 flex items-center justify-center text-blue-600 mx-auto shadow-inner">
                         <Fingerprint size={48} strokeWidth={1.5} />
                      </div>
                      <div className="space-y-3">
                         <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Security Firewall</h3>
                         <p className="text-slate-500 text-sm font-medium leading-relaxed uppercase tracking-wider">The security management protocols are currently being optimized for higher encryption standards.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         {[
                            { label: 'Credentials', icon: Key, desc: 'Rotate access password' },
                            { label: 'Clearance', icon: Shield, desc: 'Multi-factor settings' },
                         ].map((item, i) => (
                            <button key={i} onClick={() => toast.info('Module integrity check in progress.')} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-left group hover:border-blue-200 hover:bg-white transition-all">
                               <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                  <item.icon size={18} strokeWidth={2.5} />
                               </div>
                               <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{item.label}</h4>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{item.desc}</p>
                            </button>
                         ))}
                      </div>
                   </div>
                )}
             </motion.div>
          </div>

          <div className="bg-slate-950 p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5">
             <div className="flex items-center gap-3 text-white/40 uppercase font-black text-[9px] tracking-[0.3em]">
                <Shield size={12} /> Institutional Integrity Active
             </div>
             <div className="text-white/20 text-[9px] font-black uppercase tracking-widest">
                Global Operations Matrix - Version 2.0.4-Stable
             </div>
          </div>
      </div>
    </div>
  );
}