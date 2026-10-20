import React, { useState } from 'react';
import {
  ShieldAlert,
  Cpu,
  Mic,
  Activity,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sliders,
  Terminal,
  Volume2,
  Lock,
  Layers,
} from 'lucide-react';
import { audioAlertService } from '../utils/audioAlerts';

interface CaseStudyAndIotProps {
  onTriggerSos: (emergencyType: string, source: 'IOT_SENSOR' | 'VOICE_COMMAND') => void;
}

export const CaseStudyAndIot: React.FC<CaseStudyAndIotProps> = ({ onTriggerSos }) => {
  const [comparisonMode, setComparisonMode] = useState<'after' | 'before'>('after');

  // IoT Hardware Simulation states (ESP32-CAM + Sensors)
  const [pirMotionDetected, setPirMotionDetected] = useState<boolean>(false);
  const [soundDbLevel, setSoundDbLevel] = useState<number>(38);
  const [iotSerialLogs, setIotSerialLogs] = useState<string[]>([
    '[BOOT] ESP32-WROOM-32 connected to WiFi "SurakshaNet_Node"',
    '[MQTT] Subscribed to cloud topic: kanpur/swaroop_nagar/node_01',
    '[PIR] HC-SR501 Passive Infrared Sensor initialized (PIN 22: LOW)',
    '[MIC] MAX4466 Sound Sensor listening for acoustic distress (Ambient 38 dB)',
    '[VOICE] Listening for speech hotword: "Please start SOS alert"',
    '[READY] IoT Sentinel Armed. Waiting for event trigger...',
  ]);

  const addIotLog = (msg: string) => {
    setIotSerialLogs((prev) => [...prev.slice(-8), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Simulate PIR Motion Sensor trigger
  const handleTriggerPir = () => {
    setPirMotionDetected(true);
    addIotLog('⚠️ [PIR TRIGGER] GPIO 22 HIGH! Unregistered human motion detected at perimeter!');
    addIotLog('📸 [ESP32-CAM] Auto-capturing night vision snapshot frame 0x4A1F');
    addIotLog('🚨 [CLOUD RELAY] Transmitting auto-SOS payload to Apki Suraksha server...');
    audioAlertService.playThreatAlarm();
    onTriggerSos('IoT Perimeter Sensor: Intruder Motion Detected at Door', 'IOT_SENSOR');
    setTimeout(() => setPirMotionDetected(false), 4000);
  };

  // Simulate High Decibel Distress Scream trigger
  const handleTriggerScream = () => {
    setSoundDbLevel(94);
    addIotLog('🔊 [ACOUSTIC DETECT] Sound Spike: 94 dB! High frequency human distress/scream profile matched!');
    addIotLog('⚡ [AUTO-ACTION] Auto-activates SOS without manual touch!');
    audioAlertService.startSiren();
    onTriggerSos('IoT Acoustic Sensor: High Distress Scream / Glass Shatter (94 dB)', 'IOT_SENSOR');
    setTimeout(() => setSoundDbLevel(38), 4000);
  };

  // Simulate Voice Command "Please start SOS alert" trigger (English only)
  const handleTriggerVoice = () => {
    addIotLog('🎙️ [VOICE RECOGNIZER] Matched voice hotword: "PLEASE START SOS ALERT"');
    addIotLog('🚨 [SOS DISPATCH] Instant hands-free panic broadcast triggered');
    audioAlertService.speakAnnouncement('Voice command detected: Please start SOS alert. Dispatching emergency response now.');
    onTriggerSos('Voice Command Trigger: "Please start SOS alert"', 'VOICE_COMMAND');
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: Case Study Comparison (Swaroop Nagar) */}
      <div className="p-5 rounded-2xl bg-[#0c1220]/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-5 transition duration-300 hover:border-slate-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-red-950 border border-red-800/60 text-red-400">
                <Layers className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Case Study: Swaroop Nagar Night Burglary</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  PDF Case Analysis
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Real-world scenario comparison: Traditional delay vs Apki Suraksha automated intervention
            </p>
          </div>

          <div className="flex rounded-xl bg-[#070b16] p-1 border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setComparisonMode('before')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
                comparisonMode === 'before'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Before Apki Suraksha
            </button>
            <button
              onClick={() => setComparisonMode('after')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
                comparisonMode === 'after'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              After Apki Suraksha
            </button>
          </div>
        </div>

        {/* Interactive Comparison Side-by-Side Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* BEFORE CARD */}
          <div
            className={`p-5 rounded-2xl border transition-all duration-300 hover:scale-101 ${
              comparisonMode === 'before'
                ? 'bg-red-950/40 border-red-500 shadow-xl shadow-red-950/30'
                : 'bg-[#080d1a]/80 border-slate-800 opacity-75'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                Before Apki Suraksha
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Location: Swaroop Nagar Area</span>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-black/40 border border-red-900/40 space-y-1">
                <p className="font-bold text-white">Midnight Intrusion</p>
                <p className="text-slate-400">Family asleep at night. Thief enters house silently over gate.</p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-red-900/40 space-y-1">
                <p className="font-bold text-red-300">Valuables Stolen Undetected</p>
                <p className="text-slate-400">Gold & cash taken before anyone in household or alley notices.</p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-red-900/40 space-y-1">
                <p className="font-bold text-red-400">Fatal Communication Delay</p>
                <p className="text-slate-400">Neighbours and police informed hours too late in morning. Culprit escapes.</p>
              </div>
            </div>
          </div>

          {/* AFTER CARD */}
          <div
            className={`p-5 rounded-2xl border transition-all duration-300 hover:scale-101 ${
              comparisonMode === 'after'
                ? 'bg-emerald-950/40 border-emerald-500 shadow-xl shadow-emerald-950/30'
                : 'bg-[#080d1a]/80 border-slate-800 opacity-75'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                After Apki Suraksha
              </span>
              <span className="text-[11px] text-emerald-300 font-bold">Active Community Protection</span>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-black/40 border border-emerald-900/40 space-y-1">
                <p className="font-bold text-emerald-300">Instant Camera & Sensor Motion Detection</p>
                <p className="text-slate-400">Suspicious prowler recognized within 0.8 seconds at entryway.</p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-emerald-900/40 space-y-1">
                <p className="font-bold text-emerald-300">Siren + Push Notification to Neighbors</p>
                <p className="text-slate-400">Loud siren wails; alert pops up on owner phone + 18 nearby residents.</p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-emerald-900/40 space-y-1">
                <p className="font-bold text-emerald-300">Police Dispatched in Minutes</p>
                <p className="text-slate-400">Police PCR arrives at spot within 3 minutes — theft successfully prevented!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: IoT Hardware Integration & Future Flow Simulator */}
      <div className="p-5 rounded-2xl bg-[#0c1220]/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-5 transition duration-300 hover:border-slate-700">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>IoT Hardware Integration Simulator (ESP32-CAM)</span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold">
                Hardware Architecture
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            "Sensors detect unusual motion or distress sounds, auto-triggering SOS even if the victim can't act."
          </p>
        </div>

        {/* Sensor Trigger Virtual Buttons with Hover Effects */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* PIR Sensor */}
          <div className="p-4 rounded-xl bg-[#070b16] border border-slate-800 space-y-3 transition duration-200 hover:border-slate-700 hover:scale-102">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">PIR Motion Sensor</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  pirMotionDetected ? 'bg-red-950 text-red-300 border border-red-700 animate-pulse' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {pirMotionDetected ? 'TRIGGERED' : 'IDLE'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              HC-SR501 infrared sensor detecting human movement at gate
            </p>
            <button
              onClick={handleTriggerPir}
              className="w-full py-2 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-200 text-xs font-bold border border-red-700 transition hover:scale-102"
            >
              Simulate Intruder Motion
            </button>
          </div>

          {/* Sound / Scream Sensor */}
          <div className="p-4 rounded-xl bg-[#070b16] border border-slate-800 space-y-3 transition duration-200 hover:border-slate-700 hover:scale-102">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Acoustic Scream Sensor</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700">
                {soundDbLevel} dB
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Auto-activates emergency when loud scream / distress sound exceeds threshold
            </p>
            <button
              onClick={handleTriggerScream}
              className="w-full py-2 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-200 text-xs font-bold border border-amber-700 transition hover:scale-102"
            >
              Simulate Scream Spike (94 dB)
            </button>
          </div>

          {/* Voice Command SOS (Specifically featuring "Please start SOS alert") */}
          <div className="p-4 rounded-xl bg-[#070b16] border border-slate-800 space-y-3 transition duration-200 hover:border-slate-700 hover:scale-102">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Voice Command SOS</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                "Start SOS"
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Say phrase: <strong className="text-emerald-400">"Please start SOS alert"</strong>
            </p>
            <button
              onClick={handleTriggerVoice}
              className="w-full py-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 text-xs font-bold border border-emerald-700 transition hover:scale-102"
            >
              Simulate "Please start SOS alert"
            </button>
          </div>
        </div>

        {/* Virtual ESP32 Serial Monitor Console */}
        <div className="p-3.5 rounded-xl bg-black border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Terminal className="w-3.5 h-3.5" />
              <span>ESP32-CAM Serial Monitor (115200 baud)</span>
            </span>
            <span>Firmware v2.4-Suraksha</span>
          </div>
          <div className="font-mono text-xs text-emerald-400/90 space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
            {iotSerialLogs.map((log, idx) => (
              <div key={idx} className="leading-tight">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: Why Apki Suraksha Stands Apart Table */}
      <div className="p-5 rounded-2xl bg-[#0c1220]/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-4 transition duration-300 hover:border-slate-700">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Why Apki Suraksha Stands Apart (Architectural Comparison)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold bg-[#070b16]">
                <th className="py-2.5 px-3">Feature</th>
                <th className="py-2.5 px-3">Other Safety Apps</th>
                <th className="py-2.5 px-3 text-red-400">Apki Suraksha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/30 transition">
                <td className="py-2.5 px-3 font-bold text-white">Focus</td>
                <td className="py-2.5 px-3 text-slate-400">Individual safety (primarily for women only)</td>
                <td className="py-2.5 px-3 text-emerald-300 font-bold">Community safety network for everyone</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition">
                <td className="py-2.5 px-3 font-bold text-white">Alert System</td>
                <td className="py-2.5 px-3 text-slate-400">Sends SOS only to pre-selected contacts</td>
                <td className="py-2.5 px-3 text-emerald-300 font-bold">Notifies nearby users + police + family instantly</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition">
                <td className="py-2.5 px-3 font-bold text-white">Voice & Speech</td>
                <td className="py-2.5 px-3 text-slate-400">No hands-free voice trigger</td>
                <td className="py-2.5 px-3 text-emerald-300 font-bold">Triggers on: "Please start SOS alert" / "Help me"</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition">
                <td className="py-2.5 px-3 font-bold text-white">Technology</td>
                <td className="py-2.5 px-3 text-slate-400">GPS & SMS alerts only</td>
                <td className="py-2.5 px-3 text-emerald-300 font-bold">Real-time Cloud + IoT + AI Camera Person Counting</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition">
                <td className="py-2.5 px-3 font-bold text-white">Hardware / AI</td>
                <td className="py-2.5 px-3 text-slate-400">Static smartphone app</td>
                <td className="py-2.5 px-3 text-emerald-300 font-bold">ESP32-CAM sensors, voice SOS & predictive AI</td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition">
                <td className="py-2.5 px-3 font-bold text-white">Impact Goal</td>
                <td className="py-2.5 px-3 text-slate-400">Personal protection</td>
                <td className="py-2.5 px-3 text-emerald-300 font-bold">Transform Red Zones into safe Green Zones</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
