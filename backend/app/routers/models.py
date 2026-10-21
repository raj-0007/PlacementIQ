"""
API Router for 4-Model Benchmarks, ROC Curves, and Confusion Matrices
"""

from fastapi import APIRouter, HTTPException
from app.schemas.analytics import ModelsComparisonResponse
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/api/models", tags=["Models"])


@router.get("/comparison", response_model=ModelsComparisonResponse)
def get_four_models_comparison():
    """
    Returns the comprehensive benchmark of the four required ML algorithms:
    Logistic Regression, Decision Tree, Random Forest, and Support Vector Machine.
    Includes accuracy, precision, recall, F1, ROC-AUC, 5-fold CV, confusion matrices, and ROC coordinates.
    """
    data = analytics_service.get_models_comparison()
    if not data:
        raise HTTPException(status_code=404, detail="Model benchmark metrics not found.")
    return data

