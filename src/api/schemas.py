"""Pydantic request and response schemas for FastAPI microservice."""

from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class InterventionRequest(BaseModel):
    """Parameters for urban cooling scenario simulation."""
    ward_id: Optional[str] = Field(None, description="BMC ward identifier (e.g., 'G/North', 'M/East')")
    polygon_geojson: Optional[Dict] = Field(None, description="Custom drawn polygon GeoJSON geometry")
    delta_ndvi: float = Field(0.0, ge=-1.0, le=1.0, description="Canopy change delta (e.g. +0.20 for +20% tree canopy)")
    delta_albedo: float = Field(0.0, ge=-1.0, le=1.0, description="Surface albedo change (e.g. +0.30 for reflective cool roofs)")


class SimulationResponse(BaseModel):
    """Real-time simulation results computed in <= 1.5 seconds."""
    target: str = Field(..., description="Target ward or custom polygon identifier")
    mean_baseline_lst_celsius: float
    mean_simulated_lst_celsius: float
    cooling_delta_celsius: float
    cooling_energy_demand_reduction_kwh_m2_yr: float
    computation_time_ms: float
    shap_top_drivers: Dict[str, float]


class WardSummary(BaseModel):
    ward_id: str
    ward_name: str
    mean_lst_celsius: float
    vulnerability_index: float
    dominant_heat_driver: str
