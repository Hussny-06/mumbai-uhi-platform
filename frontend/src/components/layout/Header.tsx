import React, { useEffect } from 'react';
import { useUhiStore } from '../../stores/useUhiStore';
import { 
  Activity, 
  Cpu, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  ChevronDown
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    selectedDate, 
    setSelectedDate, 
    isBackendConnected, 
    backendLatencyMs, 
    checkBackendHealth 
  } = useUhiStore();

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 15000);
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  return (
    <header className="h-16 bg-uhi-surface border-b border-uhi-border px-4 lg:px-6 flex items-center justify-between select-none z-30 shrink-0">
      {/* LEFT: Branding */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded bg-uhi-surface2 border border-uhi-cyan/40 flex items-center justify-center shadow-lg shadow-cyan-950/30">
          <Layers className="w-5 h-5 text-uhi-cyan" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm lg:text-base font-bold tracking-wider text-uhi-text uppercase">
              Mumbai UHI Intelligence
            </h1>
            <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-uhi-surface3 border border-uhi-border text-uhi-cyan">
              EPSG:32643
            </span>
          </div>
          <p className="text-[11px] text-uhi-muted tracking-wide">
            AI-Driven Spatiotemporal Downscaling & Microclimate Modeling
          </p>
        </div>
      </div>

      {/* CENTER & RIGHT: Telemetry, Date & Status */}
      <div className="flex items-center gap-3 lg:gap-5">
        {/* Coordinates readout */}
        <div className="hidden xl:flex items-center gap-2 bg-uhi-surface2 px-2.5 py-1 rounded border border-uhi-border text-[11px] font-mono text-uhi-muted">
          <MapPin className="w-3.5 h-3.5 text-uhi-cyan" />
          <span>19.0760° N</span>
          <span className="text-uhi-border">|</span>
          <span>72.8777° E</span>
          <span className="text-uhi-border">|</span>
          <span className="text-uhi-cyan">30m GSD</span>
        </div>

        {/* Date Selector */}
        <div className="relative flex items-center">
          <div className="flex items-center gap-1.5 bg-uhi-surface2 hover:bg-uhi-surface3 transition-colors px-2.5 py-1.5 rounded border border-uhi-border cursor-pointer text-xs">
            <Calendar className="w-3.5 h-3.5 text-uhi-cyan" />
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-uhi-text text-xs focus:outline-none cursor-pointer pr-4 appearance-none font-medium"
            >
              <option value="Pre-Monsoon 2024" className="bg-uhi-surface text-uhi-text">Pre-Monsoon 2024</option>
              <option value="Annual Baseline 2024" className="bg-uhi-surface text-uhi-text">Annual Baseline 2024</option>
              <option value="Post-Monsoon 2023" className="bg-uhi-surface text-uhi-text">Post-Monsoon 2023</option>
              <option value="Summer Peak 2023" className="bg-uhi-surface text-uhi-text">Summer Peak 2023</option>
            </select>
            <ChevronDown className="w-3 h-3 text-uhi-muted absolute right-2 pointer-events-none" />
          </div>
        </div>

        {/* Model Status */}
        <div className="hidden md:flex items-center gap-2 bg-uhi-surface2 px-2.5 py-1.5 rounded border border-uhi-border text-xs">
          <Cpu className="w-3.5 h-3.5 text-uhi-purple" />
          <span className="text-uhi-muted text-[11px]">Model:</span>
          <span className="font-semibold text-xs text-uhi-text">XGBoost</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-uhi-green">
            <span className="w-1.5 h-1.5 rounded-full bg-uhi-green animate-pulse"></span>
            Operational
          </span>
        </div>

        {/* FastAPI Status */}
        <div 
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs transition-colors ${
            isBackendConnected 
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' 
              : 'bg-uhi-surface2 border-uhi-border text-uhi-muted'
          }`}
          title={isBackendConnected ? `FastAPI Server Connected (${backendLatencyMs}ms)` : 'FastAPI Offline - Using Embedded Surrogate Engine'}
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="text-[11px] font-mono hidden sm:inline">
            {isBackendConnected ? `FastAPI: ${backendLatencyMs}ms` : 'Surrogate Engine'}
          </span>
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isBackendConnected ? 'bg-uhi-green' : 'bg-uhi-cyan'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              isBackendConnected ? 'bg-uhi-green' : 'bg-uhi-cyan'
            }`}></span>
          </span>
        </div>
      </div>
    </header>
  );
};
