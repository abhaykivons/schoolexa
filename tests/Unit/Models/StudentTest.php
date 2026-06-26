<?php

use App\Enum\StudentStatus;
use App\Models\Student;
use App\Models\Grade;
use App\Models\Company;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    // Ensure a company exists with ID 1 for tests that create records
    Company::factory()->create(['id' => 1, 'name' => 'Default School']);
});

describe('Student Model', function () {

    describe('full_name accessor', function () {
        
        test('returns full name with first and last name', function () {
            $student = Student::factory()->make([
                'first_name' => 'John',
                'last_name' => 'Doe',
            ]);

            expect($student->full_name)->toBe('John Doe');
        });

        test('trims whitespace from full name', function () {
            $student = Student::factory()->make([
                'first_name' => ' Jane ',
                'last_name' => ' Smith ',
            ]);

            expect($student->full_name)->toBe('Jane   Smith');
        });

        test('handles empty last name', function () {
            $student = Student::factory()->make([
                'first_name' => 'John',
                'last_name' => '',
            ]);

            expect($student->full_name)->toBe('John');
        });

    });

    describe('isEnrolled method', function () {
        
        test('returns true when status is Enrolled', function () {
            $student = Student::factory()->make([
                'status' => StudentStatus::Enrolled,
            ]);

            expect($student->isEnrolled())->toBeTrue();
        });

        test('returns false when status is Draft', function () {
            $student = Student::factory()->make([
                'status' => StudentStatus::Draft,
            ]);

            expect($student->isEnrolled())->toBeFalse();
        });

        test('returns false when status is SubmitForApproval', function () {
            $student = Student::factory()->make([
                'status' => StudentStatus::SubmitForApproval,
            ]);

            expect($student->isEnrolled())->toBeFalse();
        });

        test('returns false when status is LeaveSchool', function () {
            $student = Student::factory()->make([
                'status' => StudentStatus::LeaveSchool,
            ]);

            expect($student->isEnrolled())->toBeFalse();
        });

    });

    describe('generateStudentId', function () {
        
        test('generates student ID with correct format', function () {
            // Create a company for the test using factory
            $company = Company::factory()->create([
                'name' => 'Test School',
            ]);
            session(['company_id' => $company->id]);

            $studentId = Student::generateStudentId($company->id);
            
            // Should match format: TES + YEAR + 4 digits
            expect($studentId)->toMatch('/^TES\d{8}$/');
            expect($studentId)->toStartWith('TES' . date('Y'));
        });

        test('increments sequence number for subsequent IDs', function () {
            $company = Company::factory()->create([
                'name' => 'ABC Academy',
            ]);
            session(['company_id' => $company->id]);

            // Create first student
            $student1 = Student::factory()->create([
                'company_id' => $company->id,
                'student_id' => Student::generateStudentId($company->id),
            ]);

            $studentId2 = Student::generateStudentId($company->id);
            
            // Second ID should be one higher
            $seq1 = intval(substr($student1->student_id, -4));
            $seq2 = intval(substr($studentId2, -4));
            
            expect($seq2)->toBe($seq1 + 1);
        });

    });

    describe('relationships', function () {
        
        test('belongs to grade', function () {
            $grade = Grade::factory()->create();
            $student = Student::factory()->create([
                'grade_id' => $grade->id,
            ]);

            expect($student->grade)->toBeInstanceOf(Grade::class);
            expect($student->grade->id)->toBe($grade->id);
        });

    });

    describe('status casting', function () {
        
        test('casts status to StudentStatus enum', function () {
            $student = Student::factory()->create([
                'status' => StudentStatus::Enrolled,
            ]);

            $student->refresh();
            
            expect($student->status)->toBeInstanceOf(StudentStatus::class);
            expect($student->status)->toBe(StudentStatus::Enrolled);
        });

    });

    describe('appends', function () {
        
        test('full_name is appended to model', function () {
            $student = new Student();
            $appends = $student->getAppends();
            
            expect($appends)->toContain('full_name');
        });

    });

});
