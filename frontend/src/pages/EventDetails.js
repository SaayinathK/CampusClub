import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const EventDetails = ({ events, onAddFeedback }) => {
    const { id } = useParams();
    const event = events.find(e => e.id === parseInt(id));

    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [dbFeedbacks, setDbFeedbacks] = useState([]);

    React.useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/feedback/${id}`);
                const data = await res.json();
                if (res.ok) {
                    setDbFeedbacks(data);
                }
            } catch (err) {
                console.error('Error fetching feedbacks:', err);
            }
        };
        fetchFeedbacks();
    }, [id]);

    if (!event) return <div className="pt-32 text-center h-screen">Event not found</div>;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (feedback.trim()) {
            onAddFeedback(event.id, rating, feedback);
            setSubmitted(true);
            setFeedback('');
        }
    };

    const totalRatings = [...event.ratings, ...dbFeedbacks.map(f => f.rating)];
    const averageRating = totalRatings.length > 0
        ? (totalRatings.reduce((a, b) => a + b, 0) / totalRatings.length).toFixed(1)
        : "NA";
    const totalReviews = event.feedbacks.length + dbFeedbacks.length;

    return (
        <div className="pt-32 pb-24 min-h-screen">
            <div className="container mx-auto px-6">
                <Link to="/events" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8 uppercase text-xs font-black tracking-widest">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    Back to Events
                </Link>

                <div className="grid lg:grid-cols-2 gap-16">
                    {/* Left: Event Info */}
                    <div>
                        <div className="rounded-3xl overflow-hidden mb-8 shadow-2xl shadow-blue-500/20">
                            <img src={event.image} alt={event.title} className="w-full h-[400px] object-cover" />
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="px-3 py-1 rounded-full bg-blue-600 text-[10px] font-black uppercase tracking-widest">{event.category}</span>
                            <div className="flex items-center text-yellow-500 font-bold">
                                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                {averageRating} ({event.feedbacks.length} Reviews)
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-6 uppercase leading-tight">{event.title}</h1>
                        <div className="space-y-4 text-gray-400 uppercase font-bold text-sm">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {event.date}
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {event.location}
                            </div>
                        </div>
                        <p className="mt-8 text-gray-400 leading-loose">
                            Join us for an unforgettable experience at our campus event. We have curated a set of activities that will engage your senses and provide valuable knowledge and networking opportunities for all participants.
                        </p>
                    </div>

                    {/* Right: Feedback Section */}
                    <div className="glass-dark p-8 md:p-12 rounded-3xl border border-white/5 h-fit">
                        <h2 className="text-2xl font-black mb-8 uppercase tracking-widest">Submit Feedback</h2>

                        {(() => {
                            const user = JSON.parse(localStorage.getItem('user'));
                            
                            if (!user) {
                                return (
                                    <div className="bg-blue-500/10 border border-blue-500/30 p-8 rounded-2xl text-center">
                                        <p className="text-gray-400 uppercase text-xs font-black tracking-widest mb-6 leading-loose">
                                            Join the community to share your experience. <br/> Registration is mandatory for submitting feedback.
                                        </p>
                                        <Link to="/signin">
                                            <button className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                                                Sign In to Review
                                            </button>
                                        </Link>
                                    </div>
                                );
                            }

                            if (user.role !== 'sliit' && user.role !== 'external') {
                                return (
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-8 rounded-2xl text-center">
                                        <p className="text-yellow-500 uppercase text-[10px] font-black tracking-widest leading-loose">
                                            Submission Restricted <br/> 
                                            <span className="text-gray-500 mt-2 block">Only SLIIT Students and External Participants are authorized to rate events.</span>
                                        </p>
                                    </div>
                                );
                            }

                            if (submitted) {
                                return (
                                    <div className="bg-green-500/20 border border-green-500/50 p-6 rounded-2xl text-green-400 mb-8">
                                        Thank you! Your feedback has been submitted successfully.
                                    </div>
                                );
                            }

                            return (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-500 mb-4 tracking-widest">Rating</label>
                                        <div className="flex gap-4">
                                            {[1, 2, 3, 4, 5].map(v => (
                                                <button
                                                    key={v}
                                                    type="button"
                                                    onClick={() => setRating(v)}
                                                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all ${rating === v ? 'bg-blue-600 text-white scale-110 shadow-xl shadow-blue-500/30' : 'glass-dark text-gray-500 hover:text-white'}`}
                                                >
                                                    {v}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-500 mb-4 tracking-widest">Your Comments</label>
                                        <textarea
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                            required
                                            rows="4"
                                            placeholder="Tell us about your experience..."
                                            className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-blue-500 transition-colors uppercase text-sm font-bold"
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest transition-all active:scale-95 shadow-2xl shadow-blue-500/20">
                                        Submit Review
                                    </button>
                                </form>
                            );
                        })()}

                        <div className="mt-12">
                            <h3 className="text-xl font-black mb-6 uppercase tracking-widest border-b border-white/5 pb-4">Recent Reviews</h3>
                            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10">
                                {totalReviews === 0 ? (
                                    <p className="text-gray-600 uppercase text-xs font-black italic">No feedback yet. Be the first to share!</p>
                                ) : (
                                    [...event.feedbacks.map((f, i) => ({ comment: f, rating: event.ratings[i], username: 'Student Peer' })), ...dbFeedbacks].map((f, i) => (
                                        <div key={i} className="p-6 rounded-2xl glass border border-white/5">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="flex text-yellow-500 text-xs">
                                                    {[...Array(5)].map((_, j) => (
                                                        <svg key={j} className={`w-3 h-3 ${j < f.rating ? 'fill-current' : 'text-gray-700'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                    ))}
                                                </div>
                                                <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{f.username}</span>
                                            </div>
                                            <p className="text-xs text-gray-300 uppercase leading-loose font-bold">{f.comment}</p>
                                        </div>
                                    )).reverse()
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
