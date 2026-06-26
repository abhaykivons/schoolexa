<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentAdmissionForm extends Model
{
    protected $fillable = [
        'name',
        'description',
        'slug',
        'duration',
        'priority',
        'required',
        'is_active',
    ];
}
