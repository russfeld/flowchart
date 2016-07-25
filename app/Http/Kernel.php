<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * The application's global HTTP middleware stack.
     *
     * @var array
     */
    protected $middleware = [
        \Illuminate\Foundation\Http\Middleware\CheckForMaintenanceMode::class,
        \App\Http\Middleware\EncryptCookies::class,
        \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
        \Illuminate\Session\Middleware\StartSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \App\Http\Middleware\VerifyCsrfToken::class,
    ];

    /**
     * The application's route middleware.
     *
     * @var array
     */
    protected $routeMiddleware = [
      //  'auth' => \App\Http\Middleware\Authenticate::class,
        'cas' => \App\Http\Middleware\CASAuthenticate::class,
      //  'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
        'update_profile' => \App\Http\Middleware\UpdateProfileMiddleware::class,
        'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
        'groupsessiondisabled' => \App\Http\Middleware\GroupsessionDisabled::class,
        'advisors_only' => \App\Http\Middleware\AdvisorsOnly::class,
    ];
}
