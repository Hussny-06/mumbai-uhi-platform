import React, { useState } from 'react';
import { CLIMATE_MONTHLY_MATRIX, CLIMATE_CLIMATOLOGY } from '../../data/staticDatasets';
import { getDivergingDeltaColor } from '../../utils/colorScales';
import { Calendar } from 'lucide-react';

export const MonthlyHeatmap: React.FC = () => {
  const [selectedCell, setSelectedCell] = useState<{
    year: number;
    month: number;
    mean: number;
    anomaly: number;
  } | null>(null);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /** Use perceptual getDivergingDeltaColor instead of Tailwind classes */
  const getAnomalyStyle = (anomaly: number): React.CSSProperties => {
    const bg = getDivergingDeltaColor(anomaly, 2.2);
    // Determine text contrast: dark bg (cooling) → white, light/orange (warming) → white
    const textColor = '#FFFFFF';
    return { backgroundColor: bg, color: textColor };
  };

  return (
    <div className="bg-uhi-surface border border-uhi-border p-4 rounded flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-uhi-border">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-uhi-cyan" />
            <h2 className="text-sm font-bold text-uhi-text uppercase tracking-wider">
              Monthly Climatology & Thermal Anomalies (1997–2024)
            </h2>
          </div>
          <p className="text-xs text-uhi-muted mt-0.5">
            Normalized against 28-year baseline (28.16°C). Warmer reds denote extreme pre-monsoon heat spikes.
          </p>
        </div>

        {/* Perceptual Diverging Legend */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
          <span style={{ color: '#0D9488' }}>−2.0°C</span>
          <div className="h-3 w-32 rounded overflow-hidden delta-cooling-gradient-bar" />
          <span style={{ color: '#D94E34' }}>+2.0°C</span>
        </div>
      </div>

      {/* Heatmap Grid Matrix */}
      <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          {/* Header row with month names */}
          <div className="grid grid-cols-13 gap-1 mb-1 text-[10px] font-mono text-uhi-muted text-center font-bold">
            <div className="text-left pl-1">Year</div>
            {months.map((m) => (
              <div key={m}>{m}</div>
            ))}
          </div>

          {/* Data rows */}
          <div className="space-y-1">
            {CLIMATE_MONTHLY_MATRIX.map((yr) => (
              <div key={yr.year} className="grid grid-cols-13 gap-1 items-center">
                <div className="text-[10px] font-mono text-uhi-muted pl-1">{yr.year}</div>
                {yr.months.map((m) => (
                  <button
                    key={m.month}
                    onMouseEnter={() => setSelectedCell({ year: yr.year, month: m.month, mean: m.mean, anomaly: m.anomaly })}
                    style={getAnomalyStyle(m.anomaly)}
                    className="h-5 rounded-sm flex items-center justify-center text-[9px] font-mono font-bold transition-transform hover:scale-110 hover:z-20 cursor-pointer"
                    title={`${yr.year} ${months[m.month - 1]}: ${m.mean}°C (Anomaly: ${m.anomaly > 0 ? '+' : ''}${m.anomaly}°C)`}
                  >
                    {m.mean.toFixed(0)}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Baseline Climatology Summary Row */}
      <div className="bg-uhi-surface2 border border-uhi-borderLight p-3 rounded mt-2">
        <div className="text-[11px] font-mono uppercase text-uhi-cyan font-bold mb-2 flex items-center justify-between">
          <span>28-Year Multi-Year Climatological Norms</span>
          {selectedCell && (
            <span className="text-uhi-text font-normal">
              Active Selection: {selectedCell.year} {months[selectedCell.month - 1]} | Mean: {selectedCell.mean}°C | Anomaly: {selectedCell.anomaly > 0 ? `+${selectedCell.anomaly}` : selectedCell.anomaly}°C
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
          {CLIMATE_CLIMATOLOGY.map((c) => (
            <div key={c.month} className="p-2 rounded bg-uhi-surface3/70 border border-uhi-border flex flex-col justify-between">
              <div className="flex justify-between items-center text-[10px] text-uhi-muted">
                <span className="font-bold text-uhi-text">{c.name}</span>
                <span className="font-mono">σ ±{c.std}°C</span>
              </div>
              <div className="text-base font-bold font-mono text-uhi-cyan mt-1">
                {c.mean.toFixed(1)}°C
              </div>
              <div className="flex justify-between text-[9px] font-mono text-uhi-muted mt-0.5">
                <span>Min: {c.min}°C</span>
                <span>Max: {c.max}°C</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
