<?php

use App\Models\User;
use App\Models\Company;
use App\Models\EmailTemplate;
use App\Models\NotificationFlow;
use App\Models\NotificationLog;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    Company::factory()->create(['id' => 1, 'name' => 'Test School']);
    $this->user = User::factory()->create(['company_id' => 1]);
    
    // Create tables if they don't exist (for testing purposes)
    if (!\Schema::hasTable('notification_flows')) {
        \Artisan::call('migrate', ['--force' => true]);
    }
});

describe('Notification Studio Dashboard', function () {
    
    test('guests cannot view notification studio', function () {
        $this->get(route('notification-studio.index'))
            ->assertRedirect('/login');
    });

    test('authenticated users can view notification studio dashboard', function () {
        $this->actingAs($this->user)
            ->get(route('notification-studio.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('modules/notification-studio/index')
                ->has('stats')
            );
    });

    test('dashboard shows correct stats', function () {
        // Create some test data
        EmailTemplate::factory()->count(3)->create(['company_id' => 1, 'is_active' => true]);
        EmailTemplate::factory()->count(2)->create(['company_id' => 1, 'is_active' => false]);

        $this->actingAs($this->user)
            ->get(route('notification-studio.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('stats.total_templates', 5)
                ->where('stats.active_templates', 3)
            );
    });

});

describe('Email Templates', function () {

    test('guests cannot view email templates', function () {
        $this->get(route('notification-studio.templates.index'))
            ->assertRedirect('/login');
    });

    test('authenticated users can view email templates list', function () {
        // Clear any existing templates to ensure test isolation (bypass global scope)
        EmailTemplate::withoutGlobalScopes()->delete();
        
        EmailTemplate::factory()->count(3)->create(['company_id' => 1]);

        $this->actingAs($this->user)
            ->get(route('notification-studio.templates.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('modules/notification-studio/templates/index')
                ->has('templates', 3)
            );
    });

    test('authenticated users can view create template page', function () {
        $this->actingAs($this->user)
            ->get(route('notification-studio.templates.create'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('modules/notification-studio/templates/form')
                ->has('categories')
                ->has('eventTypes')
            );
    });

    test('authenticated users can create email template', function () {
        $templateData = [
            'name' => 'Test Template',
            'subject' => 'Test Subject {{name}}',
            'body' => '<p>Hello {{name}}</p>',
            'category' => 'general',
            'event_type' => 'general_notification',
            'is_active' => true,
        ];

        $this->actingAs($this->user)
            ->post(route('notification-studio.templates.store'), $templateData)
            ->assertRedirect(route('notification-studio.templates.index'));

        $this->assertDatabaseHas('email_templates', [
            'name' => 'Test Template',
            'company_id' => 1,
        ]);
    });

    test('template name is required', function () {
        $templateData = [
            'subject' => 'Test Subject',
            'body' => '<p>Hello</p>',
            'category' => 'general',
        ];

        $this->actingAs($this->user)
            ->post(route('notification-studio.templates.store'), $templateData)
            ->assertSessionHasErrors('name');
    });

    test('authenticated users can update email template', function () {
        $template = EmailTemplate::factory()->create(['company_id' => 1]);

        $this->actingAs($this->user)
            ->put(route('notification-studio.templates.update', $template), [
                'name' => 'Updated Template',
                'subject' => $template->subject,
                'body' => $template->body,
                'category' => $template->category,
                'event_type' => $template->event_type,
                'is_active' => true,
            ])
            ->assertRedirect(route('notification-studio.templates.index'));

        $this->assertDatabaseHas('email_templates', [
            'id' => $template->id,
            'name' => 'Updated Template',
        ]);
    });

    test('authenticated users can delete email template', function () {
        $template = EmailTemplate::factory()->create(['company_id' => 1]);

        $this->actingAs($this->user)
            ->delete(route('notification-studio.templates.destroy', $template))
            ->assertRedirect(route('notification-studio.templates.index'));

        $this->assertDatabaseMissing('email_templates', ['id' => $template->id]);
    });

    test('authenticated users can toggle template status', function () {
        $template = EmailTemplate::factory()->create(['company_id' => 1, 'is_active' => true]);

        $this->actingAs($this->user)
            ->patch(route('notification-studio.templates.toggle-status', $template))
            ->assertRedirect();

        $this->assertDatabaseHas('email_templates', [
            'id' => $template->id,
            'is_active' => false,
        ]);
    });

    test('authenticated users can duplicate email template', function () {
        $template = EmailTemplate::factory()->create(['company_id' => 1, 'name' => 'Original']);

        $this->actingAs($this->user)
            ->post(route('notification-studio.templates.duplicate', $template))
            ->assertRedirect();

        $this->assertDatabaseHas('email_templates', [
            'name' => 'Original (Copy)',
            'company_id' => 1,
        ]);
    });

});

