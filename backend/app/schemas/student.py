"""
Pydantic Schemas for Student Profile and Simulator Requests
"""

from typing import Literal, Optional
from pydantic import BaseModel, Field


class StudentProfileRequest(BaseModel):
    age: int = Field(22, ge=18, le=35, description="Student age in years")
    gender: Literal["Male", "Female"] = Field("Male", description="Gender")
    stream: Literal[
        "Computer Science",
        "Information Technology",
        "Electronics And Communication",
        "Mechanical",
        "Electrical",
        "Civil"
    ] = Field("Computer Science", description="Engineering Stream / Major")
    internships: int = Field(1, ge=0, le=10, description="Number of internships completed")
    cgpa: float = Field(7.8, ge=4.0, le=10.0, description="Cumulative Grade Point Average (4.0 to 10.0)")
    hostel: int = Field(0, ge=0, le=1, description="1 if staying in hostel, 0 for day scholar")
    history_of_backlogs: int = Field(0, ge=0, le=1, description="1 if has history of backlogs, 0 if clean record")
    preferred_model: Literal[
        "random_forest",
        "decision_tree",
        "logistic_regression",
        "svm"
    ] = Field("random_forest", description="Primary model for prediction")


class WhatIfSimulationRequest(BaseModel):
    base_student: StudentProfileRequest
    simulated_cgpa: Optional[float] = Field(None, ge=4.0, le=10.0)
    simulated_internships: Optional[int] = Field(None, ge=0, le=10)
    simulated_backlogs: Optional[int] = Field(None, ge=0, le=1)

