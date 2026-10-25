import { MapLayerType } from '../types';

/**
 * Linearly interpolate between two RGB color stops.
 */
function lerpColor(c1: [number, number, number], c2: [number, number, number], t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * clamped);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * clamped);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * clamped);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Interpolate across an array of evenly-spaced RGB stops.
 */
function interpolateStops(stops: [number, number, number][], t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (stops.length - 1);
  const idx = Math.min(Math.floor(scaled), stops.length - 2);
  const frac = scaled - idx;
  return lerpColor(stops[idx], stops[idx + 1], frac);
}

/**
 * Perceptual Inferno-inspired thermal scale for Land Surface Temperature (29.0°C – 38.5°C).
 */
const INFERNO_STOPS: [number, number, number][] = [
  [43, 11, 63],    // #2B0B3F (29.0°C Cool Sink / SGNP)
  [114, 31, 129],  // #721F81 (31.0°C Marine Buffered)
  [182, 54, 121],  // #B63679 (33.0°C Moderate Urban)
  [230, 81, 100],  // #E65164 (35.0°C Dense Urban)
  [251, 135, 97],  // #FB8761 (36.8°C High Thermal Stress)
  [251, 180, 26],  // #FBB41A (38.5°C Extreme Industrial/Slum Core)
];

export function getInfernoColor(lstCelsius: number, min = 29.0, max = 38.5): string {
  const t = (lstCelsius - min) / (max - min);
  return interpolateStops(INFERNO_STOPS, t);
}

/**
 * Perceptual YlGn botanical scale for NDVI (0.04 – 0.65).
 */
const NDVI_STOPS: [number, number, number][] = [
  [166, 97, 26],   // #A6611A (Bare / Impervious < 0.08)
  [223, 194, 125], // #DFC27D (Sparse Scrub ~ 0.18)
  [166, 217, 106], // #A6D96A (Moderate Urban Canopy ~ 0.32)
  [49, 163, 84],   // #31A354 (Wooded Parkland ~ 0.48)
  [0, 104, 55],    // #006837 (Dense Forest / SGNP > 0.60)
];

export function getNdviColor(ndvi: number, min = 0.04, max = 0.62): string {
  const t = (ndvi - min) / (max - min);
  return interpolateStops(NDVI_STOPS, t);
}

/**
 * Built-up density scale for NDBI (-0.15 – +0.60).
 */
const NDBI_STOPS: [number, number, number][] = [
  [43, 131, 186],  // #2B83BA (Vegetated / Low Built-up)
  [171, 221, 164], // #ABDDA4 (Low-Density Peri-urban)
  [244, 240, 232], // #F4F0E8 (Moderate Built-up)
  [253, 174, 97],  // #FDAE61 (High Built-up)
  [215, 25, 28],   // #D7191C (Extreme Impervious / Corrugated Metal)
];

export function getNdbiColor(ndbi: number, min = -0.15, max = 0.60): string {
  const t = (ndbi - min) / (max - min);
  return interpolateStops(NDBI_STOPS, t);
}

/**
 * Water / Moisture scale for MNDWI (-0.22 – +0.08).
 */
const MNDWI_STOPS: [number, number, number][] = [
  [166, 97, 26],   // #A6611A (Dry Impervious Core)
  [223, 194, 125], // #DFC27D (Low Surface Moisture)
  [128, 205, 193], // #80CDC1 (Intertidal / Riparian Buffer)
  [13, 148, 136],  // #0D9488 (Open Creek / Coastal Water)
];

export function getMndwiColor(mndwi: number, min = -0.22, max = 0.06): string {
  const t = (mndwi - min) / (max - min);
  return interpolateStops(MNDWI_STOPS, t);
}

/**
 * Broadband Surface Albedo scale (0.09 – 0.22).
 */
const ALBEDO_STOPS: [number, number, number][] = [
  [31, 34, 39],    // #1F2227 (Dark Asphalt / Tar)
  [95, 93, 87],    // #5F5D57 (Weathered Concrete)
  [168, 164, 155], // #A8A49B (Light Masonry)
  [246, 245, 240], // #F6F5F0 (High-SRI Cool Roof)
];

