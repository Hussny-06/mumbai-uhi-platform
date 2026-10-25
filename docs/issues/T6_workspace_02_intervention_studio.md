# Issue [T6]: Build Workspace 02 — Non-Scrolling 3-Zone What-If Intervention Studio

- **Title:** `feat(ui): [T6] Build Workspace 02 — Non-Scrolling 3-Zone What-If Intervention Studio`
- **Labels:** `ui-makeover`, `workspace-02`, `frontend`, `simulation`
- **Assignee:** *Unassigned*
- **Estimated Effort:** `5.0 – 6.5 hrs (Manual)` | `~30 mins (AI-Assisted)`
- **Depends On:** Foundation Tasks `T1–T4`
- **Architecture Spec:** [`docs/development/ui_redesign_specification.md`](../development/ui_redesign_specification.md)

---

## Objective
Replace the legacy scrolling `Simulator.tsx` page and its subcomponents with a **Non-Scrolling 3-Zone What-If Intervention Studio** (`frontend/src/pages/InterventionStudio.tsx`).

Planners can select any BMC ward or draw a custom polygon on the map, click one of 5 empirical policy presets or drag the 3 biophysical sliders (`ΔNDVI`, `ΔAlbedo`, `ΔNDBI`), and observe **live debounced (100ms) cooling inference** with an interactive **Before vs. After Split-Curtain Map** and a right-hand **Impact Telemetry Column**.

---

## Target Files
- **Create:** `frontend/src/pages/InterventionStudio.tsx`
- **Refactor:** `frontend/src/components/simulation/InterventionControls.tsx`
- **Refactor:** `frontend/src/components/simulation/SimulationResultCard.tsx`
- **Update:** `frontend/src/App.tsx` (mount `<InterventionStudio />` when `activePage === 'studio'`)
- **Deprecate / Remove after verification:** `Simulator.tsx`, `PresetScenarioCards.tsx` (presets move into the Left Control Column)

---

## Spatial Layout & Section Placement Wireframe
Strictly non-scrolling `h-[calc(100vh-3rem)]` 12-column grid (`gap-3 p-3` or `gap-4 p-4`):
- **Left Control Column:** `col-span-3` (~26% width, scrollable internally if needed)
- **Center Comparison Map Canvas:** `col-span-6` (~48% width, full height)
- **Right Impact Telemetry Column:** `col-span-3` (~26% width, scrollable internally if needed)

```text
+---------------------------+----------------------------------------+-----------------------------+
| LEFT CONTROL COLUMN (26%) | CENTER COMPARISON MAP CANVAS (48%)     | RIGHT IMPACT COLUMN (26%)   |
|                           |                                        |                             |
| 1. Target Scope Card      | +------------------------------------+ | 1. Thermal Shift Summary    |
|    - BMC Ward Select OR   | | Top Map Mode Bar:                  | |    Baseline °C → Post °C    |
|    - [Draw Custom Polygon]| | [Split Curtain] [ΔT Anomaly] [Post]| |    Hero ΔT Cooling (°C)     |
|      button + km² badge   | +------------------------------------+ |    + Engine Latency badge   |
|                           |                                        |                             |
| 2. Empirical Policy       |           BEFORE  |  AFTER             | 2. Grid Cell ΔT Histogram   |
|    Presets (5 Compact     |        Baseline   |  Simulated         |    SVG bar distribution of  |
|    1-Click Pills/Rows)    |          LST      |<->|  LST           |    cooling across cells     |
|                           |                   |                    |                             |
| 3. Biophysical Sliders    |      <MumbaiMap                        | 3. HVAC Energy & Grid ROI   |
|    - Canopy (ΔNDVI 0..0.5)|        interactivePolygonMode={true}   |    kWh/m²/yr saved + MWh    |
|    - Albedo (Δα 0..0.4)   |        splitComparisonMode={true} />   |    ward-level estimate      |
|    - Depave (ΔNDBI -0.3..0|                                        |                             |
|    *Auto-triggers live    | +------------------------------------+ | 4. Biophysical Flux Shift   |
|     debounced simulation* | | Bottom Legend:                     | |    Diverging bars showing   |
|    + [Reset Baseline] btn | | LST Scale + ΔT Cooling Scale       | |    SHAP contribution shift  |
+---------------------------+----------------------------------------+-----------------------------+
```

---

## Design System & Styling Contract (Mandatory)
1. **Dual-Theme CSS Variables Only:** Use `var(--bg-canvas)`, `var(--bg-surface)`, `var(--bg-elevated)`, `var(--border-subtle)`, `var(--text-primary)`, `var(--text-secondary)`, and `var(--accent-primary)` (`#D94E34` Terracotta).
2. **Soft Card Grid:** `gap-3` / `gap-4`, `rounded-lg` cards with `1px solid var(--border-subtle)` and subtle `shadow-sm`.
3. **Typography:** `IBM Plex Serif` for card group titles, `IBM Plex Sans` for UI labels, and `IBM Plex Mono` (`tabular-nums`) for all slider values, `°C` deltas, `kWh/m²/yr` readouts, and `ms` latency.
4. **Live Debounced Simulation (No Fake Spinners):**
   - Dragging any slider (`deltaNdvi`, `deltaAlbedo`, `deltaNdbi`) or clicking one of the 5 `PRESET_SCENARIOS` automatically invokes `runSimulation()` after a `100ms` debounce.
   - Do NOT hide the results card behind a full-card loading spinner or an empty "No Intervention Simulated Yet" placeholder—run the initial baseline simulation on mount so the studio is immediately alive with data.

---

## Banned "AI Slop" Checklist (PR Rejection Criteria)
- [ ] Zero `#07111F`, `#00D2FF`, or glowing cyan/emerald borders (`border-emerald-500/40`, `shadow-cyan-950/50`).
- [ ] Zero fake full-card loading spinners (`Simulating XGBoost Downscaling...`).
- [ ] Preset scenarios must NOT sit below the map forcing vertical page scroll; they belong inside the Left Control Column.
