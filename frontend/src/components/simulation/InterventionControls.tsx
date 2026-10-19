import React from 'react';
import { useUhiStore } from '../../stores/useUhiStore';
import { Sliders, Trees, Sun, Building, Zap, Play } from 'lucide-react';

export const InterventionControls: React.FC = () => {
  const {
    deltaNdvi,
    deltaAlbedo,
    deltaNdbi,
    setDeltaNdvi,
    setDeltaAlbedo,
    setDeltaNdbi,
    isSimulating,
    runSimulation,
    selectedWard,
    customPolygon,
    polygonAreaKm2,
  } = useUhiStore();

  return (
    <div className="bg-uhi-surface border border-uhi-border p-4 rounded flex flex-col gap-4">
      {/* Header */}
      <div className="pb-3 border-b border-uhi-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-uhi-blue" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-uhi-text">
              Intervention Parameters
            </h3>
          </div>
          <span className="text-[10px] font-mono text-uhi-cyan bg-uhi-surface2 px-2 py-0.5 rounded border border-uhi-border">
            Surrogate Physics Engine
          </span>
        </div>
        <p className="text-[11px] text-uhi-muted mt-1">
          Adjust biophysical parameters to simulate targeted cooling across{' '}
          {selectedWard ? `Ward ${selectedWard.id}` : customPolygon ? `Selected Polygon (${polygonAreaKm2 || 3.12} km²)` : 'Metropolitan Area'}
          .
        </p>
      </div>

      {/* Sliders Container */}
      <div className="space-y-4 text-xs">
        {/* Slider 1: Tree Canopy (ΔNDVI) */}
        <div className="space-y-1.5 bg-uhi-surface2/60 p-3 rounded border border-uhi-border">
          <div className="flex justify-between items-center">
            <label className="font-semibold text-uhi-text flex items-center gap-1.5">
              <Trees className="w-3.5 h-3.5 text-emerald-400" />
              Tree Canopy Augmentation (ΔNDVI)
            </label>
            <span className="font-mono text-emerald-400 font-bold">
              +{Math.round(deltaNdvi * 100)}% ({deltaNdvi > 0 ? `+${deltaNdvi.toFixed(2)}` : '0.00'})
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="0.50"
            step="0.05"
            value={deltaNdvi}
            onChange={(e) => setDeltaNdvi(parseFloat(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-uhi-muted">
            <span>0% (Baseline)</span>
            <span>+25% (Moderate)</span>
            <span>+50% (Dense Urban Forest)</span>
          </div>
        </div>

        {/* Slider 2: Cool Roofs (ΔAlbedo) */}
        <div className="space-y-1.5 bg-uhi-surface2/60 p-3 rounded border border-uhi-border">
          <div className="flex justify-between items-center">
            <label className="font-semibold text-uhi-text flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-300" />
              Cool Roof Reflectivity (ΔAlbedo)
            </label>
            <span className="font-mono text-amber-300 font-bold">
              +{deltaAlbedo.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0.00"
            max="0.40"
            step="0.05"
            value={deltaAlbedo}
            onChange={(e) => setDeltaAlbedo(parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-uhi-muted">
            <span>0.00 (Standard)</span>
            <span>+0.20 (Solar Reflective)</span>
            <span>+0.40 (High-SRI Coating)</span>
          </div>
        </div>

        {/* Slider 3: Impervious Surface Reduction (ΔNDBI) */}
        <div className="space-y-1.5 bg-uhi-surface2/60 p-3 rounded border border-uhi-border">
          <div className="flex justify-between items-center">
            <label className="font-semibold text-uhi-text flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              Impervious Surface Depaving (ΔNDBI)
            </label>
            <span className="font-mono text-blue-400 font-bold">
              {deltaNdbi.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="-0.30"
            max="0.00"
            step="0.05"
            value={deltaNdbi}
            onChange={(e) => setDeltaNdbi(parseFloat(e.target.value))}
            className="w-full accent-blue-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-uhi-muted">
            <span>-0.30 (Max Depaving)</span>
            <span>-0.15 (Permeable Pavements)</span>
            <span>0.00 (Current Built-up)</span>
          </div>
        </div>
      </div>

      {/* Action Button with micro-interaction state */}
      <button
        onClick={runSimulation}
        disabled={isSimulating}
        className={`w-full py-3 px-4 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl ${
          isSimulating
            ? 'bg-uhi-surface3 text-uhi-cyan cursor-wait border border-uhi-cyan/40'
            : 'bg-uhi-cyan text-uhi-bg hover:bg-cyan-300 font-bold cursor-pointer shadow-cyan-950/50'
        }`}
      >
        {isSimulating ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-uhi-cyan border-t-transparent rounded-full animate-spin" />
            <span>Simulating XGBoost Downscaling...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-current" />
            <span>Simulate Cooling</span>
          </>
        )}
      </button>
    </div>
  );
};
