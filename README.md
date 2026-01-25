# Task Management API 🚀

A robust, production-ready RESTful API for managing projects and tasks, built with **Node.js**, **Express**, and **MongoDB**. Designed with scalability, security, and performance in mind.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-v14+-green.svg)
![MongoDB](https://img.shields.io/badge/mongodb-mongoose-green.svg)

## ✨ Key Features

- **🛡️ Advanced Security**: Implements `Helmet` for secure headers, `CORS` policies, and `Rate Limiting` to prevent brute-force attacks.
- **🔐 Authentication**: Secure JWT-based authentication with role-based access control (RBAC).
- **⚡ High Performance**:
    - **Database Indexes**: Optimized MongoDB queries using compound indexes in Mongoose models.
    - **Aggregation Pipelines**: Efficient data analysis using native MongoDB aggregation frameworks (e.g., `$facet`).
- **📐 Clean Architecture**:
    - **Nested Routes**: RESTful relationship handling (e.g., `/projects/:projectId/tasks`).
    - **Validation Layer**: Robust input sanitization using `express-validator`.
    - **Error Handling**: Centralized, asynchronous error handling using Express 5 standards.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js (v5)
- **Database**: MongoDB (Mongoose ORM)
- **Validation**: express-validator
- **Security**: Helmet, CORS, Express Rate Limit, Bcrypt, JWT

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (Local or Atlas connection string)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/task-management-api.git
   cd task-management-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Run the Server**
   ```bash
   # Development mode
   npm run dev

   # Production start
   npm start
   ```

## 📚 API Endpoints

### Projects
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/projects` | Get all projects for logged-in user |
| `POST` | `/api/projects` | Create a new project |
| `GET` | `/api/projects/:id` | Get single project details |
| `PUT` | `/api/projects/:id` | Update a project |
| `DELETE` | `/api/projects/:id` | Delete a project |

### Tasks
*(Nested under projects)*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/projects/:projectId/tasks` | Get all tasks for a specific project |
| `POST` | `/api/projects/:projectId/tasks` | Create a task in a project |
| `GET` | `/api/projects/:projectId/tasks/stats` | **Get task statistics (Aggregation)** |
| `PUT` | `/api/projects/:projectId/tasks/:id` | Update a task |
| `DELETE` | `/api/projects/:projectId/tasks/:id` | Delete a task |

## 🧪 Code Structure

```
src/
├── config/         # Database configuration
├── controllers/    # Route logic (No try/catch boilerplate!)
├── middleware/     # Auth, Validation, Error Handling
├── models/         # Mongoose Schemas & Indexes
├── routes/         # API Routes & Nested Routing
└── utils/          # Helper functions
```

## 🔒 Security Measures

- **IDOR Protection**: All resource access is scoped to the authenticated user (`createdBy` or `assignedTo` checks).
- **Input Validation**: Strict validation middleware prevents malformed data injection.
- **Production Ready**: Configured for performance and security best practices.

---
*Created for Portfolio Showcase*
