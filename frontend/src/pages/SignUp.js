import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, BookOpen, ShieldCheck, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    itNumber: '',
    communityName: '',
    communityDescription: '',
    communityCategory: '',
    requestedCommunity: '',
  });
  const [communities, setCommunities] = useState([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(false);
  const [communitiesError, setCommunitiesError] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const navigate = useNavigate();

  const fetchCommunities = () => {
    setCommunitiesLoading(true);
    setCommunitiesError(false);
    fetch('http://localhost:5001/api/communities?limit=100')
      .then(res => res.json())
      .then(data => {
        setCommunities(data.data || []);
        setCommunitiesLoading(false);
      })
      .catch(() => {
        setCommunities([]);
        setCommunitiesLoading(false);
        setCommunitiesError(true);
      });
  };

  useEffect(() => {
    if (role === 'student') {
      fetchCommunities();
    }
  }, [role]);

  const roles = [
    { id: 'student', title: 'SLIIT Student', icon: BookOpen, desc: 'Requires campus email & IT number', color: 'from-blue-500 to-cyan-400' },
    { id: 'community_admin', title: 'Community Admin', icon: Users, desc: 'Manage your own community', color: 'from-purple-500 to-pink-400' },
    { id: 'external', title: 'External Participant', icon: User, desc: 'Join as a guest or partner', color: 'from-emerald-500 to-teal-400' },
    { id: 'admin', title: 'Admin', icon: ShieldCheck, desc: 'Full system management', color: 'from-orange-500 to-red-400' },
  ];

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitDetails = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5001/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();

      if (res.ok) {
        if (data.devOtp) {
          alert(`SYSTEM NOTIFICATION\n-------------------\n\nSecure OTP Generated: ${data.devOtp}\n\nNotice: This is displayed in development mode as email configuration is pending. Please use this temporary code to verify your identity.`);
        }
        setStep(3);
      } else {
        alert('Error: ' + (data.message || 'Could not send OTP'));
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server. Is the backend running?');
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      const userData = {
        username: formData.name,
        email: formData.email,
        password: formData.password,
        role: role,
        otp: otp.join(''),
        itNumber: formData.itNumber,
        ...(role === 'community_admin' ? {
          communityName: formData.communityName,
          communityDescription: formData.communityDescription,
          communityCategory: formData.communityCategory,
        } : {}),
        ...(role === 'student' ? {
          requestedCommunity: formData.requestedCommunity,
        } : {}),
      };

      const res = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await res.json();

      if (res.ok) {
        setStep(4);
        if (role !== 'student' && role !== 'community_admin') {
          setTimeout(() => {
            navigate('/signin');
          }, 3000);
        }
      } else {
        alert('Error: ' + (data.message || 'Registration failed'));
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server. Is the backend running?');
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#0a0a0a] text-white px-4 md:px-6 overflow-hidden relative flex flex-col justify-center">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"
        />
      </div>

      <div className="max-w-5xl mx-auto w-full relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-block"
          >
            <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter uppercase relative">
              <span className="text-white drop-shadow-2xl">Join the </span>
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 text-transparent bg-clip-text drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">Club Hub</span>
                <div className="absolute -bottom-2 left-0 w-full h-[6px] bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 rounded-full blur-[2px] opacity-70"></div>
              </span>
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl uppercase tracking-[0.3em] font-medium"
          >
            Phase {step} of 3: <span className="text-indigo-400">{step === 1 ? 'Choose Your Path' : step === 2 ? 'The Details' : 'Verification'}</span>
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto"
            >
              {roles.map((r, i) => (
                <motion.button
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRoleSelect(r.id)}
                  className="group relative p-[1px] rounded-3xl overflow-hidden bg-white/5"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${r.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative h-full bg-[#111] p-8 rounded-[23px] flex items-center justify-between border border-white/5 group-hover:bg-[#111]/90 transition-colors duration-300">
                    <div>
                      <h3 className="text-2xl font-black mb-2 uppercase tracking-tight text-white">{r.title}</h3>
                      <p className="text-gray-400 font-medium text-sm text-left">{r.desc}</p>
                    </div>
                    <div className={`p-4 rounded-full bg-gradient-to-br ${r.color} bg-opacity-10 shadow-[0_0_20px_rgba(255,255,255,0.05)] group-hover:scale-110 transition-transform duration-300`}>
                      <r.icon size={32} className="text-white" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-md mx-auto"
            >
              <div className="rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />

                <form onSubmit={handleSubmitDetails} className="space-y-6 relative z-10">
                  <div className="space-y-2 group">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 group-focus-within:text-blue-400 transition-colors">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="John Doe"
                        className="w-full bg-[#161616] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-[#1a1a1a] transition-all outline-none shadow-inner"
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 group-focus-within:text-purple-400 transition-colors">
                      {role === 'student' ? 'Campus Email' : 'Email Address'}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20} />
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder={role === 'student' ? 'it2XXXXX@my.sliit.lk' : 'you@example.com'}
                        className="w-full bg-[#161616] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-[#1a1a1a] transition-all outline-none shadow-inner"
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {role === 'student' && (
                    <div className="space-y-2 group">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 group-focus-within:text-cyan-400 transition-colors">IT Number</label>
                      <div className="relative">
                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                        <input
                          type="text"
                          name="itNumber"
                          required
                          placeholder="IT2XXXXXXX"
                          className="w-full bg-[#161616] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:bg-[#1a1a1a] transition-all outline-none shadow-inner"
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  )}

                  {role === 'student' && (
                    <div className="space-y-2 group">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500 group-focus-within:text-blue-400 transition-colors">
                          Select Community
                        </label>
                        {communitiesError && (
                          <button
                            type="button"
                            onClick={fetchCommunities}
                            className="text-xs text-blue-400 hover:text-blue-300 uppercase tracking-widest font-bold"
                          >
                            Retry
                          </button>
                        )}
                      </div>
                      <select
                        name="requestedCommunity"
                        required
                        value={formData.requestedCommunity}
                        onChange={handleInputChange}
                        disabled={communitiesLoading}
                        className="w-full bg-[#161616] border border-white/5 rounded-2xl py-4 px-4 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-[#1a1a1a] transition-all outline-none shadow-inner text-white disabled:opacity-50 disabled:cursor-wait"
                      >
                        {communitiesLoading ? (
                          <option value="">Loading communities...</option>
                        ) : communitiesError ? (
                          <option value="">Failed to load — click Retry</option>
                        ) : communities.length === 0 ? (
                          <option value="">No communities available yet</option>
                        ) : (
                          <>
                            <option value="">-- Choose your community --</option>
                            {communities.map(c => (
                              <option key={c._id} value={c._id}>
                                {c.name}{c.category ? ` — ${c.category}` : ''}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                      {communities.length > 0 && (
                        <p className="text-xs text-gray-600 uppercase tracking-widest">
                          {communities.length} communit{communities.length === 1 ? 'y' : 'ies'} available
                        </p>
                      )}
                    </div>
                  )}

                  {role === 'community_admin' && (
                    <>
                      <div className="space-y-2 group">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500 group-focus-within:text-purple-400 transition-colors">Community Name</label>
                        <input
                          type="text"
                          name="communityName"
                          required
                          placeholder="e.g. FOSS Community"
                          value={formData.communityName}
                          onChange={handleInputChange}
                          className="w-full bg-[#161616] border border-white/5 rounded-2xl py-4 px-4 focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-[#1a1a1a] transition-all outline-none shadow-inner text-white"
                        />
                      </div>
                      <div className="space-y-2 group">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500 group-focus-within:text-purple-400 transition-colors">Community Description</label>
                        <textarea
                          name="communityDescription"
                          required
                          placeholder="Describe your community..."
                          value={formData.communityDescription}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full bg-[#161616] border border-white/5 rounded-2xl py-4 px-4 focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-[#1a1a1a] transition-all outline-none shadow-inner text-white resize-none"
                        />
                      </div>
                      <div className="space-y-2 group">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500 group-focus-within:text-purple-400 transition-colors">Category</label>
                        <select
                          name="communityCategory"
                          required
                          value={formData.communityCategory}
                          onChange={handleInputChange}
                          className="w-full bg-[#161616] border border-white/5 rounded-2xl py-4 px-4 focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-[#1a1a1a] transition-all outline-none shadow-inner text-white"
                        >
                          <option value="">-- Select a category --</option>
                          <option value="Technical">Technical</option>
                          <option value="Cultural">Cultural</option>
                          <option value="Sports">Sports</option>
                          <option value="Academic">Academic</option>
                          <option value="Arts">Arts</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="space-y-2 group">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500 group-focus-within:text-emerald-400 transition-colors">Create Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                      <input
                        type="password"
                        name="password"
                        required
                        placeholder="••••••••"
                        className="w-full bg-[#161616] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-[#1a1a1a] transition-all outline-none shadow-inner"
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2 group mt-8 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  >
                    Continue <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full py-4 text-gray-500 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors"
                  >
                    Back to Roles
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md mx-auto"
            >
              <div className="rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] p-10 backdrop-blur-3xl shadow-2xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600" />

                <div className="mb-10 mt-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <div className="absolute inset-0 border border-blue-500/30 rounded-full animate-ping"></div>
                    <ShieldCheck size={48} className="text-blue-400" />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tight mb-3">Check Your Email</h2>
                  <p className="text-gray-400">We sent a 6-digit verification code to <br /><span className="text-white font-bold">{formData.email}</span></p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-8">
                  <div className="flex justify-center gap-2 md:gap-3">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        className="w-12 h-14 md:w-14 md:h-16 bg-[#161616] border border-white/10 rounded-xl text-center text-2xl font-black focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all shadow-inner text-white"
                      />
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 py-4 rounded-2xl font-black uppercase tracking-widest text-white hover:from-blue-500 hover:to-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                  >
                    Verify Account
                  </motion.button>

                  <div className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                    Didn't receive code? <button type="button" className="text-blue-400 hover:text-blue-300 ml-1 underline decoration-blue-500/30 underline-offset-4">Resend</button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center py-20"
            >
              <div className="mb-10 relative flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                  className="relative z-10 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(52,211,153,0.4)]"
                >
                  <CheckCircle2 size={64} className="text-white" />
                </motion.div>
                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
                <div className="absolute inset-[-50%] animate-spin-slow rounded-full bg-gradient-to-tr from-transparent via-emerald-500/10 to-transparent" />
              </div>
              <h1 className="text-5xl font-black uppercase mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Welcome Aboard</h1>
              {(role === 'student' || role === 'community_admin') ? (
                <>
                  <p className="text-gray-300 text-lg font-semibold mb-2">Application Submitted!</p>
                  <p className="text-gray-400 text-base">Your application is pending approval. You will be notified once approved.</p>
                  <Link to="/signin" className="inline-block mt-6 text-sm text-blue-400 hover:text-blue-300 underline underline-offset-4">Go to Sign In</Link>
                </>
              ) : (
                <p className="text-gray-400 text-lg">Routing protocols engaged...</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-16 text-center">
          <p className="text-gray-500 font-medium text-sm tracking-widest uppercase">
            Already registered? <Link to="/signin" className="text-white font-bold hover:text-blue-400 transition-colors ml-2 border-b border-white/20 pb-1 hover:border-blue-400/50">Log In Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
