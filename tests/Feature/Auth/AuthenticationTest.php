<?php

use App\Models\User;
use App\Models\Company;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    Company::factory()->create(['id' => 1, 'name' => 'Default School']);
});

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

test('users can authenticate using the login screen', function () {
    // Create user - email gets encrypted in database
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'is_login' => true,  // Required for auth to persist
    ]);

    // Send plain email - LoginRequest will encrypt it before comparison
    $response = $this->post('/login', [
        'email' => 'test@example.com',  // Plain email, will be encrypted by LoginRequest
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
    ]);

    $this->post('/login', [
        'email' => 'test@example.com',
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    
    // Logout redirects to tenant login URL for non-it_admin users
    // The redirect URL includes the company UUID
    $response->assertRedirect();
});
