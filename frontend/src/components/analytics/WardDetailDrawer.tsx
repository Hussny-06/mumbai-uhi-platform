import React from 'react';
import { useUhiStore } from '../../stores/useUhiStore';
import { ShapBarChart } from '../charts/ShapBarChart';
import { 
  X, 
  MapPin, 
  Flame, 
  Trees, 
  Building2, 
  Sun, 
  Mountain, 
  Compass, 
  SlidersHorizontal,
  FileText
} from 'lucide-react';

export const WardDetailDrawer: React.FC = () => {
  const { 
    selectedWard, 
    setSelectedWard, 
    isWardDrawerOpen, 
    setIsWardDrawerOpen,
    setActivePage 
  } = useUhiStore();

  if (!isWardDrawerOpen || !selectedWard) return null;

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Critical':
      case 'Extreme':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'Moderate':
      case 'Moderate-High':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'Cooling Sink':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      default:
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
    }
  };

  const metrics = [
    { label: 'Mean LST', value: `${selectedWard.meanLst.toFixed(1)} °C`, icon: <Flame className="w-3.5 h-3.5 text-red-400" /> },
    { label: 'UHI Intensity', value: `${selectedWard.uhi > 0 ? `+${selectedWard.uhi.toFixed(1)}` : selectedWard.uhi.toFixed(1)} °C`, icon: <Flame className="w-3.5 h-3.5 text-orange-400" /> },
    { label: 'NDVI (Canopy)', value: selectedWard.ndvi.toFixed(2), icon: <Trees className="w-3.5 h-3.5 text-emerald-400" /> },
    { label: 'NDBI (Built-up)', value: selectedWard.ndbi.toFixed(2), icon: <Building2 className="w-3.5 h-3.5 text-blue-400" /> },
    { label: 'Surface Albedo', value: selectedWard.albedo.toFixed(2), icon: <Sun className="w-3.5 h-3.5 text-amber-300" /> },
    { label: 'Elevation (DEM)', value: `${selectedWard.elev} m`, icon: <Mountain className="w-3.5 h-3.5 text-emerald-500" /> },
    { label: 'Distance to Coast', value: `${selectedWard.distCoast} km`, icon: <Compass className="w-3.5 h-3.5 text-cyan-400" /> },
    { label: 'Population Density', value: `${selectedWard.popDensity.toLocaleString()}/km²`, icon: <MapPin className="w-3.5 h-3.5 text-purple-400" /> },
  ];

  return (
    <div className="w-80 lg:w-96 bg-uhi-surface border-l border-uhi-border flex flex-col h-full z-20 shrink-0 shadow-2xl overflow-y-auto animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-uhi-border flex items-start justify-between bg-uhi-surface2/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-uhi-cyan font-bold px-1.5 py-0.5 rounded bg-uhi-surface3 border border-uhi-border">
              WARD {selectedWard.id}
            </span>
            <span className="text-xs text-uhi-muted font-mono">{selectedWard.zone}</span>
          </div>
          <h2 className="text-base font-bold text-uhi-text mt-1 leading-tight">
            {selectedWard.name}
          </h2>
          <div className="text-[11px] text-uhi-muted">Mumbai, Maharashtra</div>
        </div>
        <button
          onClick={() => {
            setIsWardDrawerOpen(false);
            setSelectedWard(null);
          }}
          className="p-1 rounded text-uhi-muted hover:text-uhi-text hover:bg-uhi-surface3 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Heat Risk Badge */}
        <div className="p-3 rounded bg-uhi-surface2 border border-uhi-border flex items-center justify-between">
          <span className="text-xs font-semibold text-uhi-text uppercase tracking-wider">
            Heat Risk Assessment
          </span>
          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border uppercase ${getRiskBadgeColor(selectedWard.risk)}`}>
            {selectedWard.risk}
          </span>
        </div>

        {/* Core Biophysical Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className="p-2 rounded bg-uhi-surface2/50 border border-uhi-border/80 flex flex-col justify-between"
            >
              <div className="text-[10px] text-uhi-muted flex items-center gap-1">
                {m.icon}
                <span className="truncate">{m.label}</span>
              </div>
              <div className="text-sm font-mono font-bold text-uhi-text mt-1">
                {m.value}
              </div>
            </div>
          ))}
        </div>

        {/* TreeSHAP Local Driver Decomposition */}
        <div>
          <ShapBarChart
            drivers={selectedWard.shapDrivers}
            title="TOP HEAT DRIVERS"
            subtitle={`TreeSHAP Local Forcing Breakdown for Ward ${selectedWard.id}`}
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={() => setActivePage('simulator')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded bg-uhi-cyan text-uhi-bg text-xs font-bold uppercase tracking-wider hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-950/40"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Simulate Intervention in Ward {selectedWard.id}
          </button>

          <button
            onClick={() => setActivePage('reports')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded bg-uhi-surface2 border border-uhi-border hover:bg-uhi-surface3 text-uhi-text text-xs font-medium transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-uhi-cyan" />
            Generate Municipal Briefing
          </button>
        </div>
      </div>
    </div>
  );
};
