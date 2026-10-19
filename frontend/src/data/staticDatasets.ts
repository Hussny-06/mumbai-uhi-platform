import { Ward, ClimateAnnual, MonthlyClimatology, MonthMatrixEntry, MannKendallData, ModelMetrics, PolicyScenario, GridCell, SystemStatus } from '../types';
import rawWards from './wardsData.json';
import rawClimate from './climateData.json';
import rawGrid from './thermalGrid.json';

export const WARDS_DATA: Ward[] = rawWards as Ward[];

export const CLIMATE_ANNUAL: ClimateAnnual[] = rawClimate.annual as ClimateAnnual[];

export const CLIMATE_MONTHLY_MATRIX: MonthMatrixEntry[] = rawClimate.monthlyMatrix as MonthMatrixEntry[];

export const CLIMATE_CLIMATOLOGY: MonthlyClimatology[] = rawClimate.climatology as MonthlyClimatology[];

export const MANN_KENDALL_METRICS: MannKendallData = rawClimate.mannKendall as MannKendallData;

export const THERMAL_GRID: GridCell[] = rawGrid as GridCell[];

export const MODEL_METRICS: {
  xgboost: ModelMetrics;
  randomForest: ModelMetrics;
  acceptance: { rmseMax: number; r2Min: number; spatialBufferKm: number };
} = {
  xgboost: {
    name: 'XGBoost (Spatial Block K-Fold)',
    rmse: 2.05,
    mae: 1.63,
    r2: 0.445,
    samples: {
      train: 2306,
      test: 137,
    },
    spatialBufferKm: 1.2,
  },
  randomForest: {
    name: 'Random Forest (Benchmark)',
    rmse: 2.21,
    mae: 1.75,
    r2: 0.359,
    samples: {
      train: 2306,
      test: 137,
    },
    spatialBufferKm: 1.2,
  },
  acceptance: {
    rmseMax: 1.5,
    r2Min: 0.85,
    spatialBufferKm: 1.2,
  },
};

export const CITY_WIDE_SHAP_DRIVERS = [
  { name: 'NDBI (Built-up Density)', importance: 0.383, deltaT: '+1.41°C', isPositive: true },
  { name: 'Fractional Veg Cover (F_v)', importance: 0.151, deltaT: '-0.56°C', isPositive: false },
  { name: 'NDVI (Canopy Density)', importance: 0.070, deltaT: '-0.42°C', isPositive: false },
  { name: 'Relative Humidity (%)', importance: 0.060, deltaT: '-0.28°C', isPositive: false },
  { name: 'Broadband Albedo', importance: 0.053, deltaT: '-0.38°C', isPositive: false },
  { name: 'Surface Emissivity', importance: 0.051, deltaT: '-0.22°C', isPositive: false },
  { name: 'Distance to Coast (km)', importance: 0.035, deltaT: '-0.36°C', isPositive: false },
  { name: 'VPD (Vapor Pressure Deficit)', importance: 0.033, deltaT: '+0.19°C', isPositive: true },
];

export const PRESET_SCENARIOS: PolicyScenario[] = [
  {
    id: 'urban_greening',
    name: 'Urban Greening',
    description: 'Intensive tree planting, vertical gardens, and street median canopy enhancement',
    deltaNdvi: 0.25,
    deltaAlbedo: 0.0,
    deltaNdbi: -0.05,
    expectedCooling: -0.65,
    expectedEnergySaving: 3.13,
    targetFocus: 'Dharavi, Govandi, Kurla heat islands',
  },
  {
    id: 'cool_roofs',
    name: 'Cool Roof Campaign',
    description: 'High-solar-reflectance (SRI > 80) white elastomer coating on tin and concrete roofs',
    deltaNdvi: 0.0,
    deltaAlbedo: 0.30,
    deltaNdbi: 0.0,
    expectedCooling: -0.31,
    expectedEnergySaving: 1.48,
    targetFocus: 'Industrial sheds, slum settlements, commercial terraces',
  },
  {
    id: 'combined_mitigation',
    name: 'Greening + Cool Roofs',
    description: 'Synergistic deployment of reflective building envelopes with native canopy infill',
    deltaNdvi: 0.20,
    deltaAlbedo: 0.20,
    deltaNdbi: -0.10,
    expectedCooling: -0.83,
    expectedEnergySaving: 3.97,
    targetFocus: 'High-density mixed residential & industrial wards',
  },
  {
    id: 'urban_park',
    name: 'New Urban Park',
    description: 'Conversion of vacant brownfield or reclaimed asphalt into 5+ hectare public botanical park',
    deltaNdvi: 0.40,
    deltaAlbedo: 0.05,
    deltaNdbi: -0.25,
    expectedCooling: -0.94,
    expectedEnergySaving: 4.50,
    targetFocus: 'Decommissioned mills, open dumping edges',
  },
  {
    id: 'water_restoration',
    name: 'Water Body Restoration',
    description: 'Riparian restoration of Mithi river corridors, wetlands, and desiltation of lakes',
    deltaNdvi: 0.10,
    deltaAlbedo: -0.05,
    deltaNdbi: -0.15,
    expectedCooling: -0.19,
    expectedEnergySaving: 0.93,
    targetFocus: 'Mithi River basin, Powai lake fringe, Versova creek',
  },
];

export const SYSTEM_QUALITY_METRICS: SystemStatus = {
  satelliteConnected: true,
  geeOperational: true,
  imdRecords: 383640,
  imdPeriod: '1997–2024',
  fastApiConnected: false, // will dynamically test in service
  fastApiLatencyMs: 42,
  xgboostLoaded: true,
  spatialValidationPassed: true,
  automatedTestsPassed: 29,
  automatedTestsTotal: 29,
  cloudFilterThresholdPct: 10,
  missingValuesPct: 0.02,
};
