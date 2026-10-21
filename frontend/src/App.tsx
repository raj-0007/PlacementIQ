import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import type { NavTab } from './components/Navbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { PredictionForm } from './components/PredictionForm';
import { ModelComparison } from './components/ModelComparison';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { DatasetExplorer } from './components/DatasetExplorer';
import {
  fetchDatasetSummary,
  fetchModelsComparison,
  predictStudentPlacement,
  checkBackendHealth
} from './services/api';
import type {
  DatasetSummary,
  ComparisonData,
  StudentProfile,
  PredictionResult
} from './types/api';
import { GraduationCap, ExternalLink } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [datasetSummary, setDatasetSummary] = useState<DatasetSummary | null>(null);
  const [modelsData, setModelsData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [simulatorInitialProfile, setSimulatorInitialProfile] = useState<StudentProfile | undefined>(undefined);

  useEffect(() => {
    async function initData() {
      setLoading(true);
      try {
        const health = await checkBackendHealth();
        if (health.status === 'healthy') {
          setBackendOnline(true);
        }
      } catch {
        setBackendOnline(false);
      }

      try {
        const [summary, comp] = await Promise.all([
          fetchDatasetSummary().catch(() => null),
          fetchModelsComparison().catch(() => null)
        ]);
        if (summary) setDatasetSummary(summary);
        if (comp) setModelsData(comp);
      } catch (err) {
        console.error('Data initialization error:', err);
      } finally {
        setLoading(false);
      }
    }

    initData();
  }, []);

  const handlePredict = async (profile: StudentProfile): Promise<PredictionResult> => {
    return await predictStudentPlacement(profile);
  };

  const handleNavigateToSimulator = (profile: StudentProfile) => {
    setSimulatorInitialProfile(profile);
    setActiveTab('simulator');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        backendOnline={backendOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'overview' && (
          <OverviewDashboard
            summary={datasetSummary}
            loading={loading}
            onNavigateToPredict={() => setActiveTab('predict')}
          />
        )}

        {activeTab === 'predict' && (
          <PredictionForm
            onPredict={handlePredict}
            onNavigateToSimulator={handleNavigateToSimulator}
          />
        )}

        {activeTab === 'comparison' && (
          <ModelComparison
            data={modelsData}
            loading={loading}
          />
        )}

        {activeTab === 'simulator' && (
          <WhatIfSimulator
            initialProfile={simulatorInitialProfile}
          />
        )}

        {activeTab === 'dataset' && (
          <DatasetExplorer
            summary={datasetSummary}
            loading={loading}
          />
        )}
      </main>

      {/* Academic Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-slate-700">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900">PlacementIQ</span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500">College Mini-Project (15 Marks)</span>
          </div>

          <p className="text-xs text-slate-400 text-center sm:text-right">
            Benchmarking: Logistic Regression &bull; Decision Tree &bull; Random Forest &bull; SVM
          </p>

          <a
            href="https://github.com/raj-0007/PlacementIQ"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <span>GitHub: raj-0007/PlacementIQ</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
