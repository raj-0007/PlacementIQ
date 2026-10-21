"""
Machine Learning Service - Inference, Multi-Model Consensus, and Explainability
"""

import logging
from typing import Dict, Any, List
import joblib
import pandas as pd
from app.config import PREPROCESSOR_PATH, MODEL_PATHS
from app.schemas.student import StudentProfileRequest, WhatIfSimulationRequest
from app.schemas.prediction import (
    IndividualModelPrediction,
    PredictionResponse,
    SimulationResponse
)

logger = logging.getLogger(__name__)

DISPLAY_NAMES = {
    "logistic_regression": "Logistic Regression",
    "decision_tree": "Decision Tree Classifier",
    "random_forest": "Random Forest Classifier",
    "svm": "Support Vector Machine (SVM)",
}


class MLService:
    def __init__(self):
        self.preprocessor = None
        self.models: Dict[str, Any] = {}
        self.load_artifacts()

    def load_artifacts(self):
        """Loads serialized preprocessor and model artifacts into memory."""
        try:
            if PREPROCESSOR_PATH.exists():
                self.preprocessor = joblib.load(PREPROCESSOR_PATH)
                logger.info(f"Loaded preprocessor from {PREPROCESSOR_PATH}")

            for model_id, path in MODEL_PATHS.items():
                if path.exists():
                    self.models[model_id] = joblib.load(path)
                    logger.info(f"Loaded {model_id} from {path}")
                else:
                    logger.warning(f"Model path does not exist: {path}")
        except Exception as e:
            logger.error(f"Error loading ML artifacts: {e}", exc_info=True)

    def _student_to_df(self, student: StudentProfileRequest) -> pd.DataFrame:
        """Converts Pydantic student request to DataFrame matching training columns."""
        return pd.DataFrame([{
            "Age": student.age,
            "Gender": student.gender,
            "Stream": student.stream,
            "Internships": student.internships,
            "CGPA": student.cgpa,
            "Hostel": student.hostel,
            "HistoryOfBacklogs": student.history_of_backlogs,
        }])

    def _get_confidence_category(self, prob: float) -> str:
        if prob >= 0.70:
            return "High Likelihood"
        elif prob >= 0.45:
            return "Moderate Likelihood"
        else:
            return "At Risk / Low Likelihood"

    def predict_single(self, student: StudentProfileRequest, model_id: str) -> IndividualModelPrediction:
        """Runs inference for a specific model."""
        if model_id not in self.models:
            raise ValueError(f"Model '{model_id}' is not loaded. Available: {list(self.models.keys())}")
        if self.preprocessor is None:
            raise ValueError("Preprocessor artifact is not loaded.")

        df = self._student_to_df(student)
        X_proc = self.preprocessor.transform(df)
        model = self.models[model_id]

        pred = int(model.predict(X_proc)[0])
        prob = float(model.predict_proba(X_proc)[0][1])
        status = "Placed" if pred == 1 else "Not Placed"

        return IndividualModelPrediction(
            model_id=model_id,
            display_name=DISPLAY_NAMES.get(model_id, model_id),
            predicted_status=status,
            placement_probability=round(prob, 4),
            confidence_category=self._get_confidence_category(prob)
        )

    def predict_all_consensus(self, student: StudentProfileRequest) -> PredictionResponse:
        """Evaluates all 4 models, computes consensus and generates explanations."""
        if not self.models:
            raise RuntimeError("No ML models are loaded in memory.")

        all_predictions: List[IndividualModelPrediction] = []
        placed_votes = 0

        for m_id in ["random_forest", "decision_tree", "logistic_regression", "svm"]:
            if m_id in self.models:
                pred = self.predict_single(student, m_id)
                all_predictions.append(pred)
                if pred.predicted_status == "Placed":
                    placed_votes += 1

        total_models = len(all_predictions)
        selected_model_id = student.preferred_model if student.preferred_model in self.models else "random_forest"
        chosen_prediction = next((p for p in all_predictions if p.model_id == selected_model_id), all_predictions[0])

        consensus_verdict = f"{placed_votes} of {total_models} models predict Placed"

        # Explainability & Recommendations Engine
        key_positives = []
        areas_to_improve = []
        recommendations = []

        # CGPA Insights
        if student.cgpa >= 8.0:
            key_positives.append(
                f"Outstanding CGPA of {student.cgpa:.2f} puts you in the top tier (>85% historical placement rate)."
            )
        elif student.cgpa >= 7.0:
            key_positives.append(
                f"Solid CGPA of {student.cgpa:.2f} satisfies the eligibility cutoffs for standard corporate drives."
            )
        else:
            areas_to_improve.append(
                f"CGPA of {student.cgpa:.2f} is below the 7.0 threshold where recruitment selection spikes dramatically."
            )
            recommendations.append(
                "Aim to raise your semester GPA to bring cumulative CGPA above 7.0 to unlock more company shortlists."
            )

        # Internships Insights
        if student.internships >= 2:
            key_positives.append(
                f"Having {student.internships} completed internships demonstrates strong hands-on industry readiness."
            )
        elif student.internships == 1:
            key_positives.append(
                "1 completed internship provides valuable practical experience on your resume."
            )
            recommendations.append(
                "Consider targeting a second internship or capstone live project to further boost your profile."
            )
        else:
            areas_to_improve.append(
                "Zero recorded internships — corporate recruiters place substantial weight on practical experience."
            )
            recommendations.append(
                "Prioritize securing a 6-to-8 week summer or winter industrial internship before placement season begins."
            )

        # Backlogs Insights
        if student.history_of_backlogs == 1:
            areas_to_improve.append(
                "History of academic backlogs is flagged by automated eligibility filters at several Tier-1 recruiters."
            )
            recommendations.append(
                "Ensure all active backlogs are formally cleared with documentation before on-campus drives commence."
            )
        else:
            key_positives.append("Clean academic track record with no history of backlogs.")

        # Stream & General Recommendations
        if student.stream in ["Computer Science", "Information Technology"]:
            recommendations.append(
                "Strengthen core CS fundamentals (DSA, DBMS, OS, Computer Networks) and maintain an active GitHub portfolio."
            )
        else:
            recommendations.append(
                f"Leverage your domain expertise in {student.stream} while practicing core aptitude and coding fundamentals."
            )

        if not key_positives:
            key_positives.append("Active candidate profile evaluated across multiple academic and experiential benchmarks.")

        return PredictionResponse(
            predicted_status=chosen_prediction.predicted_status,
            placement_probability=chosen_prediction.placement_probability,
            confidence_category=chosen_prediction.confidence_category,
            selected_model=chosen_prediction.display_name,
            consensus_verdict=consensus_verdict,
            all_models_consensus=all_predictions,
            key_positive_factors=key_positives,
            areas_for_improvement=areas_to_improve,
            personalized_recommendations=recommendations
        )

    def simulate_what_if(self, req: WhatIfSimulationRequest) -> SimulationResponse:
        """Simulates sensitivity by modifying specific student attributes."""
        model_id = req.base_student.preferred_model if req.base_student.preferred_model in self.models else "random_forest"
        orig_pred = self.predict_single(req.base_student, model_id)

        # Build modified student profile
        sim_data = req.base_student.model_dump()
        if req.simulated_cgpa is not None:
            sim_data["cgpa"] = req.simulated_cgpa
        if req.simulated_internships is not None:
            sim_data["internships"] = req.simulated_internships
        if req.simulated_backlogs is not None:
            sim_data["history_of_backlogs"] = req.simulated_backlogs

        sim_student = StudentProfileRequest(**sim_data)
        sim_pred = self.predict_single(sim_student, model_id)

        delta = round(sim_pred.placement_probability - orig_pred.placement_probability, 4)
        pct_change = delta * 100

        if delta > 0.05:
            summary = (
                f"Positive impact! Probability increases by +{pct_change:.1f}% "
                f"(from {orig_pred.placement_probability * 100:.1f}% to {sim_pred.placement_probability * 100:.1f}%)."
            )
        elif delta < -0.05:
            summary = (
                f"Risk factor observed: Probability drops by {pct_change:.1f}% "
                f"(from {orig_pred.placement_probability * 100:.1f}% to {sim_pred.placement_probability * 100:.1f}%)."
            )
        else:
            summary = (
                f"Marginal impact: Probability changed slightly by {pct_change:+.1f}% "
                f"(from {orig_pred.placement_probability * 100:.1f}% to {sim_pred.placement_probability * 100:.1f}%)."
            )

        return SimulationResponse(
            original_probability=orig_pred.placement_probability,
            simulated_probability=sim_pred.placement_probability,
            probability_delta=delta,
            original_status=orig_pred.predicted_status,
            simulated_status=sim_pred.predicted_status,
            impact_summary=summary,
            selected_model=orig_pred.display_name
        )


# Singleton instance
ml_service = MLService()

