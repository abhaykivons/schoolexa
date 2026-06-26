<?php

namespace App\Enum;

enum PortalType: string
{
    case DEVELOPER = 'developer';
    case IT_ADMIN = 'it_admin';
    case ADMIN = 'admin';
    case STAFF = 'staff';
    case PARENT = 'parent';
    case STUDENT = 'student';

    public function label(): string
    {
        return match($this) {
            self::DEVELOPER => 'Developer Portal',
            self::IT_ADMIN => 'IT Admin Portal',
            self::ADMIN => 'Admin Portal',
            self::STAFF => 'Staff Portal',
            self::PARENT => 'Parent Portal',
            self::STUDENT => 'Student Portal',
        };
    }

    public function description(): string
    {
        return match($this) {
            self::DEVELOPER => 'Monitor error logs, system status, downtime, and manage all tenants',
            self::IT_ADMIN => 'Manage all technical aspects of the school system with full access',
            self::ADMIN => 'View all reports and manage staff access (Dean/Principal/Admin)',
            self::STAFF => 'Role-based access panel for staff members',
            self::PARENT => 'Manage students, view reports, attendance, and health reports',
            self::STUDENT => 'View timetable, attendance, reports, and exam schedule',
        };
    }
}
