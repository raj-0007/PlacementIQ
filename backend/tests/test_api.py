"""
Tests for FastAPI Endpoints using TestClient
"""

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["project"] == "PlacementIQ"
    assert data["status"] == "online"


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["models_count"] == 4
    assert "random_forest" in data["models_loaded"]
    assert "svm" in data["models_loaded"]
    assert "decision_tree" in data["models_loaded"]
    assert "logistic_regression" in data["models_loaded"]
    assert data["preprocessor_ready"] is True


def test_models_comparison():
    response = client.get("/api/models/comparison")
    assert response.status_code == 200
    data = response.json()
    assert data["total_records"] == 2966
    assert len(data["models"]) == 4

    model_ids = [m["model_id"] for m in data["models"]]
    for expected in ["logistic_regression", "decision_tree", "random_forest", "svm"]:
        assert expected in model_ids


def test_dataset_summary():
    response = client.get("/api/analytics/dataset-summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_records"] == 2966
    assert data["placement_rate"] > 0
    assert len(data["streams"]) >= 5
    assert len(data["stream_breakdown"]) >= 5
    assert len(data["cgpa_distribution"]) >= 4


def test_predict_success():
    payload = {
        "age": 22,
        "gender": "Male",
        "stream": "Computer Science",
        "internships": 2,
        "cgpa": 8.7,
        "hostel": 0,
        "history_of_backlogs": 0,
        "preferred_model": "random_forest"
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_status"] in ["Placed", "Not Placed"]
    assert 0.0 <= data["placement_probability"] <= 1.0
    assert len(data["all_models_consensus"]) == 4
    assert len(data["key_positive_factors"]) >= 1
    assert len(data["personalized_recommendations"]) >= 1


def test_predict_validation_error():
    # CGPA cannot exceed 10.0
    invalid_payload = {
        "age": 22,
        "gender": "Male",
        "stream": "Computer Science",
        "internships": 2,
        "cgpa": 12.5,
        "hostel": 0,
        "history_of_backlogs": 0,
        "preferred_model": "random_forest"
    }
    response = client.post("/api/predict", json=invalid_payload)
    assert response.status_code == 422


def test_what_if_simulation():
    payload = {
        "base_student": {
            "age": 21,
            "gender": "Female",
            "stream": "Information Technology",
            "internships": 0,
            "cgpa": 6.5,
            "hostel": 1,
            "history_of_backlogs": 0,
            "preferred_model": "random_forest"
        },
        "simulated_cgpa": 8.2,
        "simulated_internships": 2
    }
    response = client.post("/api/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "original_probability" in data
    assert "simulated_probability" in data
    assert "probability_delta" in data
    assert data["simulated_probability"] >= data["original_probability"]
