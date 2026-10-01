"""India Meteorological Department (IMD) Weather Parser & QC Cleaning Pipeline.

Author: Asad (Data Engineering & Spatial Analytics)
Stations: Colaba (Station 43057 - Coastal), Santacruz (Station 43003 - Inland Airport)
Period: 27 Years (1997–2024)
Dataset: Kaggle Mumbai Weather Data (370K+ entries, 30-min to 1-hr frequency)

Pipeline Stages:
    1. Raw CSV ingestion with timezone-aware datetime parsing
    2. Hampel filter (3σ MAD) outlier rejection on continuous variables
    3. PCHIP monotonic cubic Hermite spline gap-filling (≤ 3 hours)
    4. Wind vector orthogonalization (u, v decomposition)
    5. Vapor Pressure Deficit (VPD) via Tetens formulation
    6. Mann-Kendall monotonic trend detection on annual temperature series
    7. Satellite overpass window extraction (10:00–11:30 AM IST)
"""

from typing import Optional, Tuple, Dict, Any, List
import logging
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


class IMDParser:
    """Ingests and performs quality control on 27 years of continuous historical

    weather records from Mumbai's meteorological observatories.
    Supports the Kaggle 'Mumbai Weather Data (27 Years)' dataset format.
    """

    # IMD station coordinates (WGS 84)
    COLABA_COORDS: Tuple[float, float] = (18.9067, 72.8147)
    SANTACRUZ_COORDS: Tuple[float, float] = (19.1176, 72.8631)

    # Kaggle dataset column mapping → internal standardized names
    COLUMN_MAPPING: Dict[str, str] = {
        # Timestamp
        "Time": "timestamp",
        # Temperature — handles both raw ("Temperature (°C)") and cleaned ("Temperature")
        "Temperature (°C)": "temperature_c",
        "Temperature": "temperature_c",
        # Dew Point
        "Dew Point (°C)": "dew_point_c",
        "Dew Point": "dew_point_c",
        # Heat Index
        "Heat Index (°C)": "heat_index_c",
        "Heat Index": "heat_index_c",
        # Humidity
        "Relative Humidity": "relative_humidity",
        # Pressure
        "Pressure (hPa)": "pressure_hpa",
        "Pressure": "pressure_hpa",
        # Visibility
        "Visibility (KM)": "visibility_km",
        "Visibility": "visibility_km",
        # Wind Chill
        "Wind Chill (°C)": "wind_chill_c",
        "Wind Chill": "wind_chill_c",
        # Wind Direction
        "Wind Direction": "wind_direction_deg",
        "Wind Cardinal": "wind_cardinal",
        # UV
        "UV Index": "uv_index",
        "UV Description": "uv_description",
        # Feels Like
        "Feels Like (°C)": "feels_like_c",
        "Feels Like": "feels_like_c",
        # Day/Night and Weather
        "Day": "day_night",
        "Weather Phrase": "weather_phrase",
        "Weather Icon": "weather_icon",
        "Observed Location": "observed_location",
    }

    # Continuous numeric columns eligible for Hampel filtering
    NUMERIC_QC_COLUMNS: List[str] = [
        "temperature_c",
        "dew_point_c",
        "heat_index_c",
        "relative_humidity",
        "pressure_hpa",
        "visibility_km",
        "wind_chill_c",
        "feels_like_c",
    ]

    # Physical bounds for sensor clipping (min, max)
    PHYSICAL_BOUNDS: Dict[str, Tuple[float, float]] = {
        "temperature_c": (5.0, 50.0),
        "dew_point_c": (-5.0, 35.0),
        "heat_index_c": (5.0, 60.0),
        "relative_humidity": (5.0, 100.0),
        "pressure_hpa": (950.0, 1060.0),
        "visibility_km": (0.0, 50.0),
        "wind_chill_c": (0.0, 50.0),
        "feels_like_c": (5.0, 60.0),
        "wind_direction_deg": (0.0, 360.0),
        "uv_index": (0.0, 15.0),
    }

    def __init__(self, outlier_sigma_threshold: float = 3.0):
        self.sigma_threshold = outlier_sigma_threshold

    # ------------------------------------------------------------------ #
    #  Stage 1: Raw Ingestion & Datetime Parsing
    # ------------------------------------------------------------------ #
    def load_raw_csv(self, filepath: str) -> pd.DataFrame:
        """Load raw Kaggle CSV and standardize column names with IST datetime parsing.

        Args:
            filepath: Path to the raw CSV file (mumbai_weather.csv or cleaned_data.csv).

        Returns:
            DataFrame with standardized column names and timezone-aware datetime index.
        """
        df = pd.read_csv(filepath)
        logger.info(f"Loaded raw CSV: {len(df)} rows, {len(df.columns)} columns")

        # Rename columns using mapping (only rename columns that exist)
        rename_map = {k: v for k, v in self.COLUMN_MAPPING.items() if k in df.columns}
        df = df.rename(columns=rename_map)

        # Parse timestamp
        if "timestamp" in df.columns:
            df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
            n_bad_dates = df["timestamp"].isna().sum()
            if n_bad_dates > 0:
                logger.warning(f"Dropped {n_bad_dates} rows with unparseable timestamps")
                df = df.dropna(subset=["timestamp"])

            # Sort chronologically and reset index
            df = df.sort_values("timestamp").reset_index(drop=True)

        logger.info(
            f"After datetime parsing: {len(df)} rows, "
            f"date range: {df['timestamp'].min()} → {df['timestamp'].max()}"
        )
        return df

    # ------------------------------------------------------------------ #
    #  Stage 2: Hampel Filter (3σ MAD Outlier Rejection)
    # ------------------------------------------------------------------ #
    def clean_hampel_filter(
        self, series: pd.Series, window_size: int = 7
    ) -> pd.Series:
        """Apply rolling Hampel filter (3-sigma median absolute deviation) to reject

        sensor electronic noise without distorting genuine seasonal peaks.

        The Hampel identifier computes:
            median_i = rolling_median(series, window)
            MAD_i    = rolling_median(|series - median_i|, window)
            threshold = σ_thresh × 1.4826 × MAD_i

        Points where |x_i - median_i| > threshold are replaced with NaN.
        The constant 1.4826 is the consistency factor for Gaussian distributions.
        """
        rolling_median = series.rolling(window=window_size, center=True).median()
        rolling_mad = (
            (series - rolling_median)
            .abs()
            .rolling(window=window_size, center=True)
            .median()
        )
        threshold = self.sigma_threshold * 1.4826 * rolling_mad
        difference = (series - rolling_median).abs()

        cleaned = series.copy()
        outliers = difference > threshold
        n_outliers = outliers.sum()
        if n_outliers > 0:
            logger.info(
                f"Hampel filter on '{series.name}': rejected {n_outliers} outliers "
                f"({100 * n_outliers / len(series):.2f}%)"
            )
        cleaned[outliers] = np.nan
        return cleaned

    # ------------------------------------------------------------------ #
    #  Stage 3: Physical Bounds Clipping
    # ------------------------------------------------------------------ #
    def clip_physical_bounds(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clip values outside physically plausible sensor ranges to NaN.

        Prevents physically impossible readings (e.g., negative humidity,
        pressure outside troposphere range) from corrupting downstream models.
        """
        for col, (lo, hi) in self.PHYSICAL_BOUNDS.items():
            if col in df.columns:
                mask = (df[col] < lo) | (df[col] > hi)
                n_clipped = mask.sum()
                if n_clipped > 0:
                    logger.info(f"Physical bounds clip on '{col}': {n_clipped} values → NaN")
                    df.loc[mask, col] = np.nan
        return df

    # ------------------------------------------------------------------ #
    #  Stage 4: PCHIP Interpolation for Short Gaps
    # ------------------------------------------------------------------ #
    def interpolate_short_gaps(
        self, series: pd.Series, max_gap_hours: int = 3
    ) -> pd.Series:
        """Fill short missing sequences (≤ 3 hours) using monotonic cubic Hermite splines (PCHIP).

        PCHIP preserves monotonicity and prevents Runge oscillation artifacts
        that standard cubic splines introduce in meteorological time series.
        """
        return series.interpolate(
            method="pchip", limit=max_gap_hours, limit_direction="both"
        )

    # ------------------------------------------------------------------ #
    #  Stage 5: Wind Vector Decomposition
    # ------------------------------------------------------------------ #
    @staticmethod
    def decompose_wind_from_direction(
        wind_direction_deg: pd.Series,
        wind_speed_ms: Optional[pd.Series] = None,
        default_speed_ms: float = 3.0,
    ) -> Tuple[pd.Series, pd.Series]:
        """Decompose circular wind direction (0°–360°) into continuous orthogonal vectors.

        Since the Kaggle dataset has wind direction but NOT wind speed,
        we use a default Mumbai coastal breeze speed of 3.0 m/s.

        Returns:
            (wind_u_zonal, wind_v_meridional) — continuous Cartesian components
        """
        if wind_speed_ms is None:
            wind_speed_ms = pd.Series(
                default_speed_ms, index=wind_direction_deg.index, name="wind_speed_ms"
            )

        rad = np.radians(wind_direction_deg.astype(float))
        u = -wind_speed_ms * np.sin(rad)
        v = -wind_speed_ms * np.cos(rad)
        return u.rename("wind_u_zonal"), v.rename("wind_v_meridional")

    # ------------------------------------------------------------------ #
    #  Stage 6: Vapor Pressure Deficit (Tetens Equation)
    # ------------------------------------------------------------------ #
    @staticmethod
    def compute_vpd(
        t_drybulb_celsius: pd.Series, relative_humidity_pct: pd.Series
    ) -> pd.Series:
        """Calculate VPD (kPa) using the Tetens equation.

        e_s = 0.61078 × exp((17.27 × T) / (T + 237.3))
        VPD = e_s × (1 - RH/100)
        """
        e_s = 0.61078 * np.exp(
            (17.27 * t_drybulb_celsius) / (t_drybulb_celsius + 237.3)
        )
        vpd = e_s * (1.0 - relative_humidity_pct / 100.0)
        return vpd.clip(lower=0.0).rename("vpd_kpa")

    # ------------------------------------------------------------------ #
    #  Stage 7: Mann-Kendall Trend Test
    # ------------------------------------------------------------------ #
    @staticmethod
    def mann_kendall_trend(
        annual_series: pd.Series,
    ) -> Dict[str, Any]:
        """Compute the Mann-Kendall monotonic trend test on annual mean temperature.

        This is a non-parametric test that detects statistically significant
        upward or downward trends in time series without assuming normality.

        Implementation: Sen's slope estimator with Kendall's S statistic.

        Returns:
            Dictionary with trend direction, p-value, Sen's slope, and significance.
        """
        values = annual_series.dropna().values
        n = len(values)
        if n < 4:
            return {
                "trend": "insufficient_data",
                "p_value": 1.0,
                "sens_slope": 0.0,
                "significant_at_005": False,
                "n_years": n,
            }

        # Kendall's S statistic
        s = 0
        slopes = []
        for i in range(n):
            for j in range(i + 1, n):
                diff = values[j] - values[i]
                if diff > 0:
                    s += 1
                elif diff < 0:
                    s -= 1
                # Sen's slope candidates
                if j != i:
                    slopes.append(diff / (j - i))

        # Variance of S
        var_s = (n * (n - 1) * (2 * n + 5)) / 18.0

        # Z-score
        if s > 0:
            z = (s - 1) / np.sqrt(var_s)
        elif s < 0:
            z = (s + 1) / np.sqrt(var_s)
        else:
            z = 0.0

        # Two-tailed p-value from standard normal
        from scipy import stats as scipy_stats

        p_value = 2.0 * (1.0 - scipy_stats.norm.cdf(abs(z)))

        # Sen's slope (median of all pairwise slopes)
        sens_slope = float(np.median(slopes)) if slopes else 0.0

        # Trend direction
        if p_value <= 0.05:
            trend = "increasing" if z > 0 else "decreasing"
        else:
            trend = "no_significant_trend"

        return {
            "trend": trend,
            "p_value": float(p_value),
            "sens_slope_per_year": sens_slope,
            "z_statistic": float(z),
            "kendall_s": int(s),
            "significant_at_005": bool(p_value <= 0.05),
            "n_years": n,
        }

    # ------------------------------------------------------------------ #
    #  Stage 8: Satellite Overpass Window Extraction
    # ------------------------------------------------------------------ #
    @staticmethod
    def extract_overpass_window(
        df: pd.DataFrame,
        start_hour: int = 10,
        start_minute: int = 0,
        end_hour: int = 11,
        end_minute: int = 30,
    ) -> pd.DataFrame:
        """Filter to observations within the Landsat 8/9 overpass window (~10:00–11:30 AM IST).

        This temporal synchronization ensures ground truth weather observations
        align with the exact satellite acquisition timestamp (±30 min tolerance).
        """
        hour = df["timestamp"].dt.hour
        minute = df["timestamp"].dt.minute
        time_minutes = hour * 60 + minute
        start_min = start_hour * 60 + start_minute
        end_min = end_hour * 60 + end_minute

        mask = (time_minutes >= start_min) & (time_minutes <= end_min)
        filtered = df[mask].copy()
        logger.info(
            f"Overpass window filter [{start_hour:02d}:{start_minute:02d}–"
            f"{end_hour:02d}:{end_minute:02d}]: "
            f"{len(filtered)} / {len(df)} observations retained"
        )
        return filtered

    # ------------------------------------------------------------------ #
    #  Master Pipeline: Full 27-Year Cleaning
    # ------------------------------------------------------------------ #
    def load_and_preprocess(
        self, filepath: str, station_id: str = "mumbai"
    ) -> pd.DataFrame:
        """Execute the full automated QC pipeline on raw IMD/Kaggle CSV.

        Pipeline:
            1. Load & parse datetimes
            2. Physical bounds clipping
            3. Hampel filter on continuous variables
            4. PCHIP gap-filling (≤ 3 hours)
            5. Wind vector decomposition (u, v)
            6. VPD computation (Tetens equation)
            7. Derived temporal features (year, month, day_of_year, hour)

        Args:
            filepath: Path to raw CSV.
            station_id: Station identifier for logging.

        Returns:
            Cleaned DataFrame with all derived features.
        """
        logger.info(f"{'='*60}")
        logger.info(f"IMD QC Pipeline START — Station: {station_id}")
        logger.info(f"{'='*60}")

        # Stage 1: Load
        df = self.load_raw_csv(filepath)
        initial_count = len(df)

        # Stage 2: Physical bounds
        df = self.clip_physical_bounds(df)

        # Stage 3: Hampel filter on continuous variables
        for col in self.NUMERIC_QC_COLUMNS:
            if col in df.columns:
                df[col] = self.clean_hampel_filter(df[col])

        # Stage 4: PCHIP interpolation
        for col in self.NUMERIC_QC_COLUMNS:
            if col in df.columns:
                nan_before = df[col].isna().sum()
                df[col] = self.interpolate_short_gaps(df[col])
                nan_after = df[col].isna().sum()
                filled = nan_before - nan_after
                if filled > 0:
                    logger.info(f"PCHIP filled {filled} gaps in '{col}'")

        # Stage 5: Wind decomposition
        if "wind_direction_deg" in df.columns:
            df["wind_u_zonal"], df["wind_v_meridional"] = self.decompose_wind_from_direction(
                df["wind_direction_deg"]
            )

        # Stage 6: VPD
        if "temperature_c" in df.columns and "relative_humidity" in df.columns:
            df["vpd_kpa"] = self.compute_vpd(df["temperature_c"], df["relative_humidity"])

        # Stage 7: Derived temporal features
        if "timestamp" in df.columns:
            df["year"] = df["timestamp"].dt.year
            df["month"] = df["timestamp"].dt.month
            df["day_of_year"] = df["timestamp"].dt.dayofyear
            df["hour"] = df["timestamp"].dt.hour

        # Drop rows with remaining NaN in critical columns
        critical_cols = ["temperature_c", "relative_humidity"]
        existing_critical = [c for c in critical_cols if c in df.columns]
        if existing_critical:
            df = df.dropna(subset=existing_critical)

        final_count = len(df)
        logger.info(
            f"Pipeline COMPLETE: {initial_count} → {final_count} rows "
            f"({initial_count - final_count} removed, "
            f"{100 * final_count / initial_count:.1f}% retention)"
        )
        return df

    # ------------------------------------------------------------------ #
    #  Utility: Compute Annual Summary Statistics
    # ------------------------------------------------------------------ #
    @staticmethod
    def compute_annual_summary(df: pd.DataFrame) -> pd.DataFrame:
        """Aggregate cleaned observations into annual summary statistics.

        Returns DataFrame with yearly mean, max, min temperature, humidity, VPD, etc.
        """
        if "year" not in df.columns:
            df["year"] = df["timestamp"].dt.year

        agg_dict = {}
        for col in ["temperature_c", "relative_humidity", "vpd_kpa", "pressure_hpa"]:
            if col in df.columns:
                agg_dict[col] = ["mean", "std", "min", "max"]

        if "temperature_c" in df.columns:
            agg_dict["temperature_c"] = ["mean", "std", "min", "max", "count"]

        summary = df.groupby("year").agg(agg_dict)
        summary.columns = ["_".join(col).strip() for col in summary.columns.values]
        return summary.reset_index()
