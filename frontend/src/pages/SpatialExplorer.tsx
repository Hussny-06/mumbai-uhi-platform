import React, { useState, useMemo } from 'react';
import { useUhiStore } from '../stores/useUhiStore';
import { MumbaiMap } from '../components/map/MumbaiMap';
import { WardInspectorPanel } from '../components/analytics/WardInspectorPanel';
import { WARDS_DATA, CITY_WIDE_SHAP_DRIVERS } from '../data/staticDatasets';
import { getInfernoColor, getRiskBadgeStyle } from '../utils/colorScales';
import { exportAllWardsCsv } from '../utils/exportUtils';
import { Ward } from '../types';
import {
  Search,
  ArrowUpDown,
  Download,
  ArrowUpRight,
} from 'lucide-react';

type SortField = 'meanLst' | 'uhi' | 'ndvi' | 'ndbi' | 'popDensity';

export const SpatialExplorer: React.FC = () => {
  const {
    wards,
    shapDrivers,
    selectedWard,
    hoveredWard,
    setHoveredWard,
    focusWard,
    activeLayer,
    selectedDate,
    setActivePage,
  } = useUhiStore();

  const activeWards = wards.length > 0 ? wards : WARDS_DATA;
  const activeShapDrivers = shapDrivers.length > 0 ? shapDrivers : CITY_WIDE_SHAP_DRIVERS;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortField>('meanLst');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredWards = useMemo(() => {
    return activeWards
      .filter((w: Ward) => {
        const matchSearch =
          w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchZone =
          selectedZone === 'All' ||
          w.zone.toLowerCase().includes(selectedZone.toLowerCase());
        return matchSearch && matchZone;
      })
      .sort((a: Ward, b: Ward) => {
        const valA = a[sortBy];
        const valB = b[sortBy];
        return sortOrder === 'desc' ? valB - valA : valA - valB;
      });
  }, [activeWards, searchQuery, selectedZone, sortBy, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Dynamic 4th column readout based on active map layer or sort field
  const getDynamicColumnConfig = () => {
    if (sortBy === 'popDensity') {
      return {
        label: 'Density',
        sortKey: 'popDensity' as SortField,
        render: (w: Ward) => `${(w.popDensity / 1000).toFixed(1)}k`,
      };
    }
    if (activeLayer === 'ndvi' || sortBy === 'ndvi') {
      return {
        label: 'NDVI',
        sortKey: 'ndvi' as SortField,
        render: (w: Ward) => w.ndvi.toFixed(2),
      };
    }
    if (activeLayer === 'albedo') {
      return {
        label: 'Albedo',
        sortKey: 'ndbi' as SortField,
        render: (w: Ward) => w.albedo.toFixed(2),
      };
    }
    if (activeLayer === 'mndwi') {
      return {
        label: 'MNDWI',
        sortKey: 'ndvi' as SortField,
        render: (w: Ward) => w.mndwi.toFixed(2),
      };
    }
    if (activeLayer === 'elevation') {
      return {
        label: 'Elev',
        sortKey: 'meanLst' as SortField,
        render: (w: Ward) => `${w.elev.toFixed(0)}m`,
      };
    }
    return {
      label: 'NDBI',
      sortKey: 'ndbi' as SortField,
      render: (w: Ward) => w.ndbi.toFixed(2),
    };
  };

  const dynCol = getDynamicColumnConfig();

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-3rem)] w-full overflow-y-auto lg:overflow-hidden bg-[var(--bg-canvas)] p-3 gap-3">
      {/* LEFT / CENTER MAP CANVAS (62% Width on Desktop) */}
      <div className="w-full lg:w-[62%] h-[48vh] min-h-[340px] lg:h-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-card overflow-hidden relative shrink-0">
        <MumbaiMap className="w-full h-full" />
      </div>

      {/* RIGHT SYNCHRONIZED ANALYTICAL DOCK (38% Width on Desktop) */}
      <div className="w-full lg:w-[38%] flex-1 lg:h-full flex flex-col lg:overflow-hidden">
        {selectedWard ? (
          <WardInspectorPanel />
        ) : (
          <div className="flex flex-col h-full gap-3 lg:overflow-hidden">
            {/* 1. Search, Zone Filter & Registry Export Header Card */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3 shadow-card space-y-2.5 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-sm font-semibold text-[var(--text-primary)]">
                    BMC Municipal Ward Registry
                  </h2>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Click any ward to inspect local TreeSHAP drivers &amp; surface profile
                  </p>
                </div>

                <button
                  onClick={() => exportAllWardsCsv(activeWards, selectedDate)}
                  title="Download 24-Ward Microclimate Registry CSV"
                  className="px-2.5 py-1 rounded bg-[var(--bg-canvas)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>CSV</span>
                </button>
              </div>

              {/* Controls Row */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter ward ID or locality..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Filter ward ID or locality"
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] focus:border-[var(--border-strong)] rounded pl-8 pr-2.5 py-1 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
                  />
                </div>

                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  aria-label="Filter by Municipal Zone"
                  className="bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer"
                >
                  <option value="All">All Zones (24)</option>
                  <option value="Island City">Island City</option>
                  <option value="Western Suburbs">Western Suburbs</option>
                  <option value="Eastern Suburbs">Eastern Suburbs</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as SortField);
                    setSortOrder('desc');
                  }}
                  aria-label="Sort Wards By"
                  className="bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded px-2 py-1 text-xs font-mono text-[var(--text-primary)] focus:outline-none cursor-pointer"
                >
                  <option value="meanLst">Sort: LST</option>
                  <option value="uhi">Sort: UHI ΔT</option>
                  <option value="ndbi">Sort: NDBI</option>
                  <option value="ndvi">Sort: NDVI</option>
                  <option value="popDensity">Sort: Density</option>
                </select>
              </div>
            </div>

            {/* 2. Compact 5-Column 24-Ward Registry Table (Zero Horizontal Scroll) */}
            <div className="flex-1 min-h-[260px] lg:min-h-0 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-card overflow-hidden flex flex-col">
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-[10px] font-mono uppercase tracking-wider border-b border-[var(--border-subtle)] select-none">
                    <tr>
                      <th className="py-2 pl-3 pr-2">Ward</th>
                      <th
                        onClick={() => toggleSort('meanLst')}
                        className="py-2 px-2 cursor-pointer hover:text-[var(--text-primary)]"
                      >
                        <div className="flex items-center gap-1">
                          <span>Mean LST</span>
                          <ArrowUpDown className="w-2.5 h-2.5" />
                        </div>
                      </th>
                      <th
                        onClick={() => toggleSort('uhi')}
                        className="py-2 px-2 cursor-pointer hover:text-[var(--text-primary)]"
                      >
                        <div className="flex items-center gap-1">
                          <span>ΔT</span>
                          <ArrowUpDown className="w-2.5 h-2.5" />
                        </div>
                      </th>
                      <th
                        onClick={() => toggleSort(dynCol.sortKey)}
                        className="py-2 px-2 cursor-pointer hover:text-[var(--text-primary)]"
                      >
                        <div className="flex items-center gap-1">
                          <span>{dynCol.label}</span>
                          <ArrowUpDown className="w-2.5 h-2.5" />
                        </div>
                      </th>
                      <th className="py-2 pl-2 pr-3 text-right">Risk</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[var(--border-subtle)] text-xs">
                    {filteredWards.map((w) => {
                      const isHovered = hoveredWard?.id === w.id;
                      const lstPct = Math.min(
                        100,
                        Math.max(8, ((w.meanLst - 29.0) / 9.0) * 100)
                      );
                      const badge = getRiskBadgeStyle(w.risk);

                      return (
                        <tr
                          key={w.id}
                          onMouseEnter={() => setHoveredWard(w)}
                          onMouseLeave={() => setHoveredWard(null)}
                          onClick={() => focusWard(w.id)}
                          className={`cursor-pointer transition-colors ${
                            isHovered
                              ? 'bg-[var(--bg-elevated)]'
                              : 'hover:bg-[var(--bg-elevated)]/60'
                          }`}
                        >
                          {/* Col 1: ID + Name */}
                          <td className="py-2 pl-3 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="w-7 text-center font-mono text-[10px] font-semibold px-1 py-0.5 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] shrink-0">
                                {w.id}
                              </span>
                              <div className="min-w-0">
                                <div className="font-medium text-[var(--text-primary)] truncate max-w-[125px] xl:max-w-[160px]">
                                  {w.name}
                                </div>
                                <div className="text-[10px] text-[var(--text-muted)] truncate">
                                  {w.zone}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Col 2: Mean LST + Inline Thermal Sparkbar */}
                          <td className="py-2 px-2 font-mono">
                            <div className="font-semibold text-[var(--text-primary)] text-[11px]">
                              {w.meanLst.toFixed(1)}°C
                            </div>
                            <div className="h-1 w-14 bg-[var(--bg-canvas)] rounded-sm overflow-hidden mt-0.5 border border-[var(--border-subtle)]">
                              <div
                                style={{
                                  width: `${lstPct}%`,
                                  backgroundColor: getInfernoColor(w.meanLst),
                                }}
                                className="h-full"
                              />
                            </div>
                          </td>

                          {/* Col 3: UHI Anomaly ΔT */}
                          <td className="py-2 px-2 font-mono text-[11px] font-semibold">
                            <span
                              style={{ color: w.uhi > 0 ? '#D94E34' : '#0D9488' }}
                            >
                              {w.uhi > 0 ? `+${w.uhi.toFixed(1)}` : w.uhi.toFixed(1)}°
                            </span>
                          </td>

                          {/* Col 4: Dynamic Secondary Metric */}
                          <td className="py-2 px-2 font-mono text-[11px] text-[var(--text-secondary)]">
                            {dynCol.render(w)}
                          </td>

                          {/* Col 5: Risk Badge */}
                          <td className="py-2 pl-2 pr-3 text-right">
                            <span
                              style={{
                                backgroundColor: badge.bg,
                                color: badge.text,
                                borderColor: badge.border,
                              }}
                              className="inline-block text-[9px] font-mono uppercase font-semibold px-1.5 py-0.5 rounded border"
                            >
                              {w.risk === 'Cooling Sink' ? 'Sink' : w.risk}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Pinned Bottom Card: Citywide TreeSHAP Top Drivers */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3 shadow-card space-y-2 shrink-0">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-1.5">
                <span className="font-serif text-xs font-semibold text-[var(--text-primary)]">
                  Citywide TreeSHAP Biophysical Drivers
                </span>
                <button
                  onClick={() => setActivePage('science')}
                  className="text-[10px] font-mono text-[var(--accent-primary)] hover:underline flex items-center gap-0.5"
                >
                  <span>Model &amp; XAI</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1.5">
                {activeShapDrivers.slice(0, 4).map((d, i) => {
                  const barColor = d.isPositive ? '#D94E34' : '#0D9488';
                  const widthPct = Math.min(100, (d.importance / 0.4) * 100);
                  return (
                    <div key={i} className="space-y-0.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-[var(--text-secondary)] truncate">
                          {d.name}
                        </span>
                        <span
                          style={{ color: barColor }}
                          className="font-mono font-semibold"
                        >
                          {d.deltaT}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[var(--bg-canvas)] rounded-sm overflow-hidden border border-[var(--border-subtle)]">
                        <div
                          style={{
                            width: `${widthPct}%`,
                            backgroundColor: barColor,
                          }}
                          className="h-full rounded-sm"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
