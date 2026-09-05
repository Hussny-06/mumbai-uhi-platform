# 👥 Team Contribution Matrix & Viva Defense Guide

This document defines the clear division of labor, individual code ownership, technical domain boundaries, and viva defense strategies for all four team members (**Hussain**, **Asad**, **Abdulrehman**, and **Ahmed**).

---

## 🎯 Executive Ownership Matrix

| Team Member | Project Role | Technical Focus Area | Primary Code Modules Owned | Review 1 Deliverable Status |
| :--- | :--- | :--- | :--- | :--- |
| **Hussain** | System Architecture & ML Downscaling | GEE Extraction, Radiometric Physics, ML Regressors, What-If Simulation Engine | `src/ingestion/gee_extractor.py`<br>`src/features/spectral_indices.py`<br>`src/models/downscaler_xgb.py`<br>`src/api/simulation_engine.py`<br>`scripts/train_and_validate_downscaler.py`<br>`scripts/fetch_real_gee_mumbai.py` | **100% Complete** (Live GEE data, trained model, sub-5ms simulation, 4-panel figures) |
| **Asad** | Data Engineering & Spatial Analytics | 27-Year IMD Synchronization, Wind Orthogonalization, Spatial Block K-Fold, TreeSHAP | `src/ingestion/imd_parser.py`<br>`src/features/weather_physics.py`<br>`src/models/spatial_kfold.py`<br>`src/models/shap_explainer.py` | **Defense-in-Depth Reserve** (IMD parsing & spatial splitting active) |
| **Abdulrehman** | Cloud Architecture & Dashboard Lead | AWS S3 Cloud-Optimized GeoTIFFs, Dockerization, Interactive Streamlit/Mapbox UI | `src/frontend/app.py`<br>`Dockerfile`<br>`docker-compose.yml`<br>`configs/config.yaml` | **In Progress (Sprint 2/3)** (UI wireframes ready) |
| **Ahmed** | Reporting Engine & Quality Assurance | Automated Municipal PDF Briefs, CRS Sanity Testing, IEEE 830 Thesis & Decks | `docs/review1_presentation_deck.md`<br>`tests/test_*.py`<br>`src/reporting/report_generator.py` | **100% Complete** (13-slide deck, test suite verification) |

---

## 🔬 Detailed Member Profiles & Viva Defense Strategy

---

### 1. Hussain: System Architecture & ML Downscaling
* **Role Summary:** System architect responsible for the multi-sensor satellite ingestion pipeline, physical radiometric calibrations, gradient-boosted spatial downscaling model, and high-performance What-If simulation engine.
* **Core Technical Contributions:**
  1. **Google Earth Engine Integration:** Developed server-side GEE extraction for Metropolitan Mumbai ($437.71\text{ km}^2$) under cloud project `uhi-mumbai-507613`. Ingested Tier-1 Landsat 8/9 Level-2 and NASA SRTM DEM data.
  2. **Radiometric Calibrations:** Implemented the Planck split-window radiative transfer equation to derive true 30m Land Surface Temperature (LST) from Band 10 thermal brightness temperature ($T_B$) modulated by fractional vegetation cover ($F_v$) and surface emissivity ($\varepsilon$).
  3. **ML Downscaler:** Built and trained the 30m XGBoost regressor using 2,481 real satellite pixel observations across Mumbai, achieving $\text{RMSE} = 1.488^\circ\text{C}$ and $R^2 = 0.836$ on random holdouts, and $2.024^\circ\text{C}$ across spatial blocks.
  4. **Low-Latency Simulation Engine:** Engineered `src/api/simulation_engine.py` with dynamic feature enrichment, delivering sub-5ms inference latency ($\le 1.5\text{s}$ SLA) for interactive urban planning.
* **Likely Viva Questions & Model Answers:**
  * *Q: Why use XGBoost instead of standard bicubic or bilinear interpolation for downscaling?*  
    **A:** Bicubic interpolation merely smooths coarse pixels without adding real physical information. XGBoost learns non-linear relationships between fine-scale 30m biophysical predictors (NDVI, NDBI, Albedo, elevation, aspect) and thermal radiometry, reconstructing micro-scale thermal variations that interpolation completely misses.
  * *Q: Why does the simulation engine execute so fast (<5 ms)?*  
    **A:** The engine loads the pre-trained tree ensemble weights into memory at startup. When an intervention is drawn, it perturbs the local NumPy feature matrix and executes compiled C++ tree inference directly without re-querying satellite APIs or disk.

---

