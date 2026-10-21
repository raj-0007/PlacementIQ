"""
Pydantic Schemas for Analytics, Benchmarks, and Dataset Summaries
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class ConfusionMatrixData(BaseModel):
    true_negative: int
    false_positive: int
    false_negative: int
    true_positive: int


class ROCCoordinate(BaseModel):
    fpr: float
    tpr: float


class FeatureImportanceItem(BaseModel):
    feature: str
    importance: Optional[float] = None
    coefficient: Optional[float] = None
    abs_impact: Optional[float] = None


class ModelBenchmarkItem(BaseModel):
    model_id: str
    display_name: str
    training_time_seconds: float
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    cv_accuracy_mean: float
    cv_accuracy_std: float
    cv_f1_mean: float
    cv_f1_std: float
    confusion_matrix: ConfusionMatrixData
    roc_curve: List[ROCCoordinate]
    top_features: List[FeatureImportanceItem]


class ModelsComparisonResponse(BaseModel):
    dataset_name: str
    total_records: int
    train_samples: int
    test_samples: int
    target_placed_rate: float
    models: List[ModelBenchmarkItem]
    features: Dict[str, Any]


class StreamStatItem(BaseModel):
    stream: str
    total: int
    placed: int
    placement_rate: float


class InternshipStatItem(BaseModel):
    internships: int
    total: int
    placed: int
    placement_rate: float


class CGPADistributionItem(BaseModel):
    range: str
    total: int
    placed: int
    not_placed: int
    placement_rate: float


class NumericStatItem(BaseModel):
    feature: str
    mean: float
    std: float
    min: float
    median: float
    max: float


class DatasetSummaryResponse(BaseModel):
    dataset_name: str
    total_records: int
    placed_count: int
    not_placed_count: int
    placement_rate: float
    streams: List[str]
    genders: List[str]
    stream_breakdown: List[StreamStatItem]
    internships_breakdown: List[InternshipStatItem]
    cgpa_distribution: List[CGPADistributionItem]
    numeric_stats: List[NumericStatItem]
    correlations: Dict[str, float]
