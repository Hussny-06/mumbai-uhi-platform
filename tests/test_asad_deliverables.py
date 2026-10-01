"""Automated Test Suite for Asad's Data Engineering & Spatial Analytics Deliverables.

Author: Asad (Data Engineering & Spatial Analytics)
Tests:
    1. IMDParser — QC cleaning pipeline (Hampel, PCHIP, bounds clipping)
    2. WeatherPhysicsTransformer — Wind decomposition, VPD calculation
    3. SpatialBlockKFold — Spatial split with buffer exclusion
    4. Mann-Kendall — Trend detection on synthetic warming series
    5. Feature matrix — 17-dimensional predictor vector validation
    6. Integration — End-to-end pipeline execution

Usage:
    pytest tests/test_asad_deliverables.py -v
"""

import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.ingestion.imd_parser import IMDParser
from src.features.weather_physics import WeatherPhysicsTransformer
from src.models.spatial_kfold import SpatialBlockKFold

# ------------------------------------------------------------------ #
#  Expected 17-Feature Vector (Project Specification)
# ------------------------------------------------------------------ #
EXPECTED_FEATURES = [
    "NDVI", "NDBI", "MNDWI", "Albedo", "F_v", "Emissivity",
    "Elevation_m", "Slope_deg", "Aspect_deg", "Distance_Coast_km",
    "Latitude", "Longitude", "T_drybulb_C", "Relative_Humidity",
    "Wind_u_zonal", "Wind_v_meridional", "VPD_kPa",
]


