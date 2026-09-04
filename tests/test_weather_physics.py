"""Unit tests for meteorological physics transformations."""

import numpy as np
from src.features.weather_physics import WeatherPhysicsTransformer


def test_wind_vector_decomposition_cardinals():
    # Test cardinal directions (speed = 10 m/s)
    # 0 deg (North wind blowing southward) -> u = 0, v = -10
    # 90 deg (East wind blowing westward) -> u = -10, v = 0
    # 180 deg (South wind blowing northward) -> u = 0, v = 10
    # 270 deg (West wind blowing eastward) -> u = 10, v = 0

    speeds = np.array([10.0, 10.0, 10.0, 10.0])
    dirs = np.array([0.0, 90.0, 180.0, 270.0])

    u, v = WeatherPhysicsTransformer.decompose_wind_vectors(speeds, dirs)

    np.testing.assert_allclose(u, [0.0, -10.0, 0.0, 10.0], atol=1e-5)
    np.testing.assert_allclose(v, [-10.0, 0.0, 10.0, 0.0], atol=1e-5)


def test_vapor_pressure_deficit_non_negative():
    t_dry = np.array([30.0, 35.0, 25.0])
    rh = np.array([70.0, 50.0, 90.0])

    vpd = WeatherPhysicsTransformer.compute_vapor_pressure_deficit(t_dry, rh)

    assert np.all(vpd >= 0.0), "VPD must strictly be non-negative"
    # Higher temperature and lower RH should yield higher VPD (higher drying power)
    assert vpd[1] > vpd[0]
