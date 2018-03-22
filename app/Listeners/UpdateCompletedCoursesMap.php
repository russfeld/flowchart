<?php

namespace App\Listeners;

use App\Events\CompletedCourseSaved;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

class UpdateCompletedCoursesMap
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  CompletedCourseSaved  $event
     * @return void
     */
    public function handle(CompletedCourseSaved $event)
    {
        //$event->course;
    }
}
