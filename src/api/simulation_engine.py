"""High-Performance Real-Time "What-If" Mitigation Engine.

Author: Hussain (Lead Architecture & ML Downscaling)
Latency SLA: <= 1.5 seconds per simulation query.
"""

import time
from typing import Dict, Any, Optional
import numpy as np


class WhatIfSimulationEngine:
    """Simulates localized urban cooling interventions by perturbing feature matrices

    and running high-speed surrogate inference.
    """

    def __init__(self, model: Any = None):
        self.model = model

    def simulate_intervention(
        self,
        base_features: np.ndarray,
        delta_ndvi: float = 0.0,
        delta_albedo: float = 0.0,
        delta_ndbi: float = 0.0,
        ndvi_col_idx: int = 0,
        ndbi_col_idx: int = 1,
        albedo_col_idx: int = 3,
        fv_col_idx: int = 4,
        baseline_lst_override: Optional[float] = None,
    ) -> Dict[str, float]:
        """Perturb feature matrix and calculate predicted cooling delta and energy savings.

        Latency SLA: <= 1.5s
        """
        start_time = time.perf_counter()

        perturbed = base_features.copy()
        # Apply intervention perturbations to NDVI, NDBI, Albedo, and Fractional Vegetation Cover (F_v)
        perturbed[:, ndvi_col_idx] = np.clip(
            perturbed[:, ndvi_col_idx] + delta_ndvi, -1.0, 1.0
        )
        perturbed[:, ndbi_col_idx] = np.clip(
            perturbed[:, ndbi_col_idx] + delta_ndbi, -1.0, 1.0
        )
        perturbed[:, albedo_col_idx] = np.clip(
            perturbed[:, albedo_col_idx] + delta_albedo, 0.0, 1.0
        )
        if perturbed.shape[1] > fv_col_idx and delta_ndvi != 0.0:
            perturbed[:, fv_col_idx] = np.clip(
                perturbed[:, fv_col_idx] + delta_ndvi * 0.85, 0.0, 1.0
            )

        expected_features = getattr(self.model, "n_features_in_", None)
        if expected_features is None and hasattr(self.model, "get_booster"):
            try:
                expected_features = self.model.get_booster().num_features()
            except Exception:
                expected_features = 17

        def align_features(mat):
            if expected_features == 19 and mat.shape[1] == 17:
                ndbi_ndvi = mat[:, 1] - mat[:, 0]
                albedo_ndbi = mat[:, 3] * mat[:, 1]
                return np.column_stack([mat, ndbi_ndvi, albedo_ndbi])
            elif expected_features == 17 and mat.shape[1] == 19:
                return mat[:, :17]
            return mat

        base_mat = align_features(base_features)
        sim_mat = align_features(perturbed)

        # Calibrated physical sensitivity (used as fallback or blended with tree ensemble)
        physics_delta = -(
            delta_ndvi * 3.20 + delta_albedo * 2.10 - delta_ndbi * 2.85
        )

        if self.model and hasattr(self.model, "predict"):
            baseline_lst = self.model.predict(base_mat)
            simulated_lst = self.model.predict(sim_mat)
            raw_tree_delta = float(np.mean(simulated_lst) - np.mean(baseline_lst))
            # Blend tree-split response with continuous radiative/evapotranspirative physics
            # so sub-split slider increments and NDBI depaving produce smooth, monotonic deltas
            delta_t = 0.35 * raw_tree_delta + 0.65 * physics_delta
            mean_base = (
                float(baseline_lst_override)
                if baseline_lst_override is not None
                else float(np.mean(baseline_lst))
            )
            mean_sim = mean_base + delta_t
        else:
            mean_base = (
                float(baseline_lst_override)
                if baseline_lst_override is not None
                else 34.5
            )
            delta_t = physics_delta
            mean_sim = mean_base + delta_t

        # Empirical cooling degree reduction to HVAC electricity consumption (kWh/m²/year)
        energy_reduction = max(0.0, abs(delta_t) * 4.79)

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        return {
            "mean_baseline_lst": mean_base,
            "mean_simulated_lst": mean_sim,
            "cooling_delta": delta_t,
            "energy_reduction_kwh_m2_yr": energy_reduction,
            "elapsed_ms": elapsed_ms,
        }
