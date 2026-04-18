import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const ALL_STATUSES = ['pending_approval', 'published', 'rejected', 'completed', 'cancelled', 'draft'];

const STATUS_FILTERS = [
   { value: '', label: 'All Events', icon: '📊', color: 'text-blue-700' },
   { value: 'pending_approval', label: 'Pending Approval', icon: '⏳', color: 'text-blue-700' },
   { value: 'published', label: 'Published', icon: '✅', color: 'text-blue-700' },
   { value: 'rejected', label: 'Rejected', icon: '❌', color: 'text-blue-700' },
   { value: 'completed', label: 'Completed', icon: '🏁', color: 'text-blue-700' },
   { value: 'cancelled', label: 'Cancelled', icon: '🚫', color: 'text-blue-700' },
];

const STATUS_COLOR = {
   pending_approval: 'border-blue-300 bg-blue-50 text-blue-700',
   published: 'border-blue-300 bg-blue-50 text-blue-700',
   rejected: 'border-slate-300 bg-slate-100 text-slate-600',
   completed: 'border-blue-300 bg-blue-50 text-blue-700',
   cancelled: 'border-slate-300 bg-slate-100 text-slate-600',
   draft: 'border-slate-300 bg-slate-100 text-slate-600',
};

const STATUS_LABEL = {
   pending_approval: '⏳ Pending',
   published: '✅ Published',
   rejected: '❌ Rejected',
   completed: '🏁 Completed',
   cancelled: '🚫 Cancelled',
   draft: '📝 Draft',
};

const CATEGORIES = ['Technology', 'Arts', 'Sports', 'Academic', 'Cultural', 'Business', 'Science', 'Social', 'Other'];

const fmt = (d) =>
   d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const toInputDate = (d) => d ? new Date(d).toISOString().split('T')[0] : '';

