"""
Tests for ML Artifacts and Pipeline Loading
"""

import json
from pathlib import Path
import joblib
import pandas as pd
import pytest

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "ml" / "saved_models"
METRICS_JSON = MODELS_DIR / "metrics_summary.json"


def test_artifacts_exist():
    expected_files = [
        "preprocessor.joblib",
        "logistic_regression.joblib",
        "decision_tree.joblib",
        "random_forest.joblib",
        "svm.joblib",
        "metrics_summary.json",
        "dataset_summary.json"
    ]
    for filename in expected_files:
        filepath = MODELS_DIR / filename
        assert filepath.exists(), f"Expected artifact {filename} does not exist at {filepath}"


def test_metrics_integrity():
    with open(METRICS_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data["total_records"] == 2966
    assert data["train_samples"] == 2372
    assert data["test_samples"] == 594

    models = {m["model_id"]: m for m in data["models"]}
    expected_model_ids = ["logistic_regression", "decision_tree", "random_forest", "svm"]

    for m_id in expected_model_ids:
        assert m_id in models, f"Model {m_id} missing from benchmark summary"
        m = models[m_id]
        assert 0.70 <= m["accuracy"] <= 1.0, f"{m_id} accuracy out of expected range: {m['accuracy']}"
        assert 0.70 <= m["f1_score"] <= 1.0, f"{m_id} F1 score out of expected range: {m['f1_score']}"
        assert 0.85 <= m["roc_auc"] <= 1.0, f"{m_id} ROC-AUC out of expected range: {m['roc_auc']}"

        cm = m["confusion_matrix"]
        for key in ["true_negative", "false_positive", "false_negative", "true_positive"]:
            assert key in cm and cm[key] >= 0

        assert len(m["roc_curve"]) >= 10, f"{m_id} ROC points insufficient: {len(m['roc_curve'])}"


def test_pipeline_inference():
    preprocessor = joblib.load(MODELS_DIR / "preprocessor.joblib")
    sample_df = pd.DataFrame([{
        "Age": 22,
        "Gender": "Male",
        "Stream": "Computer Science",
        "Internships": 2,
        "CGPA": 8.5,
        "Hostel": 0,
        "HistoryOfBacklogs": 0
    }])

    transformed = preprocessor.transform(sample_df)
    assert transformed.shape[0] == 1
    assert transformed.shape[1] > 5

    for m_id in ["logistic_regression", "decision_tree", "random_forest", "svm"]:
        clf = joblib.load(MODELS_DIR / f"{m_id}.joblib")
        pred = clf.predict(transformed)[0]
        prob = clf.predict_proba(transformed)[0][1]

        assert pred in [0, 1]
        assert 0.0 <= prob <= 1.0
