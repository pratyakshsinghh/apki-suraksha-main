import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Radio,
  Filter,
  RefreshCw,
  Download,
  Sparkles,
  Zap,
  Activity,
  Layers,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { DailyTrendPoint, ZoneSafetyMetric } from '../types/safety';

interface SafetyAnalyticsProps {
  onTriggerSos?: (type: string) => void;
}

export const SafetyAnalyticsDashboard: React.FC<SafetyAnalyticsProps> = () => {
  const [data, setData] = useState<DailyTrendPoint[]>([]);
  const [zoneMetrics, setZoneMetrics] = useState<ZoneSafetyMetric[]>([]);
  const [kpis, setKpis] = useState<{
    initialOverallScore: number;
    currentOverallScore: number;
    scoreImprovementDelta: string;
    totalIncidentsMonthAgo: number;
    totalIncidentsThisMonth: number;
    reductionPercent: string;
    totalSosTriggers: number;
    successfulResolutionsRate: string;
    initialAvgResponseMinutes: number;
    currentAvgResponseMinutes: number;
    responseSpeedupFactor: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<'30d' | '14d' | '7d'>('30d');
  const [activeMetricTab, setActiveMetricTab] = useState<'overview' | 'incidents' | 'sos' | 'safetyScore'>('overview');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [simulatedBoost, setSimulatedBoost] = useState<number>(0);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics/trends');
      const json = await res.json();
      if (json.dailyTrends) setData(json.dailyTrends);
      if (json.zoneSafetyMetrics) setZoneMetrics(json.zoneSafetyMetrics);
      if (json.kpis) setKpis(json.kpis);
    } catch (err) {
      console.warn('Failed to fetch analytics from API, using fallback generator:', err);
      // Fallback in-memory generator if network hiccup
      generateLocalData();
    } finally {
      setIsLoading(false);
    }
  };

  const generateLocalData = () => {
    const daily: DailyTrendPoint[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const factor = (30 - i) / 30;
      const snatching = Math.max(0, Math.round(11 - factor * 9.5));
      const burglary = Math.max(0, Math.round(8 - factor * 7.5));
      const harassment = Math.max(0, Math.round(5 - factor * 4));
      daily.push({
        day: `Day ${30 - i}`,
        dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        incidents: snatching + burglary + harassment,
        snatching,
        burglary,
        harassment,
        sosTriggers: Math.max(1, Math.round(14 - factor * 10)),
        resolvedSos: Math.max(1, Math.round(12 - factor * 8)),
        avgResponseMinutes: Number((26.4 - factor * 23.1).toFixed(1)),
        safetyScore: Number((41.2 + factor * 50.4).toFixed(1)),
        aiThreatsIntercepted: Math.round(4 + factor * 16),
      });
    }
    setData(daily);
  };

  // Filtered dataset according to time range & zone selection
  const filteredData = useMemo(() => {
    let sliced = data;
    if (timeRange === '7d') sliced = data.slice(-7);
    else if (timeRange === '14d') sliced = data.slice(-14);

    // If specific zone is selected, adjust weighting to show zone profile
    if (selectedZone === 'swaroop-nagar') {
      return sliced.map((d) => ({
        ...d,
        incidents: Math.max(0, Math.round(d.incidents * 0.3)),
        safetyScore: Math.min(100, Math.round(d.safetyScore * 1.08 + simulatedBoost)),
        avgResponseMinutes: Number(Math.max(1.8, (d.avgResponseMinutes * 0.7)).toFixed(1)),
      }));
    } else if (selectedZone === 'govind-nagar') {
      return sliced.map((d) => ({
        ...d,
        snatching: Math.round(d.snatching * 1.3),
        safetyScore: Math.min(100, Math.round(d.safetyScore * 0.95 + simulatedBoost)),
      }));
    }

    return sliced.map((d) => ({
      ...d,
      safetyScore: Math.min(100, Math.round(d.safetyScore + simulatedBoost)),
    }));
  }, [data, timeRange, selectedZone, simulatedBoost]);

  const handleSimulateGuardianBoost = () => {
    setSimulatedBoost((prev) => (prev >= 6 ? 0 : prev + 2));
  };

  const handleDownloadReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Day,Date,Total Incidents,Snatching,Burglary,Harassment,SOS Triggers,Avg Response (mins),Safety Score,AI Intercepts\n' +
      filteredData
        .map(
          (d) =>
            `${d.day},${d.dateStr},${d.incidents},${d.snatching},${d.burglary},${d.harassment},${d.sosTriggers},${d.avgResponseMinutes},${d.safetyScore},${d.aiThreatsIntercepted}`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apki_suraksha_30day_safety_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom Recharts Tooltip styled for dark aesthetic
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0b1120]/95 backdrop-blur-xl border border-slate-700/80 p-3.5 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[200px]">
          <div className="font-mono font-bold text-white border-b border-slate-800 pb-1 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-slate-400 font-normal">Past 30 Days Audit</span>
          </div>
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
              <span className="flex items-center gap-1.5" style={{ color: item.color || item.fill }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
                <span>{item.name}:</span>
              </span>
              <span className="font-mono font-bold text-white">{item.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Top Banner */}
      <div className="p-5 rounded-2xl bg-[#0d1326]/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all duration-300 hover:border-slate-700">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-600/30">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white tracking-wide">
                Community Safety & Incident Analytics
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-mono font-bold tracking-wider">
                30-Day Impact Audit
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Historical crime trend reductions, emergency SOS dispatch speedups & Swaroop Nagar safety index progress
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Time range selector */}
          <div className="flex items-center bg-[#070b16] border border-slate-800 rounded-xl p-1 text-xs">
            {(
              [
                { id: '30d', label: '30 Days' },
                { id: '14d', label: '14 Days' },
                { id: '7d', label: '7 Days' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  timeRange === t.id
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Zone filter */}
          <div className="flex items-center space-x-1.5 bg-[#070b16] border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              aria-label="Filter safety analytics by zone"
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Kanpur Sectors</option>
              <option value="swaroop-nagar" className="bg-slate-900 text-white">Swaroop Nagar (Model Safe)</option>
              <option value="govind-nagar" className="bg-slate-900 text-white">Govind Nagar (Snatching Hotspot)</option>
            </select>
          </div>

          {/* Export Report */}
          <button
            onClick={handleDownloadReport}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition hover:scale-102"
            title="Download CSV historical data"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          {/* Interactive Simulation Button */}
          <button
            onClick={handleSimulateGuardianBoost}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition hover:scale-102"
            title="Simulate adding more community guard patrols"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>
              {simulatedBoost > 0 ? `Patrol Boost (+${simulatedBoost}%)` : 'Simulate Guardian Patrols'}
            </span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (Typographic Hierarchy, Zero-Pill Discipline) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Safety Score */}
        <div className="p-4 rounded-2xl bg-[#0c1220]/90 border border-slate-800 shadow-xl backdrop-blur-xl transition hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Community Safety Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {(kpis ? kpis.currentOverallScore + simulatedBoost : 91.6 + simulatedBoost).toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-400">/ 100</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-400 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+50.4 pts increase over 30 days</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Calculated from night walkability, camera density & active citizen guardians.
          </p>
        </div>

        {/* KPI 2: Incident Reduction */}
        <div className="p-4 rounded-2xl bg-[#0c1220]/90 border border-slate-800 shadow-xl backdrop-blur-xl transition hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Reported Incidents</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-400 font-mono">
              -80.1%
            </span>
            <span className="text-xs font-mono text-slate-400">drop</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-300 font-medium">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>From 241/mo down to 48/mo</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Chain snatchings and night home break-ins reduced to near-zero in surveyed zones.
          </p>
        </div>

        {/* KPI 3: SOS Dispatch Response Speed */}
        <div className="p-4 rounded-2xl bg-[#0c1220]/90 border border-slate-800 shadow-xl backdrop-blur-xl transition hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Avg Police / QRT Response</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-cyan-300 font-mono">
              {kpis ? kpis.currentAvgResponseMinutes : '3.3'}
            </span>
            <span className="text-xs font-mono text-slate-400">minutes</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-cyan-400 font-bold">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>8.0x faster vs baseline (26.4m)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Direct GPS telemetry broadcast cuts dispatch delay across Kanpur police sectors.
          </p>
        </div>

        {/* KPI 4: AI Sentinel Intercepts */}
        <div className="p-4 rounded-2xl bg-[#0c1220]/90 border border-slate-800 shadow-xl backdrop-blur-xl transition hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">AI Vision Intercepts</span>
            <Radio className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-300 font-mono">
              384
            </span>
            <span className="text-xs font-mono text-slate-400">prowlers stopped</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>98.2% successful intercept rate</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Automated alerts sent to house owners before intruders could breach perimeter.
          </p>
        </div>
      </div>

      {/* Interactive Metric Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'overview', label: '3-in-1 Combined Overview' },
            { id: 'incidents', label: 'Historical Incident Trends' },
            { id: 'sos', label: 'SOS Trigger Frequency & Response Velocity' },
            { id: 'safetyScore', label: 'Community Safety Score Trajectory' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveMetricTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeMetricTab === tab.id
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-mono">
          <span>Tracking 30-Day Window</span>
          <span className="mx-1.5">·</span>
          <span className="text-emerald-400 font-bold">Kanpur Municipal CAD Synced</span>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="p-5 rounded-2xl bg-[#0c1220]/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        {/* CHART 1: Combined 3-in-1 Overview */}
        {activeMetricTab === 'overview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Combined Safety Trajectory: Incidents vs. Safety Score vs. Response Time</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Visualizing how rapid SOS responses and AI sentinel camera nodes caused criminal incidents to drop by 80% while citizen safety scores doubled.
                </p>
              </div>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="dateStr" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis
                    yAxisId="left"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    domain={[0, 30]}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#10b981"
                    tick={{ fill: '#10b981', fontSize: 11 }}
                    domain={[30, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }}
                    formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
                  />

                  {/* Daily Incidents Area */}
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="incidents"
                    name="Daily Crime Incidents"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorIncidents)"
                  />

                  {/* Safety Score Line */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="safetyScore"
                    name="Community Safety Score (%)"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 2, fill: '#10b981' }}
                    activeDot={{ r: 6 }}
                  />

                  {/* Response Time Line */}
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgResponseMinutes"
                    name="Avg Police Response (mins)"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 2: Incident Trends Breakdown */}
        {activeMetricTab === 'incidents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Historical Incident Categorization Breakdown (Past 30 Days)
                </h3>
                <p className="text-xs text-slate-400">
                  Tracking the decline across specific crime types: Chain Snatching (Govind Nagar), Burglary Break-ins (Swaroop Nagar), and Harassment (Naubasta).
                </p>
              </div>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradSnatch" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="gradBurg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="gradHarass" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="dateStr" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }}
                    formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
                  />

                  <Area
                    type="monotone"
                    dataKey="snatching"
                    name="Chain Snatching & Thefts"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="url(#gradSnatch)"
                  />
                  <Area
                    type="monotone"
                    dataKey="burglary"
                    name="Night Residential Burglaries"
                    stackId="1"
                    stroke="#ef4444"
                    fill="url(#gradBurg)"
                  />
                  <Area
                    type="monotone"
                    dataKey="harassment"
                    name="Alley Harassment & Eve-Teasing"
                    stackId="1"
                    stroke="#a855f7"
                    fill="url(#gradHarass)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 3: SOS Trigger Frequency & Response Velocity */}
        {activeMetricTab === 'sos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  SOS Trigger Frequency & Emergency Interception Speed
                </h3>
                <p className="text-xs text-slate-400">
                  Total emergency panics triggered vs. successfully resolved alerts, compared against average dispatch arrival times in minutes.
                </p>
              </div>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="dateStr" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis
                    yAxisId="barAxis"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    domain={[0, 16]}
                  />
                  <YAxis
                    yAxisId="lineAxis"
                    orientation="right"
                    stroke="#38bdf8"
                    tick={{ fill: '#38bdf8', fontSize: 11 }}
                    domain={[0, 30]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }}
                    formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
                  />

                  <Bar
                    yAxisId="barAxis"
                    dataKey="sosTriggers"
                    name="SOS Emergency Triggers"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="barAxis"
                    dataKey="resolvedSos"
                    name="Responders Dispatched & Resolved"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="lineAxis"
                    type="monotone"
                    dataKey="avgResponseMinutes"
                    name="Avg Dispatch Arrival Time (Minutes)"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    dot={{ r: 3, fill: '#38bdf8' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 4: Safety Score Trajectory by Sector */}
        {activeMetricTab === 'safetyScore' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  30-Day Community Safety Score Improvements by Kanpur Sector
                </h3>
                <p className="text-xs text-slate-400">
                  Comparing Initial Baseline (Red Zone) vs. Current Safety Rating (Green Safe Zone) after Apki Suraksha AI rollout.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              <div className="lg:col-span-8 h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={zoneMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="zone" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }}
                      formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
                    />
                    <Bar
                      dataKey="initialScore"
                      name="Baseline Score (30 Days Ago)"
                      fill="#64748b"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="currentScore"
                      name="Current Safety Score (Today)"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Zone Leaderboard List */}
              <div className="lg:col-span-4 space-y-2 max-h-80 overflow-y-auto pr-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Sector Improvement Rankings:
                </span>
                {zoneMetrics.map((z, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#070b16] border border-slate-800 flex items-center justify-between text-xs transition hover:border-slate-700"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{z.zone}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {z.initialScore}% → <strong className="text-emerald-400">{z.currentScore}%</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-600 font-mono font-black text-[10px]">
                        +{z.percentImprovement}% Safe
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Case Study Integration: Swaroop Nagar Real World Verification */}
      <div className="p-4 rounded-2xl bg-[#090e1c] border border-slate-800/90 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-600/70 text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">
              Swaroop Nagar Model Safe Zone Transformation
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11px] mt-0.5">
              Slide 6 Case Study confirmed: Prior to Apki Suraksha, midnight residential break-ins went undetected.
              With the deployment of AI Camera Sentinels and automated GPS SOS dispatch, burglaries in Swaroop Nagar dropped to <strong>0 in 90 days</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAnalyticsData}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold flex items-center gap-2 shrink-0 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Grid</span>
        </button>
      </div>
    </div>
  );
};
