import React from 'react';
import { useUhiStore } from '../../stores/useUhiStore';
import { ActivePage } from '../../types';
import { 
  LayoutDashboard, 
  Flame, 
  MapPin, 
  TrendingUp, 
  BrainCircuit, 
  SlidersHorizontal, 
  FileText, 
  Server,
  Database,
  CheckCircle2
} from 'lucide-react';

interface NavItem {
  id: ActivePage;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage } = useUhiStore();

  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      sublabel: 'Citywide Heat Intelligence',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'heatmap',
      label: 'Heat Map',
      sublabel: '30m Multi-Index Geospatial',
      icon: <Flame className="w-4 h-4 text-orange-400" />,
    },
    {
      id: 'wards',
      label: 'Ward Analytics',
      sublabel: '24 BMC Administrative Units',
      icon: <MapPin className="w-4 h-4 text-uhi-cyan" />,
    },
    {
      id: 'trends',
      label: 'Climate Trends',
      sublabel: '1997–2024 IMD Timeseries',
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'ml',
      label: 'ML Insights',
      sublabel: 'XGBoost & TreeSHAP XAI',
      icon: <BrainCircuit className="w-4 h-4 text-uhi-purple" />,
    },
    {
      id: 'simulator',
      label: 'What-If Simulator',
      sublabel: 'Microclimate Intervention',
      icon: <SlidersHorizontal className="w-4 h-4 text-uhi-blue" />,
    },
    {
      id: 'reports',
      label: 'Reports',
      sublabel: 'Municipal Briefing & Export',
      icon: <FileText className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'system',
      label: 'System / Data Quality',
      sublabel: 'Observability & Validation',
      icon: <Server className="w-4 h-4 text-slate-400" />,
    },
  ];

  return (
    <aside className="w-64 bg-uhi-surface border-r border-uhi-border flex flex-col justify-between select-none shrink-0 h-[calc(100vh-4rem)]">
      {/* Platform Branding Badge */}
      <div className="p-4 border-b border-uhi-border bg-uhi-surface2/40">
        <div className="text-[10px] uppercase font-mono tracking-widest text-uhi-cyan font-bold">
          Mumbai UHI
        </div>
        <div className="text-xs font-semibold text-uhi-text tracking-wide">
          AI CLIMATE INTELLIGENCE
        </div>
        <div className="text-[10px] text-uhi-muted mt-0.5">
          Surrogate Downscaling Platform
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-all group ${
                isActive
                  ? 'bg-uhi-surface3 text-white border-l-2 border-uhi-cyan shadow-sm shadow-cyan-950/40'
                  : 'text-uhi-muted hover:bg-uhi-surface2/60 hover:text-uhi-text border-l-2 border-transparent'
              }`}
            >
              <div
                className={`transition-colors ${
                  isActive ? 'text-uhi-cyan' : 'text-uhi-muted group-hover:text-uhi-text'
                }`}
              >
                {item.icon}
              </div>
              <div className="truncate">
                <div className={`text-xs font-medium tracking-wide ${isActive ? 'text-white font-semibold' : ''}`}>
                  {item.label}
                </div>
                <div className="text-[10px] text-uhi-muted tracking-tight truncate">
                  {item.sublabel}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Telemetry Card */}
      <div className="p-3 m-2 rounded bg-uhi-surface2 border border-uhi-border text-[11px] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-uhi-muted uppercase text-[9px] font-mono tracking-wider">Model Architecture</span>
          <span className="font-mono text-uhi-purple font-semibold">XGBoost</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-uhi-muted uppercase text-[9px] font-mono tracking-wider">Inference Status</span>
          <span className="inline-flex items-center gap-1 font-mono text-uhi-green text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-uhi-green"></span>
            Operational
          </span>
        </div>
        <div className="pt-2 border-t border-uhi-border/80 flex items-center justify-between text-[10px] text-uhi-muted">
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 text-uhi-cyan" />
            Dataset Scope
          </span>
          <span className="font-mono text-uhi-text text-[9px]">2024 Sat + 1997-2024 IMD</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-uhi-muted">
          <span>Spatial Block Buffer</span>
          <span className="font-mono text-uhi-text text-[9px]">1.2 km Exclusion</span>
        </div>
      </div>
    </aside>
  );
};
