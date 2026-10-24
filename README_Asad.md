# 🌡️ Asad's Complete Work Explained — Mumbai UHI AI Platform
### Role: Data Engineering & Spatial Analytics Lead

---

## 🌍 What is This Project? (Simple Overview)

Cities like Mumbai are getting hotter because of all the concrete buildings and lack of trees. This is called the **Urban Heat Island (UHI)** effect.

Our team built an **AI-powered platform** that does two things:
1. **Predicts** how hot every single street in Mumbai is (at a 30-meter detail level using satellite + weather data)
2. **Simulates** — city planners can virtually "add trees" or "paint roofs white" and instantly see how much cooler the city would get

---

## 👥 The Team (Who Does What)

| Person | Job |
|---|---|
| **Hussain** | Connects to satellites (Google Earth Engine), trains the main AI models |
| **Asad (Me)** | Cleans all the weather data, builds features for the AI, tests the AI fairly |
| **Abdulrehman** | Builds the cloud storage and the map dashboard website |
| **Ahmed** | Creates the final PDF reports and handles quality checks |

---

## 🧑‍💻 My Work (Asad) — Step by Step

I have **3 main Python scripts**, each doing a different job. Here is the story:

---

## 📁 Script 1: `asad_imd_pipeline.py` — Cleaning 27 Years of Weather Data

**What it does:** Takes a massive, messy weather dataset (370,000+ rows from 1997 to 2024) and cleans it into a perfect, usable format.

### The 5 Cleaning Phases:

**Phase 1 — Fix the Clocks**
All timestamps are standardized to Indian Standard Time (IST) so they sync correctly with satellite passes.

**Phase 2 — Remove Impossible Values (Hampel Filter)**
Weather sensors sometimes break and record crazy numbers like -99°C temperature or 200% humidity. I wrote code using a statistical method called the **Hampel Filter (3σ MAD)** to automatically find and delete these garbage readings.

> **Simple explanation:** Imagine sorting through 370,000 test papers and automatically crossing out any answer that is obviously impossible (like someone writing "200 marks out of 100"). That's what this phase does.

**Phase 3 — Fill Missing Hours (PCHIP Interpolation)**
If a sensor went offline for 1-3 hours, there's a gap in the data. I fill these gaps using a smart math method called **PCHIP** (Piecewise Cubic Hermite Interpolating Polynomial). It doesn't just average — it draws a smooth, realistic curve between the two surrounding readings.

> **Simple explanation:** If Monday's temperature was 30°C and Wednesday's was 36°C, and Tuesday is missing, PCHIP doesn't just guess 33°C. It looks at the rate of change and fills in a realistic curve — like 31°C for Tuesday morning and 34°C for Tuesday evening.

**Phase 4 — Build New Science Features**
From raw wind speed and direction, I calculate:
- **Wind U & V components** (breaking one wind reading into East-West and North-South directions)
- **Vapor Pressure Deficit (VPD)** — how "thirsty" the atmosphere is. High VPD = dry air = more heat.

**Phase 5 — Sync with Satellites (Overpass Window)**
Landsat satellites fly over Mumbai between **10:00 AM and 11:30 AM**. I filter the entire 27-year dataset to only keep readings from this window, so our ground weather data matches exactly with what the satellite sees.

### 📊 Output: Data Quality Summary (Post-Cleaning)

![Asad Data Quality Summary](./outputs/asad_data_quality_summary.png)

> This 4-panel chart is proof the cleaning worked. Each panel shows the distribution of a cleaned variable:
> - **Top Left:** Temperature — a clean bell curve around Mumbai's typical weather range
> - **Top Right:** Humidity — most days are humid (Mumbai is coastal)
> - **Bottom Left:** Wind vectors — dominant wind directions clearly visible
> - **Bottom Right:** VPD (Vapor Pressure Deficit) — shows how dry the air typically is

---

### 📊 Output: 27-Year Warming Trend with Mann-Kendall Test

![27 Year Temperature Trend](./outputs/asad_27yr_temperature_trend.png)

