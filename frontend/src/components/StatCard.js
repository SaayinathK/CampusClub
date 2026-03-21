import React from 'react';

/**
 * StatCard — numeric KPI display card
 *
 * <StatCard label="Total Users" value={42} color="var(--purple-light)" icon="👤" />
 */
export default function StatCard({ label, value, color, icon, trend, onClick }) {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div className="stat-value" style={{ color: color || 'var(--purple-light)' }}>{value}</div>
          <div className="stat-label">{label}</div>
        </div>
        {icon && (
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `${color || 'var(--purple-primary)'}20`,
            border: `1px solid ${color || 'var(--purple-primary)'}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem',
          }}>
            {icon}
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div style={{ marginTop: 10, fontSize: '0.72rem', color: trend >= 0 ? 'var(--success)' : 'var(--danger)' }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
        </div>
      )}
    </div>
  );
}
