"""
API Router for Dataset Analytics and EDA Summaries
"""

from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from app.schemas.analytics import DatasetSummaryResponse
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/dataset-summary", response_model=DatasetSummaryResponse)
def get_dataset_summary():
    """
    Returns descriptive statistics, stream distributions, internship success rates,
    CGPA bins, and correlations from the historical benchmark dataset.
    """
    data = analytics_service.get_dataset_summary()
    if not data:
        raise HTTPException(status_code=404, detail="Dataset summary not found.")
    return data


@router.get("/sample-records", response_model=List[Dict[str, Any]])
def get_sample_records(limit: int = Query(30, ge=5, le=100)):
    """
    Returns raw sample records from the dataset for tabular data inspection.
    """
    return analytics_service.get_sample_records(limit=limit)
