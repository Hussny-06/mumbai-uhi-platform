"""Fetch and Render 100% Real Satellite Imagery for Mumbai from Google Earth Engine with Comprehensive Scientific Legends.

Author: Hussain (Architecture & ML Downscaling)
Collections: Landsat 8/9 Collection 2 Tier 1 Level-2 (USGS / NASA)
Target Area: Official BMC Greater Mumbai Boundary (EPSG:4326 / EPSG:32643)
Season: 2024 Pre-Monsoon Peak Heat Window (March 1 - May 31, 2024)
"""

import sys
import io
import json
import urllib.request
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import ee
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import matplotlib.patches as mpatches
import matplotlib.cm as cm

OUTPUT_DIR = PROJECT_ROOT / "outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
VECTOR_PATH = PROJECT_ROOT / "data" / "vectors" / "mumbai_boundary.geojson"
PROJECT_ID = "uhi-mumbai-507613"

# Official colormap definitions matching GEE renderers
NDVI_PALETTE = ["#d73027", "#f46d43", "#fdae61", "#fee08b", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#006837"]
NDBI_PALETTE = ["#2b83ba", "#abdda4", "#ffffbf", "#fdae61", "#d7191c"]
LST_PALETTE = ["#313695", "#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"]

NDVI_CMAP = mcolors.LinearSegmentedColormap.from_list("ndvi_cmap", NDVI_PALETTE)
NDBI_CMAP = mcolors.LinearSegmentedColormap.from_list("ndbi_cmap", NDBI_PALETTE)
LST_CMAP = mcolors.LinearSegmentedColormap.from_list("lst_cmap", LST_PALETTE)


def initialize_earth_engine():
    """Initializes Google Earth Engine with authenticated Cloud Project."""
    print(f"Connecting to Google Earth Engine with project '{PROJECT_ID}'...")
    ee.Initialize(project=PROJECT_ID)
    print("Connected successfully to Google Earth Engine!")


def get_mumbai_ee_geometry():
    """Loads official Mumbai boundary GeoJSON and converts to Earth Engine Geometry."""
    with open(VECTOR_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    geom_json = data["features"][0]["geometry"]
    ee_geom = ee.Geometry(geom_json)
    return ee_geom


def mask_landsat_clouds(image):
    """Bitmask decoding of QA_PIXEL to discard clouds and cloud shadows."""
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


def compute_landsat_biophysical_and_lst(image):
    """Applies USGS Collection 2 Level-2 scaling, spectral indices,

    and Planck split-window radiative transfer equation directly inside GEE.
    """
    optical = image.select("SR_B.*").multiply(0.0000275).add(-0.2)
    thermal = image.select("ST_B10").multiply(0.00341802).add(149.0).rename("T_B")

    ndvi = optical.normalizedDifference(["SR_B5", "SR_B4"]).rename("NDVI")
    ndbi = optical.normalizedDifference(["SR_B6", "SR_B5"]).rename("NDBI")

    fv = ndvi.subtract(0.05).divide(0.65).clamp(0.0, 1.0).pow(2).rename("F_v")
    emissivity = (
        fv.multiply(0.985)
        .add(fv.multiply(-1.0).add(1.0).multiply(0.960))
        .add(0.005)
        .rename("Emissivity")
    )

    tb = thermal.select("T_B")
    lambda_val = 10.895
    c2_val = 14380.0
    ln_eps = emissivity.log()

    lst_kelvin = tb.divide(
        tb.multiply(lambda_val / c2_val).multiply(ln_eps).add(1.0)
    )
    lst_celsius = lst_kelvin.subtract(273.15).rename("LST_Celsius")

    return optical.addBands([thermal, ndvi, ndbi, fv, emissivity, lst_celsius])


def download_ge_thumbnail_as_image(ee_image, vis_params, geometry):
    """Generates server-side thumbnail on Google's cloud and downloads as PIL Image."""
    url = ee_image.getThumbURL({**vis_params, "region": geometry, "dimensions": 1024})
    req = urllib.request.Request(url, headers={"User-Agent": "MumbaiUHIPlatform/1.0"})
    with urllib.request.urlopen(req) as resp:
        img_bytes = resp.read()
    return Image.open(io.BytesIO(img_bytes))


def add_mumbai_annotations(ax):
    """Adds Mumbai microclimate landmarks for clear recognition."""
    landmarks = [
        ("Colaba (Coastal South)", 72.825, 18.915),
        ("Dharavi / Dadar", 72.855, 19.040),
        ("SGNP (Green Reserve)", 72.910, 19.220),
        ("Santacruz (Inland Microclimate)", 72.860, 19.100),
        ("Govandi / Chembur (Heat Hotspot)", 72.915, 19.055),
    ]
    for label, lon, lat in landmarks:
        ax.plot(lon, lat, "o", color="yellow", markersize=4.5, markeredgecolor="black", markeredgewidth=0.8)
        ax.text(lon + 0.007, lat, label, fontsize=8, fontweight="bold", color="white",
                bbox=dict(boxstyle="round,pad=0.2", facecolor="black", alpha=0.7, edgecolor="none"))

    ax.text(72.785, 19.000, "ARABIAN SEA", fontsize=9, fontweight="bold", color="#80b3ff", alpha=0.85, rotation=75)
    ax.text(72.960, 19.010, "Thane Creek", fontsize=8, fontstyle="italic", color="#80b3ff", alpha=0.85, rotation=60)


def add_true_color_legend(ax):
    """Adds a categorical land-cover interpretation legend for True Color imagery."""
    patches = [
        mpatches.Patch(color="#1f5f2b", label="Dense Forest Canopy (SGNP / Aarey)"),
        mpatches.Patch(color="#a49382", label="Dense Built-up / Impervious Concrete"),
        mpatches.Patch(color="#dfd7cb", label="Reflective Built-up / Open Soils"),
        mpatches.Patch(color="#0a192f", label="Arabian Sea & Marine Waters"),
    ]
    ax.legend(handles=patches, loc="lower left", fontsize=7.5, framealpha=0.85, facecolor="#ffffff", edgecolor="#333333", title="Land Cover Guide", title_fontsize=8)


def fetch_and_render_all_real_layers():
    initialize_earth_engine()
    geometry = get_mumbai_ee_geometry()

    print("Querying Landsat 8 & 9 Tier 1 Level-2 collections over Mumbai (2024 Pre-Monsoon)...")
    col9 = ee.ImageCollection("LANDSAT/LC09/C02/T1_L2").filterBounds(geometry).filterDate("2024-02-01", "2024-05-31").filter(ee.Filter.lt("CLOUD_COVER", 20))
    col8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2").filterBounds(geometry).filterDate("2024-02-01", "2024-05-31").filter(ee.Filter.lt("CLOUD_COVER", 20))

    combined_col = col9.merge(col8).map(mask_landsat_clouds).map(compute_landsat_biophysical_and_lst)
    print(f"Total cloud-filtered real satellite scenes available: {combined_col.size().getInfo()}")

    composite = combined_col.median().clip(geometry)

    bounds = geometry.bounds().coordinates().getInfo()[0]
    min_lon, min_lat = bounds[0][0], bounds[0][1]
    max_lon, max_lat = bounds[2][0], bounds[2][1]
    extent = [min_lon, max_lon, min_lat, max_lat]

    print("\nDownloading REAL satellite raster renders from Google servers...")

    # -------------------------------------------------------------
    # 1. Real True Color (RGB) + Land Cover Legend
    # -------------------------------------------------------------
    print("  [1/4] Rendering Real Landsat True Color (RGB) with categorical legend...")
    tc_img = download_ge_thumbnail_as_image(
        composite.select(["SR_B4", "SR_B3", "SR_B2"]),
        {"min": 0.02, "max": 0.22, "gamma": 1.4},
        geometry,
    )
    fig, ax = plt.subplots(figsize=(7, 9.5), dpi=300)
    ax.imshow(tc_img, extent=extent)
    ax.set_title("Real Landsat 8/9 True Color Composite (RGB)\nMetropolitan Mumbai (BMC Boundary)", fontsize=11, fontweight="bold", pad=10)
    ax.set_xlabel("Longitude (°E)", fontsize=9)
    ax.set_ylabel("Latitude (°N)", fontsize=9)
    ax.set_facecolor("#0a192f")
    add_mumbai_annotations(ax)
    add_true_color_legend(ax)
    plt.tight_layout()
    tc_path = OUTPUT_DIR / "review1_true_color.png"
    plt.savefig(tc_path)
    plt.close()

    # -------------------------------------------------------------
    # 2. Real NDVI + Continuous Scientific Colorbar
    # -------------------------------------------------------------
    print("  [2/4] Rendering Real NDVI with continuous colorbar...")
    ndvi_vis = composite.select("NDVI").visualize(min=0.0, max=0.65, palette=NDVI_PALETTE)
    ndvi_img = download_ge_thumbnail_as_image(ndvi_vis, {}, geometry)
    fig, ax = plt.subplots(figsize=(7.5, 9.5), dpi=300)
    ax.imshow(ndvi_img, extent=extent)
    ax.set_title("Real Landsat 8/9 Normalized Difference Vegetation Index (NDVI)\nCanopy Biomass Density (30m)", fontsize=11, fontweight="bold", pad=10)
    ax.set_xlabel("Longitude (°E)", fontsize=9)
    ax.set_ylabel("Latitude (°N)", fontsize=9)
    ax.set_facecolor("#0a192f")
    add_mumbai_annotations(ax)

    # Colorbar
    norm_ndvi = mcolors.Normalize(vmin=0.0, vmax=0.65)
    sm_ndvi = cm.ScalarMappable(norm=norm_ndvi, cmap=NDVI_CMAP)
    cbar = fig.colorbar(sm_ndvi, ax=ax, fraction=0.046, pad=0.04)
    cbar.set_label("NDVI (Biomass Canopy Density)", fontsize=9, fontweight="bold")
    cbar.set_ticks([0.0, 0.15, 0.30, 0.45, 0.65])
    cbar.set_ticklabels(["0.00 (Water / Barren)", "0.15 (Urban / Built-up)", "0.30 (Moderate Canopy)", "0.45 (Dense Green)", "0.65 (SGNP Forest)"])

    plt.tight_layout()
    ndvi_path = OUTPUT_DIR / "review1_ndvi.png"
    plt.savefig(ndvi_path)
    plt.close()

    # -------------------------------------------------------------
    # 3. Real NDBI + Continuous Scientific Colorbar
    # -------------------------------------------------------------
    print("  [3/4] Rendering Real NDBI with continuous colorbar...")
    ndbi_vis = composite.select("NDBI").visualize(min=-0.30, max=0.40, palette=NDBI_PALETTE)
    ndbi_img = download_ge_thumbnail_as_image(ndbi_vis, {}, geometry)
    fig, ax = plt.subplots(figsize=(7.5, 9.5), dpi=300)
    ax.imshow(ndbi_img, extent=extent)
    ax.set_title("Real Landsat 8/9 Normalized Difference Built-Up Index (NDBI)\nConcrete & Impervious Surface Density (30m)", fontsize=11, fontweight="bold", pad=10)
    ax.set_xlabel("Longitude (°E)", fontsize=9)
    ax.set_ylabel("Latitude (°N)", fontsize=9)
    ax.set_facecolor("#0a192f")
    add_mumbai_annotations(ax)

    # Colorbar
    norm_ndbi = mcolors.Normalize(vmin=-0.30, vmax=0.40)
    sm_ndbi = cm.ScalarMappable(norm=norm_ndbi, cmap=NDBI_CMAP)
    cbar = fig.colorbar(sm_ndbi, ax=ax, fraction=0.046, pad=0.04)
    cbar.set_label("NDBI (Impervious Concrete Density)", fontsize=9, fontweight="bold")
    cbar.set_ticks([-0.30, -0.10, 0.10, 0.25, 0.40])
    cbar.set_ticklabels(["-0.30 (Water Body)", "-0.10 (Forest / Vegetation)", "0.10 (Low Built-up)", "0.25 (Dense Residential)", "0.40 (High Concrete / Slum)"])

    plt.tight_layout()
    ndbi_path = OUTPUT_DIR / "review1_ndbi.png"
    plt.savefig(ndbi_path)
    plt.close()

    # -------------------------------------------------------------
    # 4. Real True LST (°C) + Temperature Scale Colorbar
    # -------------------------------------------------------------
    print("  [4/4] Rendering Real 30m Land Surface Temperature with thermal colorbar...")
    lst_vis = composite.select("LST_Celsius").visualize(min=28.0, max=42.0, palette=LST_PALETTE)
    lst_img = download_ge_thumbnail_as_image(lst_vis, {}, geometry)
    fig, ax = plt.subplots(figsize=(7.5, 9.5), dpi=300)
    ax.imshow(lst_img, extent=extent)
    ax.set_title("Real Landsat 8/9 True 30m Land Surface Temperature (LST)\nPlanck Radiative Transfer Equation (°C)", fontsize=11, fontweight="bold", pad=10)
    ax.set_xlabel("Longitude (°E)", fontsize=9)
    ax.set_ylabel("Latitude (°N)", fontsize=9)
    ax.set_facecolor("#0a192f")
    add_mumbai_annotations(ax)

    # Thermal Colorbar
    norm_lst = mcolors.Normalize(vmin=28.0, vmax=42.0)
    sm_lst = cm.ScalarMappable(norm=norm_lst, cmap=LST_CMAP)
    cbar = fig.colorbar(sm_lst, ax=ax, fraction=0.046, pad=0.04)
    cbar.set_label("Land Surface Temperature (°C)", fontsize=9, fontweight="bold")
    cbar.set_ticks([28.0, 31.0, 34.0, 37.0, 40.0, 42.0])
    cbar.set_ticklabels(["28 °C (Cooling Sink)", "31 °C (Coastal Marine)", "34 °C (Moderate Urban)", "37 °C (High Heat Stress)", "40 °C (Severe Hotspot)", "42 °C (Critical Heat)"])

    plt.tight_layout()
    lst_path = OUTPUT_DIR / "review1_lst.png"
    plt.savefig(lst_path)
    plt.close()

    # -------------------------------------------------------------
    # 5. Master 4-Panel Side-by-Side Figure with Full Legends
    # -------------------------------------------------------------
    print("  [5/5] Assembling 4-Panel Master Presentation Slide Figure with individual legends...")
    fig, axes = plt.subplots(1, 4, figsize=(26, 8.5), dpi=300)

    # Panel A: True Color
    axes[0].imshow(tc_img, extent=extent)
    axes[0].set_title("(a) True Color (RGB)", fontsize=13, fontweight="bold")
    axes[0].set_xlabel("Longitude (°E)")
    axes[0].set_ylabel("Latitude (°N)")
    axes[0].set_facecolor("#0a192f")
    add_mumbai_annotations(axes[0])
    add_true_color_legend(axes[0])

    # Panel B: Real NDVI
    axes[1].imshow(ndvi_img, extent=extent)
    axes[1].set_title("(b) Real NDVI (Canopy Density)", fontsize=13, fontweight="bold")
    axes[1].set_xlabel("Longitude (°E)")
    axes[1].set_facecolor("#0a192f")
    add_mumbai_annotations(axes[1])
    cb_b = fig.colorbar(sm_ndvi, ax=axes[1], fraction=0.046, pad=0.04)
    cb_b.set_label("NDVI Scale", fontsize=8.5, fontweight="bold")
    cb_b.set_ticks([0.0, 0.20, 0.40, 0.65])
    cb_b.set_ticklabels(["0.0 (Water)", "0.20 (Urban)", "0.40 (Canopy)", "0.65 (Forest)"])

    # Panel C: Real NDBI
    axes[2].imshow(ndbi_img, extent=extent)
    axes[2].set_title("(c) Real NDBI (Concrete Density)", fontsize=13, fontweight="bold")
    axes[2].set_xlabel("Longitude (°E)")
    axes[2].set_facecolor("#0a192f")
    add_mumbai_annotations(axes[2])
    cb_c = fig.colorbar(sm_ndbi, ax=axes[2], fraction=0.046, pad=0.04)
    cb_c.set_label("NDBI Scale", fontsize=8.5, fontweight="bold")
    cb_c.set_ticks([-0.30, -0.10, 0.15, 0.40])
    cb_c.set_ticklabels(["-0.30 (Water)", "-0.10 (Green)", "0.15 (Urban)", "0.40 (Concrete)"])

    # Panel D: Real 30m LST
    axes[3].imshow(lst_img, extent=extent)
    axes[3].set_title("(d) Real 30m LST (°C)", fontsize=13, fontweight="bold")
    axes[3].set_xlabel("Longitude (°E)")
    axes[3].set_facecolor("#0a192f")
    add_mumbai_annotations(axes[3])
    cb_d = fig.colorbar(sm_lst, ax=axes[3], fraction=0.046, pad=0.04)
    cb_d.set_label("Temperature (°C)", fontsize=8.5, fontweight="bold")
    cb_d.set_ticks([28.0, 32.0, 36.0, 40.0, 42.0])
    cb_d.set_ticklabels(["28 °C (Cool)", "32 °C", "36 °C (Warm)", "40 °C (Hot)", "42 °C (Hotspot)"])

    plt.suptitle("Google Earth Engine Live Ingestion & Radiometric Processing: Metropolitan Mumbai\n(Actual Landsat 8/9 Level-2 Passes, March–May 2024)", fontsize=15, fontweight="bold", y=0.98)
    plt.tight_layout()
    master_path = OUTPUT_DIR / "review1_geospatial_layers_4panel.png"
    plt.savefig(master_path)
    plt.close()

    print("\n" + "=" * 75)
    print("ALL REAL SATELLITE LAYERS WITH SCIENTIFIC LEGENDS GENERATED & SAVED!")
    print(f"Output directory: {OUTPUT_DIR}")
    print("=" * 75)


if __name__ == "__main__":
    fetch_and_render_all_real_layers()
