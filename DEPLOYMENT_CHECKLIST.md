# Deployment Checklist - Ubuntu 22.04 LTS

Use this checklist to ensure you complete all steps during deployment.

---

## ✅ Pre-Deployment

- [ ] VPS server purchased and accessible
- [ ] Domain name registered and DNS configured
- [ ] SSH access to server working
- [ ] Repository access (GitHub/GitLab) configured
- [ ] Database credentials prepared
- [ ] Email service credentials ready (SMTP)
- [ ] Backup strategy planned

---

## ✅ Initial Server Setup

- [ ] Connected to server via SSH
- [ ] System packages updated (`sudo apt update && sudo apt upgrade -y`)
- [ ] Non-root user created (deploy user)
- [ ] SSH key authentication configured
- [ ] Firewall configured (UFW)
- [ ] Basic security measures implemented

---

## ✅ Software Installation

- [ ] Nginx installed and running
- [ ] PHP 8.2 FPM installed
- [ ] All PHP extensions installed:
  - [ ] php8.2-mysql
  - [ ] php8.2-xml
  - [ ] php8.2-curl
  - [ ] php8.2-zip
  - [ ] php8.2-mbstring
  - [ ] php8.2-gd
  - [ ] php8.2-bcmath
  - [ ] php8.2-redis
  - [ ] php8.2-intl
  - [ ] php8.2-imagick
- [ ] MySQL 8.0 installed and secured
- [ ] Redis installed and running
- [ ] Supervisor installed
- [ ] Node.js 18+ installed
- [ ] Composer installed globally
- [ ] Git installed

---

## ✅ Configuration

### PHP Configuration
- [ ] PHP-FPM configured (`/etc/php/8.2/fpm/php.ini`)
- [ ] PHP-FPM pool configured (`/etc/php/8.2/fpm/pool.d/www.conf`)
- [ ] PHP-FPM restarted and tested

### MySQL Configuration
- [ ] MySQL secured (`mysql_secure_installation`)
- [ ] Central database created (`schoolexa_central`)
- [ ] Database user created (`schoolexa_user`)
- [ ] Permissions granted for tenant databases (`tenant_%`)
- [ ] MySQL optimized for multi-tenancy
- [ ] Connection tested

### Redis Configuration
- [ ] Redis configured (`/etc/redis/redis.conf`)
- [ ] Redis restarted
- [ ] Connection tested (`redis-cli ping`)

### Nginx Configuration
- [ ] Nginx configuration created (`/etc/nginx/sites-available/schoolexa`)
- [ ] Site enabled (symlink created)
- [ ] Default site removed (optional)
- [ ] Nginx configuration tested (`nginx -t`)
- [ ] Nginx reloaded

---

## ✅ Application Deployment

### Directory Setup
- [ ] Application directory created (`/var/www/schoolexa`)
- [ ] Ownership set correctly (`www-data:www-data`)
- [ ] Permissions set correctly (755 for directories, 644 for files)
- [ ] Storage directories created
- [ ] Storage permissions set (775)

### Code Deployment
- [ ] Repository cloned to `/var/www/schoolexa`
- [ ] `.env` file created from `.env.example`
- [ ] Environment variables configured:
  - [ ] APP_NAME
  - [ ] APP_ENV=production
  - [ ] APP_DEBUG=false
  - [ ] APP_URL
  - [ ] Database credentials
  - [ ] Redis configuration
  - [ ] Mail configuration
  - [ ] CENTRAL_DOMAIN
- [ ] Application key generated (`php artisan key:generate`)

### Dependencies
- [ ] Composer dependencies installed (`composer install --no-dev`)
- [ ] Node dependencies installed (`npm ci`)
- [ ] Production assets built (`npm run build`)

### Database
- [ ] Central database migrations run (`php artisan migrate --force`)
- [ ] Central database seeders run (if applicable)
- [ ] Storage link created (`php artisan storage:link`)

### Optimization
- [ ] Configuration cached (`php artisan config:cache`)
- [ ] Routes cached (`php artisan route:cache`)
- [ ] Views cached (`php artisan view:cache`)
- [ ] Autoloader optimized (`composer dump-autoload --optimize`)

---

## ✅ Multi-Tenancy Setup

- [ ] DNS configured:
  - [ ] Main domain A record
  - [ ] Wildcard subdomain A record (`*.schoolexa.com`)
  - [ ] DNS propagation verified
- [ ] Central domain configured in `.env`
- [ ] Tenant creation tested
- [ ] Tenant database creation verified
- [ ] Tenant subdomain accessible

---

## ✅ Queue Workers

- [ ] Supervisor configuration created (`/etc/supervisor/conf.d/schoolexa-worker.conf`)
- [ ] Supervisor configuration loaded (`supervisorctl reread`)
- [ ] Workers added (`supervisorctl add schoolexa-worker`)
- [ ] Workers started (`supervisorctl start schoolexa-worker:*`)
- [ ] Worker status verified (`supervisorctl status`)
- [ ] Worker logs checked

---

## ✅ SSL Certificates

- [ ] Certbot installed
- [ ] SSL certificate obtained for main domain
- [ ] SSL certificate obtained for wildcard (if using subdomains)
- [ ] Nginx configuration updated for SSL
- [ ] HTTPS working (tested in browser)
- [ ] HTTP to HTTPS redirect configured
- [ ] Auto-renewal tested (`certbot renew --dry-run`)

---

## ✅ Security

- [ ] Firewall configured (UFW)
- [ ] Only necessary ports open (22, 80, 443)
- [ ] Fail2ban installed and configured (optional)
- [ ] File permissions verified
- [ ] `.env` file secured (not publicly accessible)
- [ ] SSH key authentication enforced
- [ ] Root login disabled (if applicable)

---

## ✅ Backups

- [ ] Backup script created (`/usr/local/bin/schoolexa-backup.sh`)
- [ ] Backup script tested
- [ ] Cron job configured for automatic backups
- [ ] Backup location verified (`/var/backups/schoolexa`)
- [ ] Backup restoration tested

---

## ✅ Monitoring

- [ ] Log rotation configured
- [ ] Monitoring script created (optional)
- [ ] Health check script created (optional)
- [ ] Cron job for health checks configured (optional)
- [ ] Log locations documented

---

## ✅ Testing

### Application Tests
- [ ] Main domain accessible (`https://schoolexa.com`)
- [ ] Application loads correctly
- [ ] No 500 errors in logs
- [ ] Static assets loading (CSS, JS, images)
- [ ] File uploads working
- [ ] Email notifications working

### Multi-Tenancy Tests
- [ ] Can create new tenant
- [ ] Tenant database created automatically
- [ ] Tenant subdomain accessible (`https://tenant1.schoolexa.com`)
- [ ] Tenant data isolated correctly
- [ ] Tenant file storage working

### Performance Tests
- [ ] Page load times acceptable
- [ ] Database queries optimized
- [ ] Cache working correctly
- [ ] Queue jobs processing

### Security Tests
- [ ] HTTPS enforced
- [ ] HTTP redirects to HTTPS
- [ ] No sensitive files accessible
- [ ] Storage directory protected
- [ ] `.env` file not accessible

---

## ✅ Documentation

- [ ] Server access credentials documented (secure location)
- [ ] Database credentials documented (secure location)
- [ ] Deployment process documented
- [ ] Backup/restore process documented
- [ ] Monitoring setup documented
- [ ] Team members have access (if applicable)

---

## ✅ Post-Deployment

- [ ] Application monitoring set up
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Uptime monitoring configured (UptimeRobot, etc.)
- [ ] Team notified of deployment
- [ ] Initial backup completed
- [ ] Performance baseline established

---

## 🔄 Regular Maintenance Checklist

### Daily
- [ ] Check application logs for errors
- [ ] Verify backups completed successfully
- [ ] Check disk space usage
- [ ] Monitor queue worker status

### Weekly
- [ ] Review error logs
- [ ] Check database sizes
- [ ] Verify SSL certificate validity
- [ ] Review server resource usage
- [ ] Check for security updates

### Monthly
- [ ] Update system packages (`sudo apt update && sudo apt upgrade`)
- [ ] Update Composer dependencies (if needed)
- [ ] Update npm dependencies (if needed)
- [ ] Review and optimize database
- [ ] Review backup retention policy
- [ ] Security audit
- [ ] Performance review

---

## 🆘 Emergency Contacts

- **Server Provider Support**: _________________
- **Domain Registrar**: _________________
- **Email Service Provider**: _________________
- **Team Lead**: _________________
- **DevOps Contact**: _________________

---

## 📝 Notes

Use this section to document any issues encountered during deployment and their solutions:

```
Date: ___________
Issue: 
Solution: 

Date: ___________
Issue: 
Solution: 

```

---

**Deployment Date**: ___________  
**Deployed By**: ___________  
**Server IP**: ___________  
**Domain**: ___________

---

**Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Completed | ⬜ Issues Encountered
