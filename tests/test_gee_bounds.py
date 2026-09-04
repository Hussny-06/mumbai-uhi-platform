"""Unit tests for spatial bounding box and CRS configuration."""

import yaml
from pathlib import Path


def test_mumbai_bounding_box_validity():
    config_path = Path(__file__).parents[1] / "configs" / "config.yaml"
    assert config_path.exists(), "configs/config.yaml must exist."

    with open(config_path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)

    spatial = config.get("spatial", {})
    bbox = spatial.get("bounding_box", {})

    assert spatial.get("crs") == "EPSG:32643"
    assert bbox.get("min_lon") == 72.7753
    assert bbox.get("min_lat") == 18.8928
    assert bbox.get("max_lon") == 73.0024
    assert bbox.get("max_lat") == 19.2801

    # Verify positive area
    assert bbox["max_lon"] > bbox["min_lon"]
    assert bbox["max_lat"] > bbox["min_lat"]
