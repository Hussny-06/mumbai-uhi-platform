import React from 'react';
import { Ward } from '../../types';
import { Flame, Trees, Building2, Users } from 'lucide-react';

interface WardTooltipProps {
  ward: Ward | null;
  x: number;
  y: number;
}

export const WardTooltip: React.FC<WardTooltipProps> = ({ ward, x, y }) => {
  if (!ward) return null;

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Critical':
      case 'Extreme':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'Moderate':
      case 'Moderate-High':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Cooling Sink':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      default:
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
    }
  };

  return (
    <div
      style={{ left: `${x + 15}px`, top: `${y + 15}px` }}
      className="fixed z-50 pointer-events-none bg-uhi-surface/95 backdrop-blur-md border border-uhi-borderLight p-3 rounded shadow-2xl text-xs w-64 animate-in fade-in duration-150"
    >
      <div className="flex items-start justify-between border-b border-uhi-border pb-1.5 mb-2">
        <div>
          <div className="text-[10px] font-mono uppercase text-uhi-cyan font-bold">
            WARD: {ward.id}
          </div>
          <div className="font-semibold text-uhi-text text-xs leading-tight">
            {ward.name}
          </div>
        </div>
        <span
          className={`text-[9px] uppercase px-1.5 py-0.5 rounded border font-mono font-bold ${getRiskBadgeColor(
            ward.risk
          )}`}
        >
          {ward.risk}
        </span>
      </div>

      <div className="space-y-1.5 font-mono text-[11px]">
        <div className="flex justify-between items-center">
          <span className="text-uhi-muted flex items-center gap-1 font-sans">
            <Flame className="w-3 h-3 text-red-400" /> Mean LST:
          </span>
          <span className="text-uhi-text font-bold">{ward.meanLst.toFixed(1)} °C</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-uhi-muted flex items-center gap-1 font-sans">
            <Flame className="w-3 h-3 text-orange-400" /> UHI Intensity:
          </span>
          <span className={`font-bold ${ward.uhi > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {ward.uhi > 0 ? `+${ward.uhi.toFixed(1)}` : ward.uhi.toFixed(1)} °C
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-uhi-muted flex items-center gap-1 font-sans">
            <Trees className="w-3 h-3 text-emerald-400" /> NDVI:
          </span>
          <span className="text-uhi-text">{ward.ndvi.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-uhi-muted flex items-center gap-1 font-sans">
            <Building2 className="w-3 h-3 text-blue-400" /> NDBI:
          </span>
          <span className="text-uhi-text">{ward.ndbi.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center pt-1 border-t border-uhi-border/60">
          <span className="text-uhi-muted flex items-center gap-1 font-sans">
            <Users className="w-3 h-3 text-purple-400" /> Pop Density:
          </span>
          <span className="text-uhi-text">{ward.popDensity.toLocaleString()}/km²</span>
        </div>
      </div>
    </div>
  );
};
