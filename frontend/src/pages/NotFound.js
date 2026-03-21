import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '120px 24px' }}>
      <h1 style={{ fontSize: '6rem', fontWeight: 900, marginBottom: 8 }}>404</h1>
      <p style={{ fontSize: '1.25rem', marginBottom: 32, color: 'var(--text-secondary)' }}>
        Page not found
      </p>
      <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
  );
}
