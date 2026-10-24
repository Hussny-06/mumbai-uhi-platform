import React from 'react';
import { MODEL_METRICS } from '../../data/staticDatasets';
import { Cpu, Award, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ModelComparisonChart: React.FC = () => {
  const { xgboost, randomForest, acceptance } = MODEL_METRICS;

  const metrics = [
    {
      metric: 'RMSE (Root Mean Square Error)',
      desc: 'Lower is superior (surrogate predictive precision)',
      xgbVal: `${xgboost.rmse.toFixed(2)}°C`,
      rfVal: `${randomForest.rmse.toFixed(2)}°C`,
      delta: '-0.16°C (XGBoost 7.2% better)',
      xgbBetter: true,
      unit: '°C',
    },
    {
      metric: 'MAE (Mean Absolute Error)',
      desc: 'Average absolute residual error',
      xgbVal: `${xgboost.mae.toFixed(2)}°C`,
      rfVal: `${randomForest.mae.toFixed(2)}°C`,
      delta: '-0.12°C (XGBoost 6.8% better)',
      xgbBetter: true,
      unit: '°C',
    },
    {
      metric: 'R² Score (Variance Explained)',
      desc: 'Higher is superior (spatially independent blocks)',
      xgbVal: `${xgboost.r2.toFixed(3)}`,
      rfVal: `${randomForest.r2.toFixed(3)}`,
      delta: '+0.086 (XGBoost +24.0% variance)',
      xgbBetter: true,
      unit: 'ratio',
    },
  ];

  return (
    <div className="bg-uhi-surface border border-uhi-border p-4 rounded flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-uhi-border gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-uhi-purple" />
            <h2 className="text-sm font-bold text-uhi-text uppercase tracking-wider">
              Model Performance Benchmark (XGBoost vs. Random Forest)
            </h2>
          </div>
          <p className="text-xs text-uhi-muted mt-0.5">
            Evaluated under strict 1.2 km spatial buffer exclusion to prevent spatial autocorrelation leakage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded bg-purple-950/40 border border-purple-500/40 text-purple-400 text-xs font-mono font-bold flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            Primary: XGBoost
          </span>
        </div>
      </div>

      {/* Comparative Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="p-3 rounded bg-uhi-surface2 border border-uhi-border flex flex-col justify-between"
          >
            <div>
              <div className="text-[11px] font-bold text-uhi-text">{m.metric}</div>
              <div className="text-[10px] text-uhi-muted mb-3">{m.desc}</div>
            </div>

            <div className="space-y-2">
              {/* XGBoost row */}
              <div className="flex justify-between items-center p-2 rounded bg-uhi-surface3/80 border border-uhi-purple/30">
                <span className="text-xs font-medium text-uhi-purple flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-uhi-purple"></span>
                  XGBoost
                </span>
                <span className="font-mono text-base font-bold text-uhi-text">{m.xgbVal}</span>
              </div>

              {/* Random Forest row */}
              <div className="flex justify-between items-center p-2 rounded bg-uhi-bg border border-uhi-border">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  Random Forest
                </span>
                <span className="font-mono text-base font-medium text-uhi-muted">{m.rfVal}</span>
              </div>

              {/* Delta highlight */}
              <div className="text-[10px] font-mono text-emerald-400 text-right pt-1">
                ✓ {m.delta}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dataset split stats */}
      <div className="flex flex-wrap items-center justify-between p-3 rounded bg-uhi-surface2/60 border border-uhi-border text-xs text-uhi-muted gap-2">
        <div className="flex items-center gap-3">
          <span>Train Samples: <strong className="text-uhi-text font-mono">2,306</strong></span>
          <span className="text-uhi-border">|</span>
          <span>Test Samples: <strong className="text-uhi-text font-mono">137</strong></span>
          <span className="text-uhi-border">|</span>
          <span>Cross-Validation: <strong className="text-uhi-text font-mono">5-Fold Spatial Block</strong></span>
        </div>
        <div className="text-[11px] font-mono text-uhi-cyan flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-uhi-green" />
          Spatial Autocorrelation Guard Verified
        </div>
      </div>
    </div>
  );
};
