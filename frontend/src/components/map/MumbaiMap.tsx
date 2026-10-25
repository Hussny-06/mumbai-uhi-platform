import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import { useUhiStore } from '../../stores/useUhiStore';
import { Ward, MapLayerType, MapRenderMode } from '../../types';
import { WARDS_DATA, THERMAL_GRID } from '../../data/staticDatasets';
import { getLayerColor, getDivergingDeltaColor, getInfernoColor } from '../../utils/colorScales';
import { api } from '../../services/api';
import { MapLegend } from './MapLegend';
import { WardTooltip } from './WardTooltip';
import {
  RotateCcw,
  Edit3,
  Trash2,
  Globe,
  MoveHorizontal,
  Maximize2,
  Minimize2,
  Plus,
  Minus,
} from 'lucide-react';

interface MumbaiMapProps {
  interactivePolygonMode?: boolean;
  splitComparisonMode?: boolean;
  className?: string;
}

interface SpatialAnchor {
  lat: number;
  lon: number;
  lst: number;
  ndvi: number;
  ndbi: number;
  albedo: number;
  mndwi: number;
  elevation: number;
  weight: number;
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
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const geeTileLayerRef = useRef<L.TileLayer | null>(null);
  const wardLayersRef = useRef<{ [key: string]: L.Polygon }>({});
  const drawLayerRef = useRef<L.Polygon | null>(null);
  const drawMarkersRef = useRef<L.CircleMarker[]>([]);

  const {
    wards,
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
    isBackendConnected,
  } = useUhiStore();

  const activeWards = wards.length > 0 ? wards : WARDS_DATA;

