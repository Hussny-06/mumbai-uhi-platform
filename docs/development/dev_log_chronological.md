# 🛠️ Chronological Development Log: Mumbai UHI Platform

This document maintains an immutable, academic-grade chronological audit trail of all engineering decisions, mathematical implementations, data pipeline milestones, and debugging breakthroughs from Day 1 to the present.

---

## 📅 Chronological Milestones

```
[Day 1] Repository Scaffold & Virtual Environment Isolation
   │
[Day 2] Official Administrative Geometry Acquisition (EPSG:32643)
   │
[Day 3] Google Earth Engine Authentication & Radiometric Calibration
   │
[Day 4] Real GEE Pixel Sampling & Spatial Feature Assembly
   │
[Day 5] XGBoost 30m Downscaler & Spatial Block K-Fold Cross-Validation
   │
[Day 6] Low-Latency 'What-If' Simulation Engine (<5ms Inference)
   │
[Day 7] Test Suite Verification & Review 1 Presentation Package
```

---

### Milestone 1: Repository Architecture & Strict Virtual Environment Isolation
* **Objective:** Establish a modular monorepo structure compliant with academic and production software standards, avoiding global package pollution.
* **Key Decisions & Implementations:**
  * Created project workspace at `mumbai-uhi-platform/`.
  * Provisioned dedicated virtual environment `.venv` using Python 3.11.
  * Configured `pyproject.toml` with strict dependency pinning (`earthengine-api`, `xgboost`, `fastapi`, `uvicorn`, `pytest`, `shapely`, `pyyaml`, `numpy`, `scipy`, `pandas`, `scikit-learn`, `matplotlib`).
  * Enforced that all commands, training routines, and testing must execute strictly via `.venv\Scripts\...`.
* **Lead Engineer:** Hussain.

---

