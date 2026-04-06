import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';
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
  isFree: true, ticketPrice: '', registrationDeadline: '',
};

const PAYMENT_STATUS_COLORS = {
  not_required: 'emerald',
  pending: 'amber',
  verified: 'emerald',
  rejected: 'rose',
};
const PAYMENT_STATUS_LABELS = {
  not_required: 'Free',
  pending: 'Pending',
  verified: 'Verified',
  rejected: 'Rejected',
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
  const [attendanceEvent, setAttendanceEvent] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [qrScanInput, setQrScanInput] = useState('');
  const [showQR, setShowQR] = useState({});

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
      isFree: ev.isFree !== false, ticketPrice: ev.ticketPrice || '',
      registrationDeadline: ev.registrationDeadline?.split('T')[0] || '',
    });
    setShowModal(true);
  };

  const handleExport = (eventId, eventTitle) => {
    const token = localStorage.getItem('token');
    const link = document.createElement('a');
    link.href = `http://localhost:5000/api/events/${eventId}/export`;
    // Attach token via a temp fetch approach
    fetch(`http://localhost:5000/api/events/${eventId}/export`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `${eventTitle.replace(/[^a-z0-9]/gi, '_')}_registrations.csv`;
        link.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => toast.error('Export failed'));
  };

  const handleQrScan = (e) => {
    if (e.key !== 'Enter') return;
    const code = qrScanInput.trim();
    if (!code) return;
    const participant = attendanceList.find(p => p._id === code);
    if (!participant) {
      toast.error('Participant not found for this QR code');
    } else if (participant.attended) {
      toast.info(`${participant.user?.name || participant.externalName} is already marked present`);
    } else {
      toggleAttendance(participant._id, true);
      toast.success(`Marked present: ${participant.user?.name || participant.externalName}`);
    }
    setQrScanInput('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : undefined,
        ticketPrice: !form.isFree && form.ticketPrice ? parseFloat(form.ticketPrice) : 0,
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

  const openAttendance = async (ev) => {
    setAttendanceEvent(ev);
    try {
      const res = await api.get(`/events/${ev._id}/participants`);
      setAttendanceList(res.data.data || []);
    } catch { setAttendanceList([]); }
  };

  const toggleAttendance = async (participantId, attended) => {
    try {
      await api.put(`/events/${attendanceEvent._id}/attendance`, { participantId, attended });
      setAttendanceList(prev => prev.map(p => p._id === participantId ? { ...p, attended } : p));
    } catch { toast.error('Failed to update attendance'); }
  };

  const bulkAttendance = async (attended) => {
    setAttendanceSaving(true);
    try {
      await api.put(`/events/${attendanceEvent._id}/attendance/bulk`, { attended });
      setAttendanceList(prev => prev.map(p => ({ ...p, attended })));
      toast.success(attended ? 'All marked present' : 'All marked absent');
    } catch { toast.error('Failed'); }
    finally { setAttendanceSaving(false); }
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
                             {['published', 'completed'].includes(ev.status) && (
                               <>
                               <button onClick={() => openAttendance(ev)} className="flex-1 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 font-bold text-xs uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                                 ✅ Attendance
                               </button>
                               <button onClick={() => handleExport(ev._id, ev.title)} className="py-2 px-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 font-bold text-xs uppercase tracking-widest text-cyan-400 hover:bg-cyan-500/20 transition-colors" title="Export to CSV">
                                 ⬇
                               </button>
                               </>
                             )}
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

                 <div className="space-y-2 group">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                     <span>⌛</span> Registration Deadline
                     <span className="text-slate-600 normal-case font-normal">(optional — triggers "closing soon" reminder 24h before)</span>
                   </label>
                   <input
                     type="date"
                     value={form.registrationDeadline}
                     onChange={e => set('registrationDeadline', e.target.value)}
                     className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all [color-scheme:dark]"
                   />
                 </div>

                 {/* Paid / Free toggle */}
                 <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                   <label className="flex items-center gap-3 cursor-pointer group">
                     <input type="checkbox" checked={!form.isFree} onChange={e => set('isFree', !e.target.checked)} className="w-5 h-5 rounded border-white/20 bg-black/50 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-slate-900" />
                     <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">💳 Paid Event</span>
                   </label>
                   {!form.isFree && (
                     <div className="space-y-2 pl-8">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Price (LKR)</label>
                       <input
                         type="number"
                         min="0"
                         step="0.01"
                         value={form.ticketPrice}
                         onChange={e => set('ticketPrice', e.target.value)}
                         required
                         className="w-full bg-black/40 border border-yellow-500/20 rounded-xl px-4 py-3 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                         placeholder="E.g. 500"
                       />
                     </div>
                   )}
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

      {/* Attendance Modal */}
      {attendanceEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && setAttendanceEvent(null)}>
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">

            <div className="p-6 border-b border-white/5 bg-[#0f172a]/90 backdrop-blur-xl flex justify-between items-start sticky top-0">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2 mb-1">✅ ATTENDANCE</h3>
                <p className="text-sm text-slate-400 font-medium truncate max-w-[280px]">{attendanceEvent.title}</p>
              </div>
              <button onClick={() => setAttendanceEvent(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-rose-500 transition-colors">✕</button>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 border-b border-white/5 divide-x divide-white/5 text-center">
              <div className="py-3">
                <div className="text-xl font-black text-white">{attendanceList.length}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">Total</div>
              </div>
              <div className="py-3">
                <div className="text-xl font-black text-emerald-400">{attendanceList.filter(p => p.attended).length}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">Present</div>
              </div>
              <div className="py-3">
                <div className="text-xl font-black text-rose-400">{attendanceList.filter(p => !p.attended).length}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">Absent</div>
              </div>
            </div>

            {/* QR Scanner input */}
            <div className="p-3 border-b border-white/5 bg-purple-500/5">
              <input
                type="text"
                value={qrScanInput}
                onChange={e => setQrScanInput(e.target.value)}
                onKeyDown={handleQrScan}
                placeholder="📷 Scan QR code here (press Enter to mark present)"
                className="w-full bg-black/40 border border-purple-500/30 rounded-xl px-4 py-2 text-white text-xs font-mono focus:outline-none focus:border-purple-400 placeholder:text-slate-500"
              />
            </div>

            {/* Bulk actions */}
            <div className="flex gap-2 p-3 border-b border-white/5 bg-black/20">
              <button disabled={attendanceSaving} onClick={() => bulkAttendance(true)} className="flex-1 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-widest hover:bg-emerald-500/20 transition-colors disabled:opacity-50">
                ✓ Mark All Present
              </button>
              <button disabled={attendanceSaving} onClick={() => bulkAttendance(false)} className="flex-1 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-xs uppercase tracking-widest hover:bg-rose-500/20 transition-colors disabled:opacity-50">
                ✗ Mark All Absent
              </button>
              <button onClick={() => handleExport(attendanceEvent._id, attendanceEvent.title)} className="py-2 px-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold text-xs uppercase tracking-widest hover:bg-cyan-500/20 transition-colors" title="Export CSV">
                ⬇ CSV
              </button>
            </div>

            <div className="overflow-y-auto p-4 flex flex-col gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {attendanceList.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <div className="text-4xl mb-4 opacity-50">👻</div>
                  <p className="text-sm font-bold text-white mb-1">No participants</p>
                  <p className="text-xs">No one has registered for this event yet.</p>
                </div>
              ) : (
                attendanceList.map(p => (
                  <div key={p._id} className={`p-4 rounded-2xl border transition-colors ${p.attended ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 ${p.attended ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/10 border border-white/10'}`}>
                        {(p.user?.name || p.externalName)?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate">{p.user?.name || p.externalName}</p>
                        <p className="text-xs text-slate-400 truncate">{p.user?.email || p.externalEmail}</p>
                        {p.user?.itNumber && <p className="text-[10px] font-mono text-cyan-400 mt-0.5">{p.user.itNumber}</p>}
                        {p.paymentStatus && p.paymentStatus !== 'not_required' && (
                          <span className={`inline-block mt-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-${PAYMENT_STATUS_COLORS[p.paymentStatus]}-500/10 text-${PAYMENT_STATUS_COLORS[p.paymentStatus]}-400 border-${PAYMENT_STATUS_COLORS[p.paymentStatus]}-500/20`}>
                            💳 {PAYMENT_STATUS_LABELS[p.paymentStatus]}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setShowQR(prev => ({ ...prev, [p._id]: !prev[p._id] }))}
                          className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs flex items-center justify-center hover:bg-purple-500/20 transition-colors"
                          title="Show QR code"
                        >
                          QR
                        </button>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${p.type === 'external' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                          {p.type}
                        </span>
                        <button
                          onClick={() => toggleAttendance(p._id, !p.attended)}
                          className={`w-9 h-9 rounded-xl border font-bold text-sm transition-all hover:scale-105 ${p.attended ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'bg-white/5 border-white/10 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400'}`}
                          title={p.attended ? 'Mark absent' : 'Mark present'}
                        >
                          {p.attended ? '✓' : '○'}
                        </button>
                      </div>
                    </div>
                    {showQR[p._id] && (
                      <div className="mt-3 flex items-center gap-4 p-3 bg-white rounded-2xl w-fit">
                        <QRCodeSVG value={p._id} size={80} />
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-700 tracking-widest mb-1">Participant QR</p>
                          <p className="text-[8px] font-mono text-slate-500 break-all max-w-[140px]">{p._id}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
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
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black">{participants.length}</span>
                    <button
                      onClick={() => handleExport(selectedEvent._id, selectedEvent.title)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-black text-[10px] uppercase tracking-widest hover:bg-cyan-500/30 transition-colors"
                    >
                      ⬇ Export CSV
                    </button>
                  </div>
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
                              {p.user?.itNumber && <p className="text-[10px] font-mono text-cyan-400 mt-0.5">{p.user.itNumber}</p>}
                           </div>
                           <div className="flex items-center gap-2 shrink-0">
                           {p.paymentStatus && p.paymentStatus !== 'not_required' && (
                             <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border bg-${PAYMENT_STATUS_COLORS[p.paymentStatus]}-500/10 text-${PAYMENT_STATUS_COLORS[p.paymentStatus]}-400 border-${PAYMENT_STATUS_COLORS[p.paymentStatus]}-500/20`}>
                               💳 {PAYMENT_STATUS_LABELS[p.paymentStatus]}
                             </span>
                           )}
                           <div className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${
                              p.type === 'member' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                              p.type === 'external' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                              'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                              {p.type}
                           </div>
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