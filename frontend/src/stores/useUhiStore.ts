import { create } from 'zustand';
import {
  ActivePage,
  WorkspaceId,
  ThemeMode,
  MapRenderMode,
  ComparisonMode,
  MapLayerType,
  Ward,
  SimulationResult,
  SimulationParams,
  ModelMetrics,
  MannKendallData,
} from '../types';
import {
  WARDS_DATA,
  MODEL_METRICS,
  CITY_WIDE_SHAP_DRIVERS,
  MANN_KENDALL_METRICS,
} from '../data/staticDatasets';
import { api } from '../services/api';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function normalizeToWorkspace(page: ActivePage): WorkspaceId {
  switch (page) {
    case 'explorer':
    case 'overview':
    case 'heatmap':
    case 'wards':
      return 'explorer';
    case 'studio':
    case 'simulator':
      return 'studio';
    case 'science':
    case 'trends':
    case 'ml':
      return 'science';
    case 'dossier':
    case 'reports':
      return 'dossier';
    default:
      return 'explorer';
  }
}

function getInitialUrlState(): { page: ActivePage; ward: Ward | null; theme: ThemeMode } {
  if (typeof window === 'undefined') {
    return { page: 'explorer', ward: null, theme: 'dark' };
  }
  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view') as ActivePage | null;
  const wardParam = params.get('ward');
  const savedTheme = (localStorage.getItem('uhi-theme') as ThemeMode | null) || 'dark';

  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  const ward = wardParam ? WARDS_DATA.find((w) => w.id.toLowerCase() === wardParam.toLowerCase()) || null : null;
  const page: ActivePage = viewParam ? normalizeToWorkspace(viewParam) : 'explorer';

  return { page, ward, theme: savedTheme };
}

function syncUrlState(page: ActivePage, ward: Ward | null) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.set('view', normalizeToWorkspace(page));
  if (ward) {
    url.searchParams.set('ward', ward.id);
  } else {
    url.searchParams.delete('ward');
  }
  window.history.replaceState({}, '', url.toString());
}

const initial = getInitialUrlState();

interface UhiState {
  // Navigation & Page State
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;

  // Dual-Theme State (Daylight Paper vs Carbon Workbench)
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  // Header & Global Telemetry
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  isBackendConnected: boolean;
  backendLatencyMs: number;
  checkBackendHealth: () => Promise<void>;
  hydrateFromBackend: () => Promise<void>;

  // Live Hydrated Datasets (with embedded fallback)
  wards: Ward[];
  validationMetrics: { xgboost: ModelMetrics; randomForest: ModelMetrics };
  shapDrivers: typeof CITY_WIDE_SHAP_DRIVERS;
  mannKendall: MannKendallData;

  // Map & Layer State
  activeLayer: MapLayerType;
  setActiveLayer: (layer: MapLayerType) => void;
  mapRenderMode: MapRenderMode;
  setMapRenderMode: (mode: MapRenderMode) => void;
  comparisonMode: ComparisonMode;
  setComparisonMode: (mode: ComparisonMode) => void;

  selectedWard: Ward | null;
  setSelectedWard: (ward: Ward | null) => void;
  hoveredWard: Ward | null;
  setHoveredWard: (ward: Ward | null) => void;
  isWardDrawerOpen: boolean;
  setIsWardDrawerOpen: (open: boolean) => void;

  // Map view controls
  mapCenter: [number, number];
  mapZoom: number;
  resetMapView: () => void;
  focusWard: (wardId: string) => void;

  // What-If Intervention State
  isDrawingPolygon: boolean;
  setIsDrawingPolygon: (drawing: boolean) => void;
  customPolygon: [number, number][] | null;
  setCustomPolygon: (polygon: [number, number][] | null, areaKm2?: number) => void;
  polygonAreaKm2: number | null;
  clearPolygon: () => void;

  // Sliders
  deltaNdvi: number;       // 0 to 0.50
  deltaAlbedo: number;     // 0 to 0.40
  deltaNdbi: number;       // 0 to -0.30
  setDeltaNdvi: (val: number) => void;
  setDeltaAlbedo: (val: number) => void;
  setDeltaNdbi: (val: number) => void;
  applyPresetScenario: (scenario: { deltaNdvi: number; deltaAlbedo: number; deltaNdbi: number }) => void;
  resetInterventions: () => void;

  // Simulation execution
  isSimulating: boolean;
  simulationResult: SimulationResult | null;
  runSimulation: () => Promise<void>;

  // Comparison slider
  splitSliderPos: number; // 0 to 100
  setSplitSliderPos: (pos: number) => void;
}

function scheduleDebouncedSimulation(runSim: () => Promise<void>) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    runSim();
  }, 100);
}

