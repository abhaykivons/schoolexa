<?php

use App\Models\User;
use App\Models\Company;
use App\Models\EmailSettings;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    Company::factory()->create(['id' => 1, 'name' => 'Test School']);
    $this->user = User::factory()->create(['company_id' => 1]);
    
    // Create table if it doesn't exist
    if (!\Schema::hasTable('email_settings')) {
        \Artisan::call('migrate', ['--force' => true]);
    }
});

describe('Email Settings Index', function () {

    test('guests cannot view email settings', function () {
        $this->get(route('notification-studio.settings.index'))
            ->assertRedirect('/login');
    });

    test('authenticated users can view email settings page', function () {
        $this->actingAs($this->user)
            ->get(route('notification-studio.settings.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('modules/notification-studio/settings/index')
                ->has('mailDrivers')
                ->has('encryptionTypes')
            );
    });

    test('email settings page shows existing settings', function () {
        EmailSettings::create([
            'company_id' => 1,
            'mail_driver' => 'smtp',
            'smtp_host' => 'smtp.test.com',
            'smtp_port' => 587,
            'from_name' => 'Test School',
            'from_email' => 'test@school.com',
        ]);

        $this->actingAs($this->user)
            ->get(route('notification-studio.settings.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('settings.smtp_host', 'smtp.test.com')
                ->where('settings.from_name', 'Test School')
            );
    });

});

describe('Email Settings Store', function () {

    test('guests cannot save email settings', function () {
        $this->post(route('notification-studio.settings.store'), [
            'mail_driver' => 'smtp',
            'from_name' => 'Test',
            'from_email' => 'test@test.com',
        ])->assertRedirect('/login');
    });

    test('authenticated users can save SMTP settings', function () {
        $settingsData = [
            'mail_driver' => 'smtp',
            'smtp_host' => 'smtp.gmail.com',
            'smtp_port' => 587,
            'smtp_username' => 'test@gmail.com',
            'smtp_password' => 'password123',
            'smtp_encryption' => 'tls',
            'from_name' => 'Test School',
            'from_email' => 'notifications@test.com',
            'reply_to_email' => 'support@test.com',
            'is_active' => false,
        ];

        $this->actingAs($this->user)
            ->post(route('notification-studio.settings.store'), $settingsData)
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('email_settings', [
            'company_id' => 1,
            'smtp_host' => 'smtp.gmail.com',
            'smtp_port' => 587,
            'from_name' => 'Test School',
        ]);
    });

    test('from_name is required', function () {
        $this->actingAs($this->user)
            ->post(route('notification-studio.settings.store'), [
                'mail_driver' => 'smtp',
                'from_email' => 'test@test.com',
            ])
            ->assertSessionHasErrors('from_name');
    });

    test('from_email is required', function () {
        $this->actingAs($this->user)
            ->post(route('notification-studio.settings.store'), [
                'mail_driver' => 'smtp',
                'from_name' => 'Test',
            ])
            ->assertSessionHasErrors('from_email');
    });

    test('from_email must be valid email', function () {
        $this->actingAs($this->user)
            ->post(route('notification-studio.settings.store'), [
                'mail_driver' => 'smtp',
                'from_name' => 'Test',
                'from_email' => 'not-an-email',
            ])
            ->assertSessionHasErrors('from_email');
    });

    test('smtp_port must be valid port number', function () {
        $this->actingAs($this->user)
            ->post(route('notification-studio.settings.store'), [
                'mail_driver' => 'smtp',
                'smtp_port' => 99999,
                'from_name' => 'Test',
                'from_email' => 'test@test.com',
            ])
            ->assertSessionHasErrors('smtp_port');
    });

    test('updating settings does not require password if already set', function () {
        EmailSettings::create([
            'company_id' => 1,
            'mail_driver' => 'smtp',
            'smtp_host' => 'smtp.test.com',
            'smtp_port' => 587,
            'smtp_password' => 'existing-password',
            'from_name' => 'Test',
            'from_email' => 'test@test.com',
        ]);

        $this->actingAs($this->user)
            ->post(route('notification-studio.settings.store'), [
                'mail_driver' => 'smtp',
                'smtp_host' => 'smtp.updated.com',
                'smtp_port' => 465,
                'from_name' => 'Updated Name',
                'from_email' => 'updated@test.com',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('email_settings', [
            'company_id' => 1,
            'smtp_host' => 'smtp.updated.com',
            'from_name' => 'Updated Name',
        ]);
    });

});

describe('Email Settings Toggle Status', function () {

    test('authenticated users can toggle email settings status', function () {
        EmailSettings::create([
            'company_id' => 1,
            'mail_driver' => 'smtp',
            'smtp_host' => 'smtp.test.com',
            'smtp_port' => 587,
            'from_name' => 'Test',
            'from_email' => 'test@test.com',
            'is_active' => false,
        ]);

        $this->actingAs($this->user)
            ->patch(route('notification-studio.settings.toggle-status'))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('email_settings', [
            'company_id' => 1,
            'is_active' => true,
        ]);
    });

    test('cannot enable incomplete settings', function () {
        EmailSettings::create([
            'company_id' => 1,
            'mail_driver' => 'smtp',
            'smtp_host' => null, // Missing required field
            'from_name' => 'Test',
            'from_email' => 'test@test.com',
            'is_active' => false,
        ]);

        $this->actingAs($this->user)
            ->patch(route('notification-studio.settings.toggle-status'))
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('email_settings', [
            'company_id' => 1,
            'is_active' => false,
        ]);
    });

});

describe('Email Settings Mail Drivers', function () {

    test('can save mailgun settings', function () {
        $this->actingAs($this->user)
            ->post(route('notification-studio.settings.store'), [
                'mail_driver' => 'mailgun',
                'mailgun_domain' => 'mg.example.com',
                'mailgun_secret' => 'key-xxx',
                'from_name' => 'Test',
                'from_email' => 'test@test.com',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('email_settings', [
            'mail_driver' => 'mailgun',
            'mailgun_domain' => 'mg.example.com',
        ]);
    });

    test('can save ses settings', function () {
        $this->actingAs($this->user)
            ->post(route('notification-studio.settings.store'), [
                'mail_driver' => 'ses',
                'ses_key' => 'AKIAIOSFODNN7EXAMPLE',
                'ses_secret' => 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
                'ses_region' => 'us-east-1',
                'from_name' => 'Test',
                'from_email' => 'test@test.com',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('email_settings', [
            'mail_driver' => 'ses',
            'ses_key' => 'AKIAIOSFODNN7EXAMPLE',
            'ses_region' => 'us-east-1',
        ]);
    });

    test('can save postmark settings', function () {
        $this->actingAs($this->user)
            ->post(route('notification-studio.settings.store'), [
                'mail_driver' => 'postmark',
                'postmark_token' => 'token-xxx',
                'from_name' => 'Test',
                'from_email' => 'test@test.com',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('email_settings', [
            'mail_driver' => 'postmark',
        ]);
    });

});

describe('Email Settings Password Encryption', function () {

    test('smtp password is encrypted when stored', function () {
        $this->actingAs($this->user)
            ->post(route('notification-studio.settings.store'), [
                'mail_driver' => 'smtp',
                'smtp_password' => 'mypassword123',
                'from_name' => 'Test',
                'from_email' => 'test@test.com',
            ]);

        $settings = EmailSettings::first();
        
        // The raw value in database should not be plaintext
        $rawPassword = $settings->getRawOriginal('smtp_password');
        expect($rawPassword)->not->toBe('mypassword123');
        
        // But the accessor should decrypt it
        expect($settings->smtp_password)->toBe('mypassword123');
    });

});

