# Mumbai Urban Heat Island (UHI) Platform — Review 2 Presentation Deck Content

**Academic Year:** 2026–27 | **Course:** Project Review 2 (BE_2605)  
**Department:** Department of Computer Engineering, M.H. Saboo Siddik College of Engineering (MHSSCE)  
**Project Guide:** Dr. Nazneen Pendhari  

---

## 👥 Presentation Team Details
* **Mohd Hussain Siddique** (Roll No: 231336) — System Architecture & ML Downscaling
* **Asad Shaikh** (Roll No: 231251) — Data Engineering & Spatial Analytics
* **Abdulrehman Ansari** (Roll No: 242268) — Cloud Architecture & Dashboard Lead
* **Shah Mohd Ahmad** (Roll No: 231246) — Reporting Engine & Quality Assurance *(Slide Deck Compiler)*

---

## 📑 Slide-by-Slide Content (Review 2 Presentation)

```
================================================================================
SLIDE 1: TITLE SLIDE
================================================================================
```
### AI-Driven Spatiotemporal Modeling and Downscaling of Urban Heat Island Dynamics in Metropolitan Mumbai Using Multi-Source Remote Sensing and Meteorological Records

* **Department:** Department of Computer Engineering, M.H. Saboo Siddik College of Engineering (MHSSCE)
* **Project Review:** Review 2 (Mid-Term Implementation Defense)
* **Project Guide:** Dr. Nazneen Pendhari
* **Presented by:**
  * Mohd Hussain Siddique | 231336
  * Asad Shaikh | 231251
  * Abdulrehman Ansari | 242268
  * Shah Mohd Ahmad | 231246
* **Academic Year:** 2026–27 | **Project ID:** BE_2605

---

```
================================================================================
SLIDE 2: REVIEW 2 EXECUTIVE PROGRESS SUMMARY
================================================================================
```
### Review 2 Progress: Multi-Pillar Implementation Milestone

Since Review 1, our team has achieved an end-to-end spatiotemporal implementation fusing real satellite earth observation data with 27 years of ground meteorological records:

1. **Spatial Satellite Dimension :**
   * Authenticated Google Earth Engine (`uhi-mumbai-507613`) pipeline ingesting Landsat 8/9 Level-2 and SRTM DEM data.
   * Derived 4 calibrated 30m layers (RGB, NDVI, NDBI, Planck LST) clipped to Mumbai’s 24-ward municipal boundary ($437.71\text{ km}^2$).
2. **Temporal Meteorological Dimension :**
   * Ingested and cleaned **383,640 continuous observations** across 28 years (1997–2024) with Hampel $3\sigma$ filter, PCHIP splines, and wind orthogonalization ($u, v$).
   * Proved statistically significant multi-decadal warming ($+0.44^\circ\text{C}$/decade) via Mann-Kendall test.
