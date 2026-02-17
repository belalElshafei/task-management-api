# Task Management API 🚀

A robust, production-ready RESTful API for managing projects and tasks, built with **Node.js**, **Express**, and **MongoDB**. Designed with scalability, security, and performance in mind.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-v14+-green.svg)
![MongoDB](https://img.shields.io/badge/mongodb-mongoose-green.svg)

## ✨ Key Features

- **🛡️ Advanced Security**: Implements `Helmet` for secure headers, `CORS` policies, and `Rate Limiting`.
- **🔐 Authentication**: Secure JWT-based authentication with role-based access control (RBAC).
- **⚡ Performance & Scalability**:
    - **Caching**: Integrated with **Redis** for optimized data retrieval.
    - **Database Indexes**: Optimized MongoDB queries using compound indexes.
- **🛠️ DevOps & Monitoring**:
    - **Dockerized**: Containerized with Docker and Docker Compose for easy deployment.
    - **Error Tracking**: Full integration with **Sentry** for real-time error monitoring.
    - **Logging**: Structured logging using **Winston** and request logging with **Morgan**.
- **📖 API Documentation**: Auto-generated interactive documentation using **Swagger UI**.

## 🛠️ Tech Stack

- **Runtime**: Node.js (v20 Alpine)
- **Framework**: Express.js (v5)
- **Database**: MongoDB (Mongoose ORM)
- **Caching**: Redis
- **Monitoring**: Sentry
- **Documentation**: Swagger UI
- **Security**: Helmet, CORS, Express Rate Limit, Bcrypt, JWT
- **DevOps**: Docker, Docker Compose, GitHub Actions (CI)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB
- Redis (Optional for local dev)
- Docker (Recommended)

### Installation & Setup

#### 🐳 Using Docker (Recommended)
The easiest way to get started is using Docker Compose:
```bash
docker-compose up --build
```
This will spin up the Node.js API, MongoDB, and Redis containers.

#### 💻 Local Development
1. **Clone the repository**
   ```bash
   git clone https://github.com/belalElshafei/task-management-api.git
   cd task-management-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/task-mgmt
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_jwt_secret
   SENTRY_DSN=your_sentry_dsn
   ```

4. **Run the Server**
   ```bash
   npm run dev
   ```

## 📖 API Documentation

Interactive API documentation is available at:
👉 **`http://localhost:5000/api-docs`**

The API follows OpenAPI 3.0.0 specifications and supports Bearer Token authentication.

## 📚 Core Endpoints

### System & Health
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Service discovery & system info |
| `GET` | `/health` | Liveness & Readiness probe |

### Projects
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/projects` | Get all projects |
| `POST` | `/api/projects` | Create a new project |
| `GET` | `/api/projects/:id` | Get single project |

### Tasks
*(Nested under projects)*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/projects/:projectId/tasks` | Get all tasks for a project |
| `POST` | `/api/projects/:projectId/tasks` | Create a task in a project |
| `GET` | `/api/projects/:projectId/tasks/stats` | **Get task statistics (Aggregation)** |

## 🧪 Code Structure

```
.
├── src/
│   ├── config/         # Database, Redis, Swagger configs
│   ├── controllers/    # Route logic
│   ├── middleware/     # Auth, Validation, Error Handling
│   ├── models/         # Mongoose Schemas & Indexes
│   ├── routes/         # API Routes
│   └── utils/          # Logger & Helpers
├── tests/              # Jest Integration Tests
├── Dockerfile          # Container config
└── docker-compose.yml  # Orchestration
```

---
*Developed by belalElshafei*
