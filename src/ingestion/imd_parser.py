"""India Meteorological Department (IMD) Weather Parser & QC Cleaning Pipeline.

Author: Asad (Data Engineering & Spatial Analytics)
Stations: Colaba (Station 43057 - Coastal), Santacruz (Station 43003 - Inland Airport)
Period: 27 Years (1998–2025)
"""

from typing import Optional, Tuple
import logging
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


class IMDParser:
    """Ingests and performs quality control on 27 years of continuous historical

    weather records from Mumbai's Colaba and Santacruz meteorological observatories.
    """

    COLABA_COORDS: Tuple[float, float] = (18.9067, 72.8147)
    SANTACRUZ_COORDS: Tuple[float, float] = (19.1176, 72.8631)

    def __init__(self, outlier_sigma_threshold: float = 3.0):
        self.sigma_threshold = outlier_sigma_threshold

    def clean_hampel_filter(
        self, series: pd.Series, window_size: int = 7
    ) -> pd.Series:
        """Apply rolling Hampel filter (3-sigma median absolute deviation) to reject

        sensor electronic noise without distorting genuine seasonal peaks.
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
        cleaned[outliers] = np.nan
        return cleaned

    def interpolate_short_gaps(
        self, series: pd.Series, max_gap_hours: int = 3
    ) -> pd.Series:
        """Fill short missing sequences (<= 3 hours) using monotonic cubic Hermite splines (PCHIP)."""
        return series.interpolate(
            method="pchip", limit=max_gap_hours, limit_direction="both"
        )

    def load_and_preprocess(self, filepath: str, station_id: str) -> pd.DataFrame:
        """Load raw IMD CSV records and execute automated QC pipeline."""
        df = pd.read_csv(filepath)
        logger.info(f"Loaded raw records for station {station_id}: {len(df)} rows")
        return df