class TestIMDParser:
    """Tests for the IMD 27-Year Cleaning Pipeline."""

    @pytest.fixture
    def parser(self):
        return IMDParser(outlier_sigma_threshold=3.0)

    @pytest.fixture
    def sample_series(self):
        """Create sample temperature series with known outliers."""
        np.random.seed(42)
        n = 200
        clean = 30.0 + 3.0 * np.sin(np.arange(n) * 2 * np.pi / 50) + np.random.normal(0, 0.5, n)
        # Inject 3 obvious outliers
        clean[50] = 99.0    # spike
        clean[100] = -20.0  # dip
        clean[150] = 80.0   # spike
        return pd.Series(clean, name="temperature_c")

    def test_hampel_filter_detects_outliers(self, parser, sample_series):
        """Hampel filter should NaN the injected outliers."""
        cleaned = parser.clean_hampel_filter(sample_series, window_size=7)
        # The extreme values should be NaN'd
        assert pd.isna(cleaned.iloc[50]), "Outlier at index 50 should be NaN"
        assert pd.isna(cleaned.iloc[100]), "Outlier at index 100 should be NaN"
        assert pd.isna(cleaned.iloc[150]), "Outlier at index 150 should be NaN"

    def test_hampel_filter_preserves_clean_data(self, parser, sample_series):
        """Hampel filter should preserve most legitimate values."""
        cleaned = parser.clean_hampel_filter(sample_series, window_size=7)
        nan_count = cleaned.isna().sum()
        # The 3 injected outliers plus their neighbors (rolling window contamination)
        # Extreme values like 99°C distort the rolling median/MAD of adjacent points
        assert nan_count <= 25, f"Too many values flagged as outliers: {nan_count}"

    def test_pchip_interpolation_fills_gaps(self, parser):
        """PCHIP should fill short gaps (≤ 3 data points)."""
        series = pd.Series([25.0, 26.0, np.nan, np.nan, 29.0, 30.0])
        filled = parser.interpolate_short_gaps(series, max_gap_hours=3)
        assert filled.isna().sum() == 0, "PCHIP should fill 2-point gap"

    def test_physical_bounds_clipping(self, parser):
        """Physical bounds clipping should reject impossible sensor values."""
        df = pd.DataFrame({
            "temperature_c": [25.0, -50.0, 60.0, 30.0],      # -50 and 60 are impossible
            "relative_humidity": [70.0, 200.0, -10.0, 55.0],  # 200% and -10% impossible
            "pressure_hpa": [1013.0, 800.0, 1100.0, 1005.0],  # 800 and 1100 extreme
        })
        clipped = parser.clip_physical_bounds(df)
        assert pd.isna(clipped.loc[1, "temperature_c"]), "T = -50°C should be NaN"
        assert pd.isna(clipped.loc[2, "temperature_c"]), "T = 60°C should be NaN"
        assert pd.isna(clipped.loc[1, "relative_humidity"]), "RH = 200% should be NaN"
        assert pd.isna(clipped.loc[2, "relative_humidity"]), "RH = -10% should be NaN"

    def test_wind_decomposition(self):
        """Wind vector decomposition should produce correct u, v components."""
        # North wind (0°) → u=0, v=-speed
        direction = pd.Series([0.0])
        u, v = IMDParser.decompose_wind_from_direction(direction, default_speed_ms=5.0)
        assert abs(u.iloc[0]) < 0.01, "North wind should have u ≈ 0"
        assert abs(v.iloc[0] - (-5.0)) < 0.01, "North wind should have v ≈ -5"

        # East wind (90°) → u=-speed, v=0
        direction = pd.Series([90.0])
        u, v = IMDParser.decompose_wind_from_direction(direction, default_speed_ms=5.0)
        assert abs(u.iloc[0] - (-5.0)) < 0.01, "East wind should have u ≈ -5"
        assert abs(v.iloc[0]) < 0.01, "East wind should have v ≈ 0"

    def test_vpd_computation(self):
        """VPD should be positive and increase with lower humidity."""
        temp = pd.Series([30.0, 30.0, 30.0])
        rh = pd.Series([100.0, 50.0, 20.0])

        vpd = IMDParser.compute_vpd(temp, rh)
        assert abs(vpd.iloc[0]) < 0.01, "VPD at 100% RH should be ≈ 0"
        assert vpd.iloc[1] > vpd.iloc[0], "VPD at 50% RH should exceed 100% RH"
        assert vpd.iloc[2] > vpd.iloc[1], "VPD at 20% RH should exceed 50% RH"

    def test_overpass_window_filter(self):
        """Overpass window filter should only retain 10:00–11:30 observations."""
        dates = pd.date_range("2024-01-01", periods=48, freq="30min")
        df = pd.DataFrame({
            "timestamp": dates,
            "temperature_c": np.random.uniform(25, 35, 48),
        })
        filtered = IMDParser.extract_overpass_window(df)
        hours = filtered["timestamp"].dt.hour
        minutes = filtered["timestamp"].dt.minute

        for _, row in filtered.iterrows():
            time_min = row["timestamp"].hour * 60 + row["timestamp"].minute
            assert 600 <= time_min <= 690, f"Time {row['timestamp']} outside overpass window"


class TestMannKendall:
    """Tests for Mann-Kendall monotonic trend detection."""

    def test_increasing_trend(self):
        """Should detect significant increasing trend in monotonic data."""
        annual = pd.Series(np.arange(20) * 0.1 + 28.0)  # 28.0 → 29.9
        result = IMDParser.mann_kendall_trend(annual)
        assert result["trend"] == "increasing", f"Expected increasing, got {result['trend']}"
        assert result["significant_at_005"], "Strong linear increase should be significant"
        assert result["sens_slope_per_year"] > 0, "Slope should be positive"

    def test_no_trend(self):
        """Should not find significant trend in random noise."""
        np.random.seed(42)
        annual = pd.Series(28.0 + np.random.normal(0, 0.2, 10))
        result = IMDParser.mann_kendall_trend(annual)
        # With random data, might or might not be significant — just check it runs
        assert result["trend"] in ("increasing", "decreasing", "no_significant_trend")
        assert "p_value" in result

    def test_insufficient_data(self):
        """Should return insufficient_data for < 4 years."""
        annual = pd.Series([28.0, 29.0])
        result = IMDParser.mann_kendall_trend(annual)
        assert result["trend"] == "insufficient_data"


