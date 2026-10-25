import React from 'react';
import { Ward } from '../../types';
import { getRiskBadgeStyle } from '../../utils/colorScales';

interface WardTooltipProps {
  ward: Ward | null;
  x: number;
  y: number;
}

export const WardTooltip: React.FC<WardTooltipProps> = ({ ward, x, y }) => {
  if (!ward) return null;

  const badge = getRiskBadgeStyle(ward.risk);

  return (
    <div
      style={{ left: `${x + 14}px`, top: `${y + 14}px` }}
      className="fixed z-50 pointer-events-none bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border-strong)] p-3 rounded-md shadow-floating text-xs w-60"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[var(--border-subtle)] pb-2 mb-2 gap-2">
        <div>
          <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
            BMC Ward {ward.id} · {ward.zone}
          </div>
          <div className="font-serif font-semibold text-[var(--text-primary)] text-xs mt-0.5 leading-snug">
            {ward.name}
          </div>
        </div>
        <span
          style={{
            backgroundColor: badge.bg,
            color: badge.text,
            borderColor: badge.border,
          }}
          className="text-[9px] uppercase px-1.5 py-0.5 rounded border font-mono font-semibold shrink-0"
        >
          {ward.risk}
        </span>
      </div>

      {/* Tabular Readout */}
      <div className="space-y-1 font-mono text-[11px]">
        <div className="flex justify-between items-center">
          <span className="text-[var(--text-secondary)] font-sans">Mean Surface LST</span>
          <span className="text-[var(--text-primary)] font-semibold">{ward.meanLst.toFixed(1)} °C</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[var(--text-secondary)] font-sans">UHI Anomaly (ΔT)</span>
          <span
            style={{ color: ward.uhi > 0 ? '#D94E34' : '#0D9488' }}
            className="font-semibold"
          >
            {ward.uhi > 0 ? `+${ward.uhi.toFixed(1)}` : ward.uhi.toFixed(1)} °C
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[var(--text-secondary)] font-sans">NDVI / NDBI</span>
          <span className="text-[var(--text-primary)]">
            {ward.ndvi.toFixed(2)} / {ward.ndbi.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[var(--text-secondary)] font-sans">Surface Albedo (α)</span>
          <span className="text-[var(--text-primary)]">{ward.albedo.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center pt-1 mt-1 border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)]">
          <span className="font-sans">Pop. Density</span>
          <span>{ward.popDensity.toLocaleString()}/km²</span>
        </div>
      </div>
    </div>
  );
};
