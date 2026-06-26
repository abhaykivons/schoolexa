# SchoolExa - Multi-Tenant School Management System

A comprehensive school management system built with Laravel and React, supporting multiple tenants, portals, and a flexible module system.

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd schoolexa-migration
   ```

2. **Install dependencies**
   ```bash
   composer install
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Run migrations**
   ```bash
   php artisan migrate
   php artisan db:seed --class=ModuleSeeder
   ```

5. **Start development server**
   ```bash
   npm run dev
   php artisan serve
   ```

## Documentation

📖 **For complete setup instructions, architecture details, and developer documentation, see [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)**

The Developer Guide includes:
- Complete installation steps
- Architecture overview
- Portal system documentation
- Module system guide
- Feature-specific guides
- Debugging and troubleshooting
- Best practices

## Key Features

- ✅ Multi-tenant architecture with isolated databases
- ✅ Six portal types (Developer, IT Admin, Admin, Staff, Parent, Student)
- ✅ Flexible module system with versioning
- ✅ Role-based access control
- ✅ Support ticket system
- ✅ Leads management
- ✅ Comprehensive error logging

## Technology Stack

- **Backend**: Laravel 12, PHP 8.2+
- **Frontend**: React 19, TypeScript, Tailwind CSS, Inertia.js
- **Database**: MySQL/PostgreSQL (SQLite for development)
- **Multi-Tenancy**: Stancl Tenancy Package
- **Permissions**: Spatie Laravel Permission

## Project Structure

```
├── app/
│   ├── Http/Controllers/    # Controllers organized by portal/feature
│   ├── Models/               # Eloquent models
│   ├── Services/             # Business logic services
│   └── ...
├── database/
│   ├── migrations/           # Central database migrations
│   └── migrations/tenant/    # Tenant database migrations
├── resources/
│   ├── js/                   # React/TypeScript frontend
│   └── views/                # Blade templates
└── routes/                   # Route definitions by portal
```

## Development

### Running Tests
```bash
php artisan test
```

### Code Style
```bash
# PHP
./vendor/bin/pint

# JavaScript/TypeScript
npm run lint
npm run format
```

### Building for Production
```bash
npm run build
php artisan optimize
```

## Support

- 📖 See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for detailed documentation
- 🐛 Report issues via support tickets in the Developer Portal
- 💬 Contact the development team

## License

[Your License Here]

---

**Version**: 1.0.0  
**Last Updated**: 2024
