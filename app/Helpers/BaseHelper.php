<?php

namespace App\Helpers;

class BaseHelper
{
    public static function encrypt(string $plaintext): string
    {
        if (ctype_xdigit($plaintext) && strlen($plaintext) > 32) {
            return $plaintext;
        }

        // Fail closed: never silently store data under an empty/missing key.
        $rawKey = self::getEncryptionKey();
        if ($rawKey === null || $rawKey === '') {
            throw new \RuntimeException('Encryption key is unavailable; refusing to store data unencrypted. Provision the key file referenced by config(app.encryption_master_key).');
        }

        $key = hex2bin($rawKey);
        $iv = random_bytes(16);

        $ciphertext = openssl_encrypt($plaintext, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);

        return bin2hex($iv . $ciphertext);
    }


    public static function decrypt(?string $encryptedHex): ?string
    {
        if (!$encryptedHex || !ctype_xdigit($encryptedHex)) {
            return $encryptedHex;
        }

        $key = hex2bin(self::getEncryptionKey());

        $data = hex2bin($encryptedHex);
        if ($data === false || strlen($data) < 17) {
            return $encryptedHex;
        }

        $iv = substr($data, 0, 16);
        $ciphertext = substr($data, 16);

        $decrypted = openssl_decrypt($ciphertext, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);

        return $decrypted !== false ? $decrypted : $encryptedHex;
    }


    public static function generateKey(): string
    {
        return bin2hex(random_bytes(32));
    }

    public static function getEncryptionKey(): ?string
    {
        $masterKey = config('app.encryption_master_key');
        $path = storage_path(base64_decode($masterKey));
        if (!file_exists($path)) {
            return null;
        }
        return trim(file_get_contents($path));
    }

    public static function storeEncryptionKey(string $key): void
    {
        $masterKey = config('app.encryption_master_key');
        $path = storage_path(base64_decode($masterKey));
        file_put_contents($path, $key);
        chmod($path, 0600);
    }

    public static function customCrypt($string, $action = 'e')
    {
        // Keys are sourced from config/env so they can be rotated without code
        // changes. Defaults preserve backward compatibility with data encrypted
        // under the original keys; set EMAIL_CRYPT_KEY / EMAIL_CRYPT_IV in the
        // environment and re-encrypt to rotate (docs/runbooks/key-rotation.md).
        $secret_key = config('app.email_crypt_key');
        $secret_iv  = config('app.email_crypt_iv');

        $encrypt_method = "AES-256-CBC";
        $key = hash('sha256', $secret_key);
        $iv  = substr(hash('sha256', $secret_iv), 0, 16);

        if ($action === 'e') {
            return base64_encode(
                openssl_encrypt($string, $encrypt_method, $key, 0, $iv)
            );
        }

        if ($action === 'd') {
            return openssl_decrypt(
                base64_decode($string), $encrypt_method, $key, 0, $iv
            );
        }

        return null;
    }

    public static function StudentAdmissionForms(): array
    {
        return [
            [
                'name' => "Pre-Enrollment Form",
                'slug' => "pre-enrollment-form",
                'description' => "Basic student information and family details required for initial enrollment",
                'duration' => "10-15 minutes",
                'priority' => "high",
                'required' => true,
                'is_active' => true,
            ],
            [
                'name' => "Student Health Care Summary",
                'slug' => "health-summary-form",
                'description' => "Medical history, allergies, medications, and emergency medical information",
                'required' => true,
                'duration' => "15-20 minutes",
                'priority' => "high",
                'is_active' => true,
            ],
            [
                'name' => "Online Services Permissions",
                'slug' => "online-permissions-form",
                'description' => "Digital learning platforms, photo/video consent, and technology usage permissions",
                'required' => true,
                'duration' => "5-10 minutes",
                'priority' => "medium",
                'is_active' => true,
            ],
            [
                'name' => "Enrollment Document Checklist",
                'slug' => "document-checklist-form",
                'description' => "Upload required documents birth certificate, immunization records, previous transcripts",
                'required' => true,
                'duration' => "10-15 minutes",
                'priority' => "high",
                'is_active' => true,
            ],
            [
                'name' => "Emergency Contact Information",
                'slug' => "emergency-contacts-form",
                'description' => "Authorized pickup persons, emergency contacts, and family communication preferences",
                'required' => true,
                'duration' => "5-10 minutes",
                'priority' => "high",
                'is_active' => true,
            ],
            [
                'name' => "Transportation & Bus Services",
                'slug' => "transportation-form",
                'description' => "School transportation needs, bus route preferences, and pickup/dropoff details",
                'required' => true,
                'duration' => "5-10 minutes",
                'priority' => "low",
                'is_active' => true,
            ],
            [
                'name' => "Dietary Requirements & Allergies",
                'slug' => "dietary-requirements-form",
                'description' => "Food allergies, dietary restrictions, and school meal program enrollment",
                'required' => true,
                'duration' => "5-10 minutes",
                'priority' => "medium",
                'is_active' => true,
            ],
            [
                'name' => "Extracurricular Activities Interest",
                'slug' => "extracurricular-form",
                'description' => "Sports, clubs, music programs, and after-school activity preferences",
                'required' => true,
                'duration' => "5-10 minutes",
                'priority' => "low",
                'is_active' => true,
            ],
        ];
    }
}