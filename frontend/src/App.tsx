import React from 'react';
import { useUhiStore } from './stores/useUhiStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { HeatMap } from './pages/HeatMap';
import { WardAnalytics } from './pages/WardAnalytics';
import { ClimateTrends } from './pages/ClimateTrends';
import { MLInsights } from './pages/MLInsights';
import { Simulator } from './pages/Simulator';
import { Reports } from './pages/Reports';
import { System } from './pages/System';

export function App() {
  const { activePage } = useUhiStore();

  const renderActivePage = () => {
    switch (activePage) {
      case 'overview':
        return <Dashboard />;
      case 'heatmap':
        return <HeatMap />;
      case 'wards':
        return <WardAnalytics />;
      case 'trends':
        return <ClimateTrends />;
      case 'ml':
        return <MLInsights />;
      case 'simulator':
        return <Simulator />;
      case 'reports':
        return <Reports />;
      case 'system':
        return <System />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-uhi-bg text-uhi-text select-none">
      {/* Top Header */}
      <Header />

      {/* Main Workspace: Left Sidebar + Active Page */}
      <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex overflow-hidden">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

export default App;
