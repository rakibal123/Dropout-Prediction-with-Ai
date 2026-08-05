from fastapi import APIRouter
from app.schemas.predict_schema import PredictionRequest, PredictionResponse
from app.services.PredictionService import PredictionService

router = APIRouter()

@router.get("/")
def get_root():
    return {
        "service": "Student Dropout Prediction API",
        "status": "Running",
        "version": "1.0"
    }

@router.get("/health")
def get_health():
    return PredictionService.get_health()

@router.post("/predict", response_model=PredictionResponse)
def predict_risk(request: PredictionRequest):
    # Validation is handled automatically by Pydantic (PredictionRequest).
    # If the request is invalid, FastAPI automatically returns 400 Validation Error.
    return PredictionService.predict(request)
