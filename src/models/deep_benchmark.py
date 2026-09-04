"""Spatiotemporal CNN-LSTM Deep Learning Benchmark Model for LST Prediction.

Author: Hussain (Lead Architecture & ML Downscaling)
Purpose: Academic deep learning benchmark to evaluate against gradient boosted decision trees (XGBoost/RF).
"""

from typing import Tuple, Optional
import numpy as np

try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False


if TORCH_AVAILABLE:
    class SpatioTemporalCNNLSTM(nn.Module):
        """Spatiotemporal deep neural network combining 2D CNN feature extraction

        with LSTM sequential temporal dynamics for microclimate LST forecasting.
        """

        def __init__(
            self,
            in_channels: int = 17,
            cnn_hidden_dim: int = 64,
            lstm_hidden_dim: int = 128,
            num_lstm_layers: int = 2,
            output_dim: int = 1,
        ):
            super().__init__()
            # Spatial 2D CNN feature extractor
            self.cnn = nn.Sequential(
                nn.Conv2d(in_channels, cnn_hidden_dim, kernel_size=3, padding=1),
                nn.BatchNorm2d(cnn_hidden_dim),
                nn.ReLU(),
                nn.Conv2d(cnn_hidden_dim, cnn_hidden_dim * 2, kernel_size=3, padding=1),
                nn.BatchNorm2d(cnn_hidden_dim * 2),
                nn.ReLU(),
                nn.AdaptiveAvgPool2d((4, 4)),
            )

            # Flattened feature dimension into LSTM
            self.flatten_dim = (cnn_hidden_dim * 2) * 4 * 4
            self.fc_proj = nn.Linear(self.flatten_dim, cnn_hidden_dim)

            # Temporal sequence processor
            self.lstm = nn.LSTM(
                input_size=cnn_hidden_dim,
                hidden_size=lstm_hidden_dim,
                num_layers=num_lstm_layers,
                batch_first=True,
                dropout=0.2 if num_lstm_layers > 1 else 0.0,
            )

            # Regressor head
            self.regressor = nn.Sequential(
                nn.Linear(lstm_hidden_dim, 64),
                nn.ReLU(),
                nn.Linear(64, output_dim),
            )

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            """x shape: (batch_size, seq_len, in_channels, height, width)"""
            b, seq_len, c, h, w = x.shape
            # Reshape to process each timestep through CNN
            x_reshaped = x.view(b * seq_len, c, h, w)
            cnn_feats = self.cnn(x_reshaped)
            flat_feats = cnn_feats.view(b * seq_len, -1)
            projected = self.fc_proj(flat_feats)
            lstm_in = projected.view(b, seq_len, -1)

            lstm_out, _ = self.lstm(lstm_in)
            last_timestep = lstm_out[:, -1, :]
            out = self.regressor(last_timestep)
            return out

else:
    class SpatioTemporalCNNLSTM:
        """Fallback mock class when PyTorch is not installed locally."""
        def __init__(self, *args, **kwargs):
            pass

        def forward(self, x):
            raise NotImplementedError("PyTorch is required to run SpatioTemporalCNNLSTM.")
