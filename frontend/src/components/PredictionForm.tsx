import React, { useState } from 'react';
import type {
  StudentProfile,
  PredictionResult,
  EngineeringStream,
  Gender,
  ModelId
} from '../types/api';
import {
  UserCheck,
  Award,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Sparkles,
  Sliders,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface PredictionFormProps {
  onPredict: (profile: StudentProfile) => Promise<PredictionResult>;
  onNavigateToSimulator: (profile: StudentProfile) => void;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({
  onPredict,
  onNavigateToSimulator
}) => {
  const [profile, setProfile] = useState<StudentProfile>({
    age: 22,
    gender: 'Male',
    stream: 'Computer Science',
    internships: 1,
    cgpa: 7.8,
    hostel: 0,
    history_of_backlogs: 0,
    preferred_model: 'random_forest'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const streams: EngineeringStream[] = [
    'Computer Science',
    'Information Technology',
    'Electronics And Communication',
    'Mechanical',
    'Electrical',
    'Civil'
  ];

  const models: { id: ModelId; name: string }[] = [
    { id: 'random_forest', name: 'Random Forest Classifier (Ensemble)' },
    { id: 'decision_tree', name: 'Decision Tree Classifier (Rule-Based)' },
    { id: 'logistic_regression', name: 'Logistic Regression (Linear Baseline)' },
    { id: 'svm', name: 'Support Vector Machine (RBF Kernel)' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await onPredict(profile);
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Prediction request failed');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (prob: number) => {
    if (prob >= 0.70) return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', stroke: '#10b981' };
    if (prob >= 0.45) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', stroke: '#f59e0b' };
    return { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', stroke: '#f43f5e' };
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Student Placement Likelihood Predictor</h2>
        <p className="text-sm text-slate-500 mt-1">
          Input individual academic credentials and experiential factors to calculate real-time placement probability and algorithm consensus.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Model Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Primary Machine Learning Model
              </label>
              <select
                value={profile.preferred_model}
                onChange={(e) => setProfile({ ...profile, preferred_model: e.target.value as ModelId })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stream & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Engineering Stream
                </label>
                <select
                  value={profile.stream}
                  onChange={(e) => setProfile({ ...profile, stream: e.target.value as EngineeringStream })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  {streams.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Gender
                </label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value as Gender })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            {/* CGPA Slider & Display */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Cumulative GPA (CGPA)
                </label>
                <span className="text-lg font-black text-brand-600 bg-white px-2.5 py-0.5 rounded-lg border border-brand-200">
                  {profile.cgpa.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="4.5"
                max="10.0"
                step="0.05"
                value={profile.cgpa}
                onChange={(e) => setProfile({ ...profile, cgpa: parseFloat(e.target.value) })}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>4.50 (Minimum)</span>
                <span>7.00 (Standard)</span>
                <span>8.00 (Tier-1 Threshold)</span>
                <span>10.00</span>
              </div>
            </div>

            {/* Internships Slider */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Completed Internships
                </label>
                <span className="text-lg font-black text-indigo-600 bg-white px-3 py-0.5 rounded-lg border border-indigo-200">
                  {profile.internships}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={profile.internships}
                onChange={(e) => setProfile({ ...profile, internships: parseInt(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>0 (None)</span>
                <span>1 Internship</span>
                <span>2 Internships</span>
                <span>3+ Internships</span>
              </div>
            </div>

            {/* Age, Hostel & Backlogs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  min="18"
                  max="30"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 21 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Living Setup
                </label>
                <select
                  value={profile.hostel}
                  onChange={(e) => setProfile({ ...profile, hostel: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value={0}>Day Scholar</option>
                  <option value={1}>Hosteler</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Backlog History
                </label>
                <select
                  value={profile.history_of_backlogs}
                  onChange={(e) => setProfile({ ...profile, history_of_backlogs: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value={0}>No Backlogs</option>
                  <option value={1}>Has Backlogs</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition-all shadow-md shadow-brand-600/30 flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Computing Inference Across 4 Models...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Placement Prediction</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="space-y-6">
              {/* Verdict Card */}
              {(() => {
                const styling = getScoreColor(result.placement_probability);
                const pct = Math.round(result.placement_probability * 100);
                return (
                  <div className={`p-6 sm:p-7 rounded-2xl border ${styling.border} ${styling.bg} shadow-sm`}>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="text-center sm:text-left">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Prediction Result &bull; {result.selected_model}
                        </span>
                        <div className="flex items-center space-x-3 mt-1 justify-center sm:justify-start">
                          <h3 className={`text-3xl font-black ${styling.text}`}>
                            {result.predicted_status}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styling.border} bg-white ${styling.text}`}>
                            {result.confidence_category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-2 font-medium">
                          Consensus Verdict: <span className="font-bold text-slate-900">{result.consensus_verdict}</span>
                        </p>
                      </div>

                      {/* Circular Gauge */}
                      <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-white"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            strokeDasharray={`${pct}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke={styling.stroke}
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center text-center">
                          <span className={`text-2xl font-black ${styling.text}`}>{pct}%</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Probability</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Multi-Model Consensus Breakdown */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand-600" />
                    <span>Cross-Algorithm Consensus (4 ML Models)</span>
                  </h4>
                  <span className="text-xs text-slate-400">Independent predictions</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {result.all_models_consensus.map((m) => {
                    const isPlaced = m.predicted_status === 'Placed';
                    return (
                      <div
                        key={m.model_id}
                        className={`p-3 rounded-xl border text-center ${
                          isPlaced ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <span className="text-[11px] font-medium text-slate-500 block truncate" title={m.display_name}>
                          {m.display_name.split(' ')[0]}
                        </span>
                        <p className={`text-base font-extrabold mt-0.5 ${isPlaced ? 'text-emerald-700' : 'text-slate-600'}`}>
                          {isPlaced ? 'Placed' : 'Not Placed'}
                        </p>
                        <span className="text-xs font-bold text-slate-500">
                          {Math.round(m.placement_probability * 100)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explainability: Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center space-x-1.5 mb-3">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Profile Strengths</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {result.key_positive_factors.map((factor, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center space-x-1.5 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Areas for Improvement</span>
                  </h4>
                  {result.areas_for_improvement.length > 0 ? (
                    <ul className="space-y-2 text-xs text-slate-600">
                      {result.areas_for_improvement.map((area, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No significant warning flags detected in profile.</p>
                  )}
                </div>
              </div>

              {/* Personalized Actionable Recommendations */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center space-x-1.5 mb-3">
                  <Lightbulb className="w-4 h-4 text-indigo-600" />
                  <span>Strategic Placement Recommendations</span>
                </h4>
                <div className="space-y-2.5">
                  {result.personalized_recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 font-medium">
                      &bull; {rec}
                    </div>
                  ))}
                </div>
              </div>

              {/* What-If Simulator Shortcut */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white flex items-center justify-between shadow-md">
                <div className="flex items-center space-x-3">
                  <Sliders className="w-5 h-5 text-brand-200" />
                  <div>
                    <h5 className="font-bold text-sm">Want to see how +1 Internship or higher CGPA impacts you?</h5>
                    <p className="text-xs text-brand-100">Simulate hypothetical profile improvements in real-time</p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateToSimulator(profile)}
                  className="px-3.5 py-2 rounded-lg bg-white text-brand-700 font-bold text-xs hover:bg-brand-50 transition-colors flex items-center space-x-1 shadow-sm cursor-pointer"
                >
                  <span>Launch Simulator</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[350px] bg-slate-50/60 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white text-slate-400 flex items-center justify-center shadow-sm border border-slate-200 mb-3">
                <UserCheck className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Ready to Evaluate Candidate Profile</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Configure student parameters on the left and click &ldquo;Run Placement Prediction&rdquo; to compute probability, consensus, and personalized explainability.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
