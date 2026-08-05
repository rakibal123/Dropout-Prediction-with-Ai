# Technical Documentation

## 1. System Architecture
The application utilizes a distributed, multi-tier architecture to ensure scalability, security, and separation of concerns.

**Frontend:** Next.js (React) Application serving the presentation layer. Uses standard Tailwind CSS and Shadcn/ui components for styling, Recharts for data visualization, and Axios/Fetch for API communication.
**Backend API:** Node.js server powered by Express. Acts as the primary API Gateway and business logic executor. Connects to MongoDB via Mongoose.
**ML Service:** FastAPI Python server dedicated to executing Machine Learning inferences using Scikit-Learn. Decoupled from the main Node backend to isolate CPU-intensive operations.

## 2. API Overview (OpenAPI Mapping)
- **Authentication:** `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`
- **Prediction Core:** `/api/predict` (Trigger behavior assessment and ML model)
- **Prediction History:** `/api/predict/history`
- **Recommendations:** `/api/recommendations` (Intervention Plans CRUD)
- **Analytics:** `/api/analytics` (Dashboard metrics aggregation)
- **System Health:** `/api/admin/system-health` (Uptime and API latencies)
- **Messages & Notifications:** `/api/messages`, `/api/notifications`

## 3. Database Schema (MongoDB ER Mapping)
- **User:** Role-based (Admin, Teacher, Student), credentials, profile data.
- **BehaviorRecord:** Represents a single snapshot of a student's behavioral metrics (Attendance, Motivation, Quiz Scores, etc.).
- **PredictionHistory:** Stores the output of the FastAPI service, mapping a BehaviorRecord to a RiskLevel (Low, Medium, High) along with SHAP top factors.
- **Recommendation:** Generated post-prediction, mapping a PredictionHistory to actionable goals (Daily/Weekly/Monthly) and tracking intervention completion statuses.

## 4. Machine Learning Workflow
1. Client submits Behavior Assessment.
2. Node API stores `BehaviorRecord` and forwards features to FastAPI.
3. FastAPI loads the `RandomForestClassifier`.
4. Inference is executed (returning Probability).
5. Explainable AI (SHAP TreeExplainer) computes feature contribution for the specific instance.
6. FastAPI returns Prediction + XAI JSON to Node.
7. Node API stores `PredictionHistory`.
8. Node API asynchronously fires `RecommendationService` to generate an intervention plan.
9. Node returns success to Client under 300ms.

## 5. Deployment Strategy
- **Frontend:** Target deployment to Vercel for Edge Network caching and fast Next.js SSR/CSR rendering.
- **Backend Node API:** Deploy to Render or Railway via Docker containers or native Node environments.
- **FastAPI:** Deploy to Render (Python environment).
- **Database:** MongoDB Atlas (M0/M10 clusters).
