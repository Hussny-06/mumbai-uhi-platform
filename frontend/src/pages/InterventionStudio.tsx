import React, { useEffect, useRef } from 'react';
import { useUhiStore } from '../stores/useUhiStore';
import { MumbaiMap } from '../components/map/MumbaiMap';
import { PRESET_SCENARIOS, WARDS_DATA } from '../data/staticDatasets';
import { PolicyScenario, Ward } from '../types';
import {
  Trees,
  Sun,
  Building2,
  RotateCcw,
  MapPin,
  PenLine,
  ChevronDown,
  Zap,
  Thermometer,
  BarChart3,
  Layers,
} from 'lucide-react';

/* ─────────── Preset icon mapping ─────────── */
const PRESET_ICONS: Record<string, string> = {
  urban_greening: '🌳',
  cool_roofs: '🏠',
  combined_mitigation: '⚡',
  urban_park: '🌿',
  water_restoration: '💧',
};

/* ─────────── Tiny histogram bars ─────────── */
function DeltaHistogram({ delta }: { delta: number }) {
  const bars = 8;
  const center = Math.floor(bars / 2);
  const intensity = Math.min(1, Math.abs(delta) / 2.5);
  const isCooling = delta < 0;

  return (
    <div className="flex items-end gap-0.5 h-8">
      {Array.from({ length: bars }).map((_, i) => {
        const dist = Math.abs(i - center) / center;
        const h = Math.max(2, Math.round(30 * (1 - dist * 0.5) * intensity));
        const active = isCooling ? i <= center : i >= center;
        return (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all duration-300"
            style={{
              height: `${h}px`,
              backgroundColor: active
                ? isCooling
                  ? '#0D9488'
                  : '#D94E34'
                : 'var(--border-subtle)',
            }}
          />
        );
      })}
    </div>
  );
}

