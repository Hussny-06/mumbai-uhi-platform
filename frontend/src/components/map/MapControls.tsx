import React from 'react';
import { useUhiStore } from '../../stores/useUhiStore';
import { MapLayerType } from '../../types';
import { 
  Plus, 
  Minus, 
  RotateCcw, 
  Crosshair, 
  Maximize2, 
  Layers, 
  Eye, 
  Map as MapIcon 
} from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onLocate: () => void;
  onToggleFullscreen: () => void;
  showSatelliteBasemap: boolean;
  onToggleSatellite: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onLocate,
  onToggleFullscreen,
  showSatelliteBasemap,
  onToggleSatellite,
}) => {
  const { activeLayer, setActiveLayer } = useUhiStore();
  const [showLayerMenu, setShowLayerMenu] = React.useState(false);

  const layers: { id: MapLayerType; label: string; desc: string }[] = [
    { id: 'lst', label: 'Land Surface Temperature', desc: '30m Downscaled Thermal LST' },
    { id: 'ndvi', label: 'NDVI / Vegetation', desc: 'Canopy Density (-1 to +1)' },
    { id: 'ndbi', label: 'NDBI / Built-up', desc: 'Impervious Surface Index' },
    { id: 'mndwi', label: 'MNDWI / Water', desc: 'Water bodies & Creeks' },
    { id: 'albedo', label: 'Albedo / Reflectance', desc: 'Broadband Surface Albedo' },
    { id: 'elevation', label: 'Elevation (SRTM)', desc: 'Terrain DEM in meters' },
    { id: 'wards', label: 'Ward Boundaries', desc: '24 BMC Administrative Units' },
  ];

  return (
    <div className="absolute top-5 right-5 z-20 flex flex-col gap-2">
      {/* Primary Zoom & Navigation Controls */}
      <div className="bg-uhi-surface/90 backdrop-blur-md border border-uhi-border rounded shadow-xl flex flex-col divide-y divide-uhi-border/80">
        <button
          onClick={onZoomIn}
          title="Zoom In (+)"
          className="p-2 text-uhi-muted hover:text-uhi-text hover:bg-uhi-surface2 transition-colors rounded-t"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          title="Zoom Out (-)"
          className="p-2 text-uhi-muted hover:text-uhi-text hover:bg-uhi-surface2 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={onLocate}
          title="Center on Greater Mumbai"
          className="p-2 text-uhi-muted hover:text-uhi-cyan hover:bg-uhi-surface2 transition-colors"
        >
          <Crosshair className="w-4 h-4" />
        </button>
        <button
          onClick={onReset}
          title="Reset Camera Orientation"
          className="p-2 text-uhi-muted hover:text-uhi-text hover:bg-uhi-surface2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleFullscreen}
          title="Toggle Fullscreen"
          className="p-2 text-uhi-muted hover:text-uhi-text hover:bg-uhi-surface2 transition-colors rounded-b"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Layer Selector Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium border shadow-xl backdrop-blur-md transition-all ${
            showLayerMenu
              ? 'bg-uhi-cyan text-uhi-bg border-uhi-cyan font-bold'
              : 'bg-uhi-surface/90 text-uhi-text border-uhi-border hover:bg-uhi-surface2'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Layers</span>
        </button>

        {showLayerMenu && (
          <div className="absolute right-0 top-10 w-64 bg-uhi-surface/95 backdrop-blur-lg border border-uhi-borderLight rounded shadow-2xl p-2 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="text-[10px] uppercase font-mono tracking-wider text-uhi-cyan px-2 py-1 border-b border-uhi-border mb-1">
              Geospatial Raster Toggles
            </div>
            <div className="space-y-1">
              {layers.map((l) => {
                const isSelected = activeLayer === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => {
                      setActiveLayer(l.id);
                      setShowLayerMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-uhi-surface3 text-uhi-cyan font-semibold border-l-2 border-uhi-cyan'
                        : 'text-uhi-muted hover:bg-uhi-surface2 hover:text-uhi-text'
                    }`}
                  >
                    <div>
                      <div className="leading-tight">{l.label}</div>
                      <div className="text-[9px] text-uhi-muted font-normal">{l.desc}</div>
                    </div>
                    {isSelected && <span className="text-[10px] font-mono text-uhi-cyan font-bold">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Satellite RGB Basemap Toggle */}
            <div className="pt-2 mt-2 border-t border-uhi-border">
              <button
                onClick={onToggleSatellite}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                  showSatelliteBasemap
                    ? 'bg-uhi-surface3 text-emerald-400 font-semibold'
                    : 'text-uhi-muted hover:bg-uhi-surface2 hover:text-uhi-text'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Satellite RGB Basemap</span>
                </div>
                <span className="text-[10px] font-mono">{showSatelliteBasemap ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
