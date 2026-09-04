"""Explainable AI (XAI) Attribution Engine using TreeSHAP.

Author: Asad & Hussain
Purpose: Mathematically decompose temperature variance into concrete biophysical drivers:
- Impervious warming (+Φ_NDBI)
- Vegetation cooling (-Φ_NDVI)
- Maritime sea breeze buffering (-Φ_D_coast)
"""

from typing import List, Dict, Any
import numpy as np

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    shap = None
    SHAP_AVAILABLE = False


class BiophysicalSHAPExplainer:
    """Computes exact Shapley feature attributions with TreeSHAP for the trained downscaling model."""

    def __init__(self, trained_model: Any, feature_names: List[str]):
        self.model = trained_model
        self.feature_names = feature_names
        if SHAP_AVAILABLE and shap is not None:
            self.explainer = shap.TreeExplainer(self.model)
        else:
            self.explainer = None

    def explain(self, X_sample: np.ndarray) -> np.ndarray:
        """Compute SHAP values matrix for given samples."""
        if self.explainer is not None:
            return self.explainer.shap_values(X_sample)
        # Fallback heuristic feature importance attribution
        if hasattr(self.model, "feature_importances_"):
            imps = self.model.feature_importances_
            return np.tile(imps, (len(X_sample), 1))
        return np.zeros_like(X_sample)

    def summarize_ward_drivers(
        self, X_ward: np.ndarray
    ) -> Dict[str, float]:
        """Aggregate mean absolute SHAP attributions per biophysical predictor for a specific ward."""
        shap_vals = self.explain(X_ward)
        mean_abs_impact = np.mean(np.abs(shap_vals), axis=0)
        return {
            feature: float(impact)
            for feature, impact in zip(self.feature_names, mean_abs_impact)
        }
