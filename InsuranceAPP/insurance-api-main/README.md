# 🛡️ Insurance API (Laravel Backend)

## 📌 Project Overview

This project is a **Personal Insurance Web Application API** built with Laravel.  
It provides endpoints for managing users, insurance products, quotes, and policies.

The API is designed to work with a React frontend and will later be deployed to a cloud platform.

---

## 🏗️ Tech Stack

- Backend: Laravel 12 (REST API)
- Database: SQLite (Development) / Azure SQL (Production)
- Authentication: Laravel Sanctum (Token-based)
- Testing Tool: Postman

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd insurance-api
```

### 2. Install Dependencies

```bash
composer install
```

### 3. Environment Setup

```bash
cp .env.example .env
php artisan key:generate
```

### 4. Configure Database (SQLite)

Update `.env`:

```env
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

Then create the file:

```bash
touch database/database.sqlite
```

### 5. Run Migrations

```bash
php artisan migrate
```

### 6. Start Server

```bash
php artisan serve
```

API will run on:

```
http://127.0.0.1:8000
```

---

## 🔐 Authentication

This API uses **token-based authentication**.

- Register/Login returns a token
- Send token in headers for protected routes

Example:

```
Authorization: Bearer YOUR_TOKEN
```

---

## 📡 API Endpoints

### 🔓 Public Routes

| Method | Endpoint        | Description                |
| ------ | --------------- | -------------------------- |
| POST   | `/api/register` | Register a new user        |
| POST   | `/api/login`    | Login user                 |
| GET    | `/api/products` | Get all insurance products |

---

### 🔒 Protected Routes

| Method | Endpoint        | Description       |
| ------ | --------------- | ----------------- |
| POST   | `/api/logout`   | Logout user       |
| GET    | `/api/quotes`   | Get user quotes   |
| POST   | `/api/quotes`   | Create a quote    |
| GET    | `/api/policies` | Get user policies |
| POST   | `/api/policies` | Create a policy   |

---

## 📊 Core Features

- User Authentication (Register/Login/Logout)
- Insurance Products Listing
- Quote Generation
- Policy Creation
- Secure API with Token Authentication

---

## 🌐 CORS Configuration

CORS is enabled for development to allow frontend integration.

If issues occur:

```bash
php artisan config:clear
php artisan cache:clear
```

---

## 👨‍💻 Frontend Integration Guide (React Developer)

### 📍 Base URL

```javascript
const API_URL = "http://127.0.0.1:8000/api";
```

---

### 🔑 Authentication Flow

1. User registers or logs in
2. API returns a token
3. Store token in localStorage

```javascript
localStorage.setItem("token", data.token);
```

---

### 📡 Making Authenticated Requests

```javascript
const token = localStorage.getItem("token");

fetch(`${API_URL}/quotes`, {
    headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    },
})
    .then((res) => res.json())
    .then((data) => console.log(data));
```

---

### 🧩 Suggested Pages (Frontend)

#### Public Pages

- Home Page
- Products Page
- Login Page
- Register Page

#### Authenticated Pages

- Dashboard
- Request Quote Page
- My Quotes Page
- My Policies Page
- Policy Details Page

---

### 📌 Important Notes for Frontend

- Always include the token for protected routes
- Handle 401 Unauthorized errors (redirect to login)
- Use JSON for all requests
- Ensure correct API base URL

---

## 🚀 Deployment Plan

### Current

- Local development with SQLite

### Future

- Backend: Azure App Service
- Database: Azure SQL
- Authentication: Possible migration to Auth0

---

## 👥 Team Responsibilities

- Backend Developer: API development, database, authentication
- Frontend Developer: UI/UX, API integration (React)
- Cloud Engineer: Deployment and cloud integration

---

## 📞 Contact

For integration or support, contact the backend developer.

```

---

```
