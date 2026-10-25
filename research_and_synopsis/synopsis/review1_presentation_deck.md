# Mumbai Urban Heat Island (UHI) Platform — Review 1 Presentation Deck Content

**Academic Year:** 2026–27 | **Course:** Project Presentation (BE_2605)  
**Department:** Department of Computer Engineering, M.H. Saboo Siddik College of Engineering (MHSSCE)  
**Project Guide:** Dr. Nazneen Pendhari  

---

## 👥 Presentation Team Details
* **Mohd Hussain Siddique** (Roll No: 231336) — System Architecture & ML Downscaling
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
1. **Research Paper Summary & Comparative Survey Matrix (8 Landmark Papers)**
2. **Abstract**
3. **Problem Statement & Satellite Remote Sensing Bottleneck**
4. **Motivation & Urban Relevance (Metropolitan Mumbai Coastal Context)**
5. **Aim & Measurable Engineering Objectives**
6. **Proposed System Architecture & Radiometric Methodology**
7. **Review 1 Primary Milestone: Live Google Earth Engine (GEE) Ingestion & Calibrated Satellite Layers**
8. **Scope, Expected Outcomes & Phased Sprint Roadmap**
9. **Conclusion & Q&A**

---

```
================================================================================
SLIDE 3: RESEARCH PAPER SUMMARY (PART 1: THERMAL REMOTE SENSING & SHARPENING)
================================================================================
```
### Research Paper Summary & Literature Survey (1 / 2)

| Paper & Authors | Core Methodology | Critical Limitations & Research Gaps | How Our Platform Improves |
| :--- | :--- | :--- | :--- |
| **Voogt & Oke (2003)**<br>*Thermal remote sensing of urban climates* (RSE) | Foundational micro-meteorological principles linking surface temperature to urban 3D geometry and materials. | Identifies sensor trade-offs: satellite nadir view misses vertical walls; coarse thermal pixels obscure street-level dynamics. | Implements **multi-source biophysical feature fusion** (30m optical, DEM, and coastal distance) to resolve street-scale gradients. |
| **Weng, Lu & Schubring (2004)**<br>*Estimation of LST-vegetation abundance relationship* (RSE) | Linear regression and spectral mixture analysis relating LST to NDVI vegetation abundance. | Assumes simplistic linear relationship, failing in coastal tropical cities where humidity, concrete density, and sea breezes dominate. | Employs **non-linear ensemble gradient boosting (XGBoost)** capturing non-linear biophysical and meteorological interactions. |
| **Agam, Kustas, Anderson, et al. (2007)**<br>*TsHARP: Thermal sharpening of imagery* (RSE) | Least-squares regression between fractional vegetation cover ($F_v$) and thermal radiometry. | Assumes homogeneous surface emissivity; produces high error in ultra-dense built-up areas with complex concrete morphology. | Integrates **17 predictors** including NDBI, broadband albedo, elevation, coastal distance, and wind vectors. |
| **Gao, Masek, Schwaller & Hall (2006)**<br>*STARFM: Spatiotemporal reflectance fusion* (IEEE TGRS) | Blends coarse daily MODIS with fine Landsat optical imagery using adaptive weighting. | Highly sensitive to cloud obstruction; lacks physical radiative transfer calibration for dynamic urban heat anomalies. | Uses **automated QA_PIXEL bitmask cloud rejection** combined with the Planck split-window radiative transfer equation. |

---

```
================================================================================
SLIDE 4: RESEARCH PAPER SUMMARY (PART 2: DOWNSCALING, EXPLAINABILITY & MITIGATION)
================================================================================
```
### Research Paper Summary & Literature Survey (2 / 2)

