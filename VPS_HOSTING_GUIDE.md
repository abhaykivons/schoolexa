# VPS Hosting Guide for SchoolExa Multi-Tenant Application

## ✅ Yes, VPS Can Handle Multi-Tenancy!

Your application uses **stancl/tenancy** package with **database-per-tenant** architecture. VPS hosting is **perfectly suitable** for this setup, especially in the startup phase.

## 🏗️ Your Application Architecture

Based on your codebase analysis:
- **Multi-tenancy**: Domain-based identification (each tenant gets their own domain/subdomain)
- **Database Strategy**: Separate database per tenant (`tenant_` prefix)
- **Stack**: Laravel 12 + React/TypeScript + Inertia.js + MySQL
- **Features**: Queue workers, file storage, cache, email notifications

## 💻 VPS Requirements & Recommendations

### Minimum VPS Specifications (Startup Phase)

**Entry Level (1-10 tenants):**
- **CPU**: 2-4 cores
- **RAM**: 4-8 GB
- **Storage**: 50-100 GB SSD
- **Bandwidth**: 1-2 TB/month
- **Estimated Cost**: $10-25/month

**Recommended (10-50 tenants):**
- **CPU**: 4-6 cores
- **RAM**: 8-16 GB
- **Storage**: 100-200 GB SSD
- **Bandwidth**: 2-5 TB/month
- **Estimated Cost**: $25-50/month

**Growth Phase (50+ tenants):**
- **CPU**: 6-8 cores
- **RAM**: 16-32 GB
- **Storage**: 200-500 GB SSD
- **Bandwidth**: 5-10 TB/month
- **Estimated Cost**: $50-100/month

### Why These Specs?

1. **RAM**: Each tenant database connection + PHP-FPM processes + queue workers need memory
2. **CPU**: Laravel queue processing, database queries, asset compilation
3. **Storage**: Each tenant has separate file storage + database files
4. **SSD**: Critical for database performance with multiple tenant databases

## 🛠️ Required Software Stack

