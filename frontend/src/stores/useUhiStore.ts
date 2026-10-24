import { create } from 'zustand';
import { 
  ActivePage, 
  MapLayerType, 
  Ward, 
  SimulationResult, 
  SimulationParams 
} from '../types';
import { WARDS_DATA } from '../data/staticDatasets';
import { api } from '../services/api';

interface UhiState {
  // Navigation & Page State
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;

  // Header & Global Telemetry
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  isBackendConnected: boolean;
  backendLatencyMs: number;
  checkBackendHealth: () => Promise<void>;

  // Map & Layer State
  activeLayer: MapLayerType;
  setActiveLayer: (layer: MapLayerType) => void;
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

  // Simulation execution
  isSimulating: boolean;
  simulationResult: SimulationResult | null;
  runSimulation: () => Promise<void>;

  // Comparison slider
  splitSliderPos: number; // 0 to 100
  setSplitSliderPos: (pos: number) => void;
}

export const useUhiStore = create<UhiState>((set, get) => ({
  activePage: 'overview',
  setActivePage: (page) => set({ activePage: page }),

  selectedDate: 'Pre-Monsoon 2024',
  setSelectedDate: (date) => set({ selectedDate: date }),
  isBackendConnected: false,
  backendLatencyMs: 42,
  checkBackendHealth: async () => {
    const status = await api.checkHealth();
    set({
      isBackendConnected: status.online,
      backendLatencyMs: status.latencyMs || 42,
    });
  },

  activeLayer: 'lst',
  setActiveLayer: (layer) => set({ activeLayer: layer }),
  selectedWard: null,
  setSelectedWard: (ward) => {
    set({ selectedWard: ward, isWardDrawerOpen: !!ward });
  },
  hoveredWard: null,
  setHoveredWard: (ward) => set({ hoveredWard: ward }),
  isWardDrawerOpen: false,
  setIsWardDrawerOpen: (open) => set({ isWardDrawerOpen: open }),

  mapCenter: [72.8777, 19.0760],
  mapZoom: 11.2,
  resetMapView: () => set({ mapCenter: [72.8777, 19.0760], mapZoom: 11.2 }),
  focusWard: (wardId) => {
    const ward = WARDS_DATA.find((w) => w.id === wardId);
    if (ward) {
      set({
        selectedWard: ward,
        isWardDrawerOpen: true,
        mapCenter: [ward.lon, ward.lat],
        mapZoom: 13.0,
      });
    }
  },

  isDrawingPolygon: false,
  setIsDrawingPolygon: (drawing) => set({ isDrawingPolygon: drawing }),
  customPolygon: null,
  polygonAreaKm2: null,
  setCustomPolygon: (polygon, areaKm2 = 2.45) => set({
    customPolygon: polygon,
    polygonAreaKm2: areaKm2,
    isDrawingPolygon: false,
  }),
  clearPolygon: () => set({
    customPolygon: null,
    polygonAreaKm2: null,
    isDrawingPolygon: false,
  }),

  deltaNdvi: 0.20,
  deltaAlbedo: 0.25,
  deltaNdbi: -0.15,
  setDeltaNdvi: (val) => set({ deltaNdvi: val }),
  setDeltaAlbedo: (val) => set({ deltaAlbedo: val }),
  setDeltaNdbi: (val) => set({ deltaNdbi: val }),
  applyPresetScenario: (scenario) => set({
    deltaNdvi: scenario.deltaNdvi,
    deltaAlbedo: scenario.deltaAlbedo,
    deltaNdbi: scenario.deltaNdbi,
  }),

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

    // Realistic simulation processing delay
    await new Promise((r) => setTimeout(r, 650));
    const result = await api.runSimulation(params);

    set({
      simulationResult: result,
      isSimulating: false,
    });
  },

  splitSliderPos: 50,
  setSplitSliderPos: (pos) => set({ splitSliderPos: pos }),
}));
