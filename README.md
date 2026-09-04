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
| **Hussain**  | ML Downscaling & Backend Core | GEE Pipelines, ML Regressors, Fast Simulation | GEE multi-sensor scripts, XGBoost/RF 30m LST models, sub-1.5s FastAPI simulation endpoints. |
| **Asad** | Data Engineering & Spatial Analytics | IMD Synchronization, Spatial Statistics, XAI | 27-year IMD cleaning pipeline, 17-feature matrix, Spatial Block K-Fold validator, Mann-Kendall trend tests, SHAP attribution. |
| **Abdulrehman** | Cloud Architect & Dashboard Lead | AWS Infrastructure, S3 Data Lake, Web UI | S3 Cloud-Optimized GeoTIFF storage, Dockerized EC2 server, Streamlit/Mapbox GL dashboard. |
| **Ahmed** | Reporting Engine & Quality Assurance | Automated PDF Reports, Data Validation, Thesis | Automated 2-page PDF municipal briefs (`reportlab`), EPSG:32643 CRS tests, thesis & presentation decks. |

---

## 🗂️ Repository Structure

```text
mumbai-uhi-platform/
├── configs/
│   ├── config.yaml          # Bounding box, CRS, thresholds, GEE assets
│   └── logging_config.yaml  # Structured JSON logging format
├── data/
│   ├── raw/                 # Raw IMD CSVs (gitignored)
│   ├── processed/           # Cleaned Parquet feature stores
│   └── vectors/             # Mumbai 24 Wards GeoJSON (EPSG:32643)
├── src/
│   ├── ingestion/
│   │   ├── gee_extractor.py      # [Hussain] GEE extraction & cloud masking
│   │   └── imd_parser.py         # [Asad] IMD parser & QC filter
│   ├── features/
│   │   ├── spectral_indices.py   # [Hussain] NDVI, NDBI, Albedo, True LST
│   │   └── weather_physics.py    # [Asad] Wind (u,v), VPD, Co-Kriging
│   ├── models/
│   │   ├── spatial_kfold.py      # [Asad] Buffered spatial block splitter
│   │   ├── downscaler_xgb.py     # [Hussain] XGBoost 30m LST regressor
│   │   └── shap_explainer.py     # [Asad/Hussain] TreeSHAP attribution
│   ├── api/
│   │   ├── main.py               # [Hussain] FastAPI asynchronous server
│   │   ├── schemas.py            # Pydantic request/response models
│   │   └── simulation_engine.py  # [Hussain] Low-latency What-If engine
│   └── frontend/
│       └── app.py                # Streamlit + Mapbox GL dashboard
├── tests/
│   ├── test_gee_bounds.py        # Spatial bounds & projection tests
│   ├── test_weather_physics.py   # Vector decomposition unit tests
│   └── test_spatial_leakage.py   # Validation buffer overlap tests
├── pyproject.toml                # Dependencies configuration
└── README.md                     # Professional architectural overview
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
