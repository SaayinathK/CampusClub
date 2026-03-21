import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); setDropOpen(false); };

  const dashLink = { admin: '/admin', community_admin: '/community-admin', student: '/student' };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 900,
      background: scrolled ? 'rgba(10,10,15,0.95)' : 'rgba(10,10,15,0.7)',
      backdropFilter: 'blur(20px)',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all 0.3s ease',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 68, gap: 32 }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--purple-primary), var(--blue-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '1rem', color: 'white', fontFamily: 'var(--font-display)',
          }}>C</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', letterSpacing: '0.08em', color: 'white' }}>
            CLUB <span style={{ color: 'var(--purple-light)' }}>HUB</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 4, marginLeft: 16, flex: 1 }} className="hide-mobile">
          {[['/', 'HOME'], ['/events', 'EVENTS'], ['/clubs', 'CLUBS']].map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
              padding: '8px 14px',
              color: isActive ? 'white' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.78rem', letterSpacing: '0.08em',
              textDecoration: 'none', borderRadius: 'var(--radius-sm)',
              background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
              transition: 'all 0.2s',
            })}>{label}</NavLink>
          ))}
          {user && (
            <NavLink to={dashLink[user.role] || '/'} style={({ isActive }) => ({
              padding: '8px 14px',
              color: isActive ? 'white' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.78rem', letterSpacing: '0.08em',
              textDecoration: 'none', borderRadius: 'var(--radius-sm)',
              background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
              transition: 'all 0.2s',
            })}>DASHBOARD</NavLink>
          )}
        </div>

        {/* Auth buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          {!user ? (
            <>
              <Link to="/login" className="btn btn-outline" style={{ padding: '8px 18px', fontSize: '0.78rem' }}>Sign In</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.78rem' }}>Register</Link>
            </>
          ) : (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setDropOpen(!dropOpen)} style={{
                display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(124,58,237,0.1)',
                border: '1px solid var(--border-glow)', borderRadius: 100,
                padding: '6px 14px 6px 6px', cursor: 'pointer', color: 'white',
              }}>
                <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }} className="hide-mobile">{user.name?.split(' ')[0]}</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>▼</span>
              </button>

              {dropOpen && (
                <div style={{
                  position: 'absolute', top: '110%', right: 0,
                  background: 'var(--bg-card)', border: '1px solid var(--border-glow)',
                  borderRadius: 'var(--radius-md)', padding: 8, minWidth: 200,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 100,
                }}>
                  <div style={{ padding: '10px 14px 14px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    <span className={`badge badge-${user.role}`} style={{ marginTop: 6, fontSize: '0.65rem' }}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    {user.role === 'student' && (
                      <Link to="/student/profile" onClick={() => setDropOpen(false)} style={dropItemStyle}>My Profile</Link>
                    )}
                    {user.role === 'community_admin' && (
                      <Link to="/community-admin/profile" onClick={() => setDropOpen(false)} style={dropItemStyle}>Community Profile</Link>
                    )}
                    <button onClick={handleLogout} style={{ ...dropItemStyle, width: '100%', textAlign: 'left', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{
          display: 'none', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.3rem'
        }} className="show-mobile">☰</button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '16px 24px 20px' }}>
          {[['/', 'HOME'], ['/events', 'EVENTS'], ['/clubs', 'CLUBS']].map(([to, label]) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 0', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.08em' }}>{label}</Link>
          ))}
          {user && <Link to={dashLink[user.role]} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 0', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.08em' }}>DASHBOARD</Link>}
        </div>
      )}
    </nav>
  );
}

const dropItemStyle = {
  display: 'block', padding: '9px 14px', fontSize: '0.85rem',
  color: 'var(--text-secondary)', textDecoration: 'none',
  borderRadius: 'var(--radius-sm)', transition: 'all 0.2s',
  cursor: 'pointer',
};
