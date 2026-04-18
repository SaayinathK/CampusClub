import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

export default function CommunityAdminMembers() {
   const [community, setCommunity] = useState(null);
   const [members, setMembers] = useState([]);
   const [joinRequests, setJoinRequests] = useState([]);
   const [pendingAccounts, setPendingAccounts] = useState([]);
   const [tab, setTab] = useState('requests');
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState('');

   const fetchData = async () => {
      setLoading(true);
      try {
         const communityRes = await api.get('/communities/my/profile');
         const c = communityRes.data.data;
         setCommunity(c);
         const [membersRes, requestsRes, accountsRes] = await Promise.all([
            api.get(`/communities/${c._id}/members`),
            api.get(`/communities/${c._id}/join-requests`),
            api.get(`/users/community/${c._id}/pending-students`),
         ]);
         setMembers(membersRes.data.data || []);
         setJoinRequests(requestsRes.data.data || []);
         setPendingAccounts(accountsRes.data.data || []);
      } catch { toast.error('Failed to load data'); }
      finally { setLoading(false); }
   };

   useEffect(() => { fetchData(); }, []);

   const handleRequest = async (requestId, action, userName) => {
      try {
         const endpoint = `/communities/${community._id}/join-requests/${requestId}/${action}`;
         await api.put(endpoint, action === 'reject' ? { reason: prompt('Rejection reason (optional):') || '' } : {});
         toast.success(`${userName}'s request ${action}ed`);
         fetchData();
      } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
   };

   const removeMember = async (userId, name) => {
      if (!window.confirm(`Remove ${name} from this community?`)) return;
      try {
         await api.delete(`/communities/${community._id}/members/${userId}`);
         toast.success(`${name} removed`);
         fetchData();
      } catch { toast.error('Failed to remove member'); }
   };

   const filteredMembers = members.filter(m =>
      m.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.user?.itNumber?.toLowerCase().includes(searchTerm.toLowerCase())
   );

   return (
      <div className="min-h-screen p-6 md:p-10 font-sans text-slate-900 relative overflow-hidden bg-transparent">
         <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full mix-blend-screen filter blur-[150px] animate-blob pointer-events-none" />
         <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full mix-blend-screen filter blur-[150px] animation-delay-4000 animate-blob pointer-events-none" />

         <div className="max-w-7xl mx-auto relative z-10 space-y-8">

            {/* Header */}
            <header className="surface-panel rounded-[2.5rem] p-8 md:p-10 border border-blue-100 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-400/5 to-blue-600/10 opacity-90 pointer-events-none" />
               <div className="absolute right-0 top-0 w-64 h-full hidden xl:block pointer-events-none opacity-55">
                  <img
                     src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop"
                     alt="Community members"
                     className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-white/25 via-white/60 to-transparent" />
               </div>

               <div className="flex items-center gap-5 md:gap-6 relative z-10 min-w-0">
                  <div className="w-16 h-16 rounded-[1.35rem] bg-gradient-to-br from-cyan-400 to-blue-500 p-[2px] shadow-[0_0_20px_rgba(6,182,212,0.25)] shrink-0">
                     <div className="w-full h-full bg-white rounded-[1.25rem] flex items-center justify-center text-3xl shadow-sm">👥</div>
                  </div>
                  <div className="min-w-0">
                     <h2 className="text-3xl md:text-5xl font-black mb-2 tracking-tight leading-none">
                        MEMBER <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">MANAGEMENT</span>
                     </h2>
                     <p className="text-slate-500 font-medium text-sm md:text-base">
                        {community?.name} — Manage members and processing requests
                     </p>
                  </div>
               </div>

               <div className="relative z-10 w-full xl:w-auto xl:justify-end flex">
                  <Link to="/community-admin" className="px-6 py-3 rounded-full font-bold text-blue-700 transition-all hover:-translate-y-1 border border-blue-200 bg-blue-50/70 hover:bg-blue-100 flex items-center gap-2 text-sm uppercase tracking-wider shadow-sm">
                     ← Dashboard
                  </Link>
               </div>
            </header>

            {/* Tab Navigation */}
            <div className="surface-panel rounded-[1.75rem] p-2 border border-slate-200 flex flex-wrap gap-2 shadow-sm">
               {[
                  { id: 'requests', label: 'Club Join Requests', icon: '⏳', count: joinRequests.length, color: 'text-amber-700', border: 'border-amber-200', bg: 'bg-amber-50', hoverBg: 'hover:bg-amber-50' },
                  { id: 'members', label: 'Active Roster', icon: '👥', count: members.length, color: 'text-purple-700', border: 'border-purple-200', bg: 'bg-purple-50', hoverBg: 'hover:bg-purple-50' },
                  { id: 'accounts', label: 'Portal Accounts Pending', icon: '📝', count: pendingAccounts.length, color: 'text-cyan-700', border: 'border-cyan-200', bg: 'bg-cyan-50', hoverBg: 'hover:bg-cyan-50' }
               ].map(t => (
                  <button
                     key={t.id}
                     onClick={() => setTab(t.id)}
                     className={`flex items-center gap-2 px-6 py-4 font-bold text-sm tracking-wide transition-all border-b-2 flex-1 sm:flex-none justify-center rounded-xl ${tab === t.id ? `${t.border} ${t.color} bg-white shadow-sm` : `border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-200 ${t.hoverBg}`}`}
                  >
                     <span className="text-lg leading-none">{t.icon}</span> {t.label}
                     {t.count > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${tab === t.id ? `${t.bg} text-slate-800 border border-slate-200` : 'bg-white text-slate-600 border border-slate-200 shadow-sm'}`}>
                           {t.count}
                        </span>
                     )}
                  </button>
               ))}
            </div>

            {loading ? (
               <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
                  <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin" />
                  <span className="text-cyan-700 font-medium tracking-widest uppercase text-sm animate-pulse">Syncing Database...</span>
               </div>
            ) : (
               <div className="space-y-6">

                  {/* Pending Requests Tab */}
                  {tab === 'requests' && (
                     joinRequests.length === 0 ? (
                        <div className="surface-panel border border-slate-200 rounded-3xl p-16 text-center shadow-2xl flex flex-col items-center">
                           <span className="text-6xl mb-6 opacity-50 drop-shadow-2xl">📥</span>
                           <h3 className="text-2xl font-black text-slate-900 mb-2">Inbox Empty</h3>
                           <p className="text-slate-500 font-medium">There are no pending club membership requests to review.</p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {joinRequests.map(req => (
                              <div key={req._id} className="surface-card border border-slate-200 border-l-amber-400 border-l-[4px] rounded-3xl p-6 shadow-xl hover:shadow-[0_20px_50px_rgba(148,163,184,0.15)] transition-all flex flex-col pt-1 group">
                                 <div className="flex items-start gap-5 pt-3 mb-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-100 to-pink-100 shadow-lg border border-amber-200 flex items-center justify-center text-slate-900 font-black text-xl group-hover:scale-110 transition-transform">
                                       {req.user?.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <h4 className="font-bold text-lg text-slate-900 group-hover:text-amber-700 transition-colors leading-tight mb-1">{req.user?.name}</h4>
                                       <p className="text-slate-500 text-xs truncate mb-2">{req.user?.email}</p>
                                       {req.user?.itNumber && (
                                          <span className="font-mono text-[10px] font-black uppercase tracking-widest bg-cyan-50 text-cyan-700 px-2 py-1 rounded inline-block border border-cyan-200 shadow-sm">
                                             📋 {req.user.itNumber}
                                          </span>
                                       )}
                                    </div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                                       📅 {new Date(req.createdAt).toLocaleDateString()}
                                    </div>
                                 </div>

                                 {req.message && (
                                    <div className="bg-slate-50 border-l-2 border-purple-400 p-4 rounded-xl text-sm italic text-slate-700 mb-6 flex-1 shadow-inner border border-slate-200">
                                       "{req.message}"
                                    </div>
                                 )}

                                 <div className="flex gap-3 mt-auto">
                                    <button onClick={() => handleRequest(req._id, 'approve', req.user?.name)} className="flex-1 py-3 rounded-xl bg-emerald-50 border border-emerald-200 font-bold text-xs uppercase tracking-widest text-emerald-700 hover:bg-emerald-100 hover:-translate-y-0.5 transition-all text-center shadow-sm">
                                       ✓ Admit
                                    </button>
                                    <button onClick={() => handleRequest(req._id, 'reject', req.user?.name)} className="flex-1 py-3 rounded-xl bg-rose-50 border border-rose-200 font-bold text-xs uppercase tracking-widest text-rose-700 hover:bg-rose-100 hover:-translate-y-0.5 transition-all text-center shadow-sm">
                                       ✗ Deny
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )
                  )}

                  {/* Current Members Tab */}
                  {tab === 'members' && (
                     <div className="space-y-6">
                        <div className="relative w-full max-w-md group">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-purple-400 transition-colors">🔍</span>
                           <input
                              type="text"
                              placeholder="Search members by name, email or IT number..."
                              value={searchTerm}
                              onChange={e => setSearchTerm(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-10 py-3 text-slate-900 focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-300/40 transition-all font-medium text-sm"
                           />
                        </div>

                        {filteredMembers.length === 0 ? (
                           <div className="surface-panel border border-slate-200 rounded-3xl p-16 text-center shadow-2xl flex flex-col items-center">
                              <span className="text-6xl mb-6 opacity-50 drop-shadow-2xl">👻</span>
                              <h3 className="text-2xl font-black text-slate-900 mb-2">No Matches Found</h3>
                              <p className="text-slate-500 font-medium">Clear search filters or wait for more members to join.</p>
                           </div>
                        ) : (
                           <div className="surface-panel rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
                              <div className="overflow-x-auto">
                                 <table className="w-full text-left border-collapse">
                                    <thead>
                                       <tr className="bg-slate-50 border-b border-slate-200">
                                          <th className="p-5 font-black text-[10px] text-slate-500 uppercase tracking-widest">Roster Identity</th>
                                          <th className="p-5 font-black text-[10px] text-slate-500 uppercase tracking-widest">Reg ID</th>
                                          <th className="p-5 font-black text-[10px] text-slate-500 uppercase tracking-widest">Clearance</th>
                                          <th className="p-5 font-black text-[10px] text-slate-500 uppercase tracking-widest">Entry Date</th>
                                          <th className="p-5 font-black text-[10px] text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                       </tr>
                                    </thead>
                                    <tbody>
                                       {filteredMembers.map((m, i) => (
                                          <tr key={Math.random()} className={`border-b border-slate-200 hover:bg-slate-50 transition-colors group ${i === filteredMembers.length - 1 ? 'border-b-0' : ''}`}>
                                             <td className="p-5">
                                                <div className="flex items-center gap-4">
                                                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 shadow-lg border border-cyan-200 flex items-center justify-center text-slate-900 font-bold text-sm group-hover:scale-110 transition-transform">
                                                      {m.user?.name?.charAt(0)}
                                                   </div>
                                                   <div>
                                                      <div className="font-bold text-slate-900 text-sm leading-tight">{m.user?.name}</div>
                                                      <div className="text-xs text-slate-500">{m.user?.email}</div>
                                                   </div>
                                                </div>
                                             </td>
                                             <td className="p-5">
                                                <span className="font-mono text-[10px] font-black tracking-widest px-2 py-1 rounded bg-cyan-50 border border-cyan-200 text-cyan-700 shadow-sm">{m.user?.itNumber || 'EXT-0000'}</span>
                                             </td>
                                             <td className="p-5">
                                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${m.role === 'admin' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                                                   {m.role || 'Member'}
                                                </span>
                                             </td>
                                             <td className="p-5 text-xs text-slate-500 font-medium">
                                                {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : 'N/A'}
                                             </td>
                                             <td className="p-5 text-right">
                                                <button onClick={() => removeMember(m.user?._id, m.user?.name)} className="px-4 py-1.5 rounded-lg border border-rose-200 text-[10px] font-black text-rose-700 uppercase tracking-widest hover:bg-rose-100 transition-colors shadow-sm">
                                                   Eject
                                                </button>
                                             </td>
                                          </tr>
                                       ))}
                                    </tbody>
                                 </table>
                              </div>
                           </div>
                        )}
                     </div>
                  )}

                  {/* Pending Portal Accounts Tab */}
                  {tab === 'accounts' && (
                     pendingAccounts.length === 0 ? (
                        <div className="surface-panel border border-slate-200 rounded-3xl p-16 text-center shadow-2xl flex flex-col items-center">
                           <span className="text-6xl mb-6 opacity-50 drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-b from-cyan-400 to-transparent">🖥️</span>
                           <h3 className="text-2xl font-black text-slate-900 mb-2">System Clear</h3>
                           <p className="text-slate-500 font-medium">No pending portal access requests from students claiming your community.</p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                           {pendingAccounts.map(user => (
                              <div key={user._id} className="surface-card border border-slate-200 border-l-cyan-400 border-l-[4px] rounded-3xl p-6 shadow-xl hover:shadow-[0_20px_50px_rgba(148,163,184,0.15)] transition-all flex flex-col pt-1 group bg-gradient-to-br from-white to-slate-50 relative">
                                 <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:scale-125 transition-transform pointer-events-none">📝</div>

                                 <div className="flex items-start gap-5 pt-3 mb-6 relative z-10">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-100 to-purple-100 shadow-lg border border-cyan-200 flex items-center justify-center text-slate-900 font-black text-xl group-hover:scale-110 transition-transform">
                                       {user.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <h4 className="font-bold text-lg text-slate-900 group-hover:text-cyan-700 transition-colors leading-tight mb-1">{user.name}</h4>
                                       <p className="text-slate-500 text-xs truncate mb-2">{user.email}</p>
                                       <div className="flex flex-wrap gap-2">
                                          {user.itNumber && (
                                             <span className="font-mono text-[10px] font-black uppercase tracking-widest bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded border border-cyan-200 shadow-sm">
                                                📋 {user.itNumber}
                                             </span>
                                          )}
                                          <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                                             Applied: {new Date(user.createdAt).toLocaleDateString()}
                                          </span>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="flex gap-3 mt-auto relative z-10 border-t border-slate-200 pt-4">
                                    <button
                                       onClick={async () => {
                                          try {
                                             await api.put(`/users/${user._id}/approve`);
                                             toast.success(`Account approved! ${user.name} can now login`);
                                             fetchData();
                                          } catch (err) { toast.error(err.response?.data?.message || 'Failed to approve'); }
                                       }}
                                       className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-transform text-center"
                                    >
                                       ✓ Verify Portal Access
                                    </button>
                                    <button
                                       onClick={async () => {
                                          const reason = prompt('Rejection reason (optional):') || '';
                                          try {
                                             await api.put(`/users/${user._id}/reject`, { reason });
                                             toast.success(`${user.name}'s account rejected`);
                                             fetchData();
                                          } catch (err) { toast.error(err.response?.data?.message || 'Failed to reject'); }
                                       }}
                                       className="px-6 py-3 rounded-xl bg-white border border-rose-200 font-bold text-xs uppercase tracking-widest text-rose-700 hover:bg-rose-500 hover:text-white hover:-translate-y-0.5 transition-all text-center shadow-sm"
                                    >
                                       ✗ Deny
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )
                  )}

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-200">
                     {[
                        { value: members.length, label: 'Active Roster', color: 'text-purple-400' },
                        { value: joinRequests.length, label: 'Pending Apps', color: 'text-amber-400' },
                        { value: pendingAccounts.length, label: 'Pending Access', color: 'text-cyan-400' },
                        { value: members.filter(m => m.role === 'admin').length, label: 'Co-Admins', color: 'text-emerald-400' }
                     ].map((s, i) => (
                        <div key={i} className="surface-card rounded-2xl p-5 border border-slate-200 text-center group transition-all hover:-translate-y-1 shadow-sm">
                           <div className={`text-4xl font-black mb-1 group-hover:scale-110 transition-transform tracking-tighter ${s.color}`}>{s.value}</div>
                           <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

         </div>
      </div>
   );
}