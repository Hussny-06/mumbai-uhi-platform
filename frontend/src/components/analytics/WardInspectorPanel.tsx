import React, { useMemo } from 'react';
import { useUhiStore } from '../../stores/useUhiStore';
import { WARDS_DATA } from '../../data/staticDatasets';
import { getInfernoColor, getRiskBadgeStyle } from '../../utils/colorScales';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  FileText,
  ArrowUpRight,
} from 'lucide-react';

export const WardInspectorPanel: React.FC = () => {
  const { selectedWard, setSelectedWard, focusWard, setActivePage } = useUhiStore();

  const sortedByLst = useMemo(
    () => [...WARDS_DATA].sort((a, b) => b.meanLst - a.meanLst),
    []
  );

  const cityMeans = useMemo(() => {
    const n = WARDS_DATA.length || 1;
    return {
      lst: WARDS_DATA.reduce((s, w) => s + w.meanLst, 0) / n,
      ndvi: WARDS_DATA.reduce((s, w) => s + w.ndvi, 0) / n,
      ndbi: WARDS_DATA.reduce((s, w) => s + w.ndbi, 0) / n,
      albedo: WARDS_DATA.reduce((s, w) => s + w.albedo, 0) / n,
      mndwi: WARDS_DATA.reduce((s, w) => s + w.mndwi, 0) / n,
      elev: WARDS_DATA.reduce((s, w) => s + w.elev, 0) / n,
      distCoast: WARDS_DATA.reduce((s, w) => s + w.distCoast, 0) / n,
    };
  }, []);

  if (!selectedWard) return null;

  const currentRankIdx = sortedByLst.findIndex((w) => w.id === selectedWard.id);
  const rankNumber = currentRankIdx >= 0 ? currentRankIdx + 1 : 1;
  const riskStyle = getRiskBadgeStyle(selectedWard.risk);

  const handleStepWard = (dir: -1 | 1) => {
    const nextIdx = (currentRankIdx + dir + sortedByLst.length) % sortedByLst.length;
    focusWard(sortedByLst[nextIdx].id);
  };

  const biophysicalRows = [
    {
      label: 'Surface Temperature (LST)',
      wardVal: `${selectedWard.meanLst.toFixed(1)} °C`,
      cityVal: `${cityMeans.lst.toFixed(1)} °C`,
      pct: Math.min(100, Math.max(4, ((selectedWard.meanLst - 29.0) / 9.0) * 100)),
      cityPct: ((cityMeans.lst - 29.0) / 9.0) * 100,
      color: getInfernoColor(selectedWard.meanLst),
    },
    {
      label: 'Vegetation Canopy (NDVI)',
      wardVal: selectedWard.ndvi.toFixed(2),
      cityVal: cityMeans.ndvi.toFixed(2),
      pct: Math.min(100, Math.max(4, (selectedWard.ndvi / 0.65) * 100)),
      cityPct: (cityMeans.ndvi / 0.65) * 100,
      color: '#31A354',
    },
    {
      label: 'Built-Up Density (NDBI)',
      wardVal: selectedWard.ndbi.toFixed(2),
      cityVal: cityMeans.ndbi.toFixed(2),
      pct: Math.min(100, Math.max(4, ((selectedWard.ndbi + 0.15) / 0.75) * 100)),
      cityPct: ((cityMeans.ndbi + 0.15) / 0.75) * 100,
      color: '#D94E34',
    },
    {
      label: 'Broadband Albedo (α)',
      wardVal: selectedWard.albedo.toFixed(2),
      cityVal: cityMeans.albedo.toFixed(2),
      pct: Math.min(100, Math.max(4, ((selectedWard.albedo - 0.08) / 0.14) * 100)),
      cityPct: ((cityMeans.albedo - 0.08) / 0.14) * 100,
      color: '#D97706',
    },
    {
      label: 'Surface Moisture (MNDWI)',
      wardVal: selectedWard.mndwi.toFixed(2),
      cityVal: cityMeans.mndwi.toFixed(2),
      pct: Math.min(100, Math.max(4, ((selectedWard.mndwi + 0.25) / 0.35) * 100)),
      cityPct: ((cityMeans.mndwi + 0.25) / 0.35) * 100,
      color: '#0D9488',
    },
    {
      label: 'Coast Buffer & Elevation',
      wardVal: `${selectedWard.distCoast.toFixed(1)} km · ${selectedWard.elev.toFixed(0)} m`,
      cityVal: `${cityMeans.distCoast.toFixed(1)} km · ${cityMeans.elev.toFixed(0)} m`,
      pct: Math.min(100, Math.max(4, (selectedWard.distCoast / 12.0) * 100)),
      cityPct: (cityMeans.distCoast / 12.0) * 100,
      color: '#57554F',
    },
  ];

  const maxShapAbs = Math.max(
    1.5,
    ...selectedWard.shapDrivers.map((d) => Math.abs(d.value))
  );

  return (
    <div className="flex flex-col h-full gap-3 overflow-hidden">
      {/* Top Navigation & Ward Stepper Bar */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3.5 py-2.5 flex items-center justify-between shadow-card shrink-0">
        <button
          onClick={() => setSelectedWard(null)}
          className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All 24 BMC Wards</span>
        </button>

        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-[var(--text-muted)] mr-1">
            Rank #{rankNumber} / {WARDS_DATA.length}
          </span>
          <button
            onClick={() => handleStepWard(-1)}
            title="Previous Ward by Thermal Rank"
            className="p-1 rounded bg-[var(--bg-canvas)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleStepWard(1)}
            title="Next Ward by Thermal Rank"
            className="p-1 rounded bg-[var(--bg-canvas)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable Inspector Body */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
        {/* 1. Ward Identity & Baseline Vulnerability Card */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-4 shadow-card space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[var(--accent-subtle)] text-[var(--accent-primary)] font-mono text-xs font-semibold border border-[var(--accent-primary)]/30">
                  Ward {selectedWard.id}
                </span>
                <span className="text-xs font-mono text-[var(--text-secondary)]">
                  {selectedWard.zone}
                </span>
              </div>
              <h2 className="font-serif text-lg font-semibold text-[var(--text-primary)] mt-1 leading-snug">
                {selectedWard.name}
              </h2>
            </div>

            <span
              style={{
                backgroundColor: riskStyle.bg,
                color: riskStyle.text,
                borderColor: riskStyle.border,
              }}
              className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded border shrink-0"
            >
              {selectedWard.risk}
            </span>
          </div>

          {/* 4-Column Tabular Summary Strip */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[var(--border-subtle)] font-mono">
            <div className="p-2 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
              <div className="text-[9px] font-sans uppercase text-[var(--text-muted)]">
                Mean LST
              </div>
              <div className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
                {selectedWard.meanLst.toFixed(1)}°C
              </div>
            </div>

            <div className="p-2 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
              <div className="text-[9px] font-sans uppercase text-[var(--text-muted)]">
                UHI (ΔT)
              </div>
              <div
                style={{ color: selectedWard.uhi > 0 ? '#D94E34' : '#0D9488' }}
                className="text-sm font-semibold mt-0.5"
              >
                {selectedWard.uhi > 0
                  ? `+${selectedWard.uhi.toFixed(1)}`
                  : selectedWard.uhi.toFixed(1)}
                °C
              </div>
            </div>

            <div className="p-2 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
              <div className="text-[9px] font-sans uppercase text-[var(--text-muted)]">
                Area
              </div>
              <div className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
                {selectedWard.area.toFixed(1)} km²
              </div>
            </div>

            <div className="p-2 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
              <div className="text-[9px] font-sans uppercase text-[var(--text-muted)]">
                Density
              </div>
              <div className="text-xs font-semibold text-[var(--text-primary)] mt-1 truncate">
                {(selectedWard.popDensity / 1000).toFixed(1)}k/km²
              </div>
            </div>
          </div>
        </div>

        {/* 2. Biophysical Profile Matrix vs. Mumbai Mean */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-4 shadow-card space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
            <div>
              <h3 className="font-serif text-xs font-semibold text-[var(--text-primary)]">
                Biophysical Surface Profile vs. City Mean
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                30m downscaled indices compared against Greater Mumbai baseline
              </p>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              Ward / City Avg
            </span>
          </div>

          <div className="space-y-2.5">
            {biophysicalRows.map((row, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)] text-[11px]">
                    {row.label}
                  </span>
                  <div className="font-mono text-[11px]">
                    <strong className="text-[var(--text-primary)]">{row.wardVal}</strong>
                    <span className="text-[var(--text-muted)]"> / {row.cityVal}</span>
                  </div>
                </div>

                {/* Comparative Bar with City Mean Tick */}
                <div className="relative h-1.5 w-full bg-[var(--bg-canvas)] rounded-sm overflow-hidden border border-[var(--border-subtle)]">
                  <div
                    style={{ width: `${row.pct}%`, backgroundColor: row.color }}
                    className="h-full rounded-sm transition-all duration-300"
                  />
                  <div
                    style={{ left: `${Math.min(98, Math.max(2, row.cityPct))}%` }}
                    title={`Mumbai City Mean: ${row.cityVal}`}
                    className="absolute top-0 bottom-0 w-0.5 bg-[var(--text-primary)] opacity-70"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Local TreeSHAP Attribution Bars */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-4 shadow-card space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
            <div>
              <h3 className="font-serif text-xs font-semibold text-[var(--text-primary)]">
                Local TreeSHAP Forcing Attribution
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Why Ward {selectedWard.id} deviates from baseline (°C Shapley contribution)
              </p>
            </div>
            <button
              onClick={() => setActivePage('science')}
              className="text-[10px] font-mono text-[var(--accent-primary)] hover:underline flex items-center gap-0.5 shrink-0"
            >
              <span>XAI Model</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {selectedWard.shapDrivers.map((d, i) => {
              const widthPct = Math.min(100, (Math.abs(d.value) / maxShapAbs) * 100);
              const isHeat = d.isHeating || d.value > 0;
              const barColor = isHeat ? '#D94E34' : '#0D9488';

              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--text-primary)] font-medium truncate">
                      {d.name}
                    </span>
                    <span
                      style={{ color: barColor }}
                      className="font-mono font-semibold"
                    >
                      {d.value > 0 ? `+${d.value.toFixed(2)}` : d.value.toFixed(2)} °C
                    </span>
                  </div>

                  {/* Diverging Center-Zero Bar */}
                  <div className="relative h-2 w-full bg-[var(--bg-canvas)] rounded-sm border border-[var(--border-subtle)] overflow-hidden">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--border-strong)] z-10" />
                    {isHeat ? (
                      <div
                        style={{
                          left: '50%',
                          width: `${widthPct / 2}%`,
                          backgroundColor: barColor,
                        }}
                        className="absolute top-0 bottom-0 rounded-r-sm"
                      />
                    ) : (
                      <div
                        style={{
                          right: '50%',
                          width: `${widthPct / 2}%`,
                          backgroundColor: barColor,
                        }}
                        className="absolute top-0 bottom-0 rounded-l-sm"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px]">
            <span className="text-[var(--text-muted)]">Dominant Biophysical Mechanism:</span>
            <span className="font-mono font-medium text-[var(--text-primary)]">
              {selectedWard.driver}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Pinned Action CTA Footer */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3 shadow-card flex items-center gap-2 shrink-0">
        <button
          onClick={() => setActivePage('studio')}
          className="flex-1 py-2 px-3 rounded bg-[var(--accent-primary)] hover:opacity-95 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-opacity shadow-sm"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Simulate Cooling in {selectedWard.id}</span>
        </button>

        <button
          onClick={() => setActivePage('dossier')}
          className="py-2 px-3 rounded bg-[var(--bg-canvas)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <span>Policy Dossier</span>
        </button>
      </div>
    </div>
  );
};