export function getAlbedoColor(albedo: number, min = 0.09, max = 0.20): string {
  const t = (albedo - min) / (max - min);
  return interpolateStops(ALBEDO_STOPS, t);
}

/**
 * SRTM Topographic Elevation scale (5m – 45m).
 */
const ELEVATION_STOPS: [number, number, number][] = [
  [38, 70, 83],    // #264653 (Low Coastal / Reclamation < 10m)
  [42, 157, 143],  // #2A9D8F (Salsette Plain 15–22m)
  [233, 196, 106], // #E9C46A (Upland Terraces 25–32m)
  [217, 78, 52],   // #D94E34 (Central / Northern Ridges > 35m)
];

export function getElevationColor(elev: number, min = 8, max = 40): string {
  const t = (elev - min) / (max - min);
  return interpolateStops(ELEVATION_STOPS, t);
}

/**
 * Diverging Teal-to-Vermilion scale for Thermal Anomalies, What-If Cooling Deltas, and TreeSHAP.
 * Negative values (-Cooling) -> Deep Teal (#0D9488)
 * Zero (Neutral) -> Warm Stone (#D6D3CD)
 * Positive values (+Heating) -> Terracotta Vermilion (#D94E34)
 */
const DIVERGING_STOPS: [number, number, number][] = [
  [13, 148, 136],  // #0D9488 Strong Cooling (-maxAbs)
  [45, 212, 191],  // #2DD4BF Moderate Cooling (-0.5 * maxAbs)
  [214, 211, 205], // #D6D3CD Neutral (0.0°C)
  [249, 115, 22],  // #F97316 Moderate Heating (+0.5 * maxAbs)
  [217, 78, 52],   // #D94E34 Strong Heating (+maxAbs)
];

export function getDivergingDeltaColor(deltaCelsius: number, maxAbs = 2.2): string {
  const normalized = (deltaCelsius + maxAbs) / (2 * maxAbs);
  return interpolateStops(DIVERGING_STOPS, normalized);
}

/**
 * Unified color resolver for any active map layer given a data record.
 */
export function getLayerColor(
  layer: MapLayerType,
  record: {
    lst: number;
    ndvi: number;
    ndbi: number;
    mndwi: number;
    albedo: number;
    elevation: number;
  }
): string {
  switch (layer) {
    case 'lst':
      return getInfernoColor(record.lst);
    case 'ndvi':
      return getNdviColor(record.ndvi);
    case 'ndbi':
      return getNdbiColor(record.ndbi);
    case 'mndwi':
      return getMndwiColor(record.mndwi);
    case 'albedo':
      return getAlbedoColor(record.albedo);
    case 'elevation':
      return getElevationColor(record.elevation);
    default:
      return getInfernoColor(record.lst);
  }
}

/**
 * Semantic badge styling for BMC Ward Heat Risk classifications.
 */
export function getRiskBadgeStyle(risk: string): {
  bg: string;
  text: string;
  border: string;
} {
  switch (risk) {
    case 'Critical':
    case 'Extreme':
      return {
        bg: 'rgba(217, 78, 52, 0.14)',
        text: '#D94E34',
        border: 'rgba(217, 78, 52, 0.40)',
      };
    case 'High':
      return {
        bg: 'rgba(249, 115, 22, 0.14)',
        text: '#E06D3B',
        border: 'rgba(249, 115, 22, 0.38)',
      };
    case 'Moderate':
    case 'Moderate-High':
      return {
        bg: 'rgba(217, 119, 6, 0.14)',
        text: '#D97706',
        border: 'rgba(217, 119, 6, 0.35)',
      };
    case 'Cooling Sink':
    case 'Low':
    default:
      return {
        bg: 'rgba(13, 148, 136, 0.14)',
        text: '#0D9488',
        border: 'rgba(13, 148, 136, 0.38)',
      };
  }
}
