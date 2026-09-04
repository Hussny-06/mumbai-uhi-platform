"""Google Earth Engine (GEE) Ingestion Pipeline.

Author: Hussain (Lead Architecture & ML Downscaling)
Scope: Metropolitan Mumbai [72.7753°E, 18.8928°N to 73.0024°E, 19.2801°N]
CRS: EPSG:32643 (WGS 84 / UTM Zone 43N), 30m resolution.
"""

from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

MUMBAI_BBOX = [72.7753, 18.8928, 73.0024, 19.2801]


class GEEExtractor:
    """Handles automated extraction, cloud-masking, and preprocessing of

    multi-sensor satellite data streams for Metropolitan Mumbai via Google Earth Engine.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.bbox = self.config.get("spatial", {}).get(
            "bounding_box",
            {
                "min_lon": MUMBAI_BBOX[0],
                "min_lat": MUMBAI_BBOX[1],
                "max_lon": MUMBAI_BBOX[2],
                "max_lat": MUMBAI_BBOX[3],
            },
        )
        self._initialized = False

    def initialize_ee(self, project_id: Optional[str] = None) -> bool:
        """Initialize connection to Google Earth Engine."""
        try:
            import ee
            if project_id:
                ee.Initialize(project=project_id)
            else:
                ee.Initialize()
            self._initialized = True
            logger.info("Google Earth Engine initialized successfully.")
            return True
        except Exception as e:
            logger.warning(f"GEE Initialization notice: {e}")
            return False

    def mask_landsat_sr(self, image: Any) -> Any:
        """Mask clouds and cloud shadows in Landsat 8/9 Level-2 using QA_PIXEL.

        - Bit 1: Dilated Cloud
        - Bit 3: Cloud
        - Bit 4: Cloud Shadow
        """
        import ee
        qa = image.select("QA_PIXEL")
        dilated_cloud_mask = 1 << 1
        cloud_mask = 1 << 3
        cloud_shadow_mask = 1 << 4
        mask = (
            qa.bitwiseAnd(dilated_cloud_mask)
            .eq(0)
            .And(qa.bitwiseAnd(cloud_mask).eq(0))
            .And(qa.bitwiseAnd(cloud_shadow_mask).eq(0))
        )
        return image.updateMask(mask)

    def mask_sentinel_scl(self, image: Any) -> Any:
        """Mask cloud and cirrus in Sentinel-2 Level-2A using Scene Classification (SCL).

        Retains:
        - Class 4: Vegetation
        - Class 5: Bare Soils
        - Class 6: Water
        """
        scl = image.select("SCL")
        mask = scl.eq(4).Or(scl.eq(5)).Or(scl.eq(6))
        return image.updateMask(mask)

    def apply_landsat_radiometric_scaling(self, image: Any) -> Any:
        """Apply USGS Landsat Collection 2 Level-2 radiometric calibration equations:

        - Optical: ρ = DN * 0.0000275 - 0.2
        - Thermal (Band 10): T_B (Kelvin) = DN * 0.00341802 + 149.0
        """
        optical_bands = (
            image.select("SR_B.*").multiply(0.0000275).add(-0.2)
        )
        thermal_band = (
            image.select("ST_B10").multiply(0.00341802).add(149.0).rename("T_B")
        )
        return image.addBands(optical_bands, overwrite=True).addBands(thermal_band)
