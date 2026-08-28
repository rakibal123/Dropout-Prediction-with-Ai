from app.schemas.predict_schema import PredictionRequest

class ExplanationGenerator:
    """
    Recommendation Generator for the ML Prediction Pipeline.
    """
    
    @staticmethod
    def generate_recommendations(data: PredictionRequest, top_factors: list):
        recommendations = []
        
        # Rule-based recommendations linked to feature importance
        if data.attendancePercentage < 70:
            recommendations.append("Increase attendance to at least 85%.")
        elif data.attendancePercentage < 80:
            recommendations.append("Improve attendance consistency.")
            
        if data.assignmentSubmissionRate < 60:
            recommendations.append("Submit all pending assignments.")
        elif data.assignmentSubmissionRate < 80:
            recommendations.append("Ensure timely submission of upcoming assignments.")
            
        if data.studyHoursPerWeek < 12:
            recommendations.append("Study at least 15 hours per week.")
            
        if data.stressLevel > 8:
            recommendations.append("Schedule counseling or academic advising.")
            
        if data.motivationLevel < 5:
            recommendations.append("Meet with an academic mentor to discuss goals.")
            
        if data.quizAverage < 65:
            recommendations.append("Review previous quiz materials with a tutor.")
            

        # If everything is fine
        if not recommendations:
            recommendations.append("Maintain current study habits and engagement.")
            
        return recommendations[:4]
