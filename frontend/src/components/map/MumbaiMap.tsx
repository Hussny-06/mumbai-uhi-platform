import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useUhiStore } from '../../stores/useUhiStore';
import { Ward, MapLayerType } from '../../types';
import { WARDS_DATA } from '../../data/staticDatasets';
import { MapLegend } from './MapLegend';
import { WardTooltip } from './WardTooltip';
import { 
  Layers, 
  Map as MapIcon, 
  Crosshair, 
  RotateCcw, 
  Edit3, 
  Trash2, 
  Check, 
  Columns 
} from 'lucide-react';

interface MumbaiMapProps {
  interactivePolygonMode?: boolean;
  splitComparisonMode?: boolean;
  className?: string;
}

export const MumbaiMap: React.FC<MumbaiMapProps> = ({
  interactivePolygonMode = false,
  splitComparisonMode = false,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const wardLayersRef = useRef<{ [key: string]: L.Polygon }>({});
  const drawLayerRef = useRef<L.Polygon | null>(null);
  const drawMarkersRef = useRef<L.CircleMarker[]>([]);

  const {
    activeLayer,
    setActiveLayer,
    selectedWard,
    setSelectedWard,
    hoveredWard,
    setHoveredWard,
    customPolygon,
    setCustomPolygon,
    clearPolygon,
    isDrawingPolygon,
    setIsDrawingPolygon,
    simulationResult,
    splitSliderPos,
  } = useUhiStore();

  const [basemapType, setBasemapType] = useState<'dark' | 'satellite'>('dark');
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);
  const [tooltipData, setTooltipData] = useState<{ ward: Ward; x: number; y: number } | null>(null);
  const [drawCoords, setDrawCoords] = useState<[number, number][]>([]);

  // Function to compute fill color based on active layer & simulation
  const getWardColor = (ward: Ward, layer: MapLayerType, isIntervention = false): string => {
    let lst = ward.meanLst;
    if (isIntervention && simulationResult && (selectedWard?.id === ward.id || !selectedWard)) {
      lst += simulationResult.coolingDelta;
    }

    if (layer === 'lst') {
      // Thermal Scale: 29°C (Cool SGNP) -> 37.5°C (Extreme Dharavi/Govandi)
      const t = Math.min(1, Math.max(0, (lst - 29.0) / 8.5));
      if (t < 0.20) return '#3b0d60'; // Deep cool purple (SGNP)
      if (t < 0.40) return '#8c105b'; // Moderate purple-red
      if (t < 0.60) return '#d9383a'; // Thermal red
      if (t < 0.80) return '#f47721'; // Hot orange
      return '#fbb938';              // Critical yellow (Govandi / Dharavi)
    }

    if (layer === 'ndvi') {
      // Green scale: 0.05 (bare/slum) -> 0.65 (dense SGNP forest)
      const n = Math.min(1, Math.max(0, (ward.ndvi - 0.05) / 0.60));
      if (n < 0.20) return '#8c510a';
      if (n < 0.45) return '#dfc27d';
      if (n < 0.70) return '#80cdc1';
      return '#01665e';
    }

    if (layer === 'ndbi') {
      // Built-up scale: -0.15 (forest) -> 0.55 (dense built)
      const b = Math.min(1, Math.max(0, (ward.ndbi + 0.15) / 0.70));
      if (b < 0.25) return '#2b83ba';
      if (b < 0.50) return '#abdda4';
      if (b < 0.75) return '#fdae61';
      return '#d7191c';
    }

    if (layer === 'mndwi') {
      return ward.mndwi > 0 ? '#018571' : '#a6611a';
    }

    if (layer === 'albedo') {
      const a = Math.round(50 + (ward.albedo / 0.25) * 180);
      return `rgb(${a}, ${a}, ${a})`;
    }

    if (layer === 'elevation') {
      const e = Math.min(1, Math.max(0, ward.elev / 50));
      return `rgb(30, ${Math.round(80 + e * 120)}, ${Math.round(60 + e * 40)})`;
    }

    // Default wards view
    return '#17283E';
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Greater Mumbai: [19.0760, 72.8777]
    const map = L.map(mapContainerRef.current, {
      center: [19.0760, 72.8777],
      zoom: 11,
      minZoom: 10,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: true,
    });

    // Add CartoDB Dark Matter tile layer
    const darkTiles = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        subdomains: 'abcd',
        maxZoom: 19,
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      }
    ).addTo(map);

    // Zoom control in top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Basemap Switch (Dark GIS vs Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (basemapType === 'satellite') {
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Tiles &copy; Esri, Earthstar Geographics',
        }
      ).addTo(map);
    } else {
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          subdomains: 'abcd',
          maxZoom: 19,
          attribution: '&copy; CARTO &copy; OpenStreetMap',
        }
      ).addTo(map);
    }
  }, [basemapType]);

  // Render & Update Ward Polygons
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old ward polygons
    Object.values(wardLayersRef.current).forEach((layer) => map.removeLayer(layer));
    wardLayersRef.current = {};

    WARDS_DATA.forEach((ward) => {
      if (!ward.polygon || ward.polygon.length === 0) return;

      // Leaflet expects [lat, lon]
      const latLngs = ward.polygon.map(([lon, lat]) => [lat, lon] as [number, number]);

      const isSelected = selectedWard?.id === ward.id;
      const isHovered = hoveredWard?.id === ward.id;
      const fillColor = getWardColor(ward, activeLayer);

      const poly = L.polygon(latLngs, {
        color: isSelected ? '#00D2FF' : isHovered ? '#38BDF8' : '#2A3F58',
        weight: isSelected ? 3 : isHovered ? 2 : 1,
        opacity: isSelected || isHovered ? 1 : 0.7,
        fillColor: fillColor,
        fillOpacity: isSelected ? 0.75 : isHovered ? 0.7 : 0.55,
        dashArray: isSelected ? '4 2' : undefined,
      }).addTo(map);

      // Mouse events
      poly.on('mouseover', (e) => {
        setHoveredWard(ward);
        const containerPoint = map.latLngToContainerPoint(e.latlng);
        setTooltipData({ ward, x: containerPoint.x, y: containerPoint.y });
        poly.setStyle({
          weight: 2.5,
          color: '#00D2FF',
          fillOpacity: 0.75,
        });
      });

      poly.on('mousemove', (e) => {
        const containerPoint = map.latLngToContainerPoint(e.latlng);
        setTooltipData({ ward, x: containerPoint.x, y: containerPoint.y });
      });

      poly.on('mouseout', () => {
        setHoveredWard(null);
        setTooltipData(null);
        if (selectedWard?.id !== ward.id) {
          poly.setStyle({
            weight: 1,
            color: '#2A3F58',
            fillOpacity: 0.55,
          });
        }
      });

      poly.on('click', () => {
        setSelectedWard(ward);
      });

      // Centroid permanent label tooltip
      poly.bindTooltip(ward.id, {
        permanent: true,
        direction: 'center',
        className: 'ward-map-label',
      });

      wardLayersRef.current[ward.id] = poly;
    });
  }, [activeLayer, selectedWard, hoveredWard, simulationResult]);

  // Handle Pan to Selected Ward
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedWard) return;
    map.flyTo([selectedWard.lat, selectedWard.lon], 12.5, { duration: 1.0 });
  }, [selectedWard]);

  // Handle Interactive Polygon Drawing Click
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!isDrawingPolygon) {
      map.getContainer().style.cursor = '';
      return;
    }

    map.getContainer().style.cursor = 'crosshair';

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const newPt: [number, number] = [e.latlng.lng, e.latlng.lat];
      const updated = [...drawCoords, newPt];
      setDrawCoords(updated);

      // Render marker on click
      const marker = L.circleMarker([e.latlng.lat, e.latlng.lng], {
        radius: 4,
        color: '#10B981',
        fillColor: '#10B981',
        fillOpacity: 1,
      }).addTo(map);
      drawMarkersRef.current.push(marker);

      if (updated.length >= 3) {
        // Redraw active polygon
        if (drawLayerRef.current) map.removeLayer(drawLayerRef.current);
        const latLngs = updated.map(([lon, lat]) => [lat, lon] as [number, number]);
        drawLayerRef.current = L.polygon(latLngs, {
          color: '#10B981',
          weight: 2.5,
          dashArray: '6 4',
          fillColor: '#10B981',
          fillOpacity: 0.3,
        }).addTo(map);

        setCustomPolygon(updated, 3.12);
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [isDrawingPolygon, drawCoords]);

  // Reset Map View
  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([19.0760, 72.8777], 11, { duration: 0.8 });
    setSelectedWard(null);
  };

  // Clear drawn polygon
  const handleClearDrawing = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (drawLayerRef.current) {
      map.removeLayer(drawLayerRef.current);
      drawLayerRef.current = null;
    }
    drawMarkersRef.current.forEach((m) => map.removeLayer(m));
    drawMarkersRef.current = [];
    setDrawCoords([]);
    clearPolygon();
  };

  const layersList: { id: MapLayerType; label: string }[] = [
    { id: 'lst', label: 'Land Surface Temp (LST)' },
    { id: 'ndvi', label: 'NDVI / Vegetation' },
    { id: 'ndbi', label: 'NDBI / Built-up' },
    { id: 'mndwi', label: 'MNDWI / Water' },
    { id: 'albedo', label: 'Albedo / Reflectance' },
    { id: 'elevation', label: 'Elevation (SRTM)' },
    { id: 'wards', label: 'BMC Ward Boundaries' },
  ];

  return (
    <div className={`relative w-full h-full overflow-hidden bg-uhi-bg ${className}`}>
      {/* Real Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Simplified, Clean Floating Controls (Top Right) */}
      <div className="absolute top-4 right-14 z-[1000] flex items-center gap-2">
        {/* Layer Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-uhi-surface/90 hover:bg-uhi-surface2 border border-uhi-border text-xs text-uhi-text shadow-lg backdrop-blur-md transition-all font-medium"
          >
            <Layers className="w-3.5 h-3.5 text-uhi-cyan" />
            <span>Layer: <strong className="text-uhi-cyan uppercase">{activeLayer}</strong></span>
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 top-9 w-56 bg-uhi-surface border border-uhi-border rounded shadow-2xl p-1.5 z-[1001] animate-in fade-in duration-100">
              <div className="text-[10px] uppercase font-mono tracking-wider text-uhi-muted px-2 py-1">
                Select Active Raster
              </div>
              <div className="space-y-0.5">
                {layersList.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      setActiveLayer(l.id);
                      setShowLayerMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                      activeLayer === l.id
                        ? 'bg-uhi-surface3 text-uhi-cyan font-bold'
                        : 'text-uhi-text hover:bg-uhi-surface2'
                    }`}
                  >
                    <span>{l.label}</span>
                    {activeLayer === l.id && <span className="text-uhi-cyan">✓</span>}
                  </button>
                ))}
              </div>

              {/* Basemap Satellite Toggle */}
              <div className="pt-1.5 mt-1.5 border-t border-uhi-border">
                <button
                  onClick={() => setBasemapType(basemapType === 'dark' ? 'satellite' : 'dark')}
                  className="w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between text-uhi-muted hover:text-uhi-text hover:bg-uhi-surface2 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <MapIcon className="w-3.5 h-3.5 text-emerald-400" />
                    Satellite Basemap
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold">
                    {basemapType === 'satellite' ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reset & Center Button */}
        <button
          onClick={handleResetView}
          title="Reset View to Mumbai"
          className="p-1.5 rounded bg-uhi-surface/90 hover:bg-uhi-surface2 border border-uhi-border text-uhi-muted hover:text-uhi-text shadow-lg backdrop-blur-md transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Clean Drawing Bar (Only if in What-If Simulator mode) */}
      {interactivePolygonMode && (
        <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-uhi-surface/90 backdrop-blur-md border border-uhi-border px-3 py-1.5 rounded shadow-xl text-xs">
          <button
            onClick={() => {
              setIsDrawingPolygon(!isDrawingPolygon);
              if (isDrawingPolygon && drawCoords.length < 3) {
                handleClearDrawing();
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors font-medium ${
              isDrawingPolygon
                ? 'bg-uhi-green text-uhi-bg font-bold'
                : 'text-uhi-text hover:bg-uhi-surface2'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isDrawingPolygon ? 'Click to Add Points' : 'Draw Polygon'}</span>
          </button>

          {drawCoords.length > 0 && (
            <button
              onClick={handleClearDrawing}
              className="text-red-400 hover:text-red-300 px-1.5 py-1 rounded transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}

          {customPolygon && (
            <span className="text-emerald-400 font-mono text-[11px] border-l border-uhi-border pl-2">
              Area: 3.12 km²
            </span>
          )}
        </div>
      )}

      {/* Floating Dynamic Legend */}
      <MapLegend />

      {/* Ward Tooltip */}
      {tooltipData && (
        <WardTooltip
          ward={tooltipData.ward}
          x={tooltipData.x}
          y={tooltipData.y}
        />
      )}
    </div>
  );
};
