import React, { useState } from 'react';
import { ClimateTrendChart } from '../components/charts/ClimateTrendChart';
import { MonthlyHeatmap } from '../components/charts/MonthlyHeatmap';
import { ModelComparisonChart } from '../components/charts/ModelComparisonChart';
import { SpatialBlockKFoldExplainer } from '../components/analytics/SpatialBlockKFoldExplainer';
import { ShapBarChart } from '../components/charts/ShapBarChart';
import { CITY_WIDE_SHAP_DRIVERS, WARDS_DATA } from '../data/staticDatasets';
import { Ward } from '../types';
import { MANN_KENDALL_METRICS, MODEL_METRICS } from '../data/staticDatasets';

type Mode = 'climatology' | 'mlshap';
type ShapScope = 'citywide' | 'ward';

export const ClimatologyValidation: React.FC = () => {
  const [mode, setMode] = useState<Mode>('climatology');
  const [shapScope, setShapScope] = useState<ShapScope>('citywide');
  const [selectedWardId, setSelectedWardId] = useState<string>('G/N');

  const selectedWard = WARDS_DATA.find((w: Ward) => w.id === selectedWardId) || WARDS_DATA[0];

  const getActiveShapDrivers = () => {
    if (shapScope === 'ward') {
      return selectedWard.shapDrivers.map((d: any) => ({
        name: d.name,
        value: d.value,
        isHeating: d.isHeating,
      }));
    }
    return CITY_WIDE_SHAP_DRIVERS.map((d: any) => ({
      name: d.name,
      value: parseFloat(d.deltaT.replace('°C', '')),
      isHeating: d.isPositive,
    }));
  };

  const mk = MANN_KENDALL_METRICS;
  const xgb = MODEL_METRICS.xgboost;

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={{ height: 'calc(100vh - 3rem)' }}
    >
      {/* ── Sub-Header Bar ───────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-2"
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* Mode Selector */}
        <div
          className="flex rounded-md overflow-hidden"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          <button
            onClick={() => setMode('climatology')}
            className="px-4 py-1.5 text-xs font-medium transition-all"
            style={{
              background: mode === 'climatology' ? 'var(--accent-primary)' : 'var(--bg-elevated)',
              color: mode === 'climatology' ? '#fff' : 'var(--text-muted)',
              borderRight: '1px solid var(--border-subtle)',
              fontFamily: 'IBM Plex Sans, sans-serif',
            }}
          >
            Mode A: 28-Yr IMD Climatology (1997–2024)
          </button>
          <button
            onClick={() => setMode('mlshap')}
            className="px-4 py-1.5 text-xs font-medium transition-all"
            style={{
              background: mode === 'mlshap' ? 'var(--accent-primary)' : 'var(--bg-elevated)',
              color: mode === 'mlshap' ? '#fff' : 'var(--text-muted)',
              fontFamily: 'IBM Plex Sans, sans-serif',
            }}
          >
            Mode B: Spatial ML &amp; TreeSHAP XAI
          </button>
        </div>

        {/* Right statistical strip */}
        <div
          className="flex items-center gap-3 text-[11px] font-mono"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>N = 383,640</span>
          <span
            className="px-2 py-0.5 rounded"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
          >
            Mann-Kendall Z = <span style={{ color: 'var(--accent-primary)' }}>+{mk.zStatistic.toFixed(3)}</span>
            {' '}(p = {mk.pValue.toExponential(2)})
          </span>
          <span
            className="px-2 py-0.5 rounded"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
          >
            XGB RMSE = <span style={{ color: '#0D9488' }}>{xgb.rmse.toFixed(2)}°C</span>
          </span>
        </div>
      </div>

      {/* ── Workspace Canvas ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin' }}>
        {mode === 'climatology' ? (
          /* ════════ MODE A: 28-YR IMD CLIMATOLOGY ════════ */
          <div className="grid gap-4" style={{ gridTemplateColumns: '7fr 5fr' }}>
            {/* Left 7 cols: Annual Trend Chart + Amplification Callout */}
            <div className="flex flex-col gap-4">
              <ClimateTrendChart />

              {/* Urban Amplification Synthesis */}
              <div
                className="p-4 rounded-lg"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"
                  style={{ color: 'var(--accent-primary)', fontFamily: 'IBM Plex Serif, serif' }}
                >
                  Urban Amplification Synthesis
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  Metropolitan Mumbai exhibits a statistically robust warming trend of{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>+{mk.sensSlopeDecade.toFixed(2)}°C/decade</strong>{' '}
                  (Sen's slope = +{mk.sensSlopeYear.toFixed(4)}°C/yr, Z = +{mk.zStatistic.toFixed(3)},
                  p = {mk.pValue.toExponential(2)}). Urbanization-induced nocturnal surface heat traps and loss
                  of vegetative evapotranspiration in central industrial wards (Dharavi, Govandi, Kurla)
                  exacerbate baseline climatological warming by up to{' '}
                  <strong style={{ color: 'var(--accent-primary)' }}>+5.7°C to +6.1°C</strong>{' '}
                  above regional background sea-breeze temperatures.
                </p>
              </div>
            </div>

            {/* Right 5 cols: Monthly Heatmap + Climatological Norms */}
            <div className="flex flex-col gap-4">
              <MonthlyHeatmap />
            </div>
          </div>
        ) : (
          /* ════════ MODE B: SPATIAL ML & TREESHAP ════════ */
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {/* Left 6 cols: Model Comparison + Spatial K-Fold */}
            <div className="flex flex-col gap-4">
              <ModelComparisonChart />
              <SpatialBlockKFoldExplainer />
            </div>

            {/* Right 6 cols: TreeSHAP Explorer */}
            <div className="flex flex-col gap-4">
              <div
                className="rounded-lg p-4 flex flex-col gap-4"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {/* Section header */}
                <div
                  className="pb-3"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <div
                    className="text-xs uppercase tracking-widest font-mono font-bold"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    TreeSHAP Attribution
                  </div>
                  <h2
                    className="text-sm font-bold mt-1 uppercase tracking-wide"
                    style={{ color: 'var(--text-primary)', fontFamily: 'IBM Plex Serif, serif' }}
                  >
                    Multi-Scope Biophysical Explorer
                  </h2>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Additive Shapley contributions to predicted 30m Land Surface Temperature (°C)
                  </p>
                </div>

                {/* Scope Switcher */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div
                    className="flex rounded-md overflow-hidden"
                    style={{ border: '1px solid var(--border-subtle)' }}
                  >
                    {(['citywide', 'ward'] as ShapScope[]).map((scope, idx) => (
                      <button
                        key={scope}
                        onClick={() => setShapScope(scope)}
                        className="px-3 py-1.5 text-xs font-mono transition-all"
                        style={{
                          background: shapScope === scope ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                          color: shapScope === scope ? '#fff' : 'var(--text-muted)',
                          borderRight: idx < 1 ? '1px solid var(--border-subtle)' : 'none',
                        }}
                      >
                        {scope === 'citywide' ? 'Citywide' : 'Single Ward'}
                      </button>
                    ))}
                  </div>

                  {shapScope === 'ward' && (
                    <div className="relative">
                      <select
                        value={selectedWardId}
                        onChange={(e) => setSelectedWardId(e.target.value)}
                        className="appearance-none pl-2 pr-6 py-1.5 rounded text-xs cursor-pointer focus:outline-none"
                        style={{
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          fontFamily: 'IBM Plex Mono, monospace',
                        }}
                      >
                        {WARDS_DATA.map((w: Ward) => (
                          <option key={w.id} value={w.id}>
                            Ward {w.id} — {w.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* SHAP Chart */}
                <ShapBarChart
                  drivers={getActiveShapDrivers()}
                  title={
                    shapScope === 'citywide'
                      ? 'Citywide SHAP Drivers — Greater Mumbai Average'
                      : `Ward ${selectedWard.id} (${selectedWard.name}) — Local Drivers`
                  }
                  subtitle="Additive Shapley contributions to predicted LST (°C)"
                />
              </div>

              {/* Key Insight Card */}
              <div
                className="p-4 rounded-lg"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  className="text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--accent-primary)', fontFamily: 'IBM Plex Serif, serif' }}
                >
                  XAI Insight
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  NDBI (Built-up Density) contributes the largest single heating effect at{' '}
                  <strong style={{ color: 'var(--accent-primary)' }}>+1.41°C</strong>{' '}
                  (Φ importance = 0.383). NDVI and fractional vegetation cover jointly provide{' '}
                  <strong style={{ color: '#0D9488' }}>−0.98°C</strong>{' '}
                  in combined evapotranspiration-driven cooling, while coastal proximity at Colaba
                  and Bandra suppresses LST by an additional{' '}
                  <strong style={{ color: '#0D9488' }}>−0.36°C</strong>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
