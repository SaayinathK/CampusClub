import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const PAYMENT_CONFIG = {
  not_required: { label: 'Free', color: 'emerald', dot: '🟢' },
  pending:      { label: 'Receipt Pending', color: 'amber',   dot: '🟡' },
  verified:     { label: 'Payment Verified', color: 'emerald', dot: '✅' },
  rejected:     { label: 'Receipt Rejected', color: 'rose',   dot: '🔴' },
};

const EVENT_STATUS_CONFIG = {
  published:  { label: 'Open',      color: 'emerald' },
  completed:  { label: 'Completed', color: 'purple' },
  cancelled:  { label: 'Cancelled', color: 'rose' },
};

export default function StudentRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events/my-registrations');
      setRegistrations(res.data.data || []);
    } catch {
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRegistrations(); }, []);

  const handleUnregister = async (eventId, title) => {
    if (!window.confirm(`Unregister from "${title}"?`)) return;
    try {
      await api.delete(`/events/${eventId}/register`);
      toast.success('Unregistered successfully');
      fetchRegistrations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to unregister');
    }
  };

  const filtered = filter === 'all'
    ? registrations
    : registrations.filter(r => {
        if (filter === 'paid') return !r.isFree;
        if (filter === 'free') return r.isFree;
        if (filter === 'attended') return r.participant?.attended;
        if (filter === 'upcoming') return r.status === 'published';
        return true;
      });

  const stats = {
    total: registrations.length,
    attended: registrations.filter(r => r.participant?.attended).length,
    upcoming: registrations.filter(r => r.status === 'published').length,
    paid: registrations.filter(r => !r.isFree).length,
  };

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans text-slate-100 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full mix-blend-screen filter blur-[120px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full mix-blend-screen filter blur-[150px] opacity-60 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-8">

        {/* Header */}
        <header className="glass-dark rounded-3xl p-8 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Registrations</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium">All events you've signed up for</p>
          </div>
          <Link to="/student" className="px-5 py-2.5 rounded-full glass hover:bg-white/10 font-bold text-sm text-white border border-white/10 transition-all">
            ← Dashboard
          </Link>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, icon: '📋', color: 'cyan' },
            { label: 'Upcoming', value: stats.upcoming, icon: '📅', color: 'blue' },
            { label: 'Attended', value: stats.attended, icon: '✅', color: 'emerald' },
            { label: 'Paid Events', value: stats.paid, icon: '💳', color: 'yellow' },
          ].map((s) => (
            <div key={s.label} className={`glass-dark rounded-2xl p-5 border border-white/5`}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className={`text-2xl font-black text-${s.color}-400`}>{s.value}</div>
              <div className="text-xs text-slate-400 uppercase font-bold tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'attended', label: 'Attended' },
            { value: 'paid', label: 'Paid' },
            { value: 'free', label: 'Free' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all border ${
                filter === f.value
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                  : 'border-white/10 text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {f.label}
              <span className="ml-2 opacity-60">
                {f.value === 'all' ? registrations.length
                  : f.value === 'upcoming' ? stats.upcoming
                  : f.value === 'attended' ? stats.attended
                  : f.value === 'paid' ? stats.paid
                  : registrations.filter(r => r.isFree).length}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-4">
            <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <span className="text-cyan-400 font-medium text-sm uppercase tracking-widest animate-pulse">Loading...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-dark rounded-3xl p-16 text-center border border-white/5">
            <div className="text-6xl mb-4 opacity-50">📋</div>
            <h3 className="text-2xl font-black mb-2">No registrations</h3>
            <p className="text-slate-400 text-sm mb-6">
              {filter === 'all' ? "You haven't registered for any events yet." : `No ${filter} events found.`}
            </p>
            {filter === 'all' && (
              <Link to="/events" className="px-6 py-3 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-sm hover:bg-cyan-500/30 transition-colors">
                Browse Events →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((reg) => {
              const payment = reg.participant?.paymentStatus
                ? PAYMENT_CONFIG[reg.participant.paymentStatus]
                : null;
              const evStatus = EVENT_STATUS_CONFIG[reg.status] || { label: reg.status, color: 'slate' };
              const isUpcoming = reg.status === 'published';

              return (
                <div key={reg._id} className="glass-dark rounded-2xl border border-white/5 overflow-hidden hover:border-white/10 transition-all">
                  <div className="flex flex-col md:flex-row gap-0">
                    {/* Date column */}
                    <div className="md:w-24 bg-white/5 flex md:flex-col items-center justify-center p-4 gap-2 md:gap-0 shrink-0">
                      <div className="text-xs font-black uppercase text-slate-400 tracking-widest">
                        {new Date(reg.startDate).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                      <div className="text-3xl font-black text-white">
                        {new Date(reg.startDate).getDate()}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(reg.startDate).getFullYear()}
                      </div>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 p-5 flex flex-col md:flex-row gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-${evStatus.color}-500/10 text-${evStatus.color}-400 border-${evStatus.color}-500/20`}>
                            {evStatus.label}
                          </span>
                          {reg.isFree ? (
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                              Free
                            </span>
                          ) : (
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                              💳 LKR {reg.ticketPrice}
                            </span>
                          )}
                          {reg.participant?.attended && (
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-purple-500/10 text-purple-400 border-purple-500/20">
                              ✓ Attended
                            </span>
                          )}
                        </div>

                        <h3 className="font-black text-white text-lg leading-tight mb-1">{reg.title}</h3>
                        <p className="text-slate-400 text-xs font-medium">
                          {reg.community?.name && <span className="mr-3">🏛️ {reg.community.name}</span>}
                          {reg.venue && <span className="mr-3">📍 {reg.venue}</span>}
                          {reg.endDate && reg.endDate !== reg.startDate && (
                            <span>↔ {fmt(reg.endDate)}</span>
                          )}
                        </p>

                        {/* Payment status */}
                        {payment && (
                          <div className={`mt-3 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border bg-${payment.color}-500/10 text-${payment.color}-400 border-${payment.color}-500/20`}>
                            {payment.dot} {payment.label}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col gap-2 shrink-0 md:items-end justify-end">
                        <Link
                          to={`/events/${reg._id}`}
                          className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black text-[10px] uppercase tracking-widest hover:bg-blue-500/20 transition-colors text-center"
                        >
                          View Event
                        </Link>
                        {isUpcoming && (
                          <button
                            onClick={() => handleUnregister(reg._id, reg.title)}
                            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 transition-colors"
                          >
                            Unregister
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
    </div>
  );
}
