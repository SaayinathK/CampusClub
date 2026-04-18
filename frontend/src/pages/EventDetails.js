import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Wifi, ArrowLeft, Upload, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const fmt = (d) =>
   d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

const PAYMENT_STATUS_CONFIG = {
   not_required: { label: 'Free Event', color: 'emerald', icon: <CheckCircle size={14} /> },
   pending: { label: 'Receipt Pending Review', color: 'amber', icon: <Clock size={14} /> },
   verified: { label: 'Payment Verified', color: 'emerald', icon: <CheckCircle size={14} /> },
   rejected: { label: 'Receipt Rejected — Re-upload', color: 'rose', icon: <XCircle size={14} /> },
};

const EventDetails = () => {
   const { id } = useParams();
   const [event, setEvent] = useState(null);
   const [loading, setLoading] = useState(true);
   const [notFound, setNotFound] = useState(false);

   // Registration state
   const [myParticipant, setMyParticipant] = useState(null); // my participant subdoc
   const [registering, setRegistering] = useState(false);

   // Receipt upload state
   const [receiptFile, setReceiptFile] = useState(null);
   const [uploading, setUploading] = useState(false);
   const [myReceipt, setMyReceipt] = useState(null);
   const fileInputRef = useRef();

   // Feedback state
   const [dbFeedbacks, setDbFeedbacks] = useState([]);
   const [rating, setRating] = useState(5);
   const [feedback, setFeedback] = useState('');
   const [submitted, setSubmitted] = useState(false);

   const storedUser = JSON.parse(localStorage.getItem('user'));
   const isStudent = storedUser?.role === 'student';

   const fetchEvent = async () => {
      try {
         const res = await api.get(`/events/${id}`);
         const ev = res.data.data;
         setEvent(ev);

         if (isStudent && storedUser?._id) {
            const me = ev.participants?.find(
               (p) => p.user && (p.user._id || p.user) === storedUser._id
            );
            setMyParticipant(me || null);
         }
      } catch (err) {
         if (err.response?.status === 404) setNotFound(true);
      } finally {
         setLoading(false);
      }
   };

   const fetchMyReceipt = async () => {
      if (!isStudent) return;
      try {
         const res = await api.get(`/receipts?eventId=${id}`);
         const receipts = Array.isArray(res.data) ? res.data : [];
         setMyReceipt(receipts[0] || null);
      } catch { /* silent */ }
   };

   const fetchFeedbacks = async () => {
      try {
         const res = await api.get(`/feedback/${id}`);
         setDbFeedbacks(Array.isArray(res.data) ? res.data : []);
      } catch { /* silent */ }
   };

   useEffect(() => {
      fetchEvent();
      fetchFeedbacks();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [id]);

   useEffect(() => {
      if (myParticipant && !myParticipant.paymentStatus !== 'not_required') {
         fetchMyReceipt();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [myParticipant]);

   // ─── Registration ────────────────────────────────────────────────────────────

   const handleRegister = async () => {
      setRegistering(true);
      try {
         const res = await api.post(`/events/${id}/register`);
         toast.success(res.data.message);
         await fetchEvent();
         await fetchMyReceipt();
      } catch (err) {
         toast.error(err.response?.data?.message || 'Registration failed');
      } finally {
         setRegistering(false);
      }
   };

   const handleUnregister = async () => {
      if (!window.confirm('Are you sure you want to unregister from this event?')) return;
      setRegistering(true);
      try {
         const res = await api.delete(`/events/${id}/register`);
         toast.success(res.data.message);
         setMyParticipant(null);
         setMyReceipt(null);
         await fetchEvent();
      } catch (err) {
         toast.error(err.response?.data?.message || 'Failed to unregister');
      } finally {
         setRegistering(false);
      }
   };

   // ─── Receipt Upload ──────────────────────────────────────────────────────────

   const handleReceiptUpload = async (e) => {
      e.preventDefault();
      if (!receiptFile) return;
      setUploading(true);
      try {
         const form = new FormData();
         form.append('receipt', receiptFile);
         form.append('eventId', id);
         const res = await api.post('/receipts/upload', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
         });
         setMyReceipt(res.data);
         setReceiptFile(null);
         if (fileInputRef.current) fileInputRef.current.value = '';
         toast.success('Receipt uploaded! Awaiting admin verification.');
         await fetchEvent();
      } catch (err) {
         toast.error(err.response?.data?.message || 'Upload failed');
      } finally {
         setUploading(false);
      }
   };

   // ─── Feedback ────────────────────────────────────────────────────────────────

   const handleSubmitFeedback = async (e) => {
      e.preventDefault();
      if (!feedback.trim()) return;
      try {
         await api.post('/feedback', { eventId: id, rating, comment: feedback, username: storedUser?.name });
         setSubmitted(true);
         setFeedback('');
         fetchFeedbacks();
      } catch (err) {
         toast.error('Failed to submit feedback');
      }
   };

   // ─── Derived state ───────────────────────────────────────────────────────────

   if (loading)
      return (
         <div className="pt-32 flex flex-col items-center justify-center min-h-screen gap-4">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-blue-400 text-sm font-bold uppercase tracking-widest animate-pulse">Loading Event...</span>
         </div>
      );

   if (notFound || !event)
      return (
         <div className="pt-32 text-center min-h-screen">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-black uppercase mb-4">Event Not Found</h2>
            <Link to="/events" className="text-blue-400 hover:text-blue-300 font-bold uppercase text-sm tracking-widest">
               ← Back to Events
            </Link>
         </div>
      );

   const totalFeedbacks = dbFeedbacks;
   const avgRating =
      totalFeedbacks.length > 0
         ? (totalFeedbacks.reduce((acc, f) => acc + f.rating, 0) / totalFeedbacks.length).toFixed(1)
         : 'N/A';

   const canReview = storedUser && ['student', 'external'].includes(storedUser.role);
   const isFull = event.maxParticipants && event.participants?.length >= event.maxParticipants;
   const capacityPct = event.maxParticipants
      ? Math.min(100, Math.round((event.participants?.length / event.maxParticipants) * 100))
      : 0;

   const paymentStatus = myParticipant?.paymentStatus || null;
   const paymentCfg = paymentStatus ? PAYMENT_STATUS_CONFIG[paymentStatus] : null;
   const needsReceipt = paymentStatus === 'pending' || paymentStatus === 'rejected';

   return (
      <div className="pt-32 pb-24 min-h-screen">
         <div className="container mx-auto px-6 max-w-6xl">
            <Link
               to="/events"
               className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 uppercase text-xs font-black tracking-widest transition-colors"
            >
               <ArrowLeft size={14} /> Back to Events
            </Link>

            <div className="grid lg:grid-cols-2 gap-12">
               {/* ── Left: Event Info ── */}
               <div>
                  <div className="rounded-3xl overflow-hidden mb-8 shadow-2xl shadow-blue-500/10 bg-gradient-to-br from-blue-900/40 to-purple-900/40 h-[380px]">
                     {event.coverImage ? (
                        <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-8xl font-black text-white/10">
                           {event.title?.charAt(0)}
                        </div>
                     )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-5">
                     <span className="px-3 py-1 rounded-full bg-blue-600 text-[10px] font-black uppercase tracking-widest text-white">
                        {event.category}
                     </span>
                     {event.community && (
                        <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-widest">
                           🏛️ {event.community.name}
                        </span>
                     )}
                     {event.isVirtual && (
                        <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-black uppercase tracking-widest">
                           💻 Virtual
                        </span>
                     )}
                     {!event.isFree && (
                        <span className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-[10px] font-black uppercase tracking-widest">
                           💳 LKR {event.ticketPrice}
                        </span>
                     )}
                     {event.isFree && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-widest">
                           Free
                        </span>
                     )}
                     {totalFeedbacks.length > 0 && (
                        <span className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                           ⭐ {avgRating} <span className="text-slate-500 text-xs">({totalFeedbacks.length} reviews)</span>
                        </span>
                     )}
                  </div>

                  <h1 className="text-4xl md:text-5xl font-black mb-6 uppercase leading-tight text-slate-900">{event.title}</h1>

                  <div className="space-y-3 text-slate-600 text-sm font-bold uppercase tracking-widest mb-6">
                     <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-blue-500 shrink-0" />
                        {fmt(event.startDate)}
                        {event.endDate && event.endDate !== event.startDate ? ` – ${fmt(event.endDate)}` : ''}
                     </div>
                     {event.venue && (
                        <div className="flex items-center gap-3">
                           <MapPin size={16} className="text-purple-500 shrink-0" />
                           {event.venue}
                        </div>
                     )}
                     {event.isVirtual && event.virtualLink && (
                        <div className="flex items-center gap-3">
                           <Wifi size={16} className="text-cyan-500 shrink-0" />
                           <a href={event.virtualLink} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline normal-case">
                              {event.virtualLink}
                           </a>
                        </div>
                     )}
                     <div className="flex items-center gap-3">
                        <Users size={16} className="text-pink-500 shrink-0" />
                        {event.participants?.length || 0} registered
                        {event.maxParticipants ? ` / ${event.maxParticipants} max` : ''}
                     </div>
                  </div>

                  {/* Capacity bar */}
                  {event.maxParticipants > 0 && (
                     <div className="mb-6">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                           <span>Capacity</span>
                           <span className={isFull ? 'text-rose-400' : 'text-emerald-400'}>
                              {isFull ? 'FULL' : `${event.maxParticipants - (event.participants?.length || 0)} spots left`}
                           </span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                           <div
                              className={`h-full rounded-full transition-all ${capacityPct >= 90 ? 'bg-rose-500' : capacityPct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${capacityPct}%` }}
                           />
                        </div>
                     </div>
                  )}

                  <p className="text-slate-600 leading-loose">{event.description}</p>
               </div>

               {/* ── Right: Registration + Feedback ── */}
               <div className="space-y-6">

                  {/* Registration Panel */}
                  {event.status === 'published' && isStudent && (
                     <div className="surface-panel p-8 rounded-3xl border border-slate-200">
                        <h2 className="text-xl font-black mb-6 uppercase tracking-widest">Registration</h2>

                        {!myParticipant ? (
                           /* Not registered */
                           <div>
                              {!event.isFree && (
                                 <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-5 text-sm text-yellow-800 leading-relaxed">
                                    <span className="font-black block mb-1">Paid Event — LKR {event.ticketPrice}</span>
                                    After registering you'll need to upload a payment receipt for verification.
                                 </div>
                              )}
                              <button
                                 onClick={handleRegister}
                                 disabled={registering || isFull}
                                 className="w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white"
                              >
                                 {registering ? 'Registering...' : isFull ? 'Event Full' : 'Register Now'}
                              </button>
                           </div>
                        ) : (
                           /* Already registered */
                           <div className="space-y-4">
                              {/* Status badge */}
                              {paymentCfg && (
                                 <div className={`flex items-center gap-2 px-4 py-3 rounded-xl bg-${paymentCfg.color}-50 border border-${paymentCfg.color}-200 text-${paymentCfg.color}-700 text-xs font-black uppercase tracking-widest`}>
                                    {paymentCfg.icon}
                                    {paymentCfg.label}
                                 </div>
                              )}

                              {/* Attendance badge */}
                              {myParticipant.attended && (
                                 <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-black uppercase tracking-widest">
                                    <CheckCircle size={14} /> Attendance Marked
                                 </div>
                              )}

                              {/* Receipt upload (paid events needing receipt) */}
                              {needsReceipt && (
                                 <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">
                                       {paymentStatus === 'rejected'
                                          ? '⚠️ Your receipt was rejected. Please upload a new one.'
                                          : 'Upload payment receipt to confirm your spot.'}
                                    </p>
                                    {myReceipt && paymentStatus === 'pending' && (
                                       <div className="mb-3 flex items-center gap-2 text-amber-400 text-xs font-bold">
                                          <Clock size={13} /> {myReceipt.originalName} — Awaiting review
                                       </div>
                                    )}
                                    <form onSubmit={handleReceiptUpload} className="space-y-3">
                                       <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-300 rounded-2xl p-6 cursor-pointer hover:border-blue-400 transition-colors">
                                          <Upload size={24} className="text-slate-500" />
                                          <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                                             {receiptFile ? receiptFile.name : 'Click to select file (JPG, PNG, PDF — max 5MB)'}
                                          </span>
                                          <input
                                             type="file"
                                             accept=".jpg,.jpeg,.png,.pdf"
                                             className="hidden"
                                             ref={fileInputRef}
                                             onChange={(e) => setReceiptFile(e.target.files[0] || null)}
                                          />
                                       </label>
                                       <button
                                          type="submit"
                                          disabled={!receiptFile || uploading}
                                          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                       >
                                          {uploading ? 'Uploading...' : 'Upload Receipt'}
                                       </button>
                                    </form>
                                 </div>
                              )}

                              {/* Already verified */}
                              {paymentStatus === 'verified' && (
                                 <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-emerald-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle size={14} /> Payment confirmed — you're all set!
                                 </div>
                              )}

                              <button
                                 onClick={handleUnregister}
                                 disabled={registering}
                                 className="w-full py-3 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-600 hover:text-rose-700 font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50"
                              >
                                 {registering ? 'Processing...' : 'Unregister'}
                              </button>
                           </div>
                        )}
                     </div>
                  )}

                  {/* Event not open for registration */}
                  {event.status !== 'published' && (
                     <div className="surface-panel p-6 rounded-3xl border border-slate-200 text-center">
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest">
                           {event.status === 'completed' ? 'This event has ended.' : `Event is ${event.status.replace('_', ' ')}.`}
                        </p>
                     </div>
                  )}

                  {/* Not logged in */}
                  {!storedUser && event.status === 'published' && (
                     <div className="surface-panel p-8 rounded-3xl border border-slate-200 text-center">
                        <p className="text-slate-600 text-xs font-black uppercase tracking-widest mb-4 leading-loose">
                           Sign in to register for this event
                        </p>
                        <Link to="/signin">
                           <button className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-widest transition-all active:scale-95">
                              Sign In
                           </button>
                        </Link>
                     </div>
                  )}

                  {/* Feedback Section */}
                  <div className="surface-panel p-8 rounded-3xl border border-slate-200">
                     <h2 className="text-xl font-black mb-6 uppercase tracking-widest">Reviews</h2>

                     {!storedUser ? (
                        <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl text-center mb-6">
                           <p className="text-slate-600 text-xs font-black uppercase tracking-widest mb-4 leading-loose">
                              Sign in to leave a review
                           </p>
                           <Link to="/signin">
                              <button className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-widest transition-all active:scale-95">
                                 Sign In to Review
                              </button>
                           </Link>
                        </div>
                     ) : !canReview ? (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 p-5 rounded-2xl text-center mb-6">
                           <p className="text-yellow-500 text-[10px] font-black uppercase tracking-widest leading-loose">
                              Only students and external participants can leave reviews.
                           </p>
                        </div>
                     ) : submitted ? (
                        <div className="bg-green-500/20 border border-green-500/50 p-5 rounded-2xl text-green-400 mb-6 text-sm font-bold">
                           ✓ Your review was submitted successfully!
                        </div>
                     ) : (
                        <form onSubmit={handleSubmitFeedback} className="space-y-5 mb-8">
                           <div>
                              <label className="block text-xs font-black uppercase text-slate-500 mb-3 tracking-widest">Rating</label>
                              <div className="flex gap-3">
                                 {[1, 2, 3, 4, 5].map(v => (
                                    <button
                                       key={v}
                                       type="button"
                                       onClick={() => setRating(v)}
                                       className={`w-11 h-11 rounded-xl font-black transition-all ${rating === v ? 'bg-blue-600 text-white scale-110 shadow-xl shadow-blue-500/30' : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200'}`}
                                    >
                                       {v}
                                    </button>
                                 ))}
                              </div>
                           </div>
                           <div>
                              <label className="block text-xs font-black uppercase text-slate-500 mb-3 tracking-widest">Your Comments</label>
                              <textarea
                                 value={feedback}
                                 onChange={e => setFeedback(e.target.value)}
                                 required
                                 rows={4}
                                 placeholder="Tell us about your experience..."
                                 className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-slate-900 focus:outline-none focus:border-blue-400 transition-colors text-sm font-medium resize-none"
                              />
                           </div>
                           <button
                              type="submit"
                              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest transition-all active:scale-95"
                           >
                              Submit Review
                           </button>
                        </form>
                     )}

                     <div>
                        <h3 className="text-lg font-black mb-5 uppercase tracking-widest border-b border-slate-200 pb-4">
                           {totalFeedbacks.length > 0
                              ? `${totalFeedbacks.length} Review${totalFeedbacks.length > 1 ? 's' : ''}`
                              : 'No Reviews Yet'}
                        </h3>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                           {totalFeedbacks.length === 0 ? (
                              <p className="text-slate-500 text-xs font-black uppercase italic">Be the first to leave a review!</p>
                           ) : (
                              [...totalFeedbacks].reverse().map((f, i) => (
                                 <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200">
                                    <div className="flex items-center gap-3 mb-2">
                                       <div className="flex text-yellow-400 text-xs">
                                          {[...Array(5)].map((_, j) => (
                                             <span key={j} className={j < f.rating ? 'opacity-100' : 'opacity-20'}>★</span>
                                          ))}
                                       </div>
                                       <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{f.username}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">{f.comment}</p>
                                 </div>
                              ))
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default EventDetails;
