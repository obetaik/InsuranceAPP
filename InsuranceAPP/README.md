🚀 Complete Deployment Guide: Insurance API Platform with JWT Authentication
📋 Project Overview
Deploy a full-stack Insurance API platform with Laravel backend (JWT authentication via Auth0) on Azure VM and React frontend, using Azure SQL Database for data persistence.
________________________________________
📁 Project Structure
text
InsuranceAPP/
├── insurance-api-main/ (Laravel Backend)
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/
│   ├── routes/
│   ├── storage/
│   └── vendor/
├── frontend/ (React Frontend)
│   ├── src/
│   ├── public/
│   └── package.json
└── infrastructure/
    ├── main.bicep
    └── modules/
        ├── sql.bicep
        └── storage.bicep
________________________________________
Phase 1: Azure Infrastructure Setup
1.1 Prerequisites
powershell
# Install Azure CLI
# Download from: https://aka.ms/installazurecliwindows

# Login to Azure
az login

# Verify subscription
az account show
1.2 Create Infrastructure Files
File: infrastructure/main.bicep
File: infrastructure/modules/sql.bicep
File: infrastructure/modules/storage.bicep
 
1.3 Deploy Infrastructure
powershell
# Create resource group
az group create --name insureapi-rg --location canadacentral

# Navigate to infrastructure folder
cd infrastructure

# Deploy Bicep template
az deployment group create --resource-group insureapi-rg --template-file main.bicep --parameters adminUsername=azureuser --parameters adminPassword='P!ssw0rd!123' --parameters sqlAdminPassword='P!ssw0rd!123'

# Verify deployment
az deployment group show --resource-group insureapi-rg --name main

# Get VM IP address
$VM_IP=$(az vm show -d -g insureapi-rg -n insureapi-vm --query publicIps -o tsv)
echo "VM IP: $VM_IP"

# Get SQL Server FQDN
$SQL_FQDN=$(az deployment group show --resource-group insureapi-rg --name main --query properties.outputs.sqlServerFqdn.value -o tsv)
echo "SQL Server: $SQL_FQDN"

insureapi-sqlserver.database.windows.net

$myIp = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing).Content
Write-Host "Your IP address: $myIp"

# Add firewall rule for your IP
az sql server firewall-rule create --resource-group insureapi-rg --server insureapi-sqlserver --name "AllowLocalDev" --start-ip-address $myIp --end-ip-address $myIp
1.4 Add VM IP to SQL Server Firewall
powershell
# Add firewall rule for VM
az sql server firewall-rule create --resource-group insureapi-rg --server insureapi-sqlserver --name AllowVM --start-ip-address $VM_IP --end-ip-address $VM_IP
________________________________________
Phase 2: VM Setup for Laravel Backend
2.1 Create VM Setup Script
File: vm-setup.sh
 

2.2 Run VM Setup
powershell
# Copy setup script to VM USE THE REAL IP instead ${VM_IP}
scp vm-setup.sh azureuser@${VM_IP}:/home/azureuser/

SSH first, 
powershell
# First, SSH into the VM
ssh azureuser@${VM_IP}

# Remove Windows line endings if present
dos2unix vm-setup.sh 2>/dev/null || sed -i 's/\r$//' vm-setup.sh

# Once inside the VM, run these commands:
cd /home/azureuser
chmod +x vm-setup.sh
sudo ./vm-setup.sh

WHEN UBUNTU DIALOGUE COMES UP, PRESS ENTER THEN CANCEL EACH TIME TO PROCEED

