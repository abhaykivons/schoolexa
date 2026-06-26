<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\ModuleVersion;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Core Modules
        $coreModules = [
            [
                'name' => 'Student Management',
                'code' => 'student_management',
                'description' => 'Core module for managing student information, enrollment, and records.',
                'category' => 'core',
                'is_core' => true,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Staff Management',
                'code' => 'staff_management',
                'description' => 'Core module for managing staff information and enrollment.',
                'category' => 'core',
                'is_core' => true,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Attendance',
                'code' => 'attendance',
                'description' => 'Track student and staff attendance.',
                'category' => 'academic',
                'is_core' => true,
                'is_active' => true,
                'sort_order' => 3,
                'dependencies' => ['student_management'],
            ],
            [
                'name' => 'Academic Calendar',
                'code' => 'academic_calendar',
                'description' => 'Manage academic calendar, events, and holidays.',
                'category' => 'academic',
                'is_core' => true,
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'Notification System',
                'code' => 'notification_system',
                'description' => 'Send notifications via email, SMS, and in-app.',
                'category' => 'communication',
                'is_core' => true,
                'is_active' => true,
                'sort_order' => 5,
            ],
        ];

        foreach ($coreModules as $moduleData) {
            $module = Module::updateOrCreate(
                ['code' => $moduleData['code']],
                $moduleData
            );

            // Create initial version for each module
            ModuleVersion::updateOrCreate(
                [
                    'module_id' => $module->id,
                    'version' => '1.0.0',
                ],
                [
                    'release_name' => 'Initial Release',
                    'changelog' => 'Initial release of ' . $module->name,
                    'is_stable' => true,
                    'is_active' => true,
                    'released_at' => now(),
                ]
            );
        }

        // Optional Modules
        $optionalModules = [
            [
                'name' => 'Fee Management',
                'code' => 'fee_management',
                'description' => 'Manage student fees, payments, and invoices.',
                'category' => 'financial',
                'is_core' => false,
                'is_active' => true,
                'sort_order' => 10,
                'dependencies' => ['student_management'],
            ],
            [
                'name' => 'Exam Management',
                'code' => 'exam_management',
                'description' => 'Create and manage exams, schedules, and results.',
                'category' => 'academic',
                'is_core' => false,
                'is_active' => true,
                'sort_order' => 11,
                'dependencies' => ['student_management', 'attendance'],
            ],
            [
                'name' => 'Library Management',
                'code' => 'library_management',
                'description' => 'Manage library books, borrowing, and returns.',
                'category' => 'academic',
                'is_core' => false,
                'is_active' => true,
                'sort_order' => 12,
            ],
            [
                'name' => 'Transport Management',
                'code' => 'transport_management',
                'description' => 'Manage school transport routes and vehicles.',
                'category' => 'logistics',
                'is_core' => false,
                'is_active' => true,
                'sort_order' => 13,
            ],
        ];

        foreach ($optionalModules as $moduleData) {
            $module = Module::updateOrCreate(
                ['code' => $moduleData['code']],
                $moduleData
            );

            // Create initial version for each module
            ModuleVersion::updateOrCreate(
                [
                    'module_id' => $module->id,
                    'version' => '1.0.0',
                ],
                [
                    'release_name' => 'Initial Release',
                    'changelog' => 'Initial release of ' . $module->name,
                    'is_stable' => true,
                    'is_active' => true,
                    'released_at' => now(),
                ]
            );
        }
    }
}
