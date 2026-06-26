<?php

namespace App\Helpers;

class AdmissionFormHelper
{
    /**
     * Map form slugs to form types
     */
    public static function getFormTypeFromSlug(string $slug): ?string
    {
        $mapping = [
            'pre-enrollment-form' => 'pre_enrollment',
            'health-summary-form' => 'health_summary',
            'online-permissions-form' => 'online_services',
            'document-checklist-form' => 'enrollment_document',
            'emergency-contacts-form' => 'emergency_contact',
            'transportation-form' => 'transportation',
            'dietary-requirements-form' => 'dietary_requirements',
            'extracurricular-form' => 'extracurricular',
        ];

        return $mapping[$slug] ?? null;
    }

    /**
     * Map form IDs to form types (for backward compatibility)
     */
    public static function getFormTypeFromId(int $formId): ?string
    {
        $mapping = [
            1 => 'pre_enrollment',
            2 => 'health_summary',
            3 => 'online_services',
            4 => 'enrollment_document',
            5 => 'emergency_contact',
            6 => 'transportation',
            7 => 'dietary_requirements',
            8 => 'extracurricular',
        ];

        return $mapping[$formId] ?? null;
    }

    /**
     * Normalize form data for storage
     */
    public static function normalizeFormData(array $data): array
    {
        $normalized = [];

        foreach ($data as $key => $value) {
            // Skip system fields
            if (in_array($key, ['_token', '_method', 'form_id'])) {
                continue;
            }

            // Convert boolean to string for consistency
            if (is_bool($value)) {
                $normalized[$key] = $value ? '1' : '0';
            }
            // Handle arrays (like medications)
            elseif (is_array($value)) {
                $normalized[$key] = $value;
            }
            // Handle null values
            elseif (is_null($value)) {
                $normalized[$key] = '';
            }
            // All other values as strings
            else {
                $normalized[$key] = (string) $value;
            }
        }

        return $normalized;
    }

    /**
     * Convert stored data back to form values
     * Handles all boolean fields from all forms
     */
    public static function denormalizeFormData(array $data): array
    {
        $denormalized = [];

        // All possible boolean/checkbox field names across all forms
        $booleanFields = [
            // Health Summary
            'has_chronic_illnesses', 'has_hospitalizations', 'has_surgeries',
            'has_physical_limitations', 'immunization_up_to_date',
            'has_drug_allergies', 'has_food_allergies', 'has_environmental_allergies',
            'has_insect_allergies', 'takes_regular_medications', 'uses_emergency_meds',
            'consent_medical_treatment', 'consent_share_info',
            // Pre-Enrollment
            'military_parent_active_duty', 'has_special_needs', 'has_iep', 'has_504_plan',
            'receives_special_services', 'has_medical_conditions',
            // Online Services
            'consent_photo_video', 'consent_directory', 'consent_technology',
            'consent_social_media', 'consent_third_party',
            // Emergency Contact
            'is_primary_contact', 'can_pickup', 'is_emergency_contact',
            // Transportation
            'needs_transportation', 'has_bus_service', 'needs_special_accommodations',
            // Dietary
            'has_food_allergies_dietary', 'has_dietary_restrictions', 'needs_special_meals',
            // Extracurricular
            'interested_sports', 'interested_arts', 'interested_clubs',
        ];

        foreach ($data as $key => $value) {
            // Convert "1"/"0" strings back to boolean for checkbox fields
            if (in_array($key, $booleanFields) || 
                str_ends_with($key, '_consent') || 
                str_ends_with($key, '_agreement') ||
                str_starts_with($key, 'has_') ||
                str_starts_with($key, 'is_') ||
                str_starts_with($key, 'needs_') ||
                str_starts_with($key, 'interested_') ||
                str_starts_with($key, 'can_') ||
                str_starts_with($key, 'receives_')) {
                $denormalized[$key] = ($value === '1' || $value === 1 || $value === true || $value === 'true');
            }
            // Keep arrays as-is (medications, documents, etc.)
            elseif (is_array($value)) {
                $denormalized[$key] = $value;
            }
            // Keep strings as-is
            else {
                $denormalized[$key] = $value;
            }
        }

        return $denormalized;
    }
}