export default function AdminEvents() {
   const [events, setEvents] = useState([]);
   const [loading, setLoading] = useState(true);
   const [statusFilter, setStatus] = useState('');
   const [search, setSearch] = useState('');

   const [editingEvent, setEditingEvent] = useState(null);
   const [editForm, setEditForm] = useState({});
   const [saving, setSaving] = useState(false);

   const fetchAll = async () => {
      setLoading(true);
      try {
         const res = await api.get('/events/all?limit=500');
         setEvents(res.data.data || []);
      } catch {
         toast.error('Failed to load events');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => { fetchAll(); }, []);

   const openEdit = (ev) => {
      setEditingEvent(ev);
      setEditForm({
         title: ev.title || '',
         description: ev.description || '',
         category: ev.category || 'Other',
         venue: ev.venue || '',
         startDate: toInputDate(ev.startDate),
         endDate: toInputDate(ev.endDate),
         maxParticipants: ev.maxParticipants || '',
         isVirtual: ev.isVirtual || false,
         virtualLink: ev.virtualLink || '',
      });
   };

   const saveEdit = async () => {
      setSaving(true);
      try {
         await api.put(`/events/${editingEvent._id}`, editForm);
         toast.success('Event updated');
         setEditingEvent(null);
         fetchAll();
      } catch (err) {
         toast.error(err.response?.data?.message || 'Failed to save');
      } finally {
         setSaving(false);
      }
   };

   const changeStatus = async (id, status, title) => {
      try {
         await api.put(`/events/${id}/status`, { status });
         toast.success(`"${title}" → ${STATUS_LABEL[status]}`);
         fetchAll();
      } catch (err) {
         toast.error(err.response?.data?.message || 'Failed to change status');
      }
   };

   const filtered = events.filter(e => {
      const matchesStatus = !statusFilter || e.status === statusFilter;
      const matchesSearch = !search ||
         e.title?.toLowerCase().includes(search.toLowerCase()) ||
         e.community?.name?.toLowerCase().includes(search.toLowerCase()) ||
         e.createdBy?.name?.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
   });

   const countFor = (s) => events.filter(e => (!s ? true : e.status === s)).length;

   return (
      <div className="min-h-screen p-6 md:p-10 font-sans text-slate-900 relative overflow-hidden bg-transparent">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob pointer-events-none" />
         <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-sky-600/10 rounded-full mix-blend-screen filter blur-[150px] animation-delay-4000 animate-blob pointer-events-none" />

         <div className="max-w-7xl mx-auto relative z-10 space-y-10">

            {/* Header */}
            <header className="rounded-[2.5rem] p-8 md:p-10 border border-blue-300/30 bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 shadow-[0_30px_70px_-30px_rgba(37,99,235,0.55)] relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               <div className="relative z-10 min-w-0">
                  <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight leading-none text-white">
                     EVENT <span className="text-blue-100">MANAGEMENT</span>
                  </h1>
                  <div className="flex items-center gap-3 flex-wrap">
                     <span className="px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-white font-bold text-sm flex items-center gap-2 shadow-sm">
                        📅 {events.length} Total Events
                     </span>
                     {countFor('pending_approval') > 0 && (
                        <span className="px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-white font-bold text-sm flex items-center gap-2 animate-pulse shadow-sm">
                           ⏳ {countFor('pending_approval')} waiting for review
                        </span>
                     )}
                  </div>
               </div>
               <Link to="/admin" className="relative z-10 px-6 py-3 rounded-full font-bold text-blue-700 bg-white transition-all hover:-translate-y-1 border border-white/40 flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-sm">
                  ← Dashboard
               </Link>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
               {STATUS_FILTERS.slice(1).map(f => (
                  <button key={f.value} onClick={() => setStatus(statusFilter === f.value ? '' : f.value)}
                     className={`surface-card border rounded-2xl p-5 text-center transition-all duration-300 relative overflow-hidden group ${statusFilter === f.value ? 'border-blue-200 shadow-xl bg-blue-50' : 'border-slate-200 hover:border-blue-200 hover:bg-white'}`}>
                     <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent pointer-events-none" />
                     <div className="relative z-10 flex flex-col items-center">
                        <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{f.icon}</span>
                        <span className={`text-3xl font-black tracking-tight mb-1 ${f.color}`}>{countFor(f.value)}</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{f.label}</span>
                     </div>
                  </button>
               ))}
            </div>

            {/* Filters */}
            <div className="surface-panel rounded-[2rem] p-4 md:p-6 border border-blue-100 shadow-[0_20px_45px_-30px_rgba(37,99,235,0.3)] flex flex-col lg:flex-row justify-between items-center gap-6">
               <div className="flex flex-wrap gap-2">
                  {STATUS_FILTERS.map(f => (
                     <button key={f.value} onClick={() => setStatus(f.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border ${statusFilter === f.value ? `bg-blue-50 text-slate-900 shadow-sm border-blue-200` : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                        {f.icon} {f.label}
                        {f.value && <span className="px-2 py-0.5 rounded text-[10px] font-black bg-white text-slate-500 border border-slate-200">{countFor(f.value)}</span>}
                     </button>
                  ))}
               </div>
               <div className="relative w-full lg:w-96 group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                  <input type="text" placeholder="Search events, communities, organizers..." value={search} onChange={e => setSearch(e.target.value)}
                     className="theme-input pl-12 pr-10 py-3 font-medium" />
                  {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900">✕</button>}
               </div>
            </div>

            {/* Events List */}
            <div className="relative">
               {loading ? (
                  <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
                     <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                     <span className="text-cyan-400 font-medium tracking-widest uppercase text-sm animate-pulse">Loading Events...</span>
                  </div>
               ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-16 surface-panel rounded-3xl border border-slate-200 shadow-2xl">
                     <span className="text-6xl mb-6 opacity-50">📅</span>
                     <h3 className="text-3xl font-black mb-3 text-slate-900">No results found</h3>
                     <p className="text-slate-500 max-w-md">Try adjusting your filters or search terms.</p>
                     {(search || statusFilter) && (
                        <button onClick={() => { setSearch(''); setStatus(''); }} className="mt-8 px-8 py-3 rounded-full theme-button-secondary font-bold text-sm border-slate-200 uppercase tracking-widest">Clear all filters</button>
                     )}
                  </div>
               ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                     {filtered.map(ev => (
                        <div key={ev._id} className="surface-card border border-slate-200 rounded-3xl overflow-hidden shadow-2xl hover:shadow-[0_20px_50px_rgba(148,163,184,0.18)] transition-all duration-300 hover:-translate-y-1 group relative flex flex-col">
                           <div className={`absolute left-0 top-0 bottom-0 w-1.5 opacity-50 group-hover:opacity-100 transition-opacity ${STATUS_COLOR[ev.status]?.split(' ')[1] || 'bg-slate-500'}`} />

                           <div className="p-6 md:p-8 flex flex-col sm:flex-row gap-6 items-start h-full">
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-lg border relative overflow-hidden ${STATUS_COLOR[ev.status] || ''}`}>
                                 📅
                              </div>

                              <div className="flex-1 min-w-0 flex flex-col h-full w-full">
                                 <div className="flex justify-between items-start gap-4 mb-3 flex-wrap">
                                    <h3 className="font-bold text-xl text-slate-900 group-hover:text-cyan-600 transition-colors leading-tight line-clamp-2">{ev.title}</h3>
                                    <span className={`px-3 py-1 font-black uppercase text-[10px] tracking-wider rounded border shrink-0 ${STATUS_COLOR[ev.status] || ''}`}>
                                       {STATUS_LABEL[ev.status] || ev.status}
                                    </span>
                                 </div>

                                 <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-50 border border-blue-200 text-blue-700 capitalize shadow-sm">{ev.category}</span>
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 shadow-sm">
                                       🏛️ {ev.community?.name || 'Unknown'}
                                    </span>
                                 </div>

                                 <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">{ev.description || 'No description.'}</p>

                                 {ev.status === 'rejected' && ev.rejectionReason && (
                                    <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex gap-3">
                                       <span>⚠️</span>
                                       <span><strong className="text-rose-400 uppercase text-[10px] block mb-0.5">Rejection Reason</strong>{ev.rejectionReason}</span>
                                    </div>
                                 )}

                                 <div className="mt-auto pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
                                       <div className="flex flex-col">
                                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Date</span>
                                          <span className="text-slate-700">📅 {fmt(ev.startDate)}</span>
                                       </div>
                                       {ev.venue && (
                                          <div className="flex flex-col">
                                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Venue</span>
                                             <span className="text-slate-700 truncate max-w-[120px]">📍 {ev.venue}</span>
                                          </div>
                                       )}
                                       <div className="flex flex-col">
                                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Organizer</span>
                                          <span className="text-slate-700 truncate max-w-[120px]">👤 {ev.createdBy?.name || '—'}</span>
                                       </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 shrink-0 w-full md:w-auto">
                                       {/* Status dropdown */}
                                       <select
                                          value={ev.status}
                                          onChange={e => changeStatus(ev._id, e.target.value, ev.title)}
                                          className="flex-1 md:flex-none py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold focus:outline-none focus:border-cyan-400/50 cursor-pointer shadow-sm"
                                       >
                                          {ALL_STATUSES.map(s => (
                                             <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                                          ))}
                                       </select>
                                       {/* Edit */}
                                       <button
                                          onClick={() => openEdit(ev)}
                                          className="py-2 px-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:-translate-y-0.5 transition-all text-xs font-bold uppercase tracking-widest"
                                       >
                                          ✏️ Edit
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>

         {/* Edit Modal */}
         {editingEvent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
               <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditingEvent(null)} />
               <div className="relative bg-white border border-slate-200 rounded-3xl p-8 w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                  <h2 className="text-xl font-black uppercase tracking-widest mb-6 text-slate-900">Edit Event</h2>

                  <div className="space-y-4">
                     <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Title</label>
                        <input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                           className="theme-input" />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Description</label>
                        <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={3}
                           className="theme-input resize-none" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Category</label>
                           <select value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                              className="theme-input">
                              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Venue</label>
                           <input value={editForm.venue} onChange={e => setEditForm(p => ({ ...p, venue: e.target.value }))}
                              className="theme-input" />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Start Date</label>
                           <input type="date" value={editForm.startDate} onChange={e => setEditForm(p => ({ ...p, startDate: e.target.value }))}
                              className="theme-input" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">End Date</label>
                           <input type="date" value={editForm.endDate} onChange={e => setEditForm(p => ({ ...p, endDate: e.target.value }))}
                              className="theme-input" />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Max Participants</label>
                           <input type="number" value={editForm.maxParticipants} onChange={e => setEditForm(p => ({ ...p, maxParticipants: e.target.value }))}
                              className="theme-input" />
                        </div>
                        <div className="flex items-center gap-3 pt-6">
                           <input type="checkbox" id="isVirtual" checked={editForm.isVirtual} onChange={e => setEditForm(p => ({ ...p, isVirtual: e.target.checked }))}
                              className="w-4 h-4 accent-blue-500" />
                           <label htmlFor="isVirtual" className="text-sm font-bold text-slate-700">Virtual Event</label>
                        </div>
                     </div>
                     {editForm.isVirtual && (
                        <div>
                           <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Virtual Link</label>
                           <input value={editForm.virtualLink} onChange={e => setEditForm(p => ({ ...p, virtualLink: e.target.value }))}
                              className="theme-input" />
                        </div>
                     )}
                  </div>

                  <div className="flex gap-3 mt-8">
                     <button onClick={() => setEditingEvent(null)}
                        className="flex-1 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-black uppercase text-[10px] tracking-widest transition-all">
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
