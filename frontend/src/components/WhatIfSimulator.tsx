import React, { useState, useEffect, useCallback } from 'react';
import type {
  StudentProfile,
  WhatIfResult
} from '../types/api';
import {
  simulateWhatIf
} from '../services/api';
import {
  Sliders,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Info,
  AlertTriangle
} from 'lucide-react';

interface WhatIfSimulatorProps {
  initialProfile?: StudentProfile;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ initialProfile }) => {
  const [baseStudent, setBaseStudent] = useState<StudentProfile>(
    initialProfile || {
      age: 22,
      gender: 'Male',
      stream: 'Computer Science',
      internships: 0,
      cgpa: 6.8,
      hostel: 0,
      history_of_backlogs: 0,
      preferred_model: 'random_forest'
    }
  );

  const [simCgpa, setSimCgpa] = useState<number>(7.8);
  const [simInternships, setSimInternships] = useState<number>(2);
  const [simBacklogs, setSimBacklogs] = useState<number>(0);

  const [simulationResult, setSimulationResult] = useState<WhatIfResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await simulateWhatIf({
        base_student: baseStudent,
        simulated_cgpa: simCgpa,
        simulated_internships: simInternships,
        simulated_backlogs: simBacklogs
      });
      setSimulationResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  }, [baseStudent, simCgpa, simInternships, simBacklogs]);

  useEffect(() => {
    runSimulation();
  }, [runSimulation]);

  const deltaPct = simulationResult ? (simulationResult.probability_delta * 100).toFixed(1) : '0';
  const isPositive = simulationResult ? simulationResult.probability_delta >= 0 : true;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
            Interactive Scenario Engine
          </span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Hypothetical Profile Sensitivity Simulator
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Explore how targeted academic interventions (raising your CGPA, completing additional internships, or clearing backlogs) shift your predicted placement probability.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sliders Column */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-brand-600" />
              <h3 className="font-bold text-slate-900 text-base">Adjust Hypothetical Parameters</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              {loading ? 'Evaluating...' : 'Live Evaluation'}
            </span>
          </div>

          {/* Base Profile Recap */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800">Current Base Student:</span>{' '}
              {baseStudent.stream} &bull; CGPA: {baseStudent.cgpa.toFixed(2)} &bull; {baseStudent.internships} Internships
            </div>
            <button
              onClick={() => {
                setSimCgpa(baseStudent.cgpa);
                setSimInternships(baseStudent.internships);
                setSimBacklogs(baseStudent.history_of_backlogs);
              }}
              className="text-brand-600 font-bold hover:underline cursor-pointer"
            >
              Reset to Base
            </button>
          </div>

          {/* Target CGPA Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Simulated Cumulative GPA (CGPA)
              </label>
              <span className="text-sm font-black text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200">
                {simCgpa.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="5.0"
              max="10.0"
              step="0.05"
              value={simCgpa}
              onChange={(e) => setSimCgpa(parseFloat(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Base: {baseStudent.cgpa.toFixed(2)}</span>
              <span>Target: {simCgpa.toFixed(2)}</span>
              <span>Difference: {(simCgpa - baseStudent.cgpa > 0 ? '+' : '') + (simCgpa - baseStudent.cgpa).toFixed(2)}</span>
            </div>
          </div>

          {/* Target Internships Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Simulated Completed Internships
              </label>
              <span className="text-sm font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                {simInternships} Internships
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              step="1"
              value={simInternships}
              onChange={(e) => setSimInternships(parseInt(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Base: {baseStudent.internships}</span>
              <span>Target: {simInternships}</span>
              <span>Difference: {(simInternships - baseStudent.internships > 0 ? '+' : '') + (simInternships - baseStudent.internships)}</span>
            </div>
          </div>

          {/* Backlogs Toggle */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Simulated Backlog Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSimBacklogs(0)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  simBacklogs === 0
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Zero Active Backlogs
              </button>
              <button
                type="button"
                onClick={() => setSimBacklogs(1)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  simBacklogs === 1
                    ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Has Backlogs
              </button>
            </div>
          </div>

          {/* Preferred Model */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Simulation Evaluation Model
            </label>
            <select
              value={baseStudent.preferred_model}
              onChange={(e) => setBaseStudent({ ...baseStudent, preferred_model: e.target.value as StudentProfile['preferred_model'] })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-brand-500"
            >
              <option value="random_forest">Random Forest Classifier</option>
              <option value="decision_tree">Decision Tree Classifier</option>
              <option value="logistic_regression">Logistic Regression</option>
              <option value="svm">Support Vector Machine (SVM)</option>
            </select>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-6 space-y-6">
          {simulationResult ? (
            <>
              {/* Delta Banner */}
              <div
                className={`p-6 rounded-2xl border shadow-sm ${
                  isPositive
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                    Net Probability Impact &bull; {simulationResult.selected_model}
                  </span>
                  <div className="flex items-center space-x-1">
                    {isPositive ? (
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-rose-600" />
                    )}
                    <span className={`text-2xl font-black ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {Number(deltaPct) > 0 ? `+${deltaPct}%` : `${deltaPct}%`}
                    </span>
                  </div>
                </div>

                <p className="text-sm font-semibold mt-2">{simulationResult.impact_summary}</p>
              </div>

              {/* Side-by-Side Comparison Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <h4 className="font-bold text-slate-900 text-sm">Baseline vs. Simulated Profile Comparison</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Baseline Box */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-xs font-bold text-slate-500 uppercase">Original Baseline</span>
                    <div className="text-3xl font-black text-slate-800 mt-2">
                      {Math.round(simulationResult.original_probability * 100)}%
                    </div>
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                      {simulationResult.original_status}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-200 space-y-1 text-left">
                      <div>CGPA: <strong>{baseStudent.cgpa.toFixed(2)}</strong></div>
                      <div>Internships: <strong>{baseStudent.internships}</strong></div>
                      <div>Backlogs: <strong>{baseStudent.history_of_backlogs ? 'Yes' : 'None'}</strong></div>
                    </div>
                  </div>

                  {/* Simulated Box */}
                  <div className="p-4 rounded-xl bg-brand-50/60 border border-brand-200 text-center">
                    <span className="text-xs font-bold text-brand-700 uppercase flex items-center justify-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Simulated Scenario</span>
                    </span>
                    <div className="text-3xl font-black text-brand-700 mt-2">
                      {Math.round(simulationResult.simulated_probability * 100)}%
                    </div>
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-600 text-white">
                      {simulationResult.simulated_status}
                    </span>
                    <div className="text-[11px] text-slate-600 mt-3 pt-3 border-t border-brand-200 space-y-1 text-left">
                      <div>Simulated CGPA: <strong className="text-brand-900">{simCgpa.toFixed(2)}</strong></div>
                      <div>Simulated Internships: <strong className="text-brand-900">{simInternships}</strong></div>
                      <div>Simulated Backlogs: <strong className="text-brand-900">{simBacklogs ? 'Yes' : 'None'}</strong></div>
                    </div>
                  </div>
                </div>

                {/* Progress Comparison Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Baseline: {Math.round(simulationResult.original_probability * 100)}%</span>
                    <span className="text-brand-700">Target: {Math.round(simulationResult.simulated_probability * 100)}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-slate-400 h-full"
                      style={{ width: `${Math.round(simulationResult.original_probability * 100)}%` }}
                    />
                    {simulationResult.probability_delta > 0 && (
                      <div
                        className="bg-brand-500 h-full animate-pulse"
                        style={{ width: `${Math.round(simulationResult.probability_delta * 100)}%` }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Informational Takeaway */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3 text-xs text-slate-600">
                <Info className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Practical Guidance:</strong> The model demonstrates that boosting CGPA across the 8.0 threshold creates a non-linear leap in interview shortlist rates. Internships act as a secondary catalyst, mitigating borderline CGPAs during final selection rounds.
                </p>
              </div>
            </>
          ) : (
            <div className="h-full min-h-[300px] flex items-center justify-center bg-white rounded-2xl border border-slate-200">
              <div className="text-center text-slate-400 text-sm">
                Adjust sliders to trigger real-time scenario simulation
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