3. **Machine Learning Downscaling & Benchmarking :**
   * Dual-model benchmark (XGBoost vs. Random Forest) on an 80/20 Spatial Block K-Fold split with a **$1.2\text{ km}$ buffer exclusion zone** (Moran's $I$).
   * TreeSHAP feature attribution quantifying ward-level heat drivers ($+\Phi_{\text{NDBI}}$, $-\Phi_{\text{NDVI}}$, $-\Phi_{D_{\text{coast}}}$).
4. **Interactive Policy Simulation Microservice:**
   * FastAPI asynchronous backend executing 5 municipal cooling intervention scenarios in under $17\text{ ms}$.
5. **Quality Assurance:**
   * **29 automated tests (100% passing)** verifying physical laws, spatial buffer isolation, and simulation SLAs.

---

```
================================================================================
SLIDE 3: PROBLEM STATEMENT & REMINDER OF REVISED ARCHITECTURE
================================================================================
```
### The Problem: Bridging the Spatiotemporal Gap in Urban Climatology

| Observation Source | Spatial Resolution | Temporal Revisit | Critical Limitation |
| :--- | :--- | :--- | :--- |
| **MODIS (Terra/Aqua)** | $1,000\text{ m}$ (1 km) | Daily | Far too coarse; cannot resolve neighborhood street canyons. |
| **Landsat 8 & 9 (TIRS)** | $100\text{ m}$ thermal | 16 Days | High spatial resolution, but 16-day latency misses daily heatwave dynamics. |
| **IMD Ground Weather Stations** | Continuous (hourly) | Continuous | High temporal frequency, but only 2 primary stations (Colaba & Santacruz) for a $437\text{ km}^2$ city. |

* **Our Solution:** Fusing multi-sensor satellite imagery (Landsat 8/9, Sentinel-2, SRTM) with 27 years of continuous IMD meteorological records using non-linear ensemble machine learning (XGBoost) to reconstruct a continuous, street-level **30-meter Land Surface Temperature (LST)** grid.

---

```
================================================================================
SLIDE 4: TEMPORAL METEOROLOGICAL PIPELINE (27-YEAR IMD INGESTION)
================================================================================
```
### 27-Year Meteorological Data Engineering Pipeline (1997–2024)

*(Ahmed: Insert image from `outputs/asad_data_quality_summary.png` here)*

* **Dataset:** 383,640 records from continuous Mumbai weather observations (1997–2024) at 30-min to 1-hr frequency.
* **Automated Quality Control (QC) Pipeline:**
  1. **Hampel Filter ($3\sigma$ MAD):** Rolling-window median absolute deviation filter to eliminate electronic sensor noise without clipping genuine summer peaks.
  2. **PCHIP Spline Interpolation:** Monotonic piecewise cubic Hermite interpolation for gaps $\le 3$ hours (prevents Runge oscillation artifacts).
  3. **Physical Bounds Clipping:** Enforces tropospheric sensor plausibility ranges ($5.0^\circ\text{C}$ to $50.0^\circ\text{C}$, $5\%$ to $100\%$ RH).
  4. **Wind Vector Orthogonalization:** Decomposes circular $0^\circ\text{--}360^\circ$ angles into orthogonal continuous Cartesian velocity vectors:
     $$u = -W_s \cdot \sin(\theta \cdot \pi / 180) \quad \text{[Zonal: West to East]}$$
     $$v = -W_s \cdot \cos(\theta \cdot \pi / 180) \quad \text{[Meridional: South to North]}$$
  5. **Vapor Pressure Deficit (VPD):** Tetens formulation measuring atmospheric drying power ($e_s - e$).
  6. **Overpass Synchronization:** Isolates the 10:00–11:30 AM IST window matching Landsat 8/9 overpass times.

---

```
================================================================================
SLIDE 5: CLIMATOLOGICAL WARMING TREND PROOF (MANN-KENDALL TEST)
================================================================================
```
### Statistical Proof of Multi-Decadal Warming: Mann-Kendall Trend Analysis

*(Ahmed: Insert image from `outputs/asad_27yr_temperature_trend.png` and `outputs/asad_monthly_climatology_heatmap.png` here)*

* **Hypothesis Testing:** Non-parametric Mann-Kendall Monotonic Trend Test on 28 annual mean temperature series (1997–2024).
* **Statistical Rigor & Findings:**
  * **Test Statistic ($Z$):** $+4.129$ ($S = +210$, $n = 28$ years)
  * **Statistical Significance:** $p\text{-value} = 3.64 \times 10^{-5}$ ($\ll 0.05 \implies$ statistically conclusive monotonic warming).
  * **Sen's Slope Estimator:** **$+0.0440^\circ\text{C}$ per year**
  * **Decadal Warming Rate:** **$+0.44^\circ\text{C}$ per decade** in Metropolitan Mumbai!
* **Climatological Heatmap Analysis:** Demonstrates significant pre-monsoon heat intensification during March–May, with post-2015 summers showing consistent thermal anomalies $>2.0^\circ\text{C}$ above the baseline.

---

```
================================================================================
SLIDE 6: SPATIAL SATELLITE ENGINE & RADIOMETRIC INGESTION (GEE)
================================================================================
```
### Real Satellite Remote Sensing: Google Earth Engine 30m Ingestion

*(Ahmed: Insert master image from `outputs/review1_geospatial_layers_4panel.png` here)*

* **Cloud Data Ingestion:** Programmatic extraction via `earthengine-api` under authenticated project `uhi-mumbai-507613`. Ingested 14 cloud-filtered Landsat 8/9 scenes during pre-monsoon summer (March–May 2024).
* **Planck Split-Window Radiative Transfer Calibration:**
  $$\rho_{\text{optical}} = \text{DN} \times 0.0000275 - 0.2, \qquad T_B = \text{DN} \times 0.00341802 + 149.0 \quad (\text{Kelvin})$$
  $$F_v = \left(\frac{\text{NDVI} - 0.05}{0.70 - 0.05}\right)^2, \qquad \varepsilon = 0.985 F_v + 0.960(1 - F_v) + 0.005$$
  $$\text{LST} = \left[\frac{T_B}{1 + \left(\frac{10.895 \cdot T_B}{14380}\right) \ln(\varepsilon)}\right] - 273.15 \quad (^\circ\text{C})$$
* **Four Calibrated Geospatial Layers Produced:**
  * **True Color (RGB):** Highlighting the peninsula, Arabian Sea coast, and SGNP forest reserve.
  * **NDVI (Vegetation):** $0.00$ to $0.65$; exposes severe canopy deficits in central municipal wards (Dharavi, Govandi, Kurla).
  * **NDBI (Built-Up Concrete):** Resolves dense impervious concentrations ($>0.30$) along transportation corridors.
  * **30m LST (°C):** Demonstrates maritime cooling ($30\text{--}32^\circ\text{C}$) vs. inland thermal traps ($38\text{--}41^\circ\text{C}$).

---

```
================================================================================
SLIDE 7: MACHINE LEARNING DOWNSCALING & MODEL BENCHMARKING
================================================================================
```
### Machine Learning Downscaler: XGBoost vs. Random Forest Benchmark

*(Ahmed: Insert image from `outputs/asad_ml_validation_comparison.png` here)*

* **17-Feature Predictor Matrix:** Fuses optical reflectance (NDVI, NDBI, MNDWI, Albedo), physical state ($F_v, \varepsilon$), topography (SRTM Elevation, Slope, Aspect), spatial geometry (Coastal Distance, Latitude, Longitude), and atmospheric physics ($T_{\text{drybulb}}$, RH, $u$, $v$, VPD).
* **Spatial Autocorrelation Guard:** Evaluated on an **80/20 Spatial Block K-Fold split** with a **$1.2\text{ km}$ buffer exclusion zone** (guaranteeing zero spatial leakage between train and test sets).

#### Quantitative Benchmark Performance:
| Model Architecture | Test RMSE (°C) | Test MAE (°C) | Test $R^2$ Score | Spatial Generalization Status |
| :--- | :---: | :---: | :---: | :--- |
| **XGBoost Regressor (Primary)** | **$2.05^\circ\text{C}$** | **$1.63^\circ\text{C}$** | **$0.445$** | **Superior out-of-block spatial generalization** |
| **Random Forest (Benchmark)** | $2.21^\circ\text{C}$ | $1.75^\circ\text{C}$ | $0.359$ | Higher spatial error, prone to boundary smoothing |
| *Standard Random Holdout (XGB)* | *$1.49^\circ\text{C}$* | *$1.12^\circ\text{C}$* | *$0.836$* | *Satisfies acceptance threshold ($\le 1.5^\circ\text{C}$)* |

---

```
================================================================================
SLIDE 8: BIOPHYSICAL EXPLAINABILITY (TREESHAP ATTRIBUTION)
================================================================================
```
### Explainable AI: Decomposing Ward Heat Drivers with TreeSHAP

*(Ahmed: Insert image from `outputs/asad_shap_analysis_xgboost.png` here)*

* **Methodology:** Applied game-theoretic Shapley additive feature attribution (`shap.TreeExplainer`) on the trained XGBoost model to quantify the marginal $^\circ\text{C}$ contribution of each biophysical variable.
* **Top Heat Drivers in Metropolitan Mumbai:**
  1. **Built-Up Density (NDBI):** **$+1.41^\circ\text{C}$** mean absolute impact (primary positive heating contributor).
  2. **Vegetation Canopy (NDVI):** **$-0.42^\circ\text{C}$** cooling attribution via evapotranspirative sink.
  3. **Broadband Surface Albedo ($\alpha$):** **$-0.38^\circ\text{C}$** cooling via shortwave solar reflection.
  4. **Distance to Coast ($D_{\text{coast}}$):** **$-0.36^\circ\text{C}$** marine breeze moderation buffer.
  5. **Topography (SRTM Elevation & Slope):** Contributes $\approx 0.23^\circ\text{C}$ lapse-rate cooling in Sanjay Gandhi National Park.

---

```
================================================================================
SLIDE 9: INTERACTIVE WHAT-IF SIMULATION ENGINE (POLICY SCENARIOS)
================================================================================
```
### Real-Time Policy Simulation Microservice: 5 Urban Interventions

*(Ahmed: Insert image from `outputs/asad_simulation_scenarios.png` here)*

* **Asynchronous Microservice:** FastAPI backend running compiled surrogate inference in memory.
* **Tested Municipal Intervention Scenarios (2,481 Points across Mumbai):**

| Policy Scenario | Intervention Applied | Predicted Cooling ($\Delta T$) | Est. Energy Savings | Inference Latency |
| :--- | :--- | :---: | :---: | :---: |
| **1. Urban Greening** | Tree Canopy $\Delta\text{NDVI} = +0.25$ | **$-1.14^\circ\text{C}$** | **$5.46\text{ kWh/m}^2/\text{year}$** | $15.8\text{ ms}$ |
| **2. Cool Roof Campaign** | Reflective Coating $\Delta\alpha = +0.30$ | Surface moderation | $3.72\text{ kWh/m}^2/\text{year}$ | $17.5\text{ ms}$ |
| **3. Combined Strategy** | Canopy $+0.20$ & Albedo $+0.20$ | Multi-intervention | Synergistic cooling | $15.4\text{ ms}$ |
| **4. New Urban Park** | Canopy $\Delta\text{NDVI} = +0.40$ | **$-0.37^\circ\text{C}$** | $1.79\text{ kWh/m}^2/\text{year}$ | $12.9\text{ ms}$ |
| **5. Water Body Restoration** | Creek/Lake $\Delta\text{NDVI} = +0.10$ | **$-1.71^\circ\text{C}$** | **$8.20\text{ kWh/m}^2/\text{year}$** | $16.3\text{ ms}$ |

* **Latency SLA:** All simulations complete in **$\le 18\text{ ms}$**, outperforming the municipal requirement ($\le 1500\text{ ms}$) by nearly $100\times$.

---

```
================================================================================
SLIDE 10: QUALITY ASSURANCE & AUTOMATED TEST SUITE
================================================================================
```
### Quality Assurance & Verification Rigor

Our platform enforces strict Continuous Integration (CI) with **29 automated tests (100% passing)**:

```text
================================== TEST SESSION SUMMARY ==================================
tests/test_gee_bounds.py                • Bounding Box & EPSG:32643 CRS Projection    [PASSED]
tests/test_hussain_deliverables.py      • Spectral Indices (NDVI, NDBI, Albedo)        [PASSED]
                                        • Planck LST Monotonic Consistency            [PASSED]
                                        • What-If Simulation Engine SLA (<1.5s)       [PASSED]
tests/test_spatial_leakage.py           • Spatial Buffer Isolation (1.2 km guard)     [PASSED]
tests/test_weather_physics.py           • Wind Vector Decomposition Orthogonality     [PASSED]
                                        • Vapor Pressure Deficit Non-Negativity       [PASSED]
tests/test_asad_deliverables.py (22)    • Hampel Filter Outlier Detection & Clean     [PASSED]
                                        • PCHIP Monotonic Spline Gap Filling          [PASSED]
                                        • Physical Sensor Bounds Clipping             [PASSED]
                                        • Mann-Kendall Trend Detection Algorithm      [PASSED]
                                        • 17-Feature Dimension & Name Validation      [PASSED]
                                        • End-to-End Pipeline Execution on Real Data  [PASSED]
============================== 29 passed in 9.37 seconds ==============================
```

---

```
================================================================================
SLIDE 11: REVIEW 3 & FINAL DEFENSE ROADMAP
================================================================================
```
### Completed Milestones & Phased Roadmap to Final Defense

```text
PROJECT COMPLETION STATUS: 65.5% COMPLETE
├── Sprint 1 (Review 1): Ingestion & Spatial Satellite Pipeline          [COMPLETED]
├── Sprint 2 (Review 2): 27-Yr IMD, ML Benchmarks & What-If Engine       [COMPLETED TODAY]
├── Sprint 3 (Review 3): Geospatial Web Dashboard (Deck.gl / Mapbox GL)  [UPCOMING]
└── Sprint 4 (Final):    Deep Learning (SwinIR), PDF Generator & AWS     [FINAL DEFENSE]
```

* **Sprint 3 (Review 3 Target):**
  * Interactive **Mapbox GL / Deck.gl web dashboard** with raster layer toggles.
  * Interactive vector polygon drawing tool allowing users to click and draw on Mumbai wards.
  * Ward vulnerability ranking table based on combined thermal risk and historical warming rate.
* **Sprint 4 (Final Defense Target):**
  * Deep Learning benchmark (PyTorch SwinIR / UNet) operating on 2D spatial patches.
  * Automated 2-page municipal policy brief PDF generator (`reportlab`) for BMC officials.
  * Production Dockerization and AWS EC2 cloud deployment.

---

```
================================================================================
SLIDE 12: CONCLUSION & Q&A
================================================================================
```
### Thank You!

**AI-Driven Spatiotemporal Modeling and Downscaling of Urban Heat Island Dynamics in Metropolitan Mumbai**

* **GitHub Repository:** [github.com/Hussny-06/mumbai-uhi-platform](https://github.com/Hussny-06/mumbai-uhi-platform)
* **Automated Tests:** `pytest tests/ -v` (29/29 Passed)
* **API Microservice:** `python run_api.py` (FastAPI Server on port 8000)

*Open for Faculty Questions & Review 2 Committee Discussion*
