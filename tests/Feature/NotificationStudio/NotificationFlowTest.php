<?php

use App\Models\User;
use App\Models\Company;
use App\Models\EmailTemplate;
use App\Models\NotificationFlow;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    Company::factory()->create(['id' => 1, 'name' => 'Test School']);
    $this->user = User::factory()->create(['company_id' => 1]);
    
    // Create tables if they don't exist
    if (!\Schema::hasTable('notification_flows')) {
        \Artisan::call('migrate', ['--force' => true]);
    }
});

describe('Notification Flows Index', function () {

    test('guests cannot view notification flows', function () {
        $this->get(route('notification-studio.flows.index'))
            ->assertRedirect('/login');
    });

    test('authenticated users can view notification flows list', function () {
        $this->actingAs($this->user)
            ->get(route('notification-studio.flows.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('modules/notification-studio/flows/index')
                ->has('flows')
                ->has('eventCategories')
                ->has('triggerEvents')
                ->has('recipientTypes')
            );
    });

});

describe('Notification Flow Create', function () {

    test('guests cannot view create flow page', function () {
        $this->get(route('notification-studio.flows.create'))
            ->assertRedirect('/login');
    });

    test('authenticated users can view create flow page', function () {
        $this->actingAs($this->user)
            ->get(route('notification-studio.flows.create'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('modules/notification-studio/flows/form')
                ->has('templates')
                ->has('eventCategories')
                ->has('triggerEvents')
                ->has('recipientTypes')
            );
    });

    test('authenticated users can create notification flow', function () {
        $flowData = [
            'name' => 'Test Flow',
            'description' => 'Test description',
            'trigger_event' => 'student_enrolled',
            'recipients' => ['parent'],
            'send_email' => true,
            'send_in_app' => false,
            'send_sms' => false,
            'send_timing' => 'immediate',
            'is_active' => true,
            'priority' => 10,
        ];

        $this->actingAs($this->user)
            ->post(route('notification-studio.flows.store'), $flowData)
            ->assertRedirect(route('notification-studio.flows.index'));

        $this->assertDatabaseHas('notification_flows', [
            'name' => 'Test Flow',
            'trigger_event' => 'student_enrolled',
            'company_id' => 1,
        ]);
    });

    test('flow name is required', function () {
        $flowData = [
            'trigger_event' => 'student_enrolled',
            'recipients' => ['parent'],
            'send_timing' => 'immediate',
        ];

        $this->actingAs($this->user)
            ->post(route('notification-studio.flows.store'), $flowData)
            ->assertSessionHasErrors('name');
    });

    test('recipients is required', function () {
        $flowData = [
            'name' => 'Test Flow',
            'trigger_event' => 'student_enrolled',
            'send_timing' => 'immediate',
        ];

        $this->actingAs($this->user)
            ->post(route('notification-studio.flows.store'), $flowData)
            ->assertSessionHasErrors('recipients');
    });

    test('recipients must have at least one entry', function () {
        $flowData = [
            'name' => 'Test Flow',
            'trigger_event' => 'student_enrolled',
            'recipients' => [],
            'send_timing' => 'immediate',
        ];

        $this->actingAs($this->user)
            ->post(route('notification-studio.flows.store'), $flowData)
            ->assertSessionHasErrors('recipients');
    });

});

describe('Notification Flow Update', function () {

    test('authenticated users can view edit flow page', function () {
        $flow = NotificationFlow::factory()->create(['company_id' => 1]);

        $this->actingAs($this->user)
            ->get(route('notification-studio.flows.edit', $flow))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('modules/notification-studio/flows/form')
                ->has('flow')
            );
    });

    test('authenticated users can update notification flow', function () {
        $flow = NotificationFlow::factory()->create(['company_id' => 1, 'name' => 'Original']);

        $this->actingAs($this->user)
            ->put(route('notification-studio.flows.update', $flow), [
                'name' => 'Updated Flow',
                'description' => $flow->description,
                'trigger_event' => $flow->trigger_event,
                'recipients' => $flow->recipients,
                'send_email' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 5,
            ])
            ->assertRedirect(route('notification-studio.flows.index'));

        $this->assertDatabaseHas('notification_flows', [
            'id' => $flow->id,
            'name' => 'Updated Flow',
        ]);
    });

});

describe('Notification Flow Delete', function () {

    test('authenticated users can delete notification flow', function () {
        $flow = NotificationFlow::factory()->create(['company_id' => 1]);

        $this->actingAs($this->user)
            ->delete(route('notification-studio.flows.destroy', $flow))
            ->assertRedirect(route('notification-studio.flows.index'));

        $this->assertDatabaseMissing('notification_flows', ['id' => $flow->id]);
    });

});

describe('Notification Flow Actions', function () {

    test('authenticated users can toggle flow status', function () {
        $flow = NotificationFlow::factory()->create(['company_id' => 1, 'is_active' => true]);

        $this->actingAs($this->user)
            ->patch(route('notification-studio.flows.toggle-status', $flow))
            ->assertRedirect();

        $this->assertDatabaseHas('notification_flows', [
            'id' => $flow->id,
            'is_active' => false,
        ]);
    });

    test('authenticated users can duplicate notification flow', function () {
        $flow = NotificationFlow::factory()->create(['company_id' => 1, 'name' => 'Original Flow']);

        $this->actingAs($this->user)
            ->post(route('notification-studio.flows.duplicate', $flow))
            ->assertRedirect();

        $this->assertDatabaseHas('notification_flows', [
            'name' => 'Original Flow (Copy)',
            'company_id' => 1,
        ]);
    });

});

describe('Notification Flow with Template', function () {

    test('flow can be linked to email template', function () {
        $template = EmailTemplate::factory()->create(['company_id' => 1]);

        $flowData = [
            'name' => 'Flow with Template',
            'trigger_event' => 'student_enrolled',
            'recipients' => ['parent'],
            'send_email' => true,
            'email_template_id' => $template->id,
            'send_timing' => 'immediate',
            'is_active' => true,
            'priority' => 0,
        ];

        $this->actingAs($this->user)
            ->post(route('notification-studio.flows.store'), $flowData)
            ->assertRedirect(route('notification-studio.flows.index'));

        $this->assertDatabaseHas('notification_flows', [
            'name' => 'Flow with Template',
            'email_template_id' => $template->id,
        ]);
    });

});

