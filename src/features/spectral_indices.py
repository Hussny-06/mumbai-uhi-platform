"""Spectral Indices & Biophysical Feature Computation.

Author: Hussain (Lead Architecture & ML Downscaling)
Formulations:
- NDVI: Normalized Difference Vegetation Index
- NDBI: Normalized Difference Built-Up Index
- MNDWI: Modified Normalized Difference Water Index
- Broadband Albedo (α)
- Fractional Vegetation Cover (Fv) & Land Surface Emissivity (ε)
- True Land Surface Temperature (LST in Celsius via Planck Radiative Transfer)
"""

import numpy as np


class SpectralIndicesCalculator:
    """Calculates high-resolution normalized spectral indices and physical thermal

    emissivity / LST transformations at 30m grid spacing.
    """

    @staticmethod
    def calculate_ndvi(nir: np.ndarray, red: np.ndarray) -> np.ndarray:
        """NDVI = (ρ_NIR - ρ_Red) / (ρ_NIR + ρ_Red)"""
        denom = nir + red
        return np.where(denom != 0, (nir - red) / denom, 0.0)

    @staticmethod
    def calculate_ndbi(swir1: np.ndarray, nir: np.ndarray) -> np.ndarray:
        """NDBI = (ρ_SWIR1 - ρ_NIR) / (ρ_SWIR1 + ρ_NIR)"""
        denom = swir1 + nir
        return np.where(denom != 0, (swir1 - nir) / denom, 0.0)

    @staticmethod
    def calculate_mndwi(green: np.ndarray, swir1: np.ndarray) -> np.ndarray:
        """MNDWI = (ρ_Green - ρ_SWIR1) / (ρ_Green + ρ_SWIR1)"""
        denom = green + swir1
        return np.where(denom != 0, (green - swir1) / denom, 0.0)

    @staticmethod
    def calculate_broadband_albedo(
        blue: np.ndarray,
        red: np.ndarray,
        nir: np.ndarray,
        swir1: np.ndarray,
        swir2: np.ndarray,
    ) -> np.ndarray:
        """Broadband Albedo (α) estimating surface solar reflectance:

        α = 0.356*ρ_Blue + 0.130*ρ_Red + 0.373*ρ_NIR + 0.085*ρ_SWIR1 + 0.072*ρ_SWIR2 - 0.0018
        """
        return (
            0.356 * blue
            + 0.130 * red
            + 0.373 * nir
            + 0.085 * swir1
            + 0.072 * swir2
            - 0.0018
        )

    @staticmethod
    def calculate_fractional_vegetation_cover(
        ndvi: np.ndarray, ndvi_min: float = 0.05, ndvi_max: float = 0.70
    ) -> np.ndarray:
        """F_v = ((NDVI - NDVI_min) / (NDVI_max - NDVI_min))^2"""
        scaled = np.clip((ndvi - ndvi_min) / (ndvi_max - ndvi_min), 0.0, 1.0)
        return np.square(scaled)

    @staticmethod
    def calculate_emissivity(f_v: np.ndarray) -> np.ndarray:
        """ε = 0.985 * F_v + 0.960 * (1 - F_v) + 0.005"""
        return 0.985 * f_v + 0.960 * (1.0 - f_v) + 0.005

    @staticmethod
    def calculate_true_lst_celsius(
        t_b_kelvin: np.ndarray,
        emissivity: np.ndarray,
        effective_wavelength: float = 10.895,
        c2: float = 14380.0,
    ) -> np.ndarray:
        """Derive True Surface Temperature in Celsius (T_C) via Planck split-window radiative equation:

        LST = ( T_B / (1 + (λ * T_B / c_2) * ln(ε)) ) - 273.15
        """
        numerator = t_b_kelvin
        denominator = 1.0 + ((effective_wavelength * t_b_kelvin) / c2) * np.log(emissivity)
        lst_kelvin = numerator / denominator
        return lst_kelvin - 273.15
