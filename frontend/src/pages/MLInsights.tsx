import React, { useState } from 'react';
import { ModelComparisonChart } from '../components/charts/ModelComparisonChart';
import { SpatialBlockKFoldExplainer } from '../components/analytics/SpatialBlockKFoldExplainer';
import { ShapBarChart } from '../components/charts/ShapBarChart';
import { CITY_WIDE_SHAP_DRIVERS, WARDS_DATA } from '../data/staticDatasets';
import { Ward } from '../types';
import { BrainCircuit, Cpu } from 'lucide-react';

export const MLInsights: React.FC = () => {
  const [shapScope, setShapScope] = useState<'citywide' | 'ward' | 'polygon'>('citywide');
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
    if (shapScope === 'polygon') {
      return [
        { name: 'NDBI (Built-up Depaving)', value: -0.85, isHeating: false },
        { name: 'NDVI (Canopy Augmentation)', value: -0.64, isHeating: false },
        { name: 'Albedo (Cool Roof Reflectance)', value: -0.48, isHeating: false },
        { name: 'Distance to Coast buffer', value: -0.15, isHeating: false },
        { name: 'Micro-elevation gradient', value: 0.05, isHeating: true },
      ];
    }
    return CITY_WIDE_SHAP_DRIVERS.map((d: any) => ({
      name: d.name,
      value: parseFloat(d.deltaT.replace('°C', '')),
      isHeating: d.isPositive,
    }));
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto bg-uhi-bg p-4 lg:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-uhi-border gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-uhi-purple" />
            <h1 className="text-base font-bold text-uhi-text uppercase tracking-wider">
              Model Intelligence & Downscaling Performance
            </h1>
          </div>
          <p className="text-xs text-uhi-muted mt-0.5">
            Extreme Gradient Boosting (XGBoost) 30-meter downscaling engine benchmarked against Random Forest with TreeSHAP explainability
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-uhi-surface2 border border-uhi-purple/40 text-uhi-purple text-xs font-mono font-bold flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            Primary Engine: XGBoost Regressor
          </span>
        </div>
      </div>

      {/* Model Performance Comparison Section */}
      <ModelComparisonChart />

      {/* Spatial Block K-Fold Cross-Validation Section */}
      <SpatialBlockKFoldExplainer />

      {/* Dedicated SHAP Explainability Section: WHY IS THIS AREA HOT? */}
      <div className="bg-uhi-surface border border-uhi-border p-4 rounded flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-uhi-border gap-3">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-uhi-cyan font-bold">
              TreeSHAP Biophysical Attribution
            </div>
            <h2 className="text-sm font-bold text-uhi-text uppercase tracking-wide mt-0.5">
              Why Is This Area Hot? (Feature Decomposition)
            </h2>
          </div>

          {/* Scope Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-uhi-surface2 p-0.5 rounded border border-uhi-border text-xs font-mono">
              <button
                onClick={() => setShapScope('citywide')}
                className={`px-3 py-1 rounded transition-colors ${
                  shapScope === 'citywide'
                    ? 'bg-uhi-cyan text-uhi-bg font-bold'
                    : 'text-uhi-muted hover:text-uhi-text'
                }`}
              >
                Citywide
              </button>
              <button
                onClick={() => setShapScope('ward')}
                className={`px-3 py-1 rounded transition-colors ${
                  shapScope === 'ward'
                    ? 'bg-uhi-cyan text-uhi-bg font-bold'
                    : 'text-uhi-muted hover:text-uhi-text'
                }`}
              >
                Ward
              </button>
              <button
                onClick={() => setShapScope('polygon')}
                className={`px-3 py-1 rounded transition-colors ${
                  shapScope === 'polygon'
                    ? 'bg-uhi-cyan text-uhi-bg font-bold'
                    : 'text-uhi-muted hover:text-uhi-text'
                }`}
              >
                Selected Polygon
              </button>
            </div>

            {shapScope === 'ward' && (
              <select
                value={selectedWardId}
                onChange={(e) => setSelectedWardId(e.target.value)}
                className="bg-uhi-surface2 border border-uhi-border rounded px-2.5 py-1 text-xs text-uhi-text focus:outline-none focus:border-uhi-cyan font-mono cursor-pointer"
              >
                {WARDS_DATA.map((w: Ward) => (
                  <option key={w.id} value={w.id}>
                    Ward {w.id} - {w.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* SHAP Diverging Bar Chart */}
        <ShapBarChart
          drivers={getActiveShapDrivers()}
          title={`Biophysical SHAP Drivers: ${
            shapScope === 'citywide'
              ? 'Citywide Greater Mumbai Average'
              : shapScope === 'ward'
              ? `Ward ${selectedWard.id} (${selectedWard.name})`
              : 'Intervention Polygon Area'
          }`}
          subtitle="Additive Shapley contributions to predicted local Land Surface Temperature (°C)"
        />
      </div>
    </div>
  );
};
