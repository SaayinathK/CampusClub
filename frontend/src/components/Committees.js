import React from 'react';

const committees = [
    {
        name: "Standardization Committee",
        role: "Governance & Quality",
        description: "Ensuring all campus events meet the highest standards of safety, inclusivity, and quality.",
        icon: (
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        )
    },
    {
        name: "Treasury Board",
        role: "Financial Oversight",
        description: "Managing budgets and financial allocations for all student-led initiatives and club fests.",
        icon: (
            <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    {
        name: "Public Relations",
        role: "Communication",
        description: "Bridging the gap between the student body and event organizers through effective media.",
        icon: (
            <svg className="w-10 h-10 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
        )
    },
    {
        name: "Volunteer Corps",
        role: "Operations",
        description: "The backbone of every event, providing the manpower and dedication needed for success.",
        icon: (
            <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        )
    }
];

const Committees = () => {
    return (
        <section id="committees" className="py-24 relative bg-gradient-to-b from-transparent via-sky-500/5 to-transparent">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <div className="theme-pill mb-4 px-4 py-1 text-sm font-medium uppercase tracking-[0.25em] w-max mx-auto">
                        👥 Governance and support teams
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Campus <span className="text-gradient">Committees</span></h2>
                    <p className="text-slate-500 max-w-2xl mx-auto">Operational teams that keep approvals, events, student coordination, and campus engagement running smoothly.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {committees.map((committee, index) => (
                        <div key={index} className="group relative p-8 rounded-3xl surface-card hover:border-cyan-300/30 transition-all duration-500 hover:-translate-y-2">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
                            </div>

                            <div className="mb-6 transform transition-transform duration-500 group-hover:scale-110">
                                {committee.icon}
                            </div>

                            <h3 className="text-xl font-bold mb-1 text-slate-900 group-hover:text-cyan-700 transition-colors">{committee.name}</h3>
                            <div className="text-sm font-medium text-sky-600 mb-4">{committee.role}</div>
                            <p className="text-slate-500 text-sm leading-relaxed">{committee.description}</p>

                            <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
                                <span className="text-xs text-slate-500">Learn More</span>
                                <svg className="w-5 h-5 text-slate-500 group-hover:text-cyan-700 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Committees;
