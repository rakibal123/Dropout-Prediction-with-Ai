# 🎓 Student Dropout Risk Prediction System (AI-Powered)

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Defense](https://img.shields.io/badge/Academic-8th%20Semester%20CSE-orange)

An intelligent, full-stack, AI-powered platform designed to proactively identify and mitigate student dropout risks. Developed as a final-year project for the 8th Semester Defense (Department of Computer Science and Engineering).

This system bridges the gap between educational administration and student well-being by utilizing **Machine Learning** to predict potential dropouts based on behavioral, academic, and psychological metrics.

---

## 🚀 Key Features

*   **🧠 AI-Powered Risk Prediction:** Utilizes a Random Forest ML model (via FastAPI) to classify students into Low, Medium, or High dropout risk categories.
*   **🔍 Explainable AI (XAI):** Doesn't just predict, but *explains* why a student is at risk (e.g., low attendance, high stress).
*   **👥 Multi-Role Access Control:** 
    *   **Students:** Take assessments, view their personalized risk reports, and receive AI-generated action plans.
    *   **Teachers:** Monitor student analytics, identify at-risk individuals, and initiate communication.
    *   **Admins:** Oversee system health, manage users, and moderate the platform.
*   **💬 Real-Time Communication:** Built-in messaging interface for teachers and students to interact directly within the platform.
*   **📊 Comprehensive Dashboards:** Beautiful, interactive dashboards built with Next.js and Tailwind CSS for data visualization.
*   **🐳 Production-Ready:** Fully dockerized for seamless deployment and scalability.

---

## 🛠️ Technology Stack

**Frontend (Client-Side)**
*   **Framework:** Next.js (React)
*   **Styling:** Tailwind CSS
*   **State Management & Data Fetching:** React Hooks, Axios

**Backend (Server-Side)**
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Authentication:** JWT (JSON Web Tokens) with Refresh Token Rotation
*   **Real-time:** Socket.io (for messaging)

**Machine Learning (AI Service)**
*   **Framework:** FastAPI (Python)
*   **Libraries:** Scikit-Learn, Pandas, NumPy
*   **Model:** Random Forest Classifier

**Database & DevOps**
*   **Database:** MongoDB
*   **Containerization:** Docker & Docker Compose
*   **API Testing:** Postman

---

## 🏗️ System Architecture & Workflow

1.  **Data Collection:** Students submit self-assessment forms covering academic and behavioral metrics.
2.  **API Gateway:** The Node.js backend receives the data and securely forwards it to the Python ML microservice.
3.  **Prediction Engine:** The ML model analyzes the data, calculates the risk probability, and determines the contributing factors.
4.  **Actionable Insights:** The frontend dashboard visualizes the prediction and provides a personalized, AI-driven action plan for the student and alerts the assigned teacher.

---

## 🚦 Getting Started (Local Development)

### Prerequisites
*   Node.js (v18+)
*   Python (3.9+)
*   MongoDB (Local or Atlas)
*   Docker (Optional, but recommended)

### The Easy Way (Docker)

```bash
# Clone the repository
git clone git@github.com:rakibal123/Dropout-Prediction-with-Ai.git
cd Dropout-Prediction-with-Ai

# Start all microservices automatically
docker-compose up --build
```
*Frontend: http://localhost:3000 | Backend: http://localhost:5000 | ML Service: http://localhost:8000 | Mongo Express: http://localhost:8081*

### The Manual Way

**1. Machine Learning Service**
```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

**2. Backend (Node.js)**
```bash
cd backend
cp .env.example .env # Configure your MongoDB URI and JWT secrets
npm install
npm run dev
```

**3. Frontend (Next.js)**
```bash
cd frontend
cp .env.example .env # Point NEXT_PUBLIC_API_URL to the backend
npm install
npm run dev
```

---

## 📚 Documentation

Comprehensive documentation can be found in the `/docs` directory:
*   [User Manual](./docs/User_Manual.md)
*   [Technical Architecture](./docs/Technical_Documentation.md)
*   [ML Research & Methodology](./docs/Research_Documentation.md)

---

## 👨‍💻 Developer

**Rakib Al Hassan**  
*Department of Computer Science & Engineering (CSE)*  
*8th Semester Final Defense Project*  
GitHub: [@rakibal123](https://github.com/rakibal123)

---
*Built with ❤️ for educational advancement and student retention.*
