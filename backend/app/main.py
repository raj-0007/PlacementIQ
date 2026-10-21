"""
PlacementIQ - Main FastAPI Application
"""

import sys
from pathlib import Path
from contextlib import asynccontextmanager

# Ensure backend root is on sys.path regardless of execution working directory
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import CORS_ORIGINS
from app.services.ml_service import ml_service
from app.services.analytics_service import analytics_service
from app.routers import predict, models, analytics


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure artifacts are loaded
    ml_service.load_artifacts()
    analytics_service.load_cache()
    yield


app = FastAPI(
    title="PlacementIQ API",
    description="Backend API and ML Inference Engine for Student Placement Analytics & Prediction Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(predict.router)
app.include_router(models.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {
        "project": "PlacementIQ",
        "description": "Student Placement Analytics and Multi-Model Prediction Platform",
        "version": "1.0.0",
        "docs_url": "/docs",
        "status": "online"
    }


@app.get("/api/health")
def health_check():
    loaded_models = list(ml_service.models.keys())
    return {
        "status": "healthy",
        "models_count": len(loaded_models),
        "models_loaded": loaded_models,
        "preprocessor_ready": ml_service.preprocessor is not None
    }
