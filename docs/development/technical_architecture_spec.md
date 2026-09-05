# 📐 Technical Architecture & Mathematical Specification

This document provides the formal mathematical equations, physical constants, data dictionary, and algorithmic specifications underpinning the Mumbai UHI Platform.

---

## 1. Physical Remote Sensing Laws & Radiometric Equations

### 1.1 Optical Calibration & Top-of-Canopy Reflectance
Raw Digital Numbers ($\text{DN}$) from Landsat 8/9 Operational Land Imager (OLI/OLI-2) Level-2 Collection 2 are converted to surface reflectance ($\rho$):
$$\rho_{\lambda} = \text{DN}_{\lambda} \times 0.0000275 - 0.2$$

### 1.2 Thermal Radiometric Calibration (Band 10)
Thermal infrared Digital Numbers ($\text{DN}$) from the Thermal Infrared Sensor (TIRS/TIRS-2) Band 10 are scaled to Top-of-Atmosphere Brightness Temperature ($T_B$) in Kelvin:
$$T_B = \text{DN}_{\text{B10}} \times 0.00341802 + 149.0 \quad (\text{Kelvin})$$

### 1.3 Fractional Vegetation Cover ($F_v$) & Surface Emissivity ($\varepsilon$)
To account for surface heterogeneity between bare soil, built-up surfaces, and dense vegetation, Fractional Vegetation Cover ($F_v$) is derived from Normalized Difference Vegetation Index ($\text{NDVI}$):
$$F_v = \left(\frac{\text{NDVI} - \text{NDVI}_{\text{soil}}}{\text{NDVI}_{\text{veg}} - \text{NDVI}_{\text{soil}}}\right)^2 = \left(\frac{\text{NDVI} - 0.05}{0.70 - 0.05}\right)^2, \quad \text{clamped to } [0.0, 1.0]$$

Narrowband Land Surface Emissivity ($\varepsilon$) for Landsat Band 10 ($\lambda = 10.895\ \mu\text{m}$) is calculated using the Sobrino model:
$$\varepsilon = \varepsilon_{\text{veg}} F_v + \varepsilon_{\text{soil}} (1 - F_v) + C_{\lambda} = 0.985 F_v + 0.960 (1 - F_v) + 0.005$$
where $C_{\lambda} = 0.005$ represents surface cavity geometric effects.

