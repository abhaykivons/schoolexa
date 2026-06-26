<?php

namespace Database\Factories;

use App\Enum\StudentStatus;
use App\Models\Student;
use App\Models\Grade;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Student>
 */
class StudentFactory extends Factory
{
    protected $model = Student::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'date_of_birth' => fake()->dateTimeBetween('-18 years', '-5 years'),
            'student_id' => 'STU' . date('Y') . str_pad(fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'grade_id' => null,
            'parent_id' => null,
            'user_id' => null,
            'teacher_id' => null,
            'company_id' => 1,
            'status' => StudentStatus::Draft,
            'enrollment_date' => null,
            'is_login' => false,
        ];
    }

    /**
     * Set the student as enrolled.
     */
    public function enrolled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => StudentStatus::Enrolled,
            'enrollment_date' => now(),
        ]);
    }

    /**
     * Set the student with a specific status.
     */
    public function withStatus(StudentStatus $status): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => $status,
        ]);
    }

    /**
     * Set the student with a grade.
     */
    public function withGrade(Grade $grade = null): static
    {
        return $this->state(fn (array $attributes) => [
            'grade_id' => $grade?->id ?? Grade::factory(),
        ]);
    }

    /**
     * Set the student with a parent user.
     */
    public function withParent(User $parent = null): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => $parent?->id ?? User::factory(),
        ]);
    }
}

