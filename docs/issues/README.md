# Mumbai UHI Platform — UI Makeover GitHub Issues (T5–T8)

This directory contains self-contained, unassigned, agent-ready GitHub Issue specifications for the 4 workspaces of the UI Makeover.

## Architecture & Foundation Reference
- **Master Specification:** [`docs/development/ui_redesign_specification.md`](../development/ui_redesign_specification.md)
- **Blocking Foundation Tasks (`T1–T4`):**
  - `T1`: Dual-Theme CSS Variables (`:root` Daylight Paper & `.dark` Carbon Workbench) + IBM Plex Typography (`index.css`, `tailwind.config.js`, `index.html`)
  - `T2`: Perceptual Scientific Color Scales & CSV/JSON Export Utilities (`src/utils/colorScales.ts`, `src/utils/exportUtils.ts`)
  - `T3`: Unified Zustand Store & 48px Top Instrument Bar (`src/stores/useUhiStore.ts`, `src/components/layout/TopInstrumentBar.tsx`, `src/App.tsx`)
  - `T4`: Multi-Resolution Leaflet + HTML5 Canvas Map & Split-Curtain Comparison Engine (`src/components/map/MumbaiMap.tsx`, `src/components/map/MapLegend.tsx`, `src/components/map/WardTooltip.tsx`)

## Unassigned Workspace Issues (100% Parallelizable)
1. **[T5 — Workspace 01: Spatial Explorer & Synchronized Ward Registry](./T5_workspace_01_spatial_explorer.md)**
2. **[T6 — Workspace 02: What-If Intervention Studio](./T6_workspace_02_intervention_studio.md)**
3. **[T7 — Workspace 03: Climatology & Spatial ML Validation](./T7_workspace_03_climatology_validation.md)**
4. **[T8 — Workspace 04: BMC Policy Dossiers & Export Engine](./T8_workspace_04_policy_dossiers.md)**
