import React from 'react';
import { useUhiStore } from '../stores/useUhiStore';
import { MumbaiMap } from '../components/map/MumbaiMap';
import { WardDetailDrawer } from '../components/analytics/WardDetailDrawer';
import { MapLayerType } from '../types';
import { Layers, Flame, Trees, Building2, Droplets, Sun, Mountain, MapPin } from 'lucide-react';

export const HeatMap: React.FC = () => {
  const { activeLayer, setActiveLayer, selectedWard } = useUhiStore();

  const layerButtons: { id: MapLayerType; label: string; icon: React.ReactNode }[] = [
    { id: 'lst', label: 'Land Surface Temp (LST)', icon: <Flame className="w-3.5 h-3.5 text-red-400" /> },
    { id: 'ndvi', label: 'NDVI / Vegetation', icon: <Trees className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'ndbi', label: 'NDBI / Built-up', icon: <Building2 className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'mndwi', label: 'MNDWI / Water', icon: <Droplets className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'albedo', label: 'Albedo / Reflectance', icon: <Sun className="w-3.5 h-3.5 text-amber-300" /> },
    { id: 'elevation', label: 'Elevation (SRTM)', icon: <Mountain className="w-3.5 h-3.5 text-emerald-500" /> },
    { id: 'wards', label: 'Ward Boundaries', icon: <MapPin className="w-3.5 h-3.5 text-purple-400" /> },
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-uhi-bg">
      {/* Top Layer Quick Bar */}
      <div className="bg-uhi-surface border-b border-uhi-border px-4 py-2 flex items-center justify-between gap-3 overflow-x-auto shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-uhi-cyan" />
          <span className="text-xs font-bold uppercase tracking-wider text-uhi-text">
            Geospatial Layer:
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {layerButtons.map((btn) => {
            const isSelected = activeLayer === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setActiveLayer(btn.id)}
                className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-uhi-cyan text-uhi-bg font-bold shadow-md shadow-cyan-950/40'
                    : 'bg-uhi-surface2 text-uhi-muted hover:text-uhi-text hover:bg-uhi-surface3 border border-uhi-border'
                }`}
              >
                {btn.icon}
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono text-uhi-muted">
          <span>Resolution: <strong>30m</strong></span>
          <span className="text-uhi-border">|</span>
          <span>Sensor: <strong>Landsat 8/9 Level-2</strong></span>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="flex-1 flex relative overflow-hidden">
        <MumbaiMap className="flex-1 h-full" />
        {selectedWard && <WardDetailDrawer />}
      </div>
    </div>
  );
};
