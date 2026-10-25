import React, { useState } from 'react';
import { Layers, CheckCircle, Info } from 'lucide-react';

/* ─── Mumbai 5-Block Spatial Partition SVG ─────────────────────────────────
 * A crisp, technical cartographic SVG illustrating how Greater Mumbai is
 * partitioned into 5 regional fold-blocks with a 1.2 km dead-zone halo.
 * Replaces the banned `animate-pulse border-red-400/70` circle.
 * ─────────────────────────────────────────────────────────────────────────── */

const BLOCKS = [
  { id: 'N',  label: 'North',     x: 68,  y: 12,  w: 56, h: 40, color: '#0D9488' },
  { id: 'NE', label: 'North-East',x: 128, y: 12,  w: 46, h: 40, color: '#F59E0B' },
  { id: 'C',  label: 'Central',   x: 68,  y: 56,  w: 106,h: 44, color: '#D94E34' }, // TEST fold
  { id: 'SW', label: 'South-West',x: 20,  y: 104, w: 74, h: 48, color: '#60A5FA' },
  { id: 'SE', label: 'South-East',x: 98,  y: 104, w: 76, h: 48, color: '#A78BFA' },
];

const TEST_FOLD_ID = 'C';

function SpatialBlockSvg({ bufferKm }: { bufferKm: number }) {
  const expand = bufferKm * 7; // px per km (scaled to SVG viewport)
  return (
    <svg
      viewBox="0 0 200 180"
      className="w-full max-w-[260px]"
      xmlns="http://www.w3.org/2000/svg"
      style={{ fontFamily: 'IBM Plex Mono, monospace' }}
    >
      {/* Background grid */}
      <defs>
        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="var(--border-subtle)" strokeWidth="0.4" />
        </pattern>
        {/* Hatching for dead-zone */}
        <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="#D94E34" strokeWidth="0.8" strokeOpacity="0.5" />
        </pattern>
      </defs>

      <rect width="200" height="180" fill="var(--bg-elevated)" rx="4" />
      <rect width="200" height="180" fill="url(#grid)" />

      {/* Mumbai coastline outline (simplified polygon) */}
      <polygon
        points="18,24 78,6 180,10 182,170 20,170"
        fill="none"
        stroke="var(--border-strong)"
        strokeWidth="0.8"
        strokeDasharray="3,2"
      />

      {/* Dead-zone halo for TEST fold, drawn BEFORE the blocks */}
      {(() => {
        const test = BLOCKS.find((b) => b.id === TEST_FOLD_ID)!;
        return (
          <rect
            x={test.x - expand}
            y={test.y - expand}
            width={test.w + expand * 2}
            height={test.h + expand * 2}
            fill="url(#hatch)"
            stroke="#D94E34"
            strokeWidth="1"
            strokeDasharray="3,2"
            rx="3"
            opacity="0.7"
          />
        );
      })()}

      {/* Block rectangles */}
      {BLOCKS.map((b) => {
        const isTest = b.id === TEST_FOLD_ID;
        return (
          <g key={b.id}>
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              fill={b.color}
              fillOpacity={isTest ? 0.35 : 0.18}
              stroke={b.color}
              strokeWidth={isTest ? 2 : 1}
              rx="2"
            />
            <text
              x={b.x + b.w / 2}
              y={b.y + b.h / 2 - 3}
              textAnchor="middle"
              fontSize="7"
              fontWeight="700"
              fill={b.color}
            >
              {b.label}
            </text>
            {isTest && (
              <text
                x={b.x + b.w / 2}
                y={b.y + b.h / 2 + 7}
                textAnchor="middle"
                fontSize="6"
                fill={b.color}
                fontWeight="500"
              >
                TEST FOLD
              </text>
            )}
          </g>
        );
      })}

      {/* Buffer label */}
      {(() => {
        const test = BLOCKS.find((b) => b.id === TEST_FOLD_ID)!;
        const labelX = test.x + test.w + expand + 4;
        const labelY = test.y + test.h / 2;
        return (
          <>
            <line
              x1={test.x + test.w + expand}
              y1={labelY}
              x2={labelX - 1}
              y2={labelY}
              stroke="#D94E34"
              strokeWidth="0.8"
            />
            <text
              x={labelX}
              y={labelY - 2}
              fontSize="5.5"
              fill="#D94E34"
              fontWeight="600"
            >
              {bufferKm} km
            </text>
            <text
              x={labelX}
              y={labelY + 6}
              fontSize="5"
              fill="#D94E34"
              opacity="0.85"
            >
              dead-zone
            </text>
          </>
        );
      })()}

      {/* Training sample dots (scattered outside buffer) */}
      {[
        [28, 35], [42, 130], [155, 28], [148, 140], [35, 155], [170, 100],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2.5" fill="#0D9488" opacity="0.85" />
      ))}
      {/* Excluded (within buffer) samples */}
      {[
        [80, 50], [140, 60], [120, 108],
      ].map(([cx, cy], i) => (
        <circle key={`ex${i}`} cx={cx} cy={cy} r="2.5" fill="#D94E34" opacity="0.7" />
      ))}

      {/* Legend */}
      <g transform="translate(6,162)">
        <circle cx="4" cy="4" r="2.5" fill="#0D9488" />
        <text x="10" y="7" fontSize="5.5" fill="var(--text-muted)">Train</text>
        <circle cx="38" cy="4" r="2.5" fill="#D94E34" />
        <text x="44" y="7" fontSize="5.5" fill="var(--text-muted)">Excluded</text>
        <rect x="80" y="1" width="6" height="6" fill="url(#hatch)" stroke="#D94E34" strokeWidth="0.8" />
        <text x="90" y="7" fontSize="5.5" fill="var(--text-muted)">Buffer Halo</text>
      </g>
    </svg>
  );
}

