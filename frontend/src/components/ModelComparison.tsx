import React, { useState } from 'react';
import type {
  ComparisonData,
  ModelId
} from '../types/api';
import {
  Trophy,
  Activity,
  Grid,
  BarChart2,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface ModelComparisonProps {
  data: ComparisonData | null;
  loading: boolean;
}

export const ModelComparison: React.FC<ModelComparisonProps> = ({ data, loading }) => {
  const [selectedModelId, setSelectedModelId] = useState<ModelId>('random_forest');

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading four-model evaluation benchmark...</p>
      </div>
    );
  }

  const selectedModel = data.models.find((m) => m.model_id === selectedModelId) || data.models[0];

  // Colors for ROC curve lines
  const modelColors: Record<string, string> = {
    random_forest: '#4f46e5', // Indigo
    decision_tree: '#10b981', // Emerald
    logistic_regression: '#f59e0b', // Amber
    svm: '#8b5cf6', // Violet
  };

  // Prepare combined ROC data for all 4 models
  const rocCombined: { fpr: number; rf?: number; dt?: number; lr?: number; svm?: number; diagonal: number }[] = [];
  const rfModel = data.models.find((m) => m.model_id === 'random_forest');
  const dtModel = data.models.find((m) => m.model_id === 'decision_tree');
  const lrModel = data.models.find((m) => m.model_id === 'logistic_regression');
  const svmModel = data.models.find((m) => m.model_id === 'svm');

  const baseCurve = rfModel?.roc_curve || [];
  baseCurve.forEach((pt, i) => {
    rocCombined.push({
      fpr: pt.fpr,
      rf: pt.tpr,
      dt: dtModel?.roc_curve[i]?.tpr,
      lr: lrModel?.roc_curve[i]?.tpr,
      svm: svmModel?.roc_curve[i]?.tpr,
      diagonal: pt.fpr,
    });
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
            Mandatory 4-Algorithm Benchmark
          </span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Comparative Machine Learning Model Evaluation
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Strict empirical comparison of Logistic Regression, Decision Tree, Random Forest, and Support Vector Machine on identical 80/20 stratified splits with 5-fold cross-validation.
        </p>
      </div>

      {/* 4-Model Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-base">Model Performance Leaderboard</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Test Set: 594 instances &bull; 5-Fold Stratified CV</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Precision</th>
                <th className="py-3 px-4">Recall</th>
                <th className="py-3 px-4">F1-Score</th>
                <th className="py-3 px-4">ROC-AUC</th>
                <th className="py-3 px-4">5-Fold CV Accuracy</th>
                <th className="py-3 px-4">Training Time</th>
                <th className="py-3 px-4 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {data.models.map((m) => {
                const isSelected = m.model_id === selectedModelId;
                const isTopAcc = m.accuracy === Math.max(...data.models.map((x) => x.accuracy));
                const isTopF1 = m.f1_score === Math.max(...data.models.map((x) => x.f1_score));
                const isTopAUC = m.roc_auc === Math.max(...data.models.map((x) => x.roc_auc));

                return (
                  <tr
                    key={m.model_id}
                    className={`transition-colors hover:bg-slate-50/80 cursor-pointer ${
                      isSelected ? 'bg-brand-50/40' : ''
                    }`}
                    onClick={() => setSelectedModelId(m.model_id)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: modelColors[m.model_id] }}
                        />
                        <span className="font-bold text-slate-900">{m.display_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={isTopAcc ? 'font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md' : 'text-slate-800'}>
                        {(m.accuracy * 100).toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800">{(m.precision * 100).toFixed(2)}%</td>
                    <td className="py-3.5 px-4 text-slate-800">{(m.recall * 100).toFixed(2)}%</td>
                    <td className="py-3.5 px-4">
                      <span className={isTopF1 ? 'font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md' : 'text-slate-800'}>
                        {(m.f1_score * 100).toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={isTopAUC ? 'font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md' : 'text-slate-800'}>
                        {m.roc_auc.toFixed(4)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {(m.cv_accuracy_mean * 100).toFixed(2)}% &plusmn; {(m.cv_accuracy_std * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{m.training_time_seconds}s</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModelId(m.model_id);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          isSelected
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? 'Viewing' : 'View'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row: ROC Curves & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Multi-Model ROC Curves Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-base">Multi-Model Receiver Operating Characteristic (ROC)</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">True Positive Rate vs. False Positive Rate across all 4 algorithms</p>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocCombined} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="fpr"
                  label={{ value: 'False Positive Rate (1 - Specificity)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#64748b' }}
                  domain={[0, 1]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  label={{ value: 'True Positive Rate (Sensitivity)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: '#64748b' }}
                  domain={[0, 1]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any) => [val !== undefined ? Number(val).toFixed(4) : '', 'TPR']}
                  labelFormatter={(lbl) => `FPR: ${Number(lbl).toFixed(4)}`}
                  contentStyle={{ borderRadius: '0.75rem', border: '1px solid #cbd5e1', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                <Line type="monotone" dataKey="rf" stroke="#4f46e5" strokeWidth={2.5} dot={false} name="Random Forest (AUC 0.9213)" />
                <Line type="monotone" dataKey="dt" stroke="#10b981" strokeWidth={2} dot={false} name="Decision Tree (AUC 0.9203)" />
                <Line type="monotone" dataKey="lr" stroke="#f59e0b" strokeWidth={2} dot={false} name="Logistic Regression (AUC 0.8869)" />
                <Line type="monotone" dataKey="svm" stroke="#8b5cf6" strokeWidth={2} dot={false} name="SVM RBF (AUC 0.9256)" />
                <Line type="monotone" dataKey="diagonal" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={1.5} dot={false} name="Random Chance (AUC 0.50)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix Interactive Visualizer */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Grid className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Confusion Matrix Visualizer</h3>
              </div>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                {selectedModel.display_name.split(' ')[0]}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Select any algorithm to view its 2&times;2 classification error distribution on 594 test students.
            </p>

            {/* Algorithm Pills */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {data.models.map((m) => (
                <button
                  key={m.model_id}
                  onClick={() => setSelectedModelId(m.model_id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-left truncate ${
                    selectedModelId === m.model_id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {m.display_name}
                </button>
              ))}
            </div>

            {/* 2x2 Confusion Matrix Grid */}
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
              <div className="grid grid-cols-2 gap-3 text-center">
                {/* True Negative */}
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block">True Negative (TN)</span>
                  <span className="text-2xl font-black text-emerald-700 block mt-1">
                    {selectedModel.confusion_matrix.true_negative}
                  </span>
                  <span className="text-[10px] text-emerald-600 mt-1 block">Correctly identified Not Placed</span>
                </div>

                {/* False Positive */}
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl">
                  <span className="text-[11px] font-bold text-rose-800 uppercase block">False Positive (FP)</span>
                  <span className="text-2xl font-black text-rose-700 block mt-1">
                    {selectedModel.confusion_matrix.false_positive}
                  </span>
                  <span className="text-[10px] text-rose-600 mt-1 block">Type I Error (False Alarm)</span>
                </div>

                {/* False Negative */}
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                  <span className="text-[11px] font-bold text-amber-800 uppercase block">False Negative (FN)</span>
                  <span className="text-2xl font-black text-amber-700 block mt-1">
                    {selectedModel.confusion_matrix.false_negative}
                  </span>
                  <span className="text-[10px] text-amber-600 mt-1 block">Type II Error (Missed Offer)</span>
                </div>

                {/* True Positive */}
                <div className="bg-brand-50 border border-brand-200 p-4 rounded-xl">
                  <span className="text-[11px] font-bold text-brand-800 uppercase block">True Positive (TP)</span>
                  <span className="text-2xl font-black text-brand-700 block mt-1">
                    {selectedModel.confusion_matrix.true_positive}
                  </span>
                  <span className="text-[10px] text-brand-600 mt-1 block">Correctly identified Placed</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Accuracy: <strong className="text-slate-800">{(selectedModel.accuracy * 100).toFixed(1)}%</strong></span>
            <span>Precision: <strong className="text-slate-800">{(selectedModel.precision * 100).toFixed(1)}%</strong></span>
            <span>Recall: <strong className="text-slate-800">{(selectedModel.recall * 100).toFixed(1)}%</strong></span>
          </div>
        </div>
      </div>

      {/* Feature Importance / Coefficients Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-brand-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Feature Importance & Factor Attribution &bull; {selectedModel.display_name}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirical weights determining placement decision boundaries for the selected classifier
            </p>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Normalized importance scale</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={selectedModel.top_features.map((f) => ({
                feature: f.feature.replace('Stream_', '').replace('Gender_', ''),
                importance: f.importance !== undefined ? f.importance : f.abs_impact || 0
              }))}
              margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="feature" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(val: any) => [val !== undefined ? Number(val).toFixed(4) : '', 'Predictive Weight']}
                contentStyle={{ borderRadius: '0.75rem', border: '1px solid #cbd5e1' }}
              />
              <Bar dataKey="importance" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Relative Weight" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3 text-xs text-slate-600">
          <HelpCircle className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Methodology Note:</strong> For tree models (Random Forest and Decision Tree), importances represent Mean Decrease in Impurity (Gini importance). For Logistic Regression, weights reflect absolute log-odds coefficients (&beta;<sub>i</sub>). For SVM, permutation importance across 5 cross-validation repeats is measured.
          </p>
        </div>
      </div>
    </div>
  );
};
