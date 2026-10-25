import React from 'react';
import { WARDS_DATA } from '../../data/staticDatasets';
import { Ward } from '../../types';

interface WardMiniMapSvgProps {
  /** The currently selected/active ward to highlight in Terracotta #D94E34 */
  activeWardId: string;
}

/**
 * WardMiniMapSvg renders all 24 BMC wards in a compact 160×220px SVG.
 * The active ward is highlighted in the Terracotta accent color (#D94E34).
 * Other wards are rendered in muted fill using CSS variables.
 *
 * Ward positions are derived from normalized lat/lon bounding box:
 *   Lat: 18.89°N – 19.28°N  (y axis, inverted — north at top)
 *   Lon: 72.77°E – 73.00°E  (x axis)
 */

const LAT_MIN = 18.89;
const LAT_MAX = 19.28;
const LON_MIN = 72.77;
const LON_MAX = 73.00;

const SVG_W = 160;
const SVG_H = 210;
const PAD = 8;

function latToY(lat: number): number {
  // Invert Y: lat_max → top (PAD), lat_min → bottom (SVG_H - PAD)
  const t = (lat - LAT_MIN) / (LAT_MAX - LAT_MIN);
  return SVG_H - PAD - t * (SVG_H - PAD * 2);
}

function lonToX(lon: number): number {
  const t = (lon - LON_MIN) / (LON_MAX - LON_MIN);
  return PAD + t * (SVG_W - PAD * 2);
}

export const WardMiniMapSvg: React.FC<WardMiniMapSvgProps> = ({ activeWardId }) => {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px',
        fontFamily: 'IBM Plex Mono, monospace',
        display: 'block',
      }}
    >
      {/* Background grid */}
      <defs>
        <pattern id="miniGrid" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 8 0 L 0 0 0 8" fill="none" stroke="var(--border-subtle)" strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect width={SVG_W} height={SVG_H} fill="url(#miniGrid)" />

      {/* Mumbai coastline outline */}
      <polyline
        points={`${PAD},${SVG_H - PAD} ${PAD},${PAD} ${SVG_W - PAD},${PAD} ${SVG_W - PAD},${SVG_H - PAD}`}
        fill="none"
        stroke="var(--border-strong)"
        strokeWidth="0.6"
        strokeDasharray="2,1.5"
        opacity="0.5"
      />

      {/* Ward dots */}
      {WARDS_DATA.map((ward: Ward) => {
        const cx = lonToX(ward.lon);
        const cy = latToY(ward.lat);
        const isActive = ward.id === activeWardId;

        return (
          <g key={ward.id}>
            {/* Outer ring for active ward */}
            {isActive && (
              <circle
                cx={cx}
                cy={cy}
                r={9}
                fill="#D94E34"
                fillOpacity="0.15"
                stroke="#D94E34"
                strokeWidth="1"
              />
            )}
            {/* Ward dot */}
            <circle
              cx={cx}
              cy={cy}
              r={isActive ? 5 : 3.5}
              fill={isActive ? '#D94E34' : 'var(--bg-surface)'}
              stroke={isActive ? '#D94E34' : 'var(--border-strong)'}
              strokeWidth={isActive ? 1.5 : 0.8}
            />
            {/* Ward ID label (only active ward) */}
            {isActive && (
              <>
                <text
                  x={cx + 8}
                  y={cy + 2}
                  fontSize="6.5"
                  fontWeight="700"
                  fill="#D94E34"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  {ward.id}
                </text>
                <text
                  x={cx + 8}
                  y={cy + 10}
                  fontSize="5.5"
                  fill="#D94E34"
                  fontFamily="IBM Plex Mono, monospace"
                  opacity="0.85"
                >
                  {ward.name.slice(0, 10)}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* Legend */}
      <g transform={`translate(${PAD}, ${SVG_H - PAD - 12})`}>
        <circle cx="4" cy="4" r="4" fill="#D94E34" />
        <text x="10" y="7" fontSize="5.5" fill="var(--text-muted)" fontFamily="IBM Plex Mono, monospace">
          Active Ward
        </text>
        <circle cx="70" cy="4" r="3.2" fill="var(--bg-surface)" stroke="var(--border-strong)" strokeWidth="0.8" />
        <text x="77" y="7" fontSize="5.5" fill="var(--text-muted)" fontFamily="IBM Plex Mono, monospace">
          Other Wards
        </text>
      </g>
    </svg>
  );
};
