import React, { useEffect } from 'react';
import { useUhiStore } from '../../stores/useUhiStore';
import { WorkspaceId } from '../../types';
import {
  Compass,
  SlidersHorizontal,
  LineChart,
  FileText,
  Sun,
  Moon,
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
    <header className="h-12 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-4 flex items-center justify-between gap-3 select-none z-30 shrink-0 no-print">
      {/* LEFT: Brand Title */}
      <button
        onClick={() => setActivePage('landing')}
        className="flex items-center gap-2 whitespace-nowrap min-w-0 hover:opacity-85 transition-opacity cursor-pointer text-left"
        title="View 13-Section Landing Page"
      >
        <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent-primary)] inline-block shrink-0" />
        <span className="font-serif font-semibold text-sm tracking-tight text-[var(--text-primary)]">
          Mumbai UHI
        </span>
        <span className={`hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
          activePage === 'landing'
            ? 'bg-[var(--accent-primary)] text-white border-transparent font-bold'
            : 'bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`}>
          Overview
        </span>
      </button>

      {/* CENTER: Segmented 4-Workspace Switcher */}
      <nav
        aria-label="Primary Workspaces"
        className="flex items-center bg-[var(--bg-canvas)] p-0.5 rounded-md border border-[var(--border-subtle)] shrink-0"
      >
        {workspaces.map((ws) => {
          const isActive = ws.matchPages.includes(activePage);
          return (
            <button
              key={ws.id}
              onClick={() => setActivePage(ws.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
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

      {/* RIGHT: Quiet Engine Pill & Dual-Theme Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quiet Engine Telemetry Pill (Zero pulsing animations) */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-secondary)] whitespace-nowrap"
          title={
            isBackendConnected
              ? `FastAPI Downscaling Engine Online (${backendLatencyMs}ms)`
              : 'Local Surrogate Physics & Static Dataset Engine Active'
          }
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: isBackendConnected ? '#0D9488' : '#D97706' }}
          />
          <span>
            {isBackendConnected ? `Live API · ${backendLatencyMs}ms` : 'Local Engine'}
          </span>
        </div>

        {/* Dual-Theme Toggle (Daylight Paper vs Carbon Workbench) */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to Daylight Paper Theme' : 'Switch to Carbon Dark Theme'}
          title={theme === 'dark' ? 'Switch to Daylight Paper Theme' : 'Switch to Carbon Dark Theme'}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--bg-canvas)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)] transition-colors whitespace-nowrap"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-[#FBB41A]" />
              <span className="hidden md:inline text-[11px] font-mono">Paper</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <span className="hidden md:inline text-[11px] font-mono">Carbon</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