  const [satelliteOverride, setSatelliteOverride] = useState<boolean>(false);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [layerOpacity, setLayerOpacity] = useState<number>(0.72);
  const [geeTileUrl, setGeeTileUrl] = useState<string | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    ward: Ward;
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const [drawCoords, setDrawCoords] = useState<[number, number][]>([]);
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);

  // Build dense spatial anchor points from all 24 Ward centroids + polygon vertices + sub-ward thermal observations
  // Guarantees 100% gap-free coverage across all 24 wards (including Ward T, S, N, M/E, R/N)
  const spatialAnchors = useMemo<SpatialAnchor[]>(() => {
    const anchors: SpatialAnchor[] = [];

    // 1. Ward centroids & perimeter anchor points (ensures full coverage to every ward corner)
    activeWards.forEach((w) => {
      anchors.push({
        lat: w.lat,
        lon: w.lon,
        lst: w.meanLst,
        ndvi: w.ndvi,
        ndbi: w.ndbi,
        albedo: w.albedo,
        mndwi: w.mndwi,
        elevation: w.elev,
        weight: 2.2,
      });

      // Add every 2nd polygon vertex slightly pulled toward centroid so ward edges never have gaps
      w.polygon.forEach(([vLon, vLat], idx) => {
        if (idx % 2 === 0) {
          anchors.push({
            lat: vLat * 0.75 + w.lat * 0.25,
            lon: vLon * 0.75 + w.lon * 0.25,
            lst: w.meanLst,
            ndvi: w.ndvi,
            ndbi: w.ndbi,
            albedo: w.albedo,
            mndwi: w.mndwi,
            elevation: w.elev,
            weight: 1.1,
          });
        }
      });
    });

    // 2. Sub-ward 30m GEE sample points from THERMAL_GRID for local microclimate texture
    THERMAL_GRID.forEach((cell, idx) => {
      if (idx % 2 === 0) {
        anchors.push({
          lat: cell.lat,
          lon: cell.lon,
          lst: cell.lst,
          ndvi: cell.ndvi,
          ndbi: cell.ndbi,
          albedo: cell.albedo,
          mndwi: cell.mndwi,
          elevation: cell.elevation,
          weight: 0.9,
        });
      }
    });

    return anchors;
  }, [activeWards]);

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

  // Query live Google Earth Engine (uhi-mumbai-507613) tile URL from FastAPI when layer changes
  useEffect(() => {
    let cancelled = false;
    if (!isBackendConnected) {
      setGeeTileUrl(null);
      return;
    }
    api.getGeeTileUrl(activeLayer).then((url) => {
      if (!cancelled) {
        setGeeTileUrl(url);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeLayer, isBackendConnected]);

  // Attach/update live Google Earth Engine XYZ TileLayer if available and not in split comparison
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (geeTileLayerRef.current) {
      map.removeLayer(geeTileLayerRef.current);
      geeTileLayerRef.current = null;
    }

    if (geeTileUrl && !splitComparisonMode && mapRenderMode !== 'choropleth') {
      geeTileLayerRef.current = L.tileLayer(geeTileUrl, {
        maxZoom: 18,
        opacity: layerOpacity,
        zIndex: 350,
      }).addTo(map);
    }
  }, [geeTileUrl, splitComparisonMode, mapRenderMode, layerOpacity]);

  // Paint Continuous Gap-Free High-Resolution Spatial Field on 2D HTML5 Canvas, Clipped to 24 BMC Wards
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

    // Hide canvas in Wards-only choropleth mode or when live GEE tiles are active in non-split mode
    if (mapRenderMode === 'choropleth' || (geeTileUrl && !splitComparisonMode)) {
      return;
    }

    ctx.save();

    // 1. Clip strictly to the 24 BMC Ward polygons so zero pixels bleed into the sea/creek
    ctx.beginPath();
    activeWards.forEach((ward) => {
      if (!ward.polygon || ward.polygon.length < 3) return;
      ward.polygon.forEach(([lon, lat], idx) => {
        const pt = map.latLngToContainerPoint([lat, lon]);
        if (idx === 0) {
          ctx.moveTo(pt.x, pt.y);
        } else {
          ctx.lineTo(pt.x, pt.y);
        }
      });
      ctx.closePath();
    });
    ctx.clip();

    // 2. Compute screen-space bounding box of Metropolitan Mumbai
    const nwBound = map.latLngToContainerPoint([19.285, 72.770]);
    const seBound = map.latLngToContainerPoint([18.885, 73.010]);

    const startX = Math.max(0, Math.floor(nwBound.x));
    const endX = Math.min(canvas.width, Math.ceil(seBound.x));
    const startY = Math.max(0, Math.floor(nwBound.y));
    const endY = Math.min(canvas.height, Math.ceil(seBound.y));

    if (endX <= startX || endY <= startY) {
      ctx.restore();
      return;
    }

    // Adaptive sub-pixel resolution step (6px in Fine Grid / Combined for smooth 60fps continuous field)
    const step = 6;
    const splitX = (splitSliderPos / 100) * canvas.width;
    const spanX = seBound.x - nwBound.x || 1;
    const spanY = seBound.y - nwBound.y || 1;

    for (let py = startY; py < endY; py += step) {
      const lat = 19.285 - ((py + step * 0.5 - nwBound.y) / spanY) * (19.285 - 18.885);

      for (let px = startX; px < endX; px += step) {
        const lon = 72.770 + ((px + step * 0.5 - nwBound.x) / spanX) * (73.010 - 72.770);

        // Inverse-Distance-Weighted (IDW) interpolation over spatial anchors
        let wSum = 0;
        let vVal = 0;
        let lstVal = 0;

        for (let i = 0; i < spatialAnchors.length; i++) {
          const a = spatialAnchors[i];
          const dLat = lat - a.lat;
          const dLon = lon - a.lon;
          const distSq = dLat * dLat + dLon * dLon;

          // Local neighborhood cutoff (~6.5 km radius) for fast & sharp local gradients
          if (distSq > 0.0038) continue;

          const w = a.weight / (distSq + 0.000045);
          wSum += w;
          lstVal += a.lst * w;

          if (activeLayer === 'ndvi') vVal += a.ndvi * w;
          else if (activeLayer === 'ndbi') vVal += a.ndbi * w;
          else if (activeLayer === 'albedo') vVal += a.albedo * w;
          else if (activeLayer === 'mndwi') vVal += a.mndwi * w;
          else if (activeLayer === 'elevation') vVal += a.elevation * w;
        }

        if (wSum === 0) continue;

        const interpLst = lstVal / wSum;
        const interpMetric = activeLayer === 'lst' ? interpLst : vVal / wSum;

        const syntheticCell = {
          lst: interpLst,
          ndvi: activeLayer === 'ndvi' ? interpMetric : 0.18,
          ndbi: activeLayer === 'ndbi' ? interpMetric : 0.32,
          albedo: activeLayer === 'albedo' ? interpMetric : 0.14,
          mndwi: activeLayer === 'mndwi' ? interpMetric : -0.10,
          elevation: activeLayer === 'elevation' ? interpMetric : 14,
        };

        const baseColor = getLayerColor(activeLayer, syntheticCell);

        if (!splitComparisonMode) {
          ctx.fillStyle = baseColor;
          ctx.globalAlpha = layerOpacity;
          ctx.fillRect(px, py, step, step);
          continue;
        }

        const simDelta = getSimulatedDeltaForPoint(lon, lat);
        const postLst = interpLst + simDelta;

        if (comparisonMode === 'delta') {
          ctx.fillStyle = getDivergingDeltaColor(simDelta, 2.0);
          ctx.globalAlpha = Math.abs(simDelta) > 0.01 ? layerOpacity : 0.25;
          ctx.fillRect(px, py, step, step);
        } else if (comparisonMode === 'post') {
          ctx.fillStyle = getInfernoColor(postLst);
          ctx.globalAlpha = layerOpacity;
          ctx.fillRect(px, py, step, step);
        } else {
          // Split Curtain Mode
          if (px + step <= splitX) {
            ctx.fillStyle = baseColor;
            ctx.globalAlpha = layerOpacity;
            ctx.fillRect(px, py, step, step);
          } else if (px >= splitX) {
            ctx.fillStyle = getInfernoColor(postLst);
            ctx.globalAlpha = layerOpacity;
            ctx.fillRect(px, py, step, step);
          } else {
            const leftW = splitX - px;
            ctx.fillStyle = baseColor;
            ctx.globalAlpha = layerOpacity;
            ctx.fillRect(px, py, leftW, step);

            ctx.fillStyle = getInfernoColor(postLst);
            ctx.globalAlpha = layerOpacity;
            ctx.fillRect(splitX, py, step - leftW, step);
          }
        }
      }
    }

    ctx.restore();
  }, [
    activeWards,
    spatialAnchors,
    activeLayer,
    mapRenderMode,
    layerOpacity,
    geeTileUrl,
    splitComparisonMode,
    comparisonMode,
    splitSliderPos,
    getSimulatedDeltaForPoint,
  ]);

  // Initialize Map (Zero "Leaflet" attribution watermark)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [19.076, 72.8777],
      zoom: 11,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
    });

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

  // Handle Maximize / Escape key and invalidateSize() so tiles & canvas resize smoothly
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map) {
      const timer = setTimeout(() => {
        map.invalidateSize();
        renderCanvasGrid();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isMaximized, renderCanvasGrid]);

  useEffect(() => {
    if (!isMaximized) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMaximized(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMaximized]);

  // Google Maps Satellite Hybrid & Terrain/Roadmap Basemaps
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
      baseTileLayerRef.current = null;
    }

    if (satelliteOverride) {
      // Google Satellite Hybrid (High-Res Optical Imagery + Vector Road/Locality Labels)
      baseTileLayerRef.current = L.tileLayer(
        'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        {
          maxZoom: 20,
        }
      ).addTo(map);
    } else if (theme === 'light') {
      // Google Terrain / Clean Cartographic Roadmap
      baseTileLayerRef.current = L.tileLayer(
        'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
        {
          maxZoom: 19,
        }
      ).addTo(map);
    } else {
      // Carbon Workbench Dark Basemap
      baseTileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 16,
        }
      ).addTo(map);
    }
  }, [theme, satelliteOverride]);

  // Render & Update 24 BMC Ward Vector Boundaries & Choropleth
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(wardLayersRef.current).forEach((layer) => map.removeLayer(layer));
    wardLayersRef.current = {};

    const defaultStroke = satelliteOverride
      ? 'rgba(255, 255, 255, 0.72)'
      : theme === 'light'
      ? '#2C2B29'
      : '#A09D96';

    activeWards.forEach((ward) => {
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

      // In Combined and Fine Grid modes, the continuous canvas provides the fill (no muddy double-tinting!)
      const polyFillOpacity =
        mapRenderMode === 'choropleth'
          ? isSelected
            ? Math.min(0.92, layerOpacity + 0.12)
            : isHovered
            ? Math.min(0.88, layerOpacity + 0.06)
            : layerOpacity
          : isSelected
          ? 0.12
          : isHovered
          ? 0.06
          : 0.0;

      const strokeWeight =
        isSelected
          ? 2.6
          : isHovered
          ? 2.2
          : mapRenderMode === 'grid'
          ? 0.45
          : 1.25;

      const strokeOpacity =
        isSelected || isHovered
          ? 1.0
          : mapRenderMode === 'grid'
          ? 0.35
          : 0.85;

      const poly = L.polygon(latLngs, {
        color: isSelected ? '#D94E34' : isHovered ? '#E55A40' : defaultStroke,
        weight: strokeWeight,
        opacity: strokeOpacity,
        fillColor,
        fillOpacity: polyFillOpacity,
      }).addTo(map);

      poly.on('mouseover', (e) => {
        setHoveredWard(ward);
        const pt = map.latLngToContainerPoint(e.latlng);
        const size = map.getSize();
        setTooltipData({ ward, x: pt.x, y: pt.y, w: size.x, h: size.y });
      });

      poly.on('mousemove', (e) => {
        const pt = map.latLngToContainerPoint(e.latlng);
        const size = map.getSize();
        setTooltipData({ ward, x: pt.x, y: pt.y, w: size.x, h: size.y });
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

      if (mapRenderMode !== 'grid') {
        poly.bindTooltip(ward.id, {
          permanent: true,
          direction: 'center',
          className: 'ward-map-label',
        });
      }

      wardLayersRef.current[ward.id] = poly;
    });
  }, [
    activeWards,
    theme,
    satelliteOverride,
    activeLayer,
    mapRenderMode,
    layerOpacity,
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

  const handleZoom = (delta: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setZoom(map.getZoom() + delta);
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
      className={`${
        isMaximized
          ? 'fixed inset-x-0 top-12 bottom-0 z-[1200] w-screen h-[calc(100vh-3rem)]'
          : `relative w-full h-full ${className}`
      } overflow-hidden bg-[var(--bg-canvas)] select-none transition-all`}
    >
      {/* Base Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* 2D HTML5 Canvas Overlay for Continuous Gap-Free 30m Surrogate Field */}
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
            <span
              style={{ backgroundColor: 'var(--bg-surface)' }}
              className="-translate-x-12 px-2 py-0.5 rounded border border-[var(--border-subtle)] text-[var(--text-secondary)] shadow-sm"
            >
              Baseline
            </span>
            <span
              style={{ backgroundColor: 'var(--bg-surface)' }}
              className="translate-x-12 px-2 py-0.5 rounded border border-[#0D9488]/50 text-[#0D9488] font-semibold shadow-sm"
            >
              Simulated
            </span>
          </div>

          {/* Draggable Handle */}
          <button
            type="button"
            onMouseDown={() => setIsDraggingSplit(true)}
            title="Drag to compare Baseline vs. Post-Intervention LST"
            style={{ backgroundColor: 'var(--bg-surface)' }}
            className="pointer-events-auto absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 border-[var(--accent-primary)] text-[var(--text-primary)] flex items-center justify-center cursor-ew-resize shadow-floating hover:scale-105 transition-transform"
          >
            <MoveHorizontal className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          </button>
        </div>
      )}

      {/* TOP-LEFT: Floating Cartographic Layer, Render Mode, & Opacity Bar */}
      <div className="absolute top-3 left-3 z-[900] flex flex-wrap items-center gap-1.5 pointer-events-auto">
        {/* Layer Switcher Pill Group */}
        <div
          style={{ backgroundColor: 'var(--bg-surface)' }}
          className="flex items-center p-0.5 rounded-md border border-[var(--border-subtle)] shadow-card"
        >
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
        <div
          style={{ backgroundColor: 'var(--bg-surface)' }}
          className="hidden sm:flex items-center p-0.5 rounded-md border border-[var(--border-subtle)] shadow-card"
        >
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

        {/* Compact Layer Opacity Slider */}
        <div
          style={{ backgroundColor: 'var(--bg-surface)' }}
          className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md border border-[var(--border-subtle)] shadow-card text-[10px] font-mono text-[var(--text-secondary)]"
          title="Adjust Thermal / Spectral Layer Opacity over Basemap"
        >
          <span>Opacity</span>
          <input
            type="range"
            min={0.2}
            max={0.95}
            step={0.05}
            value={layerOpacity}
            onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
            aria-label="Layer Opacity"
            className="w-16 h-1 accent-[var(--accent-primary)] cursor-pointer"
          />
          <span className="w-7 text-right text-[var(--text-primary)]">
            {Math.round(layerOpacity * 100)}%
          </span>
        </div>
      </div>

      {/* TOP-RIGHT: Satellite Toggle, Polygon Draw Tool, & Maximize Button */}
      <div className="absolute top-3 right-3 z-[900] flex items-center gap-1.5 pointer-events-auto">
        {interactivePolygonMode && (
          <div
            style={{ backgroundColor: 'var(--bg-surface)' }}
            className="flex items-center gap-1 p-0.5 rounded-md border border-[var(--border-subtle)] shadow-card text-xs"
          >
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

        {/* Google Satellite Hybrid Toggle */}
        <button
          onClick={() => setSatelliteOverride(!satelliteOverride)}
          title="Toggle Google Satellite Hybrid Imagery"
          style={satelliteOverride ? undefined : { backgroundColor: 'var(--bg-surface)' }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[11px] font-mono shadow-card transition-colors ${
            satelliteOverride
              ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] font-semibold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-subtle)]'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Satellite</span>
        </button>

        {/* Maximize / Restore Map Workspace Button (Replaces Top-Right Reload Button) */}
        <button
          onClick={() => setIsMaximized((prev) => !prev)}
          aria-label={isMaximized ? 'Restore Split Workspace View' : 'Maximize Map'}
          title={isMaximized ? 'Restore Split Workspace View (Esc)' : 'Maximize Map Full Workspace'}
          style={isMaximized ? undefined : { backgroundColor: 'var(--bg-surface)' }}
          className={`p-1.5 rounded-md border shadow-card transition-colors ${
            isMaximized
              ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
              : 'hover:bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          {isMaximized ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* BOTTOM-LEFT: Continuous Scientific Colorbar Legend */}
      <MapLegend showDeltaScale={splitComparisonMode && comparisonMode === 'delta'} />

      {/* BOTTOM-RIGHT: Custom Workbench Zoom + Reset View Control Cluster */}
      <div
        style={{ backgroundColor: 'var(--bg-surface)' }}
        className="absolute bottom-7 right-3 z-[900] flex flex-col rounded-md border border-[var(--border-subtle)] shadow-card overflow-hidden pointer-events-auto"
      >
        <button
          onClick={() => handleZoom(1)}
          aria-label="Zoom In"
          title="Zoom In"
          className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleZoom(-1)}
          aria-label="Zoom Out"
          title="Zoom Out"
          className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetView}
          aria-label="Reset Mumbai Viewport"
          title="Reset Extent to Metropolitan Mumbai"
          className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* BOTTOM-RIGHT (Left of Zoom Controls): Compact Citywide Summary Strip */}
      <div
        style={{ backgroundColor: 'var(--bg-surface)' }}
        className="hidden md:flex items-center gap-2.5 absolute bottom-7 right-12 z-[900] border border-[var(--border-subtle)] px-3 py-1.5 rounded-md shadow-card text-[11px] font-mono text-[var(--text-secondary)] pointer-events-none"
      >
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

      {/* BOTTOM-RIGHT CORNER: Discreet Google Cloud / GEE Attribution Tag */}
      <div
        style={{ backgroundColor: 'var(--bg-surface)' }}
        className="absolute bottom-1 right-3 z-[850] px-2 py-0.5 rounded border border-[var(--border-subtle)] text-[9px] font-mono text-[var(--text-muted)] pointer-events-none"
      >
        {geeTileUrl ? 'GEE Live Stream · ' : ''}Google Satellite / GEE · uhi-mumbai-507613
      </div>

      {/* Floating Ward Hover Tooltip (z-[1500], 100% Opaque Surface) */}
      {tooltipData && (
        <WardTooltip
          ward={tooltipData.ward}
          x={tooltipData.x}
          y={tooltipData.y}
          containerWidth={tooltipData.w}
          containerHeight={tooltipData.h}
        />
      )}
    </div>
  );
};
