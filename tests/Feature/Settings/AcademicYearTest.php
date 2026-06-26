<?php

use App\Models\AcademicYear;
use App\Models\User;
use App\Models\Company;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    // Ensure a company exists for tests
    Company::factory()->create(['id' => 1, 'name' => 'Default School']);
    $this->user = User::factory()->create();
});

describe('AcademicYear Index', function () {
    
    test('guests cannot view academic years page', function () {
        $this->get(route('academic-years.index'))
            ->assertRedirect('/login');
    });

    test('authenticated users can view academic years page', function () {
        AcademicYear::factory()->count(3)->create();

        $this->actingAs($this->user)
            ->get(route('academic-years.index'))
            ->assertOk();
    });

});

describe('AcademicYear Store', function () {
    
    test('guests cannot create academic years', function () {
        $this->post(route('academic-years.store'), [
            'name' => '2024-2025',
            'start_date' => '2024-04-01',
            'end_date' => '2025-03-31',
        ])->assertRedirect('/login');
    });

    test('authenticated users can create an academic year', function () {
        $this->actingAs($this->user)
            ->post(route('academic-years.store'), [
                'name' => '2024-2025',
                'start_date' => '2024-04-01',
                'end_date' => '2025-03-31',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('academic_years', [
            'name' => '2024-2025',
        ]);
    });

    test('name is required', function () {
        $this->actingAs($this->user)
            ->post(route('academic-years.store'), [
                'name' => '',
                'start_date' => '2024-04-01',
                'end_date' => '2025-03-31',
            ])
            ->assertSessionHasErrors('name');
    });

    test('start date is required', function () {
        $this->actingAs($this->user)
            ->post(route('academic-years.store'), [
                'name' => '2024-2025',
                'start_date' => '',
                'end_date' => '2025-03-31',
            ])
            ->assertSessionHasErrors('start_date');
    });

    test('end date is required', function () {
        $this->actingAs($this->user)
            ->post(route('academic-years.store'), [
                'name' => '2024-2025',
                'start_date' => '2024-04-01',
                'end_date' => '',
            ])
            ->assertSessionHasErrors('end_date');
    });

});

describe('AcademicYear Update', function () {
    
    test('guests cannot update academic years', function () {
        $year = AcademicYear::factory()->create();

        $this->put(route('academic-years.update', $year), [
            'name' => 'Updated Year',
            'start_date' => '2024-04-01',
            'end_date' => '2025-03-31',
        ])->assertRedirect('/login');
    });

    test('authenticated users can update an academic year', function () {
        $year = AcademicYear::factory()->create([
            'name' => '2023-2024',
        ]);

        $this->actingAs($this->user)
            ->put(route('academic-years.update', $year), [
                'name' => '2024-2025',
                'start_date' => '2024-04-01',
                'end_date' => '2025-03-31',
            ])
            ->assertRedirect();

        $year->refresh();
        expect($year->name)->toBe('2024-2025');
    });

});

describe('AcademicYear Delete', function () {
    
    test('guests cannot delete academic years', function () {
        $year = AcademicYear::factory()->create();

        $this->delete(route('academic-years.destroy', $year))
            ->assertRedirect('/login');
    });

    test('authenticated users can delete an academic year', function () {
        $year = AcademicYear::factory()->create();

        $this->actingAs($this->user)
            ->delete(route('academic-years.destroy', $year))
            ->assertRedirect();

        $this->assertDatabaseMissing('academic_years', ['id' => $year->id]);
    });

});

describe('AcademicYear Set Current', function () {
    
    test('guests cannot set current academic year', function () {
        $year = AcademicYear::factory()->create();

        $this->patch(route('academic-years.set-current', $year))
            ->assertRedirect('/login');
    });

    test('authenticated users can set current academic year', function () {
        $year1 = AcademicYear::factory()->create(['current' => true]);
        $year2 = AcademicYear::factory()->create(['current' => false]);

        $this->actingAs($this->user)
            ->patch(route('academic-years.set-current', $year2))
            ->assertRedirect();

        $year1->refresh();
        $year2->refresh();

        expect($year1->current)->toBeFalsy();
        expect($year2->current)->toBeTruthy();
    });

    test('only one academic year can be current', function () {
        $year1 = AcademicYear::factory()->create(['current' => true]);
        $year2 = AcademicYear::factory()->create(['current' => false]);
        $year3 = AcademicYear::factory()->create(['current' => false]);

        $this->actingAs($this->user)
            ->patch(route('academic-years.set-current', $year3));

        $currentYears = AcademicYear::where('current', true)->count();
        
        expect($currentYears)->toBe(1);
    });

});

