import React from 'react';
import { useUhiStore } from '../stores/useUhiStore';
import { MumbaiMap } from '../components/map/MumbaiMap';
import { InterventionControls } from '../components/simulation/InterventionControls';
import { SimulationResultCard } from '../components/simulation/SimulationResultCard';
import { PresetScenarioCards } from '../components/simulation/PresetScenarioCards';
import { WARDS_DATA } from '../data/staticDatasets';
import { Ward } from '../types';
import { 
  SlidersHorizontal, 
  MapPin, 
  Info 
} from 'lucide-react';

export const Simulator: React.FC = () => {
  const { 
    customPolygon, 
    polygonAreaKm2, 
    selectedWard,
    setSelectedWard,
  } = useUhiStore();

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto bg-uhi-bg p-4 lg:p-6 space-y-4">
      {/* Simplified Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-uhi-border gap-3">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-uhi-cyan" />
            <h1 className="text-base font-bold text-uhi-text uppercase tracking-wider">
              WHAT-IF URBAN INTERVENTION SIMULATOR
            </h1>
          </div>
          <p className="text-xs text-uhi-muted mt-0.5">
            Test policy interventions (tree planting, cool roofs, depaving) and simulate cooling effects across Mumbai
          </p>
        </div>

        {/* Target Area Quick Selector */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-uhi-muted flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-uhi-cyan" /> Target Ward:
          </label>
          <select
            value={selectedWard?.id || 'G/N'}
            onChange={(e) => {
              const found = WARDS_DATA.find((w: Ward) => w.id === e.target.value);
              if (found) setSelectedWard(found);
            }}
            className="bg-uhi-surface2 border border-uhi-border rounded px-2.5 py-1 text-xs text-uhi-text focus:outline-none focus:border-uhi-cyan font-mono cursor-pointer"
          >
            {WARDS_DATA.map((w: Ward) => (
              <option key={w.id} value={w.id}>
                Ward {w.id} - {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Simulation Controls & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left GIS Map Viewport (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-2">
          <div className="h-[480px] lg:h-[540px] rounded border border-uhi-border overflow-hidden relative shadow-2xl bg-uhi-surface">
            <MumbaiMap interactivePolygonMode={true} />
          </div>

          <div className="bg-uhi-surface2/60 border border-uhi-border px-3 py-2 rounded text-[11px] text-uhi-muted flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-uhi-cyan" />
              <span>
                Click any ward or use <strong>Draw Polygon</strong> above to select a custom intervention area.
              </span>
            </div>
            {customPolygon && (
              <span className="font-mono text-emerald-400 font-bold">
                Drawn Area: {polygonAreaKm2 || 3.12} km²
              </span>
            )}
          </div>
        </div>

        {/* Right Side Controls & Output (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Sliders */}
          <InterventionControls />

          {/* Result Card */}
          <SimulationResultCard />
        </div>
      </div>

      {/* Preset Policy Scenarios Section */}
      <PresetScenarioCards />
    </div>
  );
};
