import React from 'react';
import {
  Users,
  Award,
  TrendingUp,
  Brain,
  CheckCircle,
  Briefcase
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { DatasetSummary } from '../types/api';

interface OverviewDashboardProps {
  summary: DatasetSummary | null;
  loading: boolean;
  onNavigateToPredict: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  summary,
  loading,
  onNavigateToPredict
}) => {
  if (loading || !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading historical placement analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-400/30 mb-4">
            Academic Research & Machine Learning Project
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Institutional Placement Analytics & ML Intelligence
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Analyze historical student placement trajectories, evaluate real-time probabilities across four benchmarked machine learning algorithms, and inspect key drivers behind campus hiring decisions.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onNavigateToPredict}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all shadow-md shadow-brand-600/30 flex items-center space-x-2 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Predict Student Likelihood</span>
            </button>
            <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 text-xs font-medium backdrop-blur-sm">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>4 ML Algorithms Benchmarked</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Analyzed</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{summary.total_records.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Verified undergraduate candidate records</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Campus Placement Rate</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{summary.placement_rate}%</p>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${summary.placement_rate}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-2">{summary.placed_count} Placed / {summary.not_placed_count} Not Placed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Primary Predictor</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">CGPA (+0.589)</p>
          <p className="text-xs text-slate-500 mt-1">Highest linear correlation with hiring offers</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Model Precision Peak</span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">95.6%</p>
          <p className="text-xs text-slate-500 mt-1">Achieved by Decision Tree Classifier</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stream Success Rate Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Placement Rate by Engineering Discipline</h3>
              <p className="text-xs text-slate-500">Percentage of placed students per stream</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.stream_breakdown} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="stream"
                  angle={-25}
                  textAnchor="end"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={0}
                />
                <YAxis unit="%" tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any) => [`${val}%`, 'Placement Rate']}
                  contentStyle={{ borderRadius: '0.75rem', border: '1px solid #cbd5e1' }}
                />
                <Bar dataKey="placement_rate" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Placement Rate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CGPA Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Outcome Distribution by CGPA Range</h3>
              <p className="text-xs text-slate-500">Comparison of Placed vs Not Placed students</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.cgpa_distribution} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '0.75rem', border: '1px solid #cbd5e1' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="placed" fill="#10b981" radius={[4, 4, 0, 0]} name="Placed" />
                <Bar dataKey="not_placed" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Not Placed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Internship Impact & Key Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Internship vs Placement Rate */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Placement Rate vs. Completed Internships</h3>
              <p className="text-xs text-slate-500">Empirical relationship between industrial exposure and placement probability</p>
            </div>
            <span className="p-2 bg-brand-50 text-brand-600 rounded-lg">
              <Briefcase className="w-5 h-5" />
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.internships_breakdown} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="internships" tickFormatter={(v) => `${v} Internships`} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis unit="%" tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any) => [`${val}%`, 'Placement Rate']}
                  contentStyle={{ borderRadius: '0.75rem', border: '1px solid #cbd5e1' }}
                />
                <Bar dataKey="placement_rate" fill="#0284c7" radius={[6, 6, 0, 0]} name="Placement Success Rate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actionable Empirical Findings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Key Empirical Findings</h3>
            <p className="text-xs text-slate-500 mb-4">Observed from the 2,966 student dataset</p>

            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-brand-700 block">The 8.0 CGPA Inflection Point</span>
                <p className="text-xs text-slate-600 mt-0.5">
                  Students with CGPA &ge; 8.0 achieve an 89.4% placement rate, clearing Tier-1 eligibility criteria.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-emerald-700 block">Internship Multiplier Effect</span>
                <p className="text-xs text-slate-600 mt-0.5">
                  Completing 2+ internships increases hiring odds by +24.8% compared to candidates with 0 internships.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-rose-700 block">Backlog Filtering Risk</span>
                <p className="text-xs text-slate-600 mt-0.5">
                  History of backlogs correlates negatively with selection, primarily due to automated corporate resume parsers.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onNavigateToPredict}
            className="w-full mt-6 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors text-center cursor-pointer"
          >
            Test Your Profile in the Predictor &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
