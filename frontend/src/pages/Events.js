import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FeedbackModal from '../components/FeedbackModal';
import { MessageSquare, Star, ArrowRight } from 'lucide-react';

const EventCard = ({ event, onViewFeedback }) => {
    const averageRating = event.ratings.length > 0
        ? (event.ratings.reduce((a, b) => a + b, 0) / event.ratings.length).toFixed(1)
        : "NA";

    return (
        <div className="group relative glass-dark rounded-3xl overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-2 shadow-2xl">
            <div className="h-56 overflow-hidden relative">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl glass text-yellow-500 text-[10px] font-black flex items-center gap-1.5 shadow-2xl border border-white/10">
                    <Star size={12} className="fill-current" />
                    {averageRating}
                </div>
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent"></div>
            </div>
            <div className="p-8 relative">
                <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] border border-blue-500/20">
                        {event.category}
                    </span>
                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">{event.date}</span>
                </div>
                <h3 className="text-2xl font-black mb-3 group-hover:text-blue-400 transition-colors uppercase tracking-tight leading-tight">{event.title}</h3>
                <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black mb-8 uppercase tracking-widest">
                    <svg className="w-4 h-4 text-blue-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                </div>
                
                <div className="flex gap-3">
                    <Link to={`/event/${event.id}`} className="flex-1 text-center py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-black transition-all active:scale-95 uppercase tracking-[0.2em] border border-white/5 flex items-center justify-center gap-2 group/btn">
                        Details <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                    <button 
                        onClick={() => onViewFeedback(event)}
                        className="p-4 rounded-xl bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white transition-all active:scale-95 border border-blue-500/20 flex items-center justify-center"
                        title="View Feedbacks"
                    >
                        <MessageSquare size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const Events = ({ events }) => {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewFeedback = (event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const upcomingEvents = events.filter(e => e.upcoming);
    const allEvents = events;

    return (
        <div className="pt-32 pb-24 min-h-screen">
            <div className="container mx-auto px-6">
                <div className="mb-16">
                    <h1 className="text-5xl md:text-8xl font-black mb-6 uppercase tracking-tighter">
                        Campus <span className="bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">Events</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl text-lg uppercase font-bold tracking-widest leading-loose border-l-4 border-blue-500 pl-8">
                        Stay updated with everything happening around the campus. Explore, participate, and share your experiences.
                    </p>
                </div>

                <section className="mb-24">
                    <div className="flex items-center gap-6 mb-12">
                        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-[0.3em] text-white">Upcoming Events</h2>
                        <div className="h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent flex-1"></div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/5 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                            <Star size={12} strokeWidth={3} /> Featured Spotlight
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-10">
                        {upcomingEvents.map(event => {
                            const averageRating = event.ratings.length > 0
                                ? (event.ratings.reduce((a, b) => a + b, 0) / event.ratings.length).toFixed(1)
                                : "NA";

                            return (
                                <div key={event.id} className="relative group rounded-[2.5rem] overflow-hidden min-h-[500px] flex items-end shadow-2xl shadow-blue-500/10 border border-white/5 hover:border-blue-500/30 transition-all duration-700">
                                    <img src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                                    <div className="relative p-12 w-full">
                                        <div className="flex justify-between items-start mb-6">
                                            <span className="inline-block px-4 py-1.5 rounded-xl bg-blue-600 font-black text-white uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-blue-500/40">
                                                Featured Event
                                            </span>
                                            <div className="flex items-center text-yellow-500 font-black text-sm glass px-4 py-2 rounded-xl border border-white/10 shadow-2xl">
                                                <Star size={16} fill="currentColor" className="mr-2" />
                                                {averageRating}
                                            </div>
                                        </div>
                                        <h3 className="text-4xl md:text-5xl font-black mb-6 uppercase leading-[0.9] tracking-tighter text-white">{event.title}</h3>
                                        <div className="flex gap-8 text-[11px] text-gray-400 mb-10 uppercase font-black tracking-[0.2em] items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> {event.date}
                                            </div>
                                            <span>{event.location}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Link to={`/event/${event.id}`} className="px-10 py-4 rounded-2xl bg-white text-black font-black text-[12px] transition-all hover:bg-gray-200 active:scale-95 shadow-2xl uppercase tracking-[0.3em]">
                                                View & Rate
                                            </Link>
                                            <button 
                                                onClick={() => handleViewFeedback(event)}
                                                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all active:scale-95 border border-white/10"
                                            >
                                                <MessageSquare size={24} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-6 mb-12">
                        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-[0.3em] text-white">All Events</h2>
                        <div className="h-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-transparent flex-1"></div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {allEvents.map(event => (
                            <EventCard key={event.id} event={event} onViewFeedback={handleViewFeedback} />
                        ))}
                    </div>
                </section>
            </div>

            <FeedbackModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                eventId={selectedEvent?.id}
                eventTitle={selectedEvent?.title}
            />
        </div>
    );
};

export default Events;
