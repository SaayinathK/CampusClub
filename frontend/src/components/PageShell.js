import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SEGMENT_LABELS = {
  admin: 'Admin',
  'community-admin': 'Community Admin',
  student: 'Student',
  users: 'Users',
  communities: 'Communities',
  events: 'Events',
  members: 'Members',
  profile: 'Profile',
  notifications: 'Notifications',
  registrations: 'Registrations',
};

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
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  const crumbs = segments
    .slice(0, 4)
    .map((seg, idx) => ({
      seg,
      to: '/' + segments.slice(0, idx + 1).join('/'),
      label: SEGMENT_LABELS[seg] || seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    }));

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 pb-16" style={{ maxWidth: maxWidth || '100%' }}>
      {/* Breadcrumbs */}
      {crumbs.length > 0 && (
        <div className="mb-6 text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 flex flex-wrap items-center gap-2">
          <Link to="/" className="hover:text-slate-700 transition-colors">Home</Link>
          {crumbs.map((c, i) => (
            <span key={c.to} className="flex items-center gap-2">
              <span className="opacity-40">/</span>
              {i === crumbs.length - 1 ? (
                <span className="text-slate-600">{c.label}</span>
              ) : (
                <Link to={c.to} className="hover:text-slate-700 transition-colors">{c.label}</Link>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Header */}
      {(title || subtitle || actions) && (
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 pb-6 mb-8 border-b border-slate-200">
          <div className="min-w-0">
            {title && (
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 leading-tight">
                {title}{highlight && <> <span className="gradient-text">{highlight}</span></>}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-slate-500 mt-2 font-medium">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap gap-2 items-center justify-start md:justify-end">{actions}</div>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
