"""
PlacementIQ Backend Configuration
"""

from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
ML_DIR = BASE_DIR / "ml"
DATA_DIR = ML_DIR / "data"
MODELS_DIR = ML_DIR / "saved_models"

DATASET_CSV = DATA_DIR / "college_placement.csv"
PREPROCESSOR_PATH = MODELS_DIR / "preprocessor.joblib"
METRICS_JSON_PATH = MODELS_DIR / "metrics_summary.json"
DATASET_SUMMARY_PATH = MODELS_DIR / "dataset_summary.json"

MODEL_PATHS = {
    "logistic_regression": MODELS_DIR / "logistic_regression.joblib",
    "decision_tree": MODELS_DIR / "decision_tree.joblib",
    "random_forest": MODELS_DIR / "random_forest.joblib",
    "svm": MODELS_DIR / "svm.joblib",
}

# CORS
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]
