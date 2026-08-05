from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict

class PredictionRequest(BaseModel):
    attendancePercentage: float = Field(..., ge=0, le=100, description="Attendance Percentage (0-100)")
    assignmentSubmissionRate: float = Field(..., ge=0, le=100, description="Assignment Submission Rate (0-100)")
    quizAverage: float = Field(..., ge=0, le=100, description="Quiz Average (0-100)")
    midtermMarks: float = Field(..., ge=0, le=100, description="Midterm Marks (0-100)")
    studyHoursPerWeek: float = Field(..., ge=0, le=168, description="Study Hours Per Week (0-168)")
    engagementScore: float = Field(..., ge=0, le=10, description="Class Engagement Score (0-10)")
    loginFrequency: float = Field(..., ge=0, description="Learning Platform Login Frequency")
    participationScore: float = Field(..., ge=0, le=10, description="Participation Score (0-10)")
    stressLevel: float = Field(..., ge=0, le=10, description="Stress Level (0-10)")
    motivationLevel: float = Field(..., ge=0, le=10, description="Motivation Level (0-10)")

class PredictionData(BaseModel):
    riskLevel: str
    finalScore: float
    confidence: float
    probability: Dict[str, float]

class TopFactor(BaseModel):
    feature: str
    impact: str
    value: float
    direction: str = ""
    contribution: float = 0.0

class ExplanationData(BaseModel):
    topFactors: list[TopFactor]

class ModelData(BaseModel):
    name: str
    version: str
    trainedAt: str

class MetadataData(BaseModel):
    predictionTimestamp: datetime
    processingTimeMs: int

class PredictionResponse(BaseModel):
    success: bool
    prediction: PredictionData
    explanation: ExplanationData
    recommendation: list[str]
    model: ModelData
    metadata: MetadataData
