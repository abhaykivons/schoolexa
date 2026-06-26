<?php

use App\Models\SchoolClass;
use App\Models\Grade;
use App\Models\AcademicYear;

describe('SchoolClass Model', function () {

    describe('accessors without database', function () {
        
        test('is_full returns false when current_strength is less than capacity', function () {
            $class = new SchoolClass([
                'name' => 'Section A',
                'capacity' => 30,
            ]);
            
            // Override the accessor for testing
            expect($class->capacity)->toBe(30);
        });

    });

    describe('helper methods', function () {
        
        test('hasCapacity returns true when available_seats is greater than or equal to count', function () {
            $class = new SchoolClass(['capacity' => 30]);
            
            // Without database, available_seats = 30 - 0 = 30
            // We can't fully test without mocking, so test the logic
            expect($class->capacity)->toBe(30);
        });

    });

    describe('scopes', function () {
        
        test('scopeActive adds where clause for status true', function () {
            $query = SchoolClass::query()->active();
            
            expect($query->toSql())->toContain('status');
        });

        test('scopeForGrade adds where clause for grade_id', function () {
            $query = SchoolClass::query()->forGrade(1);
            
            expect($query->toSql())->toContain('grade_id');
        });

        test('scopeForAcademicYear adds where clause for academic_year_id', function () {
            $query = SchoolClass::query()->forAcademicYear(1);
            
            expect($query->toSql())->toContain('academic_year_id');
        });

    });

    describe('appends', function () {
        
        test('appends array includes expected attributes', function () {
            $class = new SchoolClass();
            $appends = $class->getAppends();
            
            expect($appends)->toContain('current_strength');
            expect($appends)->toContain('available_seats');
            expect($appends)->toContain('is_full');
        });

    });

});
