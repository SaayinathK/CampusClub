import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const CATEGORIES = ['Technology', 'Arts', 'Sports', 'Academic', 'Cultural', 'Business', 'Science', 'Social', 'Other'];

const normalizeCategory = (cat) => {
  if (!cat) return 'Technology';
  if (CATEGORIES.includes(cat)) return cat;
  return CATEGORIES.find(c => cat.includes(c)) || 'Technology';
};

const EMPTY_FORM = {
  title: '', description: '', category: 'Technology', startDate: '', endDate: '',
  venue: '', isVirtual: false, virtualLink: '', maxParticipants: '',
  allowExternal: false, tags: '', coverImage: '',
};

export default function CommunityAdminEvents() {
  const [events, setEvents] = useState([]);
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [evRes, comRes] = await Promise.all([
        api.get('/events/my-community'),
        api.get('/communities/my/profile'),
      ]);
      setEvents(evRes.data.data || []);
      setCommunity(comRes.data.data);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openCreate = () => { setEditingEvent(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (ev) => {
    setEditingEvent(ev);
    setForm({
      title: ev.title, description: ev.description, category: normalizeCategory(ev.category),
      startDate: ev.startDate?.split('T')[0], endDate: ev.endDate?.split('T')[0] || '',
      venue: ev.venue || '', isVirtual: ev.isVirtual, virtualLink: ev.virtualLink || '',
      maxParticipants: ev.maxParticipants || '', allowExternal: ev.allowExternal,
      tags: ev.tags?.join(', ') || '', coverImage: ev.coverImage || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : undefined,
      };
      if (editingEvent) {
        await api.put(`/events/${editingEvent._id}`, payload);
        toast.success('Event updated!');
      } else {
        await api.post('/events', payload);
        toast.success('Event created!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/events/${id}/status`, { status });
      toast.success(`Event ${status}!`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const deleteEvent = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      fetchData();
    } catch { toast.error('Failed'); }
  };

  const viewParticipants = async (ev) => {
    setSelectedEvent(ev);
    try {
      const res = await api.get(`/events/${ev._id}/participants`);
      setParticipants(res.data.data || []);
    } catch { setParticipants([]); }
  };

  const filteredEvents = statusFilter ? events.filter(e => e.status === statusFilter) : events;

  const getCategoryIcon = (category) => {
    const icons = {
      Technology: '💻', Arts: '🎨', Sports: '⚽', Academic: '📚',
      Cultural: '🎭', Business: '💼', Science: '🔬', Social: '🤝', Other: '🌟'
    };
    return icons[category] || '📅';
  };

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans text-slate-100 relative overflow-hidden bg-[#020617]">
      {/* Background Orbs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full mix-blend-screen filter blur-[150px] animate-blob pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full mix-blend-screen filter blur-[150px] animation-delay-4000 animate-blob pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Header */}
        <header className="glass-dark rounded-3xl p-8 border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="flex items-center gap-6 relative z-10">
             <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 p-[2px] shadow-[0_0_20px_rgba(168,85,247,0.4)]">
               <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-3xl">📅</div>
             </div>
             <div>
               <h2 className="text-3xl md:text-4xl font-black mb-1 tracking-tight">
                 EVENT <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">MANAGEMENT</span>
               </h2>
               <p className="text-slate-400 font-medium">
                 {community?.name} — Organize and manage community events
               </p>
             </div>
          </div>
          
          <div className="flex flex-wrap gap-4 relative z-10">
            <Link to="/community-admin" className="glass hover:bg-white/10 px-6 py-3 rounded-full font-bold text-white transition-all hover:-translate-y-1 border border-white/10 flex items-center gap-2 text-sm uppercase tracking-wider backdrop-blur-xl">
              ← Dashboard
            </Link>
            <button onClick={openCreate} className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 font-bold text-white transition-all hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2 text-sm uppercase tracking-wider">
              <span>+</span> New Event
            </button>
          </div>
        </header>

        {/* Status Filters */}
        <div className="glass-dark rounded-2xl p-2 border border-white/5 flex flex-wrap gap-2">
           {[
            { value: '', label: 'All Events', icon: '📊', bg: 'bg-slate-500/20 text-slate-300' },
            { value: 'pending_approval', label: 'Pending', icon: '⏳', bg: 'bg-amber-500/20 text-amber-500' },
            { value: 'published', label: 'Published', icon: '🚀', bg: 'bg-emerald-500/20 text-emerald-500' },
            { value: 'rejected', label: 'Rejected', icon: '❌', bg: 'bg-rose-500/20 text-rose-500' },
            { value: 'completed', label: 'Completed', icon: '✅', bg: 'bg-purple-500/20 text-purple-400' },
            { value: 'cancelled', label: 'Cancelled', icon: '🚫', bg: 'bg-slate-700/50 text-slate-400' }
          ].map((f) => (
             <button
               key={f.value}
               onClick={() => setStatusFilter(f.value)}
               className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-bold text-sm tracking-wide transition-all border flex items-center justify-center gap-2 ${statusFilter === f.value ? `${f.bg} border-white/20 shadow-lg scale-105` : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white'}`}
             >
               <span>{f.icon}</span> {f.label}
               {f.value && (
                 <span className="bg-black/40 px-2 py-0.5 rounded-full text-[10px] ml-1 border border-white/10">
                   {events.filter(e => e.status === f.value).length}
                 </span>
               )}
             </button>
          ))}
        </div>

        {loading ? (
           <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
              <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
              <span className="text-cyan-400 font-medium tracking-widest uppercase text-sm animate-pulse">Loading Events...</span>
           </div>
        ) : filteredEvents.length === 0 ? (
           <div className="flex flex-col items-center justify-center text-center p-16 glass-dark rounded-3xl border border-white/5 shadow-2xl">
              <span className="text-6xl mb-6 drop-shadow-2xl opacity-50">📅</span>
              <h3 className="text-3xl font-black mb-3 text-white">No events found</h3>
              <p className="text-slate-400 font-medium max-w-md mb-8">{statusFilter ? `No ${statusFilter} events to display.` : 'Create your first community event to get started.'}</p>
              {!statusFilter && (
                 <button onClick={openCreate} className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 font-bold text-white transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center gap-2">
                   <span>+</span> Create First Event
                 </button>
              )}
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredEvents.map(ev => {
                const isPublished = ev.status === 'published';
                const isPending = ev.status === 'pending_approval';
                const isRejected = ev.status === 'rejected';
                const isCompleted = ev.status === 'completed';
                const isCancelled = ev.status === 'cancelled';

                const statusColor = isPublished ? 'emerald-500' : isPending ? 'amber-500' : isRejected ? 'rose-500' : isCompleted ? 'purple-500' : 'slate-500';

                return (
                  <div key={ev._id} className="glass-dark border border-white/5 rounded-3xl overflow-hidden shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 group relative flex flex-col pt-1">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-${statusColor} opacity-80`} />
                    <div className="p-6 flex flex-col h-full">
                       
                       <div className="flex items-start gap-4 mb-4">
                          <div className={`w-14 h-14 rounded-2xl bg-${statusColor}/10 border border-${statusColor}/20 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                            {getCategoryIcon(ev.category)}
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                             <h4 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors leading-tight line-clamp-1 mb-1.5">{ev.title}</h4>
                             <div className="flex flex-wrap gap-2">
                               <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded bg-${statusColor}/10 text-${statusColor} border border-${statusColor}/20`}>
                                 {ev.status.replace('_', ' ')}
                               </span>
                               <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded bg-white/5 text-slate-300 border border-white/10">
                                 {ev.category}
                               </span>
                             </div>
                          </div>
                       </div>

                       <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4 flex-1">
                          {ev.description}
                       </p>

                       {isRejected && ev.rejectionReason && (
                          <div className="bg-rose-500/10 border-l-2 border-rose-500 p-3 rounded mb-4 text-xs text-rose-300 leading-tight">
                            <span className="font-bold text-rose-400 block mb-0.5">⚠️ Rejection Reason:</span>
                            {ev.rejectionReason}
                          </div>
                       )}

                       <div className="space-y-2 mb-6 p-4 rounded-xl bg-black/20 border border-white/5 text-xs text-slate-300">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">📅</span> {new Date(ev.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          {(ev.venue || ev.isVirtual) && (
                            <div className="flex items-center gap-3 truncate">
                              <span className="text-lg">{ev.isVirtual ? '💻' : '📍'}</span> {ev.isVirtual ? 'Virtual Event' : ev.venue}
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <span className="text-lg">👥</span> 
                            <div className="flex-1 flex items-center gap-2">
                               <span>{ev.participants?.length || 0} / {ev.maxParticipants || '∞'} registered</span>
                               {ev.maxParticipants && (
                                 <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                   <div className={`h-full bg-${statusColor}`} style={{ width: `${Math.min(100, (ev.participants?.length / ev.maxParticipants) * 100)}%` }} />
                                 </div>
                               )}
                            </div>
                          </div>
                       </div>

                       <div className="space-y-2 mt-auto">
                          <div className="flex gap-2">
                             <button onClick={() => viewParticipants(ev)} className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors">
                               👥 Guest List
                             </button>
                             {['pending_approval', 'rejected', 'draft', 'cancelled'].includes(ev.status) && (
                               <button onClick={() => openEdit(ev)} className="flex-[0.5] py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 font-bold text-xs uppercase tracking-widest text-cyan-400 hover:bg-cyan-500/20 transition-colors">
                                 ✏️ Edit
                               </button>
                             )}
                          </div>

                          <div className="flex gap-2">
                             {isRejected && (
                               <button onClick={() => openEdit(ev)} className="w-full py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 font-bold text-xs uppercase tracking-widest text-amber-500 hover:bg-amber-500/20 transition-colors">
                                 ✏️ Edit & Re-submit
                               </button>
                             )}
                             {isPublished && (
                               <>
                                 <button onClick={() => updateStatus(ev._id, 'completed')} className="flex-1 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 font-bold text-xs uppercase tracking-widest text-purple-400 hover:bg-purple-500/20 transition-colors">
                                   ✅ Complete
                                 </button>
                                 <button onClick={() => updateStatus(ev._id, 'cancelled')} className="flex-1 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 font-bold text-xs uppercase tracking-widest text-rose-400 hover:bg-rose-500/20 transition-colors">
                                   🚫 Cancel
                                 </button>
                               </>
                             )}
                             {isPending && (
                               <button onClick={() => updateStatus(ev._id, 'cancelled')} className="w-full py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 font-bold text-xs uppercase tracking-widest text-rose-400 hover:bg-rose-500/20 transition-colors">
                                 🚫 Cancel Submission
                               </button>
                             )}
                             {['draft', 'cancelled', 'completed'].includes(ev.status) && (
                                <button onClick={() => deleteEvent(ev._id, ev.title)} className="w-full py-2 rounded-xl bg-slate-900 border border-rose-500/30 font-bold text-xs text-rose-500 hover:bg-rose-500 hover:text-white transition-colors uppercase tracking-widest">
                                   🗑 Delete permanently
                                </button>
                             )}
                          </div>
                       </div>

                    </div>
                  </div>
                );
             })}
           </div>
        )}

      </div>

      {/* Editor Modal */}
      {showModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
               <div className="p-8 border-b border-white/5 sticky top-0 bg-[#0f172a]/90 backdrop-blur-xl z-10 flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-black text-white flex items-center gap-2">
                      {editingEvent ? <span className="text-cyan-400">✏️ EDIT EVENT</span> : <span className="text-purple-400">➕ NEW EVENT</span>}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1 font-medium">{editingEvent ? 'Update event logistics and settings' : 'Draft a new event for admin approval'}</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-rose-500 transition-colors">✕</button>
               </div>
               
               <form onSubmit={handleSave} className="p-8 space-y-6">
                 
                 <div className="space-y-2 group">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><span>📝</span> Event Title</label>
                   <input required value={form.title} onChange={e => set('title', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="E.g. Annual Tech Symposium" />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 group">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><span>📂</span> Category</label>
                      <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all appearance-none cursor-pointer">
                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{getCategoryIcon(c)} {c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2 group">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><span>📅</span> Start Date</label>
                      <input required type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all [color-scheme:dark]" />
                    </div>
                 </div>

                 <div className="space-y-2 group">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><span>📖</span> Description</label>
                   <textarea required rows={4} value={form.description} onChange={e => set('description', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-y" placeholder="Detail the agenda, speakers, requirements..." />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 group">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><span>📍</span> Venue / Location</label>
                      <input value={form.venue} onChange={e => set('venue', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="E.g. Main Auditorium" />
                    </div>
                    <div className="space-y-2 group">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><span>👥</span> Max Capacity</label>
                      <input type="number" value={form.maxParticipants} onChange={e => set('maxParticipants', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="Leave empty for unlimited" />
                    </div>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <label className="flex items-center gap-3 cursor-pointer group">
                       <input type="checkbox" checked={form.isVirtual} onChange={e => set('isVirtual', e.target.checked)} className="w-5 h-5 rounded border-white/20 bg-black/50 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900" />
                       <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">💻 Virtual Event</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                       <input type="checkbox" checked={form.allowExternal} onChange={e => set('allowExternal', e.target.checked)} className="w-5 h-5 rounded border-white/20 bg-black/50 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900" />
                       <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">🌐 Public (Generates Passcode)</span>
                    </label>
                 </div>

                 {form.isVirtual && (
                   <div className="space-y-2 group animate-fade-in">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><span>🔗</span> Meeting Link</label>
                     <input value={form.virtualLink} onChange={e => set('virtualLink', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-blue-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm" placeholder="https://zoom.us/..." />
                   </div>
                 )}

                 <div className="pt-6 border-t border-white/5 flex gap-4 justify-end">
                    <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-sm text-slate-300 hover:bg-white/10 transition-colors uppercase tracking-wider">Cancel</button>
                    <button type="submit" disabled={saving} className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all uppercase tracking-wider disabled:opacity-50">
                      {saving ? 'Transmitting...' : editingEvent ? '💾 Save Changes' : '✨ Publish Draft'}
                    </button>
                 </div>

               </form>
            </div>
         </div>
      )}

      {/* Participants Modal */}
      {selectedEvent && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && setSelectedEvent(null)}>
            <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
               
               <div className="p-6 border-b border-white/5 bg-[#0f172a]/90 backdrop-blur-xl flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-2 mb-1">👥 PARTICIPANT REGISTRY</h3>
                    <p className="text-sm text-slate-400 font-medium truncate max-w-[300px]">{selectedEvent.title}</p>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-rose-500 transition-colors">✕</button>
               </div>

               <div className="bg-cyan-500/10 border-b border-cyan-500/20 p-4 flex justify-between items-center text-cyan-400">
                  <span className="font-bold text-sm uppercase tracking-wider">Total Confirmed</span>
                  <span className="text-2xl font-black">{participants.length}</span>
               </div>
               
               <div className="overflow-y-auto p-4 flex flex-col gap-2 relative">
                  {participants.length === 0 ? (
                     <div className="py-12 text-center text-slate-500">
                        <div className="text-4xl mb-4 opacity-50">👻</div>
                        <h4 className="font-bold text-white mb-1">Silence...</h4>
                        <p className="text-sm">No one has registered for this event yet.</p>
                     </div>
                  ) : (
                     participants.map((p, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                              {(p.user?.name || p.externalName)?.charAt(0)}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-white text-sm truncate">{p.user?.name || p.externalName}</h5>
                              <p className="text-xs text-slate-400 truncate">{p.user?.email || p.externalEmail}</p>
                           </div>
                           <div className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${
                              p.type === 'member' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                              p.type === 'external' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 
                              'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                              {p.type}
                           </div>
                        </div>
                     ))
                  )}
               </div>

            </div>
         </div>
      )}

    </div>
  );
}