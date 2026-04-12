================================================================================
PERSONAL INSURANCE APPLICATION - INFRASTRUCTURE DEPLOYMENT
================================================================================

Project: Insurance API Platform (Two-VM Architecture with Database Isolation)
Author: Infrastructure Team
Date: April 2026
Version: 2.0.0

================================================================================
ARCHITECTURE SUMMARY
================================================================================

This deployment provisions:

- 2 Azure VMs (Ubuntu 22.04):
  - Frontend VM: React application (served by Nginx) - Public IP accessible
  - Backend VM: Laravel backend API (PHP 8.3) - No public IP, isolated
- Azure SQL Database (Basic tier) - ONLY accessible by Backend VM
- Azure Storage Account (Static assets)
- Virtual Network with two isolated subnets:
  - Frontend Subnet (10.0.1.0/24): Public access for HTTP/HTTPS
  - Backend Subnet (10.0.2.0/24): Private, only accessible from Frontend VM
- Network Security Groups for traffic control

SECURITY HIGHLIGHTS:

- Frontend VM: Public access only (ports 80, 443)
- Backend VM: NO public IP, NO direct internet access
- Database: Firewall allows ONLY Backend VM private IP
- Frontend CANNOT access database directly (even if compromised)
- SSH to backend requires passing through frontend (jump host pattern)

================================================================================
ASSUMPTIONS AND LIMITATIONS
================================================================================

Assumptions:

1. Azure subscription with Contributor access
2. Azure CLI installed and configured
3. Auth0 account with configured application
4. Laravel backend code in ../insurance-api-main/
5. React frontend code in ../frontend/
6. SSH key or password access configured

Limitations:

1. Single instance per VM (no high availability for production)
2. Basic SQL tier (no failover support)
3. Manual SSL configuration required for HTTPS
4. React builds performed on the Frontend VM (requires Node.js)
5. Backup strategy not implemented
6. Backend VM requires jump host access via Frontend VM

================================================================================
KNOWN ISSUES AND RESOLUTIONS
================================================================================

Issue 1: Public IP deployment fails

- Error: "IPv4BasicSkuPublicIpCountLimitReached"
- Resolution: Use Standard SKU public IP with Static allocation
- Fixed in: main.bicep (frontendPublicIP resource)

Issue 2: SQL Server connection timeout from Backend VM

- Error: "Cannot open database requested"
- Resolution: SQL firewall rule only allows Backend VM IP
- Command: az sql server firewall-rule create --name AllowBackendVM --start-ip-address $BACKEND_IP

Issue 3: Frontend cannot connect to Backend VM

- Error: "Connection refused" or timeout
- Resolution: Ensure Backend VM NSG allows HTTP from Frontend subnet (10.0.1.0/24)
- Check: backend-nsg security rules

Issue 4: React routes return 404

- Error: "Cannot GET /products"
- Resolution: Configure Nginx with try_files $uri $uri/ /index.html
- Fixed in: frontend-setup.sh

Issue 5: API routes return 404

- Error: "Cannot GET /api/products"
- Resolution: Configure Frontend Nginx to proxy /api/\* to Backend VM
- Fixed in: frontend-setup.sh (proxy_pass to BACKEND_IP)

Issue 6: CORS multiple values error

- Error: "Access-Control-Allow-Origin header contains multiple values"
- Resolution: Remove CORS headers from Nginx, keep only Laravel config
- Fixed in: backend-setup.sh (CORS only in Laravel)

Issue 7: Cannot SSH to Backend VM directly

- Error: "Connection timeout" (Backend has no public IP)
- Resolution: Use jump host pattern - SSH through Frontend VM
- Command: ssh -J azureuser@$FRONTEND_IP azureuser@$BACKEND_IP

Issue 8: Circular dependency in Bicep deployment

- Error: "Cannot reference backend.outputs before backend module is defined"
- Resolution: Declare Backend VM module BEFORE Frontend VM module
- Fixed in: main.bicep (module order)