export const useUhiStore = create<UhiState>((set, get) => ({
  activePage: initial.page,
  setActivePage: (page) => {
    set({ activePage: page });
    syncUrlState(page, get().selectedWard);
  },

  theme: initial.theme,
  setTheme: (theme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('uhi-theme', theme);
    }
    set({ theme });
  },
  toggleTheme: () => {
    const next: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  selectedDate: 'Pre-Monsoon 2024',
  setSelectedDate: (date) => set({ selectedDate: date }),
  isBackendConnected: false,
  backendLatencyMs: 4,

  wards: WARDS_DATA,
  validationMetrics: {
    xgboost: MODEL_METRICS.xgboost,
    randomForest: MODEL_METRICS.randomForest,
  },
  shapDrivers: CITY_WIDE_SHAP_DRIVERS,
  mannKendall: MANN_KENDALL_METRICS,

  hydrateFromBackend: async () => {
    const [wards, validationMetrics, shapDrivers, mannKendall] = await Promise.all([
      api.getWards(),
      api.getValidationMetrics(),
      api.getShapDrivers(),
      api.getClimateTrends(),
    ]);
    const currentSelected = get().selectedWard;
    const refreshedSelected = currentSelected
      ? wards.find((w) => w.id === currentSelected.id) || currentSelected
      : null;

    set({
      wards,
      validationMetrics,
      shapDrivers,
      mannKendall,
      selectedWard: refreshedSelected,
    });
  },

  checkBackendHealth: async () => {
    const wasConnected = get().isBackendConnected;
    const status = await api.checkHealth();
    set({
      isBackendConnected: status.online,
      backendLatencyMs: status.latencyMs || 4,
    });
    if (status.online && !wasConnected) {
      await get().hydrateFromBackend();
      await get().runSimulation();
    }
  },

  activeLayer: 'lst',
  setActiveLayer: (layer) => set({ activeLayer: layer }),
  mapRenderMode: 'combined',
  setMapRenderMode: (mode) => set({ mapRenderMode: mode }),
  comparisonMode: 'split',
  setComparisonMode: (mode) => set({ comparisonMode: mode }),

  selectedWard: initial.ward,
  setSelectedWard: (ward) => {
    set({ selectedWard: ward, isWardDrawerOpen: !!ward });
    syncUrlState(get().activePage, ward);
    scheduleDebouncedSimulation(get().runSimulation);
  },
  hoveredWard: null,
  setHoveredWard: (ward) => set({ hoveredWard: ward }),
  isWardDrawerOpen: !!initial.ward,
  setIsWardDrawerOpen: (open) => set({ isWardDrawerOpen: open }),

  mapCenter: [72.8777, 19.0760],
  mapZoom: 11.2,
  resetMapView: () => set({ mapCenter: [72.8777, 19.0760], mapZoom: 11.2 }),
  focusWard: (wardId) => {
    const ward = get().wards.find((w) => w.id === wardId) || WARDS_DATA.find((w) => w.id === wardId);
    if (ward) {
      set({
        selectedWard: ward,
        isWardDrawerOpen: true,
        mapCenter: [ward.lon, ward.lat],
        mapZoom: 13.0,
      });
      syncUrlState(get().activePage, ward);
      scheduleDebouncedSimulation(get().runSimulation);
    }
  },

  isDrawingPolygon: false,
  setIsDrawingPolygon: (drawing) => set({ isDrawingPolygon: drawing }),
  customPolygon: null,
  polygonAreaKm2: null,
  setCustomPolygon: (polygon, areaKm2 = 3.12) => {
    set({
      customPolygon: polygon,
      polygonAreaKm2: areaKm2,
      isDrawingPolygon: false,
    });
    scheduleDebouncedSimulation(get().runSimulation);
  },
  clearPolygon: () => {
    set({
      customPolygon: null,
      polygonAreaKm2: null,
      isDrawingPolygon: false,
    });
    scheduleDebouncedSimulation(get().runSimulation);
  },

  deltaNdvi: 0.20,
  deltaAlbedo: 0.25,
  deltaNdbi: -0.15,
  setDeltaNdvi: (val) => {
    set({ deltaNdvi: val });
    scheduleDebouncedSimulation(get().runSimulation);
  },
  setDeltaAlbedo: (val) => {
    set({ deltaAlbedo: val });
    scheduleDebouncedSimulation(get().runSimulation);
  },
  setDeltaNdbi: (val) => {
    set({ deltaNdbi: val });
    scheduleDebouncedSimulation(get().runSimulation);
  },
  applyPresetScenario: (scenario) => {
    set({
      deltaNdvi: scenario.deltaNdvi,
      deltaAlbedo: scenario.deltaAlbedo,
      deltaNdbi: scenario.deltaNdbi,
    });
    scheduleDebouncedSimulation(get().runSimulation);
  },
  resetInterventions: () => {
    set({
      deltaNdvi: 0.0,
      deltaAlbedo: 0.0,
      deltaNdbi: 0.0,
    });
    scheduleDebouncedSimulation(get().runSimulation);
  },

  isSimulating: false,
  simulationResult: null,
  runSimulation: async () => {
    set({ isSimulating: true });
    const { deltaNdvi, deltaAlbedo, deltaNdbi, selectedWard, customPolygon, polygonAreaKm2 } = get();

    const params: SimulationParams = {
      wardId: selectedWard?.id,
      deltaNdvi,
      deltaAlbedo,
      deltaNdbi,
      customPolygon: customPolygon || undefined,
      polygonAreaKm2: polygonAreaKm2 || undefined,
    };

    const result = await api.runSimulation(params);

    set({
      simulationResult: result,
      isSimulating: false,
    });
  },

  splitSliderPos: 50,
  setSplitSliderPos: (pos) => set({ splitSliderPos: pos }),
}));
