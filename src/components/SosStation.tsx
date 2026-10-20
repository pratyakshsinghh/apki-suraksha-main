import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  MapPin,
  Phone,
  Send,
  CheckCircle2,
  Share2,
  ShieldAlert,
  Clock,
  Compass,
  Radio,
  UserCheck,
  Volume2,
  RefreshCw,
  ExternalLink,
  Mic,
  Zap,
} from 'lucide-react';
import { GeoLocationData, EmergencyContact, SosAlert } from '../types/safety';
import { audioAlertService } from '../utils/audioAlerts';

interface SosStationProps {
  currentLocation: GeoLocationData;
  onRefreshLocation: () => void;
  onSetSimulatedLocation: (zoneKey: string) => void;
  contacts: EmergencyContact[];
  onOpenContactsModal: () => void;
  activeAlert: SosAlert | null;
  onTriggerSos: (emergencyType: string, source: 'MANUAL_BUTTON' | 'AI_CAMERA_DETECTION' | 'VOICE_COMMAND') => void;
  onResolveSos: (alertId: string) => void;
}

export const SosStation: React.FC<SosStationProps> = ({
  currentLocation,
  onRefreshLocation,
  onSetSimulatedLocation,
  contacts,
  onOpenContactsModal,
  activeAlert,
  onTriggerSos,
  onResolveSos,
}) => {
  const [selectedEmergency, setSelectedEmergency] = useState<string>('Physical Attack / Severe Danger');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [dispatchSuccessToast, setDispatchSuccessToast] = useState<string | null>(null);

  const emergencyCategories = [
    { id: 'attack', label: 'Physical Attack / Danger', icon: '🚨', urgency: 'CRITICAL' },
    { id: 'stalking', label: 'Suspicious Persons Following', icon: '👀', urgency: 'HIGH' },
    { id: 'snatching', label: 'Robbery / Snatching Attempt', icon: '⚠️', urgency: 'HIGH' },
    { id: 'harassment', label: 'Night Harassment / Hostile Threat', icon: '🛡️', urgency: 'CRITICAL' },
    { id: 'breakin', label: 'Home Intrusion / Break-in', icon: '🚪', urgency: 'CRITICAL' },
    { id: 'medical', label: 'Medical Emergency / Accident', icon: '🚑', urgency: 'HIGH' },
  ];

  // 3-second abort countdown before firing
  useEffect(() => {
    let timer: any;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCountdown(null);
      executeTrigger();
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleStartCountdown = () => {
    if (activeAlert) return;
    setCountdown(3);
  };

  const handleAbortCountdown = () => {
    setCountdown(null);
  };

  const executeTrigger = () => {
    onTriggerSos(selectedEmergency, 'MANUAL_BUTTON');
    audioAlertService.startSiren();
    audioAlertService.speakAnnouncement('Emergency SOS activated. Location transmitted to police and nearby community.');
    setDispatchSuccessToast('Emergency broadcast transmitted to Police Control Room and contacts!');
    setTimeout(() => setDispatchSuccessToast(null), 7000);
  };

  // Test voice command simulation
  const handleSimulateVoiceCommand = () => {
    audioAlertService.speakAnnouncement('Voice command verified: Please start SOS alert. Transmitting emergency signal.');
    onTriggerSos('Voice Command Trigger: "Please start SOS alert"', 'VOICE_COMMAND');
    audioAlertService.startSiren();
    setDispatchSuccessToast('Voice Command Recognized: "Please start SOS alert" — SOS Activated!');
    setTimeout(() => setDispatchSuccessToast(null), 7000);
  };

  const mapsUrl = `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`;
  const emergencyMessage = `EMERGENCY SOS: I need immediate help! My live location: ${currentLocation.address} (${mapsUrl}). Broadcast via Apki Suraksha.`;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {dispatchSuccessToast && (
        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 flex items-center justify-between shadow-xl animate-fade-in backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-sm">Emergency Broadcast Active</p>
              <p className="text-xs text-emerald-300/80">{dispatchSuccessToast}</p>
            </div>
          </div>
          <button
            onClick={() => setDispatchSuccessToast(null)}
            className="text-xs px-2.5 py-1 rounded bg-emerald-900 hover:bg-emerald-800 text-emerald-100 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ACTIVE EMERGENCY BANNER */}
      {activeAlert && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950 via-red-900 to-rose-950 text-white border-2 border-red-500 p-6 shadow-2xl shadow-red-900/50 glow-panic">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="flex h-3.5 w-3.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white"></span>
                </span>
                <span className="px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider bg-black/40 text-white border border-red-400">
                  LIVE SOS TRANSMITTING • ID: {activeAlert.id}
                </span>
                <span className="text-xs text-red-200 font-mono">
                  {new Date(activeAlert.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <AlertOctagon className="w-6 h-6 text-red-400 animate-pulse" />
                <span>{activeAlert.emergencyType}</span>
              </h2>
              <p className="text-xs sm:text-sm text-red-200 flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                <span>{activeAlert.location.address}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => audioAlertService.startSiren()}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-600/40 hover:scale-105 transition"
              >
                <Volume2 className="w-4 h-4" />
                <span>Sound Siren</span>
              </button>
              <button
                onClick={() => onResolveSos(activeAlert.id)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/40 hover:scale-105 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I AM SAFE (STAND DOWN)</span>
              </button>
            </div>
          </div>

          {/* Real-time Responders Grid */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activeAlert.responders.map((resp, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-black/40 border border-red-500/30 flex items-center justify-between text-white">
                <div>
                  <p className="text-xs font-bold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{resp.name}</span>
                  </p>
                  <p className="text-[11px] text-red-200/80">{resp.role}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-amber-300 px-2 py-0.5 rounded bg-black/50 border border-amber-400/40 font-mono">
                    ETA ~{resp.etaMinutes}m
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Direct Outbound Emergency Links */}
          <div className="mt-4 pt-3 border-t border-red-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-red-200 font-medium">Direct Outbound Emergency Links:</span>
            <div className="flex items-center gap-2">
              <a
                href={`sms:112?body=${encodeURIComponent(emergencyMessage)}`}
                className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-white font-semibold flex items-center gap-1 border border-slate-700 hover:scale-105 transition"
              >
                <Send className="w-3.5 h-3.5 text-blue-400" />
                <span>Send SMS to 112</span>
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(emergencyMessage)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-200 font-bold flex items-center gap-1 border border-emerald-600 hover:scale-105 transition"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Broadcast</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Panic Button Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Big Panic Trigger & Voice Activation (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 rounded-2xl bg-[#0c1220]/90 border border-slate-800 shadow-2xl backdrop-blur-xl relative overflow-hidden transition duration-300 hover:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  <span>One-Tap Panic Alert</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Instantly transmits your coordinates to Police Emergency 112, emergency contacts & nearby community guardians
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-600/70 flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Sentinel Armed</span>
              </span>
            </div>

            {/* Emergency Type Selector */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Select Situation Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {emergencyCategories.map((cat) => {
                  const isSelected = selectedEmergency === cat.label;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedEmergency(cat.label)}
                      className={`p-2.5 rounded-xl text-left transition-all duration-200 border text-xs font-semibold flex flex-col justify-between hover:scale-102 ${
                        isSelected
                          ? 'bg-red-950/90 border-red-500 text-white shadow-lg shadow-red-950 ring-1 ring-red-500'
                          : 'bg-[#080d1a] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="text-base mb-1">{cat.icon}</span>
                      <span className="line-clamp-2 leading-tight">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BIG PANIC BUTTON */}
            <div className="flex flex-col items-center justify-center py-6 sm:py-8">
              {countdown !== null ? (
                /* Abort Countdown Screen */
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative flex items-center justify-center">
                    <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-red-950/40 border-4 border-dashed border-red-500 flex items-center justify-center animate-spin"></div>
                    <span className="absolute text-5xl sm:text-6xl font-black text-red-500 font-mono animate-pulse">
                      {countdown}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-400">Transmitting Emergency SOS...</h3>
                    <p className="text-xs text-slate-400">Press cancel below if clicked by mistake</p>
                  </div>
                  <button
                    onClick={handleAbortCountdown}
                    className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shadow-lg border border-slate-600 hover:scale-105 transition"
                  >
                    ABORT / CANCEL SOS
                  </button>
                </div>
              ) : (
                /* Primary Panic Button with Intense Glowing Halos */
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-full blur-2xl opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse"></div>

                  <button
                    onClick={handleStartCountdown}
                    disabled={Boolean(activeAlert)}
                    className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 shadow-2xl ${
                      activeAlert
                        ? 'bg-red-950/80 border-red-500/50 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-b from-red-600 via-red-700 to-rose-900 border-red-400 text-white hover:brightness-110 shadow-red-600/50 hover:scale-105'
                    }`}
                  >
                    <AlertOctagon className="w-12 h-12 sm:w-14 sm:h-14 mb-2 drop-shadow stroke-[2.5]" />
                    <span className="text-2xl sm:text-3xl font-black tracking-wider uppercase">
                      {activeAlert ? 'SOS ACTIVE' : 'SOS PANIC'}
                    </span>
                    <span className="text-[11px] font-semibold text-red-200 mt-1 uppercase tracking-widest">
                      {activeAlert ? 'Transmitting' : 'Press to Alert'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick emergency hotkeys */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>3-second verification countdown prevents false alarms</span>
              </span>
              <span className="text-slate-500">
                Encrypted via Realtime Safety Cloud
              </span>
            </div>
          </div>

          {/* DEDICATED VOICE COMMAND ACTIVATION CARD */}
          <div className="p-5 rounded-2xl bg-[#0c1220]/90 border border-amber-500/40 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition duration-300 hover:border-amber-500/70 hover:shadow-amber-500/10">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-600/70 text-amber-400">
                  <Mic className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Voice Command SOS Activation</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-600 font-mono font-bold">
                      Hands-Free
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Say aloud: <strong className="text-amber-300 font-mono">"Please start SOS alert"</strong> or <strong className="text-amber-300 font-mono">"Turn on SOS alert"</strong>
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSimulateVoiceCommand}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/50 flex items-center gap-1.5 transition hover:scale-105 shadow-md whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate "Please start SOS alert"</span>
            </button>
          </div>
        </div>

        {/* Right Column: Automated Geolocation & Contact Notification (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Geolocation Card */}
          <div className="p-5 rounded-2xl bg-[#0c1220]/90 border border-slate-800 shadow-xl backdrop-blur-xl space-y-4 transition duration-300 hover:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-blue-950 border border-blue-800/60 text-blue-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Automated Geolocation</h3>
                  <p className="text-[11px] text-slate-400">Live GPS Coordinates & Address</p>
                </div>
              </div>
              <button
                onClick={onRefreshLocation}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition border border-slate-700"
                title="Refresh Real GPS"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Location display box */}
            <div className="p-3.5 rounded-xl bg-[#070b16] border border-slate-800/90 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1 font-mono font-medium">
                  <Compass className="w-3.5 h-3.5 text-blue-400" />
                  {currentLocation.lat.toFixed(4)}° N, {currentLocation.lng.toFixed(4)}° E
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono text-[10px] border border-blue-800 font-bold">
                  ±{currentLocation.accuracy || 8}m Precision
                </span>
              </div>
              <p className="text-xs font-bold text-white leading-relaxed">
                {currentLocation.address}
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Regional Safety Grid</span>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Verify on Map</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Quick Test Hotspot Locations */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 block">
                Quick Test with High-Risk Red Zones:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { key: 'govind-nagar', name: 'Govind Nagar', type: 'Red Zone' },
                  { key: 'naubasta', name: 'Naubasta Highway', type: 'Red Zone' },
                  { key: 'kalyanpur', name: 'Kalyanpur GT Road', type: 'Red Zone' },
                  { key: 'swaroop-nagar', name: 'Swaroop Nagar', type: 'Green Zone' },
                ].map((z) => (
                  <button
                    key={z.key}
                    onClick={() => onSetSimulatedLocation(z.key)}
                    className="p-1.5 rounded-lg bg-[#070b16] hover:bg-slate-800 border border-slate-800 text-left text-xs transition hover:scale-102"
                  >
                    <div className="font-bold text-slate-200 text-[11px]">{z.name}</div>
                    <div className={`text-[10px] font-semibold ${z.type === 'Red Zone' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {z.type}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Notification Functionality */}
          <div className="p-5 rounded-2xl bg-[#0c1220]/90 border border-slate-800 shadow-xl backdrop-blur-xl space-y-4 transition duration-300 hover:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-800/60 text-emerald-400">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Emergency Notification Chain</h3>
                  <p className="text-[11px] text-slate-400">Automated SMS, Call & Push Alert</p>
                </div>
              </div>
              <button
                onClick={onOpenContactsModal}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold underline"
              >
                Manage ({contacts.length})
              </button>
            </div>

            {/* Contacts list */}
            <div className="space-y-2">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-xl bg-[#070b16] border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{c.name}</span>
                        {c.isPrimary && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800 font-extrabold">
                            PRIORITY
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{c.relation} • {c.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                      Auto-SMS
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Test Outbound Dispatch Button */}
            <div className="pt-2">
              <a
                href={`sms:112?body=${encodeURIComponent(emergencyMessage)}`}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md border border-slate-700 hover:scale-102"
              >
                <Send className="w-3.5 h-3.5 text-blue-400" />
                <span>Test Emergency Dispatch Message</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
