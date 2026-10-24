import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { CLIMATE_ANNUAL, MANN_KENDALL_METRICS } from '../../data/staticDatasets';
import { TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const ClimateTrendChart: React.FC = () => {
  return (
    <div className="bg-uhi-surface border border-uhi-border p-4 rounded flex flex-col gap-4">
      {/* Header and Mann-Kendall Summary Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-uhi-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            <h2 className="text-base font-bold text-uhi-text tracking-wide uppercase">
              Mumbai Climate Trend (1997–2024)
            </h2>
          </div>
          <p className="text-xs text-uhi-muted mt-0.5">
            Long-term monotonic warming trend analyzed across 383,640 IMD weather station records
          </p>
        </div>

        {/* Mann-Kendall Test Scientific Annotation Card */}
        <div className="bg-uhi-surface2 border border-uhi-borderLight p-2.5 rounded flex items-center gap-4 text-xs font-mono">
          <div>
            <div className="text-[10px] uppercase text-uhi-cyan font-bold tracking-wider">
              Mann-Kendall Test
            </div>
            <div className="text-uhi-text text-[11px] font-semibold flex items-center gap-1.5 mt-0.5">
              <span>Z = +{MANN_KENDALL_METRICS.zStatistic.toFixed(3)}</span>
              <span className="text-uhi-border">|</span>
              <span className="text-red-400">p = 3.64 × 10⁻⁵</span>
            </div>
          </div>

          <div className="border-l border-uhi-border pl-4">
            <div className="text-[10px] uppercase text-uhi-muted tracking-wider">
              Sen's Slope
            </div>
            <div className="text-orange-400 text-[11px] font-bold mt-0.5">
              +{MANN_KENDALL_METRICS.sensSlopeYear}°C / year ({MANN_KENDALL_METRICS.sensSlopeDecade}°C / decade)
            </div>
          </div>

          <div className="border-l border-uhi-border pl-4 hidden sm:block">
            <div className="text-[10px] uppercase text-uhi-muted tracking-wider">
              Significance
            </div>
            <div className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              p &lt; 0.001 (Pass)
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Large Line Chart */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={CLIMATE_ANNUAL}
            margin={{ top: 15, right: 20, bottom: 20, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#162334" vertical={false} />
            <XAxis
              dataKey="year"
              stroke="#64748B"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              dy={8}
            />
            <YAxis
              domain={[26.5, 29.5]}
              stroke="#64748B"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              unit="°C"
              dx={-4}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-uhi-surface border border-uhi-borderLight p-3 rounded shadow-xl text-xs font-mono">
                      <div className="text-uhi-cyan font-bold mb-1 border-b border-uhi-border pb-1">
                        Year: {label}
                      </div>
                      <div className="space-y-1">
                        <div className="text-uhi-text flex justify-between gap-4">
                          <span>Annual Mean:</span>
                          <span className="font-bold">{data.meanTemp.toFixed(2)} °C</span>
                        </div>
                        <div className="text-orange-400 flex justify-between gap-4">
                          <span>Sen's Trendline:</span>
                          <span className="font-bold">{data.trendTemp.toFixed(2)} °C</span>
                        </div>
                        <div className="text-uhi-muted flex justify-between gap-4 pt-1 border-t border-uhi-border/60">
                          <span>RH Mean:</span>
                          <span>{data.rhMean}%</span>
                        </div>
                        <div className="text-uhi-muted flex justify-between gap-4">
                          <span>VPD Mean:</span>
                          <span>{data.vpdMean} kPa</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontFamily: 'monospace' }}
            />

            {/* Baseline 27.5 reference */}
            <ReferenceLine y={27.5} stroke="#334155" strokeDasharray="4 4" label={{ value: '27.5°C Ref', fill: '#64748B', fontSize: 10 }} />

            {/* Annual Observed Mean Temperature */}
            <Line
              type="monotone"
              dataKey="meanTemp"
              name="Annual Mean Temperature (°C)"
              stroke="#38BDF8"
              strokeWidth={2}
              dot={{ r: 3, fill: '#00D2FF', stroke: '#07111F' }}
              activeDot={{ r: 6, fill: '#00D2FF', stroke: '#FFF' }}
            />

            {/* Sen's Slope Linear Regression Trend */}
            <Line
              type="linear"
              dataKey="trendTemp"
              name="Sen's Slope Trend (+0.44°C/decade)"
              stroke="#F97316"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Scientific Footnote */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-uhi-muted pt-2 border-t border-uhi-border/60 gap-2">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-uhi-surface2 border border-uhi-border text-uhi-text font-mono">
            N = 28 Observations
          </span>
          <span>Station: Santacruz & Colaba IMD Composite (1997–2024)</span>
        </div>
        <div className="text-right text-orange-400 font-mono">
          Monotonic Warming Trend Confirmed (Z &gt; +1.96, p &lt; 0.05)
        </div>
      </div>
    </div>
  );
};
