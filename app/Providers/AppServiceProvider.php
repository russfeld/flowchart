<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Observers\MeetingObserver;

use App\Models\Meeting;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        require_once app_path() . '/Http/CustomValidator.php';

        Meeting::observe(MeetingObserver::class);
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
