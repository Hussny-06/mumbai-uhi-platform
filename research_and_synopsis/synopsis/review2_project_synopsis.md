# Project Synopsis: Review 2 Progress & Technical Implementation

**Course:** B.E. Project (BE_2605) | **Academic Year:** 2026–27  
**Department:** Department of Computer Engineering  
**Institution:** M.H. Saboo Siddik College of Engineering (MHSSCE), Byculla, Mumbai  
**Affiliated to:** University of Mumbai  

---

## 1. Project Identification

* **Project Title:** AI-Driven Spatiotemporal Modeling and Downscaling of Urban Heat Island Dynamics in Metropolitan Mumbai Using Multi-Source Remote Sensing and Meteorological Records
* **Project Guide:** Dr. Nazneen Pendhari
* **Student Investigators:**
  1. **Mohd Hussain Siddique** | Roll No: 231336 | *System Architecture & ML Downscaling*
  2. **Asad Shaikh** | Roll No: 231251 | *Data Engineering & Spatial Analytics*
  3. **Abdulrehman Ansari** | Roll No: 242268 | *Cloud Architecture & Dashboard Lead*
  4. **Shah Mohd Ahmad** | Roll No: 231246 | *Reporting Engine & Quality Assurance*

---

## 2. Abstract

Rapid urbanization and high coastal humidity subject Metropolitan Mumbai to severe Urban Heat Island (UHI) stress, elevating heatwave vulnerability, public health morbidity, and peak air-conditioning grid demand. Public Earth observation satellites face a fundamental resolution trade-off: **MODIS** revisits daily but provides coarse $1\text{ km}$ pixels that obscure street-level variations, while **Landsat 8/9** offers $100\text{m}$ thermal data but has an operational latency of 16 days. Ground weather stations provide continuous measurements but are sparsely distributed (only two primary stations: Colaba and Santacruz for $437.71\text{ km}^2$).

