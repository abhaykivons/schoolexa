<?php

use App\Http\Middleware\CheckUserType;
use App\Http\Middleware\EnsureDeveloperAccess;
use App\Http\Middleware\EnsureTenantAccess;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SpamProtection;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
        
        $middleware->alias([
            'checkUser' => CheckUserType::class,
            'developer' => EnsureDeveloperAccess::class,
            'tenant' => EnsureTenantAccess::class,
            'spam.protect' => SpamProtection::class,
            'portal' => \App\Http\Middleware\EnsurePortalAccess::class,
            'it_admin' => \App\Http\Middleware\EnsureItAdminAccess::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
