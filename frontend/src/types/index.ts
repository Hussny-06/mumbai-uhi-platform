export type WorkspaceId = 'landing' | 'explorer' | 'studio' | 'science' | 'dossier';

export type LegacyPageId =
  | 'overview'
  | 'heatmap'
  | 'wards'
  | 'trends'
  | 'ml'
  | 'simulator'
  | 'reports'
  | 'system';

export type ActivePage = WorkspaceId | LegacyPageId;

export type ThemeMode = 'light' | 'dark';

export type MapRenderMode = 'grid' | 'choropleth' | 'combined';

export type ComparisonMode = 'split' | 'delta' | 'post';

export type MapLayerType =
  | 'lst'
  | 'ndvi'
  | 'ndbi'
  | 'mndwi'
  | 'albedo'
  | 'elevation'
  | 'wards'
  | 'satellite';

export interface ShapDriver {
  name: string;
  value: number;
  unit: string;
  isHeating: boolean;
}

export interface Ward {
  id: string;
  name: string;
  zone: string;
  lat: number;
  lon: number;
  area: number;
  popDensity: number;
  meanLst: number;
  uhi: number;
  ndvi: number;
  ndbi: number;
  mndwi: number;
  albedo: number;
  elev: number;
  distCoast: number;
  risk: 'Low' | 'Moderate' | 'High' | 'Extreme' | 'Critical' | 'Cooling Sink';
  driver: string;
  shapDrivers: ShapDriver[];
  polygon: [number, number][];
}

export interface ClimateAnnual {
  year: number;
  meanTemp: number;
  minTemp: number;
  maxTemp: number;
  rhMean: number;
  vpdMean: number;
  trendTemp: number;
}

export interface MonthlyClimatology {
  month: number;
  name: string;
  mean: number;
  min: number;
  max: number;
  std: number;
}

export interface MonthMatrixEntry {
  year: number;
  months: {
    month: number;
    mean: number;
    anomaly: number;
  }[];
}

export interface MannKendallData {
  zStatistic: number;
  pValue: number;
  sensSlopeYear: number;
  sensSlopeDecade: number;
  totalYears: number;
  period: string;
  trend: string;
  kendallS: number;
  significant: boolean;
}

export interface ModelMetrics {
  name: string;
  rmse: number;
  mae: number;
  r2: number;
  samples: {
    train: number;
    test: number;
  };
  spatialBufferKm: number;
}

export interface SimulationParams {
  wardId?: string;
  deltaNdvi: number;       // 0.0 to 0.50
  deltaAlbedo: number;     // 0.0 to 0.40
  deltaNdbi: number;       // 0.0 to -0.30
  customPolygon?: [number, number][];
  polygonAreaKm2?: number;
}

export interface SimulationResult {
  target: string;
  baselineLst: number;
  simulatedLst: number;
  coolingDelta: number;
  energyReductionKwhM2Yr: number;
  elapsedMs: number;
  shapDrivers: Record<string, number>;
  timestamp: string;
  numPixels?: number;
}

export interface PolicyScenario {
  id: string;
  name: string;
  description: string;
  deltaNdvi: number;
  deltaAlbedo: number;
  deltaNdbi: number;
  expectedCooling: number;
  expectedEnergySaving: number;
  targetFocus: string;
}

export interface GridCell {
  lat: number;
  lon: number;
  lst: number;
  uhi: number;
  ndvi: number;
  ndbi: number;
  mndwi: number;
  albedo: number;
  elevation: number;
  distCoast: number;
}

export interface SystemStatus {
  satelliteConnected: boolean;
  geeOperational: boolean;
  imdRecords: number;
  imdPeriod: string;
  fastApiConnected: boolean;
  fastApiLatencyMs: number;
  xgboostLoaded: boolean;
  spatialValidationPassed: boolean;
  automatedTestsPassed: number;
  automatedTestsTotal: number;
  cloudFilterThresholdPct: number;
  missingValuesPct: number;
}
