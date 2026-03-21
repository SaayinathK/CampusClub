import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, LogIn, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLE_ROUTES = {
  admin: '/admin',
  community_admin: '/community-admin',
  student: '/student',
};

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const redirectMessage = location.state?.message ||
    (searchParams.get('reason') === 'session_expired'
      ? 'Your session has expired. Please sign in again to continue.'
      : null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(formData.email, formData.password);
      navigate(ROLE_ROUTES[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed! Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#0a0a0a] text-white px-4 md:px-6 overflow-hidden relative flex flex-col justify-center">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -40, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] right-[15%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] left-[15%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"
        />
      </div>

      <div className="max-w-md mx-auto w-full relative z-10">
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
          >
            <LogIn size={36} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black mb-3 uppercase tracking-tighter"
          >
            <span className="text-white drop-shadow-lg">Welcome </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Back</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs"
          >
            Access your hub account
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />

          <form onSubmit={handleSignIn} className="space-y-6 relative z-10">
            {redirectMessage && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl px-4 py-3 text-blue-300 text-xs font-bold tracking-wide flex items-center gap-2">
                <Info size={14} className="shrink-0" />
                {redirectMessage}
              </div>
            )}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 text-red-400 text-xs font-bold tracking-wide">
                {error}
              </div>
            )}
            <div className="space-y-2 group">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 group-focus-within:text-blue-400 transition-colors ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  className="w-full bg-[#161616] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-[#1a1a1a] transition-all outline-none text-white shadow-inner placeholder:text-gray-600"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 group-focus-within:text-purple-400 transition-colors">Password</label>
                <button type="button" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-purple-400 transition-colors">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20} />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#161616] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-[#1a1a1a] transition-all outline-none text-white shadow-inner placeholder:text-gray-600"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className={`w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-3 group mt-8 shadow-[0_0_20px_rgba(255,255,255,0.1)] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-gray-500 font-medium text-xs tracking-widest uppercase">
              New here? <Link to="/signup" className="text-white font-bold hover:text-blue-400 transition-colors ml-2 border-b border-white/20 pb-1 hover:border-blue-400/50">Create Account</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignIn;
