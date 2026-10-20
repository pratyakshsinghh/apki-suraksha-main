import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SosStation } from './components/SosStation';
import { AiCameraSentinel } from './components/AiCameraSentinel';
import { CrimeZoneMap } from './components/CrimeZoneMap';
import { CommunityNetwork } from './components/CommunityNetwork';
import { CaseStudyAndIot } from './components/CaseStudyAndIot';
import { ContactsModal } from './components/ContactsModal';
import { AuthorizedMembersModal } from './components/AuthorizedMembersModal';
import { ThreatNotificationToast } from './components/ThreatNotificationToast';
import { SafetyAnalyticsDashboard } from './components/SafetyAnalyticsDashboard';
import {
  GeoLocationData,
  EmergencyContact,
  SosAlert,
  CrimeZone,
  CommunityIncident,
  AuthorizedMember,
  ThreatNotification,
} from './types/safety';
import { audioAlertService } from './utils/audioAlerts';
import { voiceRecognitionService } from './utils/voiceRecognition';

// Default initial emergency contacts (English only)
const DEFAULT_CONTACTS: EmergencyContact[] = [
  {
    id: 'c-1',
    name: 'Mother (Home)',
    relation: 'Mother',
    phone: '+91 98765 43210',
    notifySms: true,
    notifyCall: true,
    isPrimary: true,
  },
  {
    id: 'c-2',
    name: 'Brother (Family)',
    relation: 'Sibling',
    phone: '+91 94150 88776',
    notifySms: true,
    notifyCall: true,
  },
  {
    id: 'c-3',
    name: 'Local Neighbor',
    relation: 'Neighbor',
    phone: '+91 98390 12345',
    notifySms: true,
    notifyCall: false,
  },
  {
    id: 'c-4',
    name: 'Emergency Police CAD',
    relation: 'Emergency Services',
    phone: '112',
    notifySms: true,
    notifyCall: true,
    isPrimary: true,
  },
];

