"""
API Router for Student Prediction and What-If Simulator
"""

from fastapi import APIRouter, HTTPException
from app.schemas.student import StudentProfileRequest, WhatIfSimulationRequest
from app.schemas.prediction import PredictionResponse, SimulationResponse
from app.services.ml_service import ml_service

router = APIRouter(prefix="/api", tags=["Prediction"])


@router.post("/predict", response_model=PredictionResponse)
def predict_student_placement(request: StudentProfileRequest):
    """
    Predicts student placement status, calibrated probability,
    consensus across all 4 ML algorithms, and personalized recommendations.
    """
    try:
        return ml_service.predict_all_consensus(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.post("/simulate", response_model=SimulationResponse)
def simulate_what_if_scenario(request: WhatIfSimulationRequest):
    """
    Evaluates sensitivity when prospective students modify CGPA, internships,
    or backlogs to see the delta probability impact in real-time.
    """
    try:
        return ml_service.simulate_what_if(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")

