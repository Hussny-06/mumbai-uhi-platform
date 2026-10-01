"""Prediction & Simulation Pipeline — Integration with WhatIfSimulationEngine.

Author: Asad (Data Engineering & Spatial Analytics)
Purpose: Load trained ML models and execute LST predictions + urban cooling simulations
         using real-time or historical IMD weather inputs.

Integration Points:
    - IMDParser (cleaning pipeline) → feature extraction
    - LSTDownscalerXGB / RandomForest → LST prediction
    - WhatIfSimulationEngine → intervention simulation
    - BiophysicalSHAPExplainer → decision attribution

Usage:
    python scripts/asad_predict_simulate.py
    python scripts/asad_predict_simulate.py --scenario greening
    python scripts/asad_predict_simulate.py --scenario cool-roof
"""

import sys
import json
import argparse
import logging
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import xgboost as xgb

from src.api.simulation_engine import WhatIfSimulationEngine
from src.models.shap_explainer import BiophysicalSHAPExplainer

# ------------------------------------------------------------------ #
#  Directory Configuration
# ------------------------------------------------------------------ #
MODELS_DIR = PROJECT_ROOT / "data" / "models"
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
OUTPUTS_DIR = PROJECT_ROOT / "outputs"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("asad.predict_simulate")

FEATURE_NAMES = [
    "NDVI", "NDBI", "MNDWI", "Albedo", "F_v", "Emissivity",
    "Elevation_m", "Slope_deg", "Aspect_deg", "Distance_Coast_km",
    "Latitude", "Longitude", "T_drybulb_C", "Relative_Humidity",
    "Wind_u_zonal", "Wind_v_meridional", "VPD_kPa",
]

# Pre-defined intervention scenarios for urban planners
SCENARIOS = {
    "greening": {
        "name": "Urban Greening (NDVI +0.25)",
        "description": "Plant trees and expand green cover in target ward",
        "delta_ndvi": 0.25,
        "delta_albedo": 0.0,
    },
    "cool-roof": {
        "name": "Cool Roof Campaign (Albedo +0.30)",
        "description": "White reflective roof coating on commercial/residential buildings",
        "delta_ndvi": 0.0,
        "delta_albedo": 0.30,
    },
    "combined": {
        "name": "Combined Greening + Cool Roofs",
        "description": "Simultaneous tree planting and reflective roof installation",
        "delta_ndvi": 0.20,
        "delta_albedo": 0.20,
    },
    "park": {
        "name": "New Urban Park (NDVI +0.40)",
        "description": "Convert vacant lot / demolished structure to urban park",
        "delta_ndvi": 0.40,
        "delta_albedo": 0.05,
    },
    "water-body": {
        "name": "Water Body Restoration",
        "description": "Restore creek or lake to enhance evaporative cooling",
        "delta_ndvi": 0.10,
        "delta_albedo": -0.05,
    },
}


def load_trained_model():
    """Load the best trained model for prediction.

    Priority:
        1. Asad's IMD-enriched XGBoost (asad_xgb_imd_enriched.json)
        2. Hussain's baseline XGBoost (downscaler_xgb_mumbai.json)
    """
    # Try Asad's model first
    asad_model_path = MODELS_DIR / "asad_xgb_imd_enriched.json"
    hussain_model_path = MODELS_DIR / "downscaler_xgb_mumbai.json"

    model = xgb.XGBRegressor()

    if asad_model_path.exists():
        model.load_model(str(asad_model_path))
        logger.info(f"Loaded Asad's IMD-enriched model: {asad_model_path}")
        return model, "asad_xgb_imd_enriched"
    elif hussain_model_path.exists():
        model.load_model(str(hussain_model_path))
        logger.info(f"Loaded Hussain's baseline model: {hussain_model_path}")
        return model, "downscaler_xgb_mumbai"
    else:
        logger.error("No trained model found! Run asad_train_imd_model.py first.")
        raise FileNotFoundError("No trained model artifact found in data/models/")


