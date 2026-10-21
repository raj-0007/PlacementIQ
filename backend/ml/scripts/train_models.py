"""
PlacementIQ - Four-Model Training, Evaluation, and Serialization Pipeline
Models:
  1. Logistic Regression
  2. Decision Tree Classifier
  3. Random Forest Classifier
  4. Support Vector Machine (SVM with RBF kernel and Platt scaling)
"""

import json
from pathlib import Path
import time
import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "saved_models"
CLEANED_CSV = DATA_DIR / "student_placement_cleaned.csv"
METRICS_JSON = MODELS_DIR / "metrics_summary.json"

TARGET = "placed"
ID_COLUMNS = ["student_id"]


def train_and_evaluate_all():
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Reading cleaned dataset from {CLEANED_CSV}...")
    df = pd.read_csv(CLEANED_CSV)

    # 1. Feature separation
    X = df.drop(columns=[TARGET] + ID_COLUMNS)
    y = df[TARGET].astype(int)

    categorical_features = ["gender", "preferred_domain"]
    numeric_features = [col for col in X.columns if col not in categorical_features]

    print(f"Total features: {len(X.columns)} ({len(numeric_features)} numeric, {len(categorical_features)} categorical)")
    print(f"Class balance: {y.value_counts().to_dict()} (Ratio: {y.mean():.2%})")

    # 2. Stratified Train-Test Split (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Training split: {X_train.shape[0]} samples | Testing split: {X_test.shape[0]} samples")

    # 3. Construct and fit Preprocessor
    numeric_transformer = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    categorical_transformer = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features)
        ]
    )

    print("Fitting preprocessor on training data...")
    X_train_proc = preprocessor.fit_transform(X_train)
    X_test_proc = preprocessor.transform(X_test)

    # Extract transformed feature names
    cat_encoder = preprocessor.named_transformers_["cat"].named_steps["onehot"]
    cat_encoded_names = list(cat_encoder.get_feature_names_out(categorical_features))
    transformed_feature_names = numeric_features + cat_encoded_names

    # Save preprocessor artifact
    preprocessor_path = MODELS_DIR / "preprocessor.joblib"
    joblib.dump(preprocessor, preprocessor_path)
    print(f"Saved preprocessor to {preprocessor_path}")

    # 4. Instantiate the 4 ML Algorithms
    models_config = {
        "logistic_regression": {
            "name": "Logistic Regression",
            "model": LogisticRegression(
                max_iter=1000,
                C=1.0,
                solver="lbfgs",
                class_weight="balanced",
                random_state=42
            )
        },
        "decision_tree": {
            "name": "Decision Tree Classifier",
            "model": DecisionTreeClassifier(
                max_depth=6,
                min_samples_split=20,
                min_samples_leaf=10,
                class_weight="balanced",
                random_state=42
            )
        },
        "random_forest": {
            "name": "Random Forest Classifier",
            "model": RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                min_samples_split=15,
                min_samples_leaf=5,
                class_weight="balanced",
                random_state=42,
                n_jobs=-1
            )
        },
        "svm": {
            "name": "Support Vector Machine (SVM)",
            "model": SVC(
                kernel="rbf",
                C=1.0,
                probability=True,
                class_weight="balanced",
                random_state=42
            )
        }
    }

    metrics_results = []
    cv_kfold = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    for key, config in models_config.items():
        name = config["name"]
        clf = config["model"]
        print(f"\n--- Training {name} ({key}) ---")

        start_time = time.time()
        # 5-fold cross-validation on train split
        cv_scores_acc = cross_val_score(clf, X_train_proc, y_train, cv=cv_kfold, scoring="accuracy")
        cv_scores_f1 = cross_val_score(clf, X_train_proc, y_train, cv=cv_kfold, scoring="f1")

        # Fit model on entire train split
        clf.fit(X_train_proc, y_train)
        training_time = round(time.time() - start_time, 2)

        # Inferences on test split
        y_pred = clf.predict(X_test_proc)
        y_prob = clf.predict_proba(X_test_proc)[:, 1]

        # Calculate metrics
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        roc_auc = float(roc_auc_score(y_test, y_prob))

        # Confusion Matrix
        cm = confusion_matrix(y_test, y_pred)
        tn, fp, fn, tp = [int(v) for v in cm.ravel()]

        # ROC Curve (downsampled for fast frontend chart rendering)
        fpr_arr, tpr_arr, thresh_arr = roc_curve(y_test, y_prob)
        # Select ~40 evenly spaced points
        indices = np.linspace(0, len(fpr_arr) - 1, min(40, len(fpr_arr)), dtype=int)
        roc_points = [
            {"fpr": round(float(fpr_arr[i]), 4), "tpr": round(float(tpr_arr[i]), 4)}
            for i in indices
        ]
        # Ensure (0,0) and (1,1) are present
        if roc_points[0] != {"fpr": 0.0, "tpr": 0.0}:
            roc_points.insert(0, {"fpr": 0.0, "tpr": 0.0})
        if roc_points[-1]["fpr"] < 1.0 or roc_points[-1]["tpr"] < 1.0:
            roc_points.append({"fpr": 1.0, "tpr": 1.0})

        # Feature importance
        feature_importances = []
        if hasattr(clf, "feature_importances_"):
            importances = clf.feature_importances_
            sorted_idx = np.argsort(importances)[::-1]
            for idx in sorted_idx[:10]:
                feature_importances.append({
                    "feature": transformed_feature_names[idx],
                    "importance": round(float(importances[idx]), 4)
                })
        elif hasattr(clf, "coef_"):
            coefs = clf.coef_[0]
            sorted_idx = np.argsort(np.abs(coefs))[::-1]
            for idx in sorted_idx[:10]:
                feature_importances.append({
                    "feature": transformed_feature_names[idx],
                    "coefficient": round(float(coefs[idx]), 4),
                    "abs_impact": round(float(abs(coefs[idx])), 4)
                })

        # Save model artifact
        model_path = MODELS_DIR / f"{key}.joblib"
        joblib.dump(clf, model_path)
        print(f"Saved {name} model artifact to {model_path}")
        print(f"Results -> Accuracy: {acc:.4f} | F1: {f1:.4f} | Recall: {rec:.4f} | Precision: {prec:.4f} | ROC-AUC: {roc_auc:.4f}")

        metrics_results.append({
            "model_id": key,
            "display_name": name,
            "training_time_seconds": training_time,
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4),
            "cv_accuracy_mean": round(float(cv_scores_acc.mean()), 4),
            "cv_accuracy_std": round(float(cv_scores_acc.std()), 4),
            "cv_f1_mean": round(float(cv_scores_f1.mean()), 4),
            "cv_f1_std": round(float(cv_scores_f1.std()), 4),
            "confusion_matrix": {
                "true_negative": tn,
                "false_positive": fp,
                "false_negative": fn,
                "true_positive": tp
            },
            "roc_curve": roc_points,
            "top_features": feature_importances
        })

    # 5. Export comprehensive metrics JSON
    summary_payload = {
        "dataset_name": "student_placement_cleaned.csv",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_records": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "target_placed_rate": round(float(y.mean()), 4),
        "features_list": {
            "numeric": numeric_features,
            "categorical": categorical_features,
            "transformed_names": transformed_feature_names
        },
        "models": metrics_results
    }

    with open(METRICS_JSON, "w", encoding="utf-8") as f:
        json.dump(summary_payload, f, indent=2)

    print(f"\nAll 4 models successfully trained, evaluated, and saved to {MODELS_DIR}")
    print(f"Metrics JSON saved to {METRICS_JSON}")
    return summary_payload


if __name__ == "__main__":
    train_and_evaluate_all()

