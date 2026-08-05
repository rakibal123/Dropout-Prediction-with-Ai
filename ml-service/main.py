import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.routes.predict import router as predict_router
from app.services.PredictionService import PredictionService

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    logger.info("Initializing ML Service...")
    success = PredictionService.load_artifacts(base_dir=BASE_DIR)
    if not success:
        logger.warning("Service started, but ML model failed to load. Predictions will not work.")
    yield
    # Shutdown logic
    logger.info("Shutting down ML Service...")

# Create FastAPI app
app = FastAPI(
    title="Student Dropout Risk Prediction API",
    description="Independent FastAPI service for machine learning inference.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Include routes
app.include_router(predict_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
