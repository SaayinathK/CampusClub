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
    <div className="dashboard-container py-6 md:py-8 lg:py-10" style={{ maxWidth: maxWidth || '100%' }}>

      {/* Header */}
      {(title || subtitle || actions) && (
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            {title && (
              <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight leading-tight text-slate-900">
                {title}{highlight && <> <span className="text-gradient">{highlight}</span></>}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-2.5">{actions}</div>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
