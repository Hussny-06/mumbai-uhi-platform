"""Unit tests for spatial cross-validation buffer exclusion."""

import numpy as np
from src.models.spatial_kfold import SpatialBlockKFold


def test_spatial_buffer_isolation():
    # Synthetic grid points in UTM meters
    coords = np.array([
        [1000.0, 1000.0],
        [1500.0, 1500.0],  # Within 1.2km buffer of [1000, 1000]
        [5000.0, 5000.0],  # Well beyond 1.2km buffer
        [5200.0, 5200.0],
    ])

    splitter = SpatialBlockKFold(n_splits=2, buffer_distance_meters=1200.0)
    splits = list(splitter.split(coords))

    assert len(splits) > 0, "Splitter should yield folds"
    for train_idx, val_idx in splits:
        if len(train_idx) > 0 and len(val_idx) > 0:
            for v in val_idx:
                dists = np.linalg.norm(coords[train_idx] - coords[v], axis=1)
                assert np.all(dists >= 1200.0), "No training sample should be within 1.2km buffer of validation sample!"
