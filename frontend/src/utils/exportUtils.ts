import { Ward, PolicyScenario, SimulationResult } from '../types';

function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export a single BMC Ward's microclimate profile and intervention dossier as CSV.
 */
export function exportWardCsv(
  ward: Ward,
  scenario: PolicyScenario,
  epoch = 'Pre-Monsoon 2024'
): void {
  const safeId = ward.id.replace('/', '-');
  const headers = [
    'Ward_ID',
    'Ward_Name',
    'Zone',
    'Epoch',
    'Area_km2',
    'Pop_Density_km2',
    'Mean_LST_C',
    'UHI_Delta_C',
    'NDVI',
    'NDBI',
    'MNDWI',
    'Albedo',
    'Elevation_m',
    'Dist_Coast_km',
    'Risk_Class',
    'Scenario_Name',
    'Predicted_Cooling_C',
    'Post_Intervention_LST_C',
    'Energy_Saving_kWh_m2_yr',
  ];

  const row = [
    `"${ward.id}"`,
    `"${ward.name}"`,
    `"${ward.zone}"`,
    `"${epoch}"`,
    ward.area.toFixed(2),
    ward.popDensity,
    ward.meanLst.toFixed(2),
    ward.uhi.toFixed(2),
    ward.ndvi.toFixed(3),
    ward.ndbi.toFixed(3),
    ward.mndwi.toFixed(3),
    ward.albedo.toFixed(3),
    ward.elev.toFixed(1),
    ward.distCoast.toFixed(2),
    `"${ward.risk}"`,
    `"${scenario.name}"`,
    scenario.expectedCooling.toFixed(2),
    (ward.meanLst + scenario.expectedCooling).toFixed(2),
    scenario.expectedEnergySaving.toFixed(2),
  ];

  const csvContent = `${headers.join(',')}\n${row.join(',')}\n`;
  triggerDownload(csvContent, `BMC_UHI_Dossier_Ward_${safeId}_2024.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Export all 24 BMC Wards microclimate registry as CSV.
 */
export function exportAllWardsCsv(wards: Ward[], epoch = 'Pre-Monsoon 2024'): void {
  const headers = [
    'Ward_ID',
    'Ward_Name',
    'Zone',
    'Epoch',
    'Mean_LST_C',
    'UHI_Delta_C',
    'NDVI',
    'NDBI',
    'Albedo',
    'MNDWI',
    'Elevation_m',
    'Area_km2',
    'Pop_Density_km2',
    'Risk_Class',
    'Dominant_Driver',
  ];

  const rows = wards.map((w) =>
    [
      `"${w.id}"`,
      `"${w.name}"`,
      `"${w.zone}"`,
      `"${epoch}"`,
      w.meanLst.toFixed(2),
      w.uhi.toFixed(2),
      w.ndvi.toFixed(3),
      w.ndbi.toFixed(3),
      w.albedo.toFixed(3),
      w.mndwi.toFixed(3),
      w.elev.toFixed(1),
      w.area.toFixed(2),
      w.popDensity,
      `"${w.risk}"`,
      `"${w.driver}"`,
    ].join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  triggerDownload(csvContent, `Mumbai_24_Wards_UHI_Registry.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Export structured BMC Municipal Policy Dossier as JSON.
 */
export function exportDossierJson(
  ward: Ward,
  scenario: PolicyScenario,
  epoch = 'Pre-Monsoon 2024',
  simulationResult?: SimulationResult | null
): void {
  const safeId = ward.id.replace('/', '-');
  const payload = {
    dossierId: `BMC-UHI-${safeId}-2024`,
    generatedAt: new Date().toISOString(),
    authority: 'Brihanmumbai Municipal Corporation (BMC) — Climate Action Cell',
    crs: 'EPSG:32643 (UTM Zone 43N)',
    spatialResolutionMeters: 30,
    epoch,
    wardProfile: {
      id: ward.id,
      name: ward.name,
      zone: ward.zone,
      areaKm2: ward.area,
      populationDensityKm2: ward.popDensity,
      coordinates: { lat: ward.lat, lon: ward.lon },
      baselineMeanLstCelsius: ward.meanLst,
      uhiAnomalyCelsius: ward.uhi,
      riskClassification: ward.risk,
      biophysicalIndices: {
        ndvi: ward.ndvi,
        ndbi: ward.ndbi,
        mndwi: ward.mndwi,
        albedo: ward.albedo,
        elevationMeters: ward.elev,
        distanceCoastKm: ward.distCoast,
      },
      localTreeShapDrivers: ward.shapDrivers,
    },
    mitigationScenario: {
      id: scenario.id,
      name: scenario.name,
      description: scenario.description,
      perturbations: {
        deltaNdvi: scenario.deltaNdvi,
        deltaAlbedo: scenario.deltaAlbedo,
        deltaNdbi: scenario.deltaNdbi,
      },
      expectedCoolingCelsius: simulationResult?.coolingDelta ?? scenario.expectedCooling,
      targetPostInterventionLstCelsius: Number(
        (ward.meanLst + (simulationResult?.coolingDelta ?? scenario.expectedCooling)).toFixed(2)
      ),
      estimatedEnergyReductionKwhM2Yr:
        simulationResult?.energyReductionKwhM2Yr ?? scenario.expectedEnergySaving,
    },
  };

  triggerDownload(
    JSON.stringify(payload, null, 2),
    `BMC_UHI_Dossier_Ward_${safeId}_2024.json`,
    'application/json;charset=utf-8;'
  );
}
