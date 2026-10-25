# Issue [T8]: Build Workspace 04 — Split BMC Policy Dossier Studio & Print/CSV/JSON Export

- **Title:** `feat(ui): [T8] Build Workspace 04 — Split BMC Policy Dossier Studio & Print/CSV/JSON Export`
- **Labels:** `ui-makeover`, `workspace-04`, `frontend`, `reporting`
- **Assignee:** *Unassigned*
- **Estimated Effort:** `4.5 – 5.5 hrs (Manual)` | `~25 – 30 mins (AI-Assisted)`
- **Depends On:** Foundation Tasks `T1–T3` (Does not depend on `T4` Map Engine — can start immediately after `T3`!)
- **Architecture Spec:** [`docs/development/ui_redesign_specification.md`](../development/ui_redesign_specification.md)

---

## Objective
Replace the legacy `Reports.tsx` page (and eliminate its broken `"Roadmap Item — Report generation endpoint not connected"` warning banner) with **Workspace 04: BMC Policy Dossiers** (`frontend/src/pages/PolicyDossiers.tsx`).

This workspace provides a **Split Dossier Studio**: a **Left Configuration & Cross-Ward Ranking Panel (32% width)** and a **Right Typeset Municipal Dossier Sheet (68% width)** styled like an official **Brihanmumbai Municipal Corporation (BMC) Climate Action Cell** engineering briefing, complete with an inline SVG Ward Locator mini-map, `@media print` PDF export, and instant CSV/JSON downloads.

---

## Target Files
- **Create:** `frontend/src/pages/PolicyDossiers.tsx`
- **Create:** `frontend/src/components/reports/WardMiniMapSvg.tsx` (renders all 24 ward polygons from `WARDS_DATA` in a compact 160×220 SVG, highlighting the active ward in Terracotta `#D94E34`)
- **Update:** `frontend/src/App.tsx` (mount `<PolicyDossiers />` when `activePage === 'dossier'`)
- **Deprecate / Remove after verification:** `Reports.tsx`

---

## Spatial Layout & Section Placement Wireframe

```text
+---------------------------------+----------------------------------------------------------------+
| LEFT CONFIGURATION PANEL (32%)  | RIGHT TYPESET DOCUMENT SHEET (68% Width, Scrollable Container) |
| (Hidden during @media print)    | (Expands to 100% page width during @media print)               |
|                                 |                                                                |
| 1. Dossier Parameters Card      | +------------------------------------------------------------+ |
|    - Target BMC Ward Select     | | BRIHANMUMBAI MUNICIPAL CORPORATION • CLIMATE ACTION CELL   | |
|    - Observation Epoch Select   | | Urban Heat Island Assessment & Mitigation Action Plan      | |
|    - Policy Scenario Select     | | Ward G/N (Dharavi / Dadar) · Dossier ID: BMC-UHI-GN-2024   | |
|      (5 Empirical Presets OR    | |============================================================| |
|       'Current Studio Custom')  | |                                                            | |
|                                 | | §1. Executive Ward Profile & Thermal Vulnerability         | |
| 2. Cross-Ward Benchmark Card    | |     [4-Metric Tabular Grid] + [<WardMiniMapSvg />]         | |
|    - Thermal Rank: #2 of 24     | |     Mean LST, UHI ΔT vs City Mean, Pop Density, Risk Class | |
|    - Ward LST vs. City Mean     | |                                                            | |
|    - Ward NDVI vs. City Mean    | | §2. Local Biophysical Attribution (TreeSHAP Decomposition) | |
|                                 | |     Structured table + inline diverging bars showing exact | |
| 3. Export & Actions Card        | |     °C contribution of each local driver                   | |
|    - [Print / Save as PDF]      | |                                                            | |
|      (Triggers window.print()   | | §3. Simulated Mitigation Scenario & Energy ROI             | |
|       with clean print CSS)     | |     Baseline LST → Target Post-Intervention LST,           | |
|    - [Download Ward CSV]        | |     ΔT Cooling (°C), and Annual HVAC Savings (kWh/m²/yr)   | |
|    - [Download Dossier JSON]    | |                                                            | |
|                                 | | §4. DCPR 2034 Municipal Implementation Directives          | |
|                                 | |     Tailored engineering mandates based on dominant driver | |
+---------------------------------+----------------------------------------------------------------+
```

---

## Design System & Styling Contract (Mandatory)
1. **Typeset Paper Sheet Aesthetic:**
   - The Right Dossier Sheet uses crisp editorial typography: `IBM Plex Serif` for the document title and `§1–§4` section headings, `IBM Plex Sans` for policy directives, and `IBM Plex Mono` (`tabular-nums`) for all tables and metrics.
   - Include a formal document header with metadata (`CRS: EPSG:32643`, `Spatial Resolution: 30m`, `Validation: 1.2 km Spatial Block K-Fold`) and a formal signature/verification footer block.
2. **Working Exports (Zero Stub Warnings):**
   - **Print / Save as PDF:** Calls `window.print()`. In `index.css`, `@media print` hides `TopInstrumentBar` and the Left Configuration Panel, formatting the Right Dossier Sheet cleanly onto A4/Letter portrait pages.
   - **Download Ward CSV & Dossier JSON:** Uses `exportWardCsv(ward, scenario)` and `exportDossierJson(ward, scenario, epoch)` from `src/utils/exportUtils.ts` (`T2`) to trigger instant browser file downloads.

---

## Banned "AI Slop" Checklist (PR Rejection Criteria)
- [ ] Completely remove the yellow `"Roadmap Item / Report generation endpoint not connected"` warning banner.
- [ ] Zero `#07111F`, `#00D2FF`, or neon amber/emerald boxes.
- [ ] Left panel must be hidden in `@media print` (`print:hidden`) so printing produces a clean official BMC document.