| Paper & Authors | Core Methodology | Critical Limitations & Research Gaps | How Our Platform Improves |
| :--- | :--- | :--- | :--- |
| **Bonafoni (2016)**<br>*Downscaling Landsat thermal imagery for UHI* (IEEE GRSL) | High-resolution thermal sharpening using multi-spectral indices (NDVI, NDBI, MNDWI). | Evaluated using standard random train-test splits, introducing severe **spatial autocorrelation data leakage**. | Enforces **Spatial Block K-Fold Cross-Validation (1.2 km buffer)** based on Moran's $I$ semivariogram range. |
| **Zhan, Chen, Zhou, et al. (2013)**<br>*Disaggregation of remotely sensed LST* (PE&RS) | Comprehensive benchmark of thermal disaggregation algorithms across diverse satellite platforms. | Proves that empirical regression without physical radiometric constraints causes severe boundary and thermal drift artifacts. | Directly couples inverted Planck radiation physics with Sobrino fractional vegetation emissivity ($F_v, \varepsilon$). |
| **Lundberg & Lee (2017)**<br>*A unified approach to interpreting model predictions (TreeSHAP)* (NeurIPS) | Game-theoretic Shapley additive feature attribution for tree-based ensemble models. | Standard XAI tools explain individual rows without spatial context or municipal policy translation. | Implements **Spatial TreeSHAP attribution** measuring exact marginal degree Celsius contributions per municipal ward. |
| **Santamouris (2014)**<br>*Cooling the cities—reflective & green mitigation* (Solar Energy) | Thermodynamic assessment of urban cooling technologies: cool roofs ($\Delta\alpha$) and green canopy ($\Delta\text{NDVI}$). | Numerical simulation models (e.g., ENVI-met, CFD) take hours to days per city block, unusable for interactive planning. | Engineers a **machine-learning surrogate simulation engine** delivering interactive What-If cooling deltas in **$\le 1.5$ seconds**. |

---

