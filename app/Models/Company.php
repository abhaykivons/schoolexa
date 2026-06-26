<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'email', 'phone', 'address', 'logo', 'background_image', 'status'];

    public function modulators()
    {
        return $this->hasMany(Moduler::class);
    }

    /**
     * Relation: Company belongs to a Country
     */
    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    /**
     * Relation: Company has many Users
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
