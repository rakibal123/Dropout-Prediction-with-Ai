# Student Dropout Risk Prediction ML Service

This is an independent Python Machine Learning service built with FastAPI. It handles model loading and provides a REST API for predicting student dropout risk based on behavioral metrics.

## Project Structure

- `app/`
  - `routes/`: FastAPI endpoint definitions (`predict.py`).
  - `schemas/`: Pydantic models for request validation (`predict_schema.py`).
  - `services/`: Core logic for loading artifacts and running inference (`PredictionService.py`).
- `data/`: Datasets for training and testing.
- `training/`: Data preprocessing and model training pipelines.
- `saved_models/`: Serialized models, scalers, and JSON metadata.
- `main.py`: Entry point for the FastAPI application.
- `requirements.txt`: Python package dependencies.

## How to Install

1. Ensure Python 3.11+ is installed.
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## How to Run

1. Make sure you have run the training pipeline first so that `best_model.pkl`, `scaler.pkl`, and `model_info.json` exist in the `saved_models/` directory.
2. Start the FastAPI server using Uvicorn:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
3. The API will be available at `http://localhost:8000`.
4. Interactive Swagger UI Docs are available at `http://localhost:8000/docs`.
5. ReDoc API documentation is available at `http://localhost:8000/redoc`.

## API Endpoints

### 1. Health Check
`GET /health`
Returns the status of the service and confirms if the ML artifacts have been loaded into memory.

### 2. Predict Dropout Risk
`POST /predict`

#### Example Request
```json
{
    "attendancePercentage": 85,
    "assignmentSubmissionRate": 90,
    "quizAverage": 78,
    "midtermMarks": 82,
    "studyHoursPerWeek": 18,
    "engagementScore": 8,
    "loginFrequency": 75,
    "participationScore": 7,
    "stressLevel": 3,
    "motivationLevel": 8
}
```

#### Example Response
```json
{
    "success": true,
    "riskLevel": "Low",
    "confidence": 94.62,
    "probability": {
        "low": 94.62,
        "medium": 4.10,
        "high": 1.28
    },
    "model": "Random Forest",
    "modelVersion": "1.0",
    "predictionTimestamp": "2026-08-05T12:00:00Z"
}
```

## Error Handling
- **422 Validation Error**: Thrown automatically by Pydantic if incoming data violates configured ranges (e.g., negative attendance or score > 10).
- **404 Model Not Found**: Thrown if the `/predict` endpoint is hit but `saved_models/` is empty or failed to load on startup.
- **500 Internal Error**: Thrown if pandas, scikit-learn, or joblib encounter a fatal execution error during inference.
