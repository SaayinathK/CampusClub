import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FeedbackModal from '../components/FeedbackModal';
import { Star, ArrowRight, MessageSquare, Calendar, MapPin, Users, Wifi } from 'lucide-react';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const CategoryBadge = ({ category }) => (
  <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] border border-blue-500/20">
    {category}
  </span>
);

const EventCard = ({ event, onViewFeedback }) => {
  const averageRating = event.ratings?.length > 0
    ? (event.ratings.reduce((a, b) => a + b, 0) / event.ratings.length).toFixed(1)
    : "NA";

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-2 shadow-sm flex flex-col">
      <div className="h-48 overflow-hidden relative flex-shrink-0">
        {event.coverImage ? (
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl font-black text-white/10">
            {event.title?.charAt(0)}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
        <div className="absolute top-4 left-4">
          <CategoryBadge category={event.category} />
        </div>
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-white text-yellow-600 text-[10px] font-black flex items-center gap-1.5 shadow-md border border-slate-200">
          <Star size={12} className="fill-current" /> {averageRating}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1 bg-white">
        <h3 className="text-xl font-black mb-2 text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-tight line-clamp-2">
          {event.title}
        </h3>
        {event.description && <p className="text-slate-600 text-xs mb-4 line-clamp-2 leading-relaxed">{event.description}</p>}

        <div className="flex flex-col gap-2 mb-5 text-[11px] text-slate-500 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2"><Calendar size={12} className="text-blue-500" /> {formatDate(event.startDate)}</div>
          {event.venue && <div className="flex items-center gap-2"><MapPin size={12} className="text-purple-500" /> {event.venue}</div>}
          {event.isVirtual && <div className="flex items-center gap-2"><Wifi size={12} className="text-cyan-500" /> Virtual Event</div>}
          <div className="flex items-center gap-2"><Users size={12} className="text-pink-500" /> {event.participants?.length || 0}{event.maxParticipants ? ` / ${event.maxParticipants} max` : ''}</div>
          {event.community?.name && <div className="flex items-center gap-2"><Star size={12} className="text-yellow-400" /> {event.community.name}</div>}
        </div>

        <div className="mt-auto flex gap-3">
          <Link
            to={`/events/${event._id}`}
            className="flex-1 text-center py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-black transition-all active:scale-95 uppercase tracking-[0.2em] border border-blue-200 flex items-center justify-center gap-2 group/btn"
          >
            Register / Details <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
          <button
            onClick={() => onViewFeedback(event)}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all active:scale-95 border border-slate-200 flex items-center justify-center"
            title="View Feedbacks"
          >
            <MessageSquare size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const FeaturedCard = ({ event }) => (
  <div className="relative group rounded-[2.5rem] overflow-hidden min-h-[420px] flex items-end shadow-lg shadow-blue-500/10 border border-slate-200 hover:border-blue-500/30 transition-all duration-700 bg-white">
    {event.coverImage ? (
      <img src={event.coverImage} alt={event.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-20" />
    ) : (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50" />
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
    <div className="relative p-10 w-full">
      <div className="flex justify-between items-start mb-4">
        <span className="inline-block px-4 py-1.5 rounded-xl bg-blue-600 font-black text-white uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-blue-500/40">
          Featured Event
        </span>
        <CategoryBadge category={event.category} />
      </div>
      <h3 className="text-3xl md:text-4xl font-black mb-4 uppercase leading-tight tracking-tighter text-slate-900 drop-shadow-sm">{event.title}</h3>
      <div className="flex gap-6 text-[11px] text-slate-600 mb-6 uppercase font-black tracking-[0.2em] items-center flex-wrap">
        <div className="flex items-center gap-2"><Calendar size={12} className="text-blue-400" /> {formatDate(event.startDate)}</div>
        {event.venue && <div className="flex items-center gap-2"><MapPin size={12} className="text-purple-400" /> {event.venue}</div>}
        {event.community?.name && <div className="flex items-center gap-2"><Star size={12} className="text-yellow-400" /> {event.community.name}</div>}
      </div>
      <Link
        to={`/events/${event._id}`}
        className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-blue-600 text-white font-black text-[11px] transition-all hover:bg-blue-700 active:scale-95 shadow-md uppercase tracking-[0.3em]"
      >
        View Details <ArrowRight size={14} />
      </Link>
    </div>
  </div>
);

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const CATEGORIES = ['Technology', 'Arts', 'Sports', 'Academic', 'Cultural', 'Business', 'Science', 'Social', 'Other'];

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: 100 });
        if (category) params.set('category', category);
        if (search) params.set('search', search);
        const res = await fetch(`http://localhost:5001/api/events?${params}`);
        const data = await res.json();
        setEvents(data.data || []);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [category, search]);

  const handleViewFeedback = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const featured = events.slice(0, 2);
  const rest = events.slice(2);

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-8xl font-black mb-6 uppercase tracking-tighter text-slate-900">
            Campus <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-transparent bg-clip-text">Events</span>
          </h1>
          <p className="text-slate-600 max-w-2xl text-lg uppercase font-bold tracking-widest leading-loose border-l-4 border-blue-500 pl-8">
            Stay updated with everything happening around the campus. Explore, participate, and share experiences.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-wrap gap-3 mb-12">
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-slate-900 text-sm outline-none focus:border-blue-500/50 transition-colors placeholder:text-slate-400 min-w-[220px] shadow-sm"
          />
          <button
            onClick={() => setCategory('')}
            className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${category === '' ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
          >
            All
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c === category ? '' : c)}
              className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${category === c ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-40 bg-white border border-slate-200 rounded-[3rem] shadow-sm max-w-4xl mx-auto">
            <div className="text-6xl mb-6 opacity-80">📅</div>
            <h3 className="text-2xl font-black uppercase tracking-widest text-slate-900 mb-3">No Events Found</h3>
            <p className="text-slate-500 uppercase text-sm tracking-widest">{search || category ? 'Try a different search or category' : 'Check back soon for upcoming events'}</p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured.length > 0 && (
              <section className="mb-20">
                <div className="flex items-center gap-6 mb-10">
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-[0.3em] text-slate-900 whitespace-nowrap">Upcoming Events</h2>
                  <div className="h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent flex-1" />
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-blue-600 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                    <Star size={12} strokeWidth={3} /> Featured
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {featured.map(ev => <FeaturedCard key={ev._id} event={ev} />)}
                </div>
              </section>
            )}

            {/* All Events */}
            {rest.length > 0 && (
              <section>
                <div className="flex items-center gap-6 mb-10">
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-[0.3em] text-slate-900 whitespace-nowrap">All Events</h2>
                  <div className="h-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-transparent flex-1" />
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest whitespace-nowrap px-4 py-2 bg-slate-100 rounded-full border border-slate-200">{events.length} total</span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {rest.map(ev => <EventCard key={ev._id} event={ev} onViewFeedback={handleViewFeedback} />)}
                </div>
              </section>
            )}
          </>
        )}

        <FeedbackModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          eventId={selectedEvent?._id}
          eventTitle={selectedEvent?.title}
        />
      </div>
    </div>
  );
}