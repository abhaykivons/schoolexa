<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\EmailTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EmailTemplate>
 */
class EmailTemplateFactory extends Factory
{
    protected $model = EmailTemplate::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = ['parent', 'student', 'staff', 'enrollment', 'admission', 'approval', 'notification', 'general'];
        $name = fake()->sentence(3);

        return [
            'company_id' => Company::factory(),
            'name' => $name,
            'slug' => Str::slug($name) . '-' . Str::random(6),
            'description' => fake()->optional()->sentence(),
            'category' => fake()->randomElement($categories),
            'event_type' => fake()->slug(2),
            'subject' => 'Test: {{school_name}} - ' . fake()->sentence(4),
            'body' => $this->generateEmailBody(),
            'from_name' => fake()->optional()->company(),
            'from_email' => fake()->optional()->safeEmail(),
            'reply_to' => fake()->optional()->safeEmail(),
            'cc' => null,
            'bcc' => null,
            'available_variables' => ['school_name', 'recipient_name', 'date'],
            'is_active' => true,
            'is_default' => false,
        ];
    }

    /**
     * Generate sample email body HTML.
     */
    private function generateEmailBody(): string
    {
        return '<div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Hello {{recipient_name}},</h2>
            <p>' . fake()->paragraph(3) . '</p>
            <p>Best regards,<br>{{school_name}}</p>
        </div>';
    }

    /**
     * Indicate that the template is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the template is a default template.
     */
    public function default(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_default' => true,
        ]);
    }

    /**
     * Set template for parent category.
     */
    public function parentCategory(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'parent',
            'event_type' => 'parent_welcome',
            'available_variables' => ['parent_name', 'school_name', 'login_url', 'support_email'],
        ]);
    }

    /**
     * Set template for enrollment category.
     */
    public function enrollmentCategory(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'enrollment',
            'event_type' => 'student_enrolled',
            'available_variables' => ['student_name', 'parent_name', 'grade', 'class', 'school_name'],
        ]);
    }
}

