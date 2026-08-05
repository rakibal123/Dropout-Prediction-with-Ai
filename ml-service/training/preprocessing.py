import os
import logging
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DataPreprocessor:
    """
    A reusable preprocessing pipeline for the Student Dropout Risk dataset.
    Handles data loading, cleaning, capping outliers, scaling, and splitting.
    """
    def __init__(self, data_path, output_dir, models_dir, reports_dir):
        self.data_path = data_path
        self.output_dir = output_dir
        self.models_dir = models_dir
        self.reports_dir = reports_dir
        
        self.df = None
        self.report_lines = []
        
        # Ensure directories exist
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(self.models_dir, exist_ok=True)
        os.makedirs(self.reports_dir, exist_ok=True)

    def load_data(self):
        """1. Load dataset using Pandas"""
        logger.info(f"Loading data from {self.data_path}...")
        self.df = pd.read_csv(self.data_path)
        self.report_lines.append(f"Initial Dataset Shape: {self.df.shape}")
        return self.df

    def inspect_data(self):
        """2. Check dataset information"""
        logger.info("Inspecting dataset...")
        self.report_lines.append("--- Dataset Information ---")
        self.report_lines.append(f"Shape: {self.df.shape}")
        self.report_lines.append(f"Columns: {list(self.df.columns)}")
        
        # Data types and missing values
        dtypes = self.df.dtypes
        missing = self.df.isnull().sum()
        for col in self.df.columns:
            self.report_lines.append(f"Column: {col} | Type: {dtypes[col]} | Missing: {missing[col]}")

    def handle_missing_values(self):
        """3. Handle missing values (median for numeric, mode for categorical)"""
        logger.info("Handling missing values...")
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns
        categorical_cols = self.df.select_dtypes(exclude=[np.number]).columns

        for col in numeric_cols:
            if self.df[col].isnull().sum() > 0:
                median_val = self.df[col].median()
                self.df[col].fillna(median_val, inplace=True)
                
        for col in categorical_cols:
            if self.df[col].isnull().sum() > 0:
                mode_val = self.df[col].mode()[0]
                self.df[col].fillna(mode_val, inplace=True)
                
        self.report_lines.append(f"Missing Values after imputation: {self.df.isnull().sum().sum()}")

    def remove_duplicates(self):
        """4. Remove duplicate rows"""
        logger.info("Removing duplicate rows...")
        initial_count = len(self.df)
        self.df.drop_duplicates(inplace=True)
        final_count = len(self.df)
        duplicates_removed = initial_count - final_count
        self.report_lines.append(f"Duplicate Rows removed: {duplicates_removed}")
        self.report_lines.append(f"Dataset Shape after deduplication: {self.df.shape}")

    def cap_outliers(self):
        """5. Detect outliers using IQR and cap extreme values"""
        logger.info("Capping outliers using IQR method...")
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns
        outliers_detected = 0
        
        for col in numeric_cols:
            Q1 = self.df[col].quantile(0.25)
            Q3 = self.df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            # Count outliers
            outliers_detected += len(self.df[(self.df[col] < lower_bound) | (self.df[col] > upper_bound)])
            
            # Cap extreme values
            self.df[col] = np.where(self.df[col] < lower_bound, lower_bound, self.df[col])
            self.df[col] = np.where(self.df[col] > upper_bound, upper_bound, self.df[col])
            
        self.report_lines.append(f"Total Outliers Capped (across all features): {outliers_detected}")

    def encode_labels(self):
        """6. Encode target labels (Low -> 0, Medium -> 1, High -> 2)"""
        logger.info("Encoding target labels...")
        label_mapping = {"Low": 0, "Medium": 1, "High": 2}
        
        if 'dropoutRisk' in self.df.columns:
            self.df['dropoutRisk'] = self.df['dropoutRisk'].map(label_mapping)
            class_dist = self.df['dropoutRisk'].value_counts().to_dict()
            self.report_lines.append(f"Class Distribution: {class_dist} (0: Low, 1: Medium, 2: High)")
        else:
            logger.warning("Target column 'dropoutRisk' not found for encoding.")

    def normalize_features(self):
        """7. Normalize feature values using StandardScaler and save scaler"""
        logger.info("Normalizing features...")
        target_col = 'dropoutRisk'
        
        features = self.df.drop(columns=[target_col]) if target_col in self.df.columns else self.df
        
        scaler = StandardScaler()
        scaled_features = scaler.fit_transform(features)
        
        # Save scaled features back to dataframe to keep column names
        self.df[features.columns] = scaled_features
        
        # Save scaler
        scaler_path = os.path.join(self.models_dir, 'scaler.pkl')
        joblib.dump(scaler, scaler_path)
        logger.info(f"Scaler saved to {scaler_path}")
        self.report_lines.append(f"Features normalized using StandardScaler. Scaler saved at {scaler_path}.")
        
        # Feature Statistics
        self.report_lines.append("--- Feature Statistics (After Scaling) ---")
        self.report_lines.append(self.df.describe().to_string())

    def split_and_save(self):
        """8 & 9. Split dataset (80/20, stratify) and save processed datasets"""
        logger.info("Splitting dataset...")
        target_col = 'dropoutRisk'
        
        if target_col not in self.df.columns:
            logger.error(f"Cannot split dataset, target '{target_col}' missing.")
            return

        X = self.df.drop(columns=[target_col])
        y = self.df[target_col]
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, random_state=42, stratify=y
        )
        
        # Save to processed/
        X_train.to_csv(os.path.join(self.output_dir, 'X_train.csv'), index=False)
        X_test.to_csv(os.path.join(self.output_dir, 'X_test.csv'), index=False)
        y_train.to_csv(os.path.join(self.output_dir, 'y_train.csv'), index=False)
        y_test.to_csv(os.path.join(self.output_dir, 'y_test.csv'), index=False)
        
        logger.info("Processed datasets saved.")
        self.report_lines.append(f"Split sizes: Train={X_train.shape[0]}, Test={X_test.shape[0]}")
        self.report_lines.append(f"Processed files saved in {self.output_dir}")

    def generate_report(self):
        """10. Generate and save preprocessing report"""
        logger.info("Generating preprocessing report...")
        report_path = os.path.join(self.reports_dir, 'preprocessing_report.txt')
        
        with open(report_path, 'w') as f:
            f.write("\n".join(self.report_lines))
            
        logger.info(f"Report saved to {report_path}")

    def run_pipeline(self):
        """Execute the full preprocessing pipeline"""
        self.load_data()
        self.inspect_data()
        self.handle_missing_values()
        self.remove_duplicates()
        self.cap_outliers()
        self.encode_labels()
        self.normalize_features()
        self.split_and_save()
        self.generate_report()
        logger.info("Preprocessing pipeline completed successfully.")


if __name__ == "__main__":
    # Define paths relative to the script location
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    DATA_FILE = os.path.join(BASE_DIR, 'data', 'student_behavior.csv')
    PROCESSED_DIR = os.path.join(BASE_DIR, 'processed')
    MODELS_DIR = os.path.join(BASE_DIR, 'saved_models')
    REPORTS_DIR = os.path.join(BASE_DIR, 'reports')
    
    preprocessor = DataPreprocessor(
        data_path=DATA_FILE,
        output_dir=PROCESSED_DIR,
        models_dir=MODELS_DIR,
        reports_dir=REPORTS_DIR
    )
    
    preprocessor.run_pipeline()