Cd /var/www/html/insurance-api
chmod +x /var/www/html/insurance-api/* IF ERROR, RUN sudo chmod +x -R /var/www/html/insurance-api/
sudo chown -R $USER:$USER /var/www/html/insurance-api

ls -lart /var/www/html/insurance-api
total 8
drwxr-xr-x 3 root      root      4096 Apr  4 19:03 ..
drwxr-xr-x 2 azureuser azureuser 4096 Apr  4 19:03 .

Ensure owner of the directory above in RED is azureuser to be able to copy files into it

COPY BELOW IN YELLOW AND RUN SHELL OF VM 

#!/bin/bash
echo "Installing SQL Server drivers for PHP 8.3..."

# Install prerequisites
sudo apt update
sudo apt install -y curl gnupg unixodbc-dev php-pear php8.3-dev

# Install Microsoft ODBC Driver
curl -sSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor | sudo tee /usr/share/keyrings/microsoft-prod.gpg > /dev/null
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft-prod.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" | sudo tee /etc/apt/sources.list.d/mssql-release.list
sudo apt update
sudo ACCEPT_EULA=Y apt-get install -y msodbcsql18

# Install PHP extensions
sudo pecl install sqlsrv
sudo pecl install pdo_sqlsrv

# Enable extensions
echo "extension=sqlsrv.so" | sudo tee /etc/php/8.3/mods-available/sqlsrv.ini
echo "extension=pdo_sqlsrv.so" | sudo tee /etc/php/8.3/mods-available/pdo_sqlsrv.ini
sudo phpenmod sqlsrv pdo_sqlsrv

# Restart PHP
sudo systemctl restart php8.3-fpm

# Verify
echo "========================================="
echo "Verifying installation..."
echo "========================================="
php -m | grep sqlsrv
php -m | grep pdo_sqlsrv

echo "========================================="
echo "Installation complete!"
echo "========================================="


FOR POPUP, CLICK OK, TAB AND SELECT CANCEL
Then exit SSH
________________________________________
Phase 3: Deploy Laravel Backend with JWT
3.1 Copy Laravel Application to VM
powershell
# From local machine, copy Laravel files
DON’T COPY vendor folder
Cd ../
scp -r insurance-api-main/* azureuser@{$VM_IP}:/var/www/html/insurance-api/
scp -r insurance-api-main/* azureuser@20.151.223.180:/var/www/html/insurance-api/ //Change the IP to VM public IP
OR USE WINSCP TO TRANFER THE FOLDER
3.2 SSH into VM and Configure Laravel
bash
ssh azureuser@$VM_IP
cd /var/www/html/insurance-api
3.3 Install Laravel Dependencies
cd /var/www/html/insurance-api

bash
# Install Composer dependencies
composer install --no-dev --optimize-autoloader

# Install JWT and Auth0 packages
composer require auth0/login:^7.0
composer require firebase/php-jwt:^6.0
composer require laravel/sanctum
3.4 Create and Configure .env File
bash
# Create .env file
cp .env.example .env

# Generate app key
php artisan key:generate

# Edit .env file
nano .env
Complete .env configuration:
env
APP_NAME=insureapi-backend
APP_ENV=production
APP_DEBUG=false
APP_URL=http://$VM_IP

# Database Configuration
DB_CONNECTION=sqlsrv
DB_HOST=insureapi-sqlserver.database.windows.net
DB_PORT=1433
DB_DATABASE=insurance-api
DB_USERNAME=sqladmin@insureapi-sqlserver
DB_PASSWORD=PSSSWWWSSSDDD

# Auth0 JWT Configuration
AUTH0_DOMAIN=dev-DDD.SS.auth0.com
AUTH0_CLIENT_ID=JPvi4Cz8rk
AUTH0_CLIENT_SECRET=-zRno_vV 
AUTH0_AUDIENCE=https://de.DDD.auth0.com/api/v2/
AUTH0_CONNECTION=Username-Password-Authentication
STEP 3.5 THROUGH 3.9 CAN BE SKIPPED AS CODE IS UPDATED
3.5 Configure Auth0 in Laravel
bash
# Publish Auth0 configuration
php artisan vendor:publish --tag=auth0-config

# Configure auth guard
nano config/auth.php
Update the guards array:
php
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],
    'api' => [
        'driver' => 'auth0',
        'provider' => 'users',
    ],
],
3.6 Create JWT Middleware
bash
# Create middleware
php artisan make:middleware Auth0JWT
Edit app/Http/Middleware/Auth0JWT.php:
bash
nano app/Http/Middleware/Auth0JWT.php
php
<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;

class Auth0JWT
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();
        
        if (!$token) {
            return response()->json(['error' => 'No token provided'], 401);
        }
        
        try {
            $decoded = JWT::decode($token, new Key(config('auth0.domain') . '/.well-known/jwks.json', 'RS256'));
            $request->merge(['user' => (array)$decoded]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid token: ' . $e->getMessage()], 401);
        }
        
        return $next($request);
    }
}
3.7 Register Middleware
bash
nano app/Http/Kernel.php
Add to $routeMiddleware:
php
protected $routeMiddleware = [
    // Other middleware...
    'auth0.jwt' => \App\Http\Middleware\Auth0JWT::class,
];
3.8 Update API Routes
bash
nano routes/api.php
php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\QuoteController;
use App\Http\Controllers\Api\PolicyController;
use App\Http\Controllers\Api\ClaimController;

// Public routes (no authentication required)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/insurance-products', [ProductController::class, 'index']);

// Protected routes (require JWT authentication)
Route::middleware(['auth0.jwt'])->group(function () {
    // Quote routes
    Route::get('/quotes', [QuoteController::class, 'index']);
    Route::post('/quotes', [QuoteController::class, 'store']);
    Route::get('/quotes/{id}', [QuoteController::class, 'show']);
    
    // Policy routes
    Route::get('/policies', [PolicyController::class, 'index']);
    Route::post('/policies', [PolicyController::class, 'store']);
    Route::get('/policies/{id}', [PolicyController::class, 'show']);
    
    // Claim routes
    Route::get('/claims', [ClaimController::class, 'index']);
    Route::post('/claims', [ClaimController::class, 'store']);
    Route::get('/claims/{id}', [ClaimController::class, 'show']);
});
3.9 Fix PolicyController Authorization
bash
nano app/Http/Controllers/Api/PolicyController.php
In the store method, fix the authorization check:
php
// Use loose comparison or type casting
if ((int) $quote->user_id !== (int) $user->id) {
    return response()->json([
        'success' => false,
        'message' => 'Unauthorized: This quote does not belong to you'
    ], 403);
}
3.10 Run Database Migrations
bash
# Fix permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 777 storage bootstrap/cache

sudo touch /var/www/html/insurance-api/storage/logs/laravel.log
sudo chown www-data:www-data /var/www/html/insurance-api/storage/logs/laravel.log
sudo chmod 777 /var/www/html/insurance-api/storage/logs/laravel.log

# Create cache table
php artisan cache:table

# Run migrations
php artisan migrate –force

php artisan db:seed --class=InsuranceProductsSeeder

# Clear and rebuild caches
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Optimize autoloader
composer dump-autoload

SKIP THE STEP IN RED IF THE ONE IN GREEN HAS BEEN EXECUTED SUCCESSFULLY AND TABLES CREATED:
# Run migrations:
php artisan migrate –force
php artisan db:seed --class=InsuranceProductSeeder

LOGIN TO AZURE PORTAL, GO TO SQL SERVER QUERY EDITOR, CONNECT WITH SQLADMIN USER AND PASSWORD AND COPY THE CONTENT OF table_structures.sql AND sample-data.sql AND RUN THE QUERIES

3.11 Set Final Permissions and Restart Services
bash
# Set permissions
sudo chown -R www-data:www-data storage bootstrap/cache vendor
sudo chmod -R 777 storage bootstrap/cache

# Restart services
sudo systemctl restart php8.3-fpm

sudo systemctl restart nginx
php artisan serve --host=127.0.0.1 --port=8000 &
php artisan serve

DEPLOY FRONTEND

cd /var/www/html
sudo mkdir frontend

sudo chmod +x -R /var/www/html/frontend/
sudo chown -R $USER:$USER /var/www/html/frontend

ls -lart /var/www/html/frontend

cd /var/www/html/frontend

# Update package list
sudo apt update

# Install Node.js 20.x from NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js (includes npm)
sudo apt install -y nodejs

# Verify installation
node --version
# Should show: v20.x.x
npm --version
modify /var/www/html/insurance-api/app/Http/Middleware/Cors.php and add the PUBLIC IP e.g

->header('Access-Control-Allow-Origin', 'http://http://20.220.200.43:5173')
->header('Access-Control-Allow-Origin', 'http://http://20.220.200.43')

$response->headers->set('Access-Control-Allow-Origin', 'http://http://20.220.200.43:5173');
$response->headers->set('Access-Control-Allow-Origin', 'http://http://20.220.200.43');

# Set permissions
echo "Setting permissions..."
sudo chown -R www-data:www-data build
sudo chmod -R 755 build

# Restart Nginx
echo "Restarting Nginx..."
sudo systemctl restart nginx

 
Use Nginx with HTTPS (Production)
For production, set up Nginx with SSL:
bash
# Install certbot for Let's Encrypt (if you have a domain)
sudo apt install -y certbot python3-certbot-nginx



update frontend .env VITE_API_BASE_URL=https://20.220.200.43/api

===========================
START SERVICE
npm install

npm run build

npm run dev -- --host 0.0.0.0

npm run dev

________________________________________
After Fixing 500 Errors, Fix CORS
Update Nginx Configuration
bash
sudo vi /etc/nginx/sites-available/laravel
Replace with this complete configuration:
nginx
server {
    listen 80;
    server_name _;

    root /var/www/html/insurance-api/public;
    index index.php;

    # CORS (update these to your actual frontend URL)
    add_header 'Access-Control-Allow-Origin' '*' always;   # Temporarily use * for testing
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, X-Requested-With, Accept, Origin' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}


GOTO /etc/nginx/sites-available/default
sudo vi /etc/nginx/sites-available/default

add below:



# HTTP redirect to HTTPS
server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    server_name 20.220.200.43;

    ssl_certificate /etc/nginx/ssl/selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/selfsigned.key;

    root /var/www/html/frontend/dist;
    index index.html;

    # Frontend SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls to Laravel (without stripping /api)
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

Test and reload:
bash
sudo nginx -t
sudo systemctl reload nginx

 Check Azure NSG for Port 5173
az network nsg rule list --resource-group insureapi-rg --nsg-name insureapi-nsg --output table

If port 5173 is not listed, add it:
az network nsg rule create --resource-group insureapi-rg --nsg-name insureapi-nsg --name AllowVite5173 --priority 103 --direction Inbound  --access Allow --protocol Tcp --destination-port-ranges 5173 --source-address-prefixes '*'
🔧 Fix: Install Laravel View Package
Step 1: Install illuminate/view package
bash
cd /var/www/html/insurance-api
composer require illuminate/view
Step 2: Clear all caches
bash
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
Step 3: Rebuild autoloader
bash
composer dump-autoload
Step 4: Reinstall Laravel framework components
bash
composer require laravel/framework
Step 5: Fix Laravel configuration
bash
# Republish Laravel configuration
php artisan config:cache
php artisan view:cache


# Check migration status
php artisan migrate:status
  Migration name ...................................................................................... Batch / Status
  0001_01_01_000000_create_users_table ....................................................................... [1] Ran
  0001_01_01_000001_create_cache_table ....................................................................... [1] Ran
  0001_01_01_000002_create_jobs_table ........................................................................ [1] Ran
  0001_01_01_000003_create_insurance_products_table .......................................................... [1] Ran
  0001_01_01_000004_create_quotes_table ...................................................................... [1] Ran
  0001_01_01_000005_create_policies_table .................................................................... [1] Ran
  0001_01_01_000006_create_claims_table ...................................................................... [1] Ran
  2026_03_15_140930_create_personal_access_tokens_table ...................................................... [1] Ran
  2026_04_11_223653_create_sessions_table .................................................................... [1] Ran

IF status is PENDING
php artisan migrate:refresh –force
php artisan migrate –force 

________________________________________
Phase 5: React Frontend Configuration
5.1 Update Environment Variables
File: frontend/.env
env
VITE_API_BASE_URL=http://$VM_IP/api
VITE_AUTH0_DOMAIN=dev .us.auth0.com
VITE_AUTH0_CLIENT_ID=JPydg3oDfx 
VITE_AUTH0_AUDIENCE=https://de 
5.2 Update API Service to Send JWT Token
File: frontend/src/api.js
javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://$VM_IP/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
5.3 Install Dependencies and Run Frontend
powershell
cd frontend
npm install
npm run dev
________________________________________
Phase 6: Testing the Complete System
6.1 Test Backend API
powershell
# Test public endpoint
curl http://$VM_IP/api/products

# Test protected endpoint (should return 401)
curl http://$VM_IP/api/quotes
6.2 Test with JWT Token
bash
# Get token from browser localStorage after login
# Then test protected endpoint
curl -X GET http://$VM_IP/api/quotes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
6.3 Test Full User Flow in Browser
1.	Open http://localhost:5173
2.	Login with Auth0 credentials
3.	Browse available products
4.	Select a product and create a quote
5.	Review the quote and accept it to create a policy
6.	View your policies
7.	Submit a claim against a policy
8.	Track claim status
________________________________________
📋 Quick Commands Reference
Deploy Infrastructure
powershell
az group create --name insureapi-rg --location canadacentral
az deployment group create --resource-group insureapi-rg --template-file main.bicep --parameters adminUsername=azureuser --parameters adminPassword='P!ssw0rd!123' --parameters sqlAdminPassword='P!ssw0rd!123'
Get VM IP
powershell
$VM_IP=$(az vm show -d -g insureapi-rg -n insureapi-vm --query publicIps -o tsv)
echo $VM_IP
Connect to VM
bash
ssh azureuser@$VM_IP
Deploy Backend Updates
bash
ssh azureuser@$VM_IP "cd /var/www/html/insurance-api && git pull && composer install && php artisan migrate --force && sudo systemctl restart php8.3-fpm"
View Logs
bash
ssh azureuser@$VM_IP "tail -100 /var/www/html/insurance-api/storage/logs/laravel.log"
Restart Services
bash
ssh azureuser@$VM_IP "sudo systemctl restart nginx && sudo systemctl restart php8.3-fpm"
 
