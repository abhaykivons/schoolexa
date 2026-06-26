# Developer Guide - SchoolExa Multi-Tenant System

## Table of Contents

1. [Project Overview](#project-overview)
2. [Installation & Setup](#installation--setup)
3. [Architecture Overview](#architecture-overview)
4. [Portal System](#portal-system)
5. [Module System](#module-system)
6. [Developer Portal](#developer-portal)
7. [Feature Guides](#feature-guides)
8. [Common Tasks](#common-tasks)
9. [Debugging & Troubleshooting](#debugging--troubleshooting)
10. [Best Practices](#best-practices)

---

## Project Overview

SchoolExa is a comprehensive multi-tenant school management system built with Laravel and React (Inertia.js). It supports multiple setup types, portal types, and a flexible module system.

### Key Features

- **Multi-Tenancy**: Each school operates in its own isolated tenant database
- **Multiple Portals**: Developer, IT Admin, Admin, Staff, Parent, and Student portals
- **Module System**: Flexible, versioned modules that can be enabled/disabled per tenant
- **Multiple Setup Types**: Public Portal, Cloud Hosted, and Private Setup
- **Role-Based Access**: Comprehensive permission system using Spatie Laravel Permission

### Technology Stack

- **Backend**: Laravel 12, PHP 8.2+
- **Frontend**: React 19, TypeScript, Tailwind CSS, Inertia.js
- **Database**: MySQL/PostgreSQL (with SQLite for development)
- **Multi-Tenancy**: Stancl Tenancy Package
- **Permissions**: Spatie Laravel Permission

---

## Installation & Setup

### Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- MySQL/PostgreSQL or SQLite for development
- Git

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd schoolexa-migration
```

### Step 2: Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

### Step 3: Environment Configuration

Copy the `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
APP_NAME="SchoolExa"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database Configuration
DB_CONNECTION=sqlite
DB_DATABASE=/path/to/database/database.sqlite

# Or use MySQL/PostgreSQL
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=schoolexa
# DB_USERNAME=root
# DB_PASSWORD=

# Central Domain Configuration
CENTRAL_DOMAIN=schoolexa.com
# For local development, use:
# CENTRAL_DOMAIN=localhost

# Tenancy Configuration
TENANCY_DATABASE_CONNECTION=mysql
TENANCY_DATABASE_HOST=127.0.0.1
TENANCY_DATABASE_PORT=3306
TENANCY_DATABASE_USERNAME=root
TENANCY_DATABASE_PASSWORD=
```

### Step 4: Generate Application Key

```bash
php artisan key:generate
```

### Step 5: Run Migrations

```bash
# Run central database migrations
php artisan migrate

# This creates:
# - users, companies, tenants, domains tables
# - modules, module_versions, tenant_modules tables
# - campuses table
# - support_tickets, support_ticket_replies tables
# - downtimes table
# - And other core tables
```

### Step 6: Seed Initial Data

```bash
# Seed modules
php artisan db:seed --class=ModuleSeeder

# Seed other initial data (if available)
php artisan db:seed
```

### Step 7: Create Developer User

Create a developer user to access the developer portal:

```bash
php artisan tinker
```

```php
use App\Models\User;
use Illuminate\Support\Facades\Hash;

User::create([
    'name' => 'Developer Name',
    'email' => 'developer@example.com',
    'password' => Hash::make('password'),
    'type' => 'developer',
    'portal_type' => 'developer',
    'is_login' => true,
    'status' => true,
]);
```

### Step 8: Build Frontend Assets

```bash
# Development
npm run dev

# Production
npm run build
```

### Step 9: Start Development Server

```bash
# Using Laravel's built-in server
php artisan serve

# Or use the dev script (runs server, queue, and vite)
composer run dev
```

### Step 10: Access the Application

- **Central Domain**: `http://localhost:8000` (for developer portal)
- **Tenant Domain**: `http://{tenant-name}.localhost:8000` (for school portals)

---

## Architecture Overview

### Multi-Tenancy Architecture

The system uses **Stancl Tenancy** package for multi-tenancy:

- **Central Database**: Stores tenants, users, modules, and global data
- **Tenant Databases**: Each tenant (school) has its own isolated database
- **Domain-Based Routing**: Tenants are identified by subdomain

### Setup Types

#### 1. Public Portal (`public_portal`)
- Multi-tenant setup
- Single database per tenant
- Shared infrastructure
- Best for: Schools wanting easy setup

#### 2. Cloud Hosted (`cloud_hosted`)
- Single campus per school
- Cloud-hosted infrastructure
- Managed by platform
- Best for: Single-campus schools

#### 3. Private Setup (`private_setup`)
- Fully customizable
- Multiple campuses support
- Self-hosted or dedicated infrastructure
- Best for: Large schools needing full control

### Database Structure

```
Central Database:
├── tenants (tenant definitions)
├── domains (tenant domains)
├── users (central users)
├── companies (school companies)
├── modules (module definitions)
├── module_versions (module versions)
├── tenant_modules (tenant-module relationships)
├── campuses (campus information)
├── support_tickets (support tickets)
├── downtimes (system downtime tracking)
└── ...

Tenant Database (per school):
├── users (school users)
├── students
├── staff
├── classes
├── grades
├── subjects
├── enrollments
├── admission_forms
└── ... (all school-specific data)
```

---

## Portal System

### Portal Types

#### 1. Developer Portal (`developer`)
- **Access**: Central domain only (`schoolexa.com`)
- **URL**: `/developer`
- **Middleware**: `developer`
- **Purpose**: System administration, tenant management, error monitoring
- **Features**:
  - Tenant management (CRUD)
  - Module management
  - Error log monitoring
  - System status monitoring
  - Downtime management
  - Support ticket management
  - Leads management

#### 2. IT Admin Portal (`it_admin`)
- **Access**: Tenant domain (`school.schoolexa.com`)
- **URL**: `/it-admin`
- **Middleware**: `it_admin`
- **Purpose**: Technical administration for school IT team
- **Features**:
  - System configuration
  - User management
  - Technical settings
  - Module configuration

#### 3. Admin Portal (`admin`)
- **Access**: Tenant domain
- **URL**: `/admin`
- **Middleware**: `portal:admin`
- **Purpose**: Administrative access (Dean/Principal/Admin)
- **Features**:
  - View all reports
  - Manage staff access
  - Administrative oversight
  - Staff role management

#### 4. Staff Portal (`staff`)
- **Access**: Tenant domain
- **URL**: `/staff`
- **Middleware**: `portal:staff`
- **Purpose**: Role-based access for staff
- **Features**:
  - Access based on assigned roles
  - Limited to assigned modules/permissions
  - Staff-specific features

#### 5. Parent Portal (`parent`)
- **Access**: Tenant domain
- **URL**: `/parent`
- **Middleware**: `portal:parent`
- **Purpose**: Parent access to manage students
- **Features**:
  - View student reports
  - View attendance
  - Manage student information
  - Admission forms

#### 6. Student Portal (`student`)
- **Access**: Tenant domain
- **URL**: `/student`
- **Middleware**: `portal:student`
- **Purpose**: Student self-service portal
- **Features**:
  - View timetable
  - View attendance
  - View reports
  - View exam schedule

### Portal Access Control

#### Middleware

```php
// Developer Portal (central domain only)
Route::middleware(['auth', 'developer'])->group(function () {
    // Developer routes
});

// IT Admin Portal
Route::middleware(['auth', 'it_admin'])->group(function () {
    // IT Admin routes
});

// Other Portals
Route::middleware(['auth', 'portal:admin'])->group(function () {
    // Admin routes
});
```

#### User Portal Type

Users have a `portal_type` field that determines their access:

```php
$user = User::create([
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'portal_type' => 'admin', // developer, it_admin, admin, staff, parent, student
    'company_id' => $companyId,
]);
```

#### Portal Access Methods

```php
// Check portal access
$user->hasPortalAccess('admin'); // true/false

// Check specific portal type
$user->isAdmin(); // true/false
$user->isStaff(); // true/false
$user->isDeveloper(); // true/false
```

---

## Module System

### Module Structure

Each module consists of:
- **Module**: Base module definition
- **Module Versions**: Different versions of the module
- **Tenant Modules**: Tenant-specific module configuration

### Module Lifecycle

1. **Module Creation**: Developer creates a module with initial version
2. **Version Release**: New versions are released with changelog
3. **Tenant Installation**: Tenants can enable/disable modules
4. **Version Update**: Tenants can choose to update to new versions
5. **Customization**: Tenants can customize module configuration

### Creating a Module

```php
use App\Models\Module;
use App\Models\ModuleVersion;

// Step 1: Create module
$module = Module::create([
    'name' => 'Library Management',
    'code' => 'library_management',
    'description' => 'Manage library books and borrowing',
    'category' => 'academic',
    'is_core' => false,
    'dependencies' => ['student_management'], // Optional
]);

// Step 2: Create version
ModuleVersion::create([
    'module_id' => $module->id,
    'version' => '1.0.0',
    'release_name' => 'Initial Release',
    'changelog' => 'First version of Library Management',
    'is_stable' => true,
    'released_at' => now(),
]);
```

### Managing Modules for Tenants

```php
use App\Services\ModuleService;

$moduleService = app(ModuleService::class);

// Enable module for tenant
$moduleService->enableModuleForTenant($tenantId, $moduleId);

// Disable module for tenant
$moduleService->disableModuleForTenant($tenantId, $moduleId);

// Update module version
$moduleService->updateModuleVersion($tenantId, $moduleId, $newVersionId);

// Check available updates
$updates = $moduleService->getAvailableUpdates($tenantId);
```

### Module Dependencies

- Modules can depend on other modules
- When enabling a module, dependencies are checked
- Cannot disable a module if other enabled modules depend on it
- Core modules cannot be disabled

### Module Versioning

- Each module can have multiple versions
- Versions follow semantic versioning (e.g., 1.0.0, 2.1.3)
- Tenants can:
  - Stay on current version
  - Update to latest version
  - Enable auto-update for automatic updates

---

## Developer Portal

### Setup

The Developer Portal is accessible only from the central domain and requires:

1. **User with `type = 'developer'`**
2. **Central domain access** (configured in `.env`)

### Features

#### 1. Dashboard (`/developer`)
- System statistics
- Recent tenants
- Recent errors
- Quick actions

#### 2. Tenant Management (`/developer/tenants`)
- List all tenants
- Create new tenant
- Edit tenant details
- Delete tenant
- View tenant modules

#### 3. Error Logs (`/developer/logs`)
- View Laravel error logs
- Filter by level, tenant, date
- View log details

#### 4. Downtime Management (`/developer/downtime`)
- Track system downtime incidents
- Create downtime records
- Update downtime status

#### 5. Support Tickets (`/developer/support`)
- View all tickets from all tenants
- Update ticket status
- Reply to tickets
- Add internal notes

#### 6. Leads Management (`/developer/leads`)
- View all leads
- Filter by type, status, date
- Update lead status
- Bulk operations
- Export to CSV

### Routes

All developer routes are in `routes/developer.php`:

```php
Route::prefix('developer')->name('developer.')->middleware(['auth', 'developer'])->group(function () {
    Route::get('/', [DashboardController::class, 'index']);
    Route::resource('tenants', TenantController::class);
    Route::resource('logs', ErrorLogController::class);
    Route::resource('downtime', DowntimeController::class);
    Route::resource('support', SupportController::class);
    Route::resource('leads', LeadController::class);
});
```

---

## Feature Guides

### Leads Management

**Location**: Developer Portal only (`/developer/leads`)

#### Lead Types
- `waitlist` - Waitlist signup
- `demo` - Demo request
- `free_trial` - Free trial signup
- `contact_sales` - Contact sales inquiry
- `partner` - Partner application
- `contact` - General contact form

#### Lead Status Flow
```
new → contacted → qualified → converted
                          ↓
                        lost
```

#### Public Lead Creation Routes
Public routes (no authentication required):
- `/leads/waitlist` - Waitlist signup
- `/leads/demo` - Demo request
- `/leads/contact-sales` - Contact sales
- `/leads/free-trial` - Free trial signup
- `/leads/partner` - Partner application
- `/leads/contact` - General contact

#### Usage Examples

```php
// View all leads
GET /developer/leads

// Filter leads
GET /developer/leads?type=demo&status=new&date_from=2024-01-01

// Update lead status
PATCH /developer/leads/{id}/status
{
    "status": "contacted"
}

// Bulk update status
POST /developer/leads/bulk-update-status
{
    "lead_ids": [1, 2, 3],
    "status": "qualified"
}

// Export leads
GET /developer/leads/export?type=demo&status=new
```

### Support Ticket System

**Location**: School Portal (`/support/tickets`)

#### Ticket Types
- `bug` - Bug Report 🐛
- `feature_request` - Feature Request 💡
- `error_report` - Error Report ⚠️
- `question` - Question ❓
- `other` - Other 📄

#### Priority Levels
- `low` 🟢 - General inquiry
- `medium` 🟡 - Standard request
- `high` 🟠 - Important issue
- `urgent` 🔴 - Critical issue

#### Ticket Status Flow
```
open → in_progress → resolved → closed
```

#### User Flow

1. **Creating a Ticket**:
   - Navigate to Support menu → Raise Ticket
   - Fill out form (type, subject, description, priority)
   - Submit ticket

2. **Viewing Tickets**:
   - Navigate to Support menu → My Tickets
   - Filter by status, type, priority
   - View ticket details

3. **Replying to Tickets**:
   - Open ticket
   - Add reply
   - Ticket reopens if closed/resolved

#### Developer Portal Integration

Tickets are visible in Developer Portal (`/developer/support`):
- View all tickets from all tenants
- Update status and priority
- Add replies (internal or external)
- Add internal notes

---

## Common Tasks

### Creating a Tenant

```php
use App\Models\Tenant;
use Stancl\Tenancy\Database\Models\Domain;

// Create tenant
$tenant = Tenant::create([
    'name' => 'school-name',
    'setup_type' => 'public_portal', // or 'cloud_hosted' or 'private_setup'
    'allows_multiple_campuses' => false,
]);

// Create domain
$tenant->domains()->create([
    'domain' => 'school-name.schoolexa.com',
]);

// Initialize tenancy
tenancy()->initialize($tenant);

// Run tenant migrations
Artisan::call('migrate', [
    '--path' => 'database/migrations/tenant',
    '--force' => true,
]);

// Seed tenant database
Artisan::call('db:seed', [
    '--class' => 'TenantDatabaseSeeder',
    '--force' => true,
]);

// End tenancy
tenancy()->end();
```

### Creating a User

```php
use App\Models\User;
use Illuminate\Support\Facades\Hash;

$user = User::create([
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'password' => Hash::make('password'),
    'portal_type' => 'admin', // developer, it_admin, admin, staff, parent, student
    'company_id' => $companyId,
    'status' => true,
]);
```

### Enabling Modules for Tenant

```php
use App\Services\ModuleService;

$moduleService = app(ModuleService::class);
$moduleService->enableModuleForTenant($tenantId, $moduleId);
```

### Getting Portal Configuration

```php
use App\Services\PortalService;

$portalService = app(PortalService::class);
$config = $portalService->getPortalConfig($user);
```

### Testing Portal Access

```php
$user = User::find(1);
$user->hasPortalAccess('admin'); // true/false
$user->isAdmin(); // true/false
```

---

## Debugging & Troubleshooting

### Debugging Central Domain Access

If you're having issues accessing the developer portal:

1. **Check `.env` file**:
   ```env
   CENTRAL_DOMAIN=your-domain.com
   ```
   Make sure there are no spaces or quotes.

2. **Clear config cache**:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

3. **Check what domain Laravel sees**:
   Add this temporary route to `routes/web.php`:
   ```php
   Route::get('/debug-domain', function (Request $request) {
       return [
           'current_host' => $request->getHost(),
           'current_host_without_port' => explode(':', $request->getHost())[0],
           'central_domains_config' => config('tenancy.central_domains'),
           'tenant_initialized' => tenant() ? 'yes' : 'no',
           'env_central_domain' => env('CENTRAL_DOMAIN'),
       ];
   });
   ```

4. **Common Issues**:
   - If using `localhost:8000`, make sure `localhost` is in `central_domains`
   - If using `127.0.0.1:8000`, make sure `127.0.0.1` is in `central_domains`
   - Port numbers are automatically stripped

5. **Remove debug route** after debugging for security.

### Common Issues

#### Module Not Enabling
- Check if dependencies are met
- Verify module is active
- Check tenant permissions

#### Portal Access Denied
- Verify user `portal_type`
- Check middleware configuration
- Verify user is authenticated
- Check if accessing from correct domain

#### Version Update Failed
- Check if version exists
- Verify version belongs to module
- Check tenant permissions

#### Tenant Not Initializing
- Check database connection
- Verify tenant exists
- Check domain configuration
- Review error logs

### Error Logs

Error logs are stored in `storage/logs/laravel.log`. View them via:
- Developer Portal: `/developer/logs`
- Or directly: `tail -f storage/logs/laravel.log`

---

## Best Practices

### Code Organization

1. **Controllers**: Organize by portal type
   ```
   app/Http/Controllers/
   ├── Developer/
   ├── Admission/
   ├── StaffEnrollment/
   └── Settings/
   ```

2. **Models**: Use CompanyScope for tenant isolation
   ```php
   protected static function booted()
   {
       static::addGlobalScope(new CompanyScope);
   }
   ```

3. **Routes**: Separate by portal type
   ```
   routes/
   ├── developer.php
   ├── admin.php
   ├── staff.php
   ├── parents.php
   └── student.php
   ```

### Security

1. **Always validate input**:
   ```php
   $request->validate([
       'field' => 'required|string|max:255',
   ]);
   ```

2. **Use authorization checks**:
   ```php
   if (!$user->hasPortalAccess('admin')) {
       abort(403);
   }
   ```

3. **Protect against SQL injection**:
   - Use Eloquent ORM
   - Use parameterized queries for raw SQL
   - Escape user input in LIKE queries

4. **Protect against XSS**:
   - Use Laravel's `e()` helper
   - Use Blade's `{{ }}` syntax (auto-escaped)

### Database Transactions

Always use transactions for multi-step operations:

```php
DB::beginTransaction();
try {
    // Multiple database operations
    DB::commit();
} catch (\Exception $e) {
    DB::rollBack();
    // Handle error
}
```

### Error Handling

1. **Log errors properly**:
   ```php
   Log::error('Operation failed', [
       'user_id' => $user->id,
       'error' => $e->getMessage(),
   ]);
   ```

2. **Handle exceptions gracefully**:
   ```php
   try {
       // Operation
   } catch (\Exception $e) {
       Log::warning('Operation failed', ['error' => $e->getMessage()]);
       // Fallback or user-friendly message
   }
   ```

### Testing

1. **Write tests for critical features**
2. **Test portal access controls**
3. **Test module dependencies**
4. **Test tenant isolation**

### Performance

1. **Use eager loading**:
   ```php
   $users = User::with('company')->get();
   ```

2. **Cache expensive operations**:
   ```php
   Cache::remember('key', 3600, function () {
       return expensiveOperation();
   });
   ```

3. **Use database indexes** for frequently queried columns

---

## Additional Resources

- **Laravel Documentation**: https://laravel.com/docs
- **Stancl Tenancy**: https://tenancyforlaravel.com/docs
- **Inertia.js**: https://inertiajs.com
- **React Documentation**: https://react.dev

---

## Support

For issues or questions:
1. Check error logs: `/developer/logs`
2. Create a support ticket: `/support/tickets/create`
3. Contact the development team

---

**Last Updated**: 2024
**Version**: 1.0.0
