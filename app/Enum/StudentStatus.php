<?php

namespace App\Enum;


enum StudentStatus: int
{
    case Draft = 0;
    case SubmitForApproval = 1;
    case ResendForApproval = 2;
    case Enrolled = 3;
    case LeaveSchool = 4;
    case CompleteStudy = 5;

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::SubmitForApproval => 'Submit For Approval',
            self::ResendForApproval => 'Re-send For Approval',
            self::Enrolled => 'Enrolled',
            self::LeaveSchool => 'Leave School',
            self::CompleteStudy => 'Complete Study',
        };
    }
}
