import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const EventCarousel = ({ events }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselEvents = events.filter(e => e.upcoming);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % carouselEvents.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [carouselEvents.length]);

    const nextSlide = () => setActiveIndex((activeIndex + 1) % carouselEvents.length);
    const prevSlide = () => setActiveIndex((activeIndex - 1 + carouselEvents.length) % carouselEvents.length);

    return (
        <section id="events" className="relative min-h-[85vh] flex items-center pt-24 overflow-hidden">
            <div className="absolute top-0 -left-4 w-96 h-96 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

            <div className="dashboard-container relative z-10">
                <div className="relative h-[400px] md:h-[600px] rounded-[2rem] overflow-hidden surface-panel">
                    {carouselEvents.map((event, index) => (
                        <div
                            key={event.id}
                            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === activeIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
                        >
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/15 to-transparent"></div>

                            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                                <div className="theme-pill px-3 py-1 text-[10px] font-black tracking-widest mb-4 w-max">
                                    {event.category}
                                </div>
                                <h3 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-tighter font-display text-white">{event.title}</h3>
                                <div className="flex flex-wrap gap-6 text-slate-100 items-center">
                                    <div className="flex items-center gap-2 uppercase font-black text-[10px] tracking-widest">
                                        <svg className="w-5 h-5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {event.date}
                                    </div>
                                    <Link to={`/event/${event.id}`} className="ml-auto theme-button-primary px-8 py-3 text-[10px] uppercase tracking-[0.2em]">
                                        View & Rate
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="absolute bottom-8 left-8 flex gap-2">
                        {carouselEvents.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveIndex(index)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-12 bg-blue-600' : 'w-8 bg-slate-300'}`}
                            ></button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EventCarousel;
