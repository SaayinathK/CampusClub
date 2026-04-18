import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Twitter, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Mail, 
  MapPin, 
  Phone,
  Sparkles,
  Globe,
  Shield,
  Zap,
  ArrowUp
} from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    { icon: Twitter, label: 'Twitter', href: '#', color: 'hover:bg-sky-500' },
    { icon: Instagram, label: 'Instagram', href: '#', color: 'hover:bg-pink-500' },
    { icon: Facebook, label: 'Facebook', href: '#', color: 'hover:bg-blue-600' },
    { icon: Linkedin, label: 'LinkedIn', href: '#', color: 'hover:bg-blue-700' },
  ];

  const quickLinks = [
    { name: 'About Us', href: '#' },
    { name: 'Events', href: '#' },
    { name: 'Communities', href: '#' },
    { name: 'Support', href: '#' },
  ];

  const contactInfo = [
    { icon: MapPin, text: '123 Campus Avenue, University City' },
    { icon: Mail, text: 'support@clubsphere.com' },
    { icon: Phone, text: '+1 (555) 123-4567' },
  ];

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      {/* Premium Animated Background */}
      <div className="pointer-events-none absolute inset-0">
        {/* Gradient Orbs */}
        <motion.div 
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30" />
        
        {/* Floating Particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-300/40 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0
            }}
            animate={{
              y: [null, -100, -200],
              opacity: [0, 0.8, 0],
              x: [null, Math.random() * 100 - 50]
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl blur-md opacity-75 animate-pulse" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-2xl">
                  <Sparkles size={24} className="text-white" />
                </div>
              </motion.div>
              <div>
                <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                  ClubSphere
                </span>
                <div className="text-[8px] font-bold text-cyan-300 uppercase tracking-[0.2em] mt-0.5">MANAGEMENT PLATFORM</div>
              </div>
            </div>
            <p className="text-white text-sm leading-relaxed mb-6">
              The central hub for campus activities, approvals, memberships, and event coordination. Empowering student communities worldwide.
            </p>
            <div className="flex items-center gap-2 text-cyan-300 text-xs">
              <Heart size={14} className="fill-cyan-300" />
              <span>Making campus life better</span>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold mb-6 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, idx) => (
                <motion.li
                  key={idx}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <a 
                    href={link.href} 
                    className="text-white hover:text-cyan-300 transition-all duration-300 text-sm flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-cyan-400 transition-all duration-300" />
                    {link.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold mb-6 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Contact Us
            </h3>
            <ul className="space-y-4">
              {contactInfo.map((info, idx) => (
                <motion.li
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-start gap-3 text-white text-sm group"
                >
                  <info.icon size={16} className="text-cyan-400 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span>{info.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold mb-6 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Stay Updated
            </h3>
            <p className="text-white text-sm mb-4">
              Get the latest updates about events and communities
            </p>
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-blue-200/50 focus:outline-none focus:border-cyan-400 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white text-sm font-semibold hover:shadow-lg transition-all"
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Social Links & Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Social Media Links */}
            <motion.div 
              className="flex gap-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  className={`relative group p-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:shadow-xl transition-all duration-300 ${social.color}`}
                  whileHover={{ y: -5, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon size={18} className="text-blue-200 group-hover:text-white transition-colors" />
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-semibold bg-slate-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {social.label}
                  </span>
                </motion.a>
              ))}
            </motion.div>

            {/* Copyright & Links */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
              <p className="text-white flex items-center gap-1">
                © 2026 ClubSphere. 
                <span className="hidden sm:inline">All rights reserved.</span>
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-white-200/60 hover:text-cyan-300 transition-colors text-xs">
                  Privacy Policy
                </a>
                <a href="#" className="text-white-200/60 hover:text-cyan-300 transition-colors text-xs">
                  Terms of Service
                </a>
                <a href="#" className="text-white-200/60 hover:text-cyan-300 transition-colors text-xs">
                  Cookie Policy
                </a>
              </div>
            </div>

            {/* Back to Top Button */}
            <motion.button
              onClick={scrollToTop}
              className="group flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-cyan-500/20 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xs text-white-200">Back to Top</span>
              <ArrowUp size={14} className="text-cyan-400 group-hover:translate-y-[-2px] transition-transform" />
            </motion.button>
          </div>
        </div>

        {/* Decorative Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-white-400 to-indigo-400" />
      </div>

      {/* Scroll Progress Indicator */}
      <motion.div 
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center cursor-pointer shadow-2xl"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
        >
          <Zap size={18} className="text-white" />
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;