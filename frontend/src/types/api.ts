export type Gender = 'Male' | 'Female';

export type EngineeringStream =
  | 'Computer Science'
  | 'Information Technology'
  | 'Electronics And Communication'
  | 'Mechanical'
  | 'Electrical'
  | 'Civil';

export type ModelId = 'random_forest' | 'decision_tree' | 'logistic_regression' | 'svm';

export interface StudentProfile {
  age: number;
  gender: Gender;
  stream: EngineeringStream;
  internships: number;
  cgpa: number;
  hostel: number;
  history_of_backlogs: number;
  preferred_model: ModelId;
}

export interface IndividualPrediction {
  model_id: ModelId;
  display_name: string;
  predicted_status: 'Placed' | 'Not Placed';
  placement_probability: number;
  confidence_category: string;
}

export interface PredictionResult {
  predicted_status: 'Placed' | 'Not Placed';
  placement_probability: number;
  confidence_category: string;
  selected_model: string;
  consensus_verdict: string;
  all_models_consensus: IndividualPrediction[];
  key_positive_factors: string[];
  areas_for_improvement: string[];
  personalized_recommendations: string[];
}

export interface WhatIfRequest {
  base_student: StudentProfile;
  simulated_cgpa?: number;
  simulated_internships?: number;
  simulated_backlogs?: number;
}

export interface WhatIfResult {
  original_probability: number;
  simulated_probability: number;
  probability_delta: number;
  original_status: string;
  simulated_status: string;
  impact_summary: string;
  selected_model: string;
}

export interface ConfusionMatrix {
  true_negative: number;
  false_positive: number;
  false_negative: number;
  true_positive: number;
}

export interface ROCCoordinate {
  fpr: number;
  tpr: number;
}

export interface FeatureImportance {
  feature: string;
  importance?: number;
  coefficient?: number;
  abs_impact?: number;
}

export interface ModelBenchmark {
  model_id: ModelId;
  display_name: string;
  training_time_seconds: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  cv_accuracy_mean: number;
  cv_accuracy_std: number;
  cv_f1_mean: number;
  cv_f1_std: number;
  confusion_matrix: ConfusionMatrix;
  roc_curve: ROCCoordinate[];
  top_features: FeatureImportance[];
}

export interface ComparisonData {
  dataset_name: string;
  total_records: number;
  train_samples: number;
  test_samples: number;
  target_placed_rate: number;
  models: ModelBenchmark[];
  features: {
    numeric: string[];
    categorical: string[];
    transformed: string[];
  };
}

export interface StreamStat {
  stream: string;
  total: number;
  placed: number;
  placement_rate: number;
}

export interface InternshipStat {
  internships: number;
  total: number;
  placed: number;
  placement_rate: number;
}

export interface CGPADistribution {
  range: string;
  total: number;
  placed: number;
  not_placed: number;
  placement_rate: number;
}

export interface NumericStat {
  feature: string;
  mean: number;
  std: number;
  min: number;
  median: number;
  max: number;
}

export interface DatasetSummary {
  dataset_name: string;
  total_records: number;
  placed_count: number;
  not_placed_count: number;
  placement_rate: number;
  streams: string[];
  genders: string[];
  stream_breakdown: StreamStat[];
  internships_breakdown: InternshipStat[];
  cgpa_distribution: CGPADistribution[];
  numeric_stats: NumericStat[];
  correlations: Record<string, number>;
}