def load_prediction_data() -> pd.DataFrame:
    """Load data for prediction.

    Uses the GEE training data as the base prediction surface.
    """
    gee_path = PROCESSED_DIR / "mumbai_real_gee_training_data.csv"
    if gee_path.exists():
        df = pd.read_csv(gee_path)
        logger.info(f"Loaded prediction surface: {df.shape}")
        return df

    # Generate synthetic prediction surface
    logger.info("Generating synthetic prediction surface...")
    np.random.seed(42)
    n = 500

    lat = np.random.uniform(18.90, 19.27, n)
    lon = np.random.uniform(72.78, 73.00, n)
    dist_coast = np.maximum(0.1, (lon - 72.773) * 111.0 * np.cos(np.radians(lat)))

    df = pd.DataFrame({
        "NDVI": np.clip(np.random.normal(0.20, 0.15, n), -0.2, 0.8),
        "NDBI": np.clip(np.random.normal(0.15, 0.12, n), -0.3, 0.6),
        "MNDWI": np.clip(np.random.normal(-0.20, 0.15, n), -0.8, 0.6),
        "Albedo": np.clip(np.random.normal(0.16, 0.04, n), 0.05, 0.45),
        "F_v": np.clip(np.random.beta(2, 5, n), 0, 1),
        "Emissivity": np.clip(np.random.normal(0.965, 0.008, n), 0.93, 1.0),
        "Elevation_m": np.clip(np.random.exponential(15, n), 0, 300),
        "Slope_deg": np.clip(np.random.exponential(2, n), 0, 45),
        "Aspect_deg": np.random.uniform(0, 360, n),
        "Distance_Coast_km": dist_coast,
        "Latitude": lat,
        "Longitude": lon,
        "T_drybulb_C": 33.5 + dist_coast * 0.08 + np.random.normal(0, 1.0, n),
        "Relative_Humidity": np.clip(72.0 - dist_coast * 0.7 + np.random.normal(0, 3, n), 20, 100),
        "Wind_u_zonal": -3.8 + dist_coast * 0.05 + np.random.normal(0, 0.3, n),
        "Wind_v_meridional": -1.4 + np.random.normal(0, 0.2, n),
        "VPD_kPa": np.clip(1.2 + dist_coast * 0.03 + np.random.normal(0, 0.1, n), 0, 5),
    })

    return df


def run_predictions(model, df: pd.DataFrame) -> np.ndarray:
    """Run LST predictions on the data surface.

    Handles feature dimension mismatches between 17-feature and 19-feature models.
    """
    X = df[FEATURE_NAMES].values

    # Handle models trained with engineered features (19-dim)
    expected = getattr(model, "n_features_in_", None)
    if expected is None:
        try:
            expected = model.get_booster().num_features()
        except Exception:
            expected = 17

    if expected == 19 and X.shape[1] == 17:
        # Add interaction features: NDBI-NDVI diff and Albedo×NDBI
        ndbi_ndvi = X[:, 1] - X[:, 0]  # NDBI - NDVI
        albedo_ndbi = X[:, 3] * X[:, 1]  # Albedo × NDBI
        X = np.column_stack([X, ndbi_ndvi, albedo_ndbi])
        logger.info("Added 2 interaction features (NDBI-NDVI diff, Albedo×NDBI) → 19-dim")

    preds = model.predict(X)
    logger.info(
        f"Predictions: mean={np.mean(preds):.2f}°C, "
        f"std={np.std(preds):.2f}°C, "
        f"range=[{np.min(preds):.2f}, {np.max(preds):.2f}]°C"
    )
    return preds


def run_simulation(model, df: pd.DataFrame, scenario_name: str = "greening") -> dict:
    """Run What-If simulation for a specific intervention scenario.

    Returns simulation results including cooling delta and energy savings.
    """
    if scenario_name not in SCENARIOS:
        raise ValueError(f"Unknown scenario '{scenario_name}'. Available: {list(SCENARIOS.keys())}")

    scenario = SCENARIOS[scenario_name]
    logger.info(f"Running simulation: {scenario['name']}")
    logger.info(f"  {scenario['description']}")

    X = df[FEATURE_NAMES].values

    engine = WhatIfSimulationEngine(model=model)
    result = engine.simulate_intervention(
        base_features=X,
        delta_ndvi=scenario["delta_ndvi"],
        delta_albedo=scenario["delta_albedo"],
        ndvi_col_idx=0,   # NDVI is column 0
        albedo_col_idx=3,  # Albedo is column 3
    )

    result["scenario_name"] = scenario["name"]
    result["scenario_description"] = scenario["description"]
    result["delta_ndvi_applied"] = scenario["delta_ndvi"]
    result["delta_albedo_applied"] = scenario["delta_albedo"]
    result["num_pixels"] = len(X)

    logger.info(f"  Baseline LST:     {result['mean_baseline_lst']:.2f} °C")
    logger.info(f"  Simulated LST:    {result['mean_simulated_lst']:.2f} °C")
    logger.info(f"  Cooling Delta:    {result['cooling_delta']:.3f} °C")
    logger.info(f"  Energy Savings:   {result['energy_reduction_kwh_m2_yr']:.2f} kWh/m²/yr")
    logger.info(f"  Latency:          {result['elapsed_ms']:.2f} ms")

    return result


