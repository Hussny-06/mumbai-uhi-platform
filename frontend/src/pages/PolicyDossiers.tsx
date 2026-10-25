import React, { useState, useMemo } from 'react';
import { WARDS_DATA, PRESET_SCENARIOS } from '../data/staticDatasets';
import { Ward, PolicyScenario } from '../types';
import { WardMiniMapSvg } from '../components/reports/WardMiniMapSvg';
import { exportWardCsv, exportDossierJson } from '../utils/exportUtils';
import { useUhiStore } from '../stores/useUhiStore';
import {
  Printer,
  Download,
  FileJson,
  ChevronDown,
  Thermometer,
  TrendingUp,
  MapPin,
  Shield,
} from 'lucide-react';

/* ───────── Risk → badge color ──────────────────────────────────────────── */
function getRiskColor(risk: string): string {
  switch (risk) {
    case 'Critical':     return '#D94E34';
    case 'Extreme':      return '#F97316';
    case 'High':         return '#EAB308';
    case 'Moderate':     return '#0D9488';
    case 'Low':          return '#22C55E';
    case 'Cooling Sink': return '#60A5FA';
    default:             return 'var(--text-muted)';
  }
}

/* ───────── DCPR 2034 directives based on dominant driver ───────────────── */
function getDirectives(ward: Ward, scenario: PolicyScenario): string[] {
  const directives: string[] = [];
  if (scenario.deltaNdbi < -0.1)
    directives.push('Mandate ≥20% permeable pavement ratio in all redevelopment projects under DCPR 2034 §7.4 (Depaving Obligation).');
  if (scenario.deltaNdvi > 0.15)
    directives.push('Deploy roadside canopy infill along transit corridors to break continuous asphalt thermal retention. Target: 1 tree per 8 m² impervious surface.');
  if (scenario.deltaAlbedo > 0.15)
    directives.push('Mandate Cool Roof Elastomer coatings (SRI > 80) for all redevelopment projects. DCPR 2034 §6.2 compliance.');
  if (ward.distCoast < 5)
    directives.push('Preserve mangrove buffer zones and natural drainage corridors along eastern creek margins to ensure nocturnal coastal ventilation.');
  if (ward.mndwi < -0.1)
    directives.push('Restore riparian corridors and desilting of urban lakes to enhance evaporative cooling and biodiversity corridors.');
  if (directives.length === 0)
    directives.push('Conduct seasonal thermal monitoring with bi-annual NDVI ground-truthing surveys.');
  return directives;
}

