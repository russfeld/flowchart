<?php

namespace App\Listeners;

use App\Events\PlanRequirementSaved;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

use App\Models\Planrequirement;
use App\Models\Course;
use App\Models\Completedcourse;

class UpdatePlanCoursesMap
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
     * @param  PlanRequirementSaved  $event
     * @return void
     */
    public function handle(PlanRequirementSaved $event)
    {
        $requirement = $event->requirement;
        if($requirement->course_id_lock == 0){
          if($requirement->isDirty('course_name')){
            $courses = Course::filterName($requirement->course_name)->get();
            if($courses->count() == 1){
              $course = $courses->first();
              $requirement->course_id = $course->id;
            }
          }
        }
        if($requirement->completedcourse_id_lock == 0){
          if($requirement->isDirty('course_name')){
            $courses = Completedcourse::filterName($requirement->course_name)->get();
            if($courses->count() == 1){
              $course = $courses->first();
              $requirement->completedcourse_id = $course->id;
            }
          }
        }
    }
}
