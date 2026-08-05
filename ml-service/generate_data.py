import random
import csv
import os

# Define the columns
columns = [
    "attendancePercentage",
    "assignmentSubmissionRate",
    "quizAverage",
    "midtermMarks",
    "studyHoursPerWeek",
    "engagementScore",
    "loginFrequency",
    "participationScore",
    "stressLevel",
    "motivationLevel",
    "dropoutRisk"
]

def generate_record():
    # Randomly assign a risk class first to generate correlated data
    risk = random.choices(["Low", "Medium", "High"], weights=[0.5, 0.3, 0.2])[0]
    
    if risk == "Low":
        attendance = random.randint(85, 100)
        assignments = random.randint(80, 100)
        quiz = random.randint(75, 100)
        midterm = random.randint(75, 100)
        study_hours = random.randint(15, 30)
        engagement = random.randint(7, 10)
        login_freq = random.randint(5, 10)
        participation = random.randint(7, 10)
        stress = random.randint(1, 5)
        motivation = random.randint(7, 10)
    elif risk == "Medium":
        attendance = random.randint(65, 85)
        assignments = random.randint(60, 80)
        quiz = random.randint(55, 75)
        midterm = random.randint(55, 75)
        study_hours = random.randint(8, 15)
        engagement = random.randint(4, 7)
        login_freq = random.randint(3, 6)
        participation = random.randint(4, 7)
        stress = random.randint(4, 7)
        motivation = random.randint(4, 7)
    else: # High risk
        attendance = random.randint(30, 65)
        assignments = random.randint(20, 60)
        quiz = random.randint(20, 55)
        midterm = random.randint(20, 55)
        study_hours = random.randint(0, 8)
        engagement = random.randint(1, 4)
        login_freq = random.randint(1, 3)
        participation = random.randint(1, 4)
        stress = random.randint(6, 10)
        motivation = random.randint(1, 4)
        
    return [
        attendance,
        assignments,
        quiz,
        midterm,
        study_hours,
        engagement,
        login_freq,
        participation,
        stress,
        motivation,
        risk
    ]

# Generate 1000 records
records = [generate_record() for _ in range(1000)]

# Write to CSV
output_path = os.path.join(os.path.dirname(__file__), 'data', 'student_behavior.csv')
with open(output_path, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(columns)
    writer.writerows(records)

print(f"Generated 1000 records at {output_path}")
