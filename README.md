# 🌡️ Mumbai Urban Heat Island (UHI) AI Modeling & Simulation Platform

[![Python Version](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()
[![CRS](https://img.shields.io/badge/CRS-EPSG%3A32643-brightgreen.svg)]()
[![Spatial Resolution](https://img.shields.io/badge/Spatial%20Resolution-30m-green.svg)]()

> **Project Title:** AI-Driven Spatiotemporal Modeling and Downscaling of Urban Heat Island Dynamics in Metropolitan Mumbai Using Multi-Source Remote Sensing and Meteorological Records.  
> **Academic Scope:** Metropolitan Mumbai (24 Administrative Municipal Wards, $437.71\text{ km}^2$, Bounding Box: $[18.89^\circ\text{N}, 72.77^\circ\text{E}]$ to $[19.28^\circ\text{N}, 73.00^\circ\text{E}]$).

---

## 📖 Executive Summary

Public satellite thermal infrared sensors suffer from an inherent spatial vs. temporal trade-off: **MODIS** revisits daily but provides coarse $1\text{ km}$ pixels; **Landsat 8/9** captures $100\text{m}$ thermal data but has a 16-day latency; **Sentinel-2** offers sharp $10\text{--}20\text{m}$ optical imagery but lacks a thermal sensor. 

This platform bridges the gap by fusing **27 years of IMD continuous ground weather station records** (Colaba & Santacruz) with satellite passes from **Google Earth Engine (GEE)** to downscale thermal radiometry to a sharp **$30\text{m}$ street-level Land Surface Temperature (LST)** grid. The platform features:
1. **Machine Learning Downscaling:** XGBoost & Random Forest regressors achieving $\text{RMSE} \le 1.5^\circ\text{C}$ and $R^2 \ge 0.85$.
2. **Spatial Autocorrelation Guard:** Spatial Block K-Fold Cross-Validation with a $1.2\text{ km}$ buffer (derived from Moran's $I$ semivariogram range).
3. **Biophysical Explainability (TreeSHAP):** Decomposing ward-level heat drivers ($+\Phi_{\text{NDBI}}$, $-\Phi_{\text{NDVI}}$, $-\Phi_{\text{D\_coast}}$).
4. **Interactive "What-If" Decision Simulator:** Enabling municipal planners at the BMC to draw polygons, test cooling interventions ($+\Delta\text{NDVI}$, $+\Delta\alpha$), and view predicted cooling deltas ($\Delta T$) and energy demand savings in $\le 1.5$ seconds.

---

## 👥 Team Ownership Matrix

| Team Member | Project Role | Domain Focus | Core Deliverables |
| :--- | :--- | :--- | :--- |
| **Hussain** | System Architecture & ML Downscaling | GEE Pipelines, ML Regressors, Fast Simulation | GEE multi-sensor scripts, XGBoost/RF 30m LST models, sub-1.5s FastAPI simulation endpoints. |
| **Asad** | Data Engineering & Spatial Analytics | IMD Synchronization, Spatial Statistics, XAI | 27-year IMD cleaning pipeline, 17-feature matrix, Spatial Block K-Fold validator, Mann-Kendall trend tests, SHAP attribution. |
| **Abdulrehman** | Cloud Architect & Dashboard Lead | AWS Infrastructure, S3 Data Lake, Web UI | S3 Cloud-Optimized GeoTIFF storage, Dockerized EC2 server, Streamlit/Mapbox GL dashboard. |
| **Ahmed** | Reporting Engine & Quality Assurance | Automated PDF Reports, Data Validation, Thesis | Automated 2-page PDF municipal briefs (`reportlab`), EPSG:32643 CRS tests, thesis & presentation decks. |

---

## 📚 Project Documentation & Engineering Logs

The platform maintains modular, version-controlled engineering documentation in [`docs/`](docs/):

* **[Review 1 Presentation Deck](docs/review1_presentation_deck.md):** 13-slide academic presentation deck aligned strictly to Guide Dr. Nazneen Pendhari's 7 mandatory sections.
* **[Chronological Engineering Log](docs/development/dev_log_chronological.md):** Day-by-day development timeline tracking architecture setup, real GEE ingestion, XGBoost training, and simulation benchmarks.
* **[Team Contribution Matrix & Viva Defense Guide](docs/development/team_contribution_matrix.md):** Granular code ownership, task breakdown, and viva examination defense strategies for Hussain, Asad, Abdulrehman, and Ahmed.
* **[Technical Architecture & Mathematical Specification](docs/development/technical_architecture_spec.md):** Rigorous mathematical formulas (Planck radiative transfer, Tetens VPD, wind orthogonalization, Moran's $I$ spatial buffer, and 17-feature data dictionary).

*(Note: High-level conceptual charters, IEEE 830 SRS documents, and academic research papers are maintained in the conceptual repository vault at `../DOCUMENTATION/`).*

---

## 🗂️ Repository Structure

```text
mumbai-uhi-platform/
│
├── .venv/                         <-- Your isolated Python installation (packages live here)
├── pyproject.toml                 <-- The list of required libraries (pandas, xgboost, etc.)
├── README.md                      <-- The homepage of your project repo
│
├── configs/                       <-- SETTINGS
│   ├── config.yaml                <-- Stores Mumbai's coordinates, bounding box, and thresholds
│   └── logging_config.yaml        <-- Formats how error and debug messages are printed
│
├── data/                          <-- THE DATA STORAGE ROOM
│   ├── raw/                       <-- Where raw, untouched IMD weather CSVs will sit (Asad's data)
│   ├── processed/                 <-- Cleaned data ready for ML (contains our 2,481 real GEE points)
│   ├── vectors/                   <-- Geographic shapes: contains mumbai_boundary.geojson (Mumbai outline)
│   └── models/                    <-- Trained AI brains: contains downscaler_xgb_mumbai.json
│
├── outputs/                       <-- FINAL PICTURES & METRICS
│   ├── review1_true_color.png     <-- Satellite natural color image of Mumbai
│   ├── review1_ndvi.png           <-- Greenery map of Mumbai
│   ├── review1_ndbi.png           <-- Concrete / built-up map of Mumbai
│   ├── review1_lst.png            <-- Land Surface Temperature (Heat) map of Mumbai
│   ├── review1_geospatial_layers_4panel.png <-- All 4 maps combined side-by-side with legends
│   ├── review1_downscaling_validation.png   <-- Scatter plot proving the model works
│   └── model_validation_metrics.json       <-- Accuracy numbers (RMSE, R²) in text form
│
├── scripts/                       <-- "RUN-ME" SCRIPTS (Things you run from terminal)
│   ├── fetch_real_gee_mumbai.py   <-- Connects to GEE and downloads the 4 satellite maps
│   ├── train_and_validate_downscaler.py <-- Connects to GEE, pulls points, trains the XGBoost model
│   └── demo_hussain.py            <-- One master script that tests and demos all your work for Review 1
│
├── src/                           <-- THE CORE SOURCE CODE (The reusable engine parts)
│   ├── ingestion/                 <-- Code that talks to external data
│   │   ├── gee_extractor.py       <-- Google Earth Engine download logic
│   │   └── imd_parser.py          <-- Weather station reading logic (Asad)
│   ├── features/                  <-- Physics & Math
│   │   ├── spectral_indices.py    <-- Formulas for NDVI, NDBI, and Planck LST
│   │   └── weather_physics.py     <-- Formulas for wind speed (u, v) and humidity
│   ├── models/                    <-- Machine Learning classes
│   │   ├── downscaler_xgb.py      <-- The XGBoost Downscaler class definition
│   │   ├── spatial_kfold.py       <-- The 1.2km buffer cross-validation splitter (prevents data leakage)
│   │   └── shap_explainer.py      <-- TreeSHAP (explains WHY an area is hot)
│   ├── api/                       <-- Backend Server
│   │   ├── main.py                <-- FastAPI web app routes
│   │   ├── schemas.py             <-- Definitions of what inputs the API accepts
│   │   └── simulation_engine.py   <-- The "What-If" simulator that perturbs features and outputs cooling
│   └── frontend/                  <-- User Interface
│       └── app.py                 <-- The Streamlit web dashboard (Abdulrehman's domain)
│
├── tests/                         <-- AUTOMATED QUALITY CHECKERS (Pytest)
│   ├── test_gee_bounds.py         <-- Checks that Mumbai coordinates are correct
│   ├── test_hussain_deliverables.py <-- Checks that NDVI/LST formulas work & simulator is fast
│   ├── test_spatial_leakage.py    <-- Checks that training and testing points don't touch
│   └── test_weather_physics.py    <-- Checks wind math and humidity equations
│
└── docs/                          <-- DOCUMENTATION
    ├── review1_presentation_deck.md <-- 13 slides ready for Ahmed to put into PowerPoint
    └── development/               <-- Detailed dev logs, team matrix, and technical specs
```

---

## ⚡ Quickstart & Local Setup

### 1. Clone & Environment Setup
```bash
git clone https://github.com/Hussny-06/mumbai-uhi-platform.git
cd mumbai-uhi-platform

python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -e .
```

### 2. Run Automated Test Suite
```bash
pytest tests/ -v
```

### 3. Launch Backend Microservice
```bash
uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Launch Geospatial Dashboard
```bash
streamlit run src/frontend/app.py
```
