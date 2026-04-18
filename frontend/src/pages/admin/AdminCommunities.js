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
    <div className="min-h-screen p-6 md:p-10 font-sans text-slate-900 relative overflow-hidden bg-slate-50">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-cyan-300/30 rounded-full filter blur-[150px] animate-blob pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-300/30 rounded-full filter blur-[120px] animation-delay-4000 animate-blob pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-10">
        
        {/* Header */}
        <header className="bg-white rounded-3xl p-8 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative group overflow-hidden shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-400 p-[2px] shadow-sm">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-3xl">
                🏛️
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-1 tracking-tight">
                COMMUNITY <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">MANAGEMENT</span>
              </h2>
              <div className="flex items-center gap-4 flex-wrap mt-2">
                <span className="px-3 py-1 bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-bold rounded-full flex items-center gap-1.5">
                  🏛️ {stats.total} Total Communties
                </span>
                <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1.5">
                  ⏳ {stats.pending} Pending Review
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 relative z-10">
            <Link to="/admin" className="bg-white hover:bg-slate-50 px-6 py-3 rounded-full font-bold text-slate-700 transition-all hover:-translate-y-1 border border-slate-200 flex items-center gap-2 shadow-sm">
              ← Dashboard
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Communities', value: stats.total, icon: '🏛️', color: 'text-cyan-600', border: 'hover:border-cyan-300', gradient: 'from-cyan-50 to-transparent', ring: 'shadow-sm hover:shadow-md' },
            { label: 'Pending Approval', value: stats.pending, icon: '⏳', color: 'text-amber-600', border: 'hover:border-amber-300', gradient: 'from-amber-50 to-transparent', ring: 'shadow-sm hover:shadow-md' },
            { label: 'Active Communities', value: stats.approved, icon: '✓', color: 'text-emerald-600', border: 'hover:border-emerald-300', gradient: 'from-emerald-50 to-transparent', ring: 'shadow-sm hover:shadow-md' },
            { label: 'Rejected Communities', value: stats.rejected, icon: '✗', color: 'text-rose-600', border: 'hover:border-rose-300', gradient: 'from-rose-50 to-transparent', ring: 'shadow-sm hover:shadow-md' },
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

        {/* Filters Toolbar */}
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: '', label: 'All', icon: '📋' },
              { id: 'pending', label: 'Pending', icon: '⏳', color: 'text-amber-600 hover:text-amber-700' },
              { id: 'approved', label: 'Approved', icon: '✓', color: 'text-emerald-600 hover:text-emerald-700' },
              { id: 'rejected', label: 'Rejected', icon: '✗', color: 'text-rose-600 hover:text-rose-700' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all border flex items-center gap-2 ${statusFilter === f.id ? `bg-slate-50 ${f.color || 'text-cyan-700'} border-slate-300 shadow-sm` : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <span>{f.icon}</span> {f.label}
              </button>
            ))}
          </div>
          
          <div className="relative w-full lg:w-96 group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-cyan-600 transition-colors">🔍</span>
            <input type="text" placeholder="Search by name or category..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-10 py-3 text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all font-medium" />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors">✕</button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
           <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
              <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
              <span className="text-cyan-600 font-medium tracking-widest uppercase text-sm animate-pulse">Loading Communities...</span>
           </div>
        ) : filteredCommunities.length === 0 ? (
           <div className="flex flex-col items-center justify-center text-center p-16 bg-white rounded-3xl border border-slate-200 shadow-sm text-slate-900">
              <span className="text-6xl mb-6 opacity-50">🏛️</span>
              <h3 className="text-3xl font-black mb-3">No results found</h3>
              <p className="text-slate-500 font-medium max-w-md">Try adjusting your filters or search terms.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCommunities.map(c => {
               const statusColor = c.status === 'pending' ? 'bg-amber-500 text-amber-500 border-amber-500' : c.status === 'approved' ? 'bg-emerald-500 text-emerald-500 border-emerald-500' : 'bg-rose-500 text-rose-500 border-rose-500';
               const statusText = c.status === 'pending' ? 'text-amber-700 bg-amber-50 border-amber-200' : c.status === 'approved' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-rose-700 bg-rose-50 border-rose-200';

               return (
                <div key={c._id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group relative flex flex-col">
                  {/* Decorative Top Ribbon */}
                  <div className={`h-1.5 w-full opacity-60 group-hover:opacity-100 transition-opacity ${statusColor.split(' ')[0]}`} />
                  
                  <div className="p-6 md:p-8 flex flex-col h-full w-full">
                     <div className="flex items-start gap-5 mb-5">
                       <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-100 to-purple-100 flex items-center justify-center text-3xl shrink-0 shadow-sm border border-slate-200 text-slate-700 font-black overflow-hidden relative">
                         {c.logo ? <img src={c.logo} alt="logo" className="w-full h-full object-cover" /> : c.name?.charAt(0)}
                       </div>
                       <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xl text-slate-900 group-hover:text-cyan-600 transition-colors leading-tight line-clamp-1 mb-2">{c.name}</h3>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded bg-slate-100 text-slate-600 border border-slate-200">{c.category}</span>
                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded border flex items-center gap-1 ${statusText}`}>
                              {c.status}
                            </span>
                          </div>
                       </div>
                     </div>

                     <p className="text-sm text-slate-600 mb-6 line-clamp-3 leading-relaxed flex-1">
                        {c.description || 'No description provided.'}
                     </p>

                     <div className="space-y-3 mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
                        <div className="flex items-center gap-3 w-full">
                           <span className="text-purple-600 text-lg">👤</span>
                           <div className="flex flex-col min-w-0">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Admin</span>
                              <span className="text-slate-700 font-medium truncate leading-tight mt-1">{c.admin?.name || 'Unknown'}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 w-full border-t border-slate-200 pt-3">
                           <span className="text-cyan-600 text-lg">📅</span>
                           <div className="flex flex-col min-w-0">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Created On</span>
                              <span className="text-slate-700 font-medium truncate leading-tight mt-1">{new Date(c.createdAt).toLocaleDateString()}</span>
                           </div>
                        </div>
                     </div>

                     <div className="mt-auto space-y-2">
                        {c.status === 'pending' && (
                          <div className="flex gap-2">
                             <button onClick={() => approveCommunity(c._id, c.name)} className="flex-1 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 font-bold text-xs uppercase tracking-widest text-emerald-600 hover:bg-emerald-100 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2">✓ Approve</button>
                             <button onClick={() => rejectCommunity(c._id)} className="flex-1 py-2.5 rounded-xl bg-rose-50 border border-rose-200 font-bold text-xs uppercase tracking-widest text-rose-600 hover:bg-rose-100 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2">✗ Reject</button>
                          </div>
                        )}
                        <div className="flex gap-2">
                          {c.status === 'approved' && (
                            <Link to={`/clubs/${c._id}`} className="flex-1 py-2.5 rounded-xl bg-cyan-50 border border-cyan-200 font-bold text-xs uppercase tracking-widest text-cyan-700 hover:bg-cyan-100 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2">
                              👁️ View →
                            </Link>
                          )}
                          <button onClick={() => openEdit(c)} className="flex-1 py-2.5 rounded-xl bg-blue-50 border border-blue-200 font-bold text-xs uppercase tracking-widest text-blue-600 hover:bg-blue-100 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2">
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
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditingCommunity(null)} />
          <div className="relative bg-white border border-slate-200 text-slate-900 rounded-3xl p-8 w-full max-w-md mx-4 shadow-xl">
            <h2 className="text-xl font-black uppercase tracking-widest mb-6">Edit Community</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Name</label>
                <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Description</label>
                <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 text-sm resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Category</label>
                  <select value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 text-sm">
                    {COMMUNITY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Status</label>
                  <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 text-sm">
                    {COMMUNITY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setEditingCommunity(null)}
                className="flex-1 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-widest transition-all">
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