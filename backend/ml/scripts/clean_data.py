"""
PlacementIQ - Data Cleaning and EDA Audit Pipeline
Based on methodology established in notebooks/01_EDA_and_Data_Cleaning.ipynb
"""

import json
from pathlib import Path
import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_CSV = DATA_DIR / "student_placement_train.csv"
CLEANED_CSV = DATA_DIR / "student_placement_cleaned.csv"
AUDIT_JSON = DATA_DIR / "eda_audit_summary.json"
MISSING_CSV = DATA_DIR / "missing_value_summary.csv"
OUTLIER_CSV = DATA_DIR / "outlier_screening_summary.csv"

TARGET = "placed"
ID_COLUMNS = ["student_id"]


def run_data_cleaning():
    print(f"Loading raw dataset from {RAW_CSV}...")
    df_raw = pd.read_csv(RAW_CSV)
    df = df_raw.copy()

    rows_before = len(df)
    cols_count = df.shape[1]
    print(f"Raw shape: {rows_before:,} rows x {cols_count} columns")

    # 1. Missing summary
    missing_summary = pd.DataFrame({
        "missing_count": df.isna().sum(),
        "missing_percent": (df.isna().mean() * 100).round(2),
        "dtype": df.dtypes.astype(str)
    }).sort_values("missing_percent", ascending=False)

    # 2. Duplicate rows check and removal on cleaned copy
    df_clean = df.copy()
    df_clean = df_clean.drop_duplicates().copy()
    exact_duplicates_removed = rows_before - len(df_clean)

    # 3. Normalize string whitespace
    for col in df_clean.select_dtypes(include=["object", "string"]).columns:
        df_clean[col] = df_clean[col].map(lambda x: x.strip() if isinstance(x, str) else x)

    # 4. Target validation
    valid_targets = {0, 1}
    observed_targets = set(df_clean[TARGET].dropna().unique().tolist())
    invalid_targets = observed_targets - valid_targets
    if invalid_targets:
        raise ValueError(f"Invalid target values detected: {invalid_targets}")

    # 5. Outlier screening (IQR flags - documentation only)
    numeric_cols = df_clean.select_dtypes(include=np.number).columns.tolist()
    numeric_features = [c for c in numeric_cols if c != TARGET and c not in ID_COLUMNS]

    outlier_rows = []
    for col in numeric_features:
        series = df_clean[col].dropna()
        if series.nunique() < 5:
            continue
        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1
        if pd.isna(iqr) or iqr == 0:
            lower, upper = series.quantile(0.01), series.quantile(0.99)
        else:
            lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
        count = int(((series < lower) | (series > upper)).sum())
        outlier_rows.append({
            "column": col,
            "lower_screening_bound": round(float(lower), 2),
            "upper_screening_bound": round(float(upper), 2),
            "flagged_count": count,
            "flagged_percent": round(100 * count / len(series), 2)
        })
    outlier_summary = pd.DataFrame(outlier_rows).sort_values("flagged_count", ascending=False)

    # 6. Target class balance
    target_counts = df_clean[TARGET].value_counts().to_dict()

    # 7. Export files
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    df_clean.to_csv(CLEANED_CSV, index=False)
    missing_summary.to_csv(MISSING_CSV)
    outlier_summary.to_csv(OUTLIER_CSV, index=False)

    audit_summary = {
        "source_file": RAW_CSV.name,
        "original_rows": int(rows_before),
        "original_columns": int(cols_count),
        "cleaned_rows": int(len(df_clean)),
        "cleaned_columns": int(df_clean.shape[1]),
        "exact_duplicates_removed": int(exact_duplicates_removed),
        "target_column": TARGET,
        "target_distribution": {str(k): int(v) for k, v in target_counts.items()},
        "target_missing_count": int(df_clean[TARGET].isna().sum()),
        "target_values": [str(x) for x in sorted(observed_targets)],
        "features": {
            "numeric": numeric_features,
            "categorical": [c for c in df_clean.select_dtypes(exclude=np.number).columns if c not in ID_COLUMNS],
            "id": ID_COLUMNS
        },
        "pipeline_rules": [
            "Original CSV left untouched.",
            "Missing values preserved in cleaned CSV for leak-free pipeline imputation during cross-validation.",
            "student_id excluded from feature space.",
            "Stratified train/test splitting required due to target class distribution."
        ]
    }

    with open(AUDIT_JSON, "w", encoding="utf-8") as f:
        json.dump(audit_summary, f, indent=2)

    print(f"Data cleaning complete! Saved:\n- {CLEANED_CSV}\n- {AUDIT_JSON}\n- {MISSING_CSV}\n- {OUTLIER_CSV}")
    return audit_summary


if __name__ == "__main__":
    run_data_cleaning()