### Milestone 2: Official Administrative Geometry Acquisition & Projection
* **Objective:** Establish an unambiguous, recognizable geographic boundary for Metropolitan Mumbai to prevent arbitrary bounding-box visual distortions.
* **Key Decisions & Implementations:**
  * Acquired and unified official OpenStreetMap / BMC municipal district boundaries for **Mumbai City** and **Mumbai Suburban Districts**.
  * Total verified surface area: **$437.71\text{ km}^2$** spanning all 24 municipal wards.
  * Persisted vector boundary as GeoJSON: [`data/vectors/mumbai_boundary.geojson`](file:///d:/Major%20Project/mumbai-uhi-platform/data/vectors/mumbai_boundary.geojson).
  * Standardized Coordinate Reference System (CRS) to **EPSG:32643 (WGS 84 / UTM Zone 43N)** with exact bounding coordinates:
    $$\text{Longitude: } [72.7753^\circ\text{E}, 73.0024^\circ\text{E}], \quad \text{Latitude: } [18.8928^\circ\text{N}, 19.2801^\circ\text{N}]$$
  * Result: Mumbai's peninsula, Arabian Sea coastline, and Thane Creek are instantly recognizable on all map outputs.
* **Lead Engineer:** Hussain.

---

### Milestone 3: Google Earth Engine Authentication & Ingestion Pipeline
* **Objective:** Transition from synthetic spatial proxies to authentic satellite observations directly from Google Earth Engine servers.
* **Key Decisions & Implementations:**
  * Authenticated user GEE cloud project: **`uhi-mumbai-507613`**.
  * Implemented server-side extraction pipeline in [`scripts/fetch_real_gee_mumbai.py`](file:///d:/Major%20Project/mumbai-uhi-platform/scripts/fetch_real_gee_mumbai.py).
  * Filtered 14 cloud-free pre-monsoon scenes (February 1 to May 31, 2024) from:
    * **Landsat 9 Level-2:** `LANDSAT/LC09/C02/T1_L2`
    * **Landsat 8 Level-2:** `LANDSAT/LC08/C02/T1_L2`
    * **NASA SRTM 30m DEM:** `USGS/SRTMGL1_003`
  * Applied QA_PIXEL bitmasking to reject cloud, dilated cloud, and cloud shadows.
  * Implemented radiometric calibration and Planck split-window radiative transfer equation:
    $$\rho_{\text{optical}} = \text{DN} \times 0.0000275 - 0.2$$
    $$T_B = \text{DN} \times 0.00341802 + 149.0 \quad (\text{Kelvin})$$
    $$F_v = \left(\frac{\text{NDVI} - 0.05}{0.70 - 0.05}\right)^2$$
    $$\varepsilon = 0.985 F_v + 0.960 (1 - F_v) + 0.005$$
    $$\text{LST} = \left[\frac{T_B}{1 + \left(\frac{10.895 \cdot T_B}{14380}\right) \ln(\varepsilon)}\right] - 273.15 \quad (^\circ\text{C})$$
  * Exported publication-ready 300 DPI high-resolution figures with scientific colorbars and categorical legends to `outputs/`.
* **Lead Engineer:** Hussain.

---

### Milestone 4: Real Satellite Pixel Sampling & XGBoost 30m Downscaler
* **Objective:** Train and validate an ensemble gradient-boosted decision tree regressor to downscale thermal radiometry to 30m grid spacing using 100% real satellite data.
* **Key Decisions & Implementations:**
  * Sampled **2,481 real satellite pixel observations** across Mumbai's urban terrain directly from GEE.
  * Exported and verified the local feature store: [`data/processed/mumbai_real_gee_training_data.csv`](file:///d:/Major%20Project/mumbai-uhi-platform/data/processed/mumbai_real_gee_training_data.csv).
  * Real-world statistics confirmed: Elevation up to $436\text{ m}$ (Sanjay Gandhi National Park), LST from $30.6^\circ\text{C}$ to $49.6^\circ\text{C}$, NDVI from $-0.23$ to $+0.77$.
  * Implemented Spatial Block K-Fold Cross-Validation with a **$1.2\text{ km}$ buffer exclusion zone** (derived from empirical Moran's $I$ semivariogram range) to eliminate spatial autocorrelation leakage.
  * Trained XGBoost regressor:
    * **Standard 20% Random Holdout:** $\text{RMSE} = 1.488^\circ\text{C}$, $R^2 = 0.836$ (satisfies project acceptance criteria $\le 1.50^\circ\text{C}$).
    * **5-Fold Spatial Block CV:** $\text{RMSE} = 2.024 \pm 0.226^\circ\text{C}$, $R^2 = 0.647$ (honest spatial generalization across non-contiguous municipal microclimates).
  * Persisted model weights to: [`data/models/downscaler_xgb_mumbai.json`](file:///d:/Major%20Project/mumbai-uhi-platform/data/models/downscaler_xgb_mumbai.json).
  * Generated spatial validation plot: [`outputs/review1_downscaling_validation.png`](file:///d:/Major%20Project/mumbai-uhi-platform/outputs/review1_downscaling_validation.png).
* **Lead Engineer:** Hussain.

---

### Milestone 5: Ultra-Low Latency 'What-If' Simulation Engine
* **Objective:** Enable municipal planners at the BMC to draw urban polygons, simulate cooling interventions, and receive cooling deltas ($\Delta T$) and energy demand savings within $\le 1.5$ seconds.
* **Key Decisions & Implementations:**
  * Implemented [`src/api/simulation_engine.py`](file:///d:/Major%20Project/mumbai-uhi-platform/src/api/simulation_engine.py).
  * Supports vector polygon perturbations: $\Delta\text{NDVI}$ (tree canopy), $\Delta\text{Albedo}$ (cool roofs), and $\Delta\text{NDBI}$ (impervious surface reduction).
  * Enriched baseline feature vector with dynamic interaction terms (`NDBI - NDVI`, `Albedo * NDBI`).
  * Loads the trained XGBoost model artifact directly into memory for ultra-fast vector inference.
  * Benchmark result: **$4.83\text{ ms}$ inference latency**, exceeding the municipal SLA ($\le 1500\text{ ms}$) by over $300\times$.
* **Lead Engineer:** Hussain.

---

### Milestone 6: Automated Verification & Test Suite
* **Objective:** Ensure continuous integration correctness, spatial rigor, and physical validity across all modules.
* **Key Decisions & Implementations:**
  * Implemented unit and integration tests under `tests/`:
    1. `test_gee_bounds.py`: Validates bounding box coordinates and EPSG:32643 projection integrity.
    2. `test_spectral_indices_known_values`: Validates NDVI, NDBI, and Albedo edge cases.
    3. `test_planck_true_lst_thermodynamics`: Confirms physical LST monotonic consistency with emissivity.
    4. `test_what_if_simulation_engine_sla`: Enforces the sub-1.5s inference SLA.
    5. `test_spatial_buffer_isolation`: Validates that spatial block test folds have zero training points within the $1.2\text{ km}$ buffer.
    6. `test_wind_vector_decomposition_cardinals`: Tests cardinal wind orthogonalization ($u, v$).
    7. `test_vapor_pressure_deficit_non_negative`: Verifies Tetens formulation non-negativity.
  * Test execution result: **7/7 tests passed in 3.74s**.
* **Lead Engineers:** Ahmed (QA/Test Specification), Hussain (Implementation).

---

### Milestone 7: Review 1 Deliverables & Presentation Deck
* **Objective:** Prepare comprehensive presentation materials for Review 1 strictly aligned with academic requirements.
* **Key Decisions & Implementations:**
  * Aligned slide deck strictly to Guide Dr. Nazneen Pendhari's 7 mandatory sections:
    1. Project Title
    2. Research Paper Summary (Comparative Literature Matrix of 7 foundational papers)
    3. Abstract
    4. Problem Statement
    5. Aim & Objectives
    6. Scope & Outcome
    7. Motivation & Relevance
  * Authored complete 13-slide markdown deck: [`docs/review1_presentation_deck.md`](file:///d:/Major%20Project/mumbai-uhi-platform/docs/review1_presentation_deck.md).
  * Synthesized publication-grade outputs for Ahmed to embed into PPT slides.
* **Lead Engineers:** Ahmed (Deck Coordinator), Hussain (Technical Content & Imagery).
