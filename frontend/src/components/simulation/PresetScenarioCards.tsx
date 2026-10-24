import React from 'react';
import { useUhiStore } from '../../stores/useUhiStore';
import { PRESET_SCENARIOS } from '../../data/staticDatasets';
import { PolicyScenario } from '../../types';
import { Sparkles, ArrowRight, Zap, Flame } from 'lucide-react';

export const PresetScenarioCards: React.FC = () => {
  const { applyPresetScenario, runSimulation } = useUhiStore();

  const handleSelectScenario = async (sc: PolicyScenario) => {
    applyPresetScenario({
      deltaNdvi: sc.deltaNdvi,
      deltaAlbedo: sc.deltaAlbedo,
      deltaNdbi: sc.deltaNdbi,
    });
    // Trigger simulation immediately with preset
    await runSimulation();
  };

  return (
    <div className="bg-uhi-surface border border-uhi-border p-4 rounded flex flex-col gap-3">
      <div className="flex items-center justify-between pb-2 border-b border-uhi-border">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-uhi-text flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-uhi-cyan" />
            Empirical Policy Scenarios
          </h3>
          <p className="text-[10px] text-uhi-muted mt-0.5">
            Calibrated against real Mumbai municipal simulation runs (asad_simulation_results.json)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {PRESET_SCENARIOS.map((sc) => (
          <button
            key={sc.id}
            onClick={() => handleSelectScenario(sc)}
            className="p-3 rounded bg-uhi-surface2 border border-uhi-border hover:border-uhi-cyan/60 hover:bg-uhi-surface3 text-left transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="text-xs font-bold text-uhi-text group-hover:text-uhi-cyan transition-colors">
                {sc.name}
              </div>
              <div className="text-[10px] text-uhi-muted line-clamp-2 mt-1">
                {sc.description}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-uhi-border/60 space-y-1 font-mono text-[10px]">
              <div className="flex justify-between items-center text-emerald-400">
                <span className="text-uhi-muted font-sans flex items-center gap-1">
                  <Flame className="w-3 h-3 text-red-400" /> ΔT Cooling:
                </span>
                <span className="font-bold">{sc.expectedCooling.toFixed(2)} °C</span>
              </div>

              <div className="flex justify-between items-center text-amber-300">
                <span className="text-uhi-muted font-sans flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-300" /> Energy Saved:
                </span>
                <span>{sc.expectedEnergySaving.toFixed(1)} kWh/m²</span>
              </div>

              <div className="pt-1.5 flex items-center justify-between text-uhi-cyan group-hover:translate-x-0.5 transition-transform">
                <span className="text-[9px] uppercase font-sans font-semibold">Load Scenario</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
