import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import EventCarousel from './components/EventCarousel';
import Features from './components/Features';
import Committees from './components/Committees';
import Footer from './components/Footer';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import { initialEvents } from './constants';

const Home = ({ events }) => (
  <>
    <EventCarousel events={events} />
    <Features />
    <Committees />
    <section className="py-24 bg-gradient-to-b from-transparent to-blue-900/10">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-widest leading-tight font-display">Ready to boost your campus life?</h2>
        <Link to="/signup">
          <button className="px-10 py-4 rounded-xl bg-white text-black font-black text-lg hover:bg-gray-200 transition-all active:scale-95 shadow-2xl shadow-white/10 uppercase tracking-[0.2em] font-display">
            Join Club Hub Now
          </button>
        </Link>
      </div>
    </section>
  </>
);

function App() {
  const [events, setEvents] = useState(initialEvents);

  const addFeedback = async (eventId, rating, feedback) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const username = user ? user.username : 'Anonymous';

      const res = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId,
          rating,
          comment: feedback,
          username
        }),
      });

      if (res.ok) {
        setEvents(prevEvents => prevEvents.map(event => {
          if (event.id === eventId) {
            return {
              ...event,
              ratings: [...event.ratings, rating],
              feedbacks: [...event.feedbacks, feedback]
            };
          }
          return event;
        }));
      } else if (res.status === 401) {
        alert('Your session has expired or is invalid. Please sign in again.');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.reload();
      } else {
        console.error('Failed to submit feedback to backend');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home events={events} />} />
            <Route path="/events" element={<Events events={events} />} />
            <Route path="/event/:id" element={<EventDetails events={events} onAddFeedback={addFeedback} />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
