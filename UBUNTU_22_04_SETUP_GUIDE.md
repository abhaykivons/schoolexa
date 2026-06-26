# Complete Ubuntu 22.04 LTS Setup Guide for SchoolExa Multi-Tenant Application

This guide provides step-by-step instructions to set up your Laravel multi-tenant application on Ubuntu 22.04 LTS.

---

## 📋 Table of Contents

1. [Initial Server Setup](#1-initial-server-setup)
2. [Install Required Software](#2-install-required-software)
3. [Configure PHP 8.2](#3-configure-php-82)
4. [Configure MySQL](#4-configure-mysql)
5. [Configure Redis](#5-configure-redis)
6. [Install Node.js and npm](#6-install-nodejs-and-npm)
7. [Install Composer](#7-install-composer)
8. [Configure Nginx](#8-configure-nginx)
9. [Set Up Application Directory](#9-set-up-application-directory)
10. [Deploy Laravel Application](#10-deploy-laravel-application)
11. [Configure Multi-Tenancy](#11-configure-multi-tenancy)
12. [Set Up Queue Workers](#12-set-up-queue-workers)
13. [Configure SSL Certificates](#13-configure-ssl-certificates)
14. [Set Up Firewall](#14-set-up-firewall)
15. [Configure Backups](#15-configure-backups)
16. [Monitoring and Maintenance](#16-monitoring-and-maintenance)
17. [Troubleshooting](#17-troubleshooting)

---

## 1. Initial Server Setup

### 1.1 Connect to Your Server

```bash
ssh root@your_server_ip
```

Or if using a non-root user:
```bash
ssh username@your_server_ip
```

### 1.2 Update System Packages

```bash
# Update package list
sudo apt update

# Upgrade all packages
sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

### 1.3 Create Non-Root User (Recommended)

```bash
# Create a new user
sudo adduser deploy

# Add user to sudo group
sudo usermod -aG sudo deploy

# Switch to the new user
su - deploy
```

### 1.4 Set Up SSH Key Authentication (Recommended)

On your local machine, generate SSH key if you don't have one:
```bash
ssh-keygen -t rsa -b 4096
```

Copy your public key to the server:
```bash
# On your local machine
ssh-copy-id deploy@your_server_ip
```

Or manually:
```bash
# On server, create .ssh directory
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Create authorized_keys file
nano ~/.ssh/authorized_keys
# Paste your public key here

chmod 600 ~/.ssh/authorized_keys
```

### 1.5 Configure SSH Security (Optional but Recommended)

```bash
sudo nano /etc/ssh/sshd_config
```

Make these changes:
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Restart SSH:
```bash
sudo systemctl restart sshd
```

### 1.6 Set Up Basic Firewall

```bash
# Check firewall status
sudo ufw status

# Allow SSH (important - do this first!)
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS (we'll configure these later)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

---

## 2. Install Required Software

### 2.1 Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx

# Verify Nginx is running
curl http://localhost
```

### 2.2 Install PHP 8.2 and Required Extensions

```bash
# Add PHP repository
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# Install PHP 8.2 and FPM
sudo apt install -y php8.2-fpm php8.2-cli php8.2-common

# Install required PHP extensions
sudo apt install -y \
    php8.2-mysql \
    php8.2-xml \
    php8.2-curl \
    php8.2-zip \
    php8.2-mbstring \
    php8.2-gd \
    php8.2-bcmath \
    php8.2-redis \
    php8.2-intl \
    php8.2-imagick

# Verify PHP installation
php -v

# Check installed extensions
php -m
```

### 2.3 Install MySQL 8.0

```bash
# Install MySQL server
sudo apt install -y mysql-server

# Secure MySQL installation
sudo mysql_secure_installation
```

During secure installation, answer:
- **VALIDATE PASSWORD PLUGIN**: Choose your preference (Y/N)
- **Password**: Set a strong root password
- **Remove anonymous users**: Y
- **Disallow root login remotely**: Y (unless you need remote access)
- **Remove test database**: Y
- **Reload privilege tables**: Y

### 2.4 Install Redis

```bash
# Install Redis
sudo apt install -y redis-server

# Start and enable Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Check status
sudo systemctl status redis-server

# Test Redis
redis-cli ping
# Should return: PONG
```

### 2.5 Install Supervisor (for Queue Workers)

```bash
# Install Supervisor
sudo apt install -y supervisor

# Start and enable Supervisor
sudo systemctl start supervisor
sudo systemctl enable supervisor

# Check status
sudo systemctl status supervisor
```

---

## 3. Configure PHP 8.2

### 3.1 Configure PHP-FPM

```bash
# Edit PHP-FPM configuration
sudo nano /etc/php/8.2/fpm/php.ini
```

Find and modify these settings:
```ini
memory_limit = 256M
upload_max_filesize = 64M
post_max_size = 64M
max_execution_time = 300
max_input_time = 300
```

### 3.2 Configure PHP-FPM Pool

```bash
# Edit PHP-FPM pool configuration
sudo nano /etc/php/8.2/fpm/pool.d/www.conf
```

Find and modify:
```ini
user = www-data
group = www-data
listen = /run/php/php8.2-fpm.sock
listen.owner = www-data
listen.group = www-data
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 500
```

### 3.3 Restart PHP-FPM

```bash
sudo systemctl restart php8.2-fpm
sudo systemctl status php8.2-fpm
```

---

## 4. Configure MySQL

### 4.1 Create Database and User for Central Database

```bash
# Login to MySQL
sudo mysql -u root -p
```

In MySQL prompt:
```sql
-- Create central database
CREATE DATABASE schoolexa_central CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user for Laravel application
CREATE USER 'schoolexa_user'@'localhost' IDENTIFIED BY 'your_strong_password_here';

-- Grant privileges for central database
GRANT ALL PRIVILEGES ON schoolexa_central.* TO 'schoolexa_user'@'localhost';

-- Grant privileges for creating tenant databases
GRANT ALL PRIVILEGES ON `tenant_%`.* TO 'schoolexa_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

**Important**: Replace `your_strong_password_here` with a strong password!

### 4.2 Test MySQL Connection

```bash
mysql -u schoolexa_user -p schoolexa_central
# Enter password when prompted
# Type EXIT; to leave
```

### 4.3 Optimize MySQL for Multi-Tenancy

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Add/modify these settings:
```ini
[mysqld]
max_connections = 200
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
```

Restart MySQL:
```bash
sudo systemctl restart mysql
```

---

## 5. Configure Redis

### 5.1 Configure Redis

```bash
sudo nano /etc/redis/redis.conf
```

Find and modify:
```
bind 127.0.0.1
protected-mode yes
maxmemory 256mb
maxmemory-policy allkeys-lru
```

Restart Redis:
```bash
sudo systemctl restart redis-server
```

### 5.2 Test Redis

```bash
redis-cli
# In Redis CLI:
SET test "Hello Redis"
GET test
# Should return: "Hello Redis"
EXIT
```

---

## 6. Install Node.js and npm

### 6.1 Install Node.js 18.x

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v
```

### 6.2 Install Additional Node.js Tools

```bash
# Install build tools (required for some npm packages)
sudo apt install -y build-essential
```

---

## 7. Install Composer

### 7.1 Download and Install Composer

```bash
# Download Composer installer
cd ~
curl -sS https://getcomposer.org/installer | php

# Move Composer to global location
sudo mv composer.phar /usr/local/bin/composer

# Make it executable
sudo chmod +x /usr/local/bin/composer

# Verify installation
composer --version
```

### 7.2 Configure Composer

```bash
# Set up Composer global directory
mkdir -p ~/.composer

# Update Composer
composer self-update
```

---

## 8. Configure Nginx

### 8.1 Create Nginx Configuration for Your Application

```bash
sudo nano /etc/nginx/sites-available/schoolexa
```

Add the following configuration:

```nginx
# Upstream PHP-FPM
upstream php-fpm {
    server unix:/run/php/php8.2-fpm.sock;
}

# Central domain (main application)
server {
    listen 80;
    listen [::]:80;
    server_name schoolexa.com www.schoolexa.com;
    root /var/www/schoolexa/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    # Logging
    access_log /var/log/nginx/schoolexa-access.log;
    error_log /var/log/nginx/schoolexa-error.log;

    # Main location block
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP-FPM configuration
    location ~ \.php$ {
        fastcgi_pass php-fpm;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    # Deny access to hidden files
    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Deny access to storage and bootstrap cache
    location ~ ^/(storage|bootstrap/cache) {
        deny all;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Wildcard server block for tenant subdomains
server {
    listen 80;
    listen [::]:80;
    server_name *.schoolexa.com;
    root /var/www/schoolexa/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    # Logging
    access_log /var/www/schoolexa/storage/logs/tenant-access.log;
    error_log /var/www/schoolexa/storage/logs/tenant-error.log;

    # Main location block
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP-FPM configuration
    location ~ \.php$ {
        fastcgi_pass php-fpm;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    # Deny access to hidden files
    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Deny access to storage and bootstrap cache
    location ~ ^/(storage|bootstrap/cache) {
        deny all;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 8.2 Enable the Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/schoolexa /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

---

## 9. Set Up Application Directory

### 9.1 Create Application Directory

```bash
# Create directory
sudo mkdir -p /var/www/schoolexa

# Set ownership
sudo chown -R deploy:www-data /var/www/schoolexa

# Set permissions
sudo chmod -R 755 /var/www/schoolexa
```

### 9.2 Set Up Storage and Cache Directories

```bash
# Create storage directories (will be created by Laravel, but prepare structure)
sudo mkdir -p /var/www/schoolexa/storage/{app,framework,logs}
sudo mkdir -p /var/www/schoolexa/storage/framework/{cache,sessions,views}
sudo mkdir -p /var/www/schoolexa/storage/app/public

# Set ownership
sudo chown -R www-data:www-data /var/www/schoolexa/storage
sudo chown -R www-data:www-data /var/www/schoolexa/bootstrap/cache

# Set permissions
sudo chmod -R 775 /var/www/schoolexa/storage
sudo chmod -R 775 /var/www/schoolexa/bootstrap/cache
```

---

## 10. Deploy Laravel Application

### 10.1 Clone Your Repository

```bash
cd /var/www/schoolexa

# Clone your repository (replace with your actual repository URL)
sudo -u deploy git clone https://github.com/yourusername/schoolexa-migration.git .

# Or if using SSH key
sudo -u deploy git clone git@github.com:yourusername/schoolexa-migration.git .
```

### 10.2 Install PHP Dependencies

```bash
cd /var/www/schoolexa

# Install Composer dependencies (production mode)
sudo -u deploy composer install --optimize-autoloader --no-dev --no-interaction

# If you need dev dependencies for now, use:
# sudo -u deploy composer install --optimize-autoloader
```

### 10.3 Install Node.js Dependencies and Build Assets

```bash
cd /var/www/schoolexa

# Install npm dependencies
sudo -u deploy npm ci

# Build production assets
sudo -u deploy npm run build
```

### 10.4 Configure Environment File

```bash
cd /var/www/schoolexa

# Copy environment file
sudo -u deploy cp .env.example .env

# Edit environment file
sudo -u deploy nano .env
```

Configure these important settings:

```env
APP_NAME="SchoolExa"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://schoolexa.com

LOG_CHANNEL=stack
LOG_LEVEL=error

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=schoolexa_central
DB_USERNAME=schoolexa_user
DB_PASSWORD=your_strong_password_here

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Queue Configuration
QUEUE_CONNECTION=redis

# Mail Configuration (configure based on your mail service)
MAIL_MAILER=smtp
MAIL_HOST=your_mail_host
MAIL_PORT=587
MAIL_USERNAME=your_mail_username
MAIL_PASSWORD=your_mail_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@schoolexa.com
MAIL_FROM_NAME="${APP_NAME}"

# Central Domain for Multi-Tenancy
CENTRAL_DOMAIN=schoolexa.com

# Session Configuration
SESSION_DRIVER=redis
SESSION_LIFETIME=120

# Cache Configuration
CACHE_DRIVER=redis

# File Storage
FILESYSTEM_DISK=local
```

### 10.5 Generate Application Key

```bash
cd /var/www/schoolexa
sudo -u deploy php artisan key:generate
```

### 10.6 Run Migrations

```bash
cd /var/www/schoolexa

# Run migrations for central database
sudo -u deploy php artisan migrate --force

# If you have seeders for central database
# sudo -u deploy php artisan db:seed --force
```

### 10.7 Create Storage Link

```bash
cd /var/www/schoolexa
sudo -u deploy php artisan storage:link
```

### 10.8 Optimize Laravel for Production

```bash
cd /var/www/schoolexa

# Cache configuration
sudo -u deploy php artisan config:cache

# Cache routes
sudo -u deploy php artisan route:cache

# Cache views
sudo -u deploy php artisan view:cache

# Optimize autoloader
sudo -u deploy composer dump-autoload --optimize --classmap-authoritative
```

### 10.9 Set Final Permissions

```bash
# Set ownership
sudo chown -R www-data:www-data /var/www/schoolexa

# Set directory permissions
sudo find /var/www/schoolexa -type d -exec chmod 755 {} \;

# Set file permissions
sudo find /var/www/schoolexa -type f -exec chmod 644 {} \;

# Set special permissions for storage and cache
sudo chmod -R 775 /var/www/schoolexa/storage
sudo chmod -R 775 /var/www/schoolexa/bootstrap/cache
```

---

## 11. Configure Multi-Tenancy

### 11.1 Verify Tenancy Configuration

```bash
cd /var/www/schoolexa
sudo -u deploy nano .env
```

Ensure these settings are correct:
```env
CENTRAL_DOMAIN=schoolexa.com
DB_CONNECTION=mysql
```

### 11.2 Set Up DNS for Multi-Tenancy

#### Option A: Subdomain-Based (Recommended)

1. **Add Wildcard DNS Record**:
   - Go to your domain registrar's DNS settings
   - Add A record: `*.schoolexa.com` → Your VPS IP address
   - Add A record: `schoolexa.com` → Your VPS IP address
   - Add A record: `www.schoolexa.com` → Your VPS IP address

2. **Wait for DNS Propagation** (can take up to 48 hours, usually faster)

3. **Test DNS**:
```bash
# Test wildcard DNS
dig *.schoolexa.com

# Test main domain
dig schoolexa.com
```

#### Option B: Custom Domain-Based

For tenants with custom domains:
- Each tenant points their domain to your VPS IP
- Nginx will automatically handle the domain routing

### 11.3 Test Tenant Creation

```bash
cd /var/www/schoolexa

# Create a test tenant via artisan command (if you have one)
# Or test via your application's tenant creation interface
```

### 11.4 Verify Tenant Database Creation

```bash
# Login to MySQL
sudo mysql -u root -p

# List databases
SHOW DATABASES LIKE 'tenant_%';

# Exit
EXIT;
```

---

## 12. Set Up Queue Workers

### 12.1 Create Supervisor Configuration

```bash
sudo nano /etc/supervisor/conf.d/schoolexa-worker.conf
```

Add the following configuration:

```ini
[program:schoolexa-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/schoolexa/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/schoolexa/storage/logs/worker.log
stopwaitsecs=3600
```

### 12.2 Start Supervisor Workers

```bash
# Reread configuration
sudo supervisorctl reread

# Add worker program
sudo supervisorctl add schoolexa-worker

# Start workers
sudo supervisorctl start schoolexa-worker:*

# Check status
sudo supervisorctl status

# View logs
sudo tail -f /var/www/schoolexa/storage/logs/worker.log
```

### 12.3 Configure Supervisor to Auto-Start

Supervisor should already be enabled, but verify:

```bash
sudo systemctl enable supervisor
sudo systemctl status supervisor
```

---

## 13. Configure SSL Certificates

### 13.1 Install Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### 13.2 Obtain SSL Certificates

#### For Main Domain:

```bash
# Obtain certificate for main domain
sudo certbot --nginx -d schoolexa.com -d www.schoolexa.com

# Follow the prompts:
# - Enter your email address
# - Agree to terms of service
# - Choose whether to redirect HTTP to HTTPS (recommended: 2)
```

#### For Wildcard Domain (Subdomains):

```bash
# For wildcard certificates, you need DNS validation
sudo certbot certonly --manual --preferred-challenges dns -d "*.schoolexa.com" -d schoolexa.com

# Follow instructions to add TXT record to DNS
# Certbot will verify and issue certificate
```

### 13.3 Update Nginx Configuration for SSL

Certbot should automatically update your Nginx configuration. Verify:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 13.4 Set Up Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up a cron job, but verify:
sudo systemctl status certbot.timer
```

---

## 14. Set Up Firewall

### 14.1 Configure UFW Firewall

```bash
# Check current status
sudo ufw status

# Allow SSH (if not already allowed)
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

### 14.2 Install Fail2ban (Optional but Recommended)

```bash
# Install Fail2ban
sudo apt install -y fail2ban

# Start and enable Fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check status
sudo systemctl status fail2ban
```

---

## 15. Configure Backups

### 15.1 Create Backup Script

```bash
sudo nano /usr/local/bin/schoolexa-backup.sh
```

Add the following script:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/var/backups/schoolexa"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Create backup directory
mkdir -p $BACKUP_DIR

# Database credentials
DB_USER="schoolexa_user"
DB_PASS="your_database_password"
DB_NAME="schoolexa_central"

# Backup central database
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/central_db_$DATE.sql.gz

# Backup tenant databases
for db in $(mysql -u $DB_USER -p$DB_PASS -e "SHOW DATABASES LIKE 'tenant_%';" -s --skip-column-names); do
    mysqldump -u $DB_USER -p$DB_PASS $db | gzip > $BACKUP_DIR/${db}_$DATE.sql.gz
done

# Backup application files (storage only)
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz -C /var/www/schoolexa storage

# Remove old backups (older than retention days)
find $BACKUP_DIR -type f -mtime +$RETENTION_DAYS -delete

# Log backup completion
echo "$(date): Backup completed successfully" >> $BACKUP_DIR/backup.log
```

Make it executable:
```bash
sudo chmod +x /usr/local/bin/schoolexa-backup.sh
```

**Important**: Update the database password in the script!

### 15.2 Set Up Cron Job for Backups

```bash
sudo crontab -e
```

Add this line to run backups daily at 2 AM:
```
0 2 * * * /usr/local/bin/schoolexa-backup.sh
```

### 15.3 Test Backup Script

```bash
sudo /usr/local/bin/schoolexa-backup.sh

# Check if backups were created
ls -lh /var/backups/schoolexa/
```

---

## 16. Monitoring and Maintenance

### 16.1 Set Up Log Rotation

```bash
sudo nano /etc/logrotate.d/schoolexa
```

Add:
```
/var/www/schoolexa/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        /usr/bin/supervisorctl restart schoolexa-worker:* > /dev/null 2>&1 || true
    endscript
}
```

### 16.2 Monitor Server Resources

```bash
# Install htop for monitoring
sudo apt install -y htop

# View system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h

# Check MySQL status
sudo systemctl status mysql

# Check PHP-FPM status
sudo systemctl status php8.2-fpm

# Check Nginx status
sudo systemctl status nginx
```

### 16.3 Set Up Basic Monitoring Script

```bash
sudo nano /usr/local/bin/schoolexa-monitor.sh
```

Add:
```bash
#!/bin/bash

LOG_FILE="/var/log/schoolexa-monitor.log"

echo "$(date): Starting health check" >> $LOG_FILE

# Check Nginx
if ! systemctl is-active --quiet nginx; then
    echo "$(date): ERROR - Nginx is not running!" >> $LOG_FILE
    systemctl restart nginx
fi

# Check PHP-FPM
if ! systemctl is-active --quiet php8.2-fpm; then
    echo "$(date): ERROR - PHP-FPM is not running!" >> $LOG_FILE
    systemctl restart php8.2-fpm
fi

# Check MySQL
if ! systemctl is-active --quiet mysql; then
    echo "$(date): ERROR - MySQL is not running!" >> $LOG_FILE
    systemctl restart mysql
fi

# Check Redis
if ! systemctl is-active --quiet redis-server; then
    echo "$(date): ERROR - Redis is not running!" >> $LOG_FILE
    systemctl restart redis-server
fi

# Check Supervisor
if ! systemctl is-active --quiet supervisor; then
    echo "$(date): ERROR - Supervisor is not running!" >> $LOG_FILE
    systemctl restart supervisor
fi

echo "$(date): Health check completed" >> $LOG_FILE
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/schoolexa-monitor.sh
```

Add to crontab (every 5 minutes):
```bash
sudo crontab -e
```

Add:
```
*/5 * * * * /usr/local/bin/schoolexa-monitor.sh
```

---

## 17. Troubleshooting

### 17.1 Common Issues and Solutions

#### Issue: 502 Bad Gateway
```bash
# Check PHP-FPM status
sudo systemctl status php8.2-fpm

# Check PHP-FPM logs
sudo tail -f /var/log/php8.2-fpm.log

# Restart PHP-FPM
sudo systemctl restart php8.2-fpm
```

#### Issue: Permission Denied Errors
```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/schoolexa

# Fix permissions
sudo chmod -R 755 /var/www/schoolexa
sudo chmod -R 775 /var/www/schoolexa/storage
sudo chmod -R 775 /var/www/schoolexa/bootstrap/cache
```

#### Issue: Database Connection Errors
```bash
# Test MySQL connection
mysql -u schoolexa_user -p schoolexa_central

# Check MySQL status
sudo systemctl status mysql

# Check MySQL logs
sudo tail -f /var/log/mysql/error.log
```

#### Issue: Queue Workers Not Running
```bash
# Check Supervisor status
sudo supervisorctl status

# Restart workers
sudo supervisorctl restart schoolexa-worker:*

# Check worker logs
sudo tail -f /var/www/schoolexa/storage/logs/worker.log
```

#### Issue: Assets Not Loading
```bash
# Rebuild assets
cd /var/www/schoolexa
sudo -u deploy npm run build

# Clear Laravel cache
sudo -u deploy php artisan cache:clear
sudo -u deploy php artisan config:clear
sudo -u deploy php artisan view:clear
```

### 17.2 Useful Commands

```bash
# View Laravel logs
sudo tail -f /var/www/schoolexa/storage/logs/laravel.log

# View Nginx access logs
sudo tail -f /var/log/nginx/schoolexa-access.log

# View Nginx error logs
sudo tail -f /var/log/nginx/schoolexa-error.log

# Clear all Laravel caches
cd /var/www/schoolexa
sudo -u deploy php artisan optimize:clear

# Re-optimize Laravel
sudo -u deploy php artisan optimize

# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
ps aux | grep php
```

---

## ✅ Post-Deployment Checklist

- [ ] Application is accessible via domain
- [ ] SSL certificate is installed and working
- [ ] Central database is set up and migrated
- [ ] Queue workers are running
- [ ] Can create a test tenant
- [ ] Tenant subdomain is accessible
- [ ] File uploads are working
- [ ] Email notifications are working
- [ ] Backups are configured and tested
- [ ] Monitoring is set up
- [ ] Firewall is configured
- [ ] All services are running

---

## 🔄 Updating Your Application

### Update Process

```bash
# SSH into server
ssh deploy@your_server_ip

# Navigate to application directory
cd /var/www/schoolexa

# Pull latest changes
git pull origin main

# Install/update PHP dependencies
composer install --optimize-autoloader --no-dev

# Install/update Node dependencies
npm ci

# Build assets
npm run build

# Run migrations
php artisan migrate --force

# Clear and cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart queue workers
sudo supervisorctl restart schoolexa-worker:*

# Reload PHP-FPM
sudo systemctl reload php8.2-fpm
```

---

## 📞 Support and Resources

- **Laravel Documentation**: https://laravel.com/docs
- **Stancl Tenancy Documentation**: https://tenancyforlaravel.com/docs/v3/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Ubuntu Server Guide**: https://ubuntu.com/server/docs

---

**Congratulations!** Your multi-tenant Laravel application should now be running on Ubuntu 22.04 LTS. 🎉
