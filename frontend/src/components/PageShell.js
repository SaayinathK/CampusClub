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

      {/* Content */}
      {children}
    </div>
  );
}
