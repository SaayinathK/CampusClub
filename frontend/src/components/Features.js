import React from 'react';

const FeatureCard = ({ icon, title, description }) => (
    <div className="surface-card p-8 rounded-3xl hover:border-cyan-300/30 transition-all hover:-translate-y-2 group">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors border border-cyan-300/10">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-4 text-slate-900">{title}</h3>
        <p className="text-slate-500 leading-relaxed">{description}</p>
    </div>
);

const Features = () => {
    const features = [
        {
            title: "Role-Based Dashboards",
            description: "Students, community admins, and system admins see the actions and insights that matter to their role.",
            icon: (
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m0-5a9 9 0 11-9 9 9 9 0 019-9z" />
                </svg>
            )
        },
        {
            title: "Smart Approvals",
            description: "Review pending events, communities, and membership requests with a clean approval workflow.",
            icon: (
                <svg className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
            )
        },
        {
            title: "Real-time Notifications",
            description: "Keep every member updated with instant alerts for events, announcements, and status changes.",
            icon: (
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            )
        },
        {
            title: "Event Discovery",
            description: "Browse upcoming campus events with clear timings, locations, and one-click registration paths.",
            icon: (
                <svg className="w-8 h-8 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    ];

    return (
        <section id="features" className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose <span className="text-gradient">ClubSphere?</span></h2>
                    <p className="text-slate-500 max-w-xl mx-auto">A focused experience for managing clubs, approvals, notifications, and student engagement in one place.</p>
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
