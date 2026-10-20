import React, { useEffect } from 'react';
import { AlertOctagon, ShieldAlert, X, Volume2, ArrowRight, Zap, Eye, UserX } from 'lucide-react';
import { ThreatNotification } from '../types/safety';

interface ThreatNotificationToastProps {
  notification: ThreatNotification | null;
  onDismiss: () => void;
  onTriggerSos: (emergencyType: string, snapshot?: string) => void;
  onSoundSiren: () => void;
}

export const ThreatNotificationToast: React.FC<ThreatNotificationToastProps> = ({
  notification,
  onDismiss,
  onTriggerSos,
  onSoundSiren,
}) => {
  if (!notification) return null;

  const isCritical = notification.threatLevel === 'CRITICAL';
  const isHigh = notification.threatLevel === 'HIGH';

  return (
    <aside
      aria-label="Threat Alert Notification"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in fade-in slide-in-from-top-6 duration-300"
    >
      <div
        className={`relative overflow-hidden rounded-2xl border-2 p-4 shadow-2xl backdrop-blur-2xl transition-all duration-300 ${
          isCritical
            ? 'bg-gradient-to-r from-red-950/95 via-red-900/95 to-slate-950/95 border-red-500 shadow-red-600/40 glow-panic'
            : isHigh
            ? 'bg-gradient-to-r from-amber-950/95 via-amber-900/95 to-slate-950/95 border-amber-500 shadow-amber-600/30'
            : 'bg-gradient-to-r from-blue-950/95 via-slate-900/95 to-slate-950/95 border-blue-500 shadow-blue-600/20'
        }`}
      >
        {/* Animated Laser Indicator Strip */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            isCritical
              ? 'bg-gradient-to-r from-red-500 via-rose-300 to-red-500 animate-pulse'
              : 'bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500'
          }`}
        />

        <div className="flex items-start justify-between gap-3">
          {/* Icon Badge */}
          <div className="flex items-start space-x-3.5">
            <div
              className={`p-2.5 rounded-2xl shrink-0 ${
                isCritical
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/50 animate-bounce'
                  : isHigh
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/40'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {isCritical ? (
                <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
              ) : (
                <AlertOctagon className="w-6 h-6 stroke-[2.5]" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider font-mono ${
                    isCritical
                      ? 'bg-red-600 text-white shadow-sm'
                      : isHigh
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {notification.threatLevel} THREAT DETECTED
                </span>

                <span className="text-[11px] font-mono text-slate-300">
                  {new Date(notification.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>

              <h2 className="text-base font-black text-white flex items-center gap-1.5 leading-snug">
                <span>{notification.threatPattern || 'Security Threat Pattern Recognized'}</span>
              </h2>

              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {notification.summary}
              </p>

              {/* Statistics tag */}
              <div className="flex items-center gap-2 pt-1 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-black/40 border border-slate-700 text-slate-300 flex items-center gap-1">
                  <UserX className="w-3 h-3 text-red-400" />
                  <span>
                    Unregistered: <strong className="text-red-400">{notification.unauthorizedCount}</strong>
                  </span>
                </span>
                <span className="px-2 py-0.5 rounded bg-black/40 border border-slate-700 text-slate-300">
                  Total in View: {notification.personCount}
                </span>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-slate-400 hover:text-white transition"
            title="Dismiss Notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={onSoundSiren}
            className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition hover:scale-102"
          >
            <Volume2 className="w-3.5 h-3.5 text-red-400" />
            <span>Sound Alarm Siren</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onDismiss}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              Dismiss
            </button>

            <button
              onClick={() =>
                onTriggerSos(
                  `Automated Threat Pattern: ${notification.threatPattern} - ${notification.summary}`,
                  notification.snapshot
                )
              }
              className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-600/40 hover:scale-105 transition"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Broadcast SOS Now</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
