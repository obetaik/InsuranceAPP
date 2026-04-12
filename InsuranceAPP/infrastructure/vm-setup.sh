#!/bin/bash

echo "========================================="
echo "Setting up Ubuntu 22.04 with PHP 8.3"
echo "========================================="

# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP 8.3 and required extensions
echo "Installing PHP 8.3..."
sudo apt install -y software-properties-common
sudo add-apt-repository -y ppa:ondrej/php
sudo apt update

sudo apt install -y php8.3 php8.3-cli php8.3-fpm php8.3-common \
    php8.3-mysql php8.3-zip php8.3-gd php8.3-mbstring php8.3-curl \
    php8.3-xml php8.3-bcmath php8.3-intl php8.3-sqlite3

# Install Nginx
echo "Installing Nginx..."
sudo apt install -y nginx

# Install Composer
echo "Installing Composer..."
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php -r "unlink('composer-setup.php');"
sudo mv composer.phar /usr/local/bin/composer

# Install SQL Server drivers
echo "Installing SQL Server drivers..."
curl -sSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor | sudo tee /usr/share/keyrings/microsoft-prod.gpg > /dev/null
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft-prod.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" | sudo tee /etc/apt/sources.list.d/mssql-release.list
sudo apt update
sudo ACCEPT_EULA=Y apt-get install -y msodbcsql18 unixodbc-dev
sudo pecl install sqlsrv pdo_sqlsrv
echo "extension=sqlsrv.so" | sudo tee /etc/php/8.3/mods-available/sqlsrv.ini
echo "extension=pdo_sqlsrv.so" | sudo tee /etc/php/8.3/mods-available/pdo_sqlsrv.ini
sudo phpenmod sqlsrv pdo_sqlsrv

# Configure Nginx for Laravel
echo "Configuring Nginx..."
sudo bash -c 'cat > /etc/nginx/sites-available/laravel << EOF
server {
    listen 80;
    server_name _;
    root /var/www/html/insurance-api/public;

    add_header "Access-Control-Allow-Origin" "*" always;
    add_header "Access-Control-Allow-Methods" "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header "Access-Control-Allow-Headers" "Authorization, Content-Type, X-Requested-With" always;

    index index.php;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
    }

    location ~ /\.ht {
        deny all;
    }
}
EOF'

sudo ln -sf /etc/nginx/sites-available/laravel /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Create application directory
sudo mkdir -p /var/www/html/insurance-api
sudo chown -R $USER:$USER /var/www/html/insurance-api

# Configure PHP-FPM
sudo sed -i 's/memory_limit = .*/memory_limit = 256M/' /etc/php/8.3/fpm/php.ini
sudo sed -i 's/upload_max_filesize = .*/upload_max_filesize = 64M/' /etc/php/8.3/fpm/php.ini
sudo sed -i 's/post_max_size = .*/post_max_size = 64M/' /etc/php/8.3/fpm/php.ini

sudo systemctl restart php8.3-fpm

echo "========================================="
echo "VM Setup Complete!"
echo "VM IP: $(curl -s ifconfig.me)"
echo "========================================="

echo "========================================="
echo "VM Setup Complete!"
echo "========================================="
echo "PHP Version: $(php -v | head -1)"
echo "Nginx Status: $(sudo systemctl is-active nginx)"
echo "PHP-FPM Status: $(sudo systemctl is-active php8.3-fpm)"
echo ""
echo "Next steps:"
echo "1. Deploy your Laravel app:"
echo "   scp -r ./your-laravel-app/* azureuser@<VM_IP>:/var/www/html/insurance-api/"
echo ""
echo "2. SSH into VM and configure Laravel:"
echo "   ssh azureuser@<VM_IP>"
echo "   cd /var/www/html/insurance-api"
echo "   composer install"
echo "   cp .env.example .env"
echo "   php artisan key:generate"
echo "   php artisan migrate"
echo "   php artisan config:cache"
echo ""
echo "3. Set permissions:"
echo "   sudo chown -R www-data:www-data /var/www/html/insurance-api"
echo "   sudo chmod -R 775 /var/www/html/insurance-api/storage"
echo "   sudo chmod -R 775 /var/www/html/insurance-api/bootstrap/cache"
echo "========================================="