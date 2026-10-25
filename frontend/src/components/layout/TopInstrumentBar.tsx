import React, { useEffect } from 'react';
import { useUhiStore } from '../../stores/useUhiStore';
import { WorkspaceId } from '../../types';
import {
  Compass,
  SlidersHorizontal,
  LineChart,
  FileText,
  Calendar,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';

interface WorkspaceTab {
  id: WorkspaceId;
  index: string;
  label: string;
  matchPages: string[];
  icon: React.ReactNode;
}

export const TopInstrumentBar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    selectedDate,
    setSelectedDate,
    isBackendConnected,
    backendLatencyMs,
    checkBackendHealth,
    theme,
    toggleTheme,
    runSimulation,
    simulationResult,
  } = useUhiStore();

  useEffect(() => {
    checkBackendHealth();
    if (!simulationResult) {
      runSimulation();
    }
    const interval = setInterval(checkBackendHealth, 20000);
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  const workspaces: WorkspaceTab[] = [
    {
      id: 'explorer',
      index: '01',
      label: 'Spatial Explorer',
      matchPages: ['explorer', 'overview', 'heatmap', 'wards'],
      icon: <Compass className="w-3.5 h-3.5" />,
    },
    {
      id: 'studio',
      index: '02',
      label: 'Intervention Studio',
      matchPages: ['studio', 'simulator'],
      icon: <SlidersHorizontal className="w-3.5 h-3.5" />,
    },
    {
      id: 'science',
      index: '03',
      label: 'Climatology & XAI',
      matchPages: ['science', 'trends', 'ml'],
      icon: <LineChart className="w-3.5 h-3.5" />,
    },
    {
      id: 'dossier',
      index: '04',
      label: 'Policy Dossiers',
      matchPages: ['dossier', 'reports'],
      icon: <FileText className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <header className="h-12 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-4 flex items-center justify-between select-none z-30 shrink-0 no-print">
      {/* LEFT: Cartographic Brand & Spatial Metadata */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent-primary)] inline-block" />
          <span className="font-serif font-semibold text-sm tracking-tight text-[var(--text-primary)]">
            Mumbai UHI Atlas
          </span>
        </div>
        <span className="hidden md:inline-block text-[11px] font-mono text-[var(--text-muted)] border-l border-[var(--border-subtle)] pl-3">
          30m GSD · EPSG:32643 · 24 BMC Wards
        </span>
      </div>

      {/* CENTER: Segmented 4-Workspace Switcher */}
      <nav
        aria-label="Primary Workspaces"
        className="flex items-center bg-[var(--bg-canvas)] p-0.5 rounded-md border border-[var(--border-subtle)]"
      >
        {workspaces.map((ws) => {
          const isActive = ws.matchPages.includes(activePage);
          return (
            <button
              key={ws.id}
              onClick={() => setActivePage(ws.id)}
              className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                isActive
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
              }`}
            >
              <span
                className={`font-mono text-[10px] ${
                  isActive ? 'text-[var(--accent-primary)] font-semibold' : 'text-[var(--text-muted)]'
                }`}
              >
                {ws.index}
              </span>
              <span className={isActive ? 'font-semibold' : ''}>{ws.label}</span>
            </button>
          );
        })}
      </nav>

      {/* RIGHT: Observation Epoch, Quiet Engine Pill, & Theme Toggle */}
      <div className="flex items-center gap-2.5">
        {/* Observation Epoch Selector */}
        <div className="relative hidden sm:flex items-center">
          <div className="flex items-center gap-1.5 bg-[var(--bg-canvas)] hover:bg-[var(--bg-elevated)] transition-colors px-2.5 py-1 rounded border border-[var(--border-subtle)] text-xs">
            <Calendar className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Select Observation Epoch"
              className="bg-transparent text-[var(--text-primary)] text-xs focus:outline-none cursor-pointer pr-4 appearance-none font-mono"
            >
              <option value="Pre-Monsoon 2024" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                Pre-Monsoon 2024
              </option>
              <option value="Annual Baseline 2024" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                Annual Baseline 2024
              </option>
              <option value="Post-Monsoon 2023" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                Post-Monsoon 2023
              </option>
              <option value="Summer Peak 2023" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                Summer Peak 2023
              </option>
            </select>
            <ChevronDown className="w-3 h-3 text-[var(--text-muted)] absolute right-2 pointer-events-none" />
          </div>
        </div>

        {/* Quiet Engine Telemetry Pill (Zero pulsing animations) */}
        <div
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-secondary)]"
          title={
            isBackendConnected
              ? `FastAPI Downscaling Engine Online (${backendLatencyMs}ms)`
              : 'Local Surrogate Physics & Static Dataset Engine Active'
          }
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: isBackendConnected ? '#0D9488' : '#D97706' }}
          />
          <span>
            {isBackendConnected ? `Live API · ${backendLatencyMs}ms` : 'Local Engine'}
          </span>
        </div>

        {/* Dual-Theme Toggle (Daylight Paper vs Carbon Workbench) */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Daylight Paper Theme' : 'Switch to Carbon Dark Theme'}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--bg-canvas)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)] transition-colors"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-[#FBB41A]" />
              <span className="hidden xl:inline text-[11px] font-mono">Paper</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <span className="hidden xl:inline text-[11px] font-mono">Carbon</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
