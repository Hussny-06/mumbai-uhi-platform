"""XGBoost 30-Meter Land Surface Temperature (LST) Downscaling Regressor.

Author: Hussain (Lead Architecture & ML Downscaling)
Acceptance Criteria: RMSE <= 1.5°C, R² >= 0.85 on spatial test holdouts.
"""

from typing import Dict, Any, Optional
import numpy as np
from sklearn.metrics import mean_squared_error, r2_score
import xgboost as xgb


class LSTDownscalerXGB:
    """Trains and executes gradient-boosted decision trees to downscale coarse satellite

    thermal radiometry to 30m grid spacing using 17 biophysical & meteorological predictors.
    """

    def __init__(self, params: Optional[Dict[str, Any]] = None):
        default_params = {
            "n_estimators": 500,
            "max_depth": 6,
            "learning_rate": 0.05,
            "subsample": 0.8,
            "colsample_bytree": 0.8,
            "random_state": 42,
            "n_jobs": -1,
        }
        if params:
            default_params.update(params)
        self.model = xgb.XGBRegressor(**default_params)
        self.is_trained = False

    def train(self, X_train: np.ndarray, y_train: np.ndarray) -> None:
        """Fit the gradient boosting regressor on the 17-dimensional training matrix."""
        self.model.fit(X_train, y_train)
        self.is_trained = True

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predict 30m LST."""
        if not self.is_trained:
            raise RuntimeError("Model has not been trained yet.")
        return self.model.predict(X)

    def evaluate(
        self, X_test: np.ndarray, y_test: np.ndarray
    ) -> Dict[str, float]:
        """Compute RMSE and R² against spatial holdout ground truth."""
        preds = self.predict(X_test)
        rmse = float(np.sqrt(mean_squared_error(y_test, preds)))
        r2 = float(r2_score(y_test, preds))
        return {
            "rmse": rmse,
            "r2": r2,
            "passes_acceptance": bool(rmse <= 1.5 and r2 >= 0.85),
        }
