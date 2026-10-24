import React from 'react';
import { ShapDriver } from '../../types';

interface ShapBarChartProps {
  drivers: { name: string; value: number; unit?: string; isHeating?: boolean }[];
  title?: string;
  subtitle?: string;
}

export const ShapBarChart: React.FC<ShapBarChartProps> = ({
  drivers,
  title = 'TOP HEAT DRIVERS',
  subtitle = 'TreeSHAP Biophysical Contributions (°C)',
}) => {
  // Find max absolute value for symmetric scaling
  const maxAbs = Math.max(...drivers.map((d) => Math.abs(d.value)), 1.5);

  return (
    <div className="bg-uhi-surface2/60 border border-uhi-border p-3 rounded">
      {title && (
        <div className="mb-2">
          <div className="text-[10px] uppercase font-mono tracking-wider font-semibold text-uhi-text">
            {title}
          </div>
          {subtitle && <div className="text-[10px] text-uhi-muted">{subtitle}</div>}
        </div>
      )}

      {/* Zero line header */}
      <div className="flex justify-between text-[9px] font-mono text-uhi-muted mb-1 px-1">
        <span>← Cooling Effect (-ΔT)</span>
        <span className="text-uhi-text font-bold">0°C</span>
        <span>Heating Effect (+ΔT) →</span>
      </div>

      <div className="space-y-2 mt-2">
        {drivers.map((item, idx) => {
          const isPositive = item.value >= 0;
          const pct = Math.min(100, (Math.abs(item.value) / maxAbs) * 100);

          return (
            <div key={idx} className="text-xs">
              <div className="flex justify-between items-center text-[11px] mb-0.5">
                <span className="font-medium text-uhi-text truncate max-w-[200px]">
                  {item.name}
                </span>
                <span
                  className={`font-mono font-bold ${
                    isPositive ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {isPositive ? `+${item.value.toFixed(2)}` : item.value.toFixed(2)}°C
                </span>
              </div>

              {/* Bidirectional Diverging Bar */}
              <div className="h-3 w-full bg-uhi-bg rounded-sm relative flex overflow-hidden border border-uhi-border/50">
                {/* Left side (Cooling / Negative) */}
                <div className="w-1/2 h-full flex justify-end">
                  {!isPositive && (
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-gradient-to-l from-emerald-500 to-teal-400 rounded-l-sm"
                    />
                  )}
                </div>

                {/* Center Divider */}
                <div className="w-[1.5px] h-full bg-uhi-borderLight z-10" />

                {/* Right side (Heating / Positive) */}
                <div className="w-1/2 h-full flex justify-start">
                  {isPositive && (
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-r-sm"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 p-2 rounded bg-uhi-surface3/60 border border-uhi-border/60 text-[10px] text-uhi-muted leading-relaxed">
        <span className="text-uhi-cyan font-semibold">Model Interpretation: </span>
        Built-up density (+NDBI) is the primary positive forcing driver of urban heat across Mumbai, whereas canopy cover (-NDVI) and coastal sea breeze buffer provide strong negative thermal moderation.
      </div>
    </div>
  );
};
