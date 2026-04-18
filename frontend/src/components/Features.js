import React from 'react';

const FeatureCard = ({ icon, title, description }) => (
    <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all hover:-translate-y-2 group group">
        <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-4 text-slate-900">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
);

const Features = () => {
    const features = [
        {
            title: "Discover Events",
            description: "Easily browse and register for upcoming workshops, seminars, and fests happening across the campus.",
            icon: (
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            )
        },
        {
            title: "Club Management",
            description: "Powerful tools for club presidents and members to organize, schedule, and promote their activities.",
            icon: (
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        },
        {
            title: "Real-time Updates",
            description: "Get instant notifications about event changes, venue shifts, and registration deadlines.",
            icon: (
                <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            )
        }
    ];

    return (
        <section id="features" className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900">Why Choose <span className="text-gradient">Club Hub?</span></h2>
                    <p className="text-slate-600 max-w-xl mx-auto">Everything you need to make your campus life more engaging and organized.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
