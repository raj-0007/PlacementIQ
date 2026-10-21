import React, { useState, useEffect } from 'react';
import type {
  DatasetSummary
} from '../types/api';
import {
  fetchSampleRecords
} from '../services/api';
import {
  Database,
  Search,
  Filter,
  CheckCircle,
  Shield,
  Layers,
  ArrowUpDown
} from 'lucide-react';

interface DatasetExplorerProps {
  summary: DatasetSummary | null;
  loading: boolean;
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({ summary, loading }) => {
  const [samples, setSamples] = useState<Record<string, unknown>[]>([]);
  const [samplesLoading, setSamplesLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStream, setFilterStream] = useState<string>('All');

  useEffect(() => {
    fetchSampleRecords(50)
      .then((data) => setSamples(data))
      .catch((err) => console.error('Failed to load sample records:', err))
      .finally(() => setSamplesLoading(false));
  }, []);

  if (loading || !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading dataset statistics & audit reports...</p>
      </div>
    );
  }

  const filteredSamples = samples.filter((row) => {
    const matchesStream = filterStream === 'All' || row.Stream === filterStream;
    const matchesSearch =
      searchTerm === '' ||
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesStream && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
            Open Academic Benchmark
          </span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Dataset Architecture & Preprocessing Audit
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Detailed inspection of the 2,966 historical student placement records, data hygiene transformations, and scikit-learn preprocessing pipelines.
        </p>
      </div>

      {/* Preprocessing Methodology Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Layers className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Stratified 80/20 Splitting</h4>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Preserves identical 55.3% placement ratio across 2,372 training instances and 594 test instances to avoid class skew.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Shield className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Data Hygiene & Scaling</h4>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Continuous attributes (CGPA, Age, Internships) are standardized via StandardScaler fitted exclusively on training splits to prevent data leakage.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <CheckCircle className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Categorical Encoding</h4>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Engineering Streams and Gender are encoded using OneHotEncoder with handle_unknown=&apos;ignore&apos; for safe production inference.
          </p>
        </div>
      </div>

      {/* Feature Statistics Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-brand-600" />
            <h3 className="font-bold text-slate-900 text-base">Descriptive Statistics of Numerical Features</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">N = 2,966 records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Feature Name</th>
                <th className="py-3 px-4">Mean</th>
                <th className="py-3 px-4">Standard Deviation</th>
                <th className="py-3 px-4">Minimum</th>
                <th className="py-3 px-4">Median</th>
                <th className="py-3 px-4">Maximum</th>
                <th className="py-3 px-4">Target Correlation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {summary.numeric_stats.map((stat) => (
                <tr key={stat.feature} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">{stat.feature}</td>
                  <td className="py-3 px-4">{stat.mean}</td>
                  <td className="py-3 px-4 text-slate-600">&plusmn;{stat.std}</td>
                  <td className="py-3 px-4">{stat.min}</td>
                  <td className="py-3 px-4">{stat.median}</td>
                  <td className="py-3 px-4">{stat.max}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        (summary.correlations[stat.feature] || 0) > 0.1
                          ? 'bg-emerald-50 text-emerald-700'
                          : (summary.correlations[stat.feature] || 0) < 0
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {summary.correlations[stat.feature] !== undefined
                        ? (summary.correlations[stat.feature] > 0 ? '+' : '') + summary.correlations[stat.feature].toFixed(3)
                        : '0.000'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabular Dataset Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Historical Records Browser</h3>
              <p className="text-xs text-slate-500">Previewing verified student observations from the dataset</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 w-40 sm:w-48 bg-white"
              />
            </div>

            {/* Stream Filter */}
            <div className="flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterStream}
                onChange={(e) => setFilterStream(e.target.value)}
                className="py-1.5 px-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="All">All Streams</option>
                {summary.streams.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {samplesLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading sample records...</div>
        ) : (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-700 font-bold uppercase tracking-wider sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Age</th>
                  <th className="py-2.5 px-4">Gender</th>
                  <th className="py-2.5 px-4">Stream</th>
                  <th className="py-2.5 px-4">CGPA</th>
                  <th className="py-2.5 px-4">Internships</th>
                  <th className="py-2.5 px-4">Hostel</th>
                  <th className="py-2.5 px-4">Backlogs</th>
                  <th className="py-2.5 px-4">Placement Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredSamples.map((row, idx) => {
                  const isPlaced = Number(row.PlacedOrNot) === 1;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-2.5 px-4">{String(row.Age)}</td>
                      <td className="py-2.5 px-4">{String(row.Gender)}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">{String(row.Stream)}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{Number(row.CGPA).toFixed(2)}</td>
                      <td className="py-2.5 px-4">{String(row.Internships)}</td>
                      <td className="py-2.5 px-4">{Number(row.Hostel) === 1 ? 'Hosteler' : 'Day Scholar'}</td>
                      <td className="py-2.5 px-4">
                        {Number(row.HistoryOfBacklogs) === 1 ? (
                          <span className="text-rose-600 font-semibold">Has Backlogs</span>
                        ) : (
                          <span className="text-emerald-600">None</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isPlaced
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {isPlaced ? 'Placed' : 'Not Placed'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