### 1.4 Planck Split-Window Radiative Transfer Equation
True Land Surface Temperature ($T_s$ or $\text{LST}$) in degrees Celsius is derived by solving the inverted Planck function:
$$\text{LST} = \left[\frac{T_B}{1 + \left(\frac{\lambda \cdot T_B}{\rho_c}\right) \ln(\varepsilon)}\right] - 273.15 \quad (^\circ\text{C})$$
where:
* $\lambda = 10.895\ \mu\text{m}$ (Landsat Band 10 effective central wavelength).
* $\rho_c = \frac{h \cdot c}{\sigma} = 14380\ \mu\text{m}\cdot\text{K}$ (first radiation constant ratio, where $h$ is Planck's constant, $c$ is light velocity, $\sigma$ is Stefan-Boltzmann constant).

---

## 2. In-Situ Meteorological Physics & Temporal Synchronization

### 2.1 Wind Vector Orthogonalization ($u, v$ Decomposition)
To eliminate mathematical circular discontinuities between $359^\circ$ and $1^\circ$, raw wind speed ($W_s$ in $\text{m/s}$) and meteorological wind direction ($\theta$ in degrees) are decomposed into orthogonal Cartesian velocity vectors:
$$u = -W_s \cdot \sin\left(\frac{\theta \cdot \pi}{180}\right) \quad \text{[Zonal Velocity: West to East (+) ]}$$
$$v = -W_s \cdot \cos\left(\frac{\theta \cdot \pi}{180}\right) \quad \text{[Meridional Velocity: South to North (+) ]}$$

### 2.2 Vapor Pressure Deficit ($\text{VPD}$)
Vapor Pressure Deficit quantifies the atmospheric evaporative drying gradient driving urban evapotranspiration. It is computed via the Tetens formulation:
$$e_s = 0.61078 \cdot \exp\left(\frac{17.27 \cdot T_{\text{dry}}}{T_{\text{dry}} + 237.3}\right) \quad (\text{Saturation Vapor Pressure, kPa})$$
$$e = e_s \cdot \left(\frac{\text{RH}}{100.0}\right) \quad (\text{Actual Vapor Pressure, kPa})$$
$$\text{VPD} = e_s - e \quad (\text{Vapor Pressure Deficit, kPa})$$

### 2.3 Satellite Overpass Temporal Synchronization
Landsat 8/9 follows a sun-synchronous circular orbit passing over Mumbai at **10:45 AM – 11:15 AM IST (05:15 – 05:45 UTC)**. Continuous IMD ground station observations from Colaba and Santacruz are interpolated to the exact scene timestamp ($t_{\text{satellite}} \pm 30\text{ min}$) to assemble the unified training matrix.

---

## 3. Unified 17-Dimensional Biophysical Predictor Matrix

Every $30\text{m} \times 30\text{m}$ pixel in Metropolitan Mumbai is characterized by a 17-dimensional feature vector:

| # | Feature Name | Dimension / Unit | Physical Source | Physical Significance |
| :---: | :--- | :--- | :--- | :--- |
| 1 | `NDVI` | $[-1.0, +1.0]$ | Landsat 8/9 / Sentinel-2 | Vegetation canopy density & evapotranspirative cooling capacity |
| 2 | `NDBI` | $[-1.0, +1.0]$ | Landsat 8/9 / Sentinel-2 | Built-up impervious concrete/asphalt surface density |
| 3 | `MNDWI` | $[-1.0, +1.0]$ | Landsat 8/9 / Sentinel-2 | Modified water index (coastal creeks, wetlands, water bodies) |
| 4 | `Albedo` | $[0.0, 1.0]$ | Liang Broadband Optical | Surface solar reflectance (fraction of shortwave radiation reflected) |
| 5 | `F_v` | $[0.0, 1.0]$ | Derived from NDVI | Fractional vegetation canopy coverage |
| 6 | `Emissivity` | $[0.90, 1.0]$ | Sobrino Model | Surface thermal radiative emission efficiency |
| 7 | `Elevation_m` | $[-15\text{m}, +450\text{m}]$ | NASA SRTM 30m DEM | Orographic lapse-rate cooling with altitude |
| 8 | `Slope_deg` | $[0^\circ, 60^\circ]$ | Derived from SRTM DEM | Topographic solar angle of incidence |
| 9 | `Aspect_deg` | $[0^\circ, 360^\circ]$ | Derived from SRTM DEM | Azimuthal compass orientation relative to solar insolation |
| 10 | `Distance_Coast_km` | $[0.1\text{km}, 15.0\text{km}]$ | Euclidean Distance | Marine sea-breeze thermal buffering gradient |
| 11 | `Latitude` | $[18.89^\circ\text{N}, 19.28^\circ\text{N}]$ | Coordinate (WGS 84) | Spatial macro-coordinate |
| 12 | `Longitude` | $[72.77^\circ\text{E}, 73.00^\circ\text{E}]$ | Coordinate (WGS 84) | Spatial macro-coordinate |
| 13 | `T_drybulb_C` | $[20.0^\circ\text{C}, 42.0^\circ\text{C}]$ | IMD Weather Stations | Ambient atmospheric background temperature |
| 14 | `Relative_Humidity` | $[20\%, 100\%]$ | IMD Weather Stations | Atmospheric moisture content |
| 15 | `Wind_u_zonal` | $[-15\text{ m/s}, +15\text{ m/s}]$ | IMD Decomposition | Zonal wind velocity (Arabian Sea onshore breeze) |
| 16 | `Wind_v_meridional` | $[-15\text{ m/s}, +15\text{ m/s}]$ | IMD Decomposition | Meridional along-coast wind velocity |
| 17 | `VPD_kPa` | $[0.0\text{ kPa}, 5.0\text{ kPa}]$ | Tetens Equation | Atmospheric evaporative demand |

---

## 4. Spatial Autocorrelation & Buffer Isolation

To adhere to Tobler's First Law of Geography without data leakage:
$$d_{\text{min}}(\mathbf{x}_{\text{train}}, \mathbf{x}_{\text{test}}) \ge 1200\text{ meters}$$
* The $1.2\text{ km}$ buffer threshold is empirically determined from the spatial semivariogram range of Moran's $I$ across Mumbai's urban canopy.
* Implemented in `src/models/spatial_kfold.py`: guarantees that every test fold is spatially quarantined from all training samples by at least $1.2\text{ km}$.

---

## 5. What-If Simulation Engine Architecture

```
User Web Client (Mapbox AOI Polygon)
        │  Intervention: { ΔNDVI: +0.25, ΔAlbedo: +0.30, ΔNDBI: -0.15 }
        ▼
FastAPI Server: POST /simulate/intervention
        │
        ├── Step 1: Feature Matrix Perturbation
        │           X_pert = X_base + [ΔNDVI, ΔNDBI, 0, ΔAlbedo, ...]
        │
        ├── Step 2: Dynamic Feature Enrichment
        │           NDBI_NDVI_diff = NDBI_pert - NDVI_pert
        │           Albedo_NDBI    = Albedo_pert * NDBI_pert
        │
        ├── Step 3: Fast In-Memory XGBoost Prediction
        │           LST_sim = model.predict(X_pert)  (<5 ms)
        │
        ├── Step 4: Cooling Delta Computation
        │           ΔT = LST_sim - LST_base
        │
        └── Step 5: Economic & Thermodynamic Translation
                    HVAC Savings = |ΔT| * 4.5 kWh/m²/year
        ▼
JSON Response { cooling_delta_celsius, hvac_kwh_savings, latency_ms }
```
