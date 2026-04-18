import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Camera,
  CreditCard,
  FileText,
  Upload,
  Download,
  Trash2,
  Plus,
  CheckCircle2,
  Shield,
  Calendar,
  CreditCard as CardIcon,
  LogOut,
  Mail,
} from 'lucide-react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [userData, setUserData] = useState({ username: 'USER', email: 'user@example.com', role: 'student' });
  const [cards, setCards] = useState([
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/26', name: 'SASIKA SHEHAN' },
  ]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    provider: 'visa',
  });
  const [receipts, setReceipts] = useState([]);

  const fileInputRef = useRef(null);
  const receiptInputRef = useRef(null);
  const navigate = useNavigate();

  const fetchReceipts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/receipts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setReceipts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching receipts:', err);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
      fetchReceipts();
    } else {
      navigate('/signin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfilePhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('receipt', file);

      const res = await fetch('http://localhost:5001/api/receipts/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setReceipts((prev) => [data, ...prev]);
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      alert('Could not connect to the server for upload.');
    }
  };

  const handleDownloadReceipt = (receipt) => {
    if (!receipt?.fileUrl) return;
    window.open(`http://localhost:5001${receipt.fileUrl}`, '_blank');
  };

  const deleteReceipt = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/receipts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setReceipts((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error('Delete Error:', err);
    }
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    const card = {
      id: Date.now(),
      type: newCard.provider === 'mastercard' ? 'MasterCard' : newCard.provider === 'amex' ? 'AMEX' : 'Visa',
      last4: newCard.number.replace(/\s/g, '').slice(-4) || '0000',
      expiry: newCard.expiry,
      name: newCard.name.toUpperCase(),
    };
    setCards((prev) => [...prev, card]);
    setShowAddCard(false);
    setNewCard({ number: '', name: '', expiry: '', cvv: '', provider: 'visa' });
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'number') {
      formattedValue = value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
    } else if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
      if (formattedValue.length >= 3) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2)}`;
      }
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setNewCard((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const deleteCard = (id) => setCards((prev) => prev.filter((c) => c.id !== id));

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'receipts', label: 'Receipts & Slips', icon: FileText },
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 text-slate-900 px-4 md:px-8 relative overflow-hidden">
      <AnimatePresence>
        {showAddCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-xl shadow-xl"
            >
              <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Add Payment Method</h2>
              <form onSubmit={handleAddCard} className="space-y-4">
                <input type="text" name="number" value={newCard.number} onChange={handleCardInputChange} placeholder="Card Number" className="theme-input" required />
                <input type="text" name="name" value={newCard.name} onChange={handleCardInputChange} placeholder="Card Holder Name" className="theme-input" required />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="expiry" value={newCard.expiry} onChange={handleCardInputChange} placeholder="MM/YY" className="theme-input" required />
                  <input type="password" name="cvv" value={newCard.cvv} onChange={handleCardInputChange} placeholder="CVV" className="theme-input" required />
                </div>
                <div className="flex gap-3 pt-3">
                  <button type="button" onClick={() => setShowAddCard(false)} className="flex-1 theme-button-secondary py-3 font-black uppercase text-xs tracking-widest">Cancel</button>
                  <button type="submit" className="flex-1 theme-button-primary py-3 font-black uppercase text-xs tracking-widest">Add Card</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-2">My Dashboard</h1>
            <p className="text-slate-500 uppercase tracking-[0.2em] text-xs font-bold">Manage your identity and assets</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold uppercase tracking-widest text-xs border border-red-200">
            <LogOut size={16} /> Log Out
          </button>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4">
            <div className="flex flex-col gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-4 px-6 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md border border-transparent'
                      : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
                  }`}
                >
                  <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-slate-500'} />
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          <main className="lg:w-3/4 bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-lg min-h-[560px]">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="relative group">
                      <div className="w-44 h-44 rounded-full overflow-hidden border-[6px] border-white bg-slate-100 flex items-center justify-center shadow-md">
                        {profilePhoto ? <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" /> : <User size={74} className="text-blue-500/50" />}
                      </div>
                      <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 p-3 bg-white text-black rounded-full border border-slate-200 shadow-sm">
                        <Camera size={20} />
                      </button>
                      <input type="file" hidden ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" />
                    </div>

                    <div className="text-center md:text-left">
                      <h2 className="text-4xl font-black uppercase tracking-tight mb-3">{userData.username}</h2>
                      <p className="text-slate-500 font-bold tracking-widest uppercase text-xs mb-6 flex items-center justify-center md:justify-start gap-2">
                        <Mail size={14} className="text-blue-500" /> {userData.email}
                      </p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <button className="px-6 py-3 theme-button-primary rounded-xl text-[10px] font-black uppercase tracking-widest">Edit Identity</button>
                        <button className="px-6 py-3 theme-button-secondary rounded-xl text-[10px] font-black uppercase tracking-widest">Account Settings</button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-3 text-blue-700 mb-3">
                        <Shield size={20} />
                        <h3 className="font-black uppercase tracking-widest text-xs">Security Level</h3>
                      </div>
                      <p className="text-slate-600 text-sm">Account secured with verified email token and encoded credentials.</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-3 text-indigo-700 mb-3">
                        <Calendar size={20} />
                        <h3 className="font-black uppercase tracking-widest text-xs">Account Status</h3>
                      </div>
                      <p className="text-slate-600 text-sm">Successfully authenticated. You have full access to dashboard features.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'payment' && (
                <motion.div key="payment" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <div className="flex justify-between items-center pb-6 border-b border-slate-200">
                    <h2 className="text-2xl font-black uppercase tracking-tight">Your Cards</h2>
                    <button onClick={() => setShowAddCard(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md">
                      <Plus size={16} /> Add Card
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {cards.map((card) => (
                      <div key={card.id} className="p-7 rounded-[2rem] bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 shadow-2xl">
                        <CardIcon className="mb-7 opacity-40 text-white" size={34} />
                        <p className="text-xl font-mono tracking-[0.2em] text-white/90 mb-5">•••• •••• •••• {card.last4}</p>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-1 text-white">Expires</p>
                            <p className="font-black tracking-widest text-white">{card.expiry}</p>
                          </div>
                          <button onClick={() => deleteCard(card.id)} className="p-3 bg-white text-slate-600 hover:text-red-500 rounded-xl border border-slate-200">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'receipts' && (
                <motion.div key="receipts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <div className="w-full border-2 border-dashed border-slate-300 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 hover:border-blue-400 hover:bg-slate-50 transition-all group cursor-pointer" onClick={() => receiptInputRef.current?.click()}>
                    <div className="p-4 bg-white text-blue-500 rounded-2xl border border-slate-200">
                      <Upload size={28} />
                    </div>
                    <div className="text-center">
                      <p className="font-black uppercase tracking-widest text-xs mb-1 text-slate-900">Upload New Document</p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Drop PDF or Images here</p>
                    </div>
                    <input type="file" hidden ref={receiptInputRef} onChange={handleReceiptUpload} accept=".pdf,image/*" />
                  </div>

                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-5 flex items-center gap-3 text-slate-900">
                      <FileText className="text-slate-400" /> Document Log
                    </h2>
                    <div className="space-y-3">
                      {receipts.map((receipt) => (
                        <div key={receipt._id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl border ${receipt.status === 'Verified' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                              {receipt.status === 'Verified' ? <CheckCircle2 size={20} /> : <FileText size={20} />}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-900 mb-1">{receipt.originalName}</p>
                              <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">
                                {new Date(receipt.uploadDate).toLocaleDateString()} • {receipt.status}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleDownloadReceipt(receipt)} className="p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl">
                              <Download size={18} />
                            </button>
                            <button onClick={() => deleteReceipt(receipt._id)} className="p-3 bg-slate-50 border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-500 rounded-xl">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {receipts.length === 0 && (
                        <div className="text-center py-10 border border-dashed border-slate-300 rounded-2xl bg-slate-50">
                          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No receipts uploaded yet</p>
                        </div>
                      )}
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