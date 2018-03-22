<?php

namespace App\Providers;

use Illuminate\Contracts\Events\Dispatcher as DispatcherContract;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        'App\Events\PlanRequirementSaved' => [
            'App\Listeners\UpdatePlanCoursesMap',
        ],
        'App\Events\CompletedCourseSaved' => [
            'App\Listeners\UpdateCompletedCoursesMap',
        ],
        'App\Events\BlackoutSaved' => [
            'App\Listeners\UpdateBlackoutEvents',
        ],
    ];

    /**
     * Register any other events for your application.
     *
     * @param  \Illuminate\Contracts\Events\Dispatcher  $events
     * @return void
     */
    public function boot()
    {
        parent::boot();

        //
    }
}
