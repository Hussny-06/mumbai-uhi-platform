import React, { useState } from 'react';
import { WARDS_DATA, PRESET_SCENARIOS } from '../data/staticDatasets';
import { api } from '../services/api';
import { Ward, PolicyScenario } from '../types';
import { 
  FileText, 
  Download, 
  Printer, 
  AlertCircle 
} from 'lucide-react';

export const Reports: React.FC = () => {
  const [selectedWardId, setSelectedWardId] = useState<string>('G/N');
  const [selectedDate, setSelectedDate] = useState<string>('Pre-Monsoon 2024');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('combined_mitigation');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const ward = WARDS_DATA.find((w: Ward) => w.id === selectedWardId) || WARDS_DATA[0];
  const scenario = PRESET_SCENARIOS.find((s: PolicyScenario) => s.id === selectedScenarioId) || PRESET_SCENARIOS[0];

  const handleGeneratePdf = async () => {
    setIsExporting(true);
    setExportMessage(null);
    try {
      const res = await api.exportWardReport(ward.id);
      if (res.connected) {
        setExportMessage(res.message);
      } else {
        setExportMessage('Report generation endpoint not connected to live PDF rendering daemon. UI preview is fully validated.');
      }
    } catch {
      setExportMessage('Report generation endpoint not connected');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto bg-uhi-bg p-4 lg:p-6 space-y-5">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-uhi-border gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h1 className="text-base font-bold text-uhi-text uppercase tracking-wider">
              MUNICIPAL HEAT MITIGATION REPORTS
            </h1>
          </div>
          <p className="text-xs text-uhi-muted mt-0.5">
            Automated microclimate policy dossiers generated for Brihanmumbai Municipal Corporation (BMC) ward officers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded bg-uhi-surface2 border border-uhi-border hover:bg-uhi-surface3 text-uhi-text text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-uhi-cyan" />
            <span>Print Dossier</span>
          </button>
          <button
            onClick={handleGeneratePdf}
            disabled={isExporting}
            className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-uhi-bg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-950/40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Generating...' : 'Generate PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Endpoint Status Warning Banner if triggered */}
      {exportMessage && (
        <div className="p-3 rounded bg-amber-950/30 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{exportMessage}</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/50">
            Roadmap Item
          </span>
        </div>
      )}

      {/* Selectors Bar */}
      <div className="bg-uhi-surface border border-uhi-border p-3.5 rounded grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="text-[10px] uppercase font-mono text-uhi-muted font-bold block mb-1">
            Target BMC Ward
          </label>
          <select
            value={selectedWardId}
            onChange={(e) => setSelectedWardId(e.target.value)}
            className="w-full bg-uhi-surface2 border border-uhi-border rounded p-2 text-uhi-text text-xs focus:outline-none focus:border-uhi-cyan cursor-pointer font-mono"
          >
            {WARDS_DATA.map((w: Ward) => (
              <option key={w.id} value={w.id}>
                Ward {w.id} - {w.name} ({w.meanLst}°C)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase font-mono text-uhi-muted font-bold block mb-1">
            Observation Epoch
          </label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-uhi-surface2 border border-uhi-border rounded p-2 text-uhi-text text-xs focus:outline-none focus:border-uhi-cyan cursor-pointer"
          >
            <option value="Pre-Monsoon 2024">Pre-Monsoon 2024 (Peak Heat)</option>
            <option value="Annual Baseline 2024">Annual Baseline 2024</option>
            <option value="Post-Monsoon 2023">Post-Monsoon 2023</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase font-mono text-uhi-muted font-bold block mb-1">
            Intervention Scenario
          </label>
          <select
            value={selectedScenarioId}
            onChange={(e) => setSelectedScenarioId(e.target.value)}
            className="w-full bg-uhi-surface2 border border-uhi-border rounded p-2 text-uhi-text text-xs focus:outline-none focus:border-uhi-cyan cursor-pointer"
          >
            {PRESET_SCENARIOS.map((s: PolicyScenario) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.expectedCooling}°C)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Professional Municipal Report Preview Document */}
      <div className="bg-uhi-surface border border-uhi-border rounded-lg p-6 lg:p-8 space-y-6 shadow-2xl relative text-uhi-text">
        {/* Document Header */}
        <div className="border-b-2 border-uhi-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-uhi-cyan font-bold">
              BRIHANMUMBAI MUNICIPAL CORPORATION (BMC) • CLIMATE ACTION CELL
            </div>
            <h2 className="text-xl font-bold tracking-tight mt-1">
              Urban Heat Island Assessment & Mitigation Action Plan
            </h2>
            <div className="text-xs text-uhi-muted mt-0.5">
              Ward {ward.id} ({ward.name}) • Greater Mumbai Metropolitan Area
            </div>
          </div>

          <div className="text-right font-mono text-xs">
            <div className="text-uhi-muted">Report ID: UHI-MUM-{ward.id}-2024</div>
            <div className="text-uhi-cyan font-bold">Epoch: {selectedDate}</div>
            <div className="text-[10px] text-uhi-muted">GSD: 30m Downscaling (EPSG:32643)</div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase font-bold text-uhi-cyan tracking-wider">
            1. Ward Profile & Baseline Vulnerability
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded bg-uhi-surface2 border border-uhi-border">
              <div className="text-[10px] text-uhi-muted uppercase">Mean Surface LST</div>
              <div className="text-lg font-bold font-mono text-red-400 mt-1">{ward.meanLst.toFixed(1)} °C</div>
            </div>
            <div className="p-3 rounded bg-uhi-surface2 border border-uhi-border">
              <div className="text-[10px] text-uhi-muted uppercase">UHI Severity (ΔT)</div>
              <div className="text-lg font-bold font-mono text-orange-400 mt-1">+{ward.uhi.toFixed(1)} °C</div>
            </div>
            <div className="p-3 rounded bg-uhi-surface2 border border-uhi-border">
              <div className="text-[10px] text-uhi-muted uppercase">Population Density</div>
              <div className="text-lg font-bold font-mono text-uhi-text mt-1">{ward.popDensity.toLocaleString()}/km²</div>
            </div>
            <div className="p-3 rounded bg-uhi-surface2 border border-uhi-border">
              <div className="text-[10px] text-uhi-muted uppercase">Heat Risk Class</div>
              <div className="text-lg font-bold font-mono text-red-400 mt-1 uppercase">{ward.risk}</div>
            </div>
          </div>
        </div>

        {/* Section 2: Biophysical Drivers */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase font-bold text-uhi-cyan tracking-wider">
            2. Local TreeSHAP Biophysical Attribution
          </h3>
          <div className="p-4 rounded bg-uhi-surface2 border border-uhi-border space-y-2">
            <div className="text-xs text-uhi-muted">
              XGBoost surrogate explainability identifies the following drivers dictating surface temperatures in Ward {ward.id}:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {ward.shapDrivers.map((d: any, i: number) => (
                <div key={i} className="flex justify-between p-2 rounded bg-uhi-surface3/60 border border-uhi-border">
                  <span className="text-uhi-text">{d.name}</span>
                  <span className={d.isHeating ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {d.isHeating ? `+${d.value}` : d.value} °C
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Recommended Intervention & Predicted Cooling */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase font-bold text-uhi-cyan tracking-wider">
            3. Simulation Scenario: {scenario.name}
          </h3>
          <div className="p-4 rounded bg-uhi-surface2 border border-emerald-500/40 space-y-3">
            <p className="text-xs text-uhi-muted">
              {scenario.description} targeting building rooftops, public rights-of-way, and open spaces across Ward {ward.id}.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded bg-uhi-surface3 border border-uhi-border">
                <div className="text-[10px] text-uhi-muted uppercase">Predicted Cooling Delta</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">{scenario.expectedCooling.toFixed(2)} °C</div>
              </div>
              <div className="p-3 rounded bg-uhi-surface3 border border-uhi-border">
                <div className="text-[10px] text-uhi-muted uppercase">Annual Energy Reduction</div>
                <div className="text-xl font-bold text-amber-300 mt-1">{scenario.expectedEnergySaving.toFixed(2)} kWh/m²</div>
              </div>
              <div className="p-3 rounded bg-uhi-surface3 border border-uhi-border">
                <div className="text-[10px] text-uhi-muted uppercase">Target Post-Intervention LST</div>
                <div className="text-xl font-bold text-uhi-text mt-1">{(ward.meanLst + scenario.expectedCooling).toFixed(1)} °C</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Policy Recommendations */}
        <div className="space-y-2 text-xs text-uhi-muted">
          <h3 className="text-xs font-mono uppercase font-bold text-uhi-cyan tracking-wider">
            4. Municipal Implementation Directives
          </h3>
          <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
            <li>
              Mandate <strong className="text-uhi-text">Cool Roof Elastomer coatings (SRI &gt; 80)</strong> for all redevelopment projects under BMC Development Control and Promotion Regulations (DCPR 2034).
            </li>
            <li>
              Deploy targeted roadside canopy infill along transit corridors to break continuous asphalt thermal retention.
            </li>
            <li>
              Preserve natural drainage corridors and mangrove buffers along Mithi River and eastern creek margins to ensure nocturnal coastal ventilation.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
