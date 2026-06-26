<?php

namespace App\Casts;

use App\Helpers\BaseHelper;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class EncryptedString implements CastsAttributes
{
    public function get($model, string $key, $value, array $attributes)
    {
        return $value ? BaseHelper::decrypt($value) : null;
    }

    public function set($model, string $key, $value, array $attributes)
    {
        return $value ? BaseHelper::encrypt($value) : null;
    }
}
