import React from 'react';

/**
 * StatCard — numeric KPI display card
 *
 * <StatCard label="Total Users" value={42} color="var(--purple-light)" icon="👤" />
 */
export default function StatCard({ label, value, color, icon, trend, onClick }) {
  return (
    <div
      className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-3xl font-black mb-1" style={{ color: color || '#3b82f6' }}>{value}</div>
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</div>
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
        <div className={`mt-4 text-[10px] font-bold uppercase tracking-wider ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
        </div>
      )}
    </div>
  );
}
