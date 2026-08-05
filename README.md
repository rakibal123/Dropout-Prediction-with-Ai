# Student Dropout Risk Prediction System

A web-based system that predicts which students are at risk of dropping out using their behavior data and machine learning.

---

## What does this system do?

- A **student** fills out a behavior form (attendance, study hours, stress level, etc.)
- The system runs a **machine learning model** and predicts if the student is at **Low**, **Medium**, or **High** dropout risk
- The system explains **why** the risk was predicted (Explainable AI)
- The system generates a **personalized action plan** for the student
- **Teachers** and **Admins** can monitor all students and take action

---

## Who can use it?

| Role | What they can do |
|---|---|
| **Student** | Take assessments, view predictions, get recommendations, track progress |
| **Teacher** | View student risks, send messages, add notes, monitor analytics |
| **Admin** | Manage all users, view system health, manage the full platform |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Machine Learning | Python, FastAPI, Random Forest, Scikit-Learn |
| Authentication | JWT (with Refresh Token Rotation) |

---

## Project Structure

```
/
├── frontend/       → Next.js web app (UI)
├── backend/        → Node.js API server
├── ml-service/     → Python ML prediction service (FastAPI)
├── docs/           → Project documentation
├── scripts/        → Utility scripts (database backup, etc.)
└── docker-compose.yml
```

---

## How to Run Locally

### Step 1 — ML Service
```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python training/preprocessing.py
python training/train_models.py
python main.py
```
Runs on: http://localhost:8000

### Step 2 — Backend
```bash
cd backend
npm install
npm run dev
```
Runs on: http://localhost:5000

### Step 3 — Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on: http://localhost:3000

---

## Run with Docker (Easier)

```bash
docker-compose up --build
```

That's it. All three services start automatically.

---

## Environment Variables

Copy the example files and fill in your values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Required for backend:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
```

---

## Running Tests

```bash
cd backend
npm test
```

All integration tests will run automatically using an in-memory database.

---

## Documentation

All docs are in the `/docs` folder:
- `User_Manual.md` — How to use the system
- `Technical_Documentation.md` — API and architecture details
- `Research_Documentation.md` — ML model and results
- `postman_collection.json` — API testing collection

---

## Developer

**Rakib Al Hassan**
Department of Computer Science
Academic Project — 2026
