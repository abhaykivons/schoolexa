<?php

namespace App\Enum;

enum SetupType: string
{
    case PUBLIC_PORTAL = 'public_portal';
    case CLOUD_HOSTED = 'cloud_hosted';
    case PRIVATE_SETUP = 'private_setup';

    public function label(): string
    {
        return match($this) {
            self::PUBLIC_PORTAL => 'Public Portal',
            self::CLOUD_HOSTED => 'Cloud-based Hosted Service',
            self::PRIVATE_SETUP => 'Private Setup',
        };
    }

    public function description(): string
    {
        return match($this) {
            self::PUBLIC_PORTAL => 'Multi-tenant portal using tenancy for easy school management',
            self::CLOUD_HOSTED => 'Cloud-based hosted service for schools with single campus',
            self::PRIVATE_SETUP => 'Fully customizable option with ability to use multiple campuses',
        };
    }

    public function allowsMultipleCampuses(): bool
    {
        return match($this) {
            self::PUBLIC_PORTAL => false,
            self::CLOUD_HOSTED => false,
            self::PRIVATE_SETUP => true,
        };
    }
}
