import React from 'react';

interface KpiMetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  badge?: string;
  badgeColor?: 'cyan' | 'green' | 'purple' | 'orange' | 'red';
  icon?: React.ReactNode;
}

export const KpiMetricCard: React.FC<KpiMetricCardProps> = ({
  label,
  value,
  sublabel,
  badge,
  badgeColor = 'cyan',
  icon,
}) => {
  const getBadgeClass = (color: string) => {
    switch (color) {
      case 'green':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
      case 'purple':
        return 'text-purple-400 bg-purple-950/40 border-purple-500/30';
      case 'orange':
        return 'text-orange-400 bg-orange-950/40 border-orange-500/30';
      case 'red':
        return 'text-red-400 bg-red-950/40 border-red-500/30';
      default:
        return 'text-uhi-cyan bg-cyan-950/40 border-cyan-500/30';
    }
  };

  return (
    <div className="bg-uhi-surface border border-uhi-border p-3 rounded flex flex-col justify-between hover:border-uhi-borderLight transition-all relative overflow-hidden group">
      {/* Top row */}
      <div className="flex items-center justify-between text-uhi-muted mb-1">
        <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">
          {label}
        </span>
        {icon && <span className="text-uhi-muted group-hover:text-uhi-cyan transition-colors">{icon}</span>}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-xl font-bold font-mono text-uhi-text tracking-tight">
          {value}
        </div>
        {badge && (
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getBadgeClass(badgeColor)}`}>
            {badge}
          </span>
        )}
      </div>

      {/* Sublabel */}
      {sublabel && (
        <div className="text-[10px] text-uhi-muted mt-1 truncate">
          {sublabel}
        </div>
      )}

      {/* Accent corner line */}
      <div className="absolute top-0 right-0 w-8 h-[2px] bg-gradient-to-l from-uhi-cyan/40 to-transparent" />
    </div>
  );
};