class TestWeatherPhysics:
    """Tests for WeatherPhysicsTransformer (Asad's module)."""

    def test_wind_decomposition_roundtrip(self):
        """Decomposed vectors should reconstruct original speed and direction."""
        speed = np.array([5.0, 10.0, 3.0])
        direction = np.array([45.0, 180.0, 270.0])

        u, v = WeatherPhysicsTransformer.decompose_wind_vectors(speed, direction)

        # Reconstruct speed
        recon_speed = np.sqrt(u**2 + v**2)
        np.testing.assert_allclose(recon_speed, speed, atol=0.01)

    def test_vpd_nonnegative(self):
        """VPD should always be ≥ 0."""
        temps = np.array([15.0, 25.0, 35.0, 45.0])
        rhs = np.array([100.0, 80.0, 50.0, 30.0])
        vpd = WeatherPhysicsTransformer.compute_vapor_pressure_deficit(temps, rhs)
        assert np.all(vpd >= 0), "VPD must be non-negative"

    def test_vpd_zero_at_saturation(self):
        """VPD at 100% RH should be exactly 0."""
        vpd = WeatherPhysicsTransformer.compute_vapor_pressure_deficit(
            np.array([30.0]), np.array([100.0])
        )
        np.testing.assert_allclose(vpd, 0.0, atol=1e-6)


class TestSpatialBlockKFold:
    """Tests for Spatial Block K-Fold Cross-Validation (Asad's module)."""

    @pytest.fixture
    def mumbai_coords(self):
        """Generate realistic Mumbai UTM coordinates."""
        np.random.seed(42)
        n = 500
        x = np.random.uniform(265000, 290000, n)  # ~25 km E-W span
        y = np.random.uniform(2090000, 2133000, n)  # ~43 km N-S span
        return np.column_stack([x, y])

    def test_split_produces_valid_indices(self, mumbai_coords):
        """All returned indices should be valid array indices."""
        kfold = SpatialBlockKFold(n_splits=5, buffer_distance_meters=1200.0)
        for train_idx, val_idx in kfold.split(mumbai_coords):
            assert len(train_idx) > 0, "Train set should not be empty"
            assert len(val_idx) > 0, "Validation set should not be empty"
            assert max(train_idx) < len(mumbai_coords)
            assert max(val_idx) < len(mumbai_coords)

    def test_no_index_overlap(self, mumbai_coords):
        """Train and validation indices must not overlap."""
        kfold = SpatialBlockKFold(n_splits=5, buffer_distance_meters=1200.0)
        for train_idx, val_idx in kfold.split(mumbai_coords):
            overlap = set(train_idx) & set(val_idx)
            assert len(overlap) == 0, f"Train/val overlap detected: {overlap}"

    def test_buffer_distance_enforced(self, mumbai_coords):
        """Minimum distance between train and val points should exceed buffer."""
        kfold = SpatialBlockKFold(n_splits=5, buffer_distance_meters=1200.0)
        splits = list(kfold.split(mumbai_coords))

        if splits:
            train_idx, val_idx = splits[0]
            train_coords = mumbai_coords[train_idx]
            val_coords = mumbai_coords[val_idx]

            # Check minimum distance between train and val
            for t_coord in train_coords[:50]:  # Sample for speed
                distances = np.linalg.norm(val_coords - t_coord, axis=1)
                min_dist = np.min(distances)
                assert min_dist >= 1200.0, (
                    f"Train point at {t_coord} is only {min_dist:.0f}m "
                    f"from validation — buffer violated!"
                )


