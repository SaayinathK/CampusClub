import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { 
  Users, Search, Filter, UserCheck, UserX, Clock, 
  Edit3, Trash2, ChevronLeft, ChevronRight, Shield, 
  GraduationCap, Building2, Check, X, Mail, 
   User as UserIcon, ShieldAlert, Zap, Globe, ShieldCheck,
   RefreshCw, Hash, Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ROLES = ['admin', 'community_admin', 'student', 'external'];
const STATUSES = ['pending', 'approved', 'rejected'];

export default function AdminUsers() {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: searchParams.get('role') || '',
    status: searchParams.get('status') || '',
    page: 1,
  });
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm]       = useState({});
  const [saving, setSaving]           = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.role) params.set('role', filters.role);
      if (filters.status) params.set('status', filters.status);
      params.set('page', filters.page);
      params.set('limit', 15);
      const res = await api.get(`/users?${params}`);
      setUsers(res.data.data);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      toast.error('Neural synchronization failure: Identity database unreachable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [filters]);

  const approveUser = async (id, name) => {
    try {
      await api.put(`/users/${id}/approve`);
      toast.success(`Identity authorized: Node ${name} online`);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Authorization failure'); }
  };

  const rejectUser = async (id, name) => {
    const reason = prompt(`Specify termination criteria for node ${name}:`);
    if (reason === null) return;
    try {
      await api.put(`/users/${id}/reject`, { reason });
      toast.success(`Node ${name} rejected from grid`);
      fetchUsers();
    } catch { toast.error('Termination sequence failure'); }
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setEditForm({ name: u.name || '', email: u.email || '', role: u.role || 'student', status: u.status || 'pending' });
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await api.put(`/users/${editingUser._id}`, editForm);
      toast.success('Identity node specifications updated');
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registry update failure');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Request permanent ejection for identity: ${name}? This action is irreversible.`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Identity node purged from global cluster');
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Purge failure'); }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.itNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <Shield size={12} strokeWidth={3} /> Global Registry Hub
             </div>
             <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none">
                Identity <span className="text-blue-100">Personnel</span>
             </h1>
             <p className="text-blue-100/90 font-medium text-sm lg:text-base uppercase tracking-wide">Managing access clearance and node synchronization.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10 w-full xl:w-auto">
             {[
               { label: 'Total Nodes', value: total, icon: Users, color: 'text-blue-100', bg: 'bg-white/10' },
               { label: 'Audit Queue', value: users.filter(u => u.status === 'pending').length, icon: Clock, color: 'text-blue-100', bg: 'bg-white/10' },
               { label: 'Authorized', value: users.filter(u => u.status === 'approved').length, icon: UserCheck, color: 'text-blue-100', bg: 'bg-white/10' },
               { label: 'Global Admins', value: users.filter(u => u.role === 'admin').length, icon: Shield, color: 'text-blue-100', bg: 'bg-white/10' },
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
                  {[{id: '', label: 'Full Registry'}, {id: 'admin', label: 'Overlords'}, {id: 'community_admin', label: 'Managers'}, {id: 'student', label: 'Students'}].map(r => (
                    <button
                       key={r.id}
                       onClick={() => setFilters(p => ({ ...p, role: r.id, page: 1 }))}
                       className={`px-4 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filters.role === r.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                    >
                      {r.label}
                    </button>
                  ))}
               </div>
               <div className="w-px h-6 bg-slate-100 hidden md:block" />
               <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                  {[{id: '', label: 'All Status'}, {id: 'pending', label: 'Waitlist'}, {id: 'approved', label: 'Cleared'}].map(s => (
                    <button
                       key={s.id}
                       onClick={() => setFilters(p => ({ ...p, status: s.id, page: 1 }))}
                       className={`px-4 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filters.status === s.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                    >
                      {s.label}
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
                  placeholder="Filter personnel via Identity, ID or Com-Address..." 
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
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Accessing Core Identity Matrix</p>
            </div>
         ) : filteredUsers.length === 0 ? (
            <div className="py-32 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
               <Users size={64} className="mx-auto text-slate-200 mb-6" />
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Identity Mismatch</h3>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">No personnel nodes detected within these parameters.</p>
            </div>
         ) : (
            <div className="overflow-x-auto rounded-[2rem] border border-slate-50">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50/50 text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 border-b border-slate-50">
                        <th className="px-8 py-6">Personnel Node</th>
                        <th className="px-8 py-6">Sector & Clearance</th>
                        <th className="px-8 py-6">Operational Affiliate</th>
                        <th className="px-8 py-6 text-right">Access Protocol</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredUsers.map((u, i) => (
                       <tr key={u._id || i} className="hover:bg-blue-50/20 transition-all group">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-[1.25rem] bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-900 font-black text-lg group-hover:scale-110 transition-transform">
                                   {u.name?.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                   <div className="text-sm font-black text-slate-950 uppercase tracking-tight truncate group-hover:text-blue-600 transition-colors leading-none mb-1">{u.name}</div>
                                   <div className="text-[10px] font-bold text-slate-400 truncate flex items-center gap-2">
                                      <Mail size={10} /> {u.email}
                                   </div>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex flex-col gap-2">
                                <div className="inline-flex px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest border border-blue-100 w-fit">
                                   {u.role?.replace('_', ' ')} protocol
                                </div>
                                <div className="flex items-center gap-2">
                                   <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'approved' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : u.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`} />
                                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{u.status} Registry</span>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             {u.itNumber ? (
                               <div className="text-[10px] font-black text-slate-900 font-mono tracking-widest mb-1.5 opacity-80">
                                  ID: <span className="text-blue-600">{u.itNumber}</span>
                               </div>
                             ) : (
                               <div className="text-[9px] font-black text-slate-300 uppercase italic tracking-widest mb-1.5">System Master Identity</div>
                             )}
                             <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-tight">
                                <Building2 size={12} className="text-slate-300" /> 
                                {u.role === 'student' ? (u.requestedCommunity?.name || 'Unassigned Node') : (u.managedCommunity?.name || u.communityName || 'Global Overlord')}
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                                {u.status === 'pending' && (
                                  <>
                                     <button onClick={() => approveUser(u._id, u.name)} className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 shadow-sm" title="Authorize Node">
                                        <Check size={18} strokeWidth={3} />
                                     </button>
                                     <button onClick={() => rejectUser(u._id, u.name)} className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all border border-rose-100 shadow-sm" title="Purge Node">
                                        <X size={18} strokeWidth={3} />
                                     </button>
                                  </>
                                )}
                                <button onClick={() => openEdit(u)} className="h-9 w-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all border border-slate-100 shadow-sm">
                                   <Edit3 size={16} />
                                </button>
                                {u.role !== 'admin' && (
                                  <button onClick={() => deleteUser(u._id, u.name)} className="h-9 w-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all border border-slate-100 shadow-sm">
                                     <Trash2 size={16} />
                                  </button>
                                )}
                             </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}

         {/* Pagination Cluster */}
         {pages > 1 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-50">
               <div className="flex items-center gap-3">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-lg">Cycle {filters.page} of {pages}</div>
                  <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Global Personnel Index</div>
               </div>
               <div className="flex items-center gap-3">
                  <button 
                     onClick={() => setFilters(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                     disabled={filters.page === 1}
                     className="h-11 px-6 rounded-xl bg-white text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:pointer-events-none transition-all border border-slate-100 flex items-center gap-2 shadow-sm"
                  >
                     <ChevronLeft size={16} /> Resync Prev
                  </button>
                  <button 
                     onClick={() => setFilters(p => ({ ...p, page: Math.min(pages, p.page + 1) }))}
                     disabled={filters.page === pages}
                     className="h-11 px-8 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20"
                  >
                     Sync Next <ChevronRight size={16} />
                  </button>
               </div>
            </div>
         )}
      </div>

      {/* Identity Configuration Console (Modal) */}
      <AnimatePresence>
         {editingUser && (
           <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md"
           >
              <motion.div 
                 initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                 className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] border-none overflow-hidden"
              >
                 <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="space-y-1">
                       <div className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em]">Identity Configurator</div>
                       <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Configure Personnel</h2>
                    </div>
                    <button onClick={() => setEditingUser(null)} className="h-10 w-10 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center">
                       <X size={20} strokeWidth={3} />
                    </button>
                 </div>
                 
                 <div className="p-8 space-y-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                          <UserIcon size={14} className="text-blue-600" /> Full Identity Alias
                       </label>
                       <div className="relative group">
                          <Fingerprint className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={16} />
                          <input 
                             value={editForm.name} 
                             onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                             className="input-modern pl-14 h-14 text-sm font-bold uppercase tracking-tight" 
                             placeholder="Personnel full name..." 
                          />
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                          <Mail size={14} className="text-blue-600" /> Neural Com-Link (Email)
                       </label>
                       <div className="relative group">
                          <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={16} />
                          <input 
                             value={editForm.email} 
                             onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                             className="input-modern pl-14 h-14 text-sm font-bold opacity-80" 
                             placeholder="Contact address..." 
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                             <ShieldAlert size={14} className="text-blue-600" /> Network Role
                          </label>
                          <select 
                             value={editForm.role} 
                             onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                             className="input-modern h-14 px-6 text-[11px] font-black uppercase tracking-widest appearance-none bg-white font-black"
                          >
                             {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                          </select>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                             <Check size={14} className="text-blue-600" /> Grid Status
                          </label>
                          <select 
                             value={editForm.status} 
                             onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                             className="input-modern h-14 px-6 text-[11px] font-black uppercase tracking-widest appearance-none bg-white font-black"
                          >
                             {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                       </div>
                    </div>
                 </div>

                 <div className="p-8 bg-slate-950 border-t border-white/5 flex gap-4">
                    <button onClick={() => setEditingUser(null)} className="flex-1 h-12 rounded-xl bg-white/5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all border border-white/10">Abort Config</button>
                    <button onClick={saveEdit} disabled={saving} className="flex-1 btn-primary h-12 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/30">
                       {saving ? 'Syncing Matrix...' : <><Zap size={14} /> Commit Changes</>}
                    </button>
                 </div>
              </motion.div>
           </motion.div>
         )}
      </AnimatePresence>

      <div className="p-10 card-modern border-slate-100 bg-slate-900 border-none relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-[3s]"><Shield size={120} fill="white" /></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-20 h-20 rounded-[2.5rem] bg-blue-600 text-white flex items-center justify-center shadow-2xl shrink-0"><ShieldCheck size={40} /></div>
            <div className="space-y-2 text-center md:text-left">
               <h4 className="text-2xl font-black text-white uppercase tracking-tight leading-none">Institutional Security Protocol</h4>
               <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-2xl uppercase tracking-wider opacity-80">
                  Global personnel management is audited through the Institutional Governance Overlay. All node synchronize actions and clearance updates are logged within the master oversight matrix.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