================================================================================
DEPLOYMENT INSTRUCTIONS
================================================================================

Prerequisites:

1. Install Azure CLI: https://docs.microsoft.com/cli/azure/install-azure-cli
2. Run 'az login' to authenticate
3. Ensure Laravel and React code are ready
4. Ensure all Bicep files are in correct directory structure

Directory Structure Required:
infrastructure/
├── main.bicep
└── modules/
├── sql.bicep
└── storage.bicep

Deployment Steps:

1. Create resource group:
   az group create --name insureapi-rg --location canadacentral

2. Deploy infrastructure:
   az deployment group create \
    --resource-group insureapi-rg \
    --template-file infrastructure/main.bicep \
    --parameters adminUsername=azureuser \
    --parameters adminPassword='PASSWORD' \
    --parameters sqlAdminPassword='PSSWORD'

3. Get VM IPs and connectivity info:
   $FRONTEND_IP = az deployment group show -g insureapi-rg -n main --query properties.outputs.frontendPublicIP.value -o tsv
   $BACKEND_IP = az deployment group show -g insureapi-rg -n main --query properties.outputs.backendPrivateIp.value -o tsv
   Write-Host "Frontend IP: $FRONTEND_IP (Public - Accessible from internet)"
   Write-Host "Backend IP: $BACKEND_IP (Private - No direct access)"

4. Run Frontend VM setup script (Nginx + Node.js):
   scp infrastructure/scripts/frontend-setup.sh azureuser@$FRONTEND_IP:/home/azureuser/
   ssh azureuser@$FRONTEND_IP "chmod +x frontend-setup.sh && sudo ./frontend-setup.sh $BACKEND_IP"

5. Run Backend VM setup script (PHP + Laravel + SQL Drivers):
   scp infrastructure/scripts/backend-setup.sh azureuser@$FRONTEND_IP:/home/azureuser/
   ssh -J azureuser@$FRONTEND_IP azureuser@$BACKEND_IP "chmod +x backend-setup.sh && sudo ./backend-setup.sh"

6. Deploy Laravel backend (from local machine):
   scp -r ../insurance-api-main/\* azureuser@$FRONTEND_IP:/var/www/backend/
   ssh -J azureuser@$FRONTEND_IP azureuser@$BACKEND_IP
   cd /var/www/backend
   composer install --no-dev --optimize-autoloader
   cp .env.example .env
   php artisan key:generate

   # Update .env with database connection:

   # DB_HOST=insureapi-sqlserver.database.windows.net

   # DB_DATABASE=insurance-api

   # DB_USERNAME=sqladmin@MYAPP-sqlserver

   # DB_PASSWORD=<MYPASSWORD>

   php artisan migrate --force
   sudo chown -R www-data:www-data storage bootstrap/cache
   sudo systemctl restart php8.3-fpm
   exit

7. Deploy React frontend (from local machine):
   scp -r ../frontend/\* azureuser@$FRONTEND_IP:/var/www/frontend/
   ssh azureuser@$FRONTEND_IP
   cd /var/www/frontend
   npm install
   npm run build
   sudo chown -R www-data:www-data build
   sudo systemctl restart nginx
   exit

8. Access the application:
   Frontend (React): http://$FRONTEND_IP/
   Backend API (Laravel): http://$FRONTEND_IP/api/products

9. Verify database isolation (Security Test):

   # Test from Frontend (should FAIL):

   ssh azureuser@$FRONTEND_IP "nc -zv insureapi-sqlserver.database.windows.net 1433"

   # Test from Backend (should SUCCEED):

   ssh -J azureuser@$FRONTEND_IP azureuser@$BACKEND_IP "nc -zv insureapi-sqlserver.database.windows.net 1433"

================================================================================
CONNECTIVITY MATRIX
================================================================================

