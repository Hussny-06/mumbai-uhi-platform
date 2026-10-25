# Issue [T5]: Build Workspace 01 — Spatial Explorer & Synchronized 24-Ward Registry

- **Title:** `feat(ui): [T5] Build Workspace 01 — Spatial Explorer & Synchronized 24-Ward Registry`
- **Labels:** `ui-makeover`, `workspace-01`, `frontend`
- **Assignee:** *Unassigned*
- **Estimated Effort:** `5.0 – 6.5 hrs (Manual)` | `~30 mins (AI-Assisted)`
- **Depends On:** Foundation Tasks `T1–T4` (`index.css`, `colorScales.ts`, `useUhiStore.ts`, `TopInstrumentBar.tsx`, `MumbaiMap.tsx`)
- **Architecture Spec:** [`docs/development/ui_redesign_specification.md`](../development/ui_redesign_specification.md)

---

## Objective
Replace the fragmented legacy `Dashboard.tsx`, `HeatMap.tsx`, and `WardAnalytics.tsx` pages with **Workspace 01: Spatial Explorer & Ward Registry** (`frontend/src/pages/SpatialExplorer.tsx`).

This workspace serves as the primary cartographic instrument for exploring Mumbai's 30m downscaled Land Surface Temperature (LST) and biophysical layers across all 24 BMC municipal wards, featuring a **62% Map Canvas (Left)** and a **38% Synchronized Analytical Dock (Right)** that seamlessly transitions between a **Citywide 24-Ward Registry** and a **Deep Ward Inspector** when a ward is selected.

---

## Target Files
- **Create:** `frontend/src/pages/SpatialExplorer.tsx`
- **Create:** `frontend/src/components/analytics/WardInspectorPanel.tsx`
- **Update:** `frontend/src/App.tsx` (mount `<SpatialExplorer />` when `activePage === 'explorer'` / `'overview'`)
- **Deprecate / Remove after verification:** `Dashboard.tsx`, `HeatMap.tsx`, `WardAnalytics.tsx`, `WardDetailDrawer.tsx`

---

## Spatial Layout & Section Placement Wireframe
Viewport height is strictly `h-[calc(100vh-3rem)]` (below the 48px `TopInstrumentBar`), with **zero page-level vertical scrolling** (`overflow-hidden` on the outer grid; internal scroll only inside the Right Dock table/inspector).

```text
+------------------------------------------------------------+-------------------------------------+
| LEFT / CENTER MAP CANVAS (62% Width, h-full)               | RIGHT ANALYTICAL DOCK (38% Width)   |
|                                                            |                                     |
|  +------------------------------------------------------+  | [STATE A: selectedWard === null]    |
|  | Floating Top-Left Layer & Render Bar:                |  | 1. Filter & Search Header Card      |
|  | Layers: [LST] [NDVI] [NDBI] [Albedo] [MNDWI] [Elev]  |  |    - Search input (ID or Ward Name) |
|  | Mode:   [Fine Grid | Ward Choropleth | Combined]     |  |    - Zone filter pill/select        |
|  +------------------------------------------------------+  |    - Sort selector (LST, ΔT, NDVI)  |
|                                                            | 2. 24-Ward Microclimate Table       |
|                 <MumbaiMap />                              |    - High-density rows (tabular-nums)|
|       (Multi-resolution Canvas thermalGrid.json            |    - Inline LST thermal spark-bar   |
|        + BMC Ward GeoJSON vectors)                         |    - Hovering row sets hoveredWard  |
|                                                            |    - Clicking row sets selectedWard |
|                                                            | 3. Pinned Bottom Summary Card       |
|                                                            |    - Citywide TreeSHAP Top Drivers  |
|                                                            | ----------------------------------- |
|                                                            | [STATE B: selectedWard !== null]    |
|  +-----------------------+  +---------------------------+  | ← Back to All 24 Wards (Clear sel.) |
|  | Bottom-Left:          |  | Bottom-Right Telemetry:   |  | 1. Ward Header, Zone & Risk Badge   |
|  | Continuous Colorbar   |  | Mean 34.2°C · Peak 37.3°C |  | 2. Biophysical Profile Matrix       |
|  | Legend + Hover Value  |  | Cool Sink 29.5°C · 24 Wds |  |    (Ward value vs. City Mean bar)   |
|  +-----------------------+  +---------------------------+  | 3. Local TreeSHAP Attribution Bars  |
|                                                            | 4. Action Footer Buttons:           |
|                                                            |    [Simulate Cooling in Ward →]     |
|                                                            |    [Open BMC Policy Dossier →]      |
+------------------------------------------------------------+-------------------------------------+
```

---

## Design System & Styling Contract (Mandatory)
1. **Dual-Theme CSS Variables Only:** Never hardcode dark-navy `#07111F` or neon cyan `#00D2FF`. Use the semantic variables / Tailwind classes from `T1`:
   - Canvas background: `bg-[var(--bg-canvas)]` (`#F6F5F0` Light / `#0E0F11` Dark)
   - Card surface: `bg-[var(--bg-surface)]` (`#FFFFFF` Light / `#16181B` Dark)
   - Elevated / Row hover: `bg-[var(--bg-elevated)]` (`#EFECE6` Light / `#1F2227` Dark)
   - Borders: `border border-[var(--border-subtle)]` (`#E2DFD7` Light / `#272A30` Dark)
   - Text: `text-[var(--text-primary)]`, `text-[var(--text-secondary)]`, `text-[var(--text-muted)]`
   - Interactive Accent: `text-[var(--accent-primary)]` / `bg-[var(--accent-primary)]` (`#D94E34` Terracotta)
2. **Soft Card Grid:** Use `gap-3` (`12px`) or `gap-4` (`16px`) between cards, `rounded-lg` (`8px`) on primary containers, `rounded` (`4px`) on inner pills/buttons, and subtle `shadow-sm`.
3. **Typography:**
   - Section titles: `font-serif` (`IBM Plex Serif`)
   - UI labels & controls: `font-sans` (`IBM Plex Sans`)
   - All temperatures, deltas, coordinates, areas, and ward IDs: `font-mono tabular-nums` (`IBM Plex Mono`)
4. **Scientific Color Encoding (`src/utils/colorScales.ts`):**
   - LST spark-bars & badges: use `getInfernoColor(lst)`
   - Heating vs. Cooling deltas (`UHI ΔT` and `TreeSHAP`): use `#D94E34` (Vermilion) for `+Heating` and `#0D9488` (Teal) for `-Cooling`.

---

## Store & Data Integration (`useUhiStore` & `staticDatasets.ts`)
- Read `WARDS_DATA` and `CITY_WIDE_SHAP_DRIVERS` from `src/data/staticDatasets.ts`.
- Bind `selectedWard`, `setSelectedWard`, `hoveredWard`, `setHoveredWard`, `focusWard`, and `setActivePage` from `useUhiStore()`.
- Clicking `[Simulate Cooling in Ward →]` must call `setSelectedWard(ward)` and `setActivePage('studio')`.
- Clicking `[Open BMC Policy Dossier →]` must call `setSelectedWard(ward)` and `setActivePage('dossier')`.

---

## Banned "AI Slop" Checklist (PR Rejection Criteria)
- [ ] Zero `#07111F`, `#00D2FF`, or neon purple classes anywhere in the component.
- [ ] Zero `animate-ping` or `animate-pulse` dots.
- [ ] Do NOT render 6 top KPI boxes or a marketing hero banner above the map.
- [ ] Do NOT open an overlapping slide-over drawer (`WardDetailDrawer`) on top of the map; the 38% Right Dock itself transitions into the Ward Inspector.
