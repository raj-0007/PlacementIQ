"""
PlacementIQ - Primary Model Training, Benchmarking, and Evaluation Pipeline
Dataset: college_placement.csv (2,966 records, CC0 Open Academic Benchmark)
Models:
  1. Logistic Regression
  2. Decision Tree Classifier
  3. Random Forest Classifier
  4. Support Vector Machine (SVC with RBF kernel and CalibratedClassifierCV)
"""

import json
from pathlib import Path
import time
import joblib
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.inspection import permutation_importance
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
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "saved_models"
CSV_PATH = DATA_DIR / "college_placement.csv"
METRICS_JSON = MODELS_DIR / "metrics_summary.json"
DATASET_SUMMARY_JSON = MODELS_DIR / "dataset_summary.json"

TARGET = "PlacedOrNot"


def train_placement_pipeline():
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Loading benchmark dataset from {CSV_PATH}...")
    df = pd.read_csv(CSV_PATH)
    print(f"Loaded {len(df):,} records with columns: {df.columns.tolist()}")

    # 1. Feature separation
    X = df.drop(columns=[TARGET])
    y = df[TARGET].astype(int)

    categorical_features = ["Gender", "Stream"]
    numeric_features = ["Age", "Internships", "CGPA", "Hostel", "HistoryOfBacklogs"]

    # 2. Compute EDA / Dataset Summary for Frontend Dashboard
    total_count = len(df)
    placed_count = int((y == 1).sum())
    not_placed_count = int((y == 0).sum())
    placement_rate = round((placed_count / total_count) * 100, 2)

    # Stream breakdown
    stream_groups = df.groupby("Stream")[TARGET].agg(["count", "sum"]).reset_index()
    stream_breakdown = []
    for _, row in stream_groups.iterrows():
        s_total = int(row["count"])
        s_placed = int(row["sum"])
        stream_breakdown.append({
            "stream": row["Stream"],
            "total": s_total,
            "placed": s_placed,
            "placement_rate": round((s_placed / s_total) * 100, 1)
        })

    # Internships breakdown
    intern_groups = df.groupby("Internships")[TARGET].agg(["count", "sum"]).reset_index()
    internships_breakdown = [
        {
            "internships": int(row["Internships"]),
            "total": int(row["count"]),
            "placed": int(row["sum"]),
            "placement_rate": round((row["sum"] / row["count"]) * 100, 1)
        }
        for _, row in intern_groups.iterrows()
    ]

    # CGPA bins
    df["cgpa_bin"] = pd.cut(
        df["CGPA"],
        bins=[4.9, 6.0, 7.0, 8.0, 9.0, 10.0],
        labels=["5.0 - 5.9", "6.0 - 6.9", "7.0 - 7.9", "8.0 - 8.9", "9.0 - 10.0"]
    )
    cgpa_groups = df.groupby("cgpa_bin", observed=True)[TARGET].agg(["count", "sum"]).reset_index()
    cgpa_distribution = [
        {
            "range": str(row["cgpa_bin"]),
            "total": int(row["count"]),
            "placed": int(row["sum"]),
            "not_placed": int(row["count"] - row["sum"]),
            "placement_rate": round((row["sum"] / row["count"]) * 100, 1) if row["count"] > 0 else 0
        }
        for _, row in cgpa_groups.iterrows()
    ]

    # Numeric feature statistics
    num_stats = []
    for col in numeric_features:
        num_stats.append({
            "feature": col,
            "mean": round(float(df[col].mean()), 2),
            "std": round(float(df[col].std()), 2),
            "min": round(float(df[col].min()), 2),
            "median": round(float(df[col].median()), 2),
            "max": round(float(df[col].max()), 2)
        })

    # Correlation with target
    correlations = {}
    for col in numeric_features:
        correlations[col] = round(float(df[col].corr(df[TARGET])), 3)

    dataset_summary = {
        "dataset_name": "college_placement.csv",
        "total_records": total_count,
        "placed_count": placed_count,
        "not_placed_count": not_placed_count,
        "placement_rate": placement_rate,
        "streams": sorted(df["Stream"].unique().tolist()),
        "genders": sorted(df["Gender"].unique().tolist()),
        "stream_breakdown": stream_breakdown,
        "internships_breakdown": internships_breakdown,
        "cgpa_distribution": cgpa_distribution,
        "numeric_stats": num_stats,
        "correlations": correlations
    }

    with open(DATASET_SUMMARY_JSON, "w", encoding="utf-8") as f:
        json.dump(dataset_summary, f, indent=2)
    print(f"Saved dataset summary to {DATASET_SUMMARY_JSON}")

    # Drop temporary column
    df = df.drop(columns=["cgpa_bin"])

    # 3. Stratified Train-Test Split (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Split completed: Train={len(X_train)} samples, Test={len(X_test)} samples")

    # 4. Construct and fit Preprocessor
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

    X_train_proc = preprocessor.fit_transform(X_train)
    X_test_proc = preprocessor.transform(X_test)

    # Transformed feature names
    cat_encoder = preprocessor.named_transformers_["cat"].named_steps["onehot"]
    cat_names = list(cat_encoder.get_feature_names_out(categorical_features))
    transformed_feature_names = numeric_features + cat_names

    preprocessor_path = MODELS_DIR / "preprocessor.joblib"
    joblib.dump(preprocessor, preprocessor_path)
    print(f"Saved preprocessor to {preprocessor_path}")

    # 5. Define the Exact 4 Algorithms
    models_dict = {
        "logistic_regression": {
            "name": "Logistic Regression",
            "model": LogisticRegression(max_iter=1000, random_state=42)
        },
        "decision_tree": {
            "name": "Decision Tree Classifier",
            "model": DecisionTreeClassifier(
                max_depth=5,
                min_samples_split=10,
                min_samples_leaf=5,
                random_state=42
            )
        },
        "random_forest": {
            "name": "Random Forest Classifier",
            "model": RandomForestClassifier(
                n_estimators=100,
                max_depth=6,
                min_samples_split=8,
                min_samples_leaf=4,
                random_state=42,
                n_jobs=-1
            )
        },
        "svm": {
            "name": "Support Vector Machine (SVM)",
            "model": CalibratedClassifierCV(
                estimator=SVC(kernel="rbf", C=1.0, random_state=42),
                cv=5
            )
        }
    }

    cv_kfold = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    models_benchmark = []

    for key, item in models_dict.items():
        name = item["name"]
        clf = item["model"]
        print(f"\nTraining and benchmarking: {name} ({key})...")
        t0 = time.time()

        # Cross-validation
        cv_acc = cross_val_score(clf, X_train_proc, y_train, cv=cv_kfold, scoring="accuracy")
        cv_f1 = cross_val_score(clf, X_train_proc, y_train, cv=cv_kfold, scoring="f1")

        # Fit on full train set
        clf.fit(X_train_proc, y_train)
        elapsed = round(time.time() - t0, 2)

        # Predictions on test set
        y_pred = clf.predict(X_test_proc)
        y_prob = clf.predict_proba(X_test_proc)[:, 1]

        # Calculate metrics
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        roc_auc = float(roc_auc_score(y_test, y_prob))

        # Confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        tn, fp, fn, tp = [int(x) for x in cm.ravel()]

        # ROC Curve coordinates
        fpr, tpr, _ = roc_curve(y_test, y_prob)
        indices = np.linspace(0, len(fpr) - 1, min(35, len(fpr)), dtype=int)
        roc_points = [
            {"fpr": round(float(fpr[i]), 4), "tpr": round(float(tpr[i]), 4)}
            for i in indices
        ]
        if roc_points[0] != {"fpr": 0.0, "tpr": 0.0}:
            roc_points.insert(0, {"fpr": 0.0, "tpr": 0.0})
        if roc_points[-1]["fpr"] < 1.0 or roc_points[-1]["tpr"] < 1.0:
            roc_points.append({"fpr": 1.0, "tpr": 1.0})

        # Feature importances
        feature_importances = []
        if hasattr(clf, "feature_importances_"):
            imps = clf.feature_importances_
            sorted_idx = np.argsort(imps)[::-1]
            for i in sorted_idx[:8]:
                feature_importances.append({
                    "feature": transformed_feature_names[i],
                    "importance": round(float(imps[i]), 4)
                })
        elif hasattr(clf, "coef_"):
            coefs = clf.coef_[0]
            sorted_idx = np.argsort(np.abs(coefs))[::-1]
            for i in sorted_idx[:8]:
                feature_importances.append({
                    "feature": transformed_feature_names[i],
                    "coefficient": round(float(coefs[i]), 4),
                    "abs_impact": round(float(abs(coefs[i])), 4)
                })
        else:
            # CalibratedClassifierCV wrapper: compute permutation importance on test set
            perm = permutation_importance(clf, X_test_proc, y_test, n_repeats=5, random_state=42)
            sorted_idx = np.argsort(perm.importances_mean)[::-1]
            for i in sorted_idx[:8]:
                feature_importances.append({
                    "feature": transformed_feature_names[i],
                    "importance": round(float(perm.importances_mean[i]), 4)
                })

        # Save model artifact
        model_save_path = MODELS_DIR / f"{key}.joblib"
        joblib.dump(clf, model_save_path)
        print(f"Saved artifact to {model_save_path}")
        print(f"Score Summary -> Accuracy: {acc:.4f} | F1: {f1:.4f} | Recall: {rec:.4f} | Precision: {prec:.4f} | ROC-AUC: {roc_auc:.4f}")

        models_benchmark.append({
            "model_id": key,
            "display_name": name,
            "training_time_seconds": elapsed,
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4),
            "cv_accuracy_mean": round(float(cv_acc.mean()), 4),
            "cv_accuracy_std": round(float(cv_acc.std()), 4),
            "cv_f1_mean": round(float(cv_f1.mean()), 4),
            "cv_f1_std": round(float(cv_f1.std()), 4),
            "confusion_matrix": {
                "true_negative": tn,
                "false_positive": fp,
                "false_negative": fn,
                "true_positive": tp
            },
            "roc_curve": roc_points,
            "top_features": feature_importances
        })

    # Save benchmark summary
    metrics_payload = {
        "dataset_name": "college_placement.csv",
        "total_records": total_count,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "target_placed_rate": round(float(y.mean()), 4),
        "models": models_benchmark,
        "features": {
            "numeric": numeric_features,
            "categorical": categorical_features,
            "transformed": transformed_feature_names
        }
    }

    with open(METRICS_JSON, "w", encoding="utf-8") as f:
        json.dump(metrics_payload, f, indent=2)
    print(f"\nAll 4 models successfully trained and serialized. Summary saved to {METRICS_JSON}")
    return metrics_payload


if __name__ == "__main__":
    train_placement_pipeline()

