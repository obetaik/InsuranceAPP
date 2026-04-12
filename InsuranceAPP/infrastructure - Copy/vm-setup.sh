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
    php8.3-xml php8.3-bcmath php8.3-intl php8.3-sqlite3 php8.3-soap \
    php8.3-redis php8.3-opcache

# Install SQL Server drivers for PHP 8.3
echo "Installing SQL Server drivers..."
curl https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
curl https://packages.microsoft.com/config/ubuntu/22.04/prod.list | sudo tee /etc/apt/sources.list.d/mssql-release.list
sudo apt update
sudo ACCEPT_EULA=Y apt install -y msodbcsql17
sudo apt install -y unixodbc-dev

# Install pecl and add sqlsrv extensions
sudo apt install -y php-pear php8.3-dev
sudo pecl channel-update pecl.php.net
sudo pecl install sqlsrv
sudo pecl install pdo_sqlsrv

# Enable the extensions
echo "extension=sqlsrv.so" | sudo tee /etc/php/8.3/mods-available/sqlsrv.ini
echo "extension=pdo_sqlsrv.so" | sudo tee /etc/php/8.3/mods-available/pdo_sqlsrv.ini
sudo phpenmod sqlsrv pdo_sqlsrv

# Install Nginx
echo "Installing Nginx..."
sudo apt install -y nginx

# Install Composer
echo "Installing Composer..."
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php -r "unlink('composer-setup.php');"
sudo mv composer.phar /usr/local/bin/composer

# Install Git
sudo apt install -y git

# Install Node.js 20.x (for frontend builds)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Configure Nginx for Laravel
echo "Configuring Nginx..."
sudo cat > /etc/nginx/sites-available/laravel << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name _;
    root /var/www/html/insurance-api/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php index.html;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
EOF

# Enable Laravel site and disable default
sudo ln -s /etc/nginx/sites-available/laravel /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Configure PHP-FPM
echo "Configuring PHP-FPM..."
sudo sed -i 's/memory_limit = .*/memory_limit = 256M/' /etc/php/8.3/fpm/php.ini
sudo sed -i 's/upload_max_filesize = .*/upload_max_filesize = 64M/' /etc/php/8.3/fpm/php.ini
sudo sed -i 's/post_max_size = .*/post_max_size = 64M/' /etc/php/8.3/fpm/php.ini
sudo sed -i 's/max_execution_time = .*/max_execution_time = 120/' /etc/php/8.3/fpm/php.ini

sudo systemctl enable php8.3-fpm
sudo systemctl restart php8.3-fpm

# Create Laravel directory
sudo mkdir -p /var/www/html/insurance-api
sudo chown -R $USER:$USER /var/www/html/insurance-api

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