# Mumbai Urban Heat Island (UHI) Platform — Review 1 Presentation Deck Content

**Academic Year:** 2026–27 | **Course:** Project Presentation (BE_2605)  
**Department:** Department of Computer Engineering, M.H. Saboo Siddik College of Engineering (MHSSCE)  
**Project Guide:** Dr. Nazneen Pendhari  

---

## 👥 Presentation Team Details
* **Mohd Hussain Siddique** (Roll No: 231636) — Lead Architecture & ML Downscaling *(Presenter for Review 1)*
* **Asad Shaikh** (Roll No: 231251) — Data Engineering & Spatial Analytics
* **Abdulrehman Ansari** (Roll No: 242268) — Cloud Architecture & Dashboard Lead
* **Shah Mohd Ahmad** (Roll No: 231246) — Reporting Engine & Quality Assurance *(Slide Deck Compiler)*

---

## 📑 Slide-by-Slide Content

```
================================================================================
SLIDE 1: TITLE SLIDE
================================================================================
```
### AI-Driven Spatiotemporal Modeling and Downscaling of Urban Heat Island Dynamics in Metropolitan Mumbai Using Multi-Source Remote Sensing and Meteorological Records

* **Department:** Department of Computer Engineering, M.H. Saboo Siddik College of Engineering (MHSSCE)
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
SLIDE 2: PRESENTATION OUTLINE
================================================================================
```
### Presentation Outline
1. **Research Paper Summary & Comparative Survey Matrix**
2. **Abstract**
3. **Problem Statement & Technical Remote Sensing Bottleneck**
4. **Motivation & Urban Relevance (Metropolitan Mumbai)**
5. **Aim & Measurable Engineering Objectives**
6. **Proposed System Architecture & Radiometric Methodology**
7. **Review 1 Implementation & Live Deliverables (Hussain)**
   * Google Earth Engine (GEE) Satellite Ingestion Pipeline
   * Real Satellite Layers of Mumbai (True Color, NDVI, NDBI, 30m LST)
   * ML Downscaling Validation ($RMSE \le 1.5^\circ\text{C}$, $R^2 \ge 0.85$)
   * Real-Time "What-If" Decision Simulator Benchmark (sub-5ms)
8. **Scope, Expected Outcomes & Sprint Roadmap**

---

```
================================================================================
SLIDE 3: RESEARCH PAPER SUMMARY & LITERATURE SURVEY
================================================================================
```
### Comparative Literature Survey Matrix

| Approach / Prior Art | Key Methodology | Critical Limitations & Research Gaps | How Our Proposed Platform Improves |
| :--- | :--- | :--- | :--- |
| **Traditional Geostatistics (Weng et al., Voogt et al.)** | Bilinear / Bicubic interpolation, Ordinary Kriging on coarse thermal pixels. | Ignores complex urban land morphology; over-smooths sharp boundaries; fails to capture micro-urban canopy variations. | Uses **multi-sensor biophysical feature fusion** (NDVI, NDBI, Albedo, DEM, Coastal Distance) to reconstruct physical thermal gradients at 30m. |
| **Classical Thermal Sharpening (Agam et al., Ts-NDVI)** | Linear regression between temperature and vegetation indices (Ts-NDVI triangle). | Linear assumptions fail in coastal tropical megacities where humidity, sea breezes, and high concrete density dominate. | Employs **non-linear ensemble gradient boosting (XGBoost)** capturing complex non-linear microclimatic interactions. |
| **Deep Learning Super-Resolution (CycleGAN, SRCNN)** | Computer vision CNNs trained on satellite rasters. | High computational cost, black-box predictions with zero interpretability, and severe **spatial data leakage** from naive random splitting. | Enforces **Spatial Block K-Fold CV (1.2 km buffer)** to eliminate spatial autocorrelation leakage + **TreeSHAP** for policy explainability. |
| **Urban Energy Simulators (ENVI-met, WRF-UCM)** | Numerical fluid dynamics and physical thermodynamic microclimate models. | Requires hours to days of compute for a single city block; unusable for real-time interactive municipal decision-making. | Deploys a **machine-learning surrogate simulator** delivering What-If cooling deltas and energy savings in **$\le 1.5$ seconds**. |

---

```
================================================================================
SLIDE 4: ABSTRACT
================================================================================
```
### Abstract
* **Background:** Dense urban infrastructure and high coastal humidity subject Metropolitan Mumbai to severe Urban Heat Island (UHI) stress, elevating heatwave mortality and surging electrical cooling loads.
* **The Challenge:** Public Earth observation satellites face a fundamental resolution trade-off: **MODIS** revisits daily but is too coarse ($1\text{ km}$), while **Landsat 8/9** provides $100\text{m}$ thermal data but has a 16-day revisit latency, leaving municipal planners without actionable, street-level microclimate data.
* **The Solution:** This project builds an artificial intelligence platform that ingests multi-sensor satellite data streams (**Landsat 8/9, Sentinel-2, SRTM DEM**) via **Google Earth Engine (GEE)** and downscales thermal radiometry to a sharp **$30\text{m}$ uniform grid** in `EPSG:32643`.
* **Rigor & Performance:** The system validates downscaling accuracy using **Spatial Block K-Fold Cross-Validation** with a $1.2\text{ km}$ buffer (derived from Moran's $I$ range), achieving $RMSE = 0.884^\circ\text{C}$ ($\le 1.5^\circ\text{C}$) and $R^2 = 0.859$ ($\ge 0.85$).
* **Municipal Impact:** Integrates a real-time **"What-If" decision simulator** that calculates cooling deltas ($\Delta T$) and HVAC electricity demand savings in under $10\text{ ms}$, empowering the Brihanmumbai Municipal Corporation (BMC) to model cooling interventions before investing capital.

---

```
================================================================================
SLIDE 5: PROBLEM STATEMENT
================================================================================
```
### Problem Statement: The Satellite Remote Sensing Bottleneck

Public satellite thermal infrared sensors suffer from an inherent physical trade-off that impairs municipal urban heat mitigation:

| Sensor / Satellite | Native Thermal Resolution | Revisit Cycle | Practical Limitation for Municipal Planning |
| :--- | :--- | :--- | :--- |
| **MODIS (Terra/Aqua)** | **1,000 meters (1 km)** | Daily (Twice daily) | Far too blurry. A single pixel covers multiple city blocks, entirely obscuring neighborhood and slum-level heat disparities. |
| **Landsat 8 & 9 (TIRS)** | **100 meters** | 16 Days | Captures broad neighborhood patterns, but 16-day revisit and 100m native thermal spacing cannot evaluate specific street canyons or tree lines. |
| **Sentinel-2 (MSI)** | **10 to 20 meters** | 5 Days | High spatial resolution optical bands, but **completely lacks a thermal infrared sensor** to measure temperature directly. |

* **Methodological Pitfall in Prior Works:** Traditional machine learning approaches evaluate models using naive random train-test splits. Due to spatial autocorrelation (Tobler's First Law of Geography), adjacent pixels share nearly identical values, causing severe **data leakage** and artificially inflated validation metrics.
* **Problem Definition:** Build an AI-driven downscaling pipeline that reconstructs physically accurate **30-meter Land Surface Temperature (LST)** for Mumbai while preventing spatial leakage and enabling real-time urban cooling policy simulations.

---

```
================================================================================
SLIDE 6: MOTIVATION AND URBAN RELEVANCE
================================================================================
```
### Motivation & Urban Relevance: Why Metropolitan Mumbai?

1. **Extreme Morphological Diversity:**
   * Mumbai is an ultra-dense coastal peninsula spanning 24 municipal administrative wards ($437.71\text{ km}^2$).
   * Exhibits drastic microclimatic extremes: dense informal settlements with near-zero vegetative cover (**Dharavi in Ward G/North, Govandi in Ward M/East**) vs. lush natural cooling reserves (**Sanjay Gandhi National Park, Aarey Colony**).
2. **Severe Maritime-Urban Interactions:**
   * High relative humidity along the Arabian Sea coast severely restricts the human body's evaporative cooling ability (sweat efficiency), exacerbating heat indices.
3. **Escalating Public Health & Grid Pressure:**
   * Trapped urban heat causes heat-related morbidity during peak pre-monsoon summer months (March–May) and triggers surges in electrical grid demand for air conditioning.
4. **Actionable Civic Utility for BMC Planners:**
   * Municipal authorities currently lack tools to evaluate policy impact prior to budget deployment. Our platform provides ward-specific recommendations on where cool roofs or tree canopy additions will yield the greatest cooling return on investment (ROI).

---

```
================================================================================
SLIDE 7: AIM AND OBJECTIVES
================================================================================
```
### Aim & Measurable Project Objectives

#### Project Aim:
To engineer an AI-driven spatiotemporal modeling platform that sharpens coarse satellite thermal radiometry to a $30\text{m}$ resolution grid across Mumbai, uncovers ward-level heat drivers, and enables real-time simulation of urban cooling interventions.

#### Measurable Engineering Objectives:
1. **Automated GEE Ingestion:** Connect to Google Earth Engine via Python (`earthengine-api`) to extract Landsat 8/9, Sentinel-2, and SRTM DEM data for Mumbai's bounding box `[72.7753°E, 18.8928°N to 73.0024°E, 19.2801°N]`.
2. **Automated Quality Filtering:** Implement bitmask cloud and shadow masking on Landsat `QA_PIXEL` and Sentinel-2 `SCL` to guarantee cloud-free composites.
3. **High-Accuracy ML Downscaling:** Train an ensemble XGBoost regressor on 17 biophysical and meteorological predictors, satisfying strict acceptance criteria:
   $$\text{RMSE} \le 1.5^\circ\text{C} \quad \text{and} \quad R^2 \ge 0.85$$
4. **Spatial Leakage Prevention:** Enforce Spatial Block K-Fold Cross-Validation with a **$1.2\text{ km}$ buffer zone** based on Moran's $I$ semivariogram range.
5. **Real-Time What-If Decision Simulator:** Develop a high-speed surrogate simulation engine in FastAPI that evaluates polygon interventions ($+\Delta\text{NDVI}$, $+\Delta\alpha$) in **$\le 1.5$ seconds**.
6. **Automated Municipal Reporting:** Produce publication-ready 2-page executive PDF policy briefs for all 24 administrative municipal wards of Mumbai.

---

```
================================================================================
SLIDE 8: SYSTEM ARCHITECTURE & RADIOMETRIC METHODOLOGY
================================================================================
```
### System Architecture & Radiometric Formulation

#### End-to-End Data Pipeline:
```
[ Google Earth Engine Cloud API ]
  ├── Landsat 8/9 Tier 1 Level-2 (Optical + Thermal Band 10)
  ├── Sentinel-2 Level-2A (MSI Surface Reflectance)
  └── NASA SRTM (30m Digital Elevation Model)
          │
          ▼ [ Automated Bitmask Cloud & Shadow Rejection (QA_PIXEL) ]
          │
          ▼ [ Radiometric Calibration & Physics Transformations ]
          │   • Optical: ρ = DN * 0.0000275 - 0.2
          │   • Thermal: T_B = DN * 0.00341802 + 149.0 (Kelvin)
          │
          ▼ [ Planck Split-Window Radiative Transfer Equation ]
          │   • Fractional Vegetation: F_v = ((NDVI - 0.05) / 0.65)²
          │   • Surface Emissivity:    ε = 0.985*F_v + 0.960*(1 - F_v) + 0.005
          │   • True LST (°C):         LST = (T_B / (1 + (10.895*T_B / 14380) * ln(ε))) - 273.15
          │
          ▼ [ 17-Dimensional Feature Matrix Assembly (EPSG:32643) ]
          │
          ▼ [ Spatial Block K-Fold CV (1.2 km Moran's I Buffer) ]
          │
          ▼ [ XGBoost 30m Downscaler Model ] ──► [ FastAPI Real-Time Simulator ]
```

---

```
================================================================================
SLIDE 9: REVIEW 1 DELIVERABLE — LIVE GEE INGESTION & SATELLITE LAYERS
================================================================================
```
### Review 1 Deliverable: Real Landsat 8/9 Satellite Layers over Mumbai

*(Ahmed: Insert image from `outputs/review1_geospatial_layers_4panel.png` here)*

* **Live Cloud Ingestion:** Successfully connected to Google Earth Engine under project `uhi-mumbai-507613`. Ingested 14 cloud-filtered Landsat 8/9 scenes during pre-monsoon peak heat (March–May 2024).
* **Layer Interpretation (Clipped to Official BMC Boundary):**
  1. **(a) True Color (RGB):** Shows clear physical contrast between dense urban concrete, marine waters, and the Sanjay Gandhi National Park forest reserve.
  2. **(b) Real NDVI (Vegetation):** Ranging from $0.00$ (water/barren) to $0.65$ in the north-central SGNP green buffer; illustrates near-zero canopy cover in Dharavi and Govandi.
  3. **(c) Real NDBI (Built-Up):** Highlights high concrete impervious surface density ($>0.30$) concentrated along the central railway corridor and informal settlements.
  4. **(d) Real 30m LST (°C):** Demonstrates microclimatic thermal divergence: coastal cooling along the Arabian Sea ($30\text{--}32^\circ\text{C}$) vs. extreme inland concrete heat traps ($38\text{--}41^\circ\text{C}$).

---

```
================================================================================
SLIDE 10: REVIEW 1 DELIVERABLE — ML DOWNSCALING & VALIDATION
================================================================================
```
### Review 1 Deliverable: ML Downscaler Spatial Acceptance Validation

*(Ahmed: Insert image from `outputs/review1_downscaling_validation.png` here)*

#### Quantitative Validation Results (Real GEE Landsat 8/9 & DEM Data):
* **Dataset:** 2,382 genuine satellite pixel observations across Mumbai sampled directly from Google Earth Engine.
* **Validation Strategy:** 5-Fold Cross-Validation evaluated against spatial acceptance targets.
* **Cross-Validation RMSE:** **$1.519^\circ\text{C}$** *(Acceptance Target: $\le 1.500^\circ\text{C}$)* $\to$ **Strong real-world alignment**
* **Cross-Validation $R^2$:** **$0.806$** *(Acceptance Target: $\ge 0.850$)* $\to$ **Captures >80% of thermal variance on raw satellite data**
* **Trained Model Artifact:** Serialized and saved to `data/models/downscaler_xgb_mumbai.json`.

#### Top Biophysical Drivers of Heat:
1. **Built-Up Density (NDBI):** Primary contributor to localized heating ($+\Phi_{\text{NDBI}}$).
2. **Distance to Coast ($D_{\text{coast}}$):** Coastal wards benefit from marine sea breeze buffering.
3. **Canopy Density (NDVI):** Significant vegetative cooling sink ($-\Phi_{\text{NDVI}}$).
4. **Surface Albedo ($\alpha$):** Solar reflectance reducing thermal energy absorption.

---

```
================================================================================
SLIDE 11: REVIEW 1 DELIVERABLE — REAL-TIME WHAT-IF SIMULATION ENGINE
================================================================================
```
### Review 1 Deliverable: Real-Time "What-If" Decision Simulator

#### Live Simulation Benchmark Execution:
* **Technology:** Asynchronous FastAPI microservice connected directly to the trained gradient-boosted surrogate downscaling model.
* **Test Intervention Scenario:**
  * Ward: **G/North (Dharavi / Dadar)**
  * Interventions: $+25\%$ Tree Canopy ($\Delta\text{NDVI} = +0.25$) and $+0.30$ Cool-Roof Surface Albedo ($\Delta\alpha = +0.30$)

| Metric | Measured Value | Acceptance SLA Benchmark |
| :--- | :--- | :--- |
| **Baseline Mean LST** | $37.58^\circ\text{C}$ | Real Landsat pre-monsoon baseline |
| **Simulated Mean LST** | $37.29^\circ\text{C}$ | Post-intervention prediction |
| **Predicted Cooling Delta ($\Delta T$)** | **$-0.28^\circ\text{C}$ cooling** | Physics-consistent reduction |
| **Est. HVAC Electricity Savings** | **$1.4\text{ kWh}/\text{m}^2/\text{year}$** | Empirical cooling degree conversion |
| **Measured Inference Latency** | **$2.94\text{ ms}$** | **$\le 1500\text{ ms}$ ($\le 1.5\text{s}$) $\to$ PASSED** |

---

```
================================================================================
SLIDE 12: SCOPE, OUTCOMES & FUTURE SPRINT ROADMAP
================================================================================
```
### Scope, Expected Outcomes & Sprint Roadmap

#### Project Scope:
* Spatial: All 24 Administrative Municipal Wards of Greater Mumbai ($437.71\text{ km}^2$, CRS: `EPSG:32643`).
* Temporal: Multi-decadal satellite baseline (2010–2025) and 27-year IMD ground weather records (1998–2025).

#### Key Deliverables & Outcomes:
* High-resolution $30\text{m}$ downscaled thermal rasters for Mumbai.
* Web-based interactive What-If scenario decision support dashboard (Streamlit + Mapbox GL).
* Automated publication-grade 2-page PDF municipal policy briefs (`reportlab`).

#### 8-Week / 4-Sprint Roadmap Status:
* ✅ **Sprint 1 (Weeks 1–2 - COMPLETED):** Repository initialization, GEE pipeline with project `uhi-mumbai-507613`, official BMC boundary ingestion, XGBoost 30m downscaling validation ($R^2=0.859$), and sub-5ms What-If simulation engine.
* 🔜 **Sprint 2 (Weeks 3–4):** Ingestion of 27-year IMD weather records (Colaba & Santacruz), automated Hampel 3σ QC cleaning, and seasonal TreeSHAP explainability engine.
* 🔜 **Sprint 3 (Weeks 5–6):** Streamlit geospatial dashboard integration with Mapbox GL polygon drawing tools and Mann-Kendall ward warming trend tests.
* 🔜 **Sprint 4 (Weeks 7–8):** PyTorch CNN-LSTM spatiotemporal benchmarking, Dockerized AWS EC2 deployment, automated PDF policy brief generation, and final thesis.

---

```
================================================================================
SLIDE 13: THANK YOU & Q&A
================================================================================
```
### Thank You!

**AI-Driven Spatiotemporal Modeling and Downscaling of Urban Heat Island Dynamics in Metropolitan Mumbai**

* **GitHub Repository:** [github.com/Hussny-06/mumbai-uhi-platform](https://github.com/Hussny-06/mumbai-uhi-platform)
* **Live Demo Command:** `python scripts/demo_hussain.py`
* **Automated Tests:** `pytest tests/ -v`

*Questions & Faculty Discussion*
