"""Pydantic request and response schemas for FastAPI microservice."""

from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class InterventionRequest(BaseModel):
    """Parameters for urban cooling scenario simulation."""
    ward_id: Optional[str] = Field(None, description="BMC ward identifier (e.g., 'G/N', 'M/E')")
    polygon_geojson: Optional[Dict] = Field(None, description="Custom drawn polygon GeoJSON geometry")
    polygon_area_km2: Optional[float] = Field(None, ge=0.0, description="Custom polygon area in km²")
    delta_ndvi: float = Field(0.0, ge=-1.0, le=1.0, description="Canopy change delta (e.g. +0.20 for +20% tree canopy)")
    delta_albedo: float = Field(0.0, ge=-1.0, le=1.0, description="Surface albedo change (e.g. +0.30 for reflective cool roofs)")
    delta_ndbi: float = Field(0.0, ge=-1.0, le=1.0, description="Built-up impervious change (e.g. -0.15 for depaving)")


class SimulationResponse(BaseModel):
    """Real-time simulation results computed in <= 1.5 seconds."""
    target: str = Field(..., description="Target ward or custom polygon identifier")
    mean_baseline_lst_celsius: float
    mean_simulated_lst_celsius: float
    cooling_delta_celsius: float
    cooling_energy_demand_reduction_kwh_m2_yr: float
    computation_time_ms: float
    shap_top_drivers: Dict[str, float]
    num_pixels: int = Field(500, description="Number of 30m grid cells evaluated")


class WardSummary(BaseModel):
    ward_id: str
    ward_name: str
    mean_lst_celsius: float
    vulnerability_index: float
    dominant_heat_driver: str
    zone: Optional[str] = None
    ndvi: Optional[float] = None
    ndbi: Optional[float] = None
    albedo: Optional[float] = None
    uhi_intensity: Optional[float] = None
    risk_level: Optional[str] = None
