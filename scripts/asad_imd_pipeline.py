"""IMD 27-Year Data Cleaning & Feature Engineering Pipeline.

Author: Asad (Data Engineering & Spatial Analytics)
Dataset: Kaggle Mumbai Weather Data (27 Years) — 370K+ entries (1997–2024)
Source: https://www.kaggle.com/datasets/kevinnadar22/mumbai-weather-data-27-years/data

This script orchestrates:
    Phase 1: Raw CSV ingestion and automated QC cleaning
    Phase 2: Feature matrix construction (meteorological features for 17-dim vector)
    Phase 3: Mann-Kendall trend analysis on 27-year annual temperature series
    Phase 4: Satellite overpass window extraction for IMD-GEE synchronization
    Phase 5: Export cleaned data + annual summaries + trend results

Usage:
    python scripts/asad_imd_pipeline.py
    python scripts/asad_imd_pipeline.py --input data/raw/mumbai_weather_cleaned.csv
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
import matplotlib.dates as mdates
import seaborn as sns

from src.ingestion.imd_parser import IMDParser

# ------------------------------------------------------------------ #
#  Directory Configuration
# ------------------------------------------------------------------ #
RAW_DIR = PROJECT_ROOT / "data" / "raw"
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
OUTPUTS_DIR = PROJECT_ROOT / "outputs"
RAW_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("asad.imd_pipeline")


def find_raw_csv() -> Path:
    """Auto-detect the raw CSV file in data/raw/.

    Looks for common file names from the Kaggle dataset.
    """
    candidates = [
        "mumbai_weather.csv",
        "mumbai_weather_cleaned.csv",
        "cleaned_data.csv",
        "merged_data.csv",
        "Mumbai Weather Data.csv",
    ]
    for name in candidates:
        p = RAW_DIR / name
        if p.exists():
            return p

    # Search for any CSV in raw/
    csvs = list(RAW_DIR.glob("*.csv"))
    if csvs:
        return csvs[0]

    raise FileNotFoundError(
        f"No CSV found in {RAW_DIR}. Please download the Kaggle dataset and place it there.\n"
        f"Dataset: https://www.kaggle.com/datasets/kevinnadar22/mumbai-weather-data-27-years/data"
    )


def run_phase1_cleaning(input_path: Path) -> pd.DataFrame:
    """Phase 1: Load and clean the raw IMD/Kaggle weather data.

    Applies the full QC pipeline:
    - DateTime parsing (IST)
    - Physical bounds clipping
    - Hampel filter (3σ MAD)
    - PCHIP gap interpolation (≤ 3hr)
    - Wind vector decomposition
    - VPD computation
    """
    logger.info("=" * 70)
    logger.info("PHASE 1: IMD DATA INGESTION & QC CLEANING")
    logger.info("=" * 70)

    parser = IMDParser(outlier_sigma_threshold=3.0)
    df = parser.load_and_preprocess(str(input_path), station_id="mumbai_kaggle")

    logger.info(f"Cleaned dataset shape: {df.shape}")
    logger.info(f"Date range: {df['timestamp'].min()} → {df['timestamp'].max()}")
    logger.info(f"Years covered: {df['year'].nunique()} ({df['year'].min()}–{df['year'].max()})")

    # Save cleaned full dataset
    output_path = PROCESSED_DIR / "mumbai_imd_27yr_cleaned.csv"
    df.to_csv(output_path, index=False)
    logger.info(f"Saved cleaned dataset → {output_path}")

    return df


def run_phase2_feature_matrix(df: pd.DataFrame) -> pd.DataFrame:
    """Phase 2: Construct the meteorological feature matrix.

    Creates daily overpass-aligned summaries with all weather-derived features
    that map to the 17-dimensional predictor vector (meteorological subset).
    """
    logger.info("=" * 70)
    logger.info("PHASE 2: FEATURE MATRIX CONSTRUCTION")
    logger.info("=" * 70)

    # Extract satellite overpass window observations (10:00–11:30 AM IST)
    overpass_df = IMDParser.extract_overpass_window(df)
    logger.info(f"Overpass window observations: {len(overpass_df)}")

    # Compute daily overpass-aligned summaries
    overpass_df["date"] = overpass_df["timestamp"].dt.date

    # Aggregation: for each day during the overpass window
    daily_agg = {
        "temperature_c": "mean",
        "relative_humidity": "mean",
        "vpd_kpa": "mean",
        "wind_u_zonal": "mean",
        "wind_v_meridional": "mean",
    }
    # Only aggregate columns that exist
    daily_agg = {k: v for k, v in daily_agg.items() if k in overpass_df.columns}

    daily = overpass_df.groupby("date").agg(daily_agg).reset_index()

    # Rename to match the 17-feature vector naming convention
    rename_map = {
        "temperature_c": "T_drybulb_C",
        "relative_humidity": "Relative_Humidity",
        "vpd_kpa": "VPD_kPa",
        "wind_u_zonal": "Wind_u_zonal",
        "wind_v_meridional": "Wind_v_meridional",
    }
    daily = daily.rename(columns=rename_map)
    daily["date"] = pd.to_datetime(daily["date"])

    # Add supplementary columns
    if "pressure_hpa" in overpass_df.columns:
        pressure_daily = overpass_df.groupby("date")["pressure_hpa"].mean().reset_index()
        pressure_daily["date"] = pd.to_datetime(pressure_daily["date"])
        daily = daily.merge(pressure_daily, on="date", how="left")

    logger.info(f"Daily overpass-aligned feature matrix: {daily.shape}")
    logger.info(f"Columns: {list(daily.columns)}")

    # Save daily feature matrix
    output_path = PROCESSED_DIR / "mumbai_imd_daily_overpass_features.csv"
    daily.to_csv(output_path, index=False)
    logger.info(f"Saved daily overpass features → {output_path}")

    return daily


def run_phase3_mann_kendall(df: pd.DataFrame) -> dict:
    """Phase 3: Mann-Kendall monotonic trend test on annual mean temperature.

    Detects statistically significant warming/cooling trends over the 27-year record.
    """
    logger.info("=" * 70)
    logger.info("PHASE 3: MANN-KENDALL TREND ANALYSIS")
    logger.info("=" * 70)

    # Compute annual summary
    annual = IMDParser.compute_annual_summary(df)
    logger.info(f"Annual summary: {len(annual)} years")

    # Run Mann-Kendall on annual mean temperature
    if "temperature_c_mean" in annual.columns:
        annual_temp = annual.set_index("year")["temperature_c_mean"]
        mk_result = IMDParser.mann_kendall_trend(annual_temp)
    else:
        logger.warning("No temperature_c_mean column found — cannot run trend test")
        mk_result = {"trend": "column_missing"}

    logger.info(f"Mann-Kendall Results:")
    logger.info(f"  Trend:       {mk_result.get('trend', 'N/A')}")
    logger.info(f"  p-value:     {mk_result.get('p_value', 'N/A')}")
    logger.info(f"  Sen's slope: {mk_result.get('sens_slope_per_year', 'N/A')} °C/year")
    logger.info(f"  Significant: {mk_result.get('significant_at_005', 'N/A')}")

    # Save trend results
    output_path = OUTPUTS_DIR / "mann_kendall_trend_results.json"
    combined = {
        "analysis": "Mann-Kendall Monotonic Trend Test",
        "variable": "Annual Mean Temperature (°C)",
        "station": "Mumbai (Kaggle 27-Year Dataset)",
        "period": f"{annual['year'].min()}–{annual['year'].max()}" if len(annual) > 0 else "N/A",
        **mk_result,
    }
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(combined, f, indent=2)
    logger.info(f"Saved trend results → {output_path}")

    # Save annual summary
    annual_path = PROCESSED_DIR / "mumbai_imd_annual_summary.csv"
    annual.to_csv(annual_path, index=False)
    logger.info(f"Saved annual summary → {annual_path}")

    return combined


def run_phase4_visualizations(df: pd.DataFrame, annual_df: pd.DataFrame, mk_result: dict):
    """Phase 4: Generate publication-quality figures for review.

    Produces:
        1. 27-year warming trend with Mann-Kendall annotation
        2. Monthly temperature climatology heatmap
        3. QC pipeline summary statistics
    """
    logger.info("=" * 70)
    logger.info("PHASE 4: VISUALIZATION & FIGURE GENERATION")
    logger.info("=" * 70)

    sns.set_theme(style="whitegrid", font_scale=1.1)

    # --------------------------------------------------------------- #
    #  Figure 1: 27-Year Annual Temperature Trend
    # --------------------------------------------------------------- #
    if "temperature_c_mean" in annual_df.columns and len(annual_df) > 2:
        fig, ax = plt.subplots(figsize=(14, 6), dpi=300)

        years = annual_df["year"].values
        temps = annual_df["temperature_c_mean"].values

        # Plot annual means
        ax.plot(years, temps, "o-", color="#D32F2F", linewidth=2.0, markersize=7,
                markerfacecolor="#FF5252", markeredgecolor="#B71C1C", label="Annual Mean Temperature")

        # Linear trend line
        z = np.polyfit(years, temps, 1)
        p = np.poly1d(z)
        ax.plot(years, p(years), "--", color="#1565C0", linewidth=2.0,
                label=f"Linear Trend ({z[0]:+.3f} °C/year)")

        # Mann-Kendall annotation box
        trend_text = mk_result.get("trend", "N/A")
        p_val = mk_result.get("p_value", 1.0)
        sens = mk_result.get("sens_slope_per_year", 0.0)
        sig = mk_result.get("significant_at_005", False)

        textstr = (
            f"Mann-Kendall Trend Test\n"
            f"Trend: {trend_text}\n"
            f"Sen's Slope: {sens:+.4f} °C/yr\n"
            f"p-value: {p_val:.4f}\n"
            f"Significant (α=0.05): {'Yes ✓' if sig else 'No ✗'}"
        )
        props = dict(boxstyle="round,pad=0.6", facecolor="#E8F5E9", edgecolor="#2E7D32", alpha=0.9)
        ax.text(0.02, 0.97, textstr, transform=ax.transAxes, fontsize=10,
                verticalalignment="top", bbox=props, fontfamily="monospace")

        ax.set_xlabel("Year", fontsize=12, fontweight="bold")
        ax.set_ylabel("Mean Temperature (°C)", fontsize=12, fontweight="bold")
        ax.set_title("Mumbai 27-Year Temperature Trend (IMD Ground Station Records)",
                      fontsize=14, fontweight="bold")
        ax.legend(loc="lower right", fontsize=10)
        ax.grid(True, linestyle=":", alpha=0.5)

        plt.tight_layout()
        fig_path = OUTPUTS_DIR / "asad_27yr_temperature_trend.png"
        plt.savefig(fig_path)
        plt.close()
        logger.info(f"Saved trend figure → {fig_path}")

    # --------------------------------------------------------------- #
    #  Figure 2: Monthly Temperature Climatology Heatmap
    # --------------------------------------------------------------- #
    if "temperature_c" in df.columns and "year" in df.columns and "month" in df.columns:
        monthly = df.groupby(["year", "month"])["temperature_c"].mean().reset_index()
        pivot = monthly.pivot(index="year", columns="month", values="temperature_c")

        fig, ax = plt.subplots(figsize=(14, 10), dpi=300)
        sns.heatmap(
            pivot,
            cmap="RdYlBu_r",
            annot=True,
            fmt=".1f",
            linewidths=0.5,
            cbar_kws={"label": "Mean Temperature (°C)"},
            ax=ax,
        )
        ax.set_xlabel("Month", fontsize=12, fontweight="bold")
        ax.set_ylabel("Year", fontsize=12, fontweight="bold")
        ax.set_title("Mumbai Monthly Temperature Climatology (27 Years)",
                      fontsize=14, fontweight="bold")
        month_labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        ax.set_xticklabels(month_labels, rotation=0)

        plt.tight_layout()
        fig_path = OUTPUTS_DIR / "asad_monthly_climatology_heatmap.png"
        plt.savefig(fig_path)
        plt.close()
        logger.info(f"Saved climatology heatmap → {fig_path}")

    # --------------------------------------------------------------- #
    #  Figure 3: Data Quality Summary (4-Panel)
    # --------------------------------------------------------------- #
    fig, axes = plt.subplots(2, 2, figsize=(16, 12), dpi=300)

    # Panel 1: Temperature distribution
    if "temperature_c" in df.columns:
        ax = axes[0, 0]
        df["temperature_c"].hist(bins=80, color="#EF5350", alpha=0.8, edgecolor="black",
                                 linewidth=0.3, ax=ax)
        ax.axvline(df["temperature_c"].mean(), color="#1A237E", linestyle="--",
                   linewidth=2, label=f"Mean = {df['temperature_c'].mean():.1f}°C")
        ax.set_xlabel("Temperature (°C)")
        ax.set_ylabel("Frequency")
        ax.set_title("Temperature Distribution (Post-QC)")
        ax.legend()

    # Panel 2: Humidity distribution
    if "relative_humidity" in df.columns:
        ax = axes[0, 1]
        df["relative_humidity"].hist(bins=60, color="#42A5F5", alpha=0.8, edgecolor="black",
                                     linewidth=0.3, ax=ax)
        ax.axvline(df["relative_humidity"].mean(), color="#1A237E", linestyle="--",
                   linewidth=2, label=f"Mean = {df['relative_humidity'].mean():.1f}%")
        ax.set_xlabel("Relative Humidity (%)")
        ax.set_ylabel("Frequency")
        ax.set_title("Humidity Distribution (Post-QC)")
        ax.legend()

    # Panel 3: Wind rose (u vs v scatter)
    if "wind_u_zonal" in df.columns and "wind_v_meridional" in df.columns:
        ax = axes[1, 0]
        sample = df.sample(n=min(5000, len(df)), random_state=42)
        ax.scatter(sample["wind_u_zonal"], sample["wind_v_meridional"],
                   alpha=0.3, s=8, color="#66BB6A")
        ax.set_xlabel("Wind u (Zonal, m/s)")
        ax.set_ylabel("Wind v (Meridional, m/s)")
        ax.set_title("Wind Vector Components (u, v)")
        ax.axhline(0, color="gray", linewidth=0.5)
        ax.axvline(0, color="gray", linewidth=0.5)
        ax.set_aspect("equal")

    # Panel 4: VPD distribution
    if "vpd_kpa" in df.columns:
        ax = axes[1, 1]
        df["vpd_kpa"].hist(bins=60, color="#FFA726", alpha=0.8, edgecolor="black",
                           linewidth=0.3, ax=ax)
        ax.axvline(df["vpd_kpa"].mean(), color="#1A237E", linestyle="--",
                   linewidth=2, label=f"Mean = {df['vpd_kpa'].mean():.2f} kPa")
        ax.set_xlabel("Vapor Pressure Deficit (kPa)")
        ax.set_ylabel("Frequency")
        ax.set_title("VPD Distribution (Post-QC)")
        ax.legend()

    plt.suptitle("Asad — IMD 27-Year Data Quality Summary (Post-QC Pipeline)",
                 fontsize=15, fontweight="bold", y=1.01)
    plt.tight_layout()
    fig_path = OUTPUTS_DIR / "asad_data_quality_summary.png"
    plt.savefig(fig_path, bbox_inches="tight")
    plt.close()
    logger.info(f"Saved data quality summary → {fig_path}")


def run_phase5_export_summary(df: pd.DataFrame, mk_result: dict):
    """Phase 5: Export pipeline summary JSON for integration with the main project."""
    logger.info("=" * 70)
    logger.info("PHASE 5: PIPELINE SUMMARY EXPORT")
    logger.info("=" * 70)

    summary = {
        "pipeline": "Asad IMD 27-Year Cleaning Pipeline",
        "dataset": "Kaggle Mumbai Weather Data (27 Years)",
        "total_observations_cleaned": len(df),
        "date_range": {
            "start": str(df["timestamp"].min()),
            "end": str(df["timestamp"].max()),
        },
        "years_covered": int(df["year"].nunique()),
        "statistics": {
            "temperature_c_mean": float(df["temperature_c"].mean()) if "temperature_c" in df.columns else None,
            "temperature_c_std": float(df["temperature_c"].std()) if "temperature_c" in df.columns else None,
            "humidity_mean": float(df["relative_humidity"].mean()) if "relative_humidity" in df.columns else None,
            "vpd_mean_kpa": float(df["vpd_kpa"].mean()) if "vpd_kpa" in df.columns else None,
        },
        "mann_kendall_trend": mk_result,
        "output_files": [
            "data/processed/mumbai_imd_27yr_cleaned.csv",
            "data/processed/mumbai_imd_daily_overpass_features.csv",
            "data/processed/mumbai_imd_annual_summary.csv",
            "outputs/mann_kendall_trend_results.json",
            "outputs/asad_27yr_temperature_trend.png",
            "outputs/asad_monthly_climatology_heatmap.png",
            "outputs/asad_data_quality_summary.png",
        ],
    }

    output_path = OUTPUTS_DIR / "asad_pipeline_summary.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, default=str)
    logger.info(f"Saved pipeline summary → {output_path}")

    return summary


def main():
    parser = argparse.ArgumentParser(
        description="Asad's IMD 27-Year Data Cleaning & Feature Engineering Pipeline"
    )
    parser.add_argument(
        "--input",
        type=str,
        default=None,
        help="Path to raw CSV file. Auto-detects if not specified.",
    )
    args = parser.parse_args()

    print("\n" + "=" * 70)
    print("  ASAD — IMD 27-Year Data Cleaning & Feature Engineering Pipeline")
    print("  Role: Data Engineering & Spatial Analytics")
    print("=" * 70 + "\n")

    # Resolve input file
    if args.input:
        input_path = Path(args.input)
    else:
        input_path = find_raw_csv()
    print(f"Input file: {input_path}\n")

    # Execute pipeline phases
    df_cleaned = run_phase1_cleaning(input_path)
    daily_features = run_phase2_feature_matrix(df_cleaned)
    mk_result = run_phase3_mann_kendall(df_cleaned)

    # Load annual summary for visualization
    annual_path = PROCESSED_DIR / "mumbai_imd_annual_summary.csv"
    annual_df = pd.read_csv(annual_path)

    run_phase4_visualizations(df_cleaned, annual_df, mk_result)
    summary = run_phase5_export_summary(df_cleaned, mk_result)

    print("\n" + "=" * 70)
    print("  [OK] PIPELINE COMPLETE")
    print(f"  Total observations cleaned: {summary['total_observations_cleaned']:,}")
    print(f"  Years covered: {summary['years_covered']}")
    print(f"  Mean Temperature: {summary['statistics']['temperature_c_mean']:.2f} C")
    print(f"  Trend: {mk_result.get('trend', 'N/A')}")
    print(f"  Sen's Slope: {mk_result.get('sens_slope_per_year', 0):.4f} C/year")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()
