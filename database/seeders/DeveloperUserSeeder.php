<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DeveloperUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create developer user for developer portal
        $developer = User::firstOrCreate(
            ['email' => 'developer@schoolexa.com'],
            [
                'name' => 'Developer',
                'password' => Hash::make('password'),
                'type' => 'developer',
                'is_login' => true,
                'status' => true,
                'company_id' => null, // Developer users don't belong to a specific company
            ]
        );

        // Update if exists but wrong type
        if ($developer->type !== 'developer') {
            $developer->update([
                'type' => 'developer',
                'is_login' => true,
                'status' => true,
            ]);
        }

        $this->command->info('Developer user created/updated:');
        $this->command->info('Email: developer@schoolexa.com');
        $this->command->info('Password: password');
        $this->command->info('Type: developer');
    }
}
