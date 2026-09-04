"""Google Earth Engine (GEE) Ingestion & Preprocessing Pipeline.

Author: Hussain (ML Downscaling & Backend Core)
Scope: Metropolitan Mumbai [72.7753°E, 18.8928°N to 73.0024°E, 19.2801°N]
CRS: EPSG:32643 (WGS 84 / UTM Zone 43N), 30m uniform grid spacing.
"""

from typing import Dict, Any, Optional, Tuple
import logging
import numpy as np

logger = logging.getLogger(__name__)

MUMBAI_BBOX = [72.7753, 18.8928, 73.0024, 19.2801]


class GEEExtractor:
    """Automated extraction, cloud-masking, radiometric calibration,

    and biophysical feature generation for Metropolitan Mumbai via Google Earth Engine.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        spatial = self.config.get("spatial", {})
        bbox = spatial.get("bounding_box", {})
        self.min_lon = bbox.get("min_lon", MUMBAI_BBOX[0])
        self.min_lat = bbox.get("min_lat", MUMBAI_BBOX[1])
        self.max_lon = bbox.get("max_lon", MUMBAI_BBOX[2])
        self.max_lat = bbox.get("max_lat", MUMBAI_BBOX[3])
        self.crs = spatial.get("crs", "EPSG:32643")
        self.resolution = spatial.get("target_resolution_meters", 30)
        self.ee = None
        self._is_authenticated = False

    def initialize_ee(self, project_id: Optional[str] = None) -> bool:
        """Initialize connection to Google Earth Engine."""
        try:
            import ee
            if project_id:
                ee.Initialize(project=project_id)
            else:
                ee.Initialize()
            self.ee = ee
            self._is_authenticated = True
            logger.info("Google Earth Engine initialized successfully.")
            return True
        except Exception as exc:
            logger.warning(
                f"GEE Initialization failed or not yet authenticated locally: {exc}. "
                "Offline simulation mode is available."
            )
            self._is_authenticated = False
            return False

    def get_mumbai_geometry(self) -> Any:
        """Create Earth Engine geometry polygon for Mumbai bounding box."""
        if not self.ee:
            raise RuntimeError("Earth Engine is not initialized.")
        return self.ee.Geometry.Rectangle(
            [self.min_lon, self.min_lat, self.max_lon, self.max_lat]
        )

    # -------------------------------------------------------------
    # Cloud & Shadow Masking (Document 4, Section 2.2.1)
    # -------------------------------------------------------------
    def mask_landsat_sr(self, image: Any) -> Any:
        """Mask clouds and cloud shadows in Landsat 8/9 Level-2 using QA_PIXEL bitmask:

        - Bit 1: Dilated Cloud
        - Bit 3: Cloud
        - Bit 4: Cloud Shadow
        """
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
        """Mask clouds, shadows, and cirrus in Sentinel-2 Level-2A using Scene Classification Layer (SCL).

        Retains:
        - Class 4: Vegetation
        - Class 5: Bare Soils
        - Class 6: Water
        """
        scl = image.select("SCL")
        mask = scl.eq(4).Or(scl.eq(5)).Or(scl.eq(6))
        return image.updateMask(mask)

    # -------------------------------------------------------------
    # Radiometric Calibration & Scaling (Document 4, Section 2.2.2)
    # -------------------------------------------------------------
    def apply_landsat_radiometric_scaling(self, image: Any) -> Any:
        """Applies USGS Landsat Collection 2 Level-2 scaling:

        - Optical surface reflectance: ρ = DN * 0.0000275 - 0.2
        - Thermal surface temperature: T_B (Kelvin) = DN * 0.00341802 + 149.0
        """
        optical_bands = (
            image.select("SR_B.*").multiply(0.0000275).add(-0.2)
        )
        thermal_band = (
            image.select("ST_B10").multiply(0.00341802).add(149.0).rename("T_B")
        )
        return image.addBands(optical_bands, overwrite=True).addBands(thermal_band)

    # -------------------------------------------------------------
    # Biophysical Indices & Planck True LST (Document 4, Section 2.2.3-4)
    # -------------------------------------------------------------
    def compute_spectral_indices_ee(self, image: Any) -> Any:
        """Calculates NDVI, NDBI, MNDWI, Albedo, Fv, Emissivity, and True LST (°C)

        directly inside Google Earth Engine.
        """
        # NDVI = (NIR - Red) / (NIR + Red) -> SR_B5, SR_B4
        ndvi = image.normalizedDifference(["SR_B5", "SR_B4"]).rename("NDVI")

        # NDBI = (SWIR1 - NIR) / (SWIR1 + NIR) -> SR_B6, SR_B5
        ndbi = image.normalizedDifference(["SR_B6", "SR_B5"]).rename("NDBI")

        # MNDWI = (Green - SWIR1) / (Green + SWIR1) -> SR_B3, SR_B6
        mndwi = image.normalizedDifference(["SR_B3", "SR_B6"]).rename("MNDWI")

        # Broadband Albedo (α)
        # α = 0.356*Blue + 0.130*Red + 0.373*NIR + 0.085*SWIR1 + 0.072*SWIR2 - 0.0018
        b_blue = image.select("SR_B2")
        b_red = image.select("SR_B4")
        b_nir = image.select("SR_B5")
        b_swir1 = image.select("SR_B6")
        b_swir2 = image.select("SR_B7")

        albedo = (
            b_blue.multiply(0.356)
            .add(b_red.multiply(0.130))
            .add(b_nir.multiply(0.373))
            .add(b_swir1.multiply(0.085))
            .add(b_swir2.multiply(0.072))
            .subtract(0.0018)
            .rename("Albedo")
        )

        # Fractional Vegetation Cover: F_v = ((NDVI - 0.05)/(0.70 - 0.05))^2
        fv = ndvi.subtract(0.05).divide(0.65).clamp(0.0, 1.0).pow(2).rename("F_v")

        # Land Surface Emissivity (ε): ε = 0.985*F_v + 0.960*(1 - F_v) + 0.005
        emissivity = (
            fv.multiply(0.985)
            .add(fv.multiply(-1).add(1).multiply(0.960))
            .add(0.005)
            .rename("Emissivity")
        )

        # True LST in Celsius via Planck Radiative Transfer:
        # LST = ( T_B / (1 + (10.895 * T_B / 14380) * ln(ε)) ) - 273.15
        tb = image.select("T_B")
        lambda_val = 10.895
        c2_val = 14380.0
        ln_eps = emissivity.log()

        lst_kelvin = tb.divide(
            tb.multiply(lambda_val / c2_val).multiply(ln_eps).add(1.0)
        )
        lst_celsius = lst_kelvin.subtract(273.15).rename("LST_Celsius")

        return image.addBands(
            [ndvi, ndbi, mndwi, albedo, fv, emissivity, lst_celsius]
        )

    def fetch_mumbai_composite(
        self, start_date: str = "2024-03-01", end_date: str = "2024-05-31"
    ) -> Any:
        """Queries Landsat 8/9 Tier 1 Level-2 for pre-monsoon peak heat season,

        masks clouds, calibrates radiometry, and computes spectral indices.
        """
        if not self.ee:
            raise RuntimeError("Earth Engine is not initialized.")

        geometry = self.get_mumbai_geometry()

        collection = (
            self.ee.ImageCollection("LANDSAT/LC09/C02/T1_L2")
            .merge(self.ee.ImageCollection("LANDSAT/LC08/C02/T1_L2"))
            .filterBounds(geometry)
            .filterDate(start_date, end_date)
            .filter(self.ee.Filter.lt("CLOUD_COVER", 20))
            .map(self.mask_landsat_sr)
            .map(self.apply_landsat_radiometric_scaling)
            .map(self.compute_spectral_indices_ee)
        )

        composite = collection.median().clip(geometry)
        return composite
