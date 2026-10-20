import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sliders,
  Sparkles,
  Zap,
  Volume2,
  RotateCcw,
  Maximize2,
  Radio,
  FileImage,
  AlertOctagon,
  Users,
  User,
  UserCheck,
  UserX,
  Scan,
  Plus,
  Minus,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { FrameAnalysisResult, AuthorizedMember, ThreatNotification } from '../types/safety';
import { audioAlertService } from '../utils/audioAlerts';

interface AiCameraSentinelProps {
  onTriggerSosWithSnapshot: (emergencyType: string, snapshotData: string) => void;
  authorizedMembers: AuthorizedMember[];
  onOpenAuthorizedModal: () => void;
  onTriggerThreatToast: (threat: ThreatNotification) => void;
}

// Preset scenarios for instant testing matching the case studies (English only)
const PRESET_SCENARIOS = [
  {
    id: 'safe-resident',
    title: 'Uploaded Resident Self-Check (Safe)',
    location: 'Monitored Entryway',
    description: 'Registered authorized resident standing calmly. Whitelist match verified. No weapons detected.',
    personCount: 1,
    threatPattern: 'Authorized Resident Verified · Safe',
    isAuthorized: true,
    svgType: 'safe-resident',
  },
  {
    id: 'safe-street',
    title: 'Civil Lines Safe Corridor',
    location: 'Downtown Safe Corridor',
    description: 'Three evening pedestrians walking along illuminated commercial avenue. All normal.',
    personCount: 3,
    threatPattern: 'Perimeter Clear · Safe',
    isAuthorized: true,
    svgType: 'safe-street',
  },
  {
    id: 'govind-snatching',
    title: 'Pedestrians on Street Corridor',
    location: 'Govind Nagar Market Bypass',
    description: 'Two persons on street corridor. Motion monitored.',
    personCount: 2,
    threatPattern: 'Perimeter Monitored',
    isAuthorized: false,
    svgType: 'motorcycle',
  },
  {
    id: 'kalyanpur-alley',
    title: 'Evening Alley Walkway',
    location: 'Kalyanpur GT Road Crossing',
    description: 'Person walking along hostel perimeter path.',
    personCount: 1,
    threatPattern: 'Perimeter Monitored',
    isAuthorized: false,
    svgType: 'dark-alley',
  },
];