/* ───────── Main Component ──────────────────────────────────────────────── */
export const PolicyDossiers: React.FC = () => {
  const [selectedWardId, setSelectedWardId] = useState<string>('G/N');
  const [selectedEpoch, setSelectedEpoch] = useState<string>('Pre-Monsoon 2024');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('combined_mitigation');

  const { simulationResult } = useUhiStore();

  const ward = useMemo(
    () => WARDS_DATA.find((w: Ward) => w.id === selectedWardId) || WARDS_DATA[0],
    [selectedWardId]
  );
  const scenario = useMemo(
    () => PRESET_SCENARIOS.find((s: PolicyScenario) => s.id === selectedScenarioId) || PRESET_SCENARIOS[0],
    [selectedScenarioId]
  );

  const cooling = simulationResult?.coolingDelta ?? scenario.expectedCooling;
  const energySaving = simulationResult?.energyReductionKwhM2Yr ?? scenario.expectedEnergySaving;
  const postLst = ward.meanLst + cooling;
  const dossierId = `BMC-UHI-${ward.id.replace('/', '-')}-2024`;
  const directives = useMemo(() => getDirectives(ward, scenario), [ward, scenario]);

  /* Cross-ward thermal rank (1 = hottest) */
  const thermalRank = useMemo(() => {
    const sorted = [...WARDS_DATA].sort((a, b) => b.meanLst - a.meanLst);
    return sorted.findIndex((w) => w.id === ward.id) + 1;
  }, [ward]);

  const cityMeanLst = useMemo(
    () => WARDS_DATA.reduce((s, w) => s + w.meanLst, 0) / WARDS_DATA.length,
    []
  );
  const cityMeanNdvi = useMemo(
    () => WARDS_DATA.reduce((s, w) => s + w.ndvi, 0) / WARDS_DATA.length,
    []
  );

  const handlePrint = () => window.print();
  const handleCsv   = () => exportWardCsv(ward, scenario, selectedEpoch);
  const handleJson  = () => exportDossierJson(ward, scenario, selectedEpoch, simulationResult);

  return (
    <div
      className="flex-1 flex overflow-hidden"
      style={{ height: 'calc(100vh - 3rem)' }}
    >
      {/* ═══════════ LEFT CONFIG PANEL (hidden on print) ═══════════ */}
      <div
        className="no-print flex-shrink-0 flex flex-col gap-3 p-4 overflow-y-auto"
        style={{
          width: '320px',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
          scrollbarWidth: 'thin',
        }}
      >
        {/* 1. Dossier Parameters */}
        <div
          className="rounded-lg p-3 flex flex-col gap-3"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <div
            className="text-[10px] uppercase font-mono tracking-widest font-bold"
            style={{ color: 'var(--accent-primary)' }}
          >
            Dossier Parameters
          </div>

          {/* Ward Select */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase" style={{ color: 'var(--text-muted)' }}>
              Target BMC Ward
            </label>
            <div className="relative">
              <select
                value={selectedWardId}
                onChange={(e) => setSelectedWardId(e.target.value)}
                className="w-full appearance-none pl-2 pr-6 py-2 rounded text-xs cursor-pointer focus:outline-none"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontFamily: 'IBM Plex Mono, monospace',
                }}
              >
                {WARDS_DATA.map((w: Ward) => (
                  <option key={w.id} value={w.id}>
                    Ward {w.id} — {w.name} ({w.meanLst.toFixed(1)}°C)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Epoch Select */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase" style={{ color: 'var(--text-muted)' }}>
              Observation Epoch
            </label>
            <div className="relative">
              <select
                value={selectedEpoch}
                onChange={(e) => setSelectedEpoch(e.target.value)}
                className="w-full appearance-none pl-2 pr-6 py-2 rounded text-xs cursor-pointer focus:outline-none"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontFamily: 'IBM Plex Mono, monospace',
                }}
              >
                <option>Pre-Monsoon 2024</option>
                <option>Annual Baseline 2024</option>
                <option>Post-Monsoon 2023</option>
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Scenario Select */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase" style={{ color: 'var(--text-muted)' }}>
              Policy Scenario
            </label>
            <div className="relative">
              <select
                value={selectedScenarioId}
                onChange={(e) => setSelectedScenarioId(e.target.value)}
                className="w-full appearance-none pl-2 pr-6 py-2 rounded text-xs cursor-pointer focus:outline-none"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontFamily: 'IBM Plex Mono, monospace',
                }}
              >
                {PRESET_SCENARIOS.map((s: PolicyScenario) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.expectedCooling.toFixed(2)}°C)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        {/* 2. Cross-Ward Benchmark */}
        <div
          className="rounded-lg p-3 flex flex-col gap-2"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <div
            className="text-[10px] uppercase font-mono tracking-widest font-bold"
            style={{ color: 'var(--accent-primary)' }}
          >
            Cross-Ward Benchmark
          </div>
          {[
            { label: 'Thermal Rank', value: `#${thermalRank} of 24`, icon: '🏆' },
            { label: 'LST vs. City Mean', value: `${ward.meanLst >= cityMeanLst ? '+' : ''}${(ward.meanLst - cityMeanLst).toFixed(2)}°C`, icon: '🌡️' },
            { label: 'NDVI vs. City Mean', value: `${ward.ndvi >= cityMeanNdvi ? '+' : ''}${(ward.ndvi - cityMeanNdvi).toFixed(3)}`, icon: '🌿' },
            { label: 'Risk Class', value: ward.risk, icon: '⚠️' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between px-2 py-1.5 rounded"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <span className="text-[11px] flex items-center gap-1.5" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                {item.icon} {item.label}
              </span>
              <span
                className="text-xs font-mono font-bold tabular-nums"
                style={{ color: item.label === 'Risk Class' ? getRiskColor(ward.risk) : 'var(--text-primary)' }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* 3. Export & Actions */}
        <div
          className="rounded-lg p-3 flex flex-col gap-2"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <div
            className="text-[10px] uppercase font-mono tracking-widest font-bold"
            style={{ color: 'var(--accent-primary)' }}
          >
            Export &amp; Actions
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 w-full px-3 py-2 rounded text-xs font-medium transition-all"
            style={{
              background: 'var(--accent-primary)',
              color: '#fff',
              border: '1px solid var(--accent-primary)',
            }}
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save as PDF
          </button>
          <button
            onClick={handleCsv}
            className="flex items-center gap-2 w-full px-3 py-2 rounded text-xs font-medium transition-all"
            style={{
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Download className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />
            Download Ward CSV
          </button>
          <button
            onClick={handleJson}
            className="flex items-center gap-2 w-full px-3 py-2 rounded text-xs font-medium transition-all"
            style={{
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <FileJson className="w-3.5 h-3.5" style={{ color: '#60A5FA' }} />
            Download Dossier JSON
          </button>
        </div>
      </div>

      {/* ═══════════ RIGHT TYPESET DOCUMENT SHEET ═══════════ */}
      <div
        className="flex-1 overflow-y-auto p-6"
        style={{ scrollbarWidth: 'thin', background: 'var(--bg-canvas)' }}
        id="dossier-print-area"
      >
        <div
          className="max-w-4xl mx-auto rounded-xl p-8 flex flex-col gap-6"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-floating)',
          }}
        >
          {/* ── Document Header ──────────────────────────────── */}
          <div
            className="pb-4"
            style={{ borderBottom: '2px solid var(--border-subtle)' }}
          >
            <div
              className="text-[10px] uppercase font-mono tracking-widest font-bold"
              style={{ color: 'var(--accent-primary)' }}
            >
              BRIHANMUMBAI MUNICIPAL CORPORATION • CLIMATE ACTION CELL
            </div>
            <h1
              className="text-2xl font-bold mt-2 leading-tight"
              style={{ color: 'var(--text-primary)', fontFamily: 'IBM Plex Serif, serif' }}
            >
              Urban Heat Island Assessment &amp; Mitigation Action Plan
            </h1>
            <div className="flex items-start justify-between mt-3">
              <div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  Ward {ward.id} ({ward.name}) · Greater Mumbai Metropolitan Area
                </div>
                <div className="text-[11px] mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>
                  CRS: EPSG:32643 · Spatial Resolution: 30m · Epoch: {selectedEpoch}
                </div>
              </div>
              <div className="text-right font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                <div>Dossier ID: {dossierId}</div>
                <div>Validation: 1.2 km Spatial Block K-Fold</div>
                <div style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
                  Generated: 2026-10-25
                </div>
              </div>
            </div>
          </div>

          {/* ── §1: Executive Ward Profile ────────────────────── */}
          <section className="flex flex-col gap-3">
            <h2
              className="text-sm font-bold uppercase tracking-wide flex items-center gap-2"
              style={{ color: 'var(--text-primary)', fontFamily: 'IBM Plex Serif, serif' }}
            >
              <MapPin className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              §1. Executive Ward Profile &amp; Thermal Vulnerability
            </h2>

            <div className="flex gap-4 items-start">
              {/* 4-metric grid */}
              <div className="flex-1 grid grid-cols-2 gap-3">
                {[
                  { label: 'Mean Surface LST', value: `${ward.meanLst.toFixed(1)} °C`, color: '#D94E34' },
                  { label: 'UHI Severity (ΔT)', value: `+${ward.uhi.toFixed(1)} °C`, color: '#F97316' },
                  { label: 'Population Density', value: `${ward.popDensity.toLocaleString()}/km²`, color: 'var(--text-primary)' },
                  { label: 'Heat Risk Class', value: ward.risk, color: getRiskColor(ward.risk) },
                  { label: 'Ward Area', value: `${ward.area.toFixed(1)} km²`, color: 'var(--text-secondary)' },
                  { label: 'Dist. to Coast', value: `${ward.distCoast.toFixed(1)} km`, color: 'var(--text-secondary)' },
                  { label: 'Thermal Rank', value: `#${thermalRank} / 24`, color: thermalRank <= 5 ? '#D94E34' : '#0D9488' },
                  { label: 'LST vs. City Avg.', value: `${ward.meanLst >= cityMeanLst ? '+' : ''}${(ward.meanLst - cityMeanLst).toFixed(2)}°C`, color: ward.meanLst >= cityMeanLst ? '#D94E34' : '#0D9488' },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="px-3 py-2.5 rounded-lg"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                  >
                    <div className="text-[10px] uppercase font-mono" style={{ color: 'var(--text-muted)' }}>
                      {m.label}
                    </div>
                    <div
                      className="text-lg font-bold font-mono tabular-nums mt-0.5"
                      style={{ color: m.color }}
                    >
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Ward Mini Map */}
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <WardMiniMapSvg activeWardId={ward.id} />
                <div
                  className="text-[10px] font-mono text-center"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Ward Locator Map
                </div>
              </div>
            </div>
          </section>

          {/* ── §2: TreeSHAP Biophysical Attribution ────────── */}
          <section className="flex flex-col gap-3">
            <h2
              className="text-sm font-bold uppercase tracking-wide flex items-center gap-2"
              style={{ color: 'var(--text-primary)', fontFamily: 'IBM Plex Serif, serif' }}
            >
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              §2. Local Biophysical Attribution (TreeSHAP Decomposition)
            </h2>

            <div
              className="rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--border-subtle)' }}
            >
              {/* Table header */}
              <div
                className="grid text-[10px] font-mono uppercase px-3 py-2"
                style={{
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-muted)',
                  borderBottom: '1px solid var(--border-subtle)',
                  gridTemplateColumns: '3fr 1fr 3fr',
                }}
              >
                <span>Driver Feature</span>
                <span className="text-right">SHAP Contribution</span>
                <span className="text-right pr-2">Visual Bar</span>
              </div>

              {ward.shapDrivers.map((d: any, i: number) => {
                const isHeat = d.isHeating;
                const barPct = Math.min(100, (Math.abs(d.value) / 2.0) * 100);
                return (
                  <div
                    key={i}
                    className="grid items-center px-3 py-2"
                    style={{
                      gridTemplateColumns: '3fr 1fr 3fr',
                      borderBottom: i < ward.shapDrivers.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-elevated)',
                    }}
                  >
                    <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                      {d.name}
                    </span>
                    <span
                      className="text-xs font-mono font-bold tabular-nums text-right"
                      style={{ color: isHeat ? '#D94E34' : '#0D9488' }}
                    >
                      {isHeat ? '+' : ''}{d.value.toFixed(2)} °C
                    </span>
                    <div className="flex items-center justify-end pr-2">
                      <div
                        className="h-2 rounded-sm"
                        style={{
                          width: `${barPct}%`,
                          maxWidth: '100%',
                          background: isHeat ? '#D94E34' : '#0D9488',
                          opacity: 0.8,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── §3: Simulated Mitigation & Energy ROI ────────── */}
          <section className="flex flex-col gap-3">
            <h2
              className="text-sm font-bold uppercase tracking-wide flex items-center gap-2"
              style={{ color: 'var(--text-primary)', fontFamily: 'IBM Plex Serif, serif' }}
            >
              <Thermometer className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              §3. Simulated Mitigation Scenario &amp; Energy ROI
            </h2>

            <div
              className="p-4 rounded-lg"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
            >
              <div
                className="text-sm font-bold"
                style={{ color: 'var(--text-primary)', fontFamily: 'IBM Plex Serif, serif' }}
              >
                {scenario.name}
              </div>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {scenario.description} targeting building rooftops, public rights-of-way, and open spaces across Ward {ward.id}.
              </p>

              <div className="grid grid-cols-3 gap-3 mt-3">
                {[
                  { label: 'Baseline LST', value: `${ward.meanLst.toFixed(1)} °C`, color: '#D94E34' },
                  { label: 'ΔT Cooling', value: `${cooling.toFixed(2)} °C`, color: '#0D9488' },
                  { label: 'Post-Int. LST', value: `${postLst.toFixed(1)} °C`, color: 'var(--text-primary)' },
                  { label: 'HVAC Savings', value: `${energySaving.toFixed(2)} kWh/m²/yr`, color: '#F59E0B' },
                  { label: 'ΔNDVI Applied', value: `+${scenario.deltaNdvi.toFixed(2)}`, color: '#0D9488' },
                  { label: 'ΔAlbedo Applied', value: `+${scenario.deltaAlbedo.toFixed(2)}`, color: '#F59E0B' },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="px-3 py-2.5 rounded-lg text-center"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                  >
                    <div className="text-[10px] uppercase font-mono" style={{ color: 'var(--text-muted)' }}>
                      {m.label}
                    </div>
                    <div
                      className="text-lg font-bold font-mono tabular-nums mt-0.5"
                      style={{ color: m.color }}
                    >
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── §4: DCPR 2034 Municipal Implementation ────────── */}
          <section className="flex flex-col gap-3">
            <h2
              className="text-sm font-bold uppercase tracking-wide flex items-center gap-2"
              style={{ color: 'var(--text-primary)', fontFamily: 'IBM Plex Serif, serif' }}
            >
              <Shield className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              §4. DCPR 2034 Municipal Implementation Directives
            </h2>

            <ol
              className="flex flex-col gap-2 text-xs leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              {directives.map((d, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-lg"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                >
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold mt-0.5"
                    style={{ background: 'var(--accent-primary)', color: '#fff' }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>{d}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* ── Document Footer / Verification ─────────────── */}
          <div
            className="pt-4 flex items-center justify-between text-[10px] font-mono"
            style={{
              borderTop: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
            }}
          >
            <div>
              <div>AI-Driven UHI Downscaling Platform v0.2.0</div>
              <div>XGBoost Spatial Downscaler · 1.2 km Block K-Fold Validation · 383,640 IMD Records</div>
            </div>
            <div className="text-right">
              <div style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>BMC Climate Action Cell</div>
              <div>Dossier ID: {dossierId}</div>
              <div>CRS: EPSG:32643 · GSD: 30m</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
