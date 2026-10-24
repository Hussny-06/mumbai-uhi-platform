import React from 'react';
import { useUhiStore } from '../../stores/useUhiStore';
import { Zap, Flame, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export const SimulationResultCard: React.FC = () => {
  const { simulationResult, isSimulating } = useUhiStore();

  if (isSimulating) {
    return (
      <div className="bg-uhi-surface border border-uhi-border p-5 rounded flex flex-col items-center justify-center min-h-[220px] text-center gap-3">
        <div className="w-8 h-8 border-2 border-uhi-cyan border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-mono text-uhi-cyan font-bold uppercase tracking-wider">
          Running XGBoost Downscaling Inference...
        </div>
        <p className="text-[11px] text-uhi-muted max-w-xs">
          Computing high-speed surrogate biophysical perturbation across 30m grid cells.
        </p>
      </div>
    );
  }

  if (!simulationResult) {
    return (
      <div className="bg-uhi-surface border border-dashed border-uhi-border p-6 rounded flex flex-col items-center justify-center min-h-[220px] text-center gap-2">
        <Sparkles className="w-6 h-6 text-uhi-cyan/40" />
        <div className="text-xs font-semibold text-uhi-text">
          No Intervention Simulated Yet
        </div>
        <p className="text-[11px] text-uhi-muted max-w-xs">
          Draw a custom polygon on the map or select a ward, adjust the biophysical sliders, and click Simulate Cooling.
        </p>
      </div>
    );
  }

  const coolingPct = Math.min(100, (Math.abs(simulationResult.coolingDelta) / 2.5) * 100);
  const energyPct = Math.min(100, (simulationResult.energyReductionKwhM2Yr / 10.0) * 100);

  return (
    <div className="bg-uhi-surface border border-emerald-500/40 p-5 rounded flex flex-col gap-4 relative overflow-hidden shadow-2xl animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-uhi-border">
        <div>
          <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
            Simulation Complete
          </span>
          <div className="text-xs font-semibold text-uhi-text mt-1">
            Target: {simulationResult.target}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-uhi-muted bg-uhi-surface2 px-2 py-1 rounded border border-uhi-border">
          <Clock className="w-3 h-3 text-uhi-cyan" />
          <span>{simulationResult.elapsedMs} ms latency</span>
        </div>
      </div>

      {/* Hero Metric: Predicted Cooling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-uhi-surface2 p-3.5 rounded border border-uhi-border">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-wider text-uhi-muted">
            Predicted Cooling Delta (ΔT)
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400 tracking-tight mt-0.5">
            {simulationResult.coolingDelta.toFixed(2)} °C
          </div>
        </div>

        {/* Baseline to Intervention Flow */}
        <div className="flex items-center gap-2 text-xs font-mono border-t sm:border-t-0 sm:border-l border-uhi-border pt-2 sm:pt-0 sm:pl-4">
          <div>
            <div className="text-[9px] text-uhi-muted uppercase">Baseline</div>
            <div className="text-sm font-bold text-uhi-text">
              {simulationResult.baselineLst.toFixed(1)}°C
            </div>
          </div>
          <span className="text-uhi-cyan text-sm">↓</span>
          <div>
            <div className="text-[9px] text-emerald-400 uppercase">Intervention</div>
            <div className="text-sm font-bold text-emerald-400">
              {simulationResult.simulatedLst.toFixed(1)}°C
            </div>
          </div>
        </div>
      </div>

      {/* Energy Reduction Metric */}
      <div className="bg-uhi-surface2 p-3 rounded border border-uhi-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase font-mono text-uhi-muted flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            Estimated HVAC Energy Reduction
          </span>
          <span className="font-mono text-xs font-bold text-amber-300">
            {simulationResult.energyReductionKwhM2Yr.toFixed(2)} kWh/m²/yr
          </span>
        </div>
      </div>

      {/* Analytical Bar Meters */}
      <div className="space-y-2 text-[11px] font-mono">
        <div>
          <div className="flex justify-between text-uhi-muted mb-1 text-[10px]">
            <span>Cooling Intensity Potential</span>
            <span className="text-emerald-400">{coolingPct.toFixed(0)}%</span>
          </div>
          <div className="h-2 w-full bg-uhi-bg rounded-sm overflow-hidden border border-uhi-border">
            <div
              style={{ width: `${coolingPct}%` }}
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-sm"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-uhi-muted mb-1 text-[10px]">
            <span>Grid HVAC Demand Offset</span>
            <span className="text-amber-300">{energyPct.toFixed(0)}%</span>
          </div>
          <div className="h-2 w-full bg-uhi-bg rounded-sm overflow-hidden border border-uhi-border">
            <div
              style={{ width: `${energyPct}%` }}
              className="h-full bg-gradient-to-r from-yellow-500 to-amber-300 rounded-sm"
            />
          </div>
        </div>
      </div>

      {/* Model Rationale */}
      <div className="text-[10px] text-uhi-muted border-t border-uhi-border/80 pt-2 leading-relaxed">
        <span className="text-uhi-cyan font-bold font-mono">XAI DECOMPOSITION: </span>
        Albedo (+0.25) suppresses sensible heat flux; canopy vegetation boosts latent evapotranspiration, mitigating localized nocturnal heat traps.
      </div>
    </div>
  );
};
