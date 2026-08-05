import os
import json
import logging
import time
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timezone
from fastapi import HTTPException
from app.schemas.predict_schema import PredictionRequest, PredictionResponse
from app.services.ExplanationGenerator import ExplanationGenerator

logger = logging.getLogger(__name__)

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
    logger.warning("SHAP not available. Falling back to feature importances.")

class PredictionService:
    model = None
    scaler = None
    model_info = None
    explainer = None

    @classmethod
    def load_artifacts(cls, base_dir: str):
        if cls.model is not None:
            return

        saved_models_dir = os.path.join(base_dir, 'saved_models')
        model_path = os.path.join(saved_models_dir, 'best_model.pkl')
        scaler_path = os.path.join(saved_models_dir, 'scaler.pkl')
        info_path = os.path.join(saved_models_dir, 'model_info.json')

        if not (os.path.exists(model_path) and os.path.exists(scaler_path) and os.path.exists(info_path)):
            logger.error("ML artifacts not found.")
            return False

        try:
            cls.model = joblib.load(model_path)
            cls.scaler = joblib.load(scaler_path)
            with open(info_path, 'r') as f:
                cls.model_info = json.load(f)
            
            if SHAP_AVAILABLE:
                logger.info("Initializing SHAP Explainer...")
                cls.explainer = shap.TreeExplainer(cls.model)
                
            return True
        except Exception as e:
            logger.error(f"Failed to load ML artifacts: {e}")
            return False

    @classmethod
    def is_loaded(cls):
        return cls.model is not None and cls.scaler is not None

    @classmethod
    def predict(cls, data: PredictionRequest) -> PredictionResponse:
        start_time = time.time()
        
        if not cls.is_loaded():
            raise HTTPException(status_code=404, detail="Model Not Found.")
            
        try:
            input_dict = data.model_dump()
            df = pd.DataFrame([input_dict])
            feature_names = df.columns.tolist()
            
            scaled_features = cls.scaler.transform(df)
            prediction = cls.model.predict(scaled_features)[0]
            probabilities = cls.model.predict_proba(scaled_features)[0]
            
            class_mapping = {0: "Low", 1: "Medium", 2: "High"}
            risk_level = class_mapping.get(int(prediction), "Unknown")
            
            low_prob = round(probabilities[0] * 100, 2)
            medium_prob = round(probabilities[1] * 100, 2) if len(probabilities) > 1 else 0.0
            high_prob = round(probabilities[2] * 100, 2) if len(probabilities) > 2 else 0.0
            
            confidence = max(low_prob, medium_prob, high_prob)
            
            # XAI: Calculate Feature Contributions
            top_factors = []
            if SHAP_AVAILABLE and cls.explainer is not None:
                shap_values = cls.explainer.shap_values(scaled_features)
                # For classification, shap_values is a list of arrays (one for each class)
                # We care about the predicted class's shap values
                class_index = int(prediction)
                sv = shap_values[class_index][0] if isinstance(shap_values, list) else shap_values[0]
                
                contributions = []
                for i, name in enumerate(feature_names):
                    contributions.append({
                        "feature": name,
                        "value": df.iloc[0, i],
                        "contribution": float(sv[i])
                    })
            else:
                # Fallback to global feature importance proportional to scaled feature deviation
                importances = cls.model.feature_importances_
                
                contributions = []
                for i, name in enumerate(feature_names):
                    # Pseudo-contribution based on importance and feature value
                    val = scaled_features[0][i]
                    contrib = float(importances[i] * val * 10) # arbitrary scaling for visual impact
                    contributions.append({
                        "feature": name,
                        "value": df.iloc[0, i],
                        "contribution": contrib
                    })
                    
            # Sort contributions by absolute magnitude
            contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)
            
            # Format top factors
            for c in contributions[:5]: # Top 5 factors
                impact = "Very High" if abs(c["contribution"]) > 5 else "High" if abs(c["contribution"]) > 2 else "Medium"
                direction = "Positive" if c["contribution"] > 0 else "Negative"
                
                # Make names readable (camelCase to Title Case)
                import re
                readable_name = re.sub("([a-z])([A-Z])","\g<1> \g<2>", c["feature"]).title()
                
                top_factors.append({
                    "feature": readable_name,
                    "impact": impact,
                    "direction": direction,
                    "contribution": round(abs(c["contribution"]) * 10, 1), # Normalize for UI percentage
                    "rawValue": c["value"]
                })

            # Recommendations
            recommendations = ExplanationGenerator.generate_recommendations(data, top_factors)
            
            if risk_level == "Low":
                final_score = confidence
            elif risk_level == "High":
                final_score = 100.0 - confidence
            else:
                final_score = 50.0 + (confidence / 2) if low_prob > high_prob else 50.0 - (confidence / 2)
            final_score = round(final_score, 2)
            
            exec_time = time.time() - start_time
            
            # Update schema response dynamically
            response_data = {
                "success": True,
                "prediction": {
                    "riskLevel": risk_level,
                    "finalScore": final_score,
                    "confidence": confidence,
                    "probability": {
                        "low": low_prob,
                        "medium": medium_prob,
                        "high": high_prob
                    }
                },
                "explanation": {
                    "topFactors": top_factors
                },
                "recommendation": recommendations,
                "model": {
                    "name": cls.model_info.get("bestModel", "Unknown"),
                    "version": cls.model_info.get("version", "1.0"),
                    "trainedAt": cls.model_info.get("trainedAt", "Unknown").split("T")[0]
                },
                "metadata": {
                    "predictionTimestamp": datetime.now(timezone.utc).isoformat(),
                    "processingTimeMs": int(exec_time * 1000)
                }
            }
            
            logger.info(f"Prediction Success: {risk_level} Risk | Exec Time: {exec_time:.4f}s")
            
            # Return raw dict because Pydantic schema might not accept extra fields unless changed
            # Actually, Pydantic will ignore extra or fail depending on config. Let's just return it as dict if needed,
            # or update PredictionResponse schema. We'll update the schema in another step.
            return PredictionResponse(**response_data)
            
        except Exception as e:
            logger.error(f"Prediction Failed: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Prediction Failed.")
