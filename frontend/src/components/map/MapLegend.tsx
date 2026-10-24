import React from 'react';
import { useUhiStore } from '../../stores/useUhiStore';
import { MapLayerType } from '../../types';

export const MapLegend: React.FC = () => {
  const { activeLayer } = useUhiStore();

  const getLegendConfig = (layer: MapLayerType) => {
    switch (layer) {
      case 'lst':
        return {
          title: 'Land Surface Temperature (LST)',
          unit: '°C',
          min: '20°C',
          mid: '30°C',
          max: '38°C',
          gradientClass: 'thermal-gradient-bar',
          labels: ['Cool (Marine/Forest)', 'Moderate Urban', 'Critical Heat Island'],
        };
      case 'ndvi':
        return {
          title: 'Normalized Difference Veg Index (NDVI)',
          unit: 'Index (-1.0 to +1.0)',
          min: '0.00',
          mid: '0.35',
          max: '0.75',
          gradientClass: 'ndvi-gradient-bar',
          labels: ['Barren / Dense Built-up', 'Sparse Canopy', 'Dense Forest (SGNP)'],
        };
      case 'ndbi':
        return {
          title: 'Normalized Difference Built-up Index (NDBI)',
          unit: 'Index (-1.0 to +1.0)',
          min: '-0.30',
          mid: '0.15',
          max: '0.60',
          gradientClass: 'ndbi-gradient-bar',
          labels: ['Water / Green Sink', 'Suburban Paving', 'High Masonry / Tin Corridors'],
        };
      case 'mndwi':
        return {
          title: 'Modified Normalized Difference Water Index',
          unit: 'Index',
          min: '-0.40',
          mid: '0.00',
          max: '0.50',
          gradientClass: 'mndwi-gradient-bar',
          labels: ['Dry Land / Asphalt', 'Moist Mudflat', 'Open Water / Creek'],
        };
      case 'albedo':
        return {
          title: 'Broadband Surface Albedo',
          unit: 'Reflectance (0 to 1.0)',
          min: '0.08',
          mid: '0.14',
          max: '0.35',
          gradientClass: 'albedo-gradient-bar',
          labels: ['Low Reflectance Asphalt', 'Standard Concrete', 'Cool Roof / High SRI'],
        };
      case 'elevation':
        return {
          title: 'SRTM Digital Elevation Model',
          unit: 'Meters (MSL)',
          min: '0 m',
          mid: '25 m',
          max: '120 m',
          gradientClass: 'ndvi-gradient-bar',
          labels: ['Coastal Intertidal', 'Salsette Plain', 'SGNP Borivali Ridges'],
        };
      default:
        return {
          title: 'BMC Ward Boundaries & Risk',
          unit: 'Severity',
          min: 'Low Risk',
          mid: 'Moderate',
          max: 'Extreme',
          gradientClass: 'thermal-gradient-bar',
          labels: ['Cooling Sink / Marine', 'Residential', 'Critical Hotspot'],
        };
    }
  };

  const config = getLegendConfig(activeLayer);

  return (
    <div className="absolute bottom-5 left-5 z-20 bg-uhi-surface/90 backdrop-blur-md border border-uhi-border p-3 rounded shadow-xl text-xs max-w-xs pointer-events-auto">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <span className="font-semibold text-uhi-text uppercase tracking-wider text-[10px]">
          {config.title}
        </span>
        <span className="font-mono text-[10px] text-uhi-cyan">{config.unit}</span>
      </div>

      {/* Gradient Bar */}
      <div className={`h-2.5 w-full rounded-sm ${config.gradientClass} border border-uhi-border/50`} />

      {/* Scale Values */}
      <div className="flex justify-between items-center text-[10px] font-mono text-uhi-muted mt-1">
        <span>{config.min}</span>
        <span>{config.mid}</span>
        <span>{config.max}</span>
      </div>

      {/* Descriptions */}
      <div className="flex justify-between items-center text-[9px] text-uhi-muted/80 mt-1 border-t border-uhi-border/60 pt-1">
        <span>{config.labels[0]}</span>
        <span className="text-right">{config.labels[2]}</span>
      </div>
    </div>
  );
};
