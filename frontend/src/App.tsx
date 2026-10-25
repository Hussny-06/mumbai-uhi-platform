import React from 'react';
import { useUhiStore } from './stores/useUhiStore';
import { TopInstrumentBar } from './components/layout/TopInstrumentBar';
import { SpatialExplorer } from './pages/SpatialExplorer';
import { ClimateTrends } from './pages/ClimateTrends';
import { MLInsights } from './pages/MLInsights';
import { Simulator } from './pages/Simulator';
import { Reports } from './pages/Reports';

export function App() {
  const { activePage } = useUhiStore();

  const renderActiveWorkspace = () => {
    switch (activePage) {
      case 'explorer':
      case 'overview':
      case 'heatmap':
      case 'wards':
        return <SpatialExplorer />;
      case 'studio':
      case 'simulator':
        return <Simulator />;
      case 'science':
      case 'trends':
        return <ClimateTrends />;
      case 'ml':
        return <MLInsights />;
      case 'dossier':
      case 'reports':
        return <Reports />;
      default:
        return <SpatialExplorer />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* 48px Global Instrument Bar */}
      <TopInstrumentBar />

      {/* 100% Width Workspace Canvas */}
      <main className="flex-1 flex h-[calc(100vh-3rem)] w-full overflow-hidden">
        {renderActiveWorkspace()}
      </main>
    </div>
  );
}

export default App;
