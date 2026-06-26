<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'school_name',
        'school_size',
        'company_name',
        'company_website',
        'partner_type',
        'role',
        'message',
        'type', // waitlist, demo, contact_sales, free_trial, partner, contact
        'source',
        'status', // new, contacted, qualified, converted, lost
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}

