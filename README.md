# Student Dropout Risk Prediction and Academic Intervention System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/Frontend-Next.js-black.svg)
![Node](https://img.shields.io/badge/Backend-Node.js-green.svg)
![Python](https://img.shields.io/badge/ML-FastAPI-blue.svg)

An advanced, full-stack application designed to predict student dropout risks using behavioral analytics and machine learning. The system not only predicts risk using a Random Forest model with Explainable AI (SHAP) but also features an automated AI Recommendation Engine that generates personalized academic intervention plans.

## 🌟 Key Features

*   **Role-Based Dashboards:** Secure interfaces for Students, Teachers, and Admins.
*   **Machine Learning Integration:** Uses behavioral metrics (attendance, grades, engagement, stress) to predict dropout risk.
*   **Explainable AI (XAI):** Transparent AI using SHAP values to explain *why* a student is at risk.
*   **AI Intervention Engine:** Automatically generates Daily, Weekly, and Monthly academic goals for at-risk students.
*   **Comprehensive Analytics:** Real-time data visualization of systemic risk, department performance, and intervention success.
*   **Notification Center:** Automated, real-time alerts for system events, messaging, and critical risk escalations.
*   **Secure Infrastructure:** Built with JWT authentication, role guards, input sanitization, and rate-limiting.

## 🏗️ Architecture

The system follows a microservices-inspired monolithic architecture:
1.  **Frontend:** Next.js, React, Tailwind CSS, Recharts.
2.  **Backend:** Node.js, Express.js, Mongoose.
3.  **ML Service:** Python, FastAPI, Scikit-Learn, SHAP.
4.  **Database:** MongoDB.

## 📂 Folder Structure

```
.
├── backend/          # Node.js REST API
├── frontend/         # Next.js React Application
├── ml-service/       # FastAPI Machine Learning Service
├── docs/             # Technical, User, and Research Documentation
├── scripts/          # Database backup, restore, and index scripts
├── docker-compose.yml# Container orchestration
└── README.md         # Project Overview
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Python 3.9+
- MongoDB 6.0+
- Docker & Docker Compose (Optional but recommended)

### Running Locally (Without Docker)

1.  **Database Setup:**
    Ensure MongoDB is running locally on port `27017`.
    Run the index script: `node scripts/setup_indexes.js`

2.  **ML Service Setup:**
    ```bash
    cd ml-service
    pip install -r requirements.txt
    uvicorn main:app --reload
    ```

3.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    npm start
    ```

4.  **Frontend Setup:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

### Running with Docker

Use the provided Docker Compose configuration for a seamless setup:
```bash
docker-compose up --build
```
*Frontend will be available at http://localhost:3000*
*Backend will be available at http://localhost:5000*
*ML Service will be available at http://localhost:8000*

## 📖 Documentation

Comprehensive documentation can be found in the `/docs` folder:
- **[User Manual](docs/User_Manual.md):** Guides for Students, Teachers, and Admins.
- **[Technical Documentation](docs/Technical_Documentation.md):** API Specs, Diagrams, and System Architecture.
- **[Research Documentation](docs/Research_Documentation.md):** ML Methodology, Algorithms, and Results.
- **Postman Collection:** `docs/postman_collection.json`

## 🔒 Security & Performance
- **Security:** Helmet, CORS, Rate Limiting, bcrypt, and extensive JWT validation.
- **Performance:** Asynchronous prediction flows, robust MongoDB indexing, caching considerations, and optimized API payloads.

## 📄 License
This project is licensed under the MIT License.
