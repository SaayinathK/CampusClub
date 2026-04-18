import { useState, useEffect } from 'react';
import { Star, Users, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const CategoryBadge = ({ category }) => (
  <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/20">
    {category}
  </span>
);

const JOIN_BTN = {
  none:     { label: 'Request to Join', cls: 'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent', disabled: false },
  pending:  { label: '⏳ Request Pending', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/30 cursor-not-allowed', disabled: true },
  approved: { label: '✓ Member', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 cursor-not-allowed', disabled: true },
  rejected: { label: '↺ Re-apply', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20', disabled: false },
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
  <div className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-2 shadow-sm flex flex-col">
    <div className="h-48 overflow-hidden relative bg-emerald-50 flex-shrink-0">
      {club.coverImage ? (
        <img src={club.coverImage} alt={club.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-slate-50" />
      )}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
      <div className="absolute top-4 right-4"><CategoryBadge category={club.category} /></div>
      <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-md overflow-hidden group-hover:-translate-y-1 transition-transform bg-cover bg-center"
        style={club.logo ? { backgroundImage: `url(${club.logo})` } : {}}>
        {!club.logo && <span className="text-xl font-black text-slate-800">{club.name?.charAt(0)}</span>}
      </div>
    </div>

    <div className="px-6 pb-6 pt-10 flex flex-col flex-1 bg-white">
      <h3 className="text-xl font-black mb-2 text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight leading-tight line-clamp-2">{club.name}</h3>
      <p className="text-slate-600 text-xs mb-4 line-clamp-3 leading-relaxed">{club.description}</p>

      <div className="flex flex-col gap-2 mb-6 text-[11px] text-slate-500 font-bold uppercase tracking-widest">
        <div className="flex items-center gap-2"><Users size={12} className="text-purple-500" />{club.members?.length || 0} Registered Members</div>
        <div className="flex items-center gap-2"><Calendar size={12} className="text-blue-500" />{club.events?.length || 0} Total Events</div>
        <div className="flex items-center gap-2 text-emerald-500/70"><ShieldCheck size={12} />Verified Campus Elite Entity</div>
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
          <div className="w-full text-center py-3 rounded-xl bg-slate-50 text-slate-500 text-[10px] font-black border border-slate-200 uppercase tracking-[0.2em]">
            🏛️ {club.members?.length || 0} Members
          </div>
        )}
      </div>
    </div>
  </div>
);

const FeaturedClubCard = ({ club, membershipStatus, onJoin, joining, isStudent }) => (
  <div className="relative group rounded-[2.5rem] overflow-hidden min-h-[420px] flex items-end shadow-lg border border-slate-200 hover:border-emerald-500/30 transition-all duration-700 bg-white">
    {club.coverImage ? (
      <img src={club.coverImage} alt={club.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-20" />
    ) : (
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-slate-50" />
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
    <div className="relative p-10 w-full flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-4">
          <span className="inline-block px-4 py-1.5 rounded-xl bg-emerald-600 font-black text-white uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-emerald-500/40">Featured Club</span>
          <div className="md:hidden"><CategoryBadge category={club.category} /></div>
        </div>
        <div className="flex items-center gap-5 mb-4">
          <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-md overflow-hidden shrink-0 bg-cover bg-center"
            style={club.logo ? { backgroundImage: `url(${club.logo})` } : {}}>
            {!club.logo && <span className="text-3xl font-black text-slate-800">{club.name?.charAt(0)}</span>}
          </div>
          <div>
            <h3 className="text-3xl md:text-5xl font-black mb-1 uppercase leading-tight tracking-tighter text-slate-900 drop-shadow-sm">{club.name}</h3>
            <div className="hidden md:block mt-2"><CategoryBadge category={club.category} /></div>
          </div>
        </div>
        <p className="text-slate-600 text-sm max-w-xl line-clamp-2 leading-relaxed mb-6 font-medium">{club.description}</p>
        <div className="flex flex-wrap gap-6 text-[11px] text-slate-500 uppercase font-black tracking-[0.2em] items-center">
          <div className="flex items-center gap-2"><Users size={14} className="text-purple-400" />{club.members?.length || 0} Members</div>
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
          <div className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-50 text-slate-600 font-black text-[11px] uppercase tracking-[0.3em] border border-slate-200">
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
    }).catch(() => {});
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

  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-50 font-sans">
      <div className="container mx-auto px-6 relative z-10">

        <div className="mb-12">
          <h1 className="text-5xl md:text-8xl font-black mb-6 uppercase tracking-tighter text-slate-900">
            Campus <span className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-transparent bg-clip-text">Clubs</span>
          </h1>
          <p className="text-slate-600 max-w-2xl text-lg uppercase font-bold tracking-widest leading-loose border-l-4 border-emerald-500 pl-8">
            Discover the Elite communities shaping the campus culture.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-wrap gap-3 mb-12">
          <input type="text" placeholder="Search clubs by name..." value={search} onChange={e => setSearch(e.target.value)}
            className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-slate-900 text-sm outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-400 min-w-[220px] shadow-sm" />
          <button onClick={() => setCategory('')}
            className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${category === '' ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
            All
          </button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c === category ? '' : c)}
              className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${category === c ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-40 bg-white rounded-[3rem] border border-slate-200 max-w-4xl mx-auto shadow-sm">
            <div className="text-6xl mb-6 opacity-80">🏛️</div>
            <h3 className="text-2xl font-black uppercase tracking-widest text-slate-900 mb-3">No Communities Found</h3>
            <p className="text-slate-500 uppercase text-sm font-bold tracking-widest">
              {search || category ? 'Adjust your filters to see more results.' : 'No active elite communities available yet.'}
            </p>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <section className="mb-20">
                <div className="flex items-center gap-6 mb-10">
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-[0.3em] text-slate-900 whitespace-nowrap">Pinnacle Tier</h2>
                  <div className="h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-transparent flex-1" />
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-emerald-600 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                    <Star size={12} strokeWidth={3} /> Featured
                  </div>
                </div>
                {featured.map(club => (
                  <FeaturedClubCard key={club._id} club={club} isStudent={isStudent}
                    membershipStatus={memberships[club._id] || 'none'}
                    onJoin={() => handleJoin(club._id)}
                    joining={joiningId === club._id} />
                ))}
              </section>
            )}

            {rest.length > 0 && (
              <section>
                <div className="flex items-center gap-6 mb-10">
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-[0.3em] text-slate-900 whitespace-nowrap">Community Directory</h2>
                  <div className="h-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-transparent flex-1" />
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest whitespace-nowrap px-4 py-2 bg-slate-100 rounded-full border border-slate-200">{clubs.length} total active</span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {rest.map(club => (
                    <ClubCard key={club._id} club={club} isStudent={isStudent}
                      membershipStatus={memberships[club._id] || 'none'}
                      onJoin={() => handleJoin(club._id)}
                      joining={joiningId === club._id} />
                  ))}
                </div>
              </section>
            )}

            {rest.length === 0 && featured.length > 0 && (
              <p className="text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] mt-12 bg-white py-3 rounded-xl border border-slate-200 max-w-sm mx-auto shadow-sm">
                {clubs.length} Elite Communit{clubs.length !== 1 ? 'ies' : 'y'} Discovered
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