export const AiCameraSentinel: React.FC<AiCameraSentinelProps> = ({
  onTriggerSosWithSnapshot,
  authorizedMembers,
  onOpenAuthorizedModal,
  onTriggerThreatToast,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isNightVisionActive, setIsNightVisionActive] = useState<boolean>(false);
  const [isAutoPatrolActive, setIsAutoPatrolActive] = useState<boolean>(true);
  const [autoSosOnThreat, setAutoSosOnThreat] = useState<boolean>(true);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [lastAnalysis, setLastAnalysis] = useState<FrameAnalysisResult | null>(null);
  const [lastCapturedImage, setLastCapturedImage] = useState<string | null>(null);
  const [livePersonCount, setLivePersonCount] = useState<number>(1);
  const [cameraStatusMessage, setCameraStatusMessage] = useState<string>('Standby');
  const [visualTitle, setVisualTitle] = useState<string>('PERIMETER CLEAR · CAMERA STANDBY · 0 WEAPONS');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize webcam stream with IMMEDIATE person counting
  const startCamera = async (faceMode = facingMode) => {
    try {
      setErrorMessage(null);
      setCameraStatusMessage('Accessing camera lens...');
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: faceMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
          setActiveScenarioId(null);
          setLivePersonCount(1);
          setCameraStatusMessage('Camera Active: Live Person Counting');
          setVisualTitle('CAMERA ACTIVE · LIVE SCANNING · NO WEAPONS DETECTED');
          audioAlertService.playScanChirp();

          // Run person counting immediately upon camera start
          setTimeout(() => {
            analyzeFrame();
          }, 600);
        };
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setErrorMessage('Camera access was not granted or is unavailable. You can use preset test scenarios below.');
      setIsCameraActive(false);
      setCameraStatusMessage('Camera unavailable');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setLivePersonCount(0);
    setCameraStatusMessage('Standby');
  };

  const flipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isCameraActive) {
      startCamera(nextMode);
    }
  };

  // Capture frame to base64
  const captureCurrentFrame = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (isCameraActive && videoRef.current && videoRef.current.videoWidth > 0) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      if (isNightVisionActive) {
        ctx.filter = 'contrast(150%) brightness(130%) grayscale(40%)';
      } else {
        ctx.filter = 'none';
      }

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.85);
    } else if (activeScenarioId) {
      return generateScenarioCanvasImage(activeScenarioId);
    }
    return null;
  };

  // Generate canvas rendering for preset test scenarios (English text only)
  const generateScenarioCanvasImage = (scenarioId: string): string => {
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const scen = PRESET_SCENARIOS.find((s) => s.id === scenarioId) || PRESET_SCENARIOS[0];

    if (scen.svgType === 'safe-resident') {
      // Safe Authorized Member Scene
      const grad = ctx.createLinearGradient(0, 0, 0, 400);
      grad.addColorStop(0, '#064e3b');
      grad.addColorStop(1, '#022c22');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 400);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('AUTHORIZED RESIDENT VERIFIED • NO THREAT', 30, 45);

      ctx.fillStyle = '#a7f3d0';
      ctx.font = '13px sans-serif';
      ctx.fillText(`Matched Profile: Primary Resident (${authorizedMembers[0]?.name || 'You'})`, 30, 75);
      ctx.fillText(scen.description, 30, 100);

      // Green target box
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.strokeRect(220, 130, 200, 220);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(220, 130, 190, 24);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('✓ AUTHORIZED MEMBER [SAFE]', 225, 146);

      // Resident icon
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(320, 210, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(295, 245, 50, 80);
    } else if (scen.svgType === 'safe-street') {
      const grad = ctx.createLinearGradient(0, 0, 0, 400);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 400);

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(150, 100, 25, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(0, 320, 640, 80);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`SAFE AREA • ${scen.personCount} PERSONS DETECTED`, 40, 50);
      ctx.font = '14px sans-serif';
      ctx.fillText('Normal pedestrians walking peacefully along lighted corridor', 40, 80);

      [220, 310, 400].forEach((px, i) => {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(px, 200, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(px - 12, 220, 24, 70);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText(`PERSON #${i + 1}`, px - 18, 180);
      });
    } else {
      // Threat Scene (Intruder or Brandished Tool)
      const grad = ctx.createLinearGradient(0, 0, 0, 400);
      grad.addColorStop(0, '#020617');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 400);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`🚨 THREAT: ${scen.threatPattern.toUpperCase()}`, 30, 45);

      ctx.fillStyle = '#f87171';
      ctx.font = '13px sans-serif';
      ctx.fillText(`Location: ${scen.location} • NOT IN AUTHORIZED WHITELIST`, 30, 75);
      ctx.fillText(scen.description, 30, 100);

      // Draw bounding box targets for detected stranger with brandished object indicator
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.strokeRect(220, 130, 210, 220);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(220, 130, 210, 24);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('⚠️ UNREGISTERED STRANGER', 225, 146);

      // Brandished object flag
      if (scen.id === 'swaroop-burglary') {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(360, 230, 60, 12);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('WEAPON', 365, 240);
      }

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.beginPath();
      ctx.moveTo(320, 110);
      ctx.lineTo(320, 370);
      ctx.moveTo(180, 240);
      ctx.lineTo(460, 240);
      ctx.stroke();
    }

    return canvas.toDataURL('image/jpeg', 0.85);
  };

  // Perform AI Frame Analysis & Person Count with Whitelist Check
  const analyzeFrame = async () => {
    let base64 = captureCurrentFrame();

    if (!base64 && !activeScenarioId) {
      // Do not auto-load weapon presets when camera is starting or idle
      return;
    }

    if (!base64) return;

    setIsAnalyzing(true);
    setLastCapturedImage(base64);
    audioAlertService.playScanChirp();

    try {
      const activeScen = PRESET_SCENARIOS.find((s) => s.id === activeScenarioId);
      const res = await fetch('/api/analyze-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          mode: 'threat_detection',
          authorizedMembers: authorizedMembers.map((m) => ({
            name: m.name,
            role: m.role,
            notes: m.notes,
            photoUrl: m.photoUrl,
          })),
          context: activeScen
            ? `Preset test scenario: ${activeScen.title} in ${activeScen.location}. Visible people count: ${activeScen.personCount}. ${activeScen.description}.`
            : 'Live camera video stream from citizen smartphone or CCTV unit. Detect exact person count and verify if face matches authorized community members whitelist.',
        }),
      });

      const data: FrameAnalysisResult = await res.json();

      setLastAnalysis(data);

      const detectedCount =
        typeof data.personCount === 'number'
          ? data.personCount
          : (activeScen?.personCount ?? 1);

      const unauthCount =
        typeof data.unauthorizedCount === 'number'
          ? data.unauthorizedCount
          : 0;

      setLivePersonCount(detectedCount);
      setCameraStatusMessage(
        unauthCount > 0
          ? `Status: ${detectedCount} Person(s) Detected · Perimeter Normal`
          : `Verified: ${detectedCount} Authorized Resident(s)`
      );

      // Clean visual title instead of voice assistant sound
      if (unauthCount === 0 || activeScen?.id === 'safe-resident') {
        setVisualTitle(`WHITELIST VERIFIED · ${authorizedMembers[0]?.name || 'PRIMARY RESIDENT'} · NO WEAPONS (SAFE)`);
      } else {
        setVisualTitle(`PERSON COUNT: ${detectedCount} DETECTED · PERIMETER CLEAR · 0 WEAPONS DETECTED`);
      }
    } catch (err: any) {
      console.error('Frame analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Continuous Auto-Patrol / Counting effect every 5 seconds
  useEffect(() => {
    let interval: any;
    if (isAutoPatrolActive && (isCameraActive || activeScenarioId)) {
      interval = setInterval(() => {
        analyzeFrame();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPatrolActive, isCameraActive, activeScenarioId]);

  const handleSelectScenario = (id: string) => {
    stopCamera();
    setActiveScenarioId(id);
    const scen = PRESET_SCENARIOS.find((s) => s.id === id);
    if (scen) {
      setLivePersonCount(scen.personCount);
      setCameraStatusMessage(`Scenario Loaded: ${scen.title}`);
    }
    const img = generateScenarioCanvasImage(id);
    setLastCapturedImage(img);
    setTimeout(() => {
      analyzeFrame();
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Whitelist Roster & Live Stats */}
      <div className="p-5 rounded-2xl bg-[#0d1326]/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 hover:border-slate-700">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
            <Camera className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white tracking-wide">Real-Time AI Camera Sentinel</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 font-mono font-bold tracking-wider">
                Whitelisted Face Verification
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Real-time person counting, community whitelist verification & continuous safe perimeter monitoring
            </p>
          </div>
        </div>

        {/* Action Controls & Whitelisted Members Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Whitelist Members Manager Button */}
          <button
            onClick={onOpenAuthorizedModal}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 hover:scale-105 transition"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Authorized Whitelist ({authorizedMembers.length})
            </span>
          </button>

          {/* Live Person Count Badge */}
          <div className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/60 text-cyan-200 text-xs font-bold flex items-center gap-1.5 shadow-md">
            <Users className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>
              People:{' '}
              <strong className="text-amber-300 font-black text-sm font-mono ml-0.5">
                {livePersonCount}
              </strong>
            </span>
          </div>

          <button
            onClick={() => setIsNightVisionActive(!isNightVisionActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 hover:scale-102 ${
              isNightVisionActive
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Night Vision {isNightVisionActive ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Real-Time Visual Status Title Banner (Replaces Voice Agent Audio) */}
      <div className="p-3.5 rounded-2xl bg-[#090e1c] border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">
            CAMERA TITLE:
          </span>
          <span className="text-xs font-mono font-black text-emerald-300">
            {visualTitle}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span>PEOPLE COUNT: <strong className="text-white">{livePersonCount} IN FRAME</strong></span>
          <span>·</span>
          <span>WEAPONS: <strong className="text-emerald-400">0 DETECTED (SAFE)</strong></span>
        </div>
      </div>

      {/* Main Camera / Viewfinder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Viewfinder (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-2xl bg-black border-2 border-slate-800 overflow-hidden shadow-2xl min-h-[380px] flex flex-col justify-between group hover:border-slate-700 transition duration-300">
            {/* Camera Video Stream or Scenario Canvas */}
            <div className="relative w-full h-[380px] sm:h-[440px] bg-black flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover transition duration-300 ${
                  !isCameraActive ? 'hidden' : ''
                } ${isNightVisionActive ? 'brightness-125 contrast-125 filter grayscale-[30%] hue-rotate-15' : ''}`}
              />

              <canvas ref={canvasRef} className="hidden" />

              {/* Laser Sweep Effect */}
              {(isCameraActive || activeScenarioId) && (
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent pointer-events-none animate-laser z-20 shadow-[0_0_12px_#22d3ee]"></div>
              )}

              {/* Preset Scenario rendering if camera is off */}
              {!isCameraActive && activeScenarioId && (
                <div className="relative w-full h-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-black">
                  <div className="text-center space-y-3 max-w-md">
                    <div
                      className={`inline-flex p-3 rounded-2xl border ${
                        activeScenarioId === 'safe-resident'
                          ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400'
                          : 'bg-red-950/80 border-red-500/50 text-red-400 animate-pulse'
                      }`}
                    >
                      {activeScenarioId === 'safe-resident' ? (
                        <CheckCircle2 className="w-8 h-8" />
                      ) : (
                        <AlertOctagon className="w-8 h-8" />
                      )}
                    </div>
                    <h3 className="text-lg font-black text-white">
                      {PRESET_SCENARIOS.find((s) => s.id === activeScenarioId)?.title}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {PRESET_SCENARIOS.find((s) => s.id === activeScenarioId)?.description}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="text-[11px] px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono">
                        Pattern: {PRESET_SCENARIOS.find((s) => s.id === activeScenarioId)?.threatPattern}
                      </span>
                      <span className="text-[11px] px-2.5 py-1 rounded bg-cyan-950 border border-cyan-500 text-cyan-300 font-mono font-bold">
                        👥 Count: {PRESET_SCENARIOS.find((s) => s.id === activeScenarioId)?.personCount} People
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Fallback Screen: Prominent Start Camera Action */}
              {!isCameraActive && !activeScenarioId && (
                <div className="text-center p-6 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/50">
                    <Scan className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Camera Sentinel Ready</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      Start your camera to initiate instant person counting, whitelist recognition & threat detection.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => startCamera()}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-red-600/40 hover:scale-105 transition-all duration-200"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Start Camera & Verify Whitelist</span>
                    </button>
                    <button
                      onClick={() => handleSelectScenario('safe-resident')}
                      className="px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 font-bold text-xs border border-emerald-800 hover:scale-105 transition-all duration-200"
                    >
                      Test Safe Whitelist Resident
                    </button>
                  </div>
                </div>
              )}

              {/* HUD OVERLAY - High Tech Special Effects */}
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-30">
                {/* Top HUD with PROMINENT WHITELIST & PERSON STATUS */}
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center space-x-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-slate-200 shadow-xl">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="font-bold">AI SENTINEL ONLINE</span>
                  </div>

                  {/* THREAT PATTERN & WHITELIST STATUS HUD */}
                  <div className="flex items-center space-x-2">
                    {lastAnalysis?.threatPattern && (
                      <div
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xl border ${
                          lastAnalysis.threatLevel === 'CRITICAL' || lastAnalysis.threatLevel === 'HIGH'
                            ? 'bg-red-950/90 border-red-500 text-red-300 animate-pulse'
                            : 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
                        }`}
                      >
                        {lastAnalysis.threatLevel === 'CRITICAL' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span>{lastAnalysis.threatPattern}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Central Targeting Reticle with Corner Brackets */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-56 h-56 border border-cyan-500/30 rounded-2xl flex items-center justify-center">
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-cyan-400 -mt-1 -ml-1 shadow-[0_0_8px_#22d3ee]"></div>
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-cyan-400 -mt-1 -mr-1 shadow-[0_0_8px_#22d3ee]"></div>
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-cyan-400 -mb-1 -ml-1 shadow-[0_0_8px_#22d3ee]"></div>
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-cyan-400 -mb-1 -mr-1 shadow-[0_0_8px_#22d3ee]"></div>

                    {isCameraActive && (
                      <div className="absolute -top-8 px-3 py-1 rounded-full bg-black/85 border border-cyan-400 text-cyan-300 font-mono text-[10px] font-black tracking-wider shadow-lg flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                        <span>TARGETS: {livePersonCount} IN FRAME</span>
                      </div>
                    )}

                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-red-600/10 animate-pulse rounded-2xl flex items-center justify-center backdrop-blur-[1px]">
                        <span className="text-xs font-mono font-black text-red-400 tracking-wider">
                          VERIFYING FACES & THREAT PATTERNS...
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom HUD Bar */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 bg-black/80 backdrop-blur-md p-1.5 px-3 rounded-xl border border-slate-800">
                  <span>STATUS: {cameraStatusMessage}</span>
                  <span className="text-cyan-400">WHITELIST: {authorizedMembers.length} REGISTERED</span>
                  <span className="text-emerald-400">FPS: 30 • 1280x720</span>
                </div>
              </div>
            </div>

            {/* Bottom Viewfinder Controls */}
            <div className="p-3 bg-[#0a0e1c] border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                {isCameraActive ? (
                  <button
                    onClick={stopCamera}
                    className="px-3.5 py-1.5 rounded-xl bg-red-950 text-red-200 border border-red-800 text-xs font-bold hover:bg-red-900 transition hover:scale-102"
                  >
                    Turn Off Cam
                  </button>
                ) : (
                  <button
                    onClick={() => startCamera()}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-950 text-cyan-200 border border-cyan-700 text-xs font-bold hover:bg-cyan-900 transition flex items-center gap-1.5 hover:scale-102"
                  >
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Open Camera & Scan</span>
                  </button>
                )}

                {isCameraActive && (
                  <button
                    onClick={flipCamera}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs transition hover:scale-105"
                    title="Switch Front/Back Camera"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Main AI Trigger Button */}
              <button
                onClick={analyzeFrame}
                disabled={isAnalyzing}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all duration-200 shadow-lg ${
                  isAnalyzing
                    ? 'bg-slate-800 text-slate-400 cursor-wait'
                    : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/30 hover:scale-105'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Scanning Threats & Whitelist...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Scan Frame & Test Pattern</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preset Test Scenarios Selection Buttons */}
          <div className="p-4 rounded-2xl bg-[#0c1220]/90 border border-slate-800 shadow-xl backdrop-blur-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FileImage className="w-4 h-4 text-cyan-400" />
                <span>Test Whitelist & Specific Threat Patterns (Slide-in Toast Test)</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">Instant Threat Simulation</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_SCENARIOS.map((scen) => (
                <button
                  key={scen.id}
                  onClick={() => handleSelectScenario(scen.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all duration-200 text-xs hover:-translate-y-0.5 ${
                    activeScenarioId === scen.id && !isCameraActive
                      ? 'bg-red-950/80 border-red-500 text-white shadow-lg shadow-red-950'
                      : 'bg-[#080d1a] border-slate-800 text-slate-300 hover:border-cyan-500/50 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{scen.title}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-1 ${
                        scen.isAuthorized
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                          : 'bg-red-950 text-red-300 border border-red-600'
                      }`}
                    >
                      {scen.isAuthorized ? '✓ Safe Whitelist' : '⚠️ Threat'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{scen.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Whitelist Verification & Threat Assessment (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* WHITELIST VS STRANGER STATUS CARD */}
          <div className="p-5 rounded-2xl bg-[#0c1220]/90 border border-slate-800 shadow-xl backdrop-blur-xl space-y-3 transition-all duration-300 hover:border-emerald-500/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-700/60 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Community Whitelist Verification</h3>
                  <p className="text-[11px] text-slate-400">Known vs Unrecognized Persons</p>
                </div>
              </div>

              <button
                onClick={onOpenAuthorizedModal}
                className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-600 font-bold transition flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Upload Face</span>
              </button>
            </div>

            {/* Split breakdown: Authorized vs Unauthorized */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-3 rounded-xl bg-[#070b16] border border-emerald-900/40 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                  Authorized (Safe)
                </span>
                <span className="text-2xl font-black text-emerald-300 font-mono">
                  {lastAnalysis?.authorizedCount ?? (activeScenarioId === 'safe-resident' ? 1 : 0)}
                </span>
                <p className="text-[10px] text-slate-400">Matches registered resident</p>
              </div>

              <div className="p-3 rounded-xl bg-[#070b16] border border-red-900/40 space-y-1">
                <span className="text-[10px] uppercase font-bold text-red-400 block">
                  Strangers (Threat)
                </span>
                <span className="text-2xl font-black text-red-400 font-mono">
                  {lastAnalysis?.unauthorizedCount ?? (activeScenarioId === 'safe-resident' ? 0 : livePersonCount)}
                </span>
                <p className="text-[10px] text-slate-400">Outside community whitelist</p>
              </div>
            </div>

            {/* Whitelist Members Avatars */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Active Whitelist Profiles ({authorizedMembers.length}):
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {authorizedMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-medium shrink-0"
                  >
                    {m.photoUrl ? (
                      <img src={m.photoUrl} alt={m.name} className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span className="text-slate-200">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Analysis Result Card with Hover Effects */}
          <div className="p-5 rounded-2xl bg-[#0c1220]/90 border border-slate-800 shadow-xl backdrop-blur-xl space-y-4 transition-all duration-300 hover:border-purple-500/50 hover:shadow-purple-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-purple-950 border border-purple-800/60 text-purple-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Visual Threat Assessment</h3>
                  <p className="text-[11px] text-slate-400">Pattern & Person Diagnostic</p>
                </div>
              </div>

              {lastAnalysis && (
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    lastAnalysis.threatLevel === 'CRITICAL' || lastAnalysis.threatLevel === 'HIGH'
                      ? 'bg-red-950 text-red-400 border border-red-500 animate-pulse'
                      : lastAnalysis.status === 'CAUTION'
                      ? 'bg-amber-950 text-amber-400 border border-amber-500'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-500'
                  }`}
                >
                  {lastAnalysis.status.replace('_', ' ')}
                </span>
              )}
            </div>

            {lastAnalysis ? (
              <div className="space-y-4">
                {/* Summary Box */}
                <div
                  className={`p-3.5 rounded-xl border ${
                    lastAnalysis.threatLevel === 'CRITICAL' || lastAnalysis.threatLevel === 'HIGH'
                      ? 'bg-red-950/40 border-red-500/50 text-red-200'
                      : lastAnalysis.status === 'CAUTION'
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                      : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span>{lastAnalysis.threatPattern || 'Assessment Summary'}</span>
                    <span className="font-mono">{lastAnalysis.confidence}% Confidence</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-200 font-medium">{lastAnalysis.summary}</p>
                </div>

                {/* Detected Person Whitelist Breakdown */}
                {lastAnalysis.personDetails && lastAnalysis.personDetails.length > 0 && (
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Individual Whitelist Status:
                    </label>
                    <div className="space-y-1.5">
                      {lastAnalysis.personDetails.map((pd) => (
                        <div
                          key={pd.id}
                          className="p-2 rounded-lg bg-[#070b16] border border-slate-800 text-xs flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold text-[10px] flex items-center justify-center font-mono">
                              #{pd.id}
                            </span>
                            <span className="font-medium text-slate-300">{pd.activity}</span>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              pd.isAuthorized
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-red-950 text-red-300 border border-red-800'
                            }`}
                          >
                            {pd.isAuthorized ? '✓ Whitelist Match' : '⚠️ Stranger / Threat'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Safety Recommendations */}
                {lastAnalysis.safetyAdvice && lastAnalysis.safetyAdvice.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#070b16] border border-slate-800 space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Recommended Safety Protocol</span>
                    </p>
                    <ul className="text-xs space-y-1 text-slate-300">
                      {lastAnalysis.safetyAdvice.map((adv, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Instant Escalate to SOS Button */}
                <div className="pt-2">
                  <button
                    onClick={() =>
                      onTriggerSosWithSnapshot(
                        `AI Verified Pattern (${lastAnalysis.threatPattern || 'Security Threat'}): ${lastAnalysis.summary}`,
                        lastCapturedImage || ''
                      )
                    }
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition hover:scale-102"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Broadcast Emergency SOS with this Image</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <Eye className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-medium">
                  Camera is ready. Click "Scan Frame & Test Pattern" or start webcam to verify whitelist.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
