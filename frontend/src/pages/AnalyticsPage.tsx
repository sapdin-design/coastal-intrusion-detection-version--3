import React, { useState, useEffect } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import {
  BarChart3,
  TrendingUp,
  ShieldAlert,
  Clock,
  Download,
  CheckCircle,
  FileText,
  Ship,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import api from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const { vessels, alerts, incidents, zones } = useMonitoring();
  const [securityData, setSecurityData] = useState<any>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [vesselStats, setVesselStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [secRes, respRes, vesRes] = await Promise.all([
          api.get('/analytics/intrusions'),
          api.get('/analytics/alerts'),
          api.get('/analytics/vessels')
        ]);
        setSecurityData(secRes.data.data);
        setResponseData(respRes.data.data);
        setVesselStats(vesRes.data.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [alerts, incidents, vessels]);

  const COLORS = ['#ef4444', '#f59e0b', '#06b6d4', '#10b981', '#8b5cf6'];

  const handleExportReport = () => {
    const report = {
      title: 'CIDRTM Coastal Security & Intrusion Monitoring Summary Report',
      sector: 'Kanyakumari Coast, Tamil Nadu, India',
      timestamp: new Date().toISOString(),
      summary: {
        totalVesselsTracked: vessels.length,
        totalAlertsGenerated: alerts.length,
        totalIncidentsManaged: incidents.length,
        restrictedZonesActive: zones.length
      },
      meanTimeToAcknowledgeSeconds: responseData?.meanTimeToAcknowledgeSeconds || 28,
      meanTimeToResolveMinutes: responseData?.meanTimeToResolveMinutes || 8.5,
      repeatOffenders: securityData?.repeatOffenders || []
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cidrtm_security_report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0a1120] border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 font-mono">
              Maritime Analytics & Response Intelligence
            </h1>
            <p className="text-xs text-slate-400">
              Operational metrics, threat trends, MTTA/MTTR response performance, and reports
            </p>
          </div>
        </div>

        <button
          onClick={handleExportReport}
          className="flex items-center space-x-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export Security Report</span>
        </button>
      </div>

      {/* Response Metrics Cards (MTTA & MTTR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#09111e] border border-slate-800 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Mean Time to Acknowledge</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-amber-400">
              {responseData?.meanTimeToAcknowledgeSeconds || 28}s
            </span>
            <span className="text-[10px] text-slate-500 font-mono">MTTA target: &lt;60s</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#09111e] border border-slate-800 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Mean Time to Resolve</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {responseData?.meanTimeToResolveMinutes || 8.5}m
            </span>
            <span className="text-[10px] text-slate-500 font-mono">MTTR target: &lt;15m</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#09111e] border border-slate-800 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Average Fleet Speed</span>
            <Ship className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-cyan-400">
              {vesselStats?.averageSpeedKnots || 14.2} kts
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Offshore cruising</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#09111e] border border-slate-800 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Incidents Resolved Ratio</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-purple-400">94.2%</span>
            <span className="text-[10px] text-slate-500 font-mono">Resolution efficiency</span>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Bar Chart */}
        <div className="p-4 rounded-xl bg-[#09111e] border border-slate-800 shadow-xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            7-Day Threat & Incursion Trends
          </h3>
          <div className="h-60 w-full">
            {securityData?.weeklyTrend ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={securityData.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0c1424', borderColor: '#334155', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="intrusions" name="Critical Intrusions" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="approaches" name="Approaches" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="alerts" name="Total Alerts" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Alerts by Severity Pie Chart */}
        <div className="p-4 rounded-xl bg-[#09111e] border border-slate-800 shadow-xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Alerts Distribution by Severity
          </h3>
          <div className="h-60 w-full">
            {securityData?.alertsBySeverity ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={securityData.alertsBySeverity}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="severity"
                  >
                    {securityData.alertsBySeverity.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0c1424', borderColor: '#334155', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>
      </div>

      {/* Repeat Offending Vessels Table */}
      <div className="p-4 rounded-xl bg-[#09111e] border border-slate-800 shadow-xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>Repeat Security Violators & High-Risk Targets</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-2.5">Vessel ID</th>
                <th className="p-2.5">Vessel Name</th>
                <th className="p-2.5">Alerts Triggered</th>
                <th className="p-2.5">Incidents Dispatched</th>
                <th className="p-2.5">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {securityData?.repeatOffenders && securityData.repeatOffenders.length > 0 ? (
                securityData.repeatOffenders.map((offender: any) => (
                  <tr key={offender.vesselId} className="hover:bg-slate-800/30">
                    <td className="p-2.5 text-cyan-400 font-bold">{offender.vesselId}</td>
                    <td className="p-2.5 text-slate-200">{offender.vesselName}</td>
                    <td className="p-2.5 text-amber-400">{offender.alertsCount}</td>
                    <td className="p-2.5 text-red-400">{offender.incidentsCount}</td>
                    <td className="p-2.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase">
                        HIGH RISK
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-500">
                    No repeated maritime violations recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
