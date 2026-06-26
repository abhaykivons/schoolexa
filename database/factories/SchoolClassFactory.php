<?php

namespace Database\Factories;

use App\Models\SchoolClass;
use App\Models\Grade;
use App\Models\AcademicYear;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SchoolClass>
 */
class SchoolClassFactory extends Factory
{
    protected $model = SchoolClass::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Section ' . fake()->randomLetter(),
            'grade_id' => Grade::factory(),
            'academic_year_id' => AcademicYear::factory(),
            'capacity' => fake()->numberBetween(20, 40),
            'staff_id' => null,
            'status' => true,
            'company_id' => 1,
        ];
    }

    /**
     * Set the class as inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => false,
        ]);
    }

    /**
     * Set a specific capacity.
     */
    public function withCapacity(int $capacity): static
    {
        return $this->state(fn (array $attributes) => [
            'capacity' => $capacity,
        ]);
    }
}

