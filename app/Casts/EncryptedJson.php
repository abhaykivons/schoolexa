<?php

namespace App\Casts;

use App\Helpers\BaseHelper;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class EncryptedJson implements CastsAttributes
{
    /**
     * Decrypt and decode JSON from database
     */
    public function get($model, string $key, $value, array $attributes)
    {
        if (!$value) {
            return [];
        }

        // Decrypt the value
        $decrypted = BaseHelper::decrypt($value);
        
        // Decode JSON
        $decoded = json_decode($decrypted, true);
        
        return $decoded !== null ? $decoded : [];
    }

    /**
     * Encode to JSON and encrypt before storing
     */
    public function set($model, string $key, $value, array $attributes)
    {
        if (empty($value)) {
            return null;
        }

        // Encode to JSON
        $json = json_encode($value);
        
        // Encrypt the JSON string
        return BaseHelper::encrypt($json);
    }
}

