import os
import json
import time
import logging
import pandas as pd
import numpy as np
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, 
    f1_score, confusion_matrix, classification_report
)
from sklearn.model_selection import cross_val_score

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ModelTrainer:
    def __init__(self, base_dir):
        self.base_dir = base_dir
        self.processed_dir = os.path.join(base_dir, 'processed')
        self.saved_models_dir = os.path.join(base_dir, 'saved_models')
        self.reports_dir = os.path.join(base_dir, 'reports')
        self.charts_dir = os.path.join(base_dir, 'charts')
        
        # Ensure output directories exist
        os.makedirs(self.saved_models_dir, exist_ok=True)
        os.makedirs(self.reports_dir, exist_ok=True)
        os.makedirs(self.charts_dir, exist_ok=True)
        
        self.models = {
            "Logistic Regression": LogisticRegression(random_state=42, max_iter=1000),
            "Decision Tree": DecisionTreeClassifier(random_state=42),
            "Random Forest": RandomForestClassifier(random_state=42),
            "SVM": SVC(random_state=42, probability=True)
        }
        
        self.results = []
        self.trained_models = {}
        self.best_model_name = None

    def load_data(self):
        logger.info("Loading processed datasets...")
        try:
            self.X_train = pd.read_csv(os.path.join(self.processed_dir, 'X_train.csv'))
            self.X_test = pd.read_csv(os.path.join(self.processed_dir, 'X_test.csv'))
            self.y_train = pd.read_csv(os.path.join(self.processed_dir, 'y_train.csv')).values.ravel()
            self.y_test = pd.read_csv(os.path.join(self.processed_dir, 'y_test.csv')).values.ravel()
            self.feature_names = self.X_train.columns.tolist()
            logger.info(f"Loaded successfully. Train shape: {self.X_train.shape}, Test shape: {self.X_test.shape}")
        except Exception as e:
            logger.error(f"Failed to load datasets: {e}")
            raise

    def train_and_evaluate(self):
        logger.info("Starting model training and evaluation pipeline...")
        report_text = "Classification Reports\n" + "="*40 + "\n\n"
        
        for name, model in self.models.items():
            logger.info(f"Training {name}...")
            
            # Training Time
            start_train = time.time()
            model.fit(self.X_train, self.y_train)
            train_time = time.time() - start_train
            
            # Prediction Time
            start_pred = time.time()
            y_pred = model.predict(self.X_test)
            pred_time = time.time() - start_pred
            
            # Metrics
            acc = accuracy_score(self.y_test, y_pred)
            prec = precision_score(self.y_test, y_pred, average='weighted', zero_division=0)
            rec = recall_score(self.y_test, y_pred, average='weighted', zero_division=0)
            f1 = f1_score(self.y_test, y_pred, average='weighted', zero_division=0)
            
            # Cross Validation
            logger.info(f"Performing 5-Fold Cross Validation for {name}...")
            cv_scores = cross_val_score(model, self.X_train, self.y_train, cv=5, scoring='accuracy')
            cv_mean = cv_scores.mean()
            cv_std = cv_scores.std()
            
            # Append Results
            self.results.append({
                "Model": name,
                "Accuracy": acc,
                "Precision": prec,
                "Recall": rec,
                "F1 Score": f1,
                "CV Mean Accuracy": cv_mean,
                "CV Std Dev": cv_std,
                "Training Time (s)": train_time,
                "Prediction Time (s)": pred_time
            })
            self.trained_models[name] = model
            
            # Append to Classification Report
            report_text += f"Model: {name}\n{'-'*30}\n"
            report_text += classification_report(self.y_test, y_pred, zero_division=0) + "\n\n"
            
            # Save individual model
            model_filename = name.lower().replace(" ", "_") + ".pkl"
            joblib.dump(model, os.path.join(self.saved_models_dir, model_filename))
            logger.info(f"Saved {model_filename}")

        # Save Text Report
        with open(os.path.join(self.reports_dir, 'classification_report.txt'), 'w') as f:
            f.write(report_text)
            
        # Convert results to DataFrame and save
        self.results_df = pd.DataFrame(self.results)
        self.results_df.to_csv(os.path.join(self.reports_dir, 'model_comparison.csv'), index=False)
        logger.info("Evaluation complete. Comparison saved to model_comparison.csv")

    def determine_best_model(self):
        logger.info("Determining the best model...")
        
        # Sort priority: Highest F1 -> Highest Accuracy -> Lowest Prediction Time
        sorted_results = self.results_df.sort_values(
            by=["F1 Score", "Accuracy", "Prediction Time (s)"], 
            ascending=[False, False, True]
        )
        
        best_row = sorted_results.iloc[0]
        self.best_model_name = best_row["Model"]
        best_model = self.trained_models[self.best_model_name]
        
        logger.info(f"Best Model Selected: {self.best_model_name}")
        
        # Save Best Model
        joblib.dump(best_model, os.path.join(self.saved_models_dir, 'best_model.pkl'))
        
        # Save Model Metadata
        model_info = {
            "bestModel": self.best_model_name,
            "accuracy": round(best_row["Accuracy"] * 100, 2),
            "precision": round(best_row["Precision"] * 100, 2),
            "recall": round(best_row["Recall"] * 100, 2),
            "f1Score": round(best_row["F1 Score"] * 100, 2),
            "cvAccuracy": round(best_row["CV Mean Accuracy"] * 100, 2),
            "trainedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "version": "1.0"
        }
        
        with open(os.path.join(self.saved_models_dir, 'model_info.json'), 'w') as f:
            json.dump(model_info, f, indent=4)
        logger.info("Saved best_model.pkl and model_info.json")

    def generate_charts(self):
        logger.info("Generating comparison charts...")
        metrics = [
            ("Accuracy", "accuracy_comparison.png"),
            ("Precision", "precision_comparison.png"),
            ("Recall", "recall_comparison.png"),
            ("F1 Score", "f1_comparison.png"),
            ("Training Time (s)", "training_time.png")
        ]
        
        sns.set_theme(style="whitegrid")
        
        for metric, filename in metrics:
            plt.figure(figsize=(10, 6))
            sns.barplot(x="Model", y=metric, data=self.results_df, palette="viridis")
            plt.title(f"Model Comparison: {metric}")
            plt.ylim(0, 1.1) if metric != "Training Time (s)" else None
            plt.tight_layout()
            plt.savefig(os.path.join(self.charts_dir, filename))
            plt.close()

        # Confusion Matrix for Best Model (Requested for Random Forest, but we'll do the best model which is likely RF)
        logger.info("Generating Confusion Matrix for best model...")
        best_model = self.trained_models[self.best_model_name]
        y_pred_best = best_model.predict(self.X_test)
        cm = confusion_matrix(self.y_test, y_pred_best)
        
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=["Low", "Medium", "High"], yticklabels=["Low", "Medium", "High"])
        plt.title(f"Confusion Matrix: {self.best_model_name}")
        plt.ylabel("True Label")
        plt.xlabel("Predicted Label")
        plt.tight_layout()
        plt.savefig(os.path.join(self.charts_dir, f"confusion_matrix_{self.best_model_name.lower().replace(' ', '_')}.png"))
        plt.close()

        # Feature Importance
        if hasattr(best_model, "feature_importances_"):
            logger.info("Generating Feature Importance chart...")
            importances = best_model.feature_importances_
            indices = np.argsort(importances)[::-1]
            
            plt.figure(figsize=(12, 6))
            sns.barplot(
                x=importances[indices], 
                y=np.array(self.feature_names)[indices], 
                palette="mako"
            )
            plt.title(f"Feature Importance ({self.best_model_name})")
            plt.xlabel("Importance Score")
            plt.ylabel("Features")
            plt.tight_layout()
            plt.savefig(os.path.join(self.charts_dir, 'feature_importance.png'))
            plt.close()
        else:
            logger.info(f"{self.best_model_name} does not support feature importances.")
            
        logger.info("All charts generated and saved successfully.")

    def run(self):
        self.load_data()
        self.train_and_evaluate()
        self.determine_best_model()
        self.generate_charts()
        logger.info("Pipeline Execution Completed.")


if __name__ == "__main__":
    # Base directory refers to the 'ml-service' folder
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    trainer = ModelTrainer(base_dir=BASE_DIR)
    
    # Check if data exists before running
    if os.path.exists(os.path.join(BASE_DIR, 'processed', 'X_train.csv')):
        trainer.run()
    else:
        logger.error("Processed data not found. Please run preprocessing.py first.")
