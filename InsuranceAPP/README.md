Here’s your content **cleaned, structured, and properly formatted for `README.md` on GitHub** 👇

---

# 🚀 Insurance API Platform Deployment Guide (Azure + JWT)

## 📋 Project Overview

This project deploys a **full-stack Insurance API platform**:

* **Backend:** Laravel (JWT authentication via Auth0)
* **Frontend:** React (Vite)
* **Database:** Azure SQL Database
* **Hosting:** Azure Virtual Machine (VM)
* **Infrastructure as Code:** Bicep

---

## 📁 Project Structure

```bash
InsuranceAPP/
├── insurance-api-main/     # Laravel Backend
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/
│   ├── routes/
│   ├── storage/
│   └── vendor/
├── frontend/               # React Frontend
│   ├── src/
│   ├── public/
│   └── package.json
└── infrastructure/
    ├── main.bicep
    └── modules/
        ├── sql.bicep
        └── storage.bicep
```

---

# 🏗️ Phase 1: Azure Infrastructure Setup

## 1.1 Prerequisites

```powershell
# Install Azure CLI
# https://aka.ms/installazurecliwindows

az login
az account show
```

---

## 1.2 Deploy Infrastructure

```powershell
az group create --name insureapi-rg --location canadacentral

cd infrastructure

az deployment group create `
  --resource-group insureapi-rg `
  --template-file main.bicep `
  --parameters adminUsername=azureuser `
  --parameters adminPassword='YourPassword!' `
  --parameters sqlAdminPassword='YourPassword!'
```

---

## 1.3 Get Resources Info

```powershell
$VM_IP=$(az vm show -d -g insureapi-rg -n insureapi-vm --query publicIps -o tsv)
echo $VM_IP

$SQL_FQDN=$(az deployment group show --resource-group insureapi-rg --name main --query properties.outputs.sqlServerFqdn.value -o tsv)
echo $SQL_FQDN
```

---

## 1.4 Configure SQL Firewall

```powershell
$myIp = (Invoke-WebRequest -Uri "https://api.ipify.org").Content

az sql server firewall-rule create `
  --resource-group insureapi-rg `
  --server insureapi-sqlserver `
  --name AllowLocalDev `
  --start-ip-address $myIp `
  --end-ip-address $myIp

az sql server firewall-rule create `
  --resource-group insureapi-rg `
  --server insureapi-sqlserver `
  --name AllowVM `
  --start-ip-address $VM_IP `
  --end-ip-address $VM_IP
```

---

# 💻 Phase 2: VM Setup (Laravel Backend)

## Copy Setup Script

```powershell
scp vm-setup.sh azureuser@<VM_IP>:/home/azureuser/
```

## Run on VM

```bash
ssh azureuser@<VM_IP>

dos2unix vm-setup.sh || sed -i 's/\r$//' vm-setup.sh

chmod +x vm-setup.sh
sudo ./vm-setup.sh
```

---

## Install SQL Server Drivers (PHP 8.3)

```bash
sudo apt update
sudo apt install -y curl gnupg unixodbc-dev php-pear php8.3-dev

curl -sSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor | sudo tee /usr/share/keyrings/microsoft-prod.gpg > /dev/null

echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft-prod.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" | sudo tee /etc/apt/sources.list.d/mssql-release.list

sudo apt update
sudo ACCEPT_EULA=Y apt-get install -y msodbcsql18

sudo pecl install sqlsrv
sudo pecl install pdo_sqlsrv

sudo phpenmod sqlsrv pdo_sqlsrv
sudo systemctl restart php8.3-fpm
```

---

# ⚙️ Phase 3: Deploy Laravel Backend

## Copy Backend

```powershell
scp -r insurance-api-main/* azureuser@<VM_IP>:/var/www/html/insurance-api/
```

---

## Install Dependencies

```bash
cd /var/www/html/insurance-api

composer install --no-dev --optimize-autoloader
composer require auth0/login:^7.0 firebase/php-jwt:^6.0 laravel/sanctum
```

---

## Configure Environment

```bash
cp .env.example .env
php artisan key:generate
nano .env
```

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=http://<VM_IP>

DB_CONNECTION=sqlsrv
DB_HOST=insureapi-sqlserver.database.windows.net
DB_PORT=1433
DB_DATABASE=insurance-api
DB_USERNAME=sqladmin@insureapi-sqlserver
DB_PASSWORD=YOUR_PASSWORD

AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-secret
AUTH0_AUDIENCE=your-audience
```

---

## Run Migrations

```bash
php artisan migrate --force
php artisan db:seed --class=InsuranceProductsSeeder
```

---

## Fix Permissions

```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 777 storage bootstrap/cache
```

---

## Start Services

```bash
sudo systemctl restart php8.3-fpm
sudo systemctl restart nginx

php artisan serve --host=127.0.0.1 --port=8000 &
```

---

# 🌐 Phase 4: Frontend Deployment

## Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

---

## Configure Frontend

```env
VITE_API_BASE_URL=http://<VM_IP>/api
```

---

## Run Frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

---

# 🔐 Phase 5: Nginx + CORS Configuration

## Laravel API Server

```nginx
server {
    listen 80;
    root /var/www/html/insurance-api/public;

    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
}
```

---

## Frontend + API Proxy

```nginx
server {
    listen 443 ssl;
    root /var/www/html/frontend/dist;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
    }
}
```

---

# 🧪 Phase 6: Testing

## Test Backend

```bash
curl http://<VM_IP>/api/products
curl http://<VM_IP>/api/quotes
```

---

## Test with JWT

```bash
curl -X GET http://<VM_IP>/api/quotes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Full User Flow

1. Open `http://localhost:5173`
2. Login via Auth0
3. Browse products
4. Create quote
5. Create policy
6. Submit claim

---

# 📋 Quick Commands

## Deploy Infra

```powershell
az group create --name insureapi-rg --location canadacentral
```

## Get VM IP

```powershell
az vm show -d -g insureapi-rg -n insureapi-vm --query publicIps -o tsv
```

## SSH

```bash
ssh azureuser@<VM_IP>
```

## Restart Services

```bash
sudo systemctl restart nginx
sudo systemctl restart php8.3-fpm
```

## View Logs

```bash
tail -f storage/logs/laravel.log
```

---

# ✅ Notes

* Use **HTTPS in production**
* Replace all placeholders (`<VM_IP>`, credentials)
 