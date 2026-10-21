"""
Pydantic Schemas for Prediction & Simulation Responses
"""

from typing import List
from pydantic import BaseModel


class IndividualModelPrediction(BaseModel):
    model_id: str
    display_name: str
    predicted_status: str
    placement_probability: float
    confidence_category: str


class PredictionResponse(BaseModel):
    predicted_status: str
    placement_probability: float
    confidence_category: str
    selected_model: str
    consensus_verdict: str
    all_models_consensus: List[IndividualModelPrediction]
    key_positive_factors: List[str]
    areas_for_improvement: List[str]
    personalized_recommendations: List[str]


class SimulationResponse(BaseModel):
    original_probability: float
    simulated_probability: float
    probability_delta: float
    original_status: str
    simulated_status: str
    impact_summary: str
    selected_model: str