| From / To       | Frontend VM   | Backend VM | SQL Database | Internet |
| --------------- | ------------- | ---------- | ------------ | -------- |
| Internet (User) | ✅ HTTP/HTTPS | ❌         | ❌           | N/A      |
| Frontend VM     | N/A           | ✅ HTTP    | ❌ (Blocked) | ✅       |
| Backend VM      | ❌            | N/A        | ✅ (Allowed) | ❌       |
| SSH to Frontend | ✅ Direct     | N/A        | N/A          | N/A      |
| SSH to Backend  | ✅ Via Jump   | ✅ Direct  | N/A          | ❌       |

================================================================================
SCALING INSTRUCTIONS
================================================================================

To scale up Frontend VM:
az vm resize -g insureapi-rg -n insureapi-frontend-vm --size Standard_D2s_v3

To scale up Backend VM:
az vm resize -g insureapi-rg -n insureapi-backend-vm --size Standard_D2s_v3

To scale database:
az sql db update -g insureapi-rg -s insureapi-sqlserver -n insurance-api --edition Standard --capacity S1

To add auto-scaling for production:

# Create VM Scale Set for Backend

az vmss create -g insureapi-rg -n backend-vmss --image Ubuntu2204 --vm-sku Standard_B2s --instance-count 2

# Create Load Balancer

az network lb create -g insureapi-rg -n backend-lb --sku Standard --vnet-name insureapi-vnet --subnet backend-subnet

# Configure auto-scale rules

az monitor autoscale create -g insureapi-rg -n backend-autoscale --resource backend-vmss --min-count 2 --max-count 10 --count 2
az monitor autoscale rule create --autoscale-name backend-autoscale -g insureapi-rg --condition "Percentage CPU > 70 avg 5m" --scale out 1
az monitor autoscale rule create --autoscale-name backend-autoscale -g insureapi-rg --condition "Percentage CPU < 30 avg 5m" --scale in 1

================================================================================
TROUBLESHOOTING COMMANDS
================================================================================

Check VM status:
az vm get-instance-view -g insureapi-rg -n insureapi-frontend-vm --query "statuses[1].code"
az vm get-instance-view -g insureapi-rg -n insureapi-backend-vm --query "statuses[1].code"

View logs on Frontend VM:
ssh azureuser@$FRONTEND_IP "sudo tail -f /var/log/nginx/error.log"

View logs on Backend VM:
ssh -J azureuser@$FRONTEND_IP azureuser@$BACKEND_IP "sudo tail -f /var/log/nginx/error.log"
ssh -J azureuser@$FRONTEND_IP azureuser@$BACKEND_IP "sudo tail -f /var/www/backend/storage/logs/laravel.log"

Test connectivity:

# Test Frontend Nginx

curl -I http://$FRONTEND_IP/

# Test API through Frontend proxy

curl http://$FRONTEND_IP/api/products

# Test direct Backend API (should fail - no public IP)

curl http://$BACKEND_IP/api/products

# Test database connectivity from Backend

ssh -J azureuser@$FRONTEND_IP azureuser@$BACKEND_IP "sqlcmd -S insureapi-sqlserver.database.windows.net -U sqladmin -P 'password' -d insurance-api -Q 'SELECT 1'"

Restart services on Frontend VM:
ssh azureuser@$FRONTEND_IP "sudo systemctl restart nginx"

Restart services on Backend VM:
ssh -J azureuser@$FRONTEND_IP azureuser@$BACKEND_IP "sudo systemctl restart php8.3-fpm && sudo systemctl restart nginx"

---

```

Configure Laravel to Accept Auth0 Tokens instead of SANCTUM
This allows you to use Auth0 for authentication while Laravel validates Auth0 JWTs.
  Install Auth0 and JWT packages
composer require auth0/login
composer require firebase/php-jwt

Run migration:
php artisan migrate

php artisan db:seed --class=InsuranceProductSeeder

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
  `category` text NOT NULL,
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



```
