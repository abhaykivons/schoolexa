#!/bin/bash

# SchoolExa Deployment Script for Ubuntu 22.04
# This script helps automate common deployment tasks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/schoolexa"
APP_USER="www-data"
DEPLOY_USER="deploy"

# Functions
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root or with sudo"
    exit 1
fi

# Main menu
show_menu() {
    echo ""
    echo "=========================================="
    echo "  SchoolExa Deployment Helper"
    echo "=========================================="
    echo "1. Full deployment (first time setup)"
    echo "2. Update application (git pull + dependencies)"
    echo "3. Rebuild assets"
    echo "4. Run migrations"
    echo "5. Clear all caches"
    echo "6. Optimize for production"
    echo "7. Restart services"
    echo "8. Check service status"
    echo "9. View logs"
    echo "10. Fix permissions"
    echo "0. Exit"
    echo "=========================================="
    read -p "Select option: " option
}

# Full deployment
full_deployment() {
    print_info "Starting full deployment..."
    
    if [ ! -d "$APP_DIR" ]; then
        print_error "Application directory not found: $APP_DIR"
        exit 1
    fi
    
    cd $APP_DIR
    
    print_info "Installing PHP dependencies..."
    sudo -u $DEPLOY_USER composer install --optimize-autoloader --no-dev --no-interaction
    print_success "PHP dependencies installed"
    
    print_info "Installing Node dependencies..."
    sudo -u $DEPLOY_USER npm ci
    print_success "Node dependencies installed"
    
    print_info "Building assets..."
    sudo -u $DEPLOY_USER npm run build
    print_success "Assets built"
    
    print_info "Running migrations..."
    sudo -u $DEPLOY_USER php artisan migrate --force
    print_success "Migrations completed"
    
    print_info "Creating storage link..."
    sudo -u $DEPLOY_USER php artisan storage:link || true
    print_success "Storage link created"
    
    print_info "Optimizing application..."
    sudo -u $DEPLOY_USER php artisan config:cache
    sudo -u $DEPLOY_USER php artisan route:cache
    sudo -u $DEPLOY_USER php artisan view:cache
    print_success "Application optimized"
    
    print_info "Fixing permissions..."
    chown -R $APP_USER:$APP_USER $APP_DIR
    chmod -R 755 $APP_DIR
    chmod -R 775 $APP_DIR/storage
    chmod -R 775 $APP_DIR/bootstrap/cache
    print_success "Permissions fixed"
    
    print_info "Restarting services..."
    systemctl reload php8.2-fpm
    systemctl reload nginx
    supervisorctl restart schoolexa-worker:* || true
    print_success "Services restarted"
    
    print_success "Full deployment completed!"
}

# Update application
update_application() {
    print_info "Updating application..."
    
    cd $APP_DIR
    
    print_info "Pulling latest changes..."
    sudo -u $DEPLOY_USER git pull
    print_success "Code updated"
    
    print_info "Installing PHP dependencies..."
    sudo -u $DEPLOY_USER composer install --optimize-autoloader --no-dev --no-interaction
    print_success "PHP dependencies updated"
    
    print_info "Installing Node dependencies..."
    sudo -u $DEPLOY_USER npm ci
    print_success "Node dependencies updated"
    
    print_info "Building assets..."
    sudo -u $DEPLOY_USER npm run build
    print_success "Assets rebuilt"
    
    print_success "Application updated!"
}

# Rebuild assets
rebuild_assets() {
    print_info "Rebuilding assets..."
    
    cd $APP_DIR
    sudo -u $DEPLOY_USER npm run build
    print_success "Assets rebuilt"
}

# Run migrations
run_migrations() {
    print_info "Running migrations..."
    
    cd $APP_DIR
    sudo -u $DEPLOY_USER php artisan migrate --force
    print_success "Migrations completed"
}

# Clear caches
clear_caches() {
    print_info "Clearing all caches..."
    
    cd $APP_DIR
    sudo -u $DEPLOY_USER php artisan optimize:clear
    print_success "All caches cleared"
}

# Optimize for production
optimize_production() {
    print_info "Optimizing for production..."
    
    cd $APP_DIR
    sudo -u $DEPLOY_USER php artisan config:cache
    sudo -u $DEPLOY_USER php artisan route:cache
    sudo -u $DEPLOY_USER php artisan view:cache
    sudo -u $DEPLOY_USER composer dump-autoload --optimize --classmap-authoritative
    print_success "Application optimized"
}

# Restart services
restart_services() {
    print_info "Restarting services..."
    
    systemctl reload php8.2-fpm
    print_success "PHP-FPM reloaded"
    
    systemctl reload nginx
    print_success "Nginx reloaded"
    
    supervisorctl restart schoolexa-worker:* || print_info "Queue workers restarted"
    print_success "Services restarted"
}

# Check service status
check_status() {
    print_info "Checking service status..."
    
    echo ""
    echo "Nginx:"
    systemctl status nginx --no-pager -l || true
    
    echo ""
    echo "PHP-FPM:"
    systemctl status php8.2-fpm --no-pager -l || true
    
    echo ""
    echo "MySQL:"
    systemctl status mysql --no-pager -l || true
    
    echo ""
    echo "Redis:"
    systemctl status redis-server --no-pager -l || true
    
    echo ""
    echo "Supervisor:"
    systemctl status supervisor --no-pager -l || true
    
    echo ""
    echo "Queue Workers:"
    supervisorctl status || true
}

# View logs
view_logs() {
    echo ""
    echo "Select log to view:"
    echo "1. Laravel log"
    echo "2. Nginx access log"
    echo "3. Nginx error log"
    echo "4. PHP-FPM log"
    echo "5. Queue worker log"
    echo "6. All logs (last 50 lines)"
    read -p "Select: " log_option
    
    case $log_option in
        1)
            tail -f $APP_DIR/storage/logs/laravel.log
            ;;
        2)
            tail -f /var/log/nginx/schoolexa-access.log
            ;;
        3)
            tail -f /var/log/nginx/schoolexa-error.log
            ;;
        4)
            tail -f /var/log/php8.2-fpm.log
            ;;
        5)
            tail -f $APP_DIR/storage/logs/worker.log
            ;;
        6)
            echo "=== Laravel Log ==="
            tail -50 $APP_DIR/storage/logs/laravel.log
            echo ""
            echo "=== Nginx Error Log ==="
            tail -50 /var/log/nginx/schoolexa-error.log
            echo ""
            echo "=== Queue Worker Log ==="
            tail -50 $APP_DIR/storage/logs/worker.log
            ;;
        *)
            print_error "Invalid option"
            ;;
    esac
}

# Fix permissions
fix_permissions() {
    print_info "Fixing permissions..."
    
    chown -R $APP_USER:$APP_USER $APP_DIR
    find $APP_DIR -type d -exec chmod 755 {} \;
    find $APP_DIR -type f -exec chmod 644 {} \;
    chmod -R 775 $APP_DIR/storage
    chmod -R 775 $APP_DIR/bootstrap/cache
    print_success "Permissions fixed"
}

# Main loop
while true; do
    show_menu
    
    case $option in
        1)
            full_deployment
            ;;
        2)
            update_application
            ;;
        3)
            rebuild_assets
            ;;
        4)
            run_migrations
            ;;
        5)
            clear_caches
            ;;
        6)
            optimize_production
            ;;
        7)
            restart_services
            ;;
        8)
            check_status
            ;;
        9)
            view_logs
            ;;
        10)
            fix_permissions
            ;;
        0)
            print_info "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid option"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done
