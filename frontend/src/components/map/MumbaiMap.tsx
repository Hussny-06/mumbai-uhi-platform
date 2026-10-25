import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { useUhiStore } from '../../stores/useUhiStore';
import { Ward, MapLayerType, MapRenderMode } from '../../types';
import { WARDS_DATA, THERMAL_GRID } from '../../data/staticDatasets';
import { getLayerColor, getDivergingDeltaColor, getInfernoColor } from '../../utils/colorScales';
import { MapLegend } from './MapLegend';
import { WardTooltip } from './WardTooltip';
import {
  RotateCcw,
  Edit3,
  Trash2,
  Globe,
  MoveHorizontal,
} from 'lucide-react';

interface MumbaiMapProps {
  interactivePolygonMode?: boolean;
  splitComparisonMode?: boolean;
  className?: string;
}

/**
 * Ray-casting point-in-polygon check for [lon, lat] rings.
 */
function isPointInPolygon(lon: number, lat: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    const intersect =
      yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export const MumbaiMap: React.FC<MumbaiMapProps> = ({
  interactivePolygonMode = false,
  splitComparisonMode = false,
  className = '',
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const wardLayersRef = useRef<{ [key: string]: L.Polygon }>({});
  const drawLayerRef = useRef<L.Polygon | null>(null);
  const drawMarkersRef = useRef<L.CircleMarker[]>([]);

  const {
    theme,
    activeLayer,
    setActiveLayer,
    mapRenderMode,
    setMapRenderMode,
    comparisonMode,
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
    setSplitSliderPos,
  } = useUhiStore();

  const [satelliteOverride, setSatelliteOverride] = useState<boolean>(false);
  const [tooltipData, setTooltipData] = useState<{ ward: Ward; x: number; y: number } | null>(null);
  const [drawCoords, setDrawCoords] = useState<[number, number][]>([]);
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);

  // Compute simulated cooling shift for a given [lon, lat] cell or ward
  const getSimulatedDeltaForPoint = useCallback(
    (lon: number, lat: number, wardId?: string): number => {
      if (!simulationResult) return 0;
      const delta = simulationResult.coolingDelta;
      if (customPolygon && customPolygon.length >= 3) {
        return isPointInPolygon(lon, lat, customPolygon) ? delta : 0;
      }
      if (selectedWard) {
        if (wardId) return wardId === selectedWard.id ? delta : 0;
        return isPointInPolygon(lon, lat, selectedWard.polygon) ? delta : 0;
      }
      return delta;
    },
    [simulationResult, customPolygon, selectedWard]
  );

  // Paint Fine-Grained Thermal/Biophysical Grid on 2D HTML5 Canvas Overlay
  const renderCanvasGrid = useCallback(() => {
    const map = mapInstanceRef.current;
    const canvas = canvasRef.current;
    if (!map || !canvas) return;

    const size = map.getSize();
    if (canvas.width !== size.x || canvas.height !== size.y) {
      canvas.width = size.x;
      canvas.height = size.y;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (mapRenderMode === 'choropleth') {
      return;
    }

    // Grid spacing in degrees: dLat ~ 0.0082, dLon ~ 0.0067
    const dLat = 0.0084;
    const dLon = 0.0069;
    const splitX = (splitSliderPos / 100) * canvas.width;
    const baseAlpha = mapRenderMode === 'grid' ? 0.78 : 0.56;

    THERMAL_GRID.forEach((cell) => {
      const nw = map.latLngToContainerPoint([cell.lat + dLat / 2, cell.lon - dLon / 2]);
      const se = map.latLngToContainerPoint([cell.lat - dLat / 2, cell.lon + dLon / 2]);
      const x = Math.floor(nw.x);
      const y = Math.floor(nw.y);
      const w = Math.max(2, Math.ceil(se.x - nw.x));
      const h = Math.max(2, Math.ceil(se.y - nw.y));

      if (x + w < 0 || y + h < 0 || x > canvas.width || y > canvas.height) return;

      const baseColor = getLayerColor(activeLayer, cell);

      if (!splitComparisonMode) {
        ctx.fillStyle = baseColor;
        ctx.globalAlpha = baseAlpha;
        ctx.fillRect(x, y, w, h);
        return;
      }

      const simDelta = getSimulatedDeltaForPoint(cell.lon, cell.lat);
      const postLst = cell.lst + simDelta;

      if (comparisonMode === 'delta') {
        ctx.fillStyle = getDivergingDeltaColor(simDelta, 2.0);
        ctx.globalAlpha = Math.abs(simDelta) > 0.01 ? 0.82 : 0.25;
        ctx.fillRect(x, y, w, h);
      } else if (comparisonMode === 'post') {
        ctx.fillStyle = getInfernoColor(postLst);
        ctx.globalAlpha = baseAlpha;
        ctx.fillRect(x, y, w, h);
      } else {
        // Split Curtain Mode: Left of splitX = Baseline, Right of splitX = Simulated Post-Intervention
        if (x + w <= splitX) {
          ctx.fillStyle = baseColor;
          ctx.globalAlpha = baseAlpha;
          ctx.fillRect(x, y, w, h);
        } else if (x >= splitX) {
          ctx.fillStyle = getInfernoColor(postLst);
          ctx.globalAlpha = baseAlpha;
          ctx.fillRect(x, y, w, h);
        } else {
          const leftW = splitX - x;
          ctx.fillStyle = baseColor;
          ctx.globalAlpha = baseAlpha;
          ctx.fillRect(x, y, leftW, h);

          ctx.fillStyle = getInfernoColor(postLst);
          ctx.globalAlpha = baseAlpha;
          ctx.fillRect(splitX, y, w - leftW, h);
        }
      }
    });

    ctx.globalAlpha = 1.0;
  }, [
    activeLayer,
    mapRenderMode,
    splitComparisonMode,
    comparisonMode,
    splitSliderPos,
    getSimulatedDeltaForPoint,
  ]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [19.076, 72.8777],
      zoom: 11,
      minZoom: 10,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Bind Canvas Redraw to Map Events
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    renderCanvasGrid();
    map.on('move zoom viewreset resize', renderCanvasGrid);
    return () => {
      map.off('move zoom viewreset resize', renderCanvasGrid);
    };
  }, [renderCanvasGrid]);

  // Auto-Sync Basemap Tiles with Daylight Paper (Light) / Carbon (Dark) + Satellite Override
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    if (satelliteOverride) {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: '&copy; Esri World Imagery',
        }
      ).addTo(map);
    } else if (theme === 'light') {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
          subdomains: 'abcd',
          maxZoom: 19,
          attribution: '&copy; CARTO Positron &copy; OpenStreetMap',
        }
      ).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          subdomains: 'abcd',
          maxZoom: 19,
          attribution: '&copy; CARTO Dark Matter &copy; OpenStreetMap',
        }
      ).addTo(map);
    }
  }, [theme, satelliteOverride]);

  // Render & Update BMC Ward Vector Boundaries & Choropleth
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(wardLayersRef.current).forEach((layer) => map.removeLayer(layer));
    wardLayersRef.current = {};

    const defaultStroke = theme === 'light' ? '#57554F' : '#6E6C66';

    WARDS_DATA.forEach((ward) => {
      if (!ward.polygon || ward.polygon.length === 0) return;

      const latLngs = ward.polygon.map(([lon, lat]) => [lat, lon] as [number, number]);
      const isSelected = selectedWard?.id === ward.id;
      const isHovered = hoveredWard?.id === ward.id;

      const simDelta = splitComparisonMode ? getSimulatedDeltaForPoint(ward.lon, ward.lat, ward.id) : 0;
      const fillColor =
        splitComparisonMode && comparisonMode === 'delta'
          ? getDivergingDeltaColor(simDelta, 2.0)
          : getLayerColor(activeLayer, {
              lst: ward.meanLst + (splitComparisonMode && comparisonMode === 'post' ? simDelta : 0),
              ndvi: ward.ndvi,
              ndbi: ward.ndbi,
              mndwi: ward.mndwi,
              albedo: ward.albedo,
              elevation: ward.elev,
            });

      const baseFillOpacity =
        mapRenderMode === 'grid'
          ? isSelected
            ? 0.18
            : isHovered
            ? 0.12
            : 0.02
          : mapRenderMode === 'combined'
          ? isSelected
            ? 0.45
            : isHovered
            ? 0.35
            : 0.22
          : isSelected
          ? 0.78
          : isHovered
          ? 0.72
          : 0.62;

      const poly = L.polygon(latLngs, {
        color: isSelected ? '#D94E34' : isHovered ? '#E55A40' : defaultStroke,
        weight: isSelected ? 2.5 : isHovered ? 2 : 1,
        opacity: isSelected || isHovered ? 1 : 0.75,
        fillColor,
        fillOpacity: baseFillOpacity,
      }).addTo(map);

      poly.on('mouseover', (e) => {
        setHoveredWard(ward);
        const pt = map.latLngToContainerPoint(e.latlng);
        setTooltipData({ ward, x: pt.x, y: pt.y });
      });

      poly.on('mousemove', (e) => {
        const pt = map.latLngToContainerPoint(e.latlng);
        setTooltipData({ ward, x: pt.x, y: pt.y });
      });

      poly.on('mouseout', () => {
        setHoveredWard(null);
        setTooltipData(null);
      });

      poly.on('click', () => {
        if (!isDrawingPolygon) {
          setSelectedWard(ward);
        }
      });

      poly.bindTooltip(ward.id, {
        permanent: true,
        direction: 'center',
        className: 'ward-map-label',
      });

      wardLayersRef.current[ward.id] = poly;
    });
  }, [
    theme,
    activeLayer,
    mapRenderMode,
    selectedWard,
    hoveredWard,
    splitComparisonMode,
    comparisonMode,
    isDrawingPolygon,
    getSimulatedDeltaForPoint,
    setHoveredWard,
    setSelectedWard,
  ]);

  // Fly to Selected Ward
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedWard) return;
    map.flyTo([selectedWard.lat, selectedWard.lon], 12.2, { duration: 0.75 });
  }, [selectedWard]);

  // Interactive Custom Polygon Drawing
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

      const marker = L.circleMarker([e.latlng.lat, e.latlng.lng], {
        radius: 4,
        color: '#D94E34',
        fillColor: '#D94E34',
        fillOpacity: 1,
      }).addTo(map);
      drawMarkersRef.current.push(marker);

      if (updated.length >= 3) {
        if (drawLayerRef.current) map.removeLayer(drawLayerRef.current);
        const latLngs = updated.map(([lon, lat]) => [lat, lon] as [number, number]);
        drawLayerRef.current = L.polygon(latLngs, {
          color: '#D94E34',
          weight: 2,
          dashArray: '5 3',
          fillColor: '#D94E34',
          fillOpacity: 0.22,
        }).addTo(map);

        setCustomPolygon(updated, 3.12);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isDrawingPolygon, drawCoords, setCustomPolygon]);

  // Split Curtain Drag Handler
  useEffect(() => {
    if (!isDraggingSplit) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitSliderPos(Math.max(8, Math.min(92, pct)));
    };

    const handleMouseUp = () => {
      setIsDraggingSplit(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSplit, setSplitSliderPos]);

  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([19.076, 72.8777], 11, { duration: 0.65 });
    setSelectedWard(null);
  };

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

  const layerPills: { id: MapLayerType; short: string }[] = [
    { id: 'lst', short: 'LST °C' },
    { id: 'ndvi', short: 'NDVI' },
    { id: 'ndbi', short: 'NDBI' },
    { id: 'albedo', short: 'Albedo' },
    { id: 'mndwi', short: 'MNDWI' },
    { id: 'elevation', short: 'Elev' },
  ];

  const renderModes: { id: MapRenderMode; label: string }[] = [
    { id: 'grid', label: 'Fine Grid' },
    { id: 'choropleth', label: 'Wards' },
    { id: 'combined', label: 'Combined' },
  ];

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full h-full overflow-hidden bg-[var(--bg-canvas)] select-none ${className}`}
    >
      {/* Base Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* 2D HTML5 Canvas Overlay for Fine-Grained 30m Surrogate Thermal Grid */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-[400]"
      />

      {/* Interactive Split-Curtain Divider (Active in Intervention Studio Split Mode) */}
      {splitComparisonMode && comparisonMode === 'split' && (
        <div
          style={{ left: `${splitSliderPos}%` }}
          className="absolute top-0 bottom-0 z-[850] -translate-x-1/2 flex flex-col items-center pointer-events-none"
        >
          {/* Vertical Curtain Hairline */}
          <div className="w-0.5 h-full bg-[var(--accent-primary)] shadow-md" />

          {/* Before / After Labels */}
          <div className="absolute top-14 flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider">
            <span className="-translate-x-12 px-2 py-0.5 rounded bg-[var(--bg-surface)]/90 border border-[var(--border-subtle)] text-[var(--text-secondary)] shadow-sm">
              Baseline
            </span>
            <span className="translate-x-12 px-2 py-0.5 rounded bg-[var(--bg-surface)]/90 border border-[#0D9488]/50 text-[#0D9488] font-semibold shadow-sm">
              Simulated
            </span>
          </div>

          {/* Draggable Handle */}
          <button
            type="button"
            onMouseDown={() => setIsDraggingSplit(true)}
            title="Drag to compare Baseline vs. Post-Intervention LST"
            className="pointer-events-auto absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--accent-primary)] text-[var(--text-primary)] flex items-center justify-center cursor-ew-resize shadow-floating hover:scale-105 transition-transform"
          >
            <MoveHorizontal className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          </button>
        </div>
      )}

      {/* TOP-LEFT: Floating Cartographic Layer & Render Mode Bar */}
      <div className="absolute top-3 left-3 z-[900] flex flex-wrap items-center gap-1.5 pointer-events-auto">
        {/* Layer Switcher Pill Group */}
        <div className="flex items-center bg-[var(--bg-surface)]/95 backdrop-blur-md p-0.5 rounded-md border border-[var(--border-subtle)] shadow-card">
          {layerPills.map((l) => {
            const isActive = activeLayer === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setActiveLayer(l.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                  isActive
                    ? 'bg-[var(--accent-primary)] text-white font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                {l.short}
              </button>
            );
          })}
        </div>

        {/* Multi-Resolution Render Mode Toggle (Fine Grid | Wards | Combined) */}
        <div className="hidden sm:flex items-center bg-[var(--bg-surface)]/95 backdrop-blur-md p-0.5 rounded-md border border-[var(--border-subtle)] shadow-card">
          {renderModes.map((m) => {
            const isActive = mapRenderMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMapRenderMode(m.id)}
                className={`px-2 py-1 rounded text-[11px] font-sans transition-colors ${
                  isActive
                    ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold border border-[var(--border-strong)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TOP-RIGHT: Satellite Toggle, Polygon Draw Tool, & Reset View */}
      <div className="absolute top-3 right-3 z-[900] flex items-center gap-1.5 pointer-events-auto">
        {interactivePolygonMode && (
          <div className="flex items-center gap-1 bg-[var(--bg-surface)]/95 backdrop-blur-md p-0.5 rounded-md border border-[var(--border-subtle)] shadow-card text-xs">
            <button
              onClick={() => {
                setIsDrawingPolygon(!isDrawingPolygon);
                if (isDrawingPolygon && drawCoords.length < 3) {
                  handleClearDrawing();
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                isDrawingPolygon
                  ? 'bg-[var(--accent-primary)] text-white font-semibold'
                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>{isDrawingPolygon ? 'Click Map Points...' : 'Draw Polygon'}</span>
            </button>

            {(drawCoords.length > 0 || customPolygon) && (
              <button
                onClick={handleClearDrawing}
                className="px-2 py-1 rounded text-[11px] text-[#D94E34] hover:bg-[var(--bg-elevated)] flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        )}

        {/* Satellite Basemap Override */}
        <button
          onClick={() => setSatelliteOverride(!satelliteOverride)}
          title="Toggle Satellite Optical Basemap"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[11px] font-mono shadow-card backdrop-blur-md transition-colors ${
            satelliteOverride
              ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] font-semibold'
              : 'bg-[var(--bg-surface)]/95 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-subtle)]'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Satellite</span>
        </button>

        {/* Reset Extent */}
        <button
          onClick={handleResetView}
          title="Reset Extent to Metropolitan Mumbai"
          className="p-1.5 rounded-md bg-[var(--bg-surface)]/95 hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-card backdrop-blur-md transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* BOTTOM-LEFT: Continuous Scientific Colorbar Legend */}
      <MapLegend showDeltaScale={splitComparisonMode && comparisonMode === 'delta'} />

      {/* BOTTOM-RIGHT (Left of Zoom Controls): Compact Citywide Summary Strip */}
      <div className="hidden md:flex items-center gap-2.5 absolute bottom-3 right-12 z-[900] bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border-subtle)] px-3 py-1.5 rounded-md shadow-card text-[11px] font-mono text-[var(--text-secondary)] pointer-events-none">
        <span>
          Mean: <strong className="text-[var(--text-primary)]">34.2°C</strong>
        </span>
        <span className="text-[var(--border-strong)]">·</span>
        <span>
          Peak: <strong className="text-[#D94E34]">37.3°C (M/E)</strong>
        </span>
        <span className="text-[var(--border-strong)]">·</span>
        <span>
          Sink: <strong className="text-[#0D9488]">29.5°C (R/N)</strong>
        </span>
      </div>

      {/* Floating Ward Hover Tooltip */}
      {tooltipData && (
        <WardTooltip ward={tooltipData.ward} x={tooltipData.x} y={tooltipData.y} />
      )}
    </div>
  );
};