// Default initial authorized community residents whitelist
const DEFAULT_AUTHORIZED_MEMBERS: AuthorizedMember[] = [
  {
    id: 'mem-1',
    name: 'Myself (Primary Resident)',
    role: 'Primary Resident',
    notes: 'Registered resident - Classified as NO THREAT',
    photoUrl: '',
    addedAt: new Date().toISOString(),
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('camera'); // Default to camera so user can test person counting immediately!
  const [isSirenPlaying, setIsSirenPlaying] = useState<boolean>(false);
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState<boolean>(false);
  const [isAuthorizedModalOpen, setIsAuthorizedModalOpen] = useState<boolean>(false);
  const [threatToast, setThreatToast] = useState<ThreatNotification | null>(null);

  // Authorized community whitelist
  const [authorizedMembers, setAuthorizedMembers] = useState<AuthorizedMember[]>(() => {
    const saved = localStorage.getItem('apki_suraksha_whitelist_v3');
    return saved ? JSON.parse(saved) : DEFAULT_AUTHORIZED_MEMBERS;
  });

  // Active SOS alerts
  const [activeAlerts, setActiveAlerts] = useState<SosAlert[]>([]);
  const [myActiveAlert, setMyActiveAlert] = useState<SosAlert | null>(null);

  // Crime Zones
  const [crimeZones, setCrimeZones] = useState<CrimeZone[]>([]);

  // Community Incidents
  const [incidents, setIncidents] = useState<CommunityIncident[]>([]);

  // Contacts
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    const saved = localStorage.getItem('apki_suraksha_contacts_v3');
    return saved ? JSON.parse(saved) : DEFAULT_CONTACTS;
  });

  // Current Geolocation
  const [currentLocation, setCurrentLocation] = useState<GeoLocationData>({
    lat: 26.4725,
    lng: 80.3182,
    accuracy: 6,
    address: 'Near Ratan Lal Nagar, Govind Nagar, Kanpur, India',
    landmark: 'Govind Nagar Market Corridor',
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    fetchCrimeZones();
    fetchActiveAlerts();
    fetchIncidents();
    initGeolocation();
  }, []);

  const fetchCrimeZones = async () => {
    try {
      const res = await fetch('/api/crime-zones');
      const data = await res.json();
      if (data.zones) setCrimeZones(data.zones);
    } catch (e) {
      console.warn('Failed to fetch crime zones:', e);
    }
  };

  const fetchActiveAlerts = async () => {
    try {
      const res = await fetch('/api/sos/active');
      const data = await res.json();
      if (data.alerts) {
        setActiveAlerts(data.alerts);
        const myAlert = data.alerts.find(
          (a: SosAlert) => a.userId === 'current_device_user' && a.status !== 'RESOLVED'
        );
        if (myAlert) setMyActiveAlert(myAlert);
      }
    } catch (e) {
      console.warn('Failed to fetch active alerts:', e);
    }
  };

  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/incidents');
      const data = await res.json();
      if (data.incidents) setIncidents(data.incidents);
    } catch (e) {
      console.warn('Failed to fetch incidents:', e);
    }
  };

  const initGeolocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy);

          setCurrentLocation({
            lat,
            lng,
            accuracy,
            address: `GPS Locked: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E (Kanpur Metropolitan Region)`,
            landmark: 'Real-time GPS Fix',
            timestamp: new Date().toISOString(),
          });
        },
        (err) => {
          console.warn('Geolocation unavailable, maintaining default:', err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  };

  const handleSetSimulatedLocation = (zoneKey: string) => {
    const zoneMap: Record<string, { lat: number; lng: number; address: string }> = {
      'govind-nagar': {
        lat: 26.4725,
        lng: 80.3182,
        address: 'Ratan Lal Nagar Market, Govind Nagar (High Alert Snatching Hotspot)',
      },
      naubasta: {
        lat: 26.4352,
        lng: 80.3341,
        address: 'Highway Underpass, Naubasta (Night Harassment Alert Spot)',
      },
      kalyanpur: {
        lat: 26.5021,
        lng: 80.2467,
        address: 'GT Road Crossings, Kalyanpur (Late-Night Student Corridor)',
      },
      barra: {
        lat: 26.4529,
        lng: 80.3015,
        address: 'Sector 8 Residential Area, Barra (Break-ins Alert Zone)',
      },
      babupurwa: {
        lat: 26.4485,
        lng: 80.3421,
        address: 'Commercial Market Corridor, Babupurwa (Theft & Snatching Zone)',
      },
      panki: {
        lat: 26.4851,
        lng: 80.2185,
        address: 'Site-1 Logistics Hub, Panki (Industrial Theft Alert)',
      },
      'swaroop-nagar': {
        lat: 26.4812,
        lng: 80.3218,
        address: 'Arya Nagar Extension, Swaroop Nagar (Model Green Safe Zone)',
      },
    };

    if (zoneMap[zoneKey]) {
      const z = zoneMap[zoneKey];
      setCurrentLocation({
        lat: z.lat,
        lng: z.lng,
        accuracy: 5,
        address: z.address,
        landmark: zoneKey.toUpperCase(),
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleToggleSiren = () => {
    if (isSirenPlaying) {
      audioAlertService.stopSiren();
      setIsSirenPlaying(false);
    } else {
      audioAlertService.startSiren();
      setIsSirenPlaying(true);
    }
  };

  const [systemStatusTitle, setSystemStatusTitle] = useState<string>(
    'APKI SURAKSHA · REAL-TIME SYSTEM MONITOR · ALL ZONES NORMAL · 0 WEAPONS DETECTED'
  );

  const handleToggleVoice = () => {
    if (isVoiceListening) {
      voiceRecognitionService.stopListening();
      setIsVoiceListening(false);
      setSystemStatusTitle('VOICE SOS: STANDBY');
    } else {
      setSystemStatusTitle('VOICE SOS LISTENING · SAY: "PLEASE START SOS ALERT"');
      const started = voiceRecognitionService.startListening((phrase) => {
        setSystemStatusTitle(`VOICE TRIGGER DETECTED: "${phrase}" · TRANSMITTING SOS`);
        handleTriggerSos(`Voice Command Alert: "${phrase}"`, 'VOICE_COMMAND');
      });
      if (started) {
        setIsVoiceListening(true);
      } else {
        alert('Speech recognition is not available or microphone permission was denied.');
      }
    }
  };

  const handleSaveContacts = (newContacts: EmergencyContact[]) => {
    setContacts(newContacts);
    localStorage.setItem('apki_suraksha_contacts_v3', JSON.stringify(newContacts));
  };

  const handleSaveAuthorizedMembers = (newMembers: AuthorizedMember[]) => {
    setAuthorizedMembers(newMembers);
    localStorage.setItem('apki_suraksha_whitelist_v3', JSON.stringify(newMembers));
  };

  const handleTriggerThreatToast = (_threat: ThreatNotification) => {
    // False weapon toast popup removed as requested
  };

  const handleTriggerSos = async (
    emergencyType: string,
    source: 'MANUAL_BUTTON' | 'AI_CAMERA_DETECTION' | 'VOICE_COMMAND' | 'IOT_SENSOR' = 'MANUAL_BUTTON',
    snapshot?: string
  ) => {
    setSystemStatusTitle(`EMERGENCY SOS BROADCASTING: ${emergencyType}`);
    try {
      const res = await fetch('/api/sos/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current_device_user',
          userName: 'Self (Citizen User)',
          userPhone: '+91 98765 43210',
          location: currentLocation,
          emergencyType,
          source,
          snapshot,
        }),
      });

      const data = await res.json();
      if (data.alert) {
        setMyActiveAlert(data.alert);
        setActiveAlerts((prev) => [data.alert, ...prev]);
        setActiveTab('sos');
        setIsSirenPlaying(true);
      }
    } catch (e) {
      console.error('Failed to trigger SOS:', e);
    }
  };

  const handleResolveSos = async (alertId: string) => {
    try {
      await fetch('/api/sos/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      });
      setMyActiveAlert(null);
      audioAlertService.stopSiren();
      setIsSirenPlaying(false);
      setSystemStatusTitle('EMERGENCY STANDDOWN CONFIRMED · PERIMETER SAFE · NO THREATS');
      setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (e) {
      console.error('Failed to resolve SOS:', e);
    }
  };

  const handleAssistAlert = async (alertId: string) => {
    try {
      const res = await fetch('/api/sos/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, helperName: 'You (Volunteer Guardian)' }),
      });
      const data = await res.json();
      if (data.alert) {
        setActiveAlerts((prev) => prev.map((a) => (a.id === alertId ? data.alert : a)));
      }
    } catch (e) {
      console.error('Failed to assist alert:', e);
    }
  };

  const handleReportIncident = async (incidentData: {
    title: string;
    zone: string;
    type: string;
    description: string;
  }) => {
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...incidentData,
          lat: currentLocation.lat,
          lng: currentLocation.lng,
        }),
      });
      const data = await res.json();
      if (data.incident) {
        setIncidents((prev) => [data.incident, ...prev]);
      }
    } catch (e) {
      console.error('Failed to report incident:', e);
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans transition-colors duration-500 relative cyber-grid selection:bg-red-600 selection:text-white ${
        myActiveAlert ? 'border-4 border-red-600 glow-panic' : ''
      }`}
    >
      {/* Radiant ambient glow special effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse"></div>
      <div className="fixed bottom-10 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed top-1/2 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Visual Status Title Banner (Replaces Voice Agent Speech Sound) */}
      <div className="bg-[#090e1c] border-b border-slate-800/90 py-2 px-4 text-xs font-mono flex flex-wrap items-center justify-between gap-2 relative z-30">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">STATUS TITLE:</span>
          <span className="text-emerald-300 font-black tracking-wide">{systemStatusTitle}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>THREAT STATUS: <strong className="text-emerald-400 font-bold">CLEAR / 0 WEAPONS</strong></span>
          <span>·</span>
          <span>POLICE CAD: <strong className="text-cyan-400">UP 112 LINKED</strong></span>
        </div>
      </div>

      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSirenPlaying={isSirenPlaying}
        onToggleSiren={handleToggleSiren}
        isVoiceListening={isVoiceListening}
        onToggleVoice={handleToggleVoice}
        activeAlertCount={activeAlerts.length}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 relative z-10">
        {activeTab === 'camera' && (
          <AiCameraSentinel
            onTriggerSosWithSnapshot={(type, snapshot) =>
              handleTriggerSos(type, 'AI_CAMERA_DETECTION', snapshot)
            }
            authorizedMembers={authorizedMembers}
            onOpenAuthorizedModal={() => setIsAuthorizedModalOpen(true)}
            onTriggerThreatToast={handleTriggerThreatToast}
          />
        )}

        {activeTab === 'sos' && (
          <SosStation
            currentLocation={currentLocation}
            onRefreshLocation={initGeolocation}
            onSetSimulatedLocation={handleSetSimulatedLocation}
            contacts={contacts}
            onOpenContactsModal={() => setIsContactsModalOpen(true)}
            activeAlert={myActiveAlert}
            onTriggerSos={handleTriggerSos}
            onResolveSos={handleResolveSos}
          />
        )}

        {activeTab === 'analytics' && (
          <SafetyAnalyticsDashboard
            onTriggerSos={(type) => handleTriggerSos(type, 'AI_CAMERA_DETECTION')}
          />
        )}

        {activeTab === 'zones' && (
          <CrimeZoneMap
            zones={crimeZones}
            currentLocation={currentLocation}
            onSimulateZoneEntry={(z) => handleSetSimulatedLocation(z.id)}
          />
        )}

        {activeTab === 'community' && (
          <CommunityNetwork
            alerts={activeAlerts}
            incidents={incidents}
            onAssistAlert={handleAssistAlert}
            onReportIncident={handleReportIncident}
          />
        )}

        {activeTab === 'iot-case' && (
          <CaseStudyAndIot onTriggerSos={handleTriggerSos} />
        )}
      </main>

      {/* Contacts Management Modal */}
      <ContactsModal
        isOpen={isContactsModalOpen}
        onClose={() => setIsContactsModalOpen(false)}
        contacts={contacts}
        onSaveContacts={handleSaveContacts}
      />

      {/* Authorized Members & Face Whitelist Modal */}
      <AuthorizedMembersModal
        isOpen={isAuthorizedModalOpen}
        onClose={() => setIsAuthorizedModalOpen(false)}
        members={authorizedMembers}
        onSaveMembers={handleSaveAuthorizedMembers}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070b16]/90 backdrop-blur-md py-5 text-center text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 font-medium">
            <span className="font-extrabold text-white tracking-wide">APKI SURAKSHA</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">"Your Safety, Our Mission"</span>
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            Powered by Real-Time Gemini AI Vision, Automated Geolocation & Police CAD Integration
          </p>
        </div>
      </footer>
    </div>
  );
}
