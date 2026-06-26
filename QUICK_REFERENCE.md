# Quick Reference Guide - Ubuntu 22.04 Server Commands

## 🚀 Quick Start Commands

### Initial Server Access
```bash
# Connect to server
ssh deploy@your_server_ip

# Switch to root (if needed)
sudo su -
```

### Application Directory
```bash
cd /var/www/schoolexa
```

---

## 📦 Installation Commands

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install All Required Software (One Command)
```bash
sudo apt install -y nginx mysql-server redis-server supervisor \
    php8.2-fpm php8.2-cli php8.2-common php8.2-mysql php8.2-xml \
    php8.2-curl php8.2-zip php8.2-mbstring php8.2-gd php8.2-bcmath \
    php8.2-redis php8.2-intl php8.2-imagick \
    curl wget git unzip software-properties-common
```

### Install Node.js 18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Install Composer
```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer
```

---

## 🔧 Service Management

### Check Service Status
```bash
# All services
sudo systemctl status nginx
sudo systemctl status php8.2-fpm
sudo systemctl status mysql
sudo systemctl status redis-server
sudo systemctl status supervisor

# Queue workers
sudo supervisorctl status
```

### Start/Stop/Restart Services
```bash
# Nginx
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx

# PHP-FPM
sudo systemctl start php8.2-fpm
sudo systemctl restart php8.2-fpm
sudo systemctl reload php8.2-fpm

# MySQL
sudo systemctl start mysql
sudo systemctl restart mysql

# Redis
sudo systemctl start redis-server
sudo systemctl restart redis-server

# Supervisor
sudo systemctl start supervisor
sudo systemctl restart supervisor
```

### Queue Workers
```bash
# Check status
sudo supervisorctl status

# Restart all workers
sudo supervisorctl restart schoolexa-worker:*

# Restart specific worker
sudo supervisorctl restart schoolexa-worker:schoolexa-worker_00

# Stop workers
sudo supervisorctl stop schoolexa-worker:*

# Start workers
sudo supervisorctl start schoolexa-worker:*
```

---

## 📝 Application Commands

### Navigate to Application
```bash
cd /var/www/schoolexa
```

### Git Operations
```bash
# Pull latest changes
git pull origin main

# Check status
git status

# View recent commits
git log --oneline -10
```

### Composer Commands
```bash
# Install dependencies (production)
composer install --optimize-autoloader --no-dev

# Update dependencies
composer update

# Dump autoloader
composer dump-autoload --optimize --classmap-authoritative
```

### NPM Commands
```bash
# Install dependencies
npm ci

# Build production assets
npm run build

# Build development assets
npm run dev

# Watch for changes (development)
npm run dev -- --watch
```

### Laravel Artisan Commands
```bash
# Run migrations
php artisan migrate --force

# Rollback migrations
php artisan migrate:rollback

# Run seeders
php artisan db:seed --force

# Create storage link
php artisan storage:link

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear  # Clear all

# Cache for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize  # Cache all

# Generate application key
php artisan key:generate

# List all routes
php artisan route:list

# Check environment
php artisan env
```

### Multi-Tenancy Commands
```bash
# Migrate all tenant databases
php artisan tenants:migrate

# Seed all tenant databases
php artisan tenants:seed

# List all tenants
php artisan tenants:list

# Create tenant (if you have artisan command)
# php artisan tenant:create
```

---

## 🔐 Permissions

### Fix Application Permissions
```bash
cd /var/www/schoolexa

# Set ownership
sudo chown -R www-data:www-data /var/www/schoolexa

# Set directory permissions
sudo find /var/www/schoolexa -type d -exec chmod 755 {} \;

# Set file permissions
sudo find /var/www/schoolexa -type f -exec chmod 644 {} \;

# Set storage and cache permissions
sudo chmod -R 775 /var/www/schoolexa/storage
sudo chmod -R 775 /var/www/schoolexa/bootstrap/cache
```

