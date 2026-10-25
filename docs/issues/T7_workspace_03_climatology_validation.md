# Issue [T7]: Build Workspace 03 — 28-Yr IMD Climatology & Spatial ML / TreeSHAP Workbench

- **Title:** `feat(ui): [T7] Build Workspace 03 — 28-Yr IMD Climatology & Spatial ML / TreeSHAP Workbench`
- **Labels:** `ui-makeover`, `workspace-03`, `frontend`, `analytics`
- **Assignee:** *Unassigned*
- **Estimated Effort:** `6.0 – 7.5 hrs (Manual)` | `~35 – 40 mins (AI-Assisted)`
- **Depends On:** Foundation Tasks `T1–T3` (Does not depend on `T4` Map Engine — can start immediately after `T3`!)
- **Architecture Spec:** [`docs/development/ui_redesign_specification.md`](../development/ui_redesign_specification.md)

---

## Objective
Consolidate and redesign the legacy `ClimateTrends.tsx` and `MLInsights.tsx` pages into **Workspace 03: Climatology & Model Validation** (`frontend/src/pages/ClimatologyValidation.tsx`).

This workspace is organized as a **Segmented 2-Mode Research Workbench**:
- **Mode A: 28-Year IMD Synoptic Climatology (1997–2024, N = 383,640)**
- **Mode B: Spatial Block K-Fold Validation & Multi-Scope TreeSHAP Attribution**

---

## Target Files
- **Create:** `frontend/src/pages/ClimatologyValidation.tsx`
- **Refactor:** `frontend/src/components/charts/ClimateTrendChart.tsx`
- **Refactor:** `frontend/src/components/charts/MonthlyHeatmap.tsx`
- **Refactor:** `frontend/src/components/charts/ModelComparisonChart.tsx`
- **Refactor:** `frontend/src/components/analytics/SpatialBlockKFoldExplainer.tsx`
- **Refactor:** `frontend/src/components/charts/ShapBarChart.tsx`
- **Update:** `frontend/src/App.tsx` (mount `<ClimatologyValidation />` when `activePage === 'science'`)
- **Deprecate / Remove after verification:** `ClimateTrends.tsx`, `MLInsights.tsx`

---

## Spatial Layout & Section Placement Wireframe

```text
+--------------------------------------------------------------------------------------------------+
| Sub-Header Bar: [Mode A: 28-Yr IMD Climatology (1997–2024)] [Mode B: Spatial ML & TreeSHAP XAI]  |
| Right Statistical Strip: N = 383,640 · Mann-Kendall Z = +4.129 (p = 3.64e-5) · XGB RMSE = 2.05°C |
+------------------------------------------------------+-------------------------------------------+
| [WHEN MODE A IS ACTIVE: 28-YEAR IMD CLIMATOLOGY] (12-Col Grid: 7 Cols Left / 5 Cols Right)       |
|                                                      |                                           |
| LEFT COLUMN (7 Cols / ~58% Width):                   | RIGHT COLUMN (5 Cols / ~42% Width):       |
| 1. Annual Mean Temperature & Sen's Slope Chart       | 1. 28 × 12 Monthly Anomaly Matrix         |
|    - Recharts ComposedChart (1997–2024)              |    - Perceptual Vermilion-to-Teal cells   |
|    - Observed Mean (°C) + Sen's Slope (+0.44°C/dec)  |      via getDivergingDeltaColor(anomaly)  |
|    - Secondary metric toggle pills:                  |    - Hover readout bar showing Year,      |
|      [None] [Relative Humidity %] [VPD kPa]          |      Month, Mean °C, and Anomaly ΔT       |
| 2. Urban Amplification Synthesis Card                | 2. 12-Month Climatological Norms Strip    |
|    - Editorial serif synthesis comparing background  |    - Compact 12-column/grid summary of    |
|      climatic trend (+0.44°C/dec) vs. UHI (+6.1°C)   |      monthly mean, ±σ, and min/max        |
+------------------------------------------------------+-------------------------------------------+
| [WHEN MODE B IS ACTIVE: SPATIAL ML & TREESHAP XAI] (12-Col Grid: 6 Cols Left / 6 Cols Right)     |
|                                                      |                                           |
| LEFT COLUMN (6 Cols / 50% Width):                    | RIGHT COLUMN (6 Cols / 50% Width):        |
| 1. Model Benchmark Comparison Table & Error Bars     | 1. Multi-Scope TreeSHAP Explorer Card     |
|    - Clean scientific table comparing XGBoost vs.    |    - Scope Switcher:                      |
|      Random Forest across RMSE, MAE, R², N_train,    |      [Citywide] [Single Ward] [Compare 2] |
|      N_test, and 1.2 km Spatial Buffer               |    - Diverging horizontal bar chart:      |
| 2. Spatial Block K-Fold Geometry Card                |      +Heating (#D94E34 Vermilion) right   |
|    - Precision SVG diagram showing Mumbai partitioned|      -Cooling (#0D9488 Teal) left         |
|      into 5 regional blocks + 1.2 km dead-zone halo  |    - When [Compare 2] is active, renders  |
|    - Interactive [0.5 km] [1.2 km] [2.0 km] selector |      paired bars for Ward A vs. Ward B    |
+------------------------------------------------------+-------------------------------------------+
```

---

## Design System & Styling Contract (Mandatory)
1. **Dual-Theme CSS Variables Only:** Use `var(--bg-canvas)`, `var(--bg-surface)`, `var(--bg-elevated)`, `var(--border-subtle)`, `var(--text-primary)`, `var(--text-secondary)`, and `var(--accent-primary)` (`#D94E34`).
2. **Chart Theme Adaptation:** Recharts axes, gridlines (`var(--border-subtle)`), and tooltips (`var(--bg-surface)`) must adapt cleanly to both Daylight Paper (Light) and Carbon Workbench (Dark).
3. **Monthly Heatmap Colors:** Replace the harsh Tailwind classes (`bg-red-600`, `bg-blue-900`) in `MonthlyHeatmap.tsx` with continuous perceptual RGB/hex values from `getDivergingDeltaColor(anomaly)` in `src/utils/colorScales.ts`.
4. **Spatial Block K-Fold SVG:** Replace the pulsing CSS circle (`animate-pulse border-red-400/70`) in `SpatialBlockKFoldExplainer.tsx` with a crisp, technical SVG cartographic illustration with hatching/stippling for the 1.2 km dead-zone buffer.

---

## Banned "AI Slop" Checklist (PR Rejection Criteria)
- [ ] Zero `#07111F`, `#00D2FF`, or neon purple badges (`bg-purple-950/40 text-purple-400`).
- [ ] Zero `animate-ping` or `animate-pulse` circles in the Spatial Block K-Fold diagram.
- [ ] All numerical tables and chart ticks use `IBM Plex Mono` (`tabular-nums`).
