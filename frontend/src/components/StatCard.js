import React from 'react';

/**
 * StatCard — numeric KPI display card
 *
 * <StatCard label="Total Users" value={42} color="var(--purple-light)" icon="👤" />
 */
export default function StatCard({ label, value, color, icon, trend, onClick }) {
  return (
    <div
      className="surface-card stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="stat-value" style={{ color: color || 'var(--purple-light)' }}>{value}</div>
          <div className="stat-label" style={{ color: 'var(--theme-text-muted)' }}>{label}</div>
        </div>
        {icon && (
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style={{
            background: `${color || '#3b82f6'}20`,
            border: `1px solid ${color || '#3b82f6'}40`,
            color: color || '#3b82f6'
          }}>
            {icon}
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div style={{ marginTop: 10, fontSize: '0.72rem', color: trend >= 0 ? '#34d399' : '#fb7185' }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
        </div>
      )}
    </div>
  );
}
