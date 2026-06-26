<?php

namespace App\Casts;

use App\Helpers\BaseHelper;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

class EncryptedEmail implements CastsAttributes
{
    public function get(Model $model, string $key, mixed $value, array $attributes): mixed
    {
        return $value ? BaseHelper::customCrypt($value, 'd') : null;
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): mixed
    {
        return $value ? BaseHelper::customCrypt($value, 'e') : null;
    }
}