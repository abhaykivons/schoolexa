<?php

namespace Database\Factories;

use App\Models\AcademicYear;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AcademicYear>
 */
class AcademicYearFactory extends Factory
{
    protected $model = AcademicYear::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startYear = fake()->unique()->numberBetween(2000, 2099);
        
        return [
            'name' => $startYear . '-' . ($startYear + 1),
            'start_date' => "{$startYear}-04-01",
            'end_date' => ($startYear + 1) . '-03-31',
            'current' => false,
            'company_id' => 1,
        ];
    }

    /**
     * Mark the academic year as current.
     */
    public function current(): static
    {
        return $this->state(fn (array $attributes) => [
            'current' => true,
        ]);
    }

    /**
     * Create an academic year for a specific year.
     */
    public function forYear(int $startYear): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => $startYear . '-' . ($startYear + 1),
            'start_date' => "{$startYear}-04-01",
            'end_date' => ($startYear + 1) . '-03-31',
        ]);
    }
}

