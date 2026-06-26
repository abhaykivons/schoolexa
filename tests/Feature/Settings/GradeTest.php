<?php

use App\Models\Grade;
use App\Models\User;
use App\Models\Company;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    // Ensure a company exists for tests
    Company::factory()->create(['id' => 1, 'name' => 'Default School']);
    $this->user = User::factory()->create();
});

describe('Grade Index', function () {
    
    test('guests cannot view grades page', function () {
        $this->get(route('grades.index'))
            ->assertRedirect('/login');
    });

    test('authenticated users can view grades page', function () {
        Grade::factory()->count(3)->create();

        $this->actingAs($this->user)
            ->get(route('grades.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('modules/settings/grades')
                ->has('grades', 3)
            );
    });

    test('grades are ordered by order field', function () {
        Grade::factory()->create(['name' => 'Grade 3', 'order' => 3]);
        Grade::factory()->create(['name' => 'Grade 1', 'order' => 1]);
        Grade::factory()->create(['name' => 'Grade 2', 'order' => 2]);

        $this->actingAs($this->user)
            ->get(route('grades.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('grades.0.order', 1)
                ->where('grades.1.order', 2)
                ->where('grades.2.order', 3)
            );
    });

});

describe('Grade Store', function () {
    
    test('guests cannot create grades', function () {
        $this->post(route('grades.store'), [
            'name' => 'Grade 1',
        ])->assertRedirect('/login');
    });

    test('authenticated users can create a grade', function () {
        $this->actingAs($this->user)
            ->post(route('grades.store'), [
                'name' => 'Grade 1',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('grades', [
            'order' => 1,
        ]);
    });

    test('grade name is required', function () {
        $this->actingAs($this->user)
            ->post(route('grades.store'), [
                'name' => '',
            ])
            ->assertSessionHasErrors('name');
    });

    // Note: Unique name validation is skipped because the name field is encrypted,
    // making database-level unique constraints ineffective

    test('new grade gets highest order plus one', function () {
        Grade::factory()->create(['order' => 5]);
        Grade::factory()->create(['order' => 3]);

        $this->actingAs($this->user)
            ->post(route('grades.store'), [
                'name' => 'New Grade',
            ]);

        $newGrade = Grade::where('order', 6)->first();
        expect($newGrade)->not->toBeNull();
    });

});

describe('Grade Update', function () {
    
    test('guests cannot update grades', function () {
        $grade = Grade::factory()->create();

        $this->put(route('grades.update', $grade), [
            'name' => 'Updated Grade',
        ])->assertRedirect('/login');
    });

    test('authenticated users can update a grade', function () {
        $grade = Grade::factory()->create(['name' => 'Old Name']);

        $this->actingAs($this->user)
            ->put(route('grades.update', $grade), [
                'name' => 'Updated Name',
            ])
            ->assertRedirect();

        $grade->refresh();
        expect($grade->name)->toBe('Updated Name');
    });

});

describe('Grade Delete', function () {
    
    test('guests cannot delete grades', function () {
        $grade = Grade::factory()->create();

        $this->delete(route('grades.destroy', $grade))
            ->assertRedirect('/login');
    });

    test('authenticated users can delete a grade without classes', function () {
        $grade = Grade::factory()->create();

        $this->actingAs($this->user)
            ->delete(route('grades.destroy', $grade))
            ->assertRedirect();

        $this->assertDatabaseMissing('grades', ['id' => $grade->id]);
    });

    // Note: Testing "cannot delete grade with classes" requires SchoolClass factory
    // which has complex dependencies (staff_id NOT NULL). This test is handled
    // in integration tests with proper seeding.

});

describe('Grade Reorder', function () {
    
    test('guests cannot reorder grades', function () {
        $grade1 = Grade::factory()->create(['order' => 1]);
        $grade2 = Grade::factory()->create(['order' => 2]);

        $this->post(route('grades.reorder'), [
            'grades' => [
                ['id' => $grade1->id, 'order' => 2],
                ['id' => $grade2->id, 'order' => 1],
            ],
        ])->assertRedirect('/login');
    });

    test('authenticated users can reorder grades', function () {
        $grade1 = Grade::factory()->create(['order' => 1]);
        $grade2 = Grade::factory()->create(['order' => 2]);
        $grade3 = Grade::factory()->create(['order' => 3]);

        $this->actingAs($this->user)
            ->post(route('grades.reorder'), [
                'grades' => [
                    ['id' => $grade1->id, 'order' => 3],
                    ['id' => $grade2->id, 'order' => 1],
                    ['id' => $grade3->id, 'order' => 2],
                ],
            ])
            ->assertRedirect();

        $grade1->refresh();
        $grade2->refresh();
        $grade3->refresh();

        expect($grade1->order)->toBe(3);
        expect($grade2->order)->toBe(1);
        expect($grade3->order)->toBe(2);
    });

    test('reorder validates grade existence', function () {
        $this->actingAs($this->user)
            ->post(route('grades.reorder'), [
                'grades' => [
                    ['id' => 9999, 'order' => 1],
                ],
            ])
            ->assertSessionHasErrors('grades.0.id');
    });

});
