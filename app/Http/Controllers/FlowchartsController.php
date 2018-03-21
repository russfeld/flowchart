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
use App\Models\Planrequirement;

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
            return[
                'id' => $requirement->id,
                'notes' => $requirement->notes,
                'semester_id' => $requirement->semester_id,
                'ordering' => $requirement->ordering,
                'credits' => $requirement->credits,
                'name' => empty($requirement->course_name) ? '' : $requirement->course_name,
                'electivelist_name' => $requirement->electivelist_id === null ? '' : $requirement->electivelist->name,
                'electivelist_abbr' => $requirement->electivelist_id === null ? '' : $requirement->electivelist->abbreviation,
                'electivelist_id' => $requirement->electivelist_id === null ? 0 : $requirement->electivelist_id,
                'degreerequirement_id' => $requirement->degreerequirement_id == null ? 0 : $requirement->degreerequirement_id,
                'course_name' => $requirement->course_id == null ? '' : $requirement->course->fullTitle,
                'course_id' => $requirement->course_id == null ? -1 : $requirement->course_id,
                'completedcourse_name' => $requirement->completedcourse_id == null ? '' : $requirement->completedcourse->fullTitle,
                'completedcourse_id' => $requirement->completedcourse_id == null ? 0 : $requirement->completedcourse_id,
            ];
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

    public function postSemesterMove(Request $request, $id = -1){
      if($id < 0){
        //id not found
        abort(404);
      }else{
        $user = Auth::user();
        $plan = Plan::with('semesters')->findOrFail($id);
        if($user->is_advisor || (!$user->is_advisor && $user->student->id == $plan->student_id)){
          $semesters = $plan->semesters;

          $ordering = collect($request->input('ordering'));

          if($semesters->count() != $ordering->count()){
            abort(404);
          }

          $maxOrder = $semesters->max('ordering') + 1;

          foreach($ordering as $key => $order){
            $semester = $semesters->where('id', $order['id'])->first();
            if($semester->ordering != $key){
              $semester->ordering = $key + $maxOrder;
              $semester->save();
            }
          }

          foreach($semesters as $semester){
            if($semester->ordering >= $maxOrder){
              $semester->ordering = $semester->ordering - $maxOrder;
              $semester->save();
            }
          }

          return response()->json(trans('messages.item_saved'));
        }else{
          //cannot edit a plan if you aren't the student or an advisor
          abort(404);
        }
      }
    }

    public function postCourseMove(Request $request, $id = -1){
      if($id < 0){
        //id not found
        abort(404);
      }else{
        $user = Auth::user();
        $plan = Plan::findOrFail($id);
        if($user->is_advisor || (!$user->is_advisor && $user->student->id == $plan->student_id)){
          //move requirement to new semester
          $requirement_moved = Planrequirement::findOrFail($request->input('course_id'));
          if($requirement_moved->plan_id != $plan->id){
            //can't move course not on the plan;
            abort(404);
          }

          $semester = Semester::findOrFail($request->input('semester_id'));
          if($semester->plan_id != $plan->id){
            //can't move course to semester not on the plan;
            abort(404);
          }

          //move requirement to new semester
          if($requirement_moved->semester_id != $semester->id){
            $maxOrder = $semester->requirements->max('ordering') + 1;
            $requirement_moved->semester_id = $semester->id;
            $requirement_moved->ordering = $maxOrder;
            $requirement_moved->save();
          }

          //get all requirements for that semester to reorder
          $requirements = $semester->fresh()->requirements;

          $ordering = collect($request->input('ordering'));

          if($requirements->count() != $ordering->count()){
            abort(404);
          }

          $maxOrder = $requirements->max('ordering') + 1;

          foreach($ordering as $key => $order){
            $requirement = $requirements->where('id', $order['id'])->first();
            if($requirement->ordering != $key){
              $requirement->ordering = $key + $maxOrder;
              $requirement->save();
            }
          }

          foreach($requirements as $requirement){
            if($requirement->ordering >= $maxOrder){
              $requirement->ordering = $requirement->ordering - $maxOrder;
              $requirement->save();
            }
          }

          return response()->json(trans('messages.item_saved'));
        }else{
          //cannot edit a plan if you aren't the student or an advisor
          abort(404);
        }
      }
    }

    public function postCourseSave(Request $request, $id = -1){
      if($id < 0){
        //id not found
        abort(404);
      }else{
        $user = Auth::user();
        $plan = Plan::findOrFail($id);
        if($user->is_advisor || (!$user->is_advisor && $user->student->id == $plan->student_id)){
          $data = $request->all();
          if($request->has('planrequirement_id')){
            $planrequirement = Planrequirement::findOrFail($data['planrequirement_id']);
            if($planrequirement->degreerequirement_id == null){
              if($planrequirement->customEditValidate($data, array($planrequirement->plan->student_id))){
                $planrequirement->fill($data);
                if(!$request->has("electivelist_id")){
                  $planrequirement->electivelist_id = null;
                }
                $planrequirement->save();
                return response()->json(trans('messages.item_saved'));
              }else{
                return response()->json($planrequirement->errors(), 422);
              }
            }else{
              //is not custom, so only certain fields can be updated
            }
          }else{
            //new requirement
          }

          abort(403);
        }else{
          //cannot edit a plan if you aren't the student or an advisor
          abort(404);
        }
      }
    }

}
