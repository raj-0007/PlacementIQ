"""
Analytics Service - Model Comparison & Dataset Statistics
"""

import json
from pathlib import Path
from typing import Dict, Any, List
import pandas as pd
from app.config import METRICS_JSON_PATH, DATASET_SUMMARY_PATH, DATASET_CSV


class AnalyticsService:
    def __init__(self):
        self._metrics_cache: Dict[str, Any] = {}
        self._dataset_summary_cache: Dict[str, Any] = {}
        self.load_cache()

    def load_cache(self):
        if METRICS_JSON_PATH.exists():
            with open(METRICS_JSON_PATH, "r", encoding="utf-8") as f:
                self._metrics_cache = json.load(f)

        if DATASET_SUMMARY_PATH.exists():
            with open(DATASET_SUMMARY_PATH, "r", encoding="utf-8") as f:
                self._dataset_summary_cache = json.load(f)

    def get_models_comparison(self) -> Dict[str, Any]:
        if not self._metrics_cache and METRICS_JSON_PATH.exists():
            self.load_cache()
        return self._metrics_cache

    def get_dataset_summary(self) -> Dict[str, Any]:
        if not self._dataset_summary_cache and DATASET_SUMMARY_PATH.exists():
            self.load_cache()
        return self._dataset_summary_cache

    def get_sample_records(self, limit: int = 50) -> List[Dict[str, Any]]:
        if DATASET_CSV.exists():
            df = pd.read_csv(DATASET_CSV)
            return df.head(limit).to_dict(orient="records")
        return []


analytics_service = AnalyticsService()