export const SpatialBlockKFoldExplainer: React.FC = () => {
  const [activeBufferKm, setActiveBufferKm] = useState<number>(1.2);

  return (
    <div
      className="rounded-lg p-4 flex flex-col gap-4"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Header */}
      <div
        className="pb-3"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
          <h2
            className="text-sm font-bold uppercase tracking-wider"
            style={{ color: 'var(--text-primary)', fontFamily: 'IBM Plex Serif, serif' }}
          >
            Spatial Block K-Fold Validation
          </h2>
        </div>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Geographic dead-zone exclusion preventing spatial autocorrelation leakage
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* SVG Cartographic Illustration */}
        <div
          className="p-3 rounded-lg flex flex-col items-center gap-3"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <SpatialBlockSvg bufferKm={activeBufferKm} />

          {/* Buffer selector buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
              Exclusion Radius:
            </span>
            <div
              className="flex rounded overflow-hidden"
              style={{ border: '1px solid var(--border-subtle)' }}
            >
              {[0.5, 1.2, 2.0].map((b, idx) => (
                <button
                  key={b}
                  onClick={() => setActiveBufferKm(b)}
                  className="px-2.5 py-1 text-[11px] font-mono transition-colors"
                  style={{
                    background: activeBufferKm === b ? 'var(--accent-primary)' : 'var(--bg-surface)',
                    color: activeBufferKm === b ? '#fff' : 'var(--text-muted)',
                    borderRight: idx < 2 ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  {b} km
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scientific Explanation */}
        <div className="space-y-2 text-xs leading-relaxed">
          <div
            className="p-3 rounded-lg"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
          >
            <div
              className="font-semibold flex items-center gap-1.5 mb-1 text-[11px]"
              style={{ color: 'var(--accent-primary)', fontFamily: 'IBM Plex Mono, monospace' }}
            >
              <Info className="w-3.5 h-3.5" />
              Tobler's First Law of Geography:
            </div>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              "Everything is related to everything else, but near things are more related than distant things."
              Standard random K-Fold splits adjacent 30m pixels into train/test, causing inflated performance
              estimates via spatial autocorrelation leakage.
            </p>
          </div>

          <div className="space-y-2 text-[11px]">
            {[
              {
                title: 'Spatial Partitioning:',
                body: 'Metropolitan Mumbai is partitioned into 5 geographically contiguous regional blocks.',
              },
              {
                title: `${activeBufferKm} km Buffer Exclusion:`,
                body: `All samples within a ${(activeBufferKm * 1000).toFixed(0)}-metre halo of the validation fold are purged from the training set.`,
              },
              {
                title: 'True Generalizability:',
                body: 'Yields honest RMSE = 2.05°C and R² = 0.445 under real-world municipal transferability conditions.',
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-2">
                <CheckCircle
                  className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                  style={{ color: '#0D9488' }}
                />
                <div style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{item.title} </strong>
                  {item.body}
                </div>
              </div>
            ))}
          </div>

          {/* Metric pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { label: 'N Train', value: '2,306' },
              { label: 'N Test', value: '137' },
              { label: 'K Folds', value: '5' },
              { label: 'RMSE', value: '2.05°C' },
              { label: 'R²', value: '0.445' },
            ].map((m) => (
              <div
                key={m.label}
                className="px-2 py-1 rounded text-[10px] font-mono"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>{m.label}: </span>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
