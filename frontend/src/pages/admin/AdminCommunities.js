import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { 
  Building2, Search, Filter, Plus, Edit3, ExternalLink, 
  Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight, 
  TrendingUp, LayoutGrid, Shield, Layers, Calendar, 
   User as UserIcon, X, FileText, Tag, Zap, Globe, Users,
   ShieldCheck, Mail, RefreshCw, Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COMMUNITY_CATEGORIES = ['Technology', 'Arts', 'Sports', 'Academic', 'Cultural', 'Business', 'Science', 'Social', 'Other'];
const COMMUNITY_STATUSES = ['pending', 'approved', 'rejected'];

const CATEGORY_ICONS = {
  Technology: Zap, Arts: Edit3, Sports: Globe, Academic: ShieldCheck,
  Cultural: Globe, Business: Globe, Science: Zap, Social: Users, Other: Building2,
};

export default function AdminCommunities() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [editingCommunity, setEditingCommunity] = useState(null);
  const [editForm, setEditForm]                 = useState({});
  const [saving, setSaving]                     = useState(false);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/communities/all${params}`);
      setCommunities(res.data.data || []);
    } catch { toast.error('Neural synchronization failure: Entity registry unreachable'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCommunities(); }, [statusFilter]);

  const approveCommunity = async (id, name) => {
    try {
      await api.put(`/communities/${id}/approve`);
      toast.success(`Entity authorized: ${name} registry confirmed`);
      fetchCommunities();
    } catch (err) { toast.error(err.response?.data?.message || 'Authorization failure'); }
  };

  const rejectCommunity = async (id) => {
    const reason = prompt('Specify termination criteria (optional):');
    if (reason === null) return;
    try {
      await api.put(`/communities/${id}/reject`, { reason });
      toast.success('Entity registration rejected');
      fetchCommunities();
    } catch { toast.error('Termination failure'); }
  };

  const openEdit = (c) => {
    setEditingCommunity(c);
    setEditForm({ name: c.name || '', description: c.description || '', category: c.category || 'Other', status: c.status || 'pending' });
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await api.put(`/communities/${editingCommunity._id}`, editForm);
      toast.success('Institutional specifications updated');
      setEditingCommunity(null);
      fetchCommunities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Manual override failure');
    } finally {
      setSaving(false);
    }
  };

  const filteredCommunities = communities.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: communities.length,
    pending: communities.filter(c => c.status === 'pending').length,
    approved: communities.filter(c => c.status === 'approved').length,
    rejected: communities.filter(c => c.status === 'rejected').length,
  };

  const rise = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-10 animate-in fade-in duration-700">
      
        <motion.div initial={rise.initial} animate={rise.animate} transition={{ duration: 0.6 }} className="rounded-[2.5rem] p-10 md:p-12 bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 border border-blue-300/30 shadow-[0_30px_70px_-30px_rgba(37,99,235,0.55)] flex flex-col xl:flex-row justify-between items-center gap-8 relative overflow-hidden text-white">
           <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl opacity-50 -mr-40 -mt-40 pointer-events-none" />
          
          <div className="relative z-10 text-center xl:text-left space-y-2">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-[9px] font-black uppercase tracking-widest border border-white/25 mb-2">
                <ShieldCheck size={12} strokeWidth={3} /> Global Organization Grid
             </div>
             <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none">
                Entity <span className="text-blue-100">Registry</span>
             </h1>
             <p className="text-blue-100/90 font-medium text-sm lg:text-base uppercase tracking-wide">Managing institutional nodes and organizational clusters.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10 w-full xl:w-auto">
             {[
               { label: 'Registered Entities', value: stats.total, icon: Building2, color: 'text-blue-100', bg: 'bg-white/10' },
               { label: 'Under Audit', value: stats.pending, icon: Clock, color: 'text-blue-100', bg: 'bg-white/10' },
               { label: 'Authorized Live', value: stats.approved, icon: CheckCircle2, color: 'text-blue-100', bg: 'bg-white/10' },
               { label: 'Aborted Nodes', value: stats.rejected, icon: XCircle, color: 'text-blue-100', bg: 'bg-white/10' },
             ].map((s, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm text-center space-y-1 shadow-lg">
                   <div className="flex justify-center mb-1"><s.icon size={14} className={s.color} /></div>
                   <div className="text-xl font-black text-white leading-none">{s.value}</div>
                   <div className="text-[8px] font-black text-blue-100/90 uppercase tracking-widest leading-none">{s.label}</div>
                </div>
             ))}
          </div>
      </motion.div>

      {/* Controller & Filter Console */}
      <div className="card-modern bg-white border border-blue-100 shadow-[0_22px_50px_-28px_rgba(37,99,235,0.35)] overflow-hidden p-8 space-y-8">
         <div className="flex flex-col xl:flex-row items-center justify-between gap-8">
            <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
               <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                  {[
                    {id: '', label: 'Full Cluster'},
                    {id: 'pending', label: 'Auditing Nodes'},
                    {id: 'approved', label: 'Authorized'},
                    {id: 'rejected', label: 'Purged'}
                  ].map(f => (
                    <button
                       key={f.id}
                       onClick={() => setStatusFilter(f.id)}
                       className={`px-4 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === f.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                    >
                      {f.label}
                    </button>
                  ))}
               </div>
            </div>

            <div className="relative w-full xl:w-96 group">
               <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
               <input 
                  type="text" 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)}
                  className="input-modern pl-12 h-12 text-xs font-bold uppercase tracking-widest placeholder:normal-case"
                  placeholder="Filter organizations or sector types..." 
               />
               {searchTerm && (
                 <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900">
                   <X size={16} />
                 </button>
               )}
            </div>
         </div>

         {loading ? (
            <div className="py-20 flex flex-col items-center justify-center opacity-50 italic">
               <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Retrieving Organizational Matrix</p>
            </div>
         ) : filteredCommunities.length === 0 ? (
            <div className="py-32 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
               <LayoutGrid size={64} className="mx-auto text-slate-200 mb-6" />
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Catalogue Gap Detected</h3>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">No entity nodes detected within these parameters.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {filteredCommunities.map((c, idx) => (
                  <motion.div 
                     key={c._id || idx} 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.05 }}
                     className="p-8 rounded-[2.5rem] bg-gradient-to-b from-white to-blue-50/40 border border-blue-100 hover:border-blue-200 hover:shadow-[0_40px_80px_-20px_rgba(37,99,235,0.18)] transition-all flex flex-col group relative overflow-hidden"
                  >
                     <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-50 overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${c.status === 'approved' ? 'bg-emerald-500 w-full' : c.status === 'pending' ? 'bg-amber-500 w-1/2' : 'bg-rose-500 w-full'}`} />
                     </div>

                     <div className="flex items-start justify-between mb-8">
                        <div className="w-16 h-16 rounded-[1.25rem] bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl font-black text-blue-600 uppercase shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                           {c.logo ? <img src={c.logo} alt="logo" className="w-full h-full object-cover" /> : c.name?.charAt(0)}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-[8px] font-black uppercase tracking-widest text-white italic border border-white/10 shadow-lg">
                              {c.category} sector
                           </span>
                           <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${c.status === 'approved' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : c.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`} />
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{c.status} Registry</span>
                           </div>
                        </div>
                     </div>

                     <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1 uppercase tracking-tight leading-none">{c.name}</h3>
                     <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-8 h-10 italic group-hover:text-slate-800 transition-colors">"{c.description || 'Institutional organization cluster.'}"</p>

                     <div className="grid grid-cols-2 gap-4 mb-8 p-5 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-blue-50/50 group-hover:border-blue-100 transition-all">
                        <div className="space-y-1">
                           <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Hub Lead</div>
                           <div className="text-[10px] font-black text-slate-900 truncate flex items-center gap-1.5 uppercase">
                              <UserIcon size={12} className="text-blue-500" /> {c.admin?.name || 'Authorized'}
                           </div>
                        </div>
                        <div className="space-y-1 border-l border-slate-200 pl-4">
                           <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Origin Cycle</div>
                           <div className="text-[10px] font-black text-slate-900 truncate flex items-center gap-1.5 uppercase tracking-tighter">
                              <Calendar size={12} className="text-blue-500" /> {new Date(c.createdAt).toLocaleDateString()}
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-col gap-3 mt-auto">
                        {c.status === 'pending' && (
                          <div className="flex gap-3">
                             <button onClick={() => approveCommunity(c._id, c.name)} className="flex-1 h-12 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20">
                                <CheckCircle2 size={16} strokeWidth={3} /> Authorize Node
                             </button>
                             <button onClick={() => rejectCommunity(c._id)} className="w-12 h-12 rounded-xl border border-rose-100 bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center shadow-sm">
                                <XCircle size={18} strokeWidth={3} />
                             </button>
                          </div>
                        )}
                        <div className="flex gap-3">
                           <button onClick={() => openEdit(c)} className="flex-1 h-12 rounded-xl bg-white border border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                              <Edit3 size={16} /> Config Manual
                           </button>
                           {c.status === 'approved' && (
                             <Link to={`/clubs/${c._id}`} className="w-12 h-12 rounded-xl border border-slate-100 bg-white text-slate-300 hover:text-blue-600 hover:border-blue-400 transition-all flex items-center justify-center shadow-sm">
                                <ExternalLink size={18} />
                             </Link>
                           )}
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
         )}
      </div>

      {/* Identity Configuration Console (Modal) */}
      <AnimatePresence>
         {editingCommunity && (
           <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md"
           >
              <motion.div 
                 initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                 className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-[0_0_80px_rgba(37,99,235,0.2)] border-none overflow-hidden"
              >
                 <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="space-y-1">
                       <div className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em]">Entity Overrider</div>
                       <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Configure Node</h2>
                    </div>
                    <button onClick={() => setEditingCommunity(null)} className="h-10 w-10 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center">
                       <X size={20} strokeWidth={3} />
                    </button>
                 </div>
                 
                 <div className="p-8 space-y-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                          <Building2 size={14} className="text-blue-600" /> Operational Alias
                       </label>
                       <input 
                          value={editForm.name} 
                          onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                          className="input-modern h-14 text-sm font-bold uppercase tracking-tight px-6" 
                          placeholder="Organization name..." 
                       />
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                          <FileText size={14} className="text-blue-600" /> Tactical Bio / Charter
                       </label>
                       <textarea 
                          value={editForm.description} 
                          onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                          className="input-modern min-h-[120px] p-6 text-sm font-medium leading-relaxed resize-none" 
                          placeholder="Mission goals and objectives..." 
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                             <Tag size={14} className="text-blue-600" /> Data sector
                          </label>
                          <select 
                             value={editForm.category} 
                             onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                             className="input-modern h-14 px-5 text-[11px] font-black uppercase tracking-widest appearance-none bg-white"
                          >
                             {COMMUNITY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                             <Layers size={14} className="text-blue-600" /> Override Status
                          </label>
                          <select 
                             value={editForm.status} 
                             onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                             className="input-modern h-14 px-5 text-[11px] font-black uppercase tracking-widest appearance-none bg-white"
                          >
                             {COMMUNITY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                       </div>
                    </div>
                 </div>

                 <div className="p-8 bg-slate-950 border-t border-white/5 flex gap-4">
                    <button onClick={() => setEditingCommunity(null)} className="flex-1 h-12 rounded-xl bg-white/5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all border border-white/10">Abort Sync</button>
                    <button onClick={saveEdit} disabled={saving} className="flex-1 btn-primary h-12 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/30">
                       {saving ? 'Synchronizing...' : <><Zap size={14} /> Commit Changes</>}
                    </button>
                 </div>
              </motion.div>
           </motion.div>
         )}
      </AnimatePresence>

      <div className="p-10 card-modern border-slate-100 bg-slate-900 border-none relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-[3s]"><Building2 size={120} fill="white" /></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-600 text-white flex items-center justify-center shadow-2xl shrink-0"><ShieldCheck size={40} /></div>
            <div className="space-y-2 text-center md:text-left">
               <h4 className="text-2xl font-black text-white uppercase tracking-tight leading-none">Institutional Entity Registry</h4>
               <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-2xl uppercase tracking-wider opacity-80">
                  Organizational clusters are managed under the Institutional Governance Overlay. All entity registrations and operational override actions are logged within the master oversight matrix for total node accountability.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}