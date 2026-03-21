import React from 'react';

/**
 * EmptyState — zero-results display with optional CTA
 *
 * <EmptyState icon="📅" title="No events yet" cta={<button>Create Event</button>} />
 */
export default function EmptyState({ icon = '📭', title = 'Nothing here yet', subtitle, cta }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '60px 24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: '3.5rem', marginBottom: 16, opacity: 0.4 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 8, color: 'var(--text-secondary)' }}>
        {title}
      </div>
      {subtitle && (
        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', maxWidth: 320, marginBottom: 20 }}>{subtitle}</p>
      )}
      {cta && <div style={{ marginTop: 4 }}>{cta}</div>}
    </div>
  );
}
