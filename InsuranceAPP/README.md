# 🛡️ Insurance API (Laravel Backend)

## 📌 Project Overview

This project is a **Personal Insurance Web Application API** built with Laravel.  
It provides endpoints for managing users, insurance products, quotes, and policies.

The API is designed to work with a React frontend and will later be deployed to a cloud platform.

\---

## 🏗️ Tech Stack

* Backend: Laravel 12 (REST API)
* Database: SQLite (Development) / Azure SQL (Production)
* Authentication: Laravel Sanctum (Token-based)
* Testing Tool: Postman

\---

## ⚙️ Installation \& Setup

### 1\. Clone the Repository

```bash
git clone <your-repo-url>
cd insurance-api
```

### 2\. Install Dependencies

```bash
composer install
```

### 3\. Environment Setup

```bash
cp .env.example .env
php artisan key:generate
```

### 4\. Configure Database (SQLite)

Update `.env`:

```env
DB\_CONNECTION=sqlite
DB\_DATABASE=database/database.sqlite
```

Then create the file:

```bash
touch database/database.sqlite
```

### 5\. Run Migrations

```bash
php artisan migrate
```

### 6\. Start Server

```bash
php artisan serve
```

API will run on:

```
http://127.0.0.1:8000
```

\---

## 🔐 Authentication

This API uses **token-based authentication**.

* Register/Login returns a token
* Send token in headers for protected routes

Example:

```
Authorization: Bearer YOUR\_TOKEN
```

\---

## 📡 API Endpoints

### 🔓 Public Routes

|Method|Endpoint|Description|
|-|-|-|
|POST|`/api/register`|Register a new user|
|POST|`/api/login`|Login user|
|GET|`/api/products`|Get all insurance products|

\---

### 🔒 Protected Routes

|Method|Endpoint|Description|
|-|-|-|
|POST|`/api/logout`|Logout user|
|GET|`/api/quotes`|Get user quotes|
|POST|`/api/quotes`|Create a quote|
|GET|`/api/policies`|Get user policies|
|POST|`/api/policies`|Create a policy|

\---

## 📊 Core Features

* User Authentication (Register/Login/Logout)
* Insurance Products Listing
* Quote Generation
* Policy Creation
* Secure API with Token Authentication

\---

## 🌐 CORS Configuration

CORS is enabled for development to allow frontend integration.

If issues occur:

```bash
php artisan config:clear
php artisan cache:clear
```

\---

## 👨‍💻 Frontend Integration Guide (React Developer)

### 📍 Base URL

```javascript
const API\_URL = "http://127.0.0.1:8000/api";
```

------------------------
## Frontend Setup
---------------------

cd frontend

npm install

copy .env.example .env

\# Edit .env with your values

npm run dev

\---





### 🔑 Authentication Flow

1. User registers or logs in
2. API returns a token
3. Store token in localStorage

```javascript
localStorage.setItem("token", data.token);
```

\---

### 📡 Making Authenticated Requests

```javascript
const token = localStorage.getItem("token");

fetch(`${API\_URL}/quotes`, {
    headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    },
})
    .then((res) => res.json())
    .then((data) => console.log(data));
```

\---

### 🧩 Suggested Pages (Frontend)

#### Public Pages

* Home Page
* Products Page
* Login Page
* Register Page

#### Authenticated Pages

* Dashboard
* Request Quote Page
* My Quotes Page
* My Policies Page
* Policy Details Page

\---

### 📌 Important Notes for Frontend

* Always include the token for protected routes
* Handle 401 Unauthorized errors (redirect to login)
* Use JSON for all requests
* Ensure correct API base URL

\---

## 🚀 Deployment Plan

### Current

* Local development with SQLite

### Future

* Backend: Azure App Service
* Database: Azure SQL



\---

## 👥 Team Responsibilities

* Backend Developer: API development, database, authentication
* Frontend Developer: UI/UX, API integration (React)
* Cloud Engineer: Deployment and cloud integration

\---

## 📞 Contact

For integration or support, contact the backend developer.

```

---

```

Configure Laravel to Accept Auth0 Tokens instead of SANCTUM
This allows you to use Auth0 for authentication while Laravel validates Auth0 JWTs.
  Install Auth0 and JWT packages
composer require auth0/login
composer require firebase/php-jwt

Run migration:
php artisan migrate

php artisan db:seed --class=ProductSeeder

Verification
After installation, verify everything is working:
Check Auth0 package is installed
composer show | findstr auth0

Check JWT package is installed
composer show | findstr jwt

Check routes
php artisan route:list


 

 


Laravel backend running on http://localhost:8000
React frontend running on http://localhost:5173


Make sure your Laravel config/cors.php has:
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:5173'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,





# Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Regenerate autoload
composer dump-autoload



Start Both Servers
Terminal 1 (Laravel Backend):
cd PATH/insurance-api
php artisan serve

Terminal 2 (React Frontend):
cd PATH/frontend
npm run dev


---------------------TEABLE SQL ----------------------------




users	CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `zip_code` varchar(255) DEFAULT NULL,
  `auth0_id` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_auth0_id_unique` (`auth0_id`)
)



CREATE TABLE `claims` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `policy_id` bigint(20) unsigned NOT NULL,
  `claim_number` varchar(255) NOT NULL,
  `incident_date` date NOT NULL,
  `description` text NOT NULL,
  `claim_amount` decimal(10,2) NOT NULL,
  `approved_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('Submitted','Under Review','Approved','Rejected','Paid') NOT NULL DEFAULT 'Submitted',
  `documents` text DEFAULT NULL,
  `resolution_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `claims_claim_number_unique` (`claim_number`),
  KEY `claims_user_id_foreign` (`user_id`),
  KEY `claims_policy_id_foreign` (`policy_id`),
  CONSTRAINT `claims_policy_id_foreign` FOREIGN KEY (`policy_id`) REFERENCES `policies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `claims_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) 



CREATE TABLE `insurance_products` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) 



CREATE TABLE `policies` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `quote_id` bigint(20) unsigned NOT NULL,
  `insurance_product_id` bigint(20) unsigned NOT NULL,
  `policy_number` varchar(255) NOT NULL,
  `premium_amount` decimal(10,2) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('Active','Expired','Cancelled') NOT NULL DEFAULT 'Active',
  `effective_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `policies_policy_number_unique` (`policy_number`),
  KEY `policies_user_id_foreign` (`user_id`),
  KEY `policies_quote_id_foreign` (`quote_id`),
  KEY `policies_insurance_product_id_foreign` (`insurance_product_id`),
  CONSTRAINT `policies_insurance_product_id_foreign` FOREIGN KEY (`insurance_product_id`) REFERENCES `insurance_products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `policies_quote_id_foreign` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `policies_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
)



CREATE TABLE `quotes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `quote_number` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `insurance_product_id` bigint(20) unsigned NOT NULL,
  `coverage_amount` decimal(10,2) DEFAULT NULL,
  `deductible` decimal(10,2) DEFAULT NULL,
  `additional_options` text DEFAULT NULL,
  `estimated_premium` decimal(10,2) NOT NULL,
  `calculated_price` decimal(10,2) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `quotes_quote_number_unique` (`quote_number`),
  KEY `quotes_user_id_foreign` (`user_id`),
  KEY `quotes_insurance_product_id_foreign` (`insurance_product_id`),
  CONSTRAINT `quotes_insurance_product_id_foreign` FOREIGN KEY (`insurance_product_id`) REFERENCES `insurance_products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `quotes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) 

 

