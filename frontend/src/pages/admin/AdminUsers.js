import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

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
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [filters]);

  const approveUser = async (id, name) => {
    try {
      await api.put(`/users/${id}/approve`);
      toast.success(`${name} approved`);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const rejectUser = async (id, name) => {
    const reason = prompt(`Reason for rejecting ${name}:`);
    if (reason === null) return;
    try {
      await api.put(`/users/${id}/reject`, { reason });
      toast.success(`${name} rejected`);
      fetchUsers();
    } catch { toast.error('Failed'); }
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setEditForm({ name: u.name || '', email: u.email || '', role: u.role || 'student', status: u.status || 'pending' });
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await api.put(`/users/${editingUser._id}`, editForm);
      toast.success('User updated');
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete user ${name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const stats = {
    total: total,
    pending: users.filter(u => u.status === 'pending').length,
    approved: users.filter(u => u.status === 'approved').length,
    rejected: users.filter(u => u.status === 'rejected').length,
    admin: users.filter(u => u.role === 'admin').length,
    communityAdmin: users.filter(u => u.role === 'community_admin').length,
    student: users.filter(u => u.role === 'student').length,
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.itNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans text-slate-900 relative overflow-hidden bg-slate-50">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-purple-300/30 rounded-full filter blur-[150px] animate-blob pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-cyan-300/30 rounded-full filter blur-[120px] animation-delay-4000 animate-blob pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-10">
        
        {/* Header */}
        <header className="bg-white rounded-3xl p-8 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative group overflow-hidden shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-400 p-[2px] shadow-sm">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-3xl">
                👥
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-1 tracking-tight">
                USER <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">MANAGEMENT</span>
              </h2>
              <div className="flex items-center gap-4 flex-wrap mt-2">
                <span className="px-3 py-1 bg-pink-50 border border-pink-200 text-pink-700 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm">
                  👥 {total} Total Users Network
                </span>
                {stats.pending > 0 && (
                  <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1.5 animate-pulse shadow-sm">
                    ⏳ {stats.pending} Applications Pending
                  </span>
                )}
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
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total', value: stats.total, icon: '👥', color: 'text-cyan-600' },
            { label: 'Pending', value: stats.pending, icon: '⏳', color: 'text-amber-600' },
            { label: 'Approved', value: stats.approved, icon: '✓', color: 'text-emerald-600' },
            { label: 'Rejected', value: stats.rejected, icon: '✗', color: 'text-rose-600' },
            { label: 'Admins', value: stats.admin, icon: '👑', color: 'text-purple-600' },
            { label: 'Students', value: stats.student, icon: '🎓', color: 'text-pink-600' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center relative group overflow-hidden transition-all duration-300 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 p-2 opacity-5 drop-shadow-lg scale-150 transition-transform duration-500 group-hover:scale-[2] pointer-events-none">{s.icon}</div>
              <div className="relative z-10 flex flex-col gap-1 items-center justify-center h-full">
                <span className="text-2xl drop-shadow-sm mb-1">{s.icon}</span>
                <span className={`text-3xl font-black tracking-tight ${s.color}`}>{s.value}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row flex-wrap justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full md:w-auto">
            
            {/* Role Filter */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: '', label: 'All Roles', icon: '👤' },
                { id: 'admin', label: 'Admin', icon: '👑' },
                { id: 'community_admin', label: 'Comm. Admin', icon: '🏛️' },
                { id: 'student', label: 'Student', icon: '🎓' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilters(p => ({ ...p, role: f.id, page: 1 }))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border flex items-center gap-1.5 ${filters.role === f.id ? `bg-cyan-50 text-cyan-700 border-cyan-200 shadow-sm` : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <span className="text-lg leading-none opacity-80">{f.icon}</span> <span className="mt-0.5">{f.label}</span>
                </button>
              ))}
            </div>

            <div className="hidden sm:block w-[1px] bg-slate-200 self-stretch my-2" />
            
            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: '', label: 'All Status' },
                { id: 'pending', label: 'Pending' },
                { id: 'approved', label: 'Approved' },
                { id: 'rejected', label: 'Rejected' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilters(p => ({ ...p, status: f.id, page: 1 }))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${filters.status === f.id ? `bg-cyan-50 text-cyan-700 border-cyan-200 shadow-sm` : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative w-full md:w-80 lg:w-96 group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-cyan-600 transition-colors">🔍</span>
            <input type="text" placeholder="Search by name, email, or IT number..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-10 py-3 text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all focus:bg-white font-medium text-sm" />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors">✕</button>
            )}
          </div>
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <span className="text-purple-600 font-medium tracking-widest uppercase text-sm animate-pulse">Scanning User Database...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-16 bg-white rounded-3xl border border-slate-200 shadow-sm text-slate-900">
            <span className="text-6xl mb-6 opacity-50">👥</span>
            <h3 className="text-3xl font-black mb-3 text-slate-900">No users found</h3>
            <p className="text-slate-500 font-medium max-w-md">The search query and filters did not match any accounts.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map(u => {
                const isPending = u.status === 'pending';
                const isApproved = u.status === 'approved';
                const statusColor = isPending ? 'amber-500' : isApproved ? 'emerald-500' : 'rose-500';
                
                const roleColor = u.role === 'admin' ? 'purple-500' : u.role === 'community_admin' ? 'cyan-500' : 'slate-500';
                
                return (
                  <div key={u._id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group flex flex-col relative w-full h-full p-6">
                    <div className={`absolute top-0 w-full left-0 h-1 bg-gradient-to-r from-${statusColor}-200 via-${statusColor}-500 to-${statusColor}-200 opacity-80`} />
                    <div className="flex items-center gap-5 mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-${roleColor}-50 flex items-center justify-center text-3xl shrink-0 shadow-sm border border-${roleColor}-200 text-${roleColor}-600 font-black uppercase overflow-hidden relative group-hover:scale-105 transition-transform`}>
                        {u.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1 gap-2 flex-wrap">
                           <h3 className="font-bold text-lg text-slate-900 group-hover:text-pink-600 transition-colors leading-tight line-clamp-1 truncate pr-2">{u.name}</h3>
                           <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded bg-${statusColor}-50 text-${statusColor}-700 border border-${statusColor}-200 whitespace-nowrap`}>
                             {u.status}
                           </span>
                        </div>
                        <div className="text-slate-600 text-xs truncate mb-2">{u.email}</div>
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md bg-${roleColor}-50 text-${roleColor}-700 border border-${roleColor}-200 inline-block`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm flex-1">
                      {u.itNumber && (
                        <div className="flex items-center gap-3 w-full">
                          <span className="text-cyan-600 text-lg opacity-80 mt-1">🆔</span>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">IT Number</span>
                            <span className="font-mono text-cyan-700 font-bold truncate tracking-wider">{u.itNumber}</span>
                          </div>
                        </div>
                      )}

                      {(u.role === 'student' || u.role === 'community_admin') && (
                        <div className="flex flex-col min-w-0 border-t border-slate-200 pt-3 mt-3 w-full">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">Community Link</span>
                          <span className="text-slate-700 font-medium truncate flex items-center gap-2">
                            <span className="text-purple-600 text-[14px]">🏛️</span> 
                            {u.role === 'student' ? (u.requestedCommunity?.name || '—') : (u.managedCommunity?.name || u.communityName || '—')}
                          </span>
                        </div>
                      )}

                      {u.role === 'community_admin' && isPending && u.communityCategory && (
                         <div className="flex flex-col min-w-0 border-t border-slate-200 pt-3 mt-3 w-full">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">Category</span>
                          <span className="text-slate-700 font-medium truncate flex items-center gap-2">
                             <span className="text-emerald-600 text-[14px]">📂</span> {u.communityCategory}
                          </span>
                        </div>
                      )}

                      {u.rejectionReason && (
                        <div className="border-t border-slate-200 pt-3 mt-3 w-full flex gap-3 text-sm p-2 rounded bg-rose-50 border-l-2 border-l-rose-500">
                          <span className="text-rose-600 opacity-80 mt-0.5">⚠️</span>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-none mb-1">Rejection Reason</span>
                            <span className="text-rose-800 leading-tight italic line-clamp-2">"{u.rejectionReason}"</span>
                          </div>
                        </div>
                      )}

                    </div>

                    <div className="mt-auto space-y-2">
                      <div className="flex items-center justify-between px-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">
                         <span>Registered</span>
                         <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {isPending && (
                          <>
                            <button onClick={() => approveUser(u._id, u.name)} className="flex-1 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 font-bold text-xs uppercase tracking-widest text-emerald-600 hover:bg-emerald-100 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2">✓ Accept</button>
                            <button onClick={() => rejectUser(u._id, u.name)} className="flex-1 py-2.5 rounded-xl bg-rose-50 border border-rose-200 font-bold text-xs uppercase tracking-widest text-rose-600 hover:bg-rose-100 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2">✗ Decline</button>
                          </>
                        )}
                        <button onClick={() => openEdit(u)} className="flex-1 py-2.5 rounded-xl bg-blue-50 border border-blue-200 font-bold text-xs uppercase tracking-widest text-blue-600 hover:bg-blue-100 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2">
                          ✏️ Edit
                        </button>
                        {u.role !== 'admin' && (
                          <button onClick={() => deleteUser(u._id, u.name)} className="py-2.5 px-4 rounded-xl bg-rose-50 border border-rose-200 font-bold text-xs uppercase tracking-widest text-rose-600 hover:text-white hover:bg-rose-600 hover:border-rose-600 transition-all flex justify-center items-center gap-2">
                            🗑
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12 py-6 border-t border-slate-200">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={filters.page === 1}
                  className="px-6 py-3 rounded-full font-bold text-sm tracking-widest uppercase flex items-center gap-2 bg-white border border-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-700"
                >
                  ← Previous
                </button>
                <div className="flex gap-2 text-sm font-bold bg-slate-50 p-1.5 rounded-full border border-slate-200 shadow-sm overflow-hidden max-w-full">
                  {Array.from({ length: Math.min(7, pages) }, (_, i) => {
                    let pageNum;
                    if (pages <= 7) pageNum = i + 1;
                    else if (filters.page <= 4) pageNum = i + 1;
                    else if (filters.page >= pages - 3) pageNum = pages - 6 + i;
                    else pageNum = filters.page - 3 + i;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setFilters(prev => ({ ...prev, page: pageNum }))}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${filters.page === pageNum ? 'bg-cyan-600 text-white shadow-md scale-110' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pages, prev.page + 1) }))}
                  disabled={filters.page === pages}
                  className="px-6 py-3 rounded-full font-bold text-sm tracking-widest uppercase flex items-center gap-2 bg-white border border-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-700"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
          <div className="relative bg-white border border-slate-200 text-slate-900 rounded-3xl p-8 w-full max-w-md mx-4 shadow-xl">
            <h2 className="text-xl font-black uppercase tracking-widest mb-6">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Name</label>
                <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Email</label>
                <input value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Role</label>
                  <select value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 text-sm">
                    {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Status</label>
                  <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 text-sm">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setEditingUser(null)}
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