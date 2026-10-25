import React from 'react';
import { useUhiStore } from './stores/useUhiStore';
import { TopInstrumentBar } from './components/layout/TopInstrumentBar';
import { SpatialExplorer } from './pages/SpatialExplorer';
import { InterventionStudio } from './pages/InterventionStudio';
import { ClimatologyValidation } from './pages/ClimatologyValidation';
import { PolicyDossiers } from './pages/PolicyDossiers';
import { LandingPage } from './pages/LandingPage';

export function App() {
  const { activePage } = useUhiStore();

  const renderActiveWorkspace = () => {
    switch (activePage) {
      case 'landing':
        return <LandingPage />;
      case 'explorer':
      case 'overview':
      case 'heatmap':
      case 'wards':
        return <SpatialExplorer />;
      case 'studio':
      case 'simulator':
        return <InterventionStudio />;
      case 'science':
      case 'trends':
      case 'ml':
        return <ClimatologyValidation />;
      case 'dossier':
      case 'reports':
        return <PolicyDossiers />;
      default:
        return <SpatialExplorer />;
    }
  };

  if (activePage === 'landing') {
    return (
      <div className="min-h-screen w-screen overflow-x-hidden bg-[#0a0a0c] text-[#E1E0CC]">
        <LandingPage />
      </div>
    );
  }

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