This project develops an artificial intelligence platform fusing multi-source remote sensing data (Landsat 8/9 Level-2, Sentinel-2, NASA SRTM DEM) from Google Earth Engine (GEE) with 27 years (1997–2024, 383,640 records) of continuous ground meteorological records from the India Meteorological Department (IMD). The platform trains an ensemble gradient-boosted regressor (XGBoost) with Spatial Block K-Fold cross-validation ($1.2\text{ km}$ buffer exclusion derived from Moran's $I$) to downscale thermal radiometry to a sharp **$30\text{m}$ street-level Land Surface Temperature (LST)** grid. 

For Review 2, we report: (1) Ingestion and cleaning of 383,640 historical IMD weather records via Hampel $3\sigma$ filtering, PCHIP splines, and wind orthogonalization ($u, v$); (2) Conclusive non-parametric Mann-Kendall trend proof of statistically significant warming in Mumbai at **$+0.44^\circ\text{C}$ per decade** ($p = 3.64 \times 10^{-5}$); (3) Dual ML downscaler benchmark (XGBoost vs. Random Forest) on an 80/20 spatial block split; (4) Game-theoretic TreeSHAP feature attribution identifying built-up concrete (`NDBI`, $+1.41^\circ\text{C}$) as the primary heating driver and canopy cover (`NDVI`, $-0.42^\circ\text{C}$) as the primary cooling sink; (5) An interactive FastAPI simulation engine executing 5 municipal cooling intervention scenarios in $\le 17\text{ ms}$; and (6) A CI suite of 29 automated tests (100% passing).

---

## 3. Problem Statement & Research Gaps

1. **The Remote Sensing Resolution Dilemma:** Thermal infrared radiometry cannot simultaneously achieve high spatial resolution ($<50\text{m}$) and high temporal revisit ($<24\text{ hours}$), leaving municipal planners without actionable neighborhood-scale data.
2. **Spatial Autocorrelation Data Leakage:** Conventional machine learning thermal sharpening studies evaluate models using naive random train-test splits. Due to Tobler’s First Law of Geography, adjacent spatial pixels share near-identical features, artificially inflating validation metrics while failing completely on unseen city wards.
3. **Absence of Real-Time Policy Simulators:** Existing microclimate models (e.g., ENVI-met, WRF-UCM) require hours to days of compute for a single neighborhood, rendering interactive municipal planning impossible.

---

## 4. Aim & Measurable Objectives

* **Aim:** To engineer an AI-driven spatiotemporal modeling and downscaling platform that reconstructs physically accurate $30\text{m}$ Land Surface Temperature across Metropolitan Mumbai and enables sub-second simulation of urban cooling interventions.
* **Measurable Objectives:**
  1. *Satellite Big Data Ingestion:* Automated programmatic GEE extraction for all 24 BMC wards ($437.71\text{ km}^2$, EPSG:32643 UTM Zone 43N).
  2. *Meteorological QC:* Ingest and quality-filter 27 years of continuous IMD records via automated Hampel $3\sigma$ filtering and orthogonal wind decomposition.
  3. *Downscaling Accuracy:* Train an ensemble XGBoost model achieving $\text{RMSE} \le 1.5^\circ\text{C}$ on random holdout and outperforming Random Forest on spatial block holdouts.
  4. *Spatial Independence:* Enforce Spatial Block K-Fold cross-validation with a $1.2\text{ km}$ buffer exclusion zone based on Moran's $I$ semivariogram range.
  5. *Explainability (XAI):* Decompose ward-level temperature variance into marginal degree Celsius contributions via TreeSHAP.
  6. *Interactive Decision Simulator:* Build an asynchronous FastAPI simulation engine evaluating cooling policies in $\le 1.5\text{ seconds}$.

---

## 5. System Architecture & Methodology

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MUMBAI UHI PLATFORM SYSTEM FLOW                         │
└─────────────────────────────────────────────────────────────────────────────┘
  [ Google Earth Engine API ]                [ 27-Year IMD Weather Records ]
  ├── Landsat 8/9 Tier 1 Level-2             ├── 383,640 Hourly Observations
  ├── Sentinel-2 MSI Optical                 ├── Hampel 3σ MAD Noise Filter
  └── NASA SRTM 30m DEM                      └── PCHIP Monotonic Spline Impute
              │                                             │
              ▼                                             ▼
  [ Radiometric Calibration ]                [ Physics Transformations ]
  • ρ_optical = DN*0.0000275 - 0.2           • u = -Ws*sin(θ), v = -Ws*cos(θ)
  • T_B = DN*0.00341802 + 149.0              • VPD via Tetens Formulation
  • Planck Split-Window Equation             • Overpass Window (10:00–11:30 AM)
              │                                             │
              └──────────────────────┬──────────────────────┘
                                     │
                                     ▼
                   [ 17-Dimensional Biophysical Matrix ]
                                     │
                                     ▼
             [ Spatial Block K-Fold Split (1.2 km Buffer) ]
                                     │
                                     ▼
                    [ ML Downscaling Regressors ]
                    ├── Primary: XGBoost Regressor
                    └── Benchmark: Random Forest Regressor
                                     │
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
          [ TreeSHAP Explainability ]     [ FastAPI What-If Simulator ]
          • +1.41°C NDBI Heating          • Urban Greening (+0.25 NDVI)
          • -0.42°C NDVI Cooling          • Cool Roofs (+0.30 Albedo)
          • -0.36°C Coast Buffer          • Sub-18ms Inference Latency
```

---

## 6. Review 2 Experimental Results & Findings

### 6.1 Multi-Decadal Climatological Trend (Mann-Kendall Test)
* **Sample Size:** 28 annual mean temperatures (1997–2024).
* **Mann-Kendall Statistics:** Kendall's $S = +210$, $Z = +4.129$, $p\text{-value} = 3.64 \times 10^{-5}$ ($\ll 0.05$).
* **Sen's Slope Warming Rate:** **$+0.044^\circ\text{C}$ per year ($+0.44^\circ\text{C}$ per decade)**.

### 6.2 ML Downscaler Model Benchmark (Spatial Block K-Fold, 1.2 km Buffer)
| Metric | XGBoost Regressor (Primary) | Random Forest Regressor (Benchmark) |
| :--- | :---: | :---: |
| **Spatial Test RMSE** | **$2.05^\circ\text{C}$** | $2.21^\circ\text{C}$ |
| **Spatial Test MAE** | **$1.63^\circ\text{C}$** | $1.75^\circ\text{C}$ |
| **Spatial Test $R^2$** | **$0.445$** | $0.359$ |
| **Random Holdout RMSE** | **$1.49^\circ\text{C}$** | $1.68^\circ\text{C}$ |

### 6.3 What-If Urban Cooling Policy Simulations
* **Urban Greening ($\Delta\text{NDVI} = +0.25$):** **$-1.14^\circ\text{C}$ cooling**, reducing annual HVAC electrical cooling demand by **$5.46\text{ kWh/m}^2/\text{year}$**.
* **Water Body Restoration ($\Delta\text{NDVI} = +0.10$):** **$-1.71^\circ\text{C}$ cooling**, saving **$8.20\text{ kWh/m}^2/\text{year}$**.
* **Simulation Latency:** $12.8\text{--}17.5\text{ ms}$ (exceeding the $\le 1500\text{ ms}$ SLA by nearly $100\times$).

---

## 7. Software & Hardware Specifications

* **Programming Language & Core Runtimes:** Python 3.11 (`.venv` virtual environment isolation).
* **Geospatial & Remote Sensing Libraries:** `earthengine-api`, `shapely`, `pyproj`, `geopandas`.
* **Machine Learning & Statistics:** `xgboost`, `scikit-learn`, `shap`, `scipy`, `numpy`, `pandas`.
* **Microservices & Web Frameworks:** `fastapi`, `uvicorn`, `pydantic`.
* **Testing & Quality Assurance:** `pytest`, `pytest-cov` (29 automated tests passing).

---

## 8. Remaining Roadmap to Final Defense

* **Sprint 3 (Review 3):** Implementation of an interactive **Mapbox GL / Deck.gl web dashboard** with raster layer toggles, hover ward statistics, and interactive vector polygon drawing.
* **Sprint 4 (Final Defense):** Deep Learning benchmark (PyTorch SwinIR / UNet), automated 2-page municipal PDF brief generator (`reportlab`), and production Docker containerization for AWS deployment.
