# PlacementIQ 🎓📊

> **Intermediate-Level Student Placement Analytics & Predictive Intelligence Platform**  
> *Developed for College Mini-Project Evaluation (15 Marks)*  
> **Repository**: [https://github.com/raj-0007/PlacementIQ](https://github.com/raj-0007/PlacementIQ)

---

## 🌟 Overview

**PlacementIQ** is a full-stack student placement analytics and predictive modeling platform. It analyzes historical student trajectories, benchmarks **exactly four supervised machine learning algorithms**, outputs cross-model consensus verdicts, provides feature-attribution explainability, and offers a dynamic **What-If Sensitivity Simulator** for prospective students.

---

## 🤖 The Exact 4 Machine Learning Algorithms & Benchmark

Evaluated on an authentic **2,966-record** benchmark dataset under identical **80/20 stratified train/test partitions** and **5-fold cross-validation**:

| Algorithm | Test Accuracy | Precision | Recall | F1-Score | ROC-AUC | 5-Fold CV Accuracy | Key Characteristic |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Decision Tree Classifier** | **87.21%** | **95.65%** | 80.49% | **87.42%** | 0.9203 | 86.85% &plusmn; 0.92% | Highest individual accuracy & lowest false positives ($FP=12$) |
| **Random Forest Classifier** | **86.36%** | 91.03% | 83.54% | **87.12%** | 0.9213 | 86.42% &plusmn; 0.88% | Bagging ensemble of 100 decorrelated trees with optimal stability |
| **Support Vector Machine (SVM)** | **84.85%** | 87.66% | **84.45%** | 86.02% | **0.9256** | 84.95% &plusmn; 1.12% | RBF Kernel + Platt probability calibration; highest ROC-AUC |
| **Logistic Regression** | 78.11% | 78.78% | 82.62% | 80.65% | 0.8869 | 78.04% &plusmn; 1.05% | Parametric linear baseline mapping log-odds coefficients |

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide Icons.
* **Backend**: Python 3.12, FastAPI, Pydantic v2, Uvicorn.
* **Machine Learning**: scikit-learn, pandas, NumPy, joblib.
* **Testing**: pytest (10/10 automated tests passing).
* **Storage**: CSV datasets, serialized `.joblib` model artifacts, JSON metadata.
* **Version Control**: Git & GitHub (`raj-0007/PlacementIQ`).

---

## 🚀 Key Features

1. **Placement Analytics Dashboard**: Institutional metrics, engineering stream breakdown, CGPA outcome distribution, and internship multiplier curves.
2. **Student Likelihood Predictor**: Input student credentials to calculate placement probability, confidence category, and cross-model consensus across all 4 algorithms.
3. **Consensus & Explainability Engine**: Shows individual votes from each algorithm, profile strengths, warning flags, and customized recommendations.
4. **4-Model Benchmark & Visualizer**: Interactive leaderboard, multi-line ROC curve chart with random-chance diagonal, and dynamic 2&times;2 confusion matrix visualizer.
5. **What-If Sensitivity Simulator**: Drag sliders to see how adjusting CGPA (+0.5), completing internships (+1), or clearing backlogs shifts placement odds in real-time.
6. **Dataset & Preprocessing Explorer**: 50-row historical records browser with search and stream filtering, plus descriptive statistical tables.

---

## 📁 Project Structure

```
PlacementIQ/
├── backend/                       # Python FastAPI Backend & ML Core
│   ├── app/
│   │   ├── main.py                # FastAPI app initialization, CORS, health check
│   │   ├── config.py              # Application settings and filesystem paths
│   │   ├── schemas/               # Pydantic v2 request/response schemas
│   │   ├── routers/               # API endpoints (/predict, /simulate, /models, /analytics)
│   │   └── services/              # ML inference, explainability & EDA services
│   ├── ml/
│   │   ├── data/                  # Benchmark CSVs (college_placement.csv, etc.)
│   │   ├── scripts/               # train_placement_models.py & clean_data.py
│   │   └── saved_models/          # Serialized .joblib artifacts & metrics_summary.json
│   ├── tests/                     # Automated pytest suite (test_api.py, test_ml_pipeline.py)
│   └── requirements.txt           # Python backend dependencies
├── frontend/                      # React + Vite + TypeScript Application
│   ├── src/
│   │   ├── components/            # UI Views (Navbar, Overview, Predictor, Benchmark, Simulator, Explorer)
│   │   ├── services/api.ts        # Type-safe API client
│   │   ├── types/api.ts           # Shared TypeScript interfaces
│   │   ├── App.tsx                # Main view router & tab controller
│   │   └── main.tsx               # React entrypoint
│   └── package.json
├── docs/
│   └── PROJECT_REPORT.md          # 10-Page Comprehensive Academic Mini-Project Report
├── run_dev.ps1                    # One-click launcher for Windows PowerShell
├── run_dev.bat                    # One-click launcher for Windows Command Prompt
└── README.md                      # Project documentation
```

---

## ⚡ Quickstart & Running Locally

### Option A: One-Click Startup (Windows)
Double-click `run_dev.bat` or run in PowerShell:
```powershell
.\run_dev.ps1
```

### Option B: Manual Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate       # On Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
python ml/scripts/train_placement_models.py
uvicorn app.main:app --reload --port 8000
```
* Backend API will run at: `http://127.0.0.1:8000`
* Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

#### 2. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
* Frontend Web App will run at: `http://localhost:5173`

---

## 🧪 Running Automated Tests

Run the backend test suite:
```bash
.\backend\venv\Scripts\pytest backend/tests/
```
Output:
```text
======================== 10 passed in 4.80s ========================
```

---

## 📚 Academic 10-Page Project Report & Literature Review

The full academic report is located at [`docs/PROJECT_REPORT.md`](file:///c:/Users/rajka/OneDrive/Desktop/PlacementIQ/docs/PROJECT_REPORT.md). It features an in-depth literature review analyzing five verified, peer-reviewed IEEE papers (2022–2025):
1. **[ICSCDS 2025]** *Data-Driven Prediction of Campus Placement Success using Supervised Machine Learning Techniques*, IEEE.
2. **[ICCES 2023]** N. Divya, S. Namburu, R. Raja, *Student Placement Analysis Using Machine Learning*, IEEE (DOI: 10.1109/ICCES57224.2023.10192633).
3. **[ICECAA 2023]** *Placement Prediction System using Machine Learning*, IEEE.
4. **[ICAST 2023]** *Campus Placement using Machine Learning: An Extensive Review and Comparative Study*, IEEE.
5. **[ESCI 2022]** *Campus Placements Prediction & Analysis using Machine Learning*, IEEE.

---

## 📄 License
This project is developed for educational and academic evaluation purposes. Open Source under the MIT License.
