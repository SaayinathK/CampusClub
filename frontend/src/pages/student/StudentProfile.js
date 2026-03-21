import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

export default function StudentProfile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans text-slate-100 relative overflow-hidden bg-[#020617]">
      {/* Background Orbs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full mix-blend-screen filter blur-[150px] animate-blob pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full mix-blend-screen filter blur-[150px] animation-delay-4000 animate-blob pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black mb-1 tracking-tight flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 text-white shadow-lg text-2xl leading-none">👤</span>
              MY <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">PROFILE</span>
            </h1>
            <p className="text-slate-400 font-medium ml-14">Manage your account information and preferences</p>
          </div>
          <Link to="/student" className="glass hover:bg-white/10 px-6 py-3 rounded-full font-bold text-white transition-all hover:-translate-y-1 border border-white/10 flex items-center gap-2 text-sm uppercase tracking-wider backdrop-blur-xl">
            ← Dashboard
          </Link>
        </header>

        {/* Info Card */}
        <div className="glass-dark rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative block">
          
          {/* Cover Art */}
          <div className="h-32 md:h-40 bg-gradient-to-r from-purple-900 via-slate-800 to-cyan-900 relative">
             <div className="absolute inset-0 bg-black/40" />
             <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          </div>

          <div className="px-6 md:px-10 pb-10 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-20 mb-10 text-center sm:text-left relative z-10">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border-4 border-[#020617] bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center text-5xl md:text-6xl font-black text-black shadow-[0_15px_35px_rgba(0,0,0,0.5)] shrink-0">
                {user?.name?.charAt(0)}
              </div>
              <div className="flex-1 pb-2">
                 <h2 className="text-3xl font-black text-white mb-2 leading-tight">{user?.name}</h2>
                 <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                   <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-sm font-bold flex items-center gap-1.5 rounded-md">
                     📋 {user?.itNumber}
                   </span>
                   <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-bold flex items-center gap-1.5 rounded-md">
                     🎓 Student
                   </span>
                   <span className={`px-3 py-1 border text-sm font-bold flex items-center gap-1.5 rounded-md ${user?.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                     {user?.status === 'approved' ? '✓ Approved' : '⏳ Pending'}
                   </span>
                 </div>
              </div>
            </div>

            {/* Nav Tabs */}
            <div className="flex justify-center sm:justify-start gap-8 border-b border-white/5 mb-8">
              {[
                { id: 'profile', label: 'Profile Information', icon: '👤' },
                { id: 'security', label: 'Security Context', icon: '🔒' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`pb-4 font-bold text-sm tracking-wide transition-all border-b-2 flex items-center gap-2 ${activeTab === t.id ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white hover:border-white/20'}`}
                >
                  <span className="text-lg leading-none">{t.icon}</span> {t.label}
                </button>
              ))}
            </div>

            {/* Profile Config Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 relative group">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 ml-1">
                      <span className="text-cyan-400">✏️</span> Full Name
                    </label>
                    <input
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      required
                      placeholder="Your preferred name"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2 relative group">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 ml-1">
                      <span className="text-purple-400">📧</span> Email Address
                    </label>
                    <div className="relative">
                      <input
                        value={user?.email || ''}
                        disabled
                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 text-white/50 cursor-not-allowed font-medium"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">Verified</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 relative group max-w-sm">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 ml-1">
                    <span className="text-pink-400">📋</span> IT Number
                  </label>
                  <div className="relative">
                    <input
                      value={user?.itNumber || ''}
                      disabled
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 text-white/50 cursor-not-allowed font-mono tracking-wider"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-black/40 px-2 py-1 rounded border border-white/10">Immutable</span>
                  </div>
                </div>

                <div className="space-y-2 relative group">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 ml-1">
                    <span className="text-amber-400">📝</span> About Me
                  </label>
                  <textarea
                    rows={4}
                    value={form.bio}
                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Share your interests, skills, or what you're looking for in communities..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium resize-y leading-relaxed"
                  />
                </div>

                <div className="pt-4 border-t border-white/5">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 font-bold text-lg text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Updating Matrix...' : '💾 Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="py-16 text-center max-w-lg mx-auto">
                <div className="text-6xl mb-6 opacity-80 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">🔒</div>
                <h3 className="text-2xl font-black text-white mb-2">Security Nexus</h3>
                <p className="text-slate-400 mb-8 leading-relaxed">Identity verification, password integrity, and active session management protocols.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button onClick={() => toast.info('Module upgrading. Try again later.')} className="glass p-4 rounded-2xl border border-white/10 hover:border-cyan-500/30 hover:bg-white/5 transition-all text-left group">
                    <span className="text-xl mb-2 block group-hover:scale-110 transition-transform origin-left">🔑</span>
                    <h4 className="font-bold text-white mb-1">Update Password</h4>
                    <span className="text-xs text-slate-400 block">Rotate your credentials</span>
                  </button>
                  <button onClick={() => toast.info('Module upgrading. Try again later.')} className="glass p-4 rounded-2xl border border-white/10 hover:border-purple-500/30 hover:bg-white/5 transition-all text-left group">
                    <span className="text-xl mb-2 block group-hover:scale-110 transition-transform origin-left">🛡️</span>
                    <h4 className="font-bold text-white mb-1">2FA Settings</h4>
                    <span className="text-xs text-slate-400 block">Enhanced authentication</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Metadata Footer */}
          <div className="bg-black/30 border-t border-white/5 p-6 md:px-10 flex flex-wrap gap-x-12 gap-y-6">
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Network Join Date</span>
               <span className="font-medium text-slate-300">
                 {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}
               </span>
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Authorization Status</span>
               <span className={`font-bold ${user?.status === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                 {user?.status === 'approved' ? 'System Active' : 'Clearance Pending'}
               </span>
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Last Matrix Sync</span>
               <span className="font-mono text-cyan-400">
                 {new Date(user?.updatedAt).toLocaleDateString()}
               </span>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}