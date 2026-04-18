import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '120px 24px' }}>
      <h1 style={{ fontSize: '6rem', fontWeight: 900, marginBottom: 8, color: 'var(--theme-text)' }}>404</h1>
      <p style={{ fontSize: '1.25rem', marginBottom: 32, color: 'var(--theme-text-muted)' }}>
        Page not found
      </p>
      <Link to="/" className="theme-button-primary px-6 py-3">Go Home</Link>
    </div>
  );
}
