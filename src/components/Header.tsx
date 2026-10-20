import React from 'react';
import { Shield, AlertTriangle, Radio, PhoneCall, Volume2, VolumeX, Mic, MicOff, MapPin, Users, BarChart3 } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSirenPlaying: boolean;
  onToggleSiren: () => void;
  isVoiceListening: boolean;
  onToggleVoice: () => void;
  activeAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isSirenPlaying,
  onToggleSiren,
  isVoiceListening,
  onToggleVoice,
  activeAlertCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0a0f1d]/90 backdrop-blur-xl border-b border-slate-800/80 text-slate-100 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Top bar with branding and emergency quick actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center space-x-2.5">
              <div className="relative group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 group-hover:shadow-red-500/50 transition duration-300">
                  <Shield className="w-5 h-5 text-white stroke-[2.5]" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                    APKI SURAKSHA
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/80 uppercase tracking-widest shadow-sm">
                      Live Grid
                    </span>
                  </h1>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                  <span className="text-slate-300">"Your Safety, Our Mission"</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-amber-400 font-semibold">Community Safety Hub</span>
                </p>
              </div>
            </div>

            {/* Mobile quick siren toggle */}
            <div className="flex items-center gap-1.5 sm:hidden">
              <button
                onClick={onToggleSiren}
                className={`p-2 rounded-lg font-semibold text-xs flex items-center gap-1 transition-all ${
                  isSirenPlaying
                    ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/60'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
                }`}
                title="Emergency Siren"
              >
                {isSirenPlaying ? <Volume2 className="w-4 h-4 animate-bounce" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Real-time system status pills and emergency controls */}
          <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
            {/* Live active alerts badge */}
            {activeAlertCount > 0 && (
              <button
                onClick={() => setActiveTab('sos')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/90 border border-red-500/70 text-red-300 text-xs font-bold animate-pulse hover:bg-red-900 hover:scale-105 transition-all shadow-lg shadow-red-900/40"
              >
                <Radio className="w-3.5 h-3.5 text-red-400 animate-spin" />
                <span>{activeAlertCount} Emergency SOS Active</span>
              </button>
            )}

            {/* Voice Command SOS trigger */}
            <button
              onClick={onToggleVoice}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 hover:scale-102 ${
                isVoiceListening
                  ? 'bg-amber-950/90 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800/90'
              }`}
              title="Voice SOS Recognition (Say 'Please start SOS alert')"
            >
              {isVoiceListening ? (
                <>
                  <Mic className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Voice SOS: Say "Please start SOS alert"</span>
                </>
              ) : (
                <>
                  <MicOff className="w-3.5 h-3.5 text-slate-500" />
                  <span>Voice SOS: Standby</span>
                </>
              )}
            </button>

            {/* Emergency Siren Synthesizer Button */}
            <button
              onClick={onToggleSiren}
              className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 hover:scale-102 ${
                isSirenPlaying
                  ? 'bg-red-600 border-red-500 text-white animate-pulse shadow-lg shadow-red-600/50'
                  : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-red-700 hover:text-red-400 hover:bg-slate-800/90'
              }`}
            >
              {isSirenPlaying ? (
                <>
                  <Volume2 className="w-4 h-4 animate-bounce" />
                  <span>SIREN WAILING (STOP)</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-400" />
                  <span>Emergency Siren</span>
                </>
              )}
            </button>

            {/* Quick Police Direct Call */}
            <a
              href="tel:112"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all duration-200 shadow-md shadow-emerald-600/30 hover:scale-102 hover:shadow-emerald-500/40"
              title="Dial Police Emergency 112 directly"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Police 112</span>
            </a>
          </div>
        </div>

        {/* Navigation Tabs with Hover Effects */}
        <nav className="mt-3 flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-800/70 pt-2">
          {[
            { id: 'camera', label: 'AI Camera Sentinel & Person Count', icon: Shield },
            { id: 'sos', label: 'Emergency SOS Station', icon: AlertTriangle, badge: activeAlertCount > 0 ? `${activeAlertCount}` : undefined },
            { id: 'analytics', label: '30-Day Trends & Safety Analytics', icon: BarChart3 },
            { id: 'zones', label: 'Crime Hotspots & Safe Zones', icon: MapPin },
            { id: 'community', label: 'Community Guardian Circle', icon: Users },
            { id: 'iot-case', label: 'Before / After & IoT Systems', icon: Radio },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-102 border border-red-500/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850 hover:border-slate-700/80 border border-transparent hover:-translate-y-0.5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-950 text-red-300 text-[10px] font-extrabold border border-red-500 animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
