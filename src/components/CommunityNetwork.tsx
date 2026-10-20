import React, { useState } from 'react';
import {
  Users,
  Radio,
  MapPin,
  Clock,
  Send,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Heart,
  MessageSquare,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { SosAlert, CommunityIncident } from '../types/safety';

interface CommunityNetworkProps {
  alerts: SosAlert[];
  incidents: CommunityIncident[];
  onAssistAlert: (alertId: string) => void;
  onReportIncident: (incidentData: {
    title: string;
    zone: string;
    type: string;
    description: string;
  }) => void;
}

export const CommunityNetwork: React.FC<CommunityNetworkProps> = ({
  alerts,
  incidents,
  onAssistAlert,
  onReportIncident,
}) => {
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportTitle, setReportTitle] = useState<string>('');
  const [reportZone, setReportZone] = useState<string>('Govind Nagar');
  const [reportType, setReportType] = useState<string>('Theft / Snatching');
  const [reportDesc, setReportDesc] = useState<string>('');
  const [assistedIds, setAssistedIds] = useState<Record<string, boolean>>({});

  const handleAssist = (alertId: string) => {
    setAssistedIds((prev) => ({ ...prev, [alertId]: true }));
    onAssistAlert(alertId);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim()) return;
    onReportIncident({
      title: reportTitle,
      zone: reportZone,
      type: reportType,
      description: reportDesc || 'Reported by local neighborhood watch volunteer.',
    });
    setReportTitle('');
    setReportDesc('');
    setShowReportModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Network Stats */}
      <div className="p-5 rounded-2xl bg-[#0c1220]/90 border border-slate-800 shadow-2xl backdrop-blur-xl transition duration-300 hover:border-slate-700">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-blue-950 border border-blue-800/60 text-blue-400">
                <Users className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Community Guardian Safety Circle</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700 font-bold">
                  City Mesh
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              "Most safety apps focus on individual safety; Apki Suraksha protects the entire community together."
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Crime / Hazard</span>
            </button>
          </div>
        </div>

        {/* Live Network Metrics */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#070b16] border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Guardians Online</span>
            <span className="text-lg sm:text-xl font-black text-white flex items-center gap-1.5 mt-0.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              248 Active
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#070b16] border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Response Time</span>
            <span className="text-lg sm:text-xl font-black text-emerald-400 mt-0.5 font-mono">2.8 Minutes</span>
          </div>
          <div className="p-3 rounded-xl bg-[#070b16] border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Police CAD Linked</span>
            <span className="text-lg sm:text-xl font-black text-blue-400 mt-0.5 font-mono">Emergency 112 Direct</span>
          </div>
          <div className="p-3 rounded-xl bg-[#070b16] border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Safety Rating</span>
            <span className="text-lg sm:text-xl font-black text-amber-300 mt-0.5 font-mono">96.4% Verified</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Live SOS Distresses & Community Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Distress Broadcasts (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              <span>Live Emergency Distress Broadcasts</span>
            </h3>
            <span className="text-xs text-red-400 font-bold">{alerts.length} Emergency Alerts Active</span>
          </div>

          <div className="space-y-3">
            {alerts.map((al) => {
              const isAssisted = Boolean(assistedIds[al.id]);
              return (
                <div
                  key={al.id}
                  className="p-5 rounded-2xl bg-gradient-to-r from-red-950/70 via-[#0c1220] to-[#0c1220] border border-red-500/50 shadow-xl space-y-3 transition duration-200 hover:border-red-400 hover:scale-101"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white">
                          CRITICAL ALERT
                        </span>
                        <span className="text-xs font-bold text-white">{al.userName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(al.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-red-200">{al.emergencyType}</h4>
                    </div>

                    <span className="text-xs px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono border border-slate-700 font-bold">
                      ID: {al.id}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span className="truncate max-w-xs">{al.location.address}</span>
                    </div>
                    <a
                      href={`https://www.google.com/maps?q=${al.location.lat},${al.location.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1 text-[11px] font-bold"
                    >
                      <span>Route</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Responders status & assist button */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>
                        <strong className="text-emerald-300">{al.communityAssistanceCount}</strong> Community
                        Guardians responded
                      </span>
                    </div>

                    <button
                      onClick={() => handleAssist(al.id)}
                      disabled={isAssisted}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition hover:scale-105 ${
                        isAssisted
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500 cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>{isAssisted ? '✓ You Are Responding' : "I'm Heading There to Assist"}</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {alerts.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-[#0c1220] border border-slate-800 text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-white">No active emergency signals right now.</p>
                <p className="text-[11px] text-slate-500">Your community safety network is operating peacefully.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Verified Incident Reports (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Community Incident Log</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">Verified Citizen Reports</span>
          </div>

          <div className="space-y-3">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="p-4 rounded-2xl bg-[#0c1220]/90 border border-slate-800 space-y-2 hover:border-slate-700 transition duration-200 shadow-xl hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{inc.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.risk === 'HIGH'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {inc.risk} RISK
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-medium">
                  <span className="text-blue-400 font-bold">{inc.zone}</span>
                  <span>•</span>
                  <span>{inc.type}</span>
                  <span>•</span>
                  <span className="font-mono">{inc.time}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{inc.description}</p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Verified by Community Watch</span>
                  </span>
                  <span className="text-slate-500 font-bold text-[10px]">POLICE NOTIFIED</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Report Incident Form */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>Report Suspicious Activity / Safety Hazard</span>
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Incident Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken street lights with suspicious loitering"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#070b16] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Zone Area</label>
                  <select
                    value={reportZone}
                    onChange={(e) => setReportZone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070b16] border border-slate-800 text-white focus:outline-none focus:border-red-500 font-medium"
                  >
                    <option value="Govind Nagar">Govind Nagar</option>
                    <option value="Naubasta">Naubasta</option>
                    <option value="Kalyanpur">Kalyanpur</option>
                    <option value="Barra">Barra</option>
                    <option value="Babupurwa">Babupurwa</option>
                    <option value="Panki">Panki</option>
                    <option value="Swaroop Nagar">Swaroop Nagar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Incident Category</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070b16] border border-slate-800 text-white focus:outline-none focus:border-red-500 font-medium"
                  >
                    <option value="Theft / Snatching">Theft / Snatching</option>
                    <option value="Dark Spot / Broken Light">Dark Spot / Broken Light</option>
                    <option value="Stalking / Harassment">Stalking / Harassment</option>
                    <option value="Suspicious Gathering">Suspicious Gathering</option>
                    <option value="Vehicle Theft Attempt">Vehicle Theft Attempt</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Incident Description & Location Details</label>
                <textarea
                  rows={3}
                  placeholder="Provide landmarks, vehicle descriptions, or specific timing details..."
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#070b16] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-red-600/30 hover:scale-105 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish to Network</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
