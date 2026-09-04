"""Meteorological Physics Transformations & Interpolation.

Author: Asad (Data Engineering & Spatial Analytics)
Physics Formulations:
- Wind Vector Decomposition (u, v orthogonalization)
- Vapor Pressure Deficit (VPD via Tetens formulation)
- Satellite Overpass Timestamp Alignment
"""

from typing import Tuple
import numpy as np
import pandas as pd


class WeatherPhysicsTransformer:
    """Transforms raw meteorological variables into physically continuous atmospheric

    drivers (zonal/meridional wind vectors, atmospheric drying power VPD).
    """

    @staticmethod
    def decompose_wind_vectors(
        wind_speed_ms: np.ndarray, wind_direction_deg: np.ndarray
    ) -> Tuple[np.ndarray, np.ndarray]:
        """Decompose circular wind direction (0°-360°) into continuous orthogonal velocity vectors:

        - u = - Wind_Speed * sin(Wind_Direction * π / 180)  [Zonal: West to East]
        - v = - Wind_Speed * cos(Wind_Direction * π / 180)  [Meridional: South to North]
        """
        rad = np.radians(wind_direction_deg)
        u = -wind_speed_ms * np.sin(rad)
        v = -wind_speed_ms * np.cos(rad)
        return u, v

    @staticmethod
    def compute_vapor_pressure_deficit(
        t_drybulb_celsius: np.ndarray, relative_humidity_pct: np.ndarray
    ) -> np.ndarray:
        """Calculate Vapor Pressure Deficit (VPD in kPa) using the Tetens equation:

        e_s = 0.61078 * exp((17.27 * T_drybulb) / (T_drybulb + 237.3)) [kPa]
        e = e_s * (RH / 100.0) [kPa]
        VPD = e_s - e [kPa]
        """
        e_s = 0.61078 * np.exp(
            (17.27 * t_drybulb_celsius) / (t_drybulb_celsius + 237.3)
        )
        e = e_s * (relative_humidity_pct / 100.0)
        vpd = np.maximum(0.0, e_s - e)
        return vpd

    @staticmethod
    def align_to_overpass_timestamp(
        weather_df: pd.DataFrame,
        overpass_timestamp: pd.Timestamp,
        tolerance_minutes: int = 30,
    ) -> pd.Series:
        """Find the ground station weather observation matching the satellite scene overpass

        within the specified tolerance window.
        """
        time_diffs = (weather_df["timestamp"] - overpass_timestamp).abs()
        min_diff_idx = time_diffs.idxmin()
        if time_diffs.loc[min_diff_idx] <= pd.Timedelta(minutes=tolerance_minutes):
            return weather_df.loc[min_diff_idx]
        raise ValueError(
            f"No IMD ground observation found within ±{tolerance_minutes} min of overpass {overpass_timestamp}"
        )
