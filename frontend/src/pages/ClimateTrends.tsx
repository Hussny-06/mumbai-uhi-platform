import React from 'react';
import { ClimateTrendChart } from '../components/charts/ClimateTrendChart';
import { MonthlyHeatmap } from '../components/charts/MonthlyHeatmap';
import { TrendingUp, Database, ShieldCheck, Thermometer } from 'lucide-react';

export const ClimateTrends: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto bg-uhi-bg p-4 lg:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-uhi-border gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h1 className="text-base font-bold text-uhi-text uppercase tracking-wider">
              Mumbai Long-Term Climate Dynamics (1997–2024)
            </h1>
          </div>
          <p className="text-xs text-uhi-muted mt-0.5">
            Parametric and non-parametric monotonic trend evaluation on 27+ years of continuous hourly/synoptic IMD records (383,640 records)
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-uhi-surface2 border border-uhi-border text-uhi-cyan flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            383,640 Records Ingested
          </span>
          <span className="px-2.5 py-1 rounded bg-uhi-surface2 border border-uhi-border text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Mann-Kendall p &lt; 0.001
          </span>
        </div>
      </div>

      {/* Main Climate Trend Line Chart Component */}
      <ClimateTrendChart />

      {/* Monthly Climatology Matrix Heatmap */}
      <MonthlyHeatmap />

      {/* Analytical Finding Callout */}
      <div className="bg-uhi-surface border border-uhi-border p-4 rounded text-xs space-y-2">
        <div className="font-semibold text-uhi-cyan uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Thermometer className="w-3.5 h-3.5" />
          Climatological Analysis & Urban Amplification Context
        </div>
        <p className="text-uhi-muted leading-relaxed text-[11px]">
          Metropolitan Mumbai exhibits a statistically robust warming trend of <strong className="text-white">+0.44°C per decade</strong> (Sen's slope = +0.0440°C/year, Z = +4.129, p = 3.64 × 10⁻⁵). Urbanization-induced nocturnal surface heat traps and loss of vegetative evapotranspiration in central and eastern industrial wards (Dharavi, Govandi, Kurla) exacerbate baseline climatological warming by up to <strong className="text-red-400">+5.7°C to +6.1°C</strong> above regional background sea breeze temperatures.
        </p>
      </div>
    </div>
  );
};
