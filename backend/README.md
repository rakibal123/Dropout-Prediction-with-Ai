# Student Dropout Risk Prediction System - Backend Architecture

A clean, production-ready, modular Express.js & MongoDB backend foundation following strict MVC (Model-View-Controller) design principles.

---

## 📁 Project Architecture & Directory Structure

```text
backend/
├── .env                  # Environment Variables (Development)
├── .env.example          # Environment Variables Template
├── package.json          # Package Dependencies & Scripts
├── server.js             # Application Server Entry Point
├── README.md             # Architecture Documentation
└── src/
    ├── app.js            # Express App Setup & Global Middleware
    ├── config/
    │   └── database.js   # MongoDB Mongoose Connection Configuration
    ├── controllers/      # Future Route Controllers (Business Logic)
    ├── models/           # Future Mongoose Schemas & Data Models
    ├── routes/           # Express Routers & API Endpoint Definitions
    │   └── index.js      # Main API Router & Health Checks
    ├── middleware/       # Custom Express Middlewares
    │   ├── errorHandler.js # Global Centralized Error Handling
    │   └── notFound.js     # 404 Route Not Found Handler
    ├── services/         # Business Logic & Database Services Layer
    ├── validators/       # Request Data Validation Rules (express-validator)
    ├── utils/            # Shared Utilities (Logger, Error Classes, Responders)
    │   ├── apiResponse.js  # Standardized API Response Wrapper
    │   ├── appError.js     # Custom Operational Error Class
    │   ├── asyncHandler.js # Async Promise Wrapper for Controllers
    │   └── logger.js       # Application Log Manager
    ├── logs/             # Generated Server Logs (`app.log`, `error.log`)
    └── uploads/          # Static Media & File Upload Storage Directory
```

---

## 🛠️ Included Stack & Key Dependencies

| Technology | Purpose |
| :--- | :--- |
| **Node.js & Express.js** | Web Framework & HTTP Server |
| **MongoDB & Mongoose** | NoSQL Database ORM/ODM |
| **dotenv** | Environment Variable Management |
| **cors** | Cross-Origin Resource Sharing Security |
| **helmet** | HTTP Security Headers Protection |
| **morgan** | HTTP Request Logger |
| **cookie-parser** | Cookie Parsing with Signing Support |
| **express-validator** | Request Payload & Input Validation |
| **bcrypt** | Password Hashing & Hashing Encryption |
| **jsonwebtoken** | JWT Authentication Token Handling |
| **nodemon** | Hot-reloading Development Server |

---

## 🚀 Getting Started

### 1. Installation
Install the project dependencies:
```bash
npm install
```

### 2. Environment Configuration
Copy the `.env.example` file to `.env` and set your local environment variables:
```bash
cp .env.example .env
```

### 3. Running the Server

- **Development Mode** (with automatic hot reload via nodemon):
  ```bash
  npm run dev
  ```

- **Production Mode**:
  ```bash
  npm start
  ```

---

## 🔒 Security & Middleware Pipeline

1. **Helmet**: Protects HTTP headers against common vulnerability exploits.
2. **CORS**: Configured with strict origin checks (`CORS_ORIGIN`), credentials support, and specified HTTP methods.
3. **Morgan**: Configures dev/combined HTTP request log outputs.
4. **Cookie Parser**: Signs cookies with `COOKIE_SECRET`.
5. **JSON/UrlEncoded Parsers**: Pre-configured with a 10MB payload limit.
6. **Centralized Error Handling**: Captures Mongoose errors (ValidationError, CastError, 11000 duplicate keys), JWT errors, and unhandled operational errors without leaking stack traces in production.

---

## 📝 Guidelines for Adding Future Modules

To add a new feature (e.g., Auth, User, Risk Prediction):

1. **Model** (`src/models/User.js`): Define the Mongoose schema.
2. **Validator** (`src/validators/userValidator.js`): Define validation rules using `express-validator`.
3. **Service** (`src/services/userService.js`): Write business logic and DB calls.
4. **Controller** (`src/controllers/userController.js`): Handle HTTP request/response using `asyncHandler` and `ApiResponse`.
5. **Route** (`src/routes/userRoutes.js`): Bind validation middleware & controller actions, then mount in `src/routes/index.js`.