### 1. Web Server
- **Nginx** (recommended) or Apache
- SSL certificates (Let's Encrypt - free)

### 2. PHP
- **PHP 8.2+** (as per your composer.json)
- Required extensions:
  - `pdo_mysql`
  - `mbstring`
  - `xml`
  - `curl`
  - `zip`
  - `gd` or `imagick`
  - `redis` (optional but recommended)

### 3. Database
- **MySQL 8.0+** or **MariaDB 10.6+**
- Each tenant gets their own database
- Consider connection pooling for better performance

### 4. Queue Worker
- **Redis** (recommended) or database queue
- Supervisor for managing queue workers

### 5. Node.js
- **Node.js 18+** for Vite asset compilation
- Required for building React/TypeScript frontend

### 6. Process Manager
- **Supervisor** for queue workers
- **PM2** (optional) for Node.js processes

## 📋 VPS Setup Checklist

### Initial Setup
- [ ] Install Ubuntu 22.04 LTS or Debian 12 (recommended)
- [ ] Configure firewall (UFW)
- [ ] Set up SSH key authentication
- [ ] Create non-root user with sudo access
- [ ] Install Nginx
- [ ] Install PHP 8.2+ with FPM
- [ ] Install MySQL/MariaDB
- [ ] Install Redis
- [ ] Install Node.js 18+ and npm
- [ ] Install Composer
- [ ] Install Git

### Application Deployment
- [ ] Clone your repository
- [ ] Install PHP dependencies (`composer install --optimize-autoloader --no-dev`)
- [ ] Install Node dependencies (`npm ci`)
- [ ] Build assets (`npm run build`)
- [ ] Configure `.env` file
- [ ] Set up central database
- [ ] Run migrations for central database
- [ ] Set proper file permissions
- [ ] Configure Nginx virtual hosts
- [ ] Set up SSL certificates
- [ ] Configure Supervisor for queue workers
- [ ] Set up log rotation

### Multi-Tenancy Specific
- [ ] Configure central domain in `.env`
- [ ] Set up wildcard DNS (for subdomain tenants)
- [ ] Configure tenant database creation permissions
- [ ] Set up tenant file storage directories
- [ ] Configure cache prefixing for tenants
- [ ] Test tenant creation process

## 🌐 Domain & DNS Configuration

### Option 1: Subdomain-Based (Recommended for Startups)
```
Central: app.schoolexa.com
Tenant 1: school1.schoolexa.com
Tenant 2: school2.schoolexa.com
```

**DNS Setup:**
- Add wildcard A record: `*.schoolexa.com` → Your VPS IP
- Add A record: `schoolexa.com` → Your VPS IP

### Option 2: Domain-Based (For Established Tenants)
```
Central: app.schoolexa.com
Tenant 1: school1.com (custom domain)
Tenant 2: school2.com (custom domain)
```

**DNS Setup:**
- Each tenant points their domain to your VPS IP
- Configure Nginx to handle multiple domains

## 🔒 Security Considerations

1. **Database Security**
   - Use strong passwords
   - Limit MySQL user permissions
   - Enable SSL for database connections (if remote)

2. **File Permissions**
   - Set proper ownership (`www-data:www-data`)
   - Restrict access to sensitive files
   - Use `.env` for secrets (never commit)

3. **Application Security**
   - Keep Laravel and dependencies updated
   - Use HTTPS for all domains
   - Configure CORS properly
   - Set up rate limiting
   - Regular security audits

4. **Server Security**
   - Fail2ban for SSH protection
   - Regular security updates
   - Firewall configuration
   - Disable root login

## 📊 Monitoring & Maintenance

### Essential Monitoring
- **Server Resources**: CPU, RAM, Disk usage
- **Database Performance**: Query times, connection counts
- **Application Logs**: Laravel logs, Nginx access/error logs
- **Queue Status**: Monitor queue worker health
- **Disk Space**: Critical with multiple tenant databases

### Recommended Tools
- **Server Monitoring**: New Relic, Datadog, or free: Netdata
- **Application Monitoring**: Laravel Telescope (dev), Sentry (errors)
- **Database Monitoring**: MySQL Workbench, phpMyAdmin
- **Log Management**: Papertrail, Loggly, or local log rotation

## 💰 Cost-Effective VPS Providers (Startup Friendly)

### Budget Options ($5-15/month)
- **DigitalOcean**: $12/month (2GB RAM, 1 vCPU)
- **Linode**: $12/month (2GB RAM, 1 vCPU)
- **Vultr**: $12/month (2GB RAM, 1 vCPU)
- **Hetzner**: €4.15/month (4GB RAM, 2 vCPU) - Best value!

### Mid-Range Options ($20-50/month)
- **DigitalOcean**: $24/month (4GB RAM, 2 vCPU)
- **Linode**: $24/month (4GB RAM, 2 vCPU)
- **AWS Lightsail**: $20/month (4GB RAM, 2 vCPU)
- **Hetzner**: €8.31/month (8GB RAM, 4 vCPU)

### Premium Options ($50+/month)
- **DigitalOcean**: $48/month (8GB RAM, 4 vCPU)
- **AWS EC2**: Pay-as-you-go
- **Google Cloud**: Pay-as-you-go

## 🚀 Deployment Strategy

### Option 1: Manual Deployment (Startup Phase)
1. SSH into VPS
2. Clone repository
3. Install dependencies
4. Configure environment
5. Run migrations
6. Build assets
7. Restart services

### Option 2: Automated Deployment (Recommended)
- **GitHub Actions** or **GitLab CI/CD**
- **Deployer** (PHP deployment tool)
- **Envoyer** (Laravel-specific, paid)

## 📈 Scaling Considerations

### When to Scale Up
- CPU consistently > 70%
- RAM usage > 80%
- Database connections maxing out
- Slow response times

### Scaling Options
1. **Vertical Scaling**: Upgrade VPS specs (easiest)
2. **Horizontal Scaling**: Add more VPS instances + load balancer
3. **Database Scaling**: Separate database server
4. **CDN**: For static assets (Cloudflare, AWS CloudFront)

## ⚠️ Important Notes for Multi-Tenancy

1. **Database Management**
   - Each tenant = separate database
   - Monitor total database count
   - Consider database cleanup for deleted tenants
   - Regular backups for all tenant databases

2. **File Storage**
   - Each tenant has separate storage directory
   - Monitor disk usage per tenant
   - Consider S3/cloud storage for large files

3. **Queue Workers**
   - Run multiple queue workers for better throughput
   - Monitor queue length
   - Set up failed job handling

4. **Cache Management**
   - Redis with tenant-specific prefixes
   - Monitor cache memory usage
   - Set up cache eviction policies

## 🎯 Recommended VPS Setup for Your Startup

**Starting Point:**
- **Provider**: Hetzner or DigitalOcean
- **Specs**: 4GB RAM, 2 vCPU, 80GB SSD
- **Cost**: ~$12-20/month
- **OS**: Ubuntu 22.04 LTS

**Stack:**
- Nginx + PHP 8.2 FPM
- MySQL 8.0
- Redis
- Supervisor
- Node.js 18+

**This setup can handle:**
- 10-20 tenants comfortably
- 100-500 concurrent users
- Moderate file storage needs

## 📝 Next Steps

1. **Choose VPS Provider**: Based on your budget and location
2. **Set Up Server**: Follow the checklist above
3. **Deploy Application**: Configure environment and deploy
4. **Test Tenant Creation**: Verify multi-tenancy works
5. **Set Up Monitoring**: Monitor performance and errors
6. **Plan Backups**: Automated daily backups
7. **Documentation**: Document your deployment process

## 🔗 Useful Resources

- [Laravel Deployment Documentation](https://laravel.com/docs/deployment)
- [Stancl Tenancy Documentation](https://tenancyforlaravel.com/docs/v3/)
- [DigitalOcean Laravel Tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-laravel-with-lemp-on-ubuntu-22-04)
- [Nginx Configuration for Laravel](https://laravel.com/docs/deployment#nginx)

---

**Bottom Line**: VPS hosting is **perfectly suitable** for your multi-tenant Laravel application. Start with a mid-range VPS ($12-20/month) and scale up as you grow. The database-per-tenant architecture works excellently on VPS, and you'll have full control over your infrastructure.
