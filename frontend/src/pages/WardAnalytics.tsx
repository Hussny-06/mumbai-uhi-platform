import React, { useState, useMemo } from 'react';
import { useUhiStore } from '../stores/useUhiStore';
import { WARDS_DATA } from '../data/staticDatasets';
import { WardDetailDrawer } from '../components/analytics/WardDetailDrawer';
import { Ward } from '../types';
import { 
  MapPin, 
  Search, 
  ArrowUpDown, 
  Eye, 
  SlidersHorizontal 
} from 'lucide-react';

export const WardAnalytics: React.FC = () => {
  const { selectedWard, setSelectedWard, focusWard, setActivePage } = useUhiStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'meanLst' | 'uhi' | 'ndvi' | 'ndbi' | 'popDensity'>('meanLst');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredWards = useMemo(() => {
    return WARDS_DATA.filter((w: Ward) => {
      const matchSearch =
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchZone = selectedZone === 'All' || w.zone.toLowerCase().includes(selectedZone.toLowerCase());
      return matchSearch && matchZone;
    }).sort((a: Ward, b: Ward) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
  }, [searchQuery, selectedZone, sortBy, sortOrder]);

  const toggleSort = (field: 'meanLst' | 'uhi' | 'ndvi' | 'ndbi' | 'popDensity') => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Critical':
      case 'Extreme':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'Moderate':
      case 'Moderate-High':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Cooling Sink':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      default:
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
    }
  };

  return (
    <div className="flex-1 flex h-[calc(100vh-4rem)] overflow-hidden bg-uhi-bg">
      <div className="flex-1 flex flex-col p-4 lg:p-6 overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-uhi-border gap-4">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-uhi-cyan" />
              <h2 className="text-base font-bold text-uhi-text uppercase tracking-wider">
                BMC Ward Microclimate Registry (24 Administrative Units)
              </h2>
            </div>
            <p className="text-xs text-uhi-muted mt-0.5">
              Comprehensive biophysical downscaling and local TreeSHAP drivers for all Greater Mumbai municipal wards
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-uhi-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ward ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-uhi-surface2 border border-uhi-border rounded pl-8 pr-3 py-1.5 text-xs text-uhi-text placeholder-uhi-muted focus:outline-none focus:border-uhi-cyan w-48 lg:w-64"
              />
            </div>

            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-uhi-surface2 border border-uhi-border rounded px-3 py-1.5 text-xs text-uhi-text focus:outline-none focus:border-uhi-cyan cursor-pointer"
            >
              <option value="All">All Zones (24 Wards)</option>
              <option value="Island City">Island City</option>
              <option value="Western Suburbs">Western Suburbs</option>
              <option value="Eastern Suburbs">Eastern Suburbs</option>
            </select>
          </div>
        </div>

        {/* Wards Table */}
        <div className="bg-uhi-surface border border-uhi-border rounded overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-uhi-surface2 text-uhi-muted text-[10px] uppercase font-mono tracking-wider border-b border-uhi-border select-none">
                <tr>
                  <th className="p-3">Ward ID & Name</th>
                  <th className="p-3">Zone</th>
                  <th
                    onClick={() => toggleSort('meanLst')}
                    className="p-3 cursor-pointer hover:text-uhi-cyan"
                  >
                    <div className="flex items-center gap-1">
                      <span>Mean LST</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('uhi')}
                    className="p-3 cursor-pointer hover:text-uhi-cyan"
                  >
                    <div className="flex items-center gap-1">
                      <span>UHI (ΔT)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('ndvi')}
                    className="p-3 cursor-pointer hover:text-uhi-cyan"
                  >
                    <div className="flex items-center gap-1">
                      <span>NDVI</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('ndbi')}
                    className="p-3 cursor-pointer hover:text-uhi-cyan"
                  >
                    <div className="flex items-center gap-1">
                      <span>NDBI</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3">Area (km²)</th>
                  <th
                    onClick={() => toggleSort('popDensity')}
                    className="p-3 cursor-pointer hover:text-uhi-cyan"
                  >
                    <div className="flex items-center gap-1">
                      <span>Pop Density</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3">Heat Risk</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-uhi-border/80">
                {filteredWards.map((w: Ward) => {
                  const isSelected = selectedWard?.id === w.id;
                  return (
                    <tr
                      key={w.id}
                      onClick={() => setSelectedWard(w)}
                      className={`hover:bg-uhi-surface2/80 transition-colors cursor-pointer ${
                        isSelected ? 'bg-uhi-surface3/90' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-uhi-cyan px-1.5 py-0.5 rounded bg-uhi-surface3 border border-uhi-border text-[10px]">
                            {w.id}
                          </span>
                          <span className="font-semibold text-uhi-text">{w.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-uhi-muted text-[11px]">{w.zone}</td>
                      <td className="p-3 font-mono font-bold text-uhi-text">
                        {w.meanLst.toFixed(1)}°C
                      </td>
                      <td className="p-3 font-mono">
                        <span className={w.uhi > 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                          {w.uhi > 0 ? `+${w.uhi.toFixed(1)}` : w.uhi.toFixed(1)}°C
                        </span>
                      </td>
                      <td className="p-3 font-mono text-emerald-400">{w.ndvi.toFixed(2)}</td>
                      <td className="p-3 font-mono text-blue-400">{w.ndbi.toFixed(2)}</td>
                      <td className="p-3 font-mono text-uhi-muted">{w.area.toFixed(1)}</td>
                      <td className="p-3 font-mono text-uhi-text">
                        {w.popDensity.toLocaleString()}/km²
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded border ${getRiskBadge(
                            w.risk
                          )}`}
                        >
                          {w.risk}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              focusWard(w.id);
                              setActivePage('overview');
                            }}
                            title="Focus on Map"
                            className="p-1 rounded text-uhi-muted hover:text-uhi-cyan hover:bg-uhi-surface3 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedWard(w);
                              setActivePage('simulator');
                            }}
                            title="Simulate Intervention"
                            className="p-1 rounded text-uhi-muted hover:text-emerald-400 hover:bg-uhi-surface3 transition-colors"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Ward Drawer if active */}
      {selectedWard && <WardDetailDrawer />}
    </div>
  );
};
