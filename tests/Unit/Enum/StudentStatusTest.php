<?php

use App\Enum\StudentStatus;

describe('StudentStatus Enum', function () {
    
    test('has correct values', function () {
        expect(StudentStatus::Draft->value)->toBe(0);
        expect(StudentStatus::SubmitForApproval->value)->toBe(1);
        expect(StudentStatus::ResendForApproval->value)->toBe(2);
        expect(StudentStatus::Enrolled->value)->toBe(3);
        expect(StudentStatus::LeaveSchool->value)->toBe(4);
        expect(StudentStatus::CompleteStudy->value)->toBe(5);
    });

    test('has correct labels', function () {
        expect(StudentStatus::Draft->label())->toBe('Draft');
        expect(StudentStatus::SubmitForApproval->label())->toBe('Submit For Approval');
        expect(StudentStatus::ResendForApproval->label())->toBe('Re-send For Approval');
        expect(StudentStatus::Enrolled->label())->toBe('Enrolled');
        expect(StudentStatus::LeaveSchool->label())->toBe('Leave School');
        expect(StudentStatus::CompleteStudy->label())->toBe('Complete Study');
    });

    test('can be created from value', function () {
        expect(StudentStatus::from(0))->toBe(StudentStatus::Draft);
        expect(StudentStatus::from(3))->toBe(StudentStatus::Enrolled);
    });

    test('tryFrom returns null for invalid value', function () {
        expect(StudentStatus::tryFrom(99))->toBeNull();
    });

    test('cases returns all enum cases', function () {
        $cases = StudentStatus::cases();
        
        expect($cases)->toHaveCount(6);
        expect($cases)->toContain(StudentStatus::Draft);
        expect($cases)->toContain(StudentStatus::Enrolled);
    });

});