### 2. Asad: Data Engineering & Spatial Analytics
* **Role Summary:** Data engineer and spatial statistician responsible for historical in-situ meteorological records, timestamp synchronization, spatial autocorrelation prevention, and explainable AI.
* **Core Technical Contributions:**
  1. **27-Year IMD Ingestion:** Processed continuous surface weather records (1998–2025) from Colaba (Station 43057) and Santacruz (Station 43003).
  2. **Hampel QC Filtering:** Implemented rolling-window $3\sigma$ median absolute deviation filtering to reject sensor electronic noise, with Hermite spline gap-filling for gaps $\le 3$ hours.
  3. **Wind Vector Orthogonalization:** Decomposed circular wind direction angles ($0^\circ\text{--}360^\circ$) into orthogonal zonal ($u$) and meridional ($v$) velocity vectors to resolve numerical discontinuities.
  4. **Satellite Overpass Synchronization:** Developed the temporal alignment logic that interpolates ground station observations to match the exact satellite acquisition window ($\pm 30$ minutes of the ~10:50 AM IST Landsat overpass).
  5. **Spatial Autocorrelation Guard:** Implemented `SpatialBlockKFold` with a $1.2\text{ km}$ buffer exclusion zone derived from Moran's $I$ semivariogram range, preventing spatial data leakage.
* **Likely Viva Questions & Model Answers:**
  * *Q: Why is standard K-Fold cross-validation invalid for geospatial heat modeling?*  
    **A:** Due to Tobler's First Law of Geography, adjacent pixels are spatially autocorrelated. Standard random splitting places neighboring pixels in both train and test sets, leading to severe data leakage and artificially inflated accuracy. Our $1.2\text{ km}$ buffered block split guarantees out-of-neighborhood generalization.
  * *Q: How are two IMD stations interpolated across all 24 wards?*  
    **A:** Using distance-decay gradients relative to the Arabian Sea coastline ($D_{\text{coast}}$) combined with elevation gradients, reflecting the marine breeze buffer in South Mumbai vs. inland heating at Santacruz/Kurla.

---

### 3. Abdulrehman: Cloud Architecture & Dashboard Lead
* **Role Summary:** Cloud and DevOps lead responsible for data storage, cloud deployment pipelines, containerization, and interactive geospatial dashboard interfaces.
* **Core Technical Contributions:**
  1. **AWS S3 Data Lake:** Designed Cloud-Optimized GeoTIFF (COG) storage architecture for rapid windowed spatial streaming.
  2. **Containerized Deployment:** Authored production Docker containers for FastAPI backend and frontend services.
  3. **Interactive UI:** Designing the Streamlit / Mapbox GL interface allowing municipal users to toggle raster layers (True Color, NDVI, NDBI, 30m LST) and draw vector polygons for What-If scenario simulations.
* **Likely Viva Questions & Model Answers:**
  * *Q: Why use Cloud-Optimized GeoTIFFs (COGs)?*  
    **A:** COGs support HTTP range requests, allowing clients to stream only the bounding box or resolution level needed for the current viewport without downloading entire multi-gigabyte satellite rasters.

---

### 4. Ahmed: Reporting Engine & Quality Assurance
* **Role Summary:** QA and municipal reporting lead responsible for automated PDF policy briefs, test suite integrity, coordinate reference system verification, and academic documentation.
* **Core Technical Contributions:**
  1. **Review 1 Presentation Deck:** Authored and formatted the 13-slide academic presentation deck strictly following Guide Dr. Nazneen Pendhari's 7 mandatory sections.
  2. **Automated Sanity Tests:** Co-authored test suites in `tests/` covering spatial bounds, EPSG:32643 projection compliance, and thermodynamic equations.
  3. **Municipal PDF Engine:** Designing automated 2-page executive policy brief generation (`reportlab`) summarizing simulated ward-level cooling deltas and energy savings for BMC urban planners.
* **Likely Viva Questions & Model Answers:**
  * *Q: How does the system ensure coordinate consistency across data sources?*  
    **A:** All vector and raster layers are strictly reprojected and validated against EPSG:32643 (WGS 84 / UTM Zone 43N), ensuring exact metric unit consistency ($30\text{m} \times 30\text{m}$ grid) for area and distance computations.

---

## 🛡️ Review 1 Strategic Presentation Plan

```text
┌─────────────────────────────────────────────────────────────┐
│                 REVIEW 1 PRESENTATION STAGE                 │
├──────────────────────────────┬──────────────────────────────┤
│  PRIMARY SHOWCASE (Hussain)  │  RESERVE DEFENSE (Asad)      │
├──────────────────────────────┼──────────────────────────────┤
│ • GEE Ingestion (Landsat 9)  │ • 27-Year IMD Ingestion      │
│ • 4-Panel Master Figures     │ • Colaba vs Santacruz Trends │
│ • Real GEE 30m Downscaler    │ • Wind Vector Orthogonal     │
│ • Sub-5ms What-If Simulator  │ • Moran's I 1.2km Buffer     │
│ • 7/7 Passing Test Suite     │ • TreeSHAP Attribution       │
└──────────────────────────────┴──────────────────────────────┘
```

1. **Lead Presenter:** Hussain will walk the review committee through the core technical architecture, live GEE data ingestion, high-resolution 4-panel imagery, downscaling performance, and the sub-5ms simulation engine.
2. **Deck & Flow Coordinator:** Ahmed will manage the presentation flow, ensuring time limits and adherence to Dr. Nazneen's 7 required sections.
3. **Strategic Defense-in-Depth:** Asad's 27-year IMD meteorological cleaning and multi-decadal warming divergence will be held in reserve. If reviewers challenge the temporal depth of satellite observations, the team will present Asad's historical meteorological pipeline as evidence of multi-decadal rigor.
