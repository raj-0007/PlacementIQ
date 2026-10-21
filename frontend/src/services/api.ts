import type {
  StudentProfile,
  PredictionResult,
  WhatIfRequest,
  WhatIfResult,
  ComparisonData,
  DatasetSummary
} from '../types/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function fetchDatasetSummary(): Promise<DatasetSummary> {
  const res = await fetch(`${API_BASE}/analytics/dataset-summary`);
  if (!res.ok) {
    throw new Error(`Failed to load dataset summary: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchSampleRecords(limit = 25): Promise<Record<string, unknown>[]> {
  const res = await fetch(`${API_BASE}/analytics/sample-records?limit=${limit}`);
  if (!res.ok) {
    throw new Error(`Failed to load sample records: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchModelsComparison(): Promise<ComparisonData> {
  const res = await fetch(`${API_BASE}/models/comparison`);
  if (!res.ok) {
    throw new Error(`Failed to load models benchmark comparison: ${res.statusText}`);
  }
  return res.json();
}

export async function predictStudentPlacement(profile: StudentProfile): Promise<PredictionResult> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Prediction request failed (${res.status})`);
  }
  return res.json();
}

export async function simulateWhatIf(request: WhatIfRequest): Promise<WhatIfResult> {
  const res = await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Simulation request failed (${res.status})`);
  }
  return res.json();
}

export async function checkBackendHealth(): Promise<{ status: string; models_count: number }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error(`Backend health check failed (${res.status})`);
  }
  return res.json();
}
