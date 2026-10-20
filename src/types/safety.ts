export interface GeoLocationData {
  lat: number;
  lng: number;
  accuracy?: number;
  address: string;
  landmark?: string;
  timestamp: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  notifySms: boolean;
  notifyCall: boolean;
  isPrimary?: boolean;
}

export interface AuthorizedMember {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  notes?: string;
  addedAt: string;
}

export interface ThreatNotification {
  id: string;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  threatPattern: string;
  summary: string;
  timestamp: string;
  personCount: number;
  unauthorizedCount: number;
  snapshot?: string;
}

export interface AiDetectionEntity {
  label: string;
  category: 'threat' | 'neutral' | 'hazard';
  detail: string;
}

export interface FrameAnalysisResult {
  status: 'SAFE' | 'CAUTION' | 'THREAT_DETECTED';
  threatLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  threatPattern?: string;
  confidence: number;
  personCount: number;
  authorizedCount?: number;
  unauthorizedCount?: number;
  personDetails?: Array<{
    id: number;
    activity: string;
    proximity: 'close' | 'medium' | 'distant';
    threatStatus: 'suspicious' | 'neutral' | 'in_distress';
    isAuthorized?: boolean;
    matchedMemberName?: string;
  }>;
  summary: string;
  detectedEntities: AiDetectionEntity[];
  threatsFound: string[];
  safetyAdvice: string[];
  autoTriggerSos: boolean;
  nightVisionRecommended?: boolean;
  timestamp: string;
  engine?: string;
}

export interface CrimeZone {
  id: string;
  name: string;
  hindiName: string;
  status: 'RED' | 'YELLOW' | 'GREEN';
  crimeType: string;
  stats: string;
  center: { lat: number; lng: number };
  radiusMeters: number;
  safeCorridors: string[];
  policeStation: string;
  tip: string;
  beforeAfterRatio: string;
}

export interface SosAlert {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  timestamp: string;
  location: GeoLocationData;
  threatLevel: 'HIGH' | 'CRITICAL';
  emergencyType: string;
  source: 'MANUAL_BUTTON' | 'AI_CAMERA_DETECTION' | 'VOICE_COMMAND' | 'IOT_SENSOR';
  snapshot?: string;
  status: 'ACTIVE' | 'RESPONDERS_DISPATCHED' | 'RESOLVED';
  responders: Array<{
    name: string;
    role: string;
    etaMinutes: number;
    contact: string;
  }>;
  communityAssistanceCount: number;
}

export interface CommunityIncident {
  id: string;
  title: string;
  zone: string;
  lat: number;
  lng: number;
  time: string;
  type: string;
  risk: string;
  verified: boolean;
  description: string;
}

export interface DailyTrendPoint {
  day: string;
  dateStr: string;
  incidents: number;
  snatching: number;
  burglary: number;
  harassment: number;
  sosTriggers: number;
  resolvedSos: number;
  avgResponseMinutes: number;
  safetyScore: number;
  aiThreatsIntercepted: number;
}

export interface ZoneSafetyMetric {
  zone: string;
  initialScore: number;
  currentScore: number;
  incidentsMonthAgo: number;
  incidentsToday: number;
  percentImprovement: number;
  status: 'GREEN' | 'YELLOW' | 'RED';
}