def generate_simulation_figures(all_results: list):
    """Generate comprehensive simulation comparison figure."""
    logger.info("Generating simulation comparison figure...")

    fig, axes = plt.subplots(1, 3, figsize=(20, 7), dpi=300)

    # Data preparation
    names = [r["scenario_name"] for r in all_results]
    cooling = [abs(r["cooling_delta"]) for r in all_results]
    energy = [r["energy_reduction_kwh_m2_yr"] for r in all_results]
    latency = [r["elapsed_ms"] for r in all_results]

    # Panel 1: Cooling delta comparison
    ax = axes[0]
    colors = plt.cm.coolwarm_r(np.linspace(0.2, 0.8, len(names)))
    bars = ax.barh(range(len(names)), cooling, color=colors, edgecolor="black", linewidth=0.5)
    ax.set_yticks(range(len(names)))
    ax.set_yticklabels(names, fontsize=9)
    ax.set_xlabel("Cooling Magnitude (°C)", fontsize=11)
    ax.set_title("Temperature Reduction by Scenario", fontsize=12, fontweight="bold")
    ax.grid(True, linestyle=":", alpha=0.5)

    # Add value labels
    for bar, val in zip(bars, cooling):
        ax.text(bar.get_width() + 0.02, bar.get_y() + bar.get_height() / 2,
                f"{val:.2f}°C", va="center", fontsize=9, fontweight="bold")

    # Panel 2: Energy savings comparison
    ax = axes[1]
    bars = ax.barh(range(len(names)), energy, color="#4CAF50", edgecolor="black", linewidth=0.5)
    ax.set_yticks(range(len(names)))
    ax.set_yticklabels(names, fontsize=9)
    ax.set_xlabel("HVAC Energy Savings (kWh/m²/yr)", fontsize=11)
    ax.set_title("Energy Reduction by Scenario", fontsize=12, fontweight="bold")
    ax.grid(True, linestyle=":", alpha=0.5)

    for bar, val in zip(bars, energy):
        ax.text(bar.get_width() + 0.05, bar.get_y() + bar.get_height() / 2,
                f"{val:.1f}", va="center", fontsize=9, fontweight="bold")

    # Panel 3: Simulation latency (SLA compliance)
    ax = axes[2]
    colors_lat = ["#4CAF50" if l <= 1500 else "#F44336" for l in latency]
    bars = ax.barh(range(len(names)), latency, color=colors_lat, edgecolor="black", linewidth=0.5)
    ax.axvline(1500, color="red", linewidth=2, linestyle="--", label="SLA Limit (1500 ms)")
    ax.set_yticks(range(len(names)))
    ax.set_yticklabels(names, fontsize=9)
    ax.set_xlabel("Simulation Latency (ms)", fontsize=11)
    ax.set_title("Latency (SLA ≤ 1500 ms)", fontsize=12, fontweight="bold")
    ax.legend(fontsize=9)
    ax.grid(True, linestyle=":", alpha=0.5)

    for bar, val in zip(bars, latency):
        ax.text(bar.get_width() + 0.5, bar.get_y() + bar.get_height() / 2,
                f"{val:.1f} ms", va="center", fontsize=9)

    plt.suptitle(
        "Asad — What-If Simulation Scenarios (Urban Cooling Interventions)",
        fontsize=14, fontweight="bold", y=1.02,
    )
    plt.tight_layout()
    fig_path = OUTPUTS_DIR / "asad_simulation_scenarios.png"
    plt.savefig(fig_path, bbox_inches="tight")
    plt.close()
    logger.info(f"Saved simulation figure → {fig_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Asad's Prediction & Simulation Pipeline"
    )
    parser.add_argument(
        "--scenario",
        type=str,
        choices=list(SCENARIOS.keys()) + ["all"],
        default="all",
        help="Simulation scenario to run (default: all)",
    )
    args = parser.parse_args()

    print("\n" + "=" * 70)
    print("  ASAD — Prediction & Simulation Pipeline")
    print("  Integration: IMD Features -> ML Prediction -> What-If Simulator")
    print("=" * 70 + "\n")

    # Load model
    model, model_name = load_trained_model()
    logger.info(f"Active model: {model_name}")

    # Load prediction surface
    df = load_prediction_data()

    # Run predictions
    predictions = run_predictions(model, df)

    # Add predictions to DataFrame
    df["Predicted_LST_C"] = predictions

    # Run simulations
    scenarios_to_run = list(SCENARIOS.keys()) if args.scenario == "all" else [args.scenario]
    all_results = []

    for scenario_name in scenarios_to_run:
        result = run_simulation(model, df, scenario_name)
        all_results.append(result)

    # Generate simulation figures
    generate_simulation_figures(all_results)

    # Save simulation results
    sim_output_path = OUTPUTS_DIR / "asad_simulation_results.json"
    with open(sim_output_path, "w", encoding="utf-8") as f:
        json.dump({
            "model_used": model_name,
            "prediction_surface_size": len(df),
            "baseline_mean_lst": float(np.mean(predictions)),
            "scenarios": all_results,
        }, f, indent=2, default=str)
    logger.info(f"Saved simulation results → {sim_output_path}")

    # Save predictions CSV
    pred_path = PROCESSED_DIR / "asad_predictions_output.csv"
    df.to_csv(pred_path, index=False)
    logger.info(f"Saved predictions → {pred_path}")

    print("\n" + "=" * 70)
    print("  [OK] PREDICTION & SIMULATION COMPLETE")
    print(f"  Model: {model_name}")
    print(f"  Predictions: {len(predictions)} pixels, mean LST = {np.mean(predictions):.2f} C")
    print(f"  Scenarios simulated: {len(all_results)}")
    for r in all_results:
        print(f"    - {r['scenario_name']}: dT = {r['cooling_delta']:.3f} C, "
              f"Energy savings = {r['energy_reduction_kwh_m2_yr']:.1f} kWh/m2/yr")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()
