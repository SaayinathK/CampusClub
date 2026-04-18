import { useState, useEffect } from 'react';
import { Star, Users, Calendar, ShieldCheck, ArrowRight, Search } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const CLUBS_HERO_IMAGE = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop';

const CategoryBadge = ({ category }) => (
  <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-[0.2em] border border-blue-200">
    {category}
  </span>
);

const JOIN_BTN = {
  none: { label: 'Request to Join', cls: 'bg-[#1e60ff] hover:bg-blue-500 text-white border-transparent', disabled: false },
  pending: { label: '⏳ Request Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200 cursor-not-allowed', disabled: true },
  approved: { label: '✓ Member', cls: 'bg-blue-50 text-blue-700 border-blue-200 cursor-not-allowed', disabled: true },
  rejected: { label: '↺ Re-apply', cls: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100', disabled: false },
};

const JoinButton = ({ status, onJoin, loading }) => {
  const s = JOIN_BTN[status] || JOIN_BTN.none;
  return (
    <button
      onClick={s.disabled ? undefined : onJoin}
      disabled={s.disabled || loading}
      className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border transition-all active:scale-95 flex items-center justify-center gap-2 ${s.cls} ${loading ? 'opacity-60 cursor-wait' : ''}`}
    >
      {loading ? '...' : s.label}
    </button>
  );
};

const ClubCard = ({ club, membershipStatus, onJoin, joining, isStudent }) => (
  <div className="group relative glass-dark rounded-3xl overflow-hidden border border-slate-200 hover:border-blue-300 transition-all duration-500 hover:-translate-y-2 shadow-2xl flex flex-col">
    <div className="h-48 overflow-hidden relative bg-gradient-to-br from-blue-100 to-indigo-100 flex-shrink-0">
      {club.coverImage ? (
        <img src={club.coverImage} alt={club.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-5xl font-black text-white/20">{club.name?.charAt(0)}</div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
      <div className="absolute top-4 right-4"><CategoryBadge category={club.category} /></div>
      <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-2xl overflow-hidden group-hover:-translate-y-1 transition-transform bg-cover bg-center"
        style={club.logo ? { backgroundImage: `url(${club.logo})` } : {}}>
        {!club.logo && <span className="text-xl font-black text-slate-900">{club.name?.charAt(0)}</span>}
      </div>
    </div>

    <div className="px-6 pb-6 pt-10 flex flex-col flex-1 bg-white/80">
      <h3 className="text-xl font-black mb-2 text-slate-900 group-hover:text-[#1e60ff] transition-colors uppercase tracking-tight leading-tight line-clamp-2">{club.name}</h3>
      <p className="text-slate-600 text-xs mb-4 line-clamp-3 leading-relaxed">{club.description}</p>

      <div className="flex flex-col gap-2 mb-6 text-[11px] text-slate-600 font-bold uppercase tracking-widest">
        <div className="flex items-center gap-2"><Users size={12} className="text-indigo-500" />{club.members?.length || 0} Registered Members</div>
        <div className="flex items-center gap-2"><Calendar size={12} className="text-blue-500" />{club.events?.length || 0} Total Events</div>
        <div className="flex items-center gap-2 text-blue-500/70"><ShieldCheck size={12} />Verified Campus Elite Entity</div>
      </div>

      <div className="mt-auto">
        {isStudent ? (
          <div className="flex gap-2 w-full">
            <JoinButton status={membershipStatus} onJoin={onJoin} loading={joining} />
            <button className="py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center whitespace-nowrap">
               Details
            </button>
          </div>
        ) : (
          <div className="w-full text-center py-3 rounded-xl bg-slate-50 text-slate-600 text-[10px] font-black border border-slate-200 uppercase tracking-[0.2em] shadow-sm">
            🏛️ {club.members?.length || 0} Members
          </div>
        )}
      </div>
    </div>
  </div>
);

const FeaturedClubCard = ({ club, membershipStatus, onJoin, joining, isStudent }) => (
  <div className="relative group rounded-[2.5rem] overflow-hidden min-h-[420px] flex items-end shadow-2xl shadow-blue-500/10 border border-slate-100 hover:border-blue-300 transition-all duration-700 bg-white">
    {club.coverImage ? (
      <img src={club.coverImage} alt={club.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-70" />
    ) : (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100" />
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
    <div className="relative p-10 w-full flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-4">
          <span className="inline-block px-4 py-1.5 rounded-xl bg-[#1e60ff] font-black text-white uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-blue-500/30">Featured Club</span>
          <div className="md:hidden"><CategoryBadge category={club.category} /></div>
        </div>
        <div className="flex items-center gap-5 mb-4">
          <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-xl overflow-hidden shrink-0 bg-cover bg-center"
            style={club.logo ? { backgroundImage: `url(${club.logo})` } : {}}>
            {!club.logo && <span className="text-3xl font-black text-slate-900">{club.name?.charAt(0)}</span>}
          </div>
          <div>
            <h3 className="text-3xl md:text-5xl font-black mb-1 uppercase leading-tight tracking-tighter text-slate-900">{club.name}</h3>
            <div className="hidden md:block mt-2"><CategoryBadge category={club.category} /></div>
          </div>
        </div>
        <p className="text-slate-600 text-sm max-w-xl line-clamp-2 leading-relaxed mb-6 font-medium">{club.description}</p>
        <div className="flex flex-wrap gap-6 text-[11px] text-slate-600 uppercase font-black tracking-[0.2em] items-center">
          <div className="flex items-center gap-2"><Users size={14} className="text-indigo-400" />{club.members?.length || 0} Members</div>
          <div className="flex items-center gap-2"><Calendar size={14} className="text-blue-400" />{club.events?.length || 0} Events</div>
        </div>
      </div>

      <div className="shrink-0 w-full md:w-auto flex gap-3">
        {isStudent ? (
          <>
            <JoinButton status={membershipStatus} onJoin={onJoin} loading={joining} />
            <button className="px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center whitespace-nowrap">
               View Details
            </button>
          </>
        ) : (
          <div className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#0f172a] text-white font-black text-[11px] uppercase tracking-[0.3em] border border-slate-900 transition-transform hover:scale-105">
            {club.members?.length || 0} Members <ArrowRight size={14} />
          </div>
        )}
      </div>
    </div>
  </div>
);

export default function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [memberships, setMemberships] = useState({});   // { communityId: 'pending'|'approved'|'rejected' }
  const [joiningId, setJoiningId] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const isStudent = storedUser?.role === 'student';

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: 100 });
        if (category) params.set('category', category);
        if (search) params.set('search', search);
        const res = await api.get(`/communities?${params}`);
        setClubs(res.data.data || []);
      } catch (err) {
        console.error('Failed to load clubs');
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, [category, search]);

  useEffect(() => {
    if (!isStudent) return;
    api.get('/memberships/my').then(res => {
      const map = {};
      (res.data.data || []).forEach(m => { map[m.community?._id] = m.status; });
      setMemberships(map);
    }).catch(() => { });
  }, [isStudent]);

  const handleJoin = async (clubId) => {
    if (!isStudent) return;
    setJoiningId(clubId);
    try {
      await api.post(`/communities/${clubId}/join`, {});
      toast.success('Join request submitted! Awaiting community admin approval.');
      setMemberships(prev => ({ ...prev, [clubId]: 'pending' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setJoiningId(null);
    }
  };

  const featured = clubs.slice(0, 1);
  const rest = clubs.slice(1);
  const CATEGORIES = ['Technology', 'Arts', 'Sports', 'Academic', 'Cultural', 'Business', 'Science', 'Social', 'Other'];
  const rise = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative pt-32 pb-24 min-h-screen bg-transparent font-sans text-slate-900 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[440px] pointer-events-none">
        <img
          src={CLUBS_HERO_IMAGE}
          alt="Students collaborating in campus clubs"
          className="h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-100/70 via-white/65 to-transparent" />
      </div>
      <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
      <div className="absolute top-48 -left-24 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10">

        <motion.div initial={rise.initial} animate={rise.animate} transition={{ duration: 0.55 }} className="mb-12">
          <h1 className="text-5xl md:text-8xl font-black mb-6 uppercase tracking-tighter">
            Campus <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-transparent bg-clip-text">Clubs</span>
          </h1>
          <p className="text-slate-600 max-w-2xl text-sm uppercase font-black tracking-[0.3em] leading-loose border-l-4 border-[#1e60ff] pl-8">
            Discover the Elite communities shaping the campus culture.
          </p>
        </motion.div>

        {/* Search + Filter */}
        <motion.div initial={rise.initial} animate={rise.animate} transition={{ duration: 0.55, delay: 0.08 }} className="flex flex-wrap gap-2 mb-12">
          <div className="relative flex-1 min-w-[300px] mb-2 md:mb-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text"
              placeholder="Search clubs by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-600 focus:outline-none focus:border-[#1e60ff]/30 shadow-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setCategory('')}
              className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${category === '' ? 'bg-[#0f172a] text-white border-slate-900 shadow-xl' : 'bg-white text-slate-500 border-slate-100 hover:border-blue-200 shadow-sm'}`}>
              All
            </button>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c === category ? '' : c)}
                className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${category === c ? 'bg-[#1e60ff] text-white border-blue-600 shadow-[0_4px_20px_rgba(30,96,255,0.25)]' : 'bg-white text-slate-500 border-slate-100 hover:border-blue-200 shadow-sm'}`}>
                {c}
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-[#1e60ff] rounded-full animate-spin shadow-2xl" />
          </div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-40 glass-dark rounded-[3rem] border border-slate-100 max-w-4xl mx-auto shadow-2xl">
            <div className="text-6xl mb-6 opacity-20">🏛️</div>
            <h3 className="text-2xl font-black uppercase tracking-widest text-slate-900 mb-3">No Communities Found</h3>
            <p className="text-slate-500 uppercase text-xs font-bold tracking-widest">
              {search || category ? 'Adjust your filters to see more results.' : 'No active elite communities available yet.'}
            </p>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <motion.section initial={rise.initial} animate={rise.animate} transition={{ duration: 0.55, delay: 0.12 }} className="mb-24">
                <div className="flex items-center gap-6 mb-10">
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-[0.3em] text-slate-900 whitespace-nowrap">Pinnacle Tier</h2>
                  <div className="h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent flex-1" />
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-100 text-[#1e60ff] text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-sm">
                    <Star size={12} strokeWidth={3} /> Featured
                  </div>
                </div>
                {featured.map(club => (
                  <motion.div key={club._id} whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
                    <FeaturedClubCard club={club} isStudent={isStudent}
                      membershipStatus={memberships[club._id] || 'none'}
                      onJoin={() => handleJoin(club._id)}
                      joining={joiningId === club._id} />
                  </motion.div>
                ))}
              </motion.section>
            )}

            {rest.length > 0 && (
              <motion.section initial={rise.initial} animate={rise.animate} transition={{ duration: 0.55, delay: 0.18 }}>
                <div className="flex items-center gap-6 mb-10">
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-[0.3em] text-slate-900 whitespace-nowrap">Community Directory</h2>
                  <div className="h-[2px] bg-gradient-to-r from-indigo-500 via-blue-500 to-transparent flex-1 opacity-60" />
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest whitespace-nowrap px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm">{clubs.length} total active</span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {rest.map((club, idx) => (
                    <motion.div key={club._id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: idx * 0.04 }}>
                      <ClubCard club={club} isStudent={isStudent}
                        membershipStatus={memberships[club._id] || 'none'}
                        onJoin={() => handleJoin(club._id)}
                        joining={joiningId === club._id} />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {rest.length === 0 && featured.length > 0 && (
              <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-16 bg-white py-4 rounded-2xl border border-slate-100 max-w-sm mx-auto shadow-sm">
                {clubs.length} Elite Communit{clubs.length !== 1 ? 'ies' : 'y'} Discovered
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
