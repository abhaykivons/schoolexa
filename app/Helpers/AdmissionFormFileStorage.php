<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;
use App\Helpers\BaseHelper;

/**
 * Alternative file-based storage for admission forms
 * Stores encrypted JSON files in storage/app/province/admission_forms/
 */
class AdmissionFormFileStorage
{
    private const STORAGE_PATH = 'province/admission_forms';

    /**
     * Get file path for a form
     */
    private static function getFilePath(int $studentId, int $formId, string $type = 'latest'): string
    {
        return self::STORAGE_PATH . "/student_{$studentId}/form_{$formId}_{$type}.json";
    }

    /**
     * Store form data (encrypted) to file
     */
    public static function store(int $studentId, int $formId, array $data, string $type = 'latest'): bool
    {
        try {
            $filePath = self::getFilePath($studentId, $formId, $type);
            
            // Encode to JSON
            $json = json_encode($data);
            
            // Encrypt the JSON
            $encrypted = BaseHelper::encrypt($json);
            
            // Store encrypted data in file
            return Storage::disk('local')->put($filePath, $encrypted);
        } catch (\Exception $e) {
            \Log::error("Failed to store admission form file: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Retrieve form data (decrypted) from file
     */
    public static function retrieve(int $studentId, int $formId, string $type = 'latest'): ?array
    {
        try {
            $filePath = self::getFilePath($studentId, $formId, $type);
            
            if (!Storage::disk('local')->exists($filePath)) {
                return null;
            }
            
            // Read encrypted data
            $encrypted = Storage::disk('local')->get($filePath);
            
            // Decrypt
            $decrypted = BaseHelper::decrypt($encrypted);
            
            // Decode JSON
            $data = json_decode($decrypted, true);
            
            return $data !== null ? $data : [];
        } catch (\Exception $e) {
            \Log::error("Failed to retrieve admission form file: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete form data file
     */
    public static function delete(int $studentId, int $formId, string $type = 'latest'): bool
    {
        try {
            $filePath = self::getFilePath($studentId, $formId, $type);
            return Storage::disk('local')->delete($filePath);
        } catch (\Exception $e) {
            \Log::error("Failed to delete admission form file: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if file exists
     */
    public static function exists(int $studentId, int $formId, string $type = 'latest'): bool
    {
        $filePath = self::getFilePath($studentId, $formId, $type);
        return Storage::disk('local')->exists($filePath);
    }
}