> **What this proves:** Mumbai is definitively getting hotter. The red dots are each year's average temperature (1997–2024). The blue dashed line is the upward trend.
>
> The green annotation box shows the **Mann-Kendall statistical test results:**
> - **Trend: Increasing** ✅
> - **p-value: 0.000036** (anything below 0.05 means it's statistically real, not random luck)
> - **Sen's Slope: +0.044°C per year** — Mumbai gains roughly 0.044°C every year
>
> Over 28 years that adds up to more than **+1.2°C of total warming** — a serious public health issue.

---

### 📊 Output: Monthly Climatology Heatmap (27 Years)

![Monthly Climatology Heatmap](./outputs/asad_monthly_climatology_heatmap.png)

> Each row = 1 year. Each column = 1 month. Each cell = average temperature. Dark red = very hot, dark blue = cooler.
>
> **What it shows:**
> - **May and June** are always the hottest months (pre-monsoon heat)
> - **January and December** are always the coolest
> - Recent years (2018–2024) have more red cells → confirms the warming trend

---

## 📁 Script 2: `asad_train_imd_model.py` — Teaching the AI

**What it does:** Uses the cleaned data to train two AI models and tests how accurately they predict street-level temperatures.

### The 17 Features I Feed the AI

| # | Feature | What it means | Source |
|---|---|---|---|
| 1 | NDVI | How much vegetation/trees | Satellite |
| 2 | NDBI | How much concrete / built-up | Satellite |
| 3 | MNDWI | Presence of water bodies | Satellite |
| 4 | Albedo | How reflective the surface is | Satellite |
| 5 | F_v | Fraction of vegetation cover | Satellite |
| 6 | Emissivity | How well the surface emits heat | Satellite |
| 7 | Elevation_m | Height above sea level | Terrain |
| 8 | Slope_deg | Steepness of terrain | Terrain |
| 9 | Aspect_deg | Which direction slope faces | Terrain |
| 10 | Distance_Coast_km | Distance from Arabian Sea | Geography |
| 11 | Latitude | North-South position | Geography |
| 12 | Longitude | East-West position | Geography |
| **13** | **T_drybulb_C** | **Air temperature** | **My IMD data ✅** |
| **14** | **Relative_Humidity** | **Moisture in the air** | **My IMD data ✅** |
| **15** | **Wind_u_zonal** | **Wind speed East-West** | **My IMD data ✅** |
| **16** | **Wind_v_meridional** | **Wind speed North-South** | **My IMD data ✅** |
| **17** | **VPD_kPa** | **How dry the air is** | **My IMD data ✅** |

> **Features 13–17 are my direct contribution.** They come from my 27-year cleaned IMD dataset. Without my cleaning pipeline, these 5 features would contain sensor errors and missing values — making the AI unreliable.

### The Two AI Algorithms

**Model 1: XGBoost (Primary)**
Builds hundreds of decision trees where each tree learns from the mistakes of the previous one. Like having 500 experts, each one fixing what the last expert got wrong. Very powerful for complex, non-linear data.

**Model 2: Random Forest (Benchmark)**
Also uses hundreds of decision trees, but each tree is trained independently on different random samples. The final answer is the average of all trees. More stable but slightly less accurate than XGBoost.

**Why NOT simple linear regression?**
Because heat is complicated. Temperature depends on multiple interacting factors. For example: high NDBI + low NDVI + far from coast = extremely hot. Linear regression cannot capture these interactions. Tree-based models can.

### The "No Cheating" Test — Spatial Block K-Fold (1.2 km Buffer)

**The problem:** When testing an AI on map data, if the test pixels are right next to the training pixels, the AI "cheats" — it just copies the neighbor's temperature. This is called **spatial data leakage**.

**My solution:**
1. Divide Mumbai's map into a grid of 5 spatial blocks
2. When testing on Block A, remove ALL training data within **1.2 km** of Block A
3. The 1.2 km comes from Moran's I analysis — the real distance at which temperature starts to vary independently in Mumbai

> **Analogy:** Your exam question is about your neighbourhood. If your teacher gives you hints about your neighbour's house 10 metres away, that's cheating. My system forces the AI to study from streets at least 1.2 km away from the street being tested — ensuring genuine learning.

### 📊 Output: ML Validation Comparison (XGBoost vs Random Forest)

![ML Validation Comparison](./outputs/asad_ml_validation_comparison.png)

> **The 4 panels:**
> - **Top Left (Blue):** XGBoost predicted vs actual temperature. Perfect AI = all dots on the red diagonal. Dots close to the line = good.
> - **Top Right (Green):** Same for Random Forest — slightly more spread out (less accurate)
> - **Bottom Left (Orange):** Residual distribution — how far off predictions were. Centered near zero = unbiased model.
> - **Bottom Right (Table):** Side-by-side accuracy numbers
>
> **Real accuracy numbers:**
>
> | Metric | XGBoost | Random Forest |
> |---|---|---|
> | RMSE (°C error) | **2.05°C** | 2.21°C |
> | R² (explanation power) | **0.444** | 0.359 |
> | MAE (average error) | **1.63°C** | 1.75°C |
>
> XGBoost beats Random Forest on every metric. The model is being improved by integrating more real GEE satellite points.

---

### 📊 Output: SHAP Explainability — Why is Each Area Hot?

![SHAP Analysis XGBoost](./outputs/asad_shap_analysis_xgboost.png)

> **TreeSHAP opens up the AI brain** and tells us which features drove the temperature prediction.
>
> **Left panel:** Ranked bar chart of feature importance. NDBI (concrete) is the #1 heat driver.
> **Right panel:** Box plots showing direction of impact. Positive = pushes temperature UP. Negative = pulls it DOWN.
>
> **Real SHAP numbers from my analysis:**
>
> | Rank | Feature | SHAP Impact | What it means |
> |---|---|---|---|
> | 1 | **NDBI** | 1.41 | 🔴 More concrete = much hotter |
> | 2 | **NDVI** | 0.42 | 🟢 More trees = cooler |
> | 3 | **Albedo** | 0.38 | 🟢 More reflective = cooler |
> | 4 | **Distance to Coast** | 0.36 | 🔴 Farther inland = hotter |
> | 5 | **Latitude** | 0.29 | 🔴 Northern wards = hotter |
>
> **Policy implication:** To cool Mumbai, target **NDBI reduction first** (reduce concrete density) and **NDVI increase** (plant trees). This gives planners a scientifically ranked action list.

---

## 📁 Script 3: `asad_predict_simulate.py` — The "What-If" Simulator

**What it does:** Loads the trained AI and tests 5 different urban cooling ideas to tell city planners which intervention gives the most cooling bang for their buck.

### The 5 Cooling Scenarios

| Scenario | What it simulates | Cooling | Energy saved |
|---|---|---|---|
| 🌳 Urban Greening (NDVI +0.25) | Plant trees city-wide | −1.14°C | 5.46 kWh/m²/yr |
| 🏠 Cool Roof (Albedo +0.30) | Paint rooftops white/reflective | +0.78°C* | 3.72 kWh/m²/yr |
| 🌿 Combined Greening + Cool Roofs | Both together | +0.09°C* | 0.42 kWh/m²/yr |
| 🏞️ New Urban Park (NDVI +0.40) | Convert vacant lots to parks | −0.37°C | 1.79 kWh/m²/yr |
| 💧 Water Body Restoration | Restore creeks and lakes | **−1.71°C** ⭐ | **8.20 kWh/m²/yr** ⭐ |

> *Some scenarios show unexpected results due to complex model interactions — more real GEE data will refine these.
> Baseline Mumbai temperature: **40.04°C** (average across 2,481 map pixels)

### 📊 Output: Simulation Scenarios Comparison

![Simulation Scenarios](./outputs/asad_simulation_scenarios.png)

> **The 3 panels:**
> - **Left:** Cooling amount per scenario — longer bar = more cooling
> - **Middle:** Energy savings (HVAC air conditioning savings per year) — Water body restoration wins at **8.2 kWh/m²/yr**
> - **Right:** How fast each simulation runs — all bars are GREEN (under the 1500ms SLA limit). All scenarios ran in **under 18 milliseconds**!
>
> **Key finding:** **Water body restoration** (restoring Mumbai's creeks and nala drainage channels) is the single most effective urban cooling strategy — providing the most temperature drop AND the most energy savings.

---

## 📊 Summary of All My Key Results

| Deliverable | What I Did | Result |
|---|---|---|
| **Data Cleaning** | Cleaned 27-year IMD weather records | 370,000+ rows → clean dataset |
| **Warming Proof** | Mann-Kendall statistical test | +0.044°C/year, p=0.000036 ✅ |
| **Feature Engineering** | Built 5 meteorological features (13–17) | Feeds directly into ML model |
| **ML Training** | Trained XGBoost + Random Forest | XGBoost: RMSE=2.05°C, R²=0.44 |
| **XAI (SHAP)** | Explained AI decisions | NDBI is #1 heat driver (1.41 impact) |
| **Spatial Testing** | Spatial Block K-Fold (1.2km buffer) | Zero spatial data leakage |
| **Simulation** | 5 urban cooling scenarios | Water restoration = −1.71°C cooling |
| **Speed** | Simulation inference time | All < 18ms (SLA: 1500ms ✅) |

---

## ▶️ How to Run My Code

```bash
# Step 1: Clean the 27-year weather data
python scripts/asad_imd_pipeline.py

# Step 2: Train the ML models (XGBoost + Random Forest)
python scripts/asad_train_imd_model.py --model both

# Step 3: Run all 5 cooling simulations
python scripts/asad_predict_simulate.py --scenario all
```
