"""FastAPI Asynchronous Microservice for Mumbai UHI Platform.

Author: Hussain (Lead Architecture & ML Downscaling)
"""

from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np

from .schemas import InterventionRequest, SimulationResponse, WardSummary
from .simulation_engine import WhatIfSimulationEngine

# Load trained downscaler model if available
model_artifact = Path(__file__).parents[2] / "data" / "models" / "downscaler_xgb_mumbai.json"
trained_model = None
if model_artifact.exists():
    try:
        import xgboost as xgb
        trained_model = xgb.XGBRegressor()
        trained_model.load_model(str(model_artifact))
    except Exception:
        trained_model = None

engine = WhatIfSimulationEngine(model=trained_model)

app = FastAPI(
    title="Mumbai Urban Heat Island (UHI) Platform API",
    version="0.1.0",
    description="REST API for 30m LST Downscaling, Biophysical Driver Analytics, and Real-Time What-If Simulation.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "scope": "Metropolitan Mumbai (24 Wards)",
        "resolution": "30m",
        "crs": "EPSG:32643",
    }


@app.get("/wards", response_model=list[WardSummary])
async def list_wards():
    """List sample baseline statistics for Mumbai municipal wards."""
    return [
        WardSummary(
            ward_id="G/N",
            ward_name="Dharavi / Dadar",
            mean_lst_celsius=36.8,
            vulnerability_index=0.88,
            dominant_heat_driver="Built-up density (+NDBI)",
        ),
        WardSummary(
            ward_id="M/E",
            ward_name="Govandi / Mankhurd",
            mean_lst_celsius=37.4,
            vulnerability_index=0.92,
            dominant_heat_driver="Lack of vegetative canopy (-NDVI)",
        ),
        WardSummary(
            ward_id="A",
            ward_name="Colaba / Fort",
            mean_lst_celsius=31.2,
            vulnerability_index=0.35,
            dominant_heat_driver="Maritime sea breeze buffer (-D_coast)",
        ),
    ]


@app.post("/simulate", response_model=SimulationResponse)
async def simulate_what_if(req: InterventionRequest):
    """Run real-time urban cooling intervention simulation in <= 1.5s."""
    target_id = req.ward_id or "Custom_Polygon"
    # Create sample synthetic 17-feature array for simulation
    sample_features = np.random.normal(loc=0.2, scale=0.05, size=(100, 17))

    results = engine.simulate_intervention(
        base_features=sample_features,
        delta_ndvi=req.delta_ndvi,
        delta_albedo=req.delta_albedo,
    )

    return SimulationResponse(
        target=target_id,
        mean_baseline_lst_celsius=results["mean_baseline_lst"],
        mean_simulated_lst_celsius=results["mean_simulated_lst"],
        cooling_delta_celsius=results["cooling_delta"],
        cooling_energy_demand_reduction_kwh_m2_yr=results["energy_reduction_kwh_m2_yr"],
        computation_time_ms=results["elapsed_ms"],
        shap_top_drivers={
            "NDBI (Built-up)": 2.4,
            "NDVI (Canopy)": -1.8,
            "Distance_to_Coast": -1.2,
            "Broadband_Albedo": -0.9,
        },
    )
