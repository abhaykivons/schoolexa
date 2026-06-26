<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\NotificationFlow;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NotificationFlow>
 */
class NotificationFlowFactory extends Factory
{
    protected $model = NotificationFlow::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $triggerEvents = [
            'student_enrolled',
            'admission_approved',
            'admission_rejected',
            'parent_registered',
            'staff_account_created',
        ];

        return [
            'company_id' => Company::factory(),
            'name' => fake()->sentence(3),
            'description' => fake()->optional()->paragraph(),
            'trigger_event' => fake()->randomElement($triggerEvents),
            'recipients' => fake()->randomElements(['parent', 'student', 'staff', 'admin'], fake()->numberBetween(1, 3)),
            'custom_emails' => null,
            'send_email' => true,
            'send_in_app' => false,
            'send_sms' => false,
            'email_template_id' => null,
            'send_timing' => fake()->randomElement(['immediate', 'delayed', 'scheduled']),
            'delay_minutes' => function (array $attributes) {
                return $attributes['send_timing'] === 'delayed' ? fake()->numberBetween(5, 60) : null;
            },
            'schedule_time' => function (array $attributes) {
                return $attributes['send_timing'] === 'scheduled' ? fake()->time('H:i') : null;
            },
            'conditions' => null,
            'is_active' => true,
            'priority' => fake()->numberBetween(0, 100),
        ];
    }

    /**
     * Indicate that the flow is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Set immediate timing.
     */
    public function immediate(): static
    {
        return $this->state(fn (array $attributes) => [
            'send_timing' => 'immediate',
            'delay_minutes' => null,
            'schedule_time' => null,
        ]);
    }

    /**
     * Set delayed timing.
     */
    public function delayed(int $minutes = 30): static
    {
        return $this->state(fn (array $attributes) => [
            'send_timing' => 'delayed',
            'delay_minutes' => $minutes,
            'schedule_time' => null,
        ]);
    }

    /**
     * Set for student enrollment event.
     */
    public function studentEnrolled(): static
    {
        return $this->state(fn (array $attributes) => [
            'trigger_event' => 'student_enrolled',
            'recipients' => ['parent'],
        ]);
    }
}

