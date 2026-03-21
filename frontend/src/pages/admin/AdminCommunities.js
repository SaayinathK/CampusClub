import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const COMMUNITY_CATEGORIES = ['Technology', 'Arts', 'Sports', 'Academic', 'Cultural', 'Business', 'Science', 'Social', 'Other'];
const COMMUNITY_STATUSES = ['pending', 'approved', 'rejected'];

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
    } catch { toast.error('Failed to load communities'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCommunities(); }, [statusFilter]);

  const approveCommunity = async (id, name) => {
    try {
      await api.put(`/communities/${id}/approve`);
      toast.success(`${name} approved`);
      fetchCommunities();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const rejectCommunity = async (id) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    try {
      await api.put(`/communities/${id}/reject`, { reason });
      toast.success('Community rejected');
      fetchCommunities();
    } catch { toast.error('Failed to reject'); }
  };

  const openEdit = (c) => {
    setEditingCommunity(c);
    setEditForm({ name: c.name || '', description: c.description || '', category: c.category || 'Other', status: c.status || 'pending' });
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await api.put(`/communities/${editingCommunity._id}`, editForm);
      toast.success('Community updated');
      setEditingCommunity(null);
      fetchCommunities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
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

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans text-slate-100 relative overflow-hidden bg-[#020617]">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full mix-blend-screen filter blur-[150px] animate-blob pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full mix-blend-screen filter blur-[120px] animation-delay-4000 animate-blob pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-10">
        
        {/* Header */}
        <header className="glass-dark rounded-3xl p-8 border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative group overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 p-[2px] shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-3xl">
                🏛️
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-1 tracking-tight">
                COMMUNITY <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">MANAGEMENT</span>
              </h2>
              <div className="flex items-center gap-4 flex-wrap mt-2">
                <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold rounded-full flex items-center gap-1.5">
                  🏛️ {stats.total} Total Communties
                </span>
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold rounded-full flex items-center gap-1.5">
                  ⏳ {stats.pending} Pending Review
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 relative z-10">
            <Link to="/admin" className="glass hover:bg-white/10 px-6 py-3 rounded-full font-bold text-white transition-all hover:-translate-y-1 border border-white/10 flex items-center gap-2">
              ← Dashboard
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Communities', value: stats.total, icon: '🏛️', color: 'text-cyan-400', border: 'hover:border-cyan-500/50', gradient: 'from-cyan-500/10 to-transparent', ring: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]' },
            { label: 'Pending Approval', value: stats.pending, icon: '⏳', color: 'text-amber-400', border: 'hover:border-amber-500/50', gradient: 'from-amber-500/10 to-transparent', ring: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]' },
            { label: 'Active Communities', value: stats.approved, icon: '✓', color: 'text-emerald-400', border: 'hover:border-emerald-500/50', gradient: 'from-emerald-500/10 to-transparent', ring: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]' },
            { label: 'Rejected Communities', value: stats.rejected, icon: '✗', color: 'text-rose-400', border: 'hover:border-rose-500/50', gradient: 'from-rose-500/10 to-transparent', ring: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]' },
          ].map((s, i) => (
            <div key={i} className={`glass-dark rounded-3xl p-6 border border-white/5 transition-all duration-300 hover:-translate-y-1 ${s.border} ${s.ring} relative group overflow-hidden`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative z-10 flex justify-between items-start mb-4">
                <span className="text-3xl drop-shadow-lg">{s.icon}</span>
              </div>
              <div className={`relative z-10 text-4xl font-black ${s.color} mb-2 tracking-tight`}>{s.value}</div>
              <div className="relative z-10 text-sm font-semibold text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters Toolbar */}
        <div className="glass-dark rounded-2xl p-4 md:p-6 border border-white/5 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: '', label: 'All', icon: '📋' },
              { id: 'pending', label: 'Pending', icon: '⏳', color: 'text-amber-400 hover:text-amber-300' },
              { id: 'approved', label: 'Approved', icon: '✓', color: 'text-emerald-400 hover:text-emerald-300' },
              { id: 'rejected', label: 'Rejected', icon: '✗', color: 'text-rose-400 hover:text-rose-300' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all border flex items-center gap-2 ${statusFilter === f.id ? `bg-white/10 ${f.color || 'text-cyan-400'} border-white/20 shadow-lg` : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <span>{f.icon}</span> {f.label}
              </button>
            ))}
          </div>
          
          <div className="relative w-full lg:w-96 group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-cyan-400 transition-colors">🔍</span>
            <input type="text" placeholder="Search by name or category..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-10 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium" />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">✕</button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
           <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
              <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
              <span className="text-cyan-400 font-medium tracking-widest uppercase text-sm animate-pulse">Loading Communities...</span>
           </div>
        ) : filteredCommunities.length === 0 ? (
           <div className="flex flex-col items-center justify-center text-center p-16 glass-dark rounded-3xl border border-white/5 opacity-80 backdrop-blur-3xl shadow-2xl">
              <span className="text-6xl mb-6 drop-shadow-2xl opacity-50">🏛️</span>
              <h3 className="text-3xl font-black mb-3 text-white">No results found</h3>
              <p className="text-slate-400 font-medium max-w-md">Try adjusting your filters or search terms.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCommunities.map(c => {
               const statusColor = c.status === 'pending' ? 'bg-amber-500 text-amber-500 border-amber-500' : c.status === 'approved' ? 'bg-emerald-500 text-emerald-500 border-emerald-500' : 'bg-rose-500 text-rose-500 border-rose-500';
               const statusText = c.status === 'pending' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : c.status === 'approved' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20';

               return (
                <div key={c._id} className="glass-dark border border-white/5 rounded-3xl overflow-hidden shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 group relative flex flex-col">
                  {/* Decorative Top Ribbon */}
                  <div className={`h-1.5 w-full opacity-60 group-hover:opacity-100 transition-opacity ${statusColor.split(' ')[0]}`} />
                  
                  <div className="p-6 md:p-8 flex flex-col h-full w-full">
                     <div className="flex items-start gap-5 mb-5">
                       <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-3xl shrink-0 shadow-lg border border-white/10 text-white font-black overflow-hidden relative">
                         <div className="absolute inset-0 bg-gradient-to-bl from-white/10 to-transparent pointer-events-none" />
                         {c.logo ? <img src={c.logo} alt="logo" className="w-full h-full object-cover" /> : c.name?.charAt(0)}
                       </div>
                       <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xl text-white group-hover:text-cyan-400 transition-colors leading-tight line-clamp-1 mb-2">{c.name}</h3>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded bg-white/5 text-slate-300 border border-white/10">{c.category}</span>
                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded border flex items-center gap-1 ${statusText}`}>
                              {c.status}
                            </span>
                          </div>
                       </div>
                     </div>

                     <p className="text-sm text-slate-400 mb-6 line-clamp-3 leading-relaxed flex-1">
                        {c.description || 'No description provided.'}
                     </p>

                     <div className="space-y-3 mb-6 p-4 rounded-xl bg-black/20 border border-white/5 text-sm">
                        <div className="flex items-center gap-3 w-full">
                           <span className="text-purple-400 text-lg">👤</span>
                           <div className="flex flex-col min-w-0">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Admin</span>
                              <span className="text-slate-300 font-medium truncate leading-tight mt-1">{c.admin?.name || 'Unknown'}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 w-full border-t border-white/5 pt-3">
                           <span className="text-cyan-400 text-lg">📅</span>
                           <div className="flex flex-col min-w-0">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Created On</span>
                              <span className="text-slate-300 font-medium truncate leading-tight mt-1">{new Date(c.createdAt).toLocaleDateString()}</span>
                           </div>
                        </div>
                     </div>

                     <div className="mt-auto space-y-2">
                        {c.status === 'pending' && (
                          <div className="flex gap-2">
                             <button onClick={() => approveCommunity(c._id, c.name)} className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 font-bold text-xs uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/20 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2">✓ Approve</button>
                             <button onClick={() => rejectCommunity(c._id)} className="flex-1 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 font-bold text-xs uppercase tracking-widest text-rose-400 hover:bg-rose-500/20 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2">✗ Reject</button>
                          </div>
                        )}
                        <div className="flex gap-2">
                          {c.status === 'approved' && (
                            <Link to={`/clubs/${c._id}`} className="flex-1 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 font-bold text-xs uppercase tracking-widest text-cyan-400 hover:bg-cyan-500/20 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2">
                              👁️ View →
                            </Link>
                          )}
                          <button onClick={() => openEdit(c)} className="flex-1 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 font-bold text-xs uppercase tracking-widest text-blue-400 hover:bg-blue-500/20 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2">
                            ✏️ Edit
                          </button>
                        </div>
                     </div>
                  </div>
                </div>
               );
            })}
          </div>
        )}

      </div>

      {/* Edit Community Modal */}
      {editingCommunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditingCommunity(null)} />
          <div className="relative bg-[#0d1117] border border-white/10 rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-xl font-black uppercase tracking-widest mb-6">Edit Community</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Name</label>
                <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Description</label>
                <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Category</label>
                  <select value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm">
                    {COMMUNITY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Status</label>
                  <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm">
                    {COMMUNITY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setEditingCommunity(null)}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 font-black uppercase text-[10px] tracking-widest transition-all">
                Cancel
              </button>
              <button onClick={saveEdit} disabled={saving}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-widest transition-all disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}