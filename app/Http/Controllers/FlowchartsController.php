<?php

namespace App\Http\Controllers;

use Auth;
use Illuminate\Http\Request;

use League\Fractal\Manager;
use League\Fractal\Resource\Collection;
use League\Fractal\Resource\Item;
use App\JsonSerializer;

use App\Models\User;
use App\Models\Student;
use App\Models\Advisor;
use App\Models\Plan;
use App\Models\Semester;

class FlowchartsController extends Controller
{

  public function __construct()
	{
		$this->middleware('cas');
		$this->middleware('update_profile');
    $this->fractal = new Manager();
	}
    /**
     * Responds to requests to GET /courses
     */
    public function getIndex($id = -1)
    {
        $user = Auth::user();

        if($id < 0){
          //no particular student requested
          if($user->is_advisor){
            //if advisor, show all students
            $students = $user->advisor->students;
            $students->load('plans');
            return view('flowcharts/studentlist')->with('students', $students);
          }else{
            //if student, show their plans
            $plans = $user->student->plans;
            return view('flowcharts/index')->with('plans', $plans)->with('student', $user->$student);
          }
        }else{
          //currently authenticated user is an advisor and selecting a particular student
          if($user->is_advisor){
            //since they are an advisor, show that student's plans
            $student = Student::findOrFail($id);
            $plans = $student->plans;
            return view('flowcharts/index')->with('plans', $plans)->with('student', $student);

          //
          }else{
            //if they are not an advisor, redirect to their own page
            return redirect('flowcharts/index');
          }
        }
    }

    public function getFlowchart($id = -1){
      if($id < 0){
        //no ID provided - redirect back to index
        return redirect('flowcharts/index');
      }else{
        $user = Auth::user();
        $plan = Plan::findOrFail($id);
        if($user->is_advisor){
          return view('flowcharts/flowchart')->with('plan', $plan);
        }else{
          if($plan->student_id == $user->student->id){
            return view('flowcharts/flowchart')->with('plan', $plan);
          }else{
            abort(404);
          }
        }
      }
    }

    public function getFlowchartData($id = -1){
      if($id < 0){
        abort(404);
      }else{
        $user = Auth::user();
        $plan = Plan::with('requirements.electivelist')->findOrFail($id);
        if($user->is_advisor || (!$user->is_advisor && $user->student->id == $plan->student_id)){
          $resource = new Collection($plan->requirements, function($requirement) {
              if($requirement->electivelist_id === null){
                return[
                    'id' => $requirement->id,
                    'notes' => $requirement->notes,
                    'semester_id' => $requirement->semester_id,
                    'ordering' => $requirement->ordering,
                    'credits' => $requirement->credits,
                    'name' => $requirement->course_name,
                    'electivelist_name' => '',
                    'electivelist_id' => -1,
                    'degreerequirement_id' => $requirement->degreerequirement_id == null ? '' : $requirement->degreerequirement_id,
                ];
              }else if(!empty($requirement->course_name)){
                return[
                    'id' => $requirement->id,
                    'notes' => $requirement->notes,
                    'semester_id' => $requirement->semester_id,
                    'ordering' => $requirement->ordering,
                    'credits' => $requirement->credits,
                    'name' => $requirement->course_name,
                    'electivelist_name' => $requirement->electivelist->abbreviation,
                    'electivelist_id' => $requirement->electivelist_id,
                    'degreerequirement_id' => $requirement->degreerequirement_id == null ? '' : $requirement->degreerequirement_id,
                ];
              }else{
                return[
                    'id' => $requirement->id,
                    'notes' => $requirement->notes,
                    'semester_id' => $requirement->semester_id,
                    'ordering' => $requirement->ordering,
                    'credits' => $requirement->credits,
                    'name' => '',
                    'electivelist_name' => $requirement->electivelist->abbreviation,
                    'electivelist_id' => $requirement->electivelist_id,
                    'degreerequirement_id' => $requirement->degreerequirement_id == null ? '' : $requirement->degreerequirement_id,
                ];
              }
          });
          $this->fractal->setSerializer(new JsonSerializer());
          return $this->fractal->createData($resource)->toJson();
        }else{
          abort(404);
        }
      }
    }

    public function getSemesterData($id = -1){
      if($id < 0){
        abort(404);
      }else{
        $user = Auth::user();
        $plan = Plan::with('semesters')->findOrFail($id);
        if($user->is_advisor || (!$user->is_advisor && $user->student->id == $plan->student_id)){
          $resource = new Collection($plan->semesters, function($semester) {
              return[
                  'id' => $semester->id,
                  'name' => $semester->name,
                  'ordering' => $semester->ordering,
                  'courses' => array(),
              ];
          });
          $this->fractal->setSerializer(new JsonSerializer());
          return $this->fractal->createData($resource)->toJson();
        }else{
          abort(404);
        }
      }
    }

    public function postSemesterSave(Request $request, $id = -1){
      if($id < 0){
        //id not found
        abort(404);
      }else{
        $user = Auth::user();
        $plan = Plan::with('semesters')->findOrFail($id);
        if($user->is_advisor || (!$user->is_advisor && $user->student->id == $plan->student_id)){
          $semester = Semester::findOrFail($request->input('id'));
          if($semester->plan_id == $id){
            $semester->name = $request->input('name');
            $semester->save();
            return response()->json(trans('messages.item_saved'));
          }else{
            //semester id does not match plan id given
            abort(404);
          }
        }else{
          //cannot edit a plan if you aren't the student or an advisor
          abort(404);
        }
      }
    }

    public function postSemesterDelete(Request $request, $id = -1){
      if($id < 0){
        //id not found
        abort(404);
      }else{
        $user = Auth::user();
        $plan = Plan::with('semesters')->findOrFail($id);
        if($user->is_advisor || (!$user->is_advisor && $user->student->id == $plan->student_id)){
          $semester = Semester::findOrFail($request->input('id'));
          if($semester->plan_id == $id){
            $semester->delete();
            return response()->json(trans('messages.item_deleted'));
          }else{
            //semester id does not match plan id given
            abort(404);
          }
        }else{
          //cannot edit a plan if you aren't the student or an advisor
          abort(404);
        }
      }
    }

    public function postSemesterAdd(Request $request, $id = -1){
      if($id < 0){
        //id not found
        abort(404);
      }else{
        $user = Auth::user();
        $plan = Plan::with('semesters')->findOrFail($id);
        if($user->is_advisor || (!$user->is_advisor && $user->student->id == $plan->student_id)){
          $semester = new Semester();
          $semester->plan_id = $plan->id;
          $semester->name = "New Semester";
          $semester->ordering = $plan->semesters->max('ordering') + 1;
          $semester->save();
          $resource = new Item($semester, function($semester) {
              return[
                  'id' => $semester->id,
                  'name' => $semester->name,
                  'ordering' => $semester->ordering,
                  'courses' => array(),
              ];
          });
          $this->fractal->setSerializer(new JsonSerializer());
          return $this->fractal->createData($resource)->toJson();
        }else{
          //cannot edit a plan if you aren't the student or an advisor
          abort(404);
        }
      }
    }

}