/* ─────────── Main Component ─────────── */
export const InterventionStudio: React.FC = () => {
  const {
    deltaNdvi,
    deltaAlbedo,
    deltaNdbi,
    setDeltaNdvi,
    setDeltaAlbedo,
    setDeltaNdbi,
    applyPresetScenario,
    resetInterventions,
    simulationResult,
    isSimulating,
    runSimulation,
    selectedWard,
    setSelectedWard,
    customPolygon,
    polygonAreaKm2,
    isDrawingPolygon,
    setIsDrawingPolygon,
    clearPolygon,
    comparisonMode,
    setComparisonMode,
  } = useUhiStore();

  const hasRunOnMount = useRef(false);

  /* Run initial simulation on mount so studio is alive immediately */
  useEffect(() => {
    if (!hasRunOnMount.current) {
      hasRunOnMount.current = true;
      runSimulation();
    }
  }, [runSimulation]);

  const activeTarget = selectedWard
    ? `Ward ${selectedWard.id} — ${selectedWard.name}`
    : customPolygon
    ? `Custom Polygon (${(polygonAreaKm2 || 3.12).toFixed(2)} km²)`
    : 'Metropolitan Area';

  const handlePreset = (sc: PolicyScenario) => {
    applyPresetScenario({ deltaNdvi: sc.deltaNdvi, deltaAlbedo: sc.deltaAlbedo, deltaNdbi: sc.deltaNdbi });
  };

  const coolingDelta = simulationResult?.coolingDelta ?? 0;
  const isCooling = coolingDelta < 0;
  const energySaving = simulationResult?.energyReductionKwhM2Yr ?? 0;
  const baselineLst = simulationResult?.baselineLst ?? (selectedWard?.meanLst ?? 36.5);
  const simLst = simulationResult?.simulatedLst ?? (baselineLst + coolingDelta);

  return (
    <div
      className="flex-1 grid gap-3 p-3 overflow-hidden"
      style={{
        height: 'calc(100vh - 3rem)',
        gridTemplateColumns: '1fr 2fr 1fr',
      }}
    >
      {/* ═══════════ LEFT CONTROL COLUMN ═══════════ */}
      <div
        className="flex flex-col gap-2 overflow-y-auto"
        style={{ scrollbarWidth: 'thin' }}
      >
        {/* 1. Target Scope Card */}
        <div
          className="rounded-lg p-3 flex flex-col gap-2"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            className="text-[10px] uppercase font-mono tracking-widest font-bold"
            style={{ color: 'var(--accent-primary)' }}
          >
            Target Scope
          </div>

          {/* Ward Select */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
            <div className="relative flex-1">
              <select
                value={selectedWard?.id ?? ''}
                onChange={(e) => {
                  const found = WARDS_DATA.find((w: Ward) => w.id === e.target.value);
                  if (found) setSelectedWard(found);
                }}
                className="w-full appearance-none pr-6 pl-2 py-1.5 rounded text-xs cursor-pointer focus:outline-none"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontFamily: 'IBM Plex Mono, monospace',
                }}
              >
                <option value="">All 24 Wards</option>
                {WARDS_DATA.map((w: Ward) => (
                  <option key={w.id} value={w.id}>
                    {w.id} — {w.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
            </div>
          </div>

          {/* Draw / Clear Polygon */}
          <div className="flex gap-1.5">
            <button
              onClick={() => setIsDrawingPolygon(!isDrawingPolygon)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs transition-all"
              style={{
                background: isDrawingPolygon ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                border: `1px solid ${isDrawingPolygon ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                color: isDrawingPolygon ? '#fff' : 'var(--text-secondary)',
              }}
            >
              <PenLine className="w-3 h-3" />
              <span className="font-medium">Draw Area</span>
            </button>
            {customPolygon && (
              <button
                onClick={clearPolygon}
                className="px-2 py-1.5 rounded text-xs transition-all"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                Clear
              </button>
            )}
          </div>

          {customPolygon && (
            <div
              className="text-[10px] font-mono px-2 py-1 rounded"
              style={{ background: 'var(--bg-elevated)', color: 'var(--accent-primary)' }}
            >
              ✓ Drawn: {(polygonAreaKm2 || 3.12).toFixed(2)} km²
            </div>
          )}
        </div>

        {/* 2. Empirical Policy Presets */}
        <div
          className="rounded-lg p-3 flex flex-col gap-2"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            className="text-[10px] uppercase font-mono tracking-widest font-bold"
            style={{ color: 'var(--accent-primary)' }}
          >
            Policy Presets
          </div>
          <div className="flex flex-col gap-1.5">
            {PRESET_SCENARIOS.map((sc) => {
              const isActive =
                Math.abs(deltaNdvi - sc.deltaNdvi) < 0.01 &&
                Math.abs(deltaAlbedo - sc.deltaAlbedo) < 0.01 &&
                Math.abs(deltaNdbi - sc.deltaNdbi) < 0.01;

              return (
                <button
                  key={sc.id}
                  onClick={() => handlePreset(sc)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-md text-left transition-all"
                  style={{
                    background: isActive ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                    border: `1px solid ${isActive ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                  }}
                >
                  <span className="text-base leading-none">{PRESET_ICONS[sc.id] ?? '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-xs font-semibold truncate"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                    >
                      {sc.name}
                    </div>
                    <div
                      className="text-[10px] font-mono mt-0.5"
                      style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                    >
                      {sc.expectedCooling.toFixed(2)} °C · {sc.expectedEnergySaving.toFixed(1)} kWh/m²
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Biophysical Sliders */}
        <div
          className="rounded-lg p-3 flex flex-col gap-3"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center justify-between">
            <div
              className="text-[10px] uppercase font-mono tracking-widest font-bold"
              style={{ color: 'var(--accent-primary)' }}
            >
              Biophysical Controls
            </div>
            <button
              onClick={resetInterventions}
              className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded transition-all"
              style={{
                color: 'var(--text-muted)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-elevated)',
              }}
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Reset
            </button>
          </div>

          {/* NDVI Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                className="text-xs font-medium flex items-center gap-1.5"
                style={{ color: 'var(--text-primary)', fontFamily: 'IBM Plex Sans, sans-serif' }}
              >
                <Trees className="w-3.5 h-3.5" style={{ color: '#0D9488' }} />
                Canopy ΔNDVI
              </label>
              <span
                className="text-xs font-mono font-bold tabular-nums"
                style={{ color: '#0D9488' }}
              >
                +{deltaNdvi.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.50"
              step="0.05"
              value={deltaNdvi}
              onChange={(e) => setDeltaNdvi(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
              style={{ accentColor: '#0D9488' }}
            />
            <div
              className="flex justify-between text-[9px] font-mono"
              style={{ color: 'var(--text-muted)' }}
            >
              <span>0.00</span>
              <span>+0.50</span>
            </div>
          </div>

          {/* Albedo Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                className="text-xs font-medium flex items-center gap-1.5"
                style={{ color: 'var(--text-primary)', fontFamily: 'IBM Plex Sans, sans-serif' }}
              >
                <Sun className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
                Cool Roof ΔAlbedo
              </label>
              <span
                className="text-xs font-mono font-bold tabular-nums"
                style={{ color: '#F59E0B' }}
              >
                +{deltaAlbedo.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.00"
              max="0.40"
              step="0.05"
              value={deltaAlbedo}
              onChange={(e) => setDeltaAlbedo(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
              style={{ accentColor: '#F59E0B' }}
            />
            <div
              className="flex justify-between text-[9px] font-mono"
              style={{ color: 'var(--text-muted)' }}
            >
              <span>0.00</span>
              <span>+0.40</span>
            </div>
          </div>

          {/* NDBI Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                className="text-xs font-medium flex items-center gap-1.5"
                style={{ color: 'var(--text-primary)', fontFamily: 'IBM Plex Sans, sans-serif' }}
              >
                <Building2 className="w-3.5 h-3.5" style={{ color: '#60A5FA' }} />
                Depave ΔNDBI
              </label>
              <span
                className="text-xs font-mono font-bold tabular-nums"
                style={{ color: '#60A5FA' }}
              >
                {deltaNdbi.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="-0.30"
              max="0.00"
              step="0.05"
              value={deltaNdbi}
              onChange={(e) => setDeltaNdbi(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
              style={{ accentColor: '#60A5FA' }}
            />
            <div
              className="flex justify-between text-[9px] font-mono"
              style={{ color: 'var(--text-muted)' }}
            >
              <span>−0.30</span>
              <span>0.00</span>
            </div>
          </div>

          <div
            className="text-[10px] font-mono px-2 py-1 rounded flex items-center gap-1"
            style={{
              background: 'var(--bg-elevated)',
              color: isSimulating ? 'var(--accent-primary)' : 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {isSimulating ? (
              <>
                <span className="inline-block w-2 h-2 rounded-full animate-spin border border-t-transparent" style={{ borderColor: 'var(--accent-primary)' }} />
                Computing…
              </>
            ) : (
              <>⚡ Auto-debounced 100ms inference</>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════ CENTER MAP CANVAS ═══════════ */}
      <div className="flex flex-col gap-2 min-h-0">
        {/* Map Mode Bar */}
        <div
          className="flex items-center justify-between px-3 py-2 rounded-lg flex-shrink-0"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Sans, sans-serif' }}>
              {activeTarget}
            </span>
          </div>
          <div
            className="flex items-center rounded-md overflow-hidden"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            {(['split', 'delta', 'post'] as const).map((mode, idx) => (
              <button
                key={mode}
                onClick={() => setComparisonMode(mode)}
                className="px-3 py-1.5 text-[11px] font-mono transition-all"
                style={{
                  background: comparisonMode === mode ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                  color: comparisonMode === mode ? '#fff' : 'var(--text-muted)',
                  borderRight: idx < 2 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                {mode === 'split' ? 'Split Curtain' : mode === 'delta' ? 'ΔT Anomaly' : 'Post-Int.'}
              </button>
            ))}
          </div>
        </div>

        {/* Map */}
        <div
          className="flex-1 min-h-0 rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          <MumbaiMap interactivePolygonMode={true} splitComparisonMode={true} />
        </div>

        {/* Legend Bar */}
        <div
          className="flex items-center justify-between px-3 py-2 rounded-lg flex-shrink-0"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>LST Scale</span>
            <div className="w-24 h-2 rounded-sm thermal-gradient-bar" />
            <div className="flex gap-2 text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              <span>29°C</span>
              <span>38.5°C</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>ΔT Cool</span>
            <div className="w-16 h-2 rounded-sm delta-cooling-gradient-bar" />
            <div className="flex gap-2 text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              <span style={{ color: '#0D9488' }}>−2°C</span>
              <span style={{ color: '#D94E34' }}>0</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ RIGHT IMPACT COLUMN ═══════════ */}
      <div
        className="flex flex-col gap-2 overflow-y-auto"
        style={{ scrollbarWidth: 'thin' }}
      >
        {/* 1. Thermal Shift Summary */}
        <div
          className="rounded-lg p-3 flex flex-col gap-2"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center justify-between">
            <div
              className="text-[10px] uppercase font-mono tracking-widest font-bold"
              style={{ color: 'var(--accent-primary)' }}
            >
              Thermal Shift
            </div>
            {simulationResult && (
              <span
                className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                style={{
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {simulationResult.elapsedMs.toFixed(0)} ms
              </span>
            )}
          </div>

          {/* Baseline → Post Flow */}
          <div className="flex items-center gap-1 font-mono text-sm">
            <div className="text-center">
              <div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>Before</div>
              <div className="font-bold text-lg tabular-nums" style={{ color: 'var(--text-primary)' }}>
                {baselineLst.toFixed(1)}°C
              </div>
            </div>
            <div className="flex-1 h-px mx-1" style={{ background: 'var(--border-subtle)' }} />
            <div className="text-center">
              <div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>After</div>
              <div
                className="font-bold text-lg tabular-nums"
                style={{ color: isCooling ? '#0D9488' : 'var(--accent-primary)' }}
              >
                {simLst.toFixed(1)}°C
              </div>
            </div>
          </div>

          {/* Hero ΔT */}
          <div
            className="text-center py-2 rounded-md"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--text-muted)' }}>
              Hero ΔT Cooling
            </div>
            <div
              className="text-2xl font-bold font-mono tabular-nums mt-0.5"
              style={{ color: isCooling ? '#0D9488' : 'var(--accent-primary)' }}
            >
              {coolingDelta >= 0 ? '+' : ''}{coolingDelta.toFixed(2)} °C
            </div>
          </div>
        </div>

        {/* 2. Grid Cell ΔT Histogram */}
        <div
          className="rounded-lg p-3 flex flex-col gap-2"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <div
              className="text-[10px] uppercase font-mono tracking-widest font-bold"
              style={{ color: 'var(--accent-primary)' }}
            >
              Grid Cell ΔT
            </div>
          </div>
          <DeltaHistogram delta={coolingDelta} />
          <div
            className="flex justify-between text-[9px] font-mono"
            style={{ color: 'var(--text-muted)' }}
          >
            <span style={{ color: '#0D9488' }}>Cooling</span>
            <span>Distribution</span>
            <span style={{ color: '#D94E34' }}>Warming</span>
          </div>
        </div>

        {/* 3. HVAC Energy & Grid ROI */}
        <div
          className="rounded-lg p-3 flex flex-col gap-2"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
            <div
              className="text-[10px] uppercase font-mono tracking-widest font-bold"
              style={{ color: 'var(--accent-primary)' }}
            >
              Energy ROI
            </div>
          </div>

          <div className="space-y-2">
            <div
              className="flex justify-between items-center px-2 py-2 rounded-md"
              style={{ background: 'var(--bg-elevated)' }}
            >
              <span className="text-[11px]" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                HVAC Reduction
              </span>
              <span
                className="text-sm font-bold font-mono tabular-nums"
                style={{ color: '#F59E0B' }}
              >
                {energySaving.toFixed(2)} kWh/m²/yr
              </span>
            </div>

            {selectedWard && (
              <div
                className="flex justify-between items-center px-2 py-2 rounded-md"
                style={{ background: 'var(--bg-elevated)' }}
              >
                <span className="text-[11px]" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  Ward-Level MWh Est.
                </span>
                <span
                  className="text-sm font-bold font-mono tabular-nums"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {(energySaving * selectedWard.area * 1000 * 0.001).toFixed(0)} MWh/yr
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 4. Biophysical Flux Shift */}
        <div
          className="rounded-lg p-3 flex flex-col gap-2"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <div
              className="text-[10px] uppercase font-mono tracking-widest font-bold"
              style={{ color: 'var(--accent-primary)' }}
            >
              SHAP Flux Shift
            </div>
          </div>

          <div className="space-y-1.5">
            {[
              {
                label: 'NDVI Canopy Gain',
                value: -(deltaNdvi * 2.4),
                icon: '🌳',
              },
              {
                label: 'Albedo Reflectance',
                value: -(deltaAlbedo * 0.95),
                icon: '☀️',
              },
              {
                label: 'Built-up Reduction',
                value: -(Math.abs(deltaNdbi) * 1.62),
                icon: '🏗️',
              },
            ].map((d) => {
              const pct = Math.min(100, (Math.abs(d.value) / 1.5) * 100);
              const isCool = d.value < 0;
              return (
                <div key={d.label} className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                      {d.icon} {d.label}
                    </span>
                    <span
                      className="text-[10px] font-mono font-bold tabular-nums"
                      style={{ color: isCool ? '#0D9488' : 'var(--accent-primary)' }}
                    >
                      {d.value >= 0 ? '+' : ''}{d.value.toFixed(2)} °C
                    </span>
                  </div>
                  {/* Diverging bar */}
                  <div
                    className="h-1.5 rounded-sm overflow-hidden"
                    style={{ background: 'var(--bg-elevated)' }}
                  >
                    <div
                      className="h-full rounded-sm transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: isCool ? '#0D9488' : '#D94E34',
                        marginLeft: isCool ? '0' : 'auto',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