### Quick Permission Fix (One Command)
```bash
sudo chown -R www-data:www-data /var/www/schoolexa && \
sudo find /var/www/schoolexa -type d -exec chmod 755 {} \; && \
sudo find /var/www/schoolexa -type f -exec chmod 644 {} \; && \
sudo chmod -R 775 /var/www/schoolexa/storage && \
sudo chmod -R 775 /var/www/schoolexa/bootstrap/cache
```

---

## 📊 Monitoring Commands

### View Logs
```bash
# Laravel logs
tail -f /var/www/schoolexa/storage/logs/laravel.log

# Nginx access log
tail -f /var/log/nginx/schoolexa-access.log

# Nginx error log
tail -f /var/log/nginx/schoolexa-error.log

# PHP-FPM log
tail -f /var/log/php8.2-fpm.log

# Queue worker log
tail -f /var/www/schoolexa/storage/logs/worker.log

# MySQL error log
tail -f /var/log/mysql/error.log

# All logs (last 50 lines)
tail -50 /var/www/schoolexa/storage/logs/laravel.log
tail -50 /var/log/nginx/schoolexa-error.log
tail -50 /var/www/schoolexa/storage/logs/worker.log
```

### System Resources
```bash
# CPU and Memory usage
htop
# Or
top

# Disk usage
df -h

# Memory usage
free -h

# Disk usage by directory
du -sh /var/www/schoolexa/*

# Check running PHP processes
ps aux | grep php

# Check MySQL connections
mysqladmin -u root -p processlist
```

### Database Commands
```bash
# Connect to MySQL
mysql -u schoolexa_user -p

# List all databases
mysql -u root -p -e "SHOW DATABASES;"

# List tenant databases
mysql -u root -p -e "SHOW DATABASES LIKE 'tenant_%';"

# Check database size
mysql -u root -p -e "SELECT table_schema AS 'Database', 
ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' 
FROM information_schema.TABLES 
GROUP BY table_schema;"

# Backup central database
mysqldump -u schoolexa_user -p schoolexa_central > backup_central.sql

# Backup specific tenant database
mysqldump -u schoolexa_user -p tenant_example > backup_tenant_example.sql
```

---

## 🔒 Security Commands

### Firewall (UFW)
```bash
# Check status
sudo ufw status

# Allow ports
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# Enable firewall
sudo ufw enable

# Disable firewall (not recommended)
sudo ufw disable
```

### SSL Certificates (Certbot)
```bash
# Obtain certificate
sudo certbot --nginx -d schoolexa.com -d www.schoolexa.com

# Renew certificates
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run

# List certificates
sudo certbot certificates
```

---

## 🗄️ Backup Commands

### Manual Backup
```bash
# Backup central database
mysqldump -u schoolexa_user -p schoolexa_central | gzip > backup_central_$(date +%Y%m%d).sql.gz

# Backup all tenant databases
for db in $(mysql -u schoolexa_user -p -e "SHOW DATABASES LIKE 'tenant_%';" -s --skip-column-names); do
    mysqldump -u schoolexa_user -p $db | gzip > backup_${db}_$(date +%Y%m%d).sql.gz
done

# Backup storage directory
tar -czf backup_storage_$(date +%Y%m%d).tar.gz -C /var/www/schoolexa storage
```

### Restore Backup
```bash
# Restore central database
gunzip < backup_central_20240101.sql.gz | mysql -u schoolexa_user -p schoolexa_central

# Restore tenant database
gunzip < backup_tenant_example_20240101.sql.gz | mysql -u schoolexa_user -p tenant_example
```

---

## 🔄 Deployment Workflow

### Full Deployment (First Time)
```bash
cd /var/www/schoolexa
git pull
composer install --optimize-autoloader --no-dev
npm ci
npm run build
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
sudo systemctl reload php8.2-fpm
sudo systemctl reload nginx
sudo supervisorctl restart schoolexa-worker:*
```

### Quick Update
```bash
cd /var/www/schoolexa
git pull
composer install --optimize-autoloader --no-dev
npm ci && npm run build
php artisan migrate --force
php artisan optimize
sudo systemctl reload php8.2-fpm
sudo supervisorctl restart schoolexa-worker:*
```

