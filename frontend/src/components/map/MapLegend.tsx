import React from 'react';
import { useUhiStore } from '../../stores/useUhiStore';
import { MapLayerType } from '../../types';

interface MapLegendProps {
  showDeltaScale?: boolean;
}

export const MapLegend: React.FC<MapLegendProps> = ({ showDeltaScale = false }) => {
  const { activeLayer, hoveredWard } = useUhiStore();

  const getLegendConfig = (layer: MapLayerType) => {
    if (showDeltaScale) {
      return {
        title: 'Simulated Cooling Anomaly (ΔT)',
        unit: '°C Shift',
        min: '-2.2°C',
        mid: '0.0°C',
        max: '+1.0°C',
        gradientClass: 'delta-cooling-gradient-bar',
        labels: ['Strong Cooling (-ΔT)', 'Baseline Neutral', 'Heat Gain'],
        hoverVal: hoveredWard ? `${hoveredWard.uhi > 0 ? '+' : ''}${hoveredWard.uhi.toFixed(1)}°C` : null,
      };
    }

    switch (layer) {
      case 'lst':
        return {
          title: 'Land Surface Temperature (LST)',
          unit: '°C (30m)',
          min: '29.0°C',
          mid: '33.8°C',
          max: '38.5°C',
          gradientClass: 'thermal-gradient-bar',
          labels: ['SGNP Cool Sink', 'Urban Mean', 'Extreme Core'],
          hoverVal: hoveredWard ? `${hoveredWard.meanLst.toFixed(1)}°C` : null,
        };
      case 'ndvi':
        return {
          title: 'Vegetation Canopy (NDVI)',
          unit: 'Index',
          min: '0.04',
          mid: '0.32',
          max: '0.62',
          gradientClass: 'ndvi-gradient-bar',
          labels: ['Impervious / Bare', 'Moderate', 'Dense Forest'],
          hoverVal: hoveredWard ? hoveredWard.ndvi.toFixed(2) : null,
        };
      case 'ndbi':
        return {
          title: 'Built-Up Density (NDBI)',
          unit: 'Index',
          min: '-0.15',
          mid: '0.22',
          max: '0.60',
          gradientClass: 'ndbi-gradient-bar',
          labels: ['Vegetated Sink', 'Suburban', 'High Impervious'],
          hoverVal: hoveredWard ? hoveredWard.ndbi.toFixed(2) : null,
        };
      case 'mndwi':
        return {
          title: 'Surface Moisture / Water (MNDWI)',
          unit: 'Index',
          min: '-0.22',
          mid: '-0.08',
          max: '+0.06',
          gradientClass: 'mndwi-gradient-bar',
          labels: ['Dry Asphalt', 'Intertidal', 'Creek / Coastal'],
          hoverVal: hoveredWard ? hoveredWard.mndwi.toFixed(2) : null,
        };
      case 'albedo':
        return {
          title: 'Broadband Surface Albedo',
          unit: 'α (0–1)',
          min: '0.09',
          mid: '0.14',
          max: '0.20',
          gradientClass: 'albedo-gradient-bar',
          labels: ['Dark Tar/Bitumen', 'Concrete', 'High-SRI Roof'],
          hoverVal: hoveredWard ? hoveredWard.albedo.toFixed(2) : null,
        };
      case 'elevation':
        return {
          title: 'SRTM Topographic Elevation',
          unit: 'Meters MSL',
          min: '8 m',
          mid: '24 m',
          max: '40 m',
          gradientClass: 'thermal-gradient-bar',
          labels: ['Coastal Lowland', 'Salsette Plain', 'Central Ridges'],
          hoverVal: hoveredWard ? `${hoveredWard.elev.toFixed(0)} m` : null,
        };
      default:
        return {
          title: 'Land Surface Temperature (LST)',
          unit: '°C (30m)',
          min: '29.0°C',
          mid: '33.8°C',
          max: '38.5°C',
          gradientClass: 'thermal-gradient-bar',
          labels: ['SGNP Cool Sink', 'Urban Mean', 'Extreme Core'],
          hoverVal: hoveredWard ? `${hoveredWard.meanLst.toFixed(1)}°C` : null,
        };
    }
  };

  const config = getLegendConfig(activeLayer);

  return (
    <div className="absolute bottom-3 left-3 z-[900] bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border-subtle)] p-2.5 rounded-md shadow-card text-xs w-64 pointer-events-auto">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="font-medium text-[var(--text-primary)] text-[11px] truncate">
          {config.title}
        </span>
        <span className="font-mono text-[10px] text-[var(--text-secondary)] shrink-0">
          {config.hoverVal ? (
            <strong className="text-[var(--accent-primary)]">{config.hoverVal}</strong>
          ) : (
            config.unit
          )}
        </span>
      </div>

      {/* Continuous Perceptual Colorbar */}
      <div
        className={`h-2 w-full rounded-sm ${config.gradientClass} border border-[var(--border-subtle)]`}
      />

      {/* Scale Ticks */}
      <div className="flex justify-between items-center text-[10px] font-mono text-[var(--text-secondary)] mt-1">
        <span>{config.min}</span>
        <span>{config.mid}</span>
        <span>{config.max}</span>
      </div>

      {/* Endpoint Captions */}
      <div className="flex justify-between items-center text-[9px] text-[var(--text-muted)] mt-0.5 pt-1 border-t border-[var(--border-subtle)]">
        <span>{config.labels[0]}</span>
        <span className="text-right">{config.labels[2]}</span>
      </div>
    </div>
  );
};
