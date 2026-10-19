import React from 'react';
import { useUhiStore } from '../stores/useUhiStore';
import { KpiMetricCard } from '../components/cards/KpiMetricCard';
import { MumbaiMap } from '../components/map/MumbaiMap';
import { WardDetailDrawer } from '../components/analytics/WardDetailDrawer';
import { CITY_WIDE_SHAP_DRIVERS, WARDS_DATA } from '../data/staticDatasets';
import { 
  Flame, 
  MapPin, 
  Database, 
  Cpu, 
  ShieldCheck, 
  SlidersHorizontal,
  Compass,
  ArrowRight,
  Layers
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { setActivePage, selectedWard, focusWard } = useUhiStore();

  const topHottestWards = [...WARDS_DATA]
    .sort((a, b) => b.meanLst - a.meanLst)
    .slice(0, 4);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto bg-uhi-bg">
      {/* Top Section: Hero Banner & Compact KPI Grid */}
      <div className="p-4 lg:p-6 pb-2 space-y-4">
        {/* Hero Callout Banner */}
        <div className="bg-gradient-to-r from-uhi-surface2 via-uhi-surface to-uhi-surface3 border border-uhi-border p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-uhi-cyan font-bold">
                MUMBAI MICROCLIMATE INTELLIGENCE
              </span>
            </div>
            <h2 className="text-lg lg:text-xl font-bold text-uhi-text mt-1 tracking-tight">
              Mumbai is Warming. AI Shows Where. Simulation Shows What To Do.
            </h2>
            <p className="text-xs text-uhi-muted mt-1 max-w-2xl">
              High-resolution 30-meter downscaled surface thermal modeling across all 24 BMC municipal wards, combining 27+ years of IMD meteorological records with Landsat 8/9 & Sentinel-2 Earth observation data.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActivePage('heatmap')}
              className="px-3.5 py-2 rounded bg-uhi-surface3 hover:bg-uhi-surface border border-uhi-border hover:border-uhi-cyan text-xs font-semibold text-uhi-text transition-all flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-uhi-cyan" />
              <span>Explore Heat Map</span>
            </button>
            <button
              onClick={() => setActivePage('simulator')}
              className="px-4 py-2 rounded bg-uhi-cyan hover:bg-cyan-300 text-uhi-bg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-950/40"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Run What-If Simulation</span>
            </button>
          </div>
        </div>

        {/* 6 Compact KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiMetricCard
            label="CITY AREA"
            value="437.71 km²"
            sublabel="Greater Mumbai (BMC)"
            badge="100% GSD"
            badgeColor="cyan"
            icon={<Compass className="w-3.5 h-3.5" />}
          />
          <KpiMetricCard
            label="BMC WARDS"
            value="24"
            sublabel="Administrative Units"
            badge="Municipal"
            badgeColor="cyan"
            icon={<MapPin className="w-3.5 h-3.5" />}
          />
          <KpiMetricCard
            label="PREDICTORS"
            value="17"
            sublabel="Multi-source Features"
            badge="Landsat + IMD"
            badgeColor="purple"
            icon={<Layers className="w-3.5 h-3.5" />}
          />
          <KpiMetricCard
            label="IMD RECORDS"
            value="383,640"
            sublabel="1997–2024 Records"
            badge="28 Years"
            badgeColor="green"
            icon={<Database className="w-3.5 h-3.5" />}
          />
          <KpiMetricCard
            label="MODEL"
            value="XGBoost"
            sublabel="Spatial Downscaler"
            badge="R² = 0.445"
            badgeColor="purple"
            icon={<Cpu className="w-3.5 h-3.5" />}
          />
          <KpiMetricCard
            label="SPATIAL VALIDATION"
            value="1.2 km"
            sublabel="Block K-Fold Buffer"
            badge="Zero Leakage"
            badgeColor="green"
            icon={<ShieldCheck className="w-3.5 h-3.5" />}
          />
        </div>
      </div>

      {/* Main Map + Right Side Thermal Intelligence Panel */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-[560px] p-4 lg:p-6 pt-2 gap-4">
        {/* Map occupies ~65-70% of screen */}
        <div className="flex-1 min-h-[460px] lg:min-h-full rounded border border-uhi-border overflow-hidden relative shadow-2xl">
          <MumbaiMap />
        </div>

        {/* Right Side: Thermal Intelligence Panel */}
        <div className="w-full lg:w-96 flex flex-col gap-3 shrink-0">
          {/* Top Hotspots Summary Card */}
          <div className="bg-uhi-surface border border-uhi-border p-4 rounded flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-uhi-border">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-uhi-text">
                  Thermal Hotspots (Pre-Monsoon 2024)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-red-400 font-bold">
                Max: 37.3°C
              </span>
            </div>

            <div className="space-y-2">
              {topHottestWards.map((w) => (
                <button
                  key={w.id}
                  onClick={() => focusWard(w.id)}
                  className="w-full p-2.5 rounded bg-uhi-surface2 hover:bg-uhi-surface3 border border-uhi-border text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-uhi-cyan">
                        Ward {w.id}
                      </span>
                      <span className="text-xs font-medium text-uhi-text group-hover:text-white">
                        {w.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-uhi-muted mt-0.5">
                      NDBI: {w.ndbi.toFixed(2)} | UHI: +{w.uhi.toFixed(1)}°C
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-sm font-bold text-red-400">
                      {w.meanLst.toFixed(1)}°C
                    </div>
                    <div className="text-[9px] text-red-500 uppercase font-semibold">
                      {w.risk}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* City-Wide SHAP Feature Importance */}
          <div className="flex-1 bg-uhi-surface border border-uhi-border p-4 rounded flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-uhi-border mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-uhi-text">
                  Citywide TreeSHAP Drivers
                </h3>
                <button
                  onClick={() => setActivePage('ml')}
                  className="text-[10px] font-mono text-uhi-cyan hover:underline flex items-center gap-1"
                >
                  <span>Model Details</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2">
                {CITY_WIDE_SHAP_DRIVERS.slice(0, 5).map((d: any, i: number) => (
                  <div key={i} className="text-xs">
                    <div className="flex justify-between items-center text-[11px] mb-0.5">
                      <span className="text-uhi-text font-medium truncate max-w-[190px]">
                        {d.name}
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          d.isPositive ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {d.deltaT}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-uhi-bg rounded-full overflow-hidden border border-uhi-border/40">
                      <div
                        style={{ width: `${(d.importance / 0.4) * 100}%` }}
                        className={`h-full ${
                          d.isPositive ? 'bg-red-500' : 'bg-emerald-400'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-uhi-border/80 flex items-center justify-between text-[11px] text-uhi-muted">
              <span>Primary Positive Driver:</span>
              <strong className="text-red-400 font-mono">NDBI Built-up (+1.41°C)</strong>
            </div>
          </div>
        </div>

        {/* Selected Ward Drawer if active */}
        {selectedWard && <WardDetailDrawer />}
      </div>
    </div>
  );
};
