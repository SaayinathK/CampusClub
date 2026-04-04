import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Wifi, ArrowLeft } from 'lucide-react';
import api from '../utils/api';

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [dbFeedbacks, setDbFeedbacks] = useState([]);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Fetch event from backend
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data.data);
      } catch (err) {
        if (err.response?.status === 404) setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // Fetch feedbacks
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/feedback/${id}`);
        if (res.ok) {
          const data = await res.json();
          setDbFeedbacks(data);
        }
      } catch (err) {
        console.error('Error fetching feedbacks:', err);
      }
    };
    fetchFeedbacks();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      const res = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId: id, rating, comment: feedback, username: user?.name }),
      });

      if (res.ok) {
        setSubmitted(true);
        setFeedback('');
        // Refresh feedbacks
        const updated = await fetch(`http://localhost:5000/api/feedback/${id}`);
        if (updated.ok) setDbFeedbacks(await updated.json());
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

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

  // Merge local feedbacks + db feedbacks
  const localFeedbacks = (event.feedbacks || []).map((f, i) => ({
    comment: f,
    rating: event.ratings[i],
    username: 'Student Peer',
  }));
  const totalFeedbacks = [...localFeedbacks, ...dbFeedbacks];

  const avgRating =
    totalFeedbacks.length > 0
      ? (totalFeedbacks.reduce((acc, f) => acc + f.rating, 0) / totalFeedbacks.length).toFixed(1)
      : 'N/A';

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const canReview =
    storedUser && ['student', 'external', 'sliit'].includes(storedUser.role);

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
          {/* Left: Event Info */}
          <div>
            {/* Cover Image */}
            <div className="rounded-3xl overflow-hidden mb-8 shadow-2xl shadow-blue-500/10 bg-gradient-to-br from-blue-900/40 to-purple-900/40 h-[380px]">
              {event.coverImage ? (
                <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl font-black text-white/10">
                  {event.title?.charAt(0)}
                </div>
              )}
            </div>

            {/* Badges */}
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
              {totalFeedbacks.length > 0 && (
                <span className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                  ⭐ {avgRating} <span className="text-gray-500 text-xs">({totalFeedbacks.length} reviews)</span>
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-6 uppercase leading-tight">{event.title}</h1>

            {/* Event Meta */}
            <div className="space-y-3 text-gray-400 text-sm font-bold uppercase tracking-widest mb-8">
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

            <p className="text-gray-400 leading-loose">{event.description}</p>
          </div>

          {/* Right: Feedback Section */}
          <div className="glass-dark p-8 md:p-10 rounded-3xl border border-white/5 h-fit">
            <h2 className="text-2xl font-black mb-8 uppercase tracking-widest">Reviews</h2>

            {!storedUser ? (
              <div className="bg-blue-500/10 border border-blue-500/30 p-8 rounded-2xl text-center mb-8">
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-4 leading-loose">
                  Sign in to leave a review
                </p>
                <Link to="/signin">
                  <button className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-widest transition-all active:scale-95">
                    Sign In to Review
                  </button>
                </Link>
              </div>
            ) : !canReview ? (
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-2xl text-center mb-8">
                <p className="text-yellow-500 text-[10px] font-black uppercase tracking-widest leading-loose">
                  Only students and external participants can leave reviews.
                </p>
              </div>
            ) : submitted ? (
              <div className="bg-green-500/20 border border-green-500/50 p-5 rounded-2xl text-green-400 mb-8 text-sm font-bold">
                ✓ Your review was submitted successfully!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 mb-10">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-500 mb-3 tracking-widest">Rating</label>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setRating(v)}
                        className={`w-11 h-11 rounded-xl font-black transition-all ${rating === v ? 'bg-blue-600 text-white scale-110 shadow-xl shadow-blue-500/30' : 'bg-white/5 text-gray-500 hover:text-white border border-white/10'}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-gray-500 mb-3 tracking-widest">Your Comments</label>
                  <textarea
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    required
                    rows={4}
                    placeholder="Tell us about your experience..."
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm font-medium resize-none"
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

            {/* Reviews List */}
            <div>
              <h3 className="text-lg font-black mb-5 uppercase tracking-widest border-b border-white/5 pb-4">
                {totalFeedbacks.length > 0
                  ? `${totalFeedbacks.length} Review${totalFeedbacks.length > 1 ? 's' : ''}`
                  : 'No Reviews Yet'}
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {totalFeedbacks.length === 0 ? (
                  <p className="text-gray-600 text-xs font-black uppercase italic">Be the first to leave a review!</p>
                ) : (
                  [...totalFeedbacks].reverse().map((f, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex text-yellow-400 text-xs">
                          {[...Array(5)].map((_, j) => (
                            <span key={j} className={j < f.rating ? 'opacity-100' : 'opacity-20'}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{f.username}</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{f.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;