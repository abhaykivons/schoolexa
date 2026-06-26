<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EmailTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all companies or use a specific one
        $companies = Company::all();

        foreach ($companies as $company) {
            $this->seedTemplatesForCompany($company->id);
        }
    }

    /**
     * Seed default templates for a specific company
     */
    public function seedTemplatesForCompany(int $companyId): void
    {
        $eventTypes = EmailTemplate::getEventTypes();

        foreach ($eventTypes as $eventType => $info) {
            // Check if template already exists for this company
            $exists = EmailTemplate::withoutGlobalScopes()
                ->where('company_id', $companyId)
                ->where('event_type', $eventType)
                ->exists();

            if (!$exists) {
                $defaultContent = EmailTemplate::getDefaultTemplate($eventType);

                if ($defaultContent) {
                    EmailTemplate::withoutGlobalScopes()->create([
                        'company_id' => $companyId,
                        'name' => $info['label'],
                        'slug' => Str::slug($info['label']) . '-' . $companyId . '-' . Str::random(4),
                        'description' => $info['description'],
                        'category' => $info['category'],
                        'event_type' => $eventType,
                        'subject' => $defaultContent['subject'],
                        'body' => $defaultContent['body'],
                        'available_variables' => $info['variables'],
                        'is_active' => true,
                        'is_default' => true,
                    ]);
                }
            }
        }
    }

    /**
     * Create a specific template
     */
    public static function createTemplate(
        int $companyId,
        string $eventType,
        ?string $customName = null,
        ?string $customSubject = null,
        ?string $customBody = null
    ): ?EmailTemplate {
        $eventTypes = EmailTemplate::getEventTypes();
        
        if (!isset($eventTypes[$eventType])) {
            return null;
        }

        $info = $eventTypes[$eventType];
        $defaultContent = EmailTemplate::getDefaultTemplate($eventType);

        return EmailTemplate::withoutGlobalScopes()->create([
            'company_id' => $companyId,
            'name' => $customName ?? $info['label'],
            'slug' => Str::slug($customName ?? $info['label']) . '-' . $companyId . '-' . Str::random(4),
            'description' => $info['description'],
            'category' => $info['category'],
            'event_type' => $eventType,
            'subject' => $customSubject ?? $defaultContent['subject'] ?? '',
            'body' => $customBody ?? $defaultContent['body'] ?? '',
            'available_variables' => $info['variables'],
            'is_active' => true,
            'is_default' => false,
        ]);
    }
}

