import React from 'react';

/**
 * PageShell — wraps every dashboard inner page with consistent spacing,
 * a page title/subtitle header, and optional action buttons.
 *
 * Usage:
 *   <PageShell title="USER MANAGEMENT" subtitle="24 users found" actions={<button>Add</button>}>
 *     ...content
 *   </PageShell>
 */
export default function PageShell({ title, highlight, subtitle, actions, children, maxWidth }) {
  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: maxWidth || '100%' }}>

      {/* Header */}
      {(title || subtitle || actions) && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          paddingBottom: 24,
          borderBottom: '1px solid var(--border)',
          marginBottom: 32,
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            {title && (
              <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 4, lineHeight: 1.1 }}>
                {title}{highlight && <> <span className="gradient-text">{highlight}</span></>}
              </h2>
            )}
            {subtitle && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>{subtitle}</p>
            )}
          </div>
          {actions && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>{actions}</div>
          )}
        </div>
      )}

      {/* Content */}
      {children}
    </div>
  );
}