### Using Deployment Script
```bash
# Make script executable (first time only)
chmod +x /var/www/schoolexa/deploy.sh

# Run deployment script
sudo /var/www/schoolexa/deploy.sh
```

---

## 🐛 Troubleshooting Commands

### Check Nginx Configuration
```bash
sudo nginx -t
```

### Check PHP Configuration
```bash
php -v
php -m  # List installed modules
php -i  # Full PHP info
```

### Test Database Connection
```bash
mysql -u schoolexa_user -p schoolexa_central -e "SELECT 1;"
```

### Test Redis Connection
```bash
redis-cli ping
```

### Check PHP-FPM Pool Status
```bash
sudo systemctl status php8.2-fpm
sudo tail -f /var/log/php8.2-fpm.log
```

### View Recent Errors
```bash
# Laravel errors
tail -100 /var/www/schoolexa/storage/logs/laravel.log | grep ERROR

# Nginx errors
tail -100 /var/log/nginx/schoolexa-error.log

# PHP errors
tail -100 /var/log/php8.2-fpm.log
```

---

## 📱 Useful Aliases (Add to ~/.bashrc)

```bash
# Add these to ~/.bashrc for convenience
alias app='cd /var/www/schoolexa'
alias logs='tail -f /var/www/schoolexa/storage/logs/laravel.log'
alias nginx-logs='tail -f /var/log/nginx/schoolexa-error.log'
alias worker-logs='tail -f /var/www/schoolexa/storage/logs/worker.log'
alias restart-all='sudo systemctl reload php8.2-fpm && sudo systemctl reload nginx && sudo supervisorctl restart schoolexa-worker:*'
alias deploy='cd /var/www/schoolexa && git pull && composer install --optimize-autoloader --no-dev && npm ci && npm run build && php artisan migrate --force && php artisan optimize && restart-all'
```

After adding aliases, reload:
```bash
source ~/.bashrc
```

---

## 📚 File Locations Reference

### Application Files
- Application root: `/var/www/schoolexa`
- Environment file: `/var/www/schoolexa/.env`
- Storage: `/var/www/schoolexa/storage`
- Logs: `/var/www/schoolexa/storage/logs`

### Configuration Files
- Nginx: `/etc/nginx/sites-available/schoolexa`
- PHP-FPM: `/etc/php/8.2/fpm/php.ini`
- PHP-FPM Pool: `/etc/php/8.2/fpm/pool.d/www.conf`
- MySQL: `/etc/mysql/mysql.conf.d/mysqld.cnf`
- Redis: `/etc/redis/redis.conf`
- Supervisor: `/etc/supervisor/conf.d/schoolexa-worker.conf`

### Log Files
- Laravel: `/var/www/schoolexa/storage/logs/laravel.log`
- Nginx Access: `/var/log/nginx/schoolexa-access.log`
- Nginx Error: `/var/log/nginx/schoolexa-error.log`
- PHP-FPM: `/var/log/php8.2-fpm.log`
- Queue Worker: `/var/www/schoolexa/storage/logs/worker.log`
- MySQL: `/var/log/mysql/error.log`

---

## 🆘 Emergency Commands

### If Application is Down
```bash
# Check all services
sudo systemctl status nginx php8.2-fpm mysql redis-server supervisor

# Restart all services
sudo systemctl restart nginx php8.2-fpm mysql redis-server supervisor
sudo supervisorctl restart schoolexa-worker:*

# Check logs immediately
tail -50 /var/www/schoolexa/storage/logs/laravel.log
tail -50 /var/log/nginx/schoolexa-error.log
```

### If Database Connection Fails
```bash
# Check MySQL status
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql

# Test connection
mysql -u schoolexa_user -p schoolexa_central
```

### If Queue Workers Stop
```bash
# Check Supervisor status
sudo supervisorctl status

# Restart workers
sudo supervisorctl restart schoolexa-worker:*

# Check logs
tail -50 /var/www/schoolexa/storage/logs/worker.log
```

---

**Tip**: Bookmark this page for quick reference during deployment and maintenance!
