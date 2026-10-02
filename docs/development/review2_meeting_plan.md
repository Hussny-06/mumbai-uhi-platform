# 👥 Review 2 Online Team Meeting Playbook & Task Distribution

**Meeting Title:** Pre-Review 2 Alignment & Tactical Work Allocation  
**Date:** October 2, 2026 (Evening) | **Target Review:** Review 2 (Tomorrow Morning)  

---

## 🎯 Meeting Objectives

1. **Eliminate Last-Minute Stress:** Distribute immediate, concrete tasks for tonight so that tomorrow morning's PowerPoint deck, synopsis document, and live demo are 100% ready.
2. **Rehearse Presentation Handoffs:** Ensure that every single team member has a dedicated, high-impact speaking slot during tomorrow's review so the faculty panel sees equal contribution and deep technical mastery.

---

## ⏱️ Meeting Agenda (30 Minutes Total)

```text
AGENDA FLOW:
├── 00:00 – 05:00: Overview & State of the Codebase
├── 05:00 – 12:00: Presentation Walkthrough & Speaking Allocations
├── 12:00 – 20:00: Tonight's Immediate Deliverable Assignments
├── 20:00 – 25:00: Live Demo Run-Through & Backup Plan
└── 25:00 – 30:00: Q&A Anticipation & Faculty Panel Defense Strategy
```

---

## 💼 Tonight's Immediate Action Items 

### 1. PPT & Synopsis
* **Priority Task 1: Build the Review 2 PowerPoint Deck**
  * Open [`docs/review2_presentation_deck.md`](file:///d:/Major%20Project/mumbai-uhi-platform/docs/review2_presentation_deck.md).
  * Copy the 12 slides into the official MHSSCE computer engineering presentation template.
  * Embed the generated high-resolution figures from `outputs/`:
    * Slide 4: `outputs/asad_data_quality_summary.png`
    * Slide 5: `outputs/asad_27yr_temperature_trend.png` & `outputs/asad_monthly_climatology_heatmap.png`
    * Slide 6: `outputs/review1_geospatial_layers_4panel.png`
    * Slide 7: `outputs/asad_ml_validation_comparison.png`
    * Slide 8: `outputs/asad_shap_analysis_xgboost.png`
    * Slide 9: `outputs/asad_simulation_scenarios.png`
* **Priority Task 2: Format & Export the Project Synopsis**
  * Open [`docs/review2_project_synopsis.md`](file:///d:/Major%20Project/mumbai-uhi-platform/docs/review2_project_synopsis.md).
  * Export/print as a 2-page PDF document ready for submission to Guide Dr. Nazneen Pendhari.

---

### 2. presentation
* **Priority Task 1: Rehearse Speaking Sections (Slides 4, 5, 7, 8)**
  * **Slide 4 (IMD Cleaning):** Explain the Hampel $3\sigma$ filter, PCHIP splines, and wind vector orthogonalization ($u, v$).
  * **Slide 5 (Mann-Kendall Trend):** Deliver the headline finding: **$+0.44^\circ\text{C}$ per decade warming in Mumbai** ($p = 3.64 \times 10^{-5}$).
  * **Slide 7 (ML Benchmarking):** Explain why Spatial Block K-Fold ($1.2\text{ km}$ buffer) prevents data leakage and why XGBoost beat Random Forest.
  * **Slide 8 (TreeSHAP Attribution):** Explain why concrete (`NDBI`) adds $+1.41^\circ\text{C}$ and vegetation (`NDVI`) cools by $-0.42^\circ\text{C}$.

---

### 3. Backend Verification & Local Launch Test
* **Priority Task 1: Backend Verification & Local Launch Test**
  * Pull latest `main` branch from GitHub.
  * Activate `.venv` and verify that the API starts cleanly: `python run_api.py`.
  * Confirm `http://localhost:8000/docs` displays the Swagger interactive documentation.
* **Priority Task 2: Rehearse Speaking Section (Slide 11 — Sprint 3 Roadmap)**
  * Present the upcoming **Sprint 3 deliverables**: Mapbox GL / Deck.gl web dashboard, live polygon drawing tools, and Dockerized cloud deployment on AWS EC2.

---


## 🎤 Tomorrow's Speaking Order & Time Allocation (12–15 Mins Total)

```text
┌─────────────────┬───────────────────────────────────────────┬──────────────┐
│ Presenter       │ Slides Covered                            │ Duration     │
├─────────────────┼───────────────────────────────────────────┼──────────────┤
│                 │ Slide 1 (Title), Slide 2 (Progress),      │ ~3.5 mins    │
│                 │ Slide 3 (Problem Statement)               │              │
├─────────────────┼───────────────────────────────────────────┼──────────────┤
│                 │ Slide 4 (27-Yr IMD Data Cleaning),        │ ~4.0 mins    │
│                 │ Slide 5 (Mann-Kendall Warming Proof),     │              │
│                 │ Slide 7 (XGBoost vs RF Benchmark),        │              │
│                 │ Slide 8 (TreeSHAP Heat Attribution)       │              │
├─────────────────┼───────────────────────────────────────────┼──────────────┤
│                 │ Slide 6 (GEE Satellite Radiometry),       │ ~3.0 mins    │
│                 │ Slide 9 (5 Policy Simulation Scenarios),  │              │
│                 │ Slide 10 (29 Automated Tests)            │              │
├─────────────────┼───────────────────────────────────────────┼──────────────┤
│                 │ Slide 11 (Sprint 3 Dashboard & AWS),      │ ~2.0 mins    │
│                 │ Slide 12 (Conclusion & Q&A)               │              │
└─────────────────┴───────────────────────────────────────────┴──────────────┘
```

---

## 🛡️ Anticipated Faculty Questions & Winning Responses

* **Q: "How do you know adjacent satellite pixels aren't leaking information into the test set?"**  
  * **Answer (Asad):** *"We explicitly implemented Spatial Block K-Fold Cross-Validation with a 1.2 km buffer exclusion zone based on Moran's I semivariogram range. This completely eliminates spatial autocorrelation leakage between training and testing folds."*
* **Q: "Why didn't you just use standard bicubic or bilinear interpolation to increase resolution?"**  
  * **Answer (Hussain):** *"Bicubic interpolation only blurs and smooths pixel grids mathematically without adding physical information. Our XGBoost model uses 17 biophysical predictors—including fine 30m vegetation, concrete built-up density, and elevation—to reconstruct true physical microclimates."*
* **Q: "Is your 27-year warming trend statistically valid or just random noise?"**  
  * **Answer (Asad):** *"We conducted the non-parametric Mann-Kendall Monotonic Trend Test across 28 continuous years of IMD data. The p-value is 0.0000364 (far below 0.05), yielding a Z-statistic of +4.13, which provides conclusive statistical proof of a +0.44°C per decade warming trend."*
* **Q: "How will municipal planners at the BMC actually use this?"**  
  * **Answer (Hussain/Abdulrehman):** *"Through our interactive What-If simulation engine. Planners can draw a polygon over any ward (like Dharavi or Kurla), adjust greening or cool-roof sliders, and receive predicted cooling deltas and estimated HVAC electricity savings in under 18 milliseconds."*