```
================================================================================
SLIDE 5: ABSTRACT
================================================================================
```
### Abstract
* **Background:** Dense urban infrastructure and high coastal humidity subject Metropolitan Mumbai to severe Urban Heat Island (UHI) stress, elevating heatwave vulnerability and surging electrical cooling loads.
* **The Challenge:** Public Earth observation satellites face a fundamental resolution trade-off: **MODIS** revisits daily but is too coarse ($1\text{ km}$), while **Landsat 8/9** provides $100\text{m}$ thermal data but has a 16-day revisit latency, leaving municipal planners without actionable, street-level microclimate data.
* **The Solution:** This project builds an artificial intelligence platform that ingests multi-source satellite data streams (**Landsat 8/9, Sentinel-2, SRTM DEM**) via **Google Earth Engine (GEE)** and downscales thermal radiometry to a sharp **$30\text{m}$ uniform grid** in `EPSG:32643`.
* **Methodological Rigor:** The system incorporates **Spatial Block K-Fold Cross-Validation** with a $1.2\text{ km}$ buffer (derived from Moran's $I$ semivariogram range) to strictly prevent spatial autocorrelation leakage.
* **Review 1 Progress:** Fully initialized project repository with virtual environment isolation, connected live to Google Earth Engine (`uhi-mumbai-507613`), clipped data to Mumbai's official 24-ward boundary ($437.71\text{ km}^2$), and derived calibrated high-resolution maps for True Color, NDVI, NDBI, and 30m Land Surface Temperature (LST).
* **Municipal Impact:** Lays the foundation for an interactive **"What-If" decision simulator** empowering the Brihanmumbai Municipal Corporation (BMC) to model urban cooling interventions before deploying civic capital.

---

```
================================================================================
SLIDE 6: PROBLEM STATEMENT
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
SLIDE 7: MOTIVATION AND URBAN RELEVANCE
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
SLIDE 8: AIM AND OBJECTIVES
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
SLIDE 9: SYSTEM ARCHITECTURE & RADIOMETRIC METHODOLOGY
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
          │   • Optical Reflectance: ρ = DN * 0.0000275 - 0.2
          │   • Thermal Brightness:  T_B = DN * 0.00341802 + 149.0 (Kelvin)
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
SLIDE 10: REVIEW 1 PRIMARY MILESTONE — LIVE GEE INGESTION & SATELLITE LAYERS
================================================================================
```
### Review 1 Development Milestone: Real Satellite Ingestion over Mumbai

*(Ahmed: Insert master image from `outputs/review1_geospatial_layers_4panel.png` here)*

* **Active Google Earth Engine Connection:** Successfully authenticated and connected to GEE under project **`uhi-mumbai-507613`**. Ingested 14 cloud-filtered Landsat 8/9 scenes during peak pre-monsoon heat (March–May 2024).
* **Official Administrative Boundary:** Standardized on official OpenStreetMap/BMC municipal geometry ($437.71\text{ km}^2$, 24 wards, EPSG:32643 UTM Zone 43N).
* **Four Calibrated Geospatial Layers Produced:**
  1. **(a) True Color (Sentinel-2 / Landsat RGB):** Distinguishes dense built-up terrain, coastal waters, and the Sanjay Gandhi National Park forest reserve.
  2. **(b) Canopy Density (NDVI):** Resolves vegetation indices from $0.00$ to $0.65$; exposes severe canopy deficits in central municipal wards (Dharavi, Govandi, Kurla).
  3. **(c) Built-Up Impervious Density (NDBI):** Identifies dense concrete surface concentrations ($>0.30$) along transportation corridors and industrial zones.
  4. **(d) Land Surface Temperature (Planck LST):** Street-level 30m thermal baseline capturing maritime cooling ($30\text{--}32^\circ\text{C}$) vs. inland thermal traps ($38\text{--}41^\circ\text{C}$).

---

```
================================================================================
SLIDE 11: SCOPE, OUTCOMES, SPRINT ROADMAP & CONCLUSION
================================================================================
```
### Scope, Sprint Roadmap & Conclusion

#### Project Scope:
* **Spatial:** All 24 Administrative Municipal Wards of Greater Mumbai ($437.71\text{ km}^2$, CRS: `EPSG:32643`).
* **Temporal:** Multi-decadal satellite baseline (2010–2025) and 27-year IMD ground weather records (1998–2025).

#### 4-Sprint Phased Roadmap:
* ✅ **Sprint 1 (Review 1 Milestone — COMPLETED):**
  * Monorepo architecture setup with `.venv` isolation.
  * Live Google Earth Engine pipeline (`uhi-mumbai-507613`).
  * Official BMC 24-ward boundary acquisition ($437.71\text{ km}^2$).
  * Multi-sensor radiometric calibration & 4-panel satellite layers (RGB, NDVI, NDBI, LST).
* 🔜 **Sprint 2 (Review 2 Focus):**
  * 27-year IMD weather records ingestion & Hampel $3\sigma$ cleaning (Colaba & Santacruz).
  * Machine Learning Downscaler training & Spatial Block K-Fold validation.
  * Seasonal TreeSHAP explainability engine (identifying ward-level heat drivers).
* 🔜 **Sprint 3 (Review 3 Focus):**
  * Interactive Streamlit / Mapbox GL web dashboard with polygon drawing tools.
  * Mann-Kendall monotonic ward warming trend tests (2010–2025).
* 🔜 **Sprint 4 (Final Defense):**
  * Deep learning benchmark (PyTorch CNN-LSTM).
  * Automated 2-page municipal PDF policy brief engine (`reportlab`) for BMC planners.
  * Dockerized AWS EC2 deployment & final thesis.

---

### Thank You!

**AI-Driven Spatiotemporal Modeling and Downscaling of Urban Heat Island Dynamics in Metropolitan Mumbai**

* **GitHub Repository:** [github.com/Hussny-06/mumbai-uhi-platform](https://github.com/Hussny-06/mumbai-uhi-platform)

*Open for Questions & Faculty Discussion*
