<?php

namespace App\Listeners;

use App\Events\CompletedCourseSaved;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

use App\Models\Planrequirement;
use App\Models\Plan;
use App\Models\Completedcourse;

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
      $course = $event->course;
      if($course->isDirty('name')){
        $requirements = $course->requirements();
        foreach($requirements as $requirement){
          $requirement->completedcourse_id = null;
          $requirement->save();
        }
        $plans = Plan::where('student_id', $course->student_id)->get();
        foreach($plans as $plan){
          $requirements = $plan->requirements;
          foreach($requirements as $requirement){
            if($requirement->course_name == $course->name && $requirement->completedcourse_id_lock == 0){
              $requirement->completedcourse_id = $course->id;
              $requirement->save();
            }
          }
        }
      }
    }
}