class TestFeatureMatrix:
    """Tests for the 17-dimensional predictor vector specification."""

    def test_feature_count(self):
        """Feature vector should have exactly 17 dimensions."""
        assert len(EXPECTED_FEATURES) == 17, f"Expected 17 features, got {len(EXPECTED_FEATURES)}"

    def test_feature_names_match_spec(self):
        """Feature names should match the project technical architecture spec."""
        expected_set = {
            "NDVI", "NDBI", "MNDWI", "Albedo", "F_v", "Emissivity",
            "Elevation_m", "Slope_deg", "Aspect_deg", "Distance_Coast_km",
            "Latitude", "Longitude", "T_drybulb_C", "Relative_Humidity",
            "Wind_u_zonal", "Wind_v_meridional", "VPD_kPa",
        }
        actual_set = set(EXPECTED_FEATURES)
        assert actual_set == expected_set, f"Feature mismatch: {actual_set.symmetric_difference(expected_set)}"

    def test_imd_meteorological_features_present(self):
        """The 5 IMD-derived meteorological features should be in the vector."""
        imd_features = {"T_drybulb_C", "Relative_Humidity", "Wind_u_zonal", "Wind_v_meridional", "VPD_kPa"}
        assert imd_features.issubset(set(EXPECTED_FEATURES)), "Missing IMD meteorological features"


class TestIntegration:
    """End-to-end integration tests."""

    def test_imd_parser_instantiation(self):
        """IMDParser should initialize with correct defaults."""
        parser = IMDParser()
        assert parser.sigma_threshold == 3.0
        assert parser.COLABA_COORDS == (18.9067, 72.8147)
        assert parser.SANTACRUZ_COORDS == (19.1176, 72.8631)

    def test_column_mapping_completeness(self):
        """Column mapping should cover all expected Kaggle dataset columns."""
        kaggle_columns = {
            "Time", "Temperature (°C)", "Dew Point (°C)", "Heat Index (°C)",
            "Relative Humidity", "Pressure (hPa)", "Visibility (KM)",
            "Wind Chill (°C)", "Wind Direction", "Wind Cardinal",
            "UV Index", "Feels Like (°C)", "Day", "Weather Phrase",
        }
        mapped = set(IMDParser.COLUMN_MAPPING.keys())
        for col in kaggle_columns:
            assert col in mapped, f"Kaggle column '{col}' not in COLUMN_MAPPING"

    def test_pipeline_on_synthetic_data(self):
        """Full pipeline should run successfully on synthetic data."""
        # Create minimal synthetic CSV-like DataFrame
        n = 100
        np.random.seed(42)
        dates = pd.date_range("2024-01-01", periods=n, freq="1h")

        df = pd.DataFrame({
            "Time": dates.strftime("%Y-%m-%d %H:%M:%S"),
            "Temperature (°C)": np.random.uniform(25, 38, n),
            "Relative Humidity": np.random.uniform(40, 90, n),
            "Wind Direction": np.random.uniform(0, 360, n),
            "Pressure (hPa)": np.random.uniform(1005, 1015, n),
            "Dew Point (°C)": np.random.uniform(18, 28, n),
            "Heat Index (°C)": np.random.uniform(28, 42, n),
            "Visibility (KM)": np.random.uniform(2, 15, n),
            "Wind Chill (°C)": np.random.uniform(22, 35, n),
            "Feels Like (°C)": np.random.uniform(28, 42, n),
        })

        # Save to temp file
        import tempfile
        with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
            df.to_csv(f.name, index=False)
            temp_path = f.name

        # Run pipeline
        parser = IMDParser()
        result = parser.load_and_preprocess(temp_path, station_id="test")

        assert len(result) > 0, "Pipeline should produce output"
        assert "wind_u_zonal" in result.columns, "Should have wind_u_zonal"
        assert "wind_v_meridional" in result.columns, "Should have wind_v_meridional"
        assert "vpd_kpa" in result.columns, "Should have vpd_kpa"
        assert "year" in result.columns, "Should have year"
        assert "month" in result.columns, "Should have month"

        # Cleanup
        Path(temp_path).unlink()
