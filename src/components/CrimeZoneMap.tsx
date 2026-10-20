import React, { useState } from 'react';
import {
  MapPin,
  AlertTriangle,
  ShieldCheck,
  Navigation,
  Compass,
  Phone,
  Radio,
  Search,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import { CrimeZone, GeoLocationData } from '../types/safety';

interface CrimeZoneMapProps {
  zones: CrimeZone[];
  currentLocation: GeoLocationData;
  onSimulateZoneEntry: (zone: CrimeZone) => void;
}

export const CrimeZoneMap: React.FC<CrimeZoneMapProps> = ({
  zones,
  currentLocation,
  onSimulateZoneEntry,
}) => {
  const [selectedZone, setSelectedZone] = useState<CrimeZone>(zones[0] || null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [proximityAlertToast, setProximityAlertToast] = useState<string | null>(null);

  const filteredZones = zones.filter((z) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'RED') return z.status === 'RED';
    if (filterType === 'GREEN') return z.status === 'GREEN';
    if (filterType === 'SNATCHING') return z.crimeType.toLowerCase().includes('snatch');
    if (filterType === 'THEFT') return z.crimeType.toLowerCase().includes('theft') || z.crimeType.toLowerCase().includes('break-in');
    return true;
  });

  const handleZoneClick = (z: CrimeZone) => {
    setSelectedZone(z);
  };

  const handleTestProximityAlert = (z: CrimeZone) => {
    onSimulateZoneEntry(z);
    setProximityAlertToast(`⚠️ Proximity Alert: You entered ${z.name} (${z.status} Zone). Real-time vigilant monitoring activated.`);
    setTimeout(() => setProximityAlertToast(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {proximityAlertToast && (
        <div className="p-4 rounded-xl bg-red-950/90 border-2 border-red-500 text-red-100 flex items-center justify-between shadow-2xl animate-bounce backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <p className="font-bold text-sm">Zone Proximity Alert Triggered</p>
              <p className="text-xs text-red-200">{proximityAlertToast}</p>
            </div>
          </div>
          <button
            onClick={() => setProximityAlertToast(null)}
            className="text-xs px-2.5 py-1 rounded bg-red-900 text-red-200 font-bold hover:bg-red-800"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-[#0c1220]/90 border border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition duration-300 hover:border-slate-700">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-red-950 border border-red-800/60 text-red-400">
              <MapPin className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>High Alert Crime Hotspots & Safe Zones</span>
              <span className="text-xs px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold">
                Kanpur Grid
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            "From Red Zones to Green Zones — The Apki Suraksha Impact". Proactive geo-fenced warnings when entering dangerous areas.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            { id: 'ALL', label: 'All Zones' },
            { id: 'RED', label: '🔴 Red Alert Hotspots' },
            { id: 'GREEN', label: '🟢 Transformed Green' },
            { id: 'SNATCHING', label: 'Snatching Hotspots' },
            { id: 'THEFT', label: 'Burglary / Theft' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-200 hover:scale-102 ${
                filterType === f.id
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 border border-red-500'
                  : 'bg-[#080d1a] text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Graphic Map + Zone Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Schematic Radar Map (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0c1220]/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-4 transition duration-300 hover:border-slate-700">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Interactive Tactical Radar Grid</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Lat: 26.44°N - 26.51°N | Lng: 80.21°E - 80.35°E
              </span>
            </div>

            {/* Visual Vector SVG Map (Dark Cyber Radar Theme) */}
            <div className="relative w-full h-[380px] bg-[#050811] rounded-xl border border-slate-800 overflow-hidden p-4 select-none">
              {/* Radar sweep line */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-96 h-96 rounded-full border border-cyan-500/10 flex items-center justify-center">
                  <div className="w-64 h-64 rounded-full border border-cyan-500/20"></div>
                </div>
              </div>

              {/* Map Grid Lines */}
              <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid-dark" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-dark)" />
              </svg>

              {/* River Ganges outline indication (English only) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 380">
                <path
                  d="M 20 60 Q 150 40 300 70 T 580 80"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="8"
                  strokeOpacity="0.4"
                />
                <text x="350" y="55" fill="#38bdf8" fontSize="11" opacity="0.8" fontWeight="bold">
                  Ganges River Corridor
                </text>

                {/* Major Highway NH-27 & GT Road corridors */}
                <path
                  d="M 50 340 L 550 300"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="4"
                  strokeDasharray="6,4"
                />
                <text x="60" y="360" fill="#94a3b8" fontSize="10" fontWeight="bold">
                  NH-27 Highway Corridor
                </text>

                <path
                  d="M 80 180 Q 280 200 520 230"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="3"
                />
                <text x="90" y="170" fill="#94a3b8" fontSize="10" fontWeight="bold">
                  GT Road Main Arterial
                </text>
              </svg>

              {/* Zone Pins Placed on Schematic Coordinates */}
              {zones.map((zone) => {
                const minLat = 26.43, maxLat = 26.51;
                const minLng = 80.20, maxLng = 80.36;
                const xPct = ((zone.center.lng - minLng) / (maxLng - minLng)) * 82 + 8;
                const yPct = (1 - (zone.center.lat - minLat) / (maxLat - minLat)) * 74 + 12;

                const isSelected = selectedZone?.id === zone.id;
                const isRed = zone.status === 'RED';

                return (
                  <div
                    key={zone.id}
                    onClick={() => handleZoneClick(zone)}
                    style={{ left: `${xPct}%`, top: `${yPct}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  >
                    <div
                      className={`absolute -inset-3 rounded-full opacity-40 ${
                        isRed ? 'bg-red-500 animate-ping' : 'bg-emerald-500'
                      }`}
                    ></div>

                    <div
                      className={`relative px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all transform hover:scale-110 ${
                        isSelected
                          ? 'scale-110 shadow-xl z-20 ' +
                            (isRed ? 'bg-red-600 border-white text-white' : 'bg-emerald-600 border-white text-white')
                          : isRed
                          ? 'bg-red-950/90 border-red-600 text-red-200 hover:scale-105 shadow-md shadow-red-950'
                          : 'bg-emerald-950/90 border-emerald-500 text-emerald-200 hover:scale-105 shadow-md shadow-emerald-950'
                      }`}
                    >
                      <span className="text-xs">{isRed ? '⚠️' : '🛡️'}</span>
                      <span className="text-[11px] font-black whitespace-nowrap">{zone.name}</span>
                    </div>
                  </div>
                );
              })}

              {/* Current Simulated Location Pin */}
              <div
                style={{ left: '48%', top: '56%' }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
              >
                <div className="relative flex flex-col items-center">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-400 text-cyan-200 shadow-md mt-1">
                    YOU ARE HERE
                  </span>
                </div>
              </div>

              {/* Map Legend */}
              <div className="absolute bottom-2 right-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2 rounded-lg text-[10px] space-y-1 text-slate-300 shadow-lg font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                  <span>Red Zone: High Alert Crime Hotspot</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Green Zone: Transformed Safe Hub</span>
                </div>
              </div>
            </div>

            {/* Quick Proximity Warning Simulator */}
            {selectedZone && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#070b16] border border-slate-800">
                <div className="text-xs">
                  <span className="text-slate-400 font-medium">Simulate Entry Test: </span>
                  <span className="font-bold text-white">{selectedZone.name}</span>
                </div>
                <button
                  onClick={() => handleTestProximityAlert(selectedZone)}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-red-600/30 hover:scale-105"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Test Zone Proximity Alert</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Zone Detailed Intelligence (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedZone ? (
            <div className="p-5 rounded-2xl bg-[#0c1220]/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-4 transition duration-300 hover:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-black text-white">{selectedZone.name}</h3>
                    <span className="text-xs text-slate-400">({selectedZone.hindiName})</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">{selectedZone.policeStation}</p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    selectedZone.status === 'RED'
                      ? 'bg-red-950 text-red-400 border border-red-500'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-500'
                  }`}
                >
                  {selectedZone.status === 'RED' ? 'High Risk Red Zone' : 'Model Green Zone'}
                </span>
              </div>

              {/* Crime Type & Threat Description */}
              <div className="p-3.5 rounded-xl bg-[#070b16] border border-slate-800 space-y-2">
                <div className="text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Identified Crime Profile
                  </span>
                  <span className="font-bold text-red-300 text-xs sm:text-sm">
                    {selectedZone.crimeType}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400 font-medium">Incident Frequency:</span>
                  <span className="font-mono text-amber-300 font-bold">{selectedZone.stats}</span>
                </div>
              </div>

              {/* Apki Suraksha Impact Stats */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-950 border border-emerald-800/50 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Apki Suraksha Impact</span>
                </span>
                <p className="text-xs font-bold text-emerald-200">
                  {selectedZone.beforeAfterRatio}
                </p>
              </div>

              {/* Designated Safe Corridors */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Verified Safe Corridors:
                </label>
                <div className="space-y-1.5">
                  {selectedZone.safeCorridors.map((c, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-[#070b16] border border-slate-800 text-xs text-slate-200 font-medium flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Citizen Advisory Tip */}
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200/90 leading-relaxed font-medium">
                <span className="font-bold text-amber-400 block mb-0.5">Citizen Advisory:</span>
                {selectedZone.tip}
              </div>

              {/* Quick Call Police Station */}
              <a
                href="tel:112"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md border border-slate-700 hover:scale-102"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Local Police Station (112)</span>
              </a>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 rounded-2xl bg-[#0c1220] border border-slate-800">
              Select a zone from the map to inspect intelligence
            </div>
          )}

          {/* Quick Zone List Directory */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Zones Quick Directory:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {filteredZones.map((z) => (
                <button
                  key={z.id}
                  onClick={() => handleZoneClick(z)}
                  className={`p-2 rounded-xl text-left border text-xs transition-all duration-200 hover:scale-102 ${
                    selectedZone?.id === z.id
                      ? 'bg-red-950/80 border-red-500 text-white shadow-md'
                      : 'bg-[#080d1a] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold">{z.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{z.crimeType}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
