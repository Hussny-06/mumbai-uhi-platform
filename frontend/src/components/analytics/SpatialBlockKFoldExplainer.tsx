import React, { useState } from 'react';
import { ShieldAlert, Layers, MapPin, CheckCircle, Info } from 'lucide-react';

export const SpatialBlockKFoldExplainer: React.FC = () => {
  const [activeBufferKm, setActiveBufferKm] = useState<number>(1.2);

  return (
    <div className="bg-uhi-surface border border-uhi-border p-4 rounded flex flex-col gap-4">
      {/* Header */}
      <div className="pb-3 border-b border-uhi-border">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-uhi-cyan" />
          <h2 className="text-sm font-bold text-uhi-text uppercase tracking-wider">
            Spatial Block K-Fold Validation Methodology
          </h2>
        </div>
        <p className="text-xs text-uhi-muted mt-0.5">
          Eliminating spatial leakage in remote sensing models via geographic dead-zone exclusion
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
        {/* Interactive Diagram / Visualization */}
        <div className="bg-uhi-surface2 border border-uhi-border p-4 rounded flex flex-col items-center justify-center relative min-h-[220px]">
          {/* Spatial Grid Illustration */}
          <div className="relative w-64 h-48 border border-uhi-borderLight rounded bg-uhi-bg p-2 overflow-hidden flex items-center justify-center">
            {/* Grid background */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-5 gap-1 opacity-20 p-2">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="border border-uhi-cyan rounded-sm"></div>
              ))}
            </div>

            {/* Test Block */}
            <div className="relative z-10 w-20 h-20 bg-uhi-cyan/20 border-2 border-uhi-cyan rounded flex flex-col items-center justify-center text-center p-1">
              <span className="text-[10px] font-mono font-bold text-uhi-cyan uppercase">
                Test Fold
              </span>
              <span className="text-[8px] text-uhi-text">Target Block</span>
            </div>

            {/* Buffer Exclusion Halo */}
            <div className="absolute z-5 w-36 h-36 border-2 border-dashed border-red-400/70 rounded-full flex items-center justify-center animate-pulse pointer-events-none">
              <span className="absolute -top-3 px-1.5 bg-uhi-surface text-[8px] font-mono text-red-400 border border-red-500/40 rounded">
                {activeBufferKm} km Dead-Zone Buffer
              </span>
            </div>

            {/* Surrounding Training Points */}
            <div className="absolute top-2 left-2 flex items-center gap-1 text-[9px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Train (Spur)
            </div>
            <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[9px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Train (Uncorrelated)
            </div>
            <div className="absolute top-6 right-6 flex items-center gap-1 text-[8px] font-mono text-red-400/80">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Excluded (Leakage)
            </div>
          </div>

          {/* Interactive buffer adjuster */}
          <div className="w-full mt-3 flex items-center justify-between text-xs font-mono">
            <span className="text-uhi-muted text-[11px]">Exclusion Radius:</span>
            <div className="flex items-center gap-2">
              {[0.5, 1.2, 2.0].map((b) => (
                <button
                  key={b}
                  onClick={() => setActiveBufferKm(b)}
                  className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
                    activeBufferKm === b
                      ? 'bg-uhi-cyan text-uhi-bg border-uhi-cyan font-bold'
                      : 'bg-uhi-surface3 text-uhi-muted border-uhi-border hover:text-uhi-text'
                  }`}
                >
                  {b} km
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scientific Explanation Panel */}
        <div className="space-y-2 text-xs leading-relaxed text-uhi-text">
          <div className="p-2.5 rounded bg-uhi-surface3/50 border border-uhi-border">
            <div className="font-semibold text-uhi-cyan flex items-center gap-1.5 mb-1 text-[11px]">
              <Info className="w-3.5 h-3.5" />
              Tobler's First Law of Geography:
            </div>
            <p className="text-uhi-muted text-[11px]">
              "Everything is related to everything else, but near things are more related than distant things."
              Standard random K-Fold cross validation splits adjacent pixels (30m apart) into train and test sets, causing massive over-optimistic performance inflation (spatial autocorrelation leakage).
            </p>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-uhi-green shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Spatial Partitioning: </strong>
                Metropolitan Mumbai is partitioned into 5 geographically contiguous regional blocks.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-uhi-green shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">1.2 km Buffer Exclusion: </strong>
                All samples within a 1,200-meter buffer margin of the validation fold are purged from the training set.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-uhi-green shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">True Generalizability: </strong>
                Yields genuine out-of-sample RMSE of 2.05°C and R² of 0.445 under real-world municipal transferability.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
