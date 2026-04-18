import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
   User, Camera, CreditCard, FileText, Upload, Download,
   Trash2, Plus, CheckCircle2, Shield, Calendar, CreditCard as CardIcon, LogOut, Mail
} from 'lucide-react';

const Profile = () => {
   const [activeTab, setActiveTab] = useState('profile');
   const [profilePhoto, setProfilePhoto] = useState(null);
   const [userData, setUserData] = useState({ username: 'USER', email: 'user@example.com' }); // Default dummy will be overridden
   const [cards, setCards] = useState([
      { id: 1, type: 'Visa', last4: '4242', expiry: '12/26', name: 'SASIKA SHEHAN' }
   ]);
   const [showAddCard, setShowAddCard] = useState(false);
   const [newCard, setNewCard] = useState({
      number: '',
      name: '',
      expiry: '',
      cvv: '',
      provider: 'visa'
   });
   const [receipts, setReceipts] = useState([]);

   const fileInputRef = useRef(null);
   const receiptInputRef = useRef(null);
   const navigate = useNavigate();

   const fetchReceipts = async () => {
      try {
         const token = localStorage.getItem('token');
         const res = await fetch('http://localhost:5000/api/receipts', {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });
         const data = await res.json();
         if (res.ok) {
            setReceipts(data);
         }
      } catch (err) {
         console.error('Error fetching receipts:', err);
      }
   };

   useEffect(() => {
      // Load user data from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
         setUserData(JSON.parse(storedUser));
         fetchReceipts();
      } else {
         // If not logged in, redirect to signin
         navigate('/signin');
      }
   }, [navigate]);

   const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/signin');
   };

   const handlePhotoChange = (e) => {
      const file = e.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onloadend = () => setProfilePhoto(reader.result);
         reader.readAsDataURL(file);
      }
   };

   const handleReceiptUpload = async (e) => {
      const file = e.target.files[0];
      if (file) {
         const token = localStorage.getItem('token');
         const formData = new FormData();
         formData.append('receipt', file);

         try {
            const res = await fetch('http://localhost:5000/api/receipts/upload', {
               method: 'POST',
               headers: {
                  'Authorization': `Bearer ${token}`
               },
               body: formData
            });

            const data = await res.json();
            if (res.ok) {
               setReceipts([data, ...receipts]);
            } else {
               alert(data.message || 'Upload failed');
            }
         } catch (err) {
            console.error('Upload Error:', err);
            alert('Could not connect to the server for upload.');
         }
      }
   };

   const handleDownloadReceipt = (receipt) => {
      if (receipt.fileUrl) {
         const fullUrl = `http://localhost:5000${receipt.fileUrl}`;
         window.open(fullUrl, '_blank');
      }
   };

   const deleteReceipt = async (id) => {
      if (!window.confirm('Are you sure you want to delete this document?')) return;

      try {
             const token = localStorage.getItem('token');
             const res = await fetch(`http://localhost:5000/api/receipts/${id}`, {
                  method: 'DELETE',
                  headers: {
                      'Authorization': `Bearer ${token}`
                  }
             });
             if (res.ok) {
                  setReceipts(receipts.filter(r => r._id !== id));
             }
      } catch (err) {
         console.error('Delete Error:', err);
      }
   };

   const handleAddCard = (e) => {
      e.preventDefault();
      const last4 = newCard.number.slice(-4);
      const card = {
         id: Date.now(),
         type: newCard.provider === 'mastercard' ? 'MasterCard' : newCard.provider === 'amex' ? 'AMEX' : 'Visa',
         last4: last4 || '0000',
         expiry: newCard.expiry,
         name: newCard.name.toUpperCase()
      };
      setCards([...cards, card]);
      setShowAddCard(false);
      setNewCard({ number: '', name: '', expiry: '', cvv: '', provider: 'visa' });
   };

   const handleCardInputChange = (e) => {
      const { name, value } = e.target;
      let formattedValue = value;
      if (name === 'number') {
         formattedValue = value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
      } else if (name === 'expiry') {
         formattedValue = value.replace(/\//g, '').replace(/(\d{2})/g, '$1/').trim().slice(0, 5);
         if (formattedValue.endsWith('/')) formattedValue = formattedValue.slice(0, -1);
         } else if (name === 'cvv') {
             formattedValue = value.replace(/\D/g, '').slice(0, 3);
         }
         setNewCard({ ...newCard, [name]: formattedValue });
    };

   const deleteCard = (id) => setCards(cards.filter(c => c.id !== id));

   const tabs = [
      { id: 'profile', label: 'My Profile', icon: User },
      { id: 'payment', label: 'Payment Methods', icon: CreditCard },
      { id: 'receipts', label: 'Receipts & Slips', icon: FileText },
   ];

   return (
      <div className="min-h-screen pt-32 pb-20 bg-transparent text-slate-900 px-4 md:px-8 relative overflow-hidden">
         {/* Background Glows */}
         <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 z-0">
            <motion.div
               animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.05, 1] }}
               transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-sky-500/20 rounded-full blur-[150px]"
            />
            <motion.div
               animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.05, 1] }}
               transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
               className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[150px]"
            />
         </div>

         <AnimatePresence>
            {showAddCard && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
               >
                  <motion.div
                     initial={{ scale: 0.95, y: 20 }}
                     animate={{ scale: 1, y: 0 }}
                     exit={{ scale: 0.95, y: 20 }}
                     className="bg-white/95 border border-slate-200 p-8 rounded-[2.5rem] w-full max-w-xl shadow-[0_0_50px_rgba(148,163,184,0.20)] relative overflow-hidden"
                  >
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-blue-600" />
                     <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-8">Add <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-400">Security</span></h2>

                     <div className="mb-8 overflow-x-auto pb-4 scrollbar-hide">
                        <div className="flex gap-4 min-w-max">
                           {[
                              { id: 'paypal', color: 'from-[#003087] to-[#009cde]', label: 'PayPal' },
                              { id: 'visa', color: 'from-[#1434CB] to-[#00579f]', label: 'VISA' },
                              { id: 'mastercard', color: 'from-[#eb001b] to-[#ff5f00]', label: 'MasterCard', isMC: true },
                              { id: 'amex', color: 'from-[#0070cd] to-[#0093e0]', label: 'AMEX' }
                           ].map((p) => (
                              <button
                                 key={p.id}
                                 onClick={() => setNewCard({ ...newCard, provider: p.id })}
                                 className={`h-16 w-28 rounded-2xl flex items-center justify-center transition-all bg-gradient-to-br ${newCard.provider === p.id
                                    ? `${p.color} ring-2 ring-offset-4 ring-offset-[#0b1220] ring-sky-400 scale-105 shadow-[0_0_20px_rgba(56,189,248,0.35)]`
                                    : 'from-white/5 to-white/5 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 hover:from-white/10 hover:to-white/5'
                                    }`}
                              >
                                 {p.isMC && newCard.provider !== p.id ? (
                                    <div className="flex -space-x-3">
                                       <div className="w-6 h-6 rounded-full bg-white/40" />
                                       <div className="w-6 h-6 rounded-full bg-white/60" />
                                    </div>
                                 ) : (
                                    <span className="text-xs font-black uppercase tracking-widest text-white">{p.label}</span>
                                 )}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div className={`mb-10 p-8 rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-500 bg-gradient-to-br ${newCard.provider === 'paypal' ? 'from-[#003087] to-[#009cde]' :
                        newCard.provider === 'mastercard' ? 'from-zinc-800 to-zinc-900 border border-white/10' :
                           newCard.provider === 'amex' ? 'from-[#0070cd] to-[#0093e0]' : 'from-blue-700 to-indigo-900'
                        }`}>
                        <div className="absolute top-[-50%] right-[-20%] w-60 h-60 bg-white/10 rounded-full blur-[40px] pointer-events-none" />
                        <div className="flex justify-between items-start mb-10 relative z-10">
                           <div className="w-14 h-10 bg-yellow-400/90 rounded-xl shadow-inner backdrop-blur-sm" />
                           <div className="h-8 flex items-center">
                              {newCard.provider === 'mastercard' ? (
                                 <div className="flex -space-x-3">
                                    <div className="w-7 h-7 rounded-full bg-[#eb001b]" />
                                    <div className="w-7 h-7 rounded-full bg-[#ff5f00] opacity-90" />
                                 </div>
                              ) : (
                                 <span className="font-black italic text-white/50 uppercase tracking-widest text-lg drop-shadow-md">
                                    {newCard.provider}
                                 </span>
                              )}
                           </div>
                        </div>
                        <div className="space-y-6 relative z-10">
                           <p className="text-2xl font-mono tracking-[0.2em] leading-none drop-shadow-md">
                              {newCard.provider === 'paypal' ? 'PAYPAL REF LINKED' : (newCard.number || '•••• •••• •••• ••••')}
                           </p>
                           <div className="flex justify-between items-end">
                              <div>
                                 <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-1">Card Holder</p>
                                 <p className="font-black tracking-widest leading-none uppercase drop-shadow-md">{newCard.name || 'YOUR NAME'}</p>
                              </div>
                              {newCard.provider !== 'paypal' && (
                                 <div className="text-right">
                                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-1">Expires</p>
                                    <p className="font-black tracking-widest leading-none drop-shadow-md">{newCard.expiry || 'MM/YY'}</p>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>

                     <form onSubmit={handleAddCard} className="space-y-4">
                        <input
                           type="text"
                           name="number"
                           value={newCard.number}
                           onChange={handleCardInputChange}
                           placeholder="Card Number"
                           className="theme-input"
                           required
                        />
                        <input
                           type="text"
                           name="name"
                           value={newCard.name}
                           onChange={handleCardInputChange}
                           placeholder="Card Holder Name"
                           className="theme-input"
                           required
                        />
                        <div className="grid grid-cols-2 gap-4">
                           <input
                              type="text"
                              name="expiry"
                              value={newCard.expiry}
                              onChange={handleCardInputChange}
                              placeholder="MM/YY"
                              className="theme-input"
                              required
                           />
                           <input
                              type="password"
                              name="cvv"
                              maxLength="3"
                              className="theme-input"
                              placeholder="CVV"
                              required
                           />
                        </div>
                        <div className="flex gap-4 mt-8 pt-4 border-t border-slate-200">
                           <button type="button" onClick={() => setShowAddCard(false)} className="flex-1 font-bold uppercase tracking-widest text-xs py-4 text-slate-500 hover:text-slate-900 transition-colors">Cancel</button>
                           <button type="submit" className="flex-[2] theme-button-primary py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(56,189,248,0.2)] transition-all active:scale-95">Verify & Add</button>
                        </div>
                     </form>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>

         <div className="max-w-7xl mx-auto relative z-10">
            <header className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
               <div>
                  <motion.h1
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-2"
                  >
                     My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 drop-shadow-lg">Dashboard</span>
                  </motion.h1>
                  <p className="text-slate-400 uppercase tracking-[0.2em] text-xs font-bold">Manage your identity and assets</p>
               </div>
               <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors border border-red-500/20">
                  <LogOut size={16} /> Log Out
               </button>
            </header>

            <div className="flex flex-col lg:flex-row gap-8">
               {/* Sidebar Tabs */}
               <aside className="lg:w-1/4">
                  <div className="flex flex-col gap-3">
                     {tabs.map((tab) => (
                        <button
                           key={tab.id}
                           onClick={() => setActiveTab(tab.id)}
                           className={`flex items-center gap-4 px-6 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${activeTab === tab.id
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-white/10'
                              : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                        >
                           <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-slate-500'} />
                           {tab.label}
                        </button>
                     ))}
                  </div>
               </aside>

               {/* Main Content Area */}
               <main className="lg:w-3/4 bg-white/90 border border-slate-200 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-3xl shadow-2xl min-h-[600px] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600" />

                  <AnimatePresence mode="wait">
                     {activeTab === 'profile' && (
                        <motion.div
                           key="profile"
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           className="space-y-12"
                        >
                           <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                              <div className="relative group">
                                 <div className="w-48 h-48 rounded-full overflow-hidden border-[6px] border-slate-900 bg-gradient-to-br from-sky-500/20 to-blue-600/20 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                                    {profilePhoto ? (
                                       <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                       <User size={80} className="text-cyan-300/60" />
                                    )}
                                 </div>
                                 <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="absolute bottom-2 right-2 p-4 theme-button-primary rounded-full shadow-[0_0_20px_rgba(14,165,233,0.25)] hover:scale-110 transition-transform"
                                 >
                                    <Camera size={24} />
                                 </button>
                                 <input
                                    type="file"
                                    hidden
                                    ref={fileInputRef}
                                    onChange={handlePhotoChange}
                                    accept="image/*"
                                 />
                              </div>
                              <div className="text-center md:text-left mt-4">
                                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">{userData.username}</h2>
                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-lg ${userData.role === 'sliit' ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' :
                                          userData.role === 'admin' ? 'bg-red-600/20 text-red-500 border-red-500/30' :
                                             userData.role === 'community' ? 'bg-purple-600/20 text-purple-400 border-purple-500/30' :
                                                'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                                       }`}>
                                       {userData.role === 'sliit' ? 'SLIIT Student' :
                                          userData.role === 'community' ? 'Community Admin' :
                                             userData.role === 'admin' ? 'System Admin' : 'External Participant'}
                                    </span>
                                 </div>
                                 <p className="text-slate-400 font-bold tracking-widest uppercase text-sm mb-8 flex items-center justify-center md:justify-start gap-2">
                                    <Mail size={16} className="text-cyan-300" /> {userData.email}
                                 </p>
                                 <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <button className="px-8 py-3.5 theme-button-primary rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">Edit Identity</button>
                                    <button className="px-8 py-3.5 theme-button-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-inner">Account Settings</button>
                                 </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-4 hover:border-cyan-400/30 transition-colors">
                                 <div className="flex items-center gap-3 text-cyan-300 mb-4">
                                    <Shield size={24} />
                                    <h3 className="font-black uppercase tracking-widest text-sm">Security Level</h3>
                                 </div>
                                 <p className="text-slate-400 text-sm leading-relaxed mb-4">Account secured with verified email token and encoded credentials.</p>
                                 <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden shadow-inner">
                                    <motion.div
                                       initial={{ width: 0 }}
                                       animate={{ width: "100%" }}
                                       transition={{ duration: 1, delay: 0.5 }}
                                       className="h-full bg-gradient-to-r from-sky-500 to-cyan-300"
                                    />
                                 </div>
                              </div>
                              <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-4 hover:border-cyan-400/30 transition-colors">
                                 <div className="flex items-center gap-3 text-sky-300 mb-4">
                                    <Calendar size={24} />
                                    <h3 className="font-black uppercase tracking-widest text-sm">Account Status</h3>
                                 </div>
                                 <p className="text-slate-400 text-sm leading-relaxed mb-4">Successfully authenticated. You have full access to dashboard features.</p>
                                 <div className="inline-block px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-black uppercase tracking-widest rounded-lg">
                                    Active Passport
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                     )}

                     {activeTab === 'payment' && (
                        <motion.div
                           key="payment"
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           className="space-y-8"
                        >
                           <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-200">
                              <h2 className="text-2xl font-black uppercase tracking-tighter">Your Cards</h2>
                              <button
                                 onClick={() => setShowAddCard(true)}
                                 className="flex items-center gap-2 px-6 py-3 theme-button-primary rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                              >
                                 <Plus size={16} /> Add Card
                              </button>
                           </div>

                           {cards.length === 0 ? (
                              <div className="text-center py-20 border border-dashed border-slate-200 rounded-3xl bg-white">
                                 <CreditCard size={48} className="mx-auto text-slate-600 mb-4" />
                                 <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No payment methods added</p>
                              </div>
                           ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {cards.map((card) => (
                                    <div key={card.id} className="p-8 rounded-[2rem] bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-2xl relative overflow-hidden group hover:border-cyan-400/20 transition-all">
                                       <div className="absolute top-[-50%] right-[-20%] w-64 h-64 bg-slate-100 rounded-full blur-[50px] group-hover:bg-cyan-400/10 transition-colors duration-700 pointer-events-none" />
                                       <CardIcon className="mb-8 opacity-60 text-cyan-600" size={36} />
                                       <div className="space-y-8 relative z-10">
                                          <p className="text-xl md:text-2xl font-mono tracking-[0.2em] text-slate-900">•••• •••• •••• {card.last4}</p>
                                          <div className="flex justify-between items-end">
                                             <div>
                                                <p className="text-[10px] uppercase font-bold tracking-widest opacity-70 mb-1 text-slate-500">Expires</p>
                                                <p className="font-black tracking-widest text-slate-900">{card.expiry}</p>
                                             </div>
                                             <button
                                                onClick={() => deleteCard(card.id)}
                                                className="p-3 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl transition-all border border-slate-200 hover:border-red-300"
                                             >
                                                <Trash2 size={18} />
                                             </button>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           )}

                           <div className="mt-12 p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex items-start gap-4">
                              <Shield className="text-cyan-300 shrink-0" size={24} />
                              <div>
                                 <h3 className="text-sm font-black uppercase tracking-widest text-cyan-300 mb-2">Maximum Security</h3>
                                 <p className="text-xs text-slate-400 leading-relaxed font-medium">All payment details are encrypted using banking-grade security protocols. We never store your full card numbers directly on our servers.</p>
                              </div>
                           </div>
                        </motion.div>
                     )}

                     {activeTab === 'receipts' && (
                        <motion.div
                           key="receipts"
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           className="space-y-10"
                        >
                           <div
                              className="w-full border-2 border-dashed border-slate-300 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-4 hover:border-cyan-400/50 hover:bg-cyan-500/5 transition-all group cursor-pointer"
                              onClick={() => receiptInputRef.current.click()}
                           >
                              <div className="p-5 bg-cyan-50 text-cyan-700 rounded-2xl group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-lg border border-cyan-200">
                                 <Upload size={32} />
                              </div>
                              <div className="text-center mt-2">
                                 <p className="font-black uppercase tracking-widest text-sm mb-2 text-slate-900">Upload New Document</p>
                                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Drop PDF or Images here (Max 5MB)</p>
                              </div>
                              <input
                                 type="file"
                                 hidden
                                 ref={receiptInputRef}
                                 onChange={handleReceiptUpload}
                                 accept=".pdf,image/*"
                              />
                           </div>

                           <div>
                              <h2 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                                 <FileText className="text-slate-500" /> Document Log
                              </h2>
                              <div className="space-y-4">
                                 {receipts.map((receipt) => (
                                    <div key={receipt._id} className="p-6 rounded-3xl bg-white border border-slate-200 flex items-center justify-between group hover:border-cyan-400/20 transition-all">
                                       <div className="flex items-center gap-5">
                                          <div className={`p-4 rounded-xl shadow-inner ${receipt.status === 'Verified' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                             {receipt.status === 'Verified' ? <CheckCircle2 size={24} /> : <FileText size={24} />}
                                          </div>
                                          <div>
                                             <p className="font-bold text-sm text-slate-900 mb-1">{receipt.originalName}</p>
                                             <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">
                                                {new Date(receipt.uploadDate).toLocaleDateString()} • <span className={receipt.status === 'Verified' ? 'text-green-500/70' : 'text-blue-500/70'}>{receipt.status}</span>
                                             </p>
                                          </div>
                                       </div>
                                       <div className="flex gap-2">
                                          <button
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadReceipt(receipt);
                                             }}
                                             className="p-4 bg-white/5 hover:bg-cyan-300 text-slate-400 hover:text-slate-950 rounded-2xl transition-all active:scale-95 shadow-sm"
                                             title="Download Document"
                                          >
                                             <Download size={20} />
                                          </button>
                                          <button
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                deleteReceipt(receipt._id);
                                             }}
                                             className="p-4 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-2xl transition-all active:scale-95 shadow-sm"
                                             title="Delete Document"
                                          >
                                             <Trash2 size={20} />
                                          </button>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </main>
            </div>
         </div>
      </div>
   );
};

export default Profile;
