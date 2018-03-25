<?php

namespace App\Http\Controllers;

use Auth;
use Illuminate\Http\Request;

use League\Fractal\Manager;
use League\Fractal\Resource\Collection;
use League\Fractal\Resource\Item;
use App\JsonSerializer;

use Illuminate\Support\MessageBag;

use App\Models\User;
use App\Models\Student;
use App\Models\Advisor;
use App\Models\Plan;
use App\Models\Semester;
use App\Models\Planrequirement;
use App\Models\Degreeprogram;

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
            return view('flowcharts/index')->with('plans', $plans)->with('student', $user->student);
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
            return redirect('flowcharts');
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

    public function newFlowchart($id = -1){
      if($id < 0){
        abort(404);
      }else{
        $user = Auth::user();
        $plan = new Plan();
        if($user->is_advisor){
          $student = Student::findOrFail($id);
          $plan->student_id = $student->id;
        }else{
          $plan->student_id = $user->student->id;
        }
        $degreeprograms = Degreeprogram::orderBy('name', 'asc')->get();
        $degreeprogramUnknown = new Degreeprogram();
        $degreeprogramUnknown->name = "Unassigned";
        $degreeprogramUnknown->id = 0;
        $degreeprograms->prepend($degreeprogramUnknown);
        $semesters = collect([
          (object)['id' => 0, 'name' => 'Unassigned'],
          (object)['id' => 1, 'name' => 'Spring'],
          (object)['id' => 2, 'name' => 'Summer'],
          (object)['id' => 3, 'name' => 'Fall'],
        ]);
        return view('flowcharts.edit')->with('plan', $plan)->with('semesters', $semesters)->with('degreeprograms', $degreeprograms);
      }
    }

    public function saveNewFlowchart($id = -1, Request $request){
      if($id < 0){
        abort(404);
      }else{
        $user = Auth::user();
        $plan = new Plan();
        $data = $request->all();
        if($user->is_advisor){
          $student = Student::findOrFail($id);
          $data['student_id'] = $student->id;
        }else{
          $data['student_id'] = $user->student->id;
        }

        if($plan->validate($data)){
          $plan->fill($data);
          $plan->save();
          $plan->fillRequirementsFromDegree();
          $request->session()->put('message', trans('messages.item_saved'));
          $request->session()->put('type', 'success');
          return response()->json(url('flowcharts/view/' . $plan->id));
        }else{
          return response()->json($plan->errors(), 422);
        }
      }
    }

    public function resetFlowchart(Request $request){
      $this->validate($request, [
        'id' => 'required|exists:plans',
      ]);
      $user = Auth::user();
      $plan = Plan::findOrFail($request->input('id'));
      if($user->is_advisor || (!$user->is_advisor && $user->student->id == $plan->student_id)){
        $plan->removeRequirements();
        $plan->fillRequirementsFromDegree();
        return response()->json(trans('messages.item_populated'));
      }else{
        abort(404);
      }
    }

    public function deleteFlowchart(Request $request){
      $this->validate($request, [
        'id' => 'required|exists:plans',
      ]);
      $user = Auth::user();
      $plan = Plan::findOrFail($request->input('id'));
      if($user->is_advisor || (!$user->is_advisor && $user->student->id == $plan->student_id)){
        $plan->delete();
        $request->session()->put('message', trans('messages.item_deleted'));
        $request->session()->put('type', 'success');
        return response()->json(trans('messages.item_deleted'));
      }else{
        abort(404);
      }
    }

    public function editFlowchart($id = -1){
      if($id < 0){
        abort(404);
      }else{
        $user = Auth::user();
        $plan = Plan::findOrFail($id);
        if($user->is_advisor || (!$user->is_advisor && $user->student->id == $plan->student_id)){
          $degreeprograms = Degreeprogram::orderBy('name', 'asc')->get();
          $degreeprogramUnknown = new Degreeprogram();
          $degreeprogramUnknown->name = "Unassigned";
          $degreeprogramUnknown->id = 0;
          $degreeprograms->prepend($degreeprogramUnknown);
          $semesters = collect([
            (object)['id' => 0, 'name' => 'Unassigned'],
            (object)['id' => 1, 'name' => 'Spring'],
            (object)['id' => 2, 'name' => 'Summer'],
            (object)['id' => 3, 'name' => 'Fall'],
          ]);
          return view('flowcharts.edit')->with('plan', $plan)->with('semesters', $semesters)->with('degreeprograms', $degreeprograms);
        }else{
          abort(404);
        }
      }
    }

    public function saveFlowchart($id = -1, Request $request){
      if($id < 0){
        abort(404);
      }else{
        $user = Auth::user();
        $plan = Plan::findOrFail($id);
        $data = $request->all();
        if($user->is_advisor || (!$user->is_advisor && $user->student->id == $plan->student_id)){
          $data['student_id'] = $plan->student_id;
          if($plan->validate($data)){
            $plan->fill($data);
            $plan->save();
            return response()->json(trans('messages.item_saved'));
          }else{
            return response()->json($plan->errors(), 422);
          }
        }else{
          abort(404);
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
                'course_id' => $requirement->course_id == null ? 0 : $requirement->course_id,
                'completedcourse_name' => $requirement->completedcourse_id == null ? '' : $requirement->completedcourse->fullTitle,
                'completedcourse_id' => $requirement->completedcourse_id == null ? 0 : $requirement->completedcourse_id,
                'course_id_lock' => $requirement->course_id_lock,
                'completedcourse_id_lock' => $requirement->completedcourse_id_lock,
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

          if($request->has('planrequirement_id')){
            $planrequirement = Planrequirement::findOrFail($request->input('planrequirement_id'));

            if($planrequirement->plan_id != $plan->id){
              //can't edit course not on the plan;
              abort(404);
            }
            if($planrequirement->degreerequirement_id == null){
              $data = $request->all();
              if(isset($data['course_id']) && $data['course_id'] == 0){
                $data['course_id'] = null;
              }
              if(isset($data['electivelist_id']) && $data['electivelist_id'] == 0){
                $data['electivelist_id'] = null;
              }
              if(isset($data['completedcourse_id']) && $data['completedcourse_id'] == 0){
                $data['completedcourse_id'] = null;
              }
              if($planrequirement->customEditValidate($data, array($planrequirement->plan->student_id))){
                $planrequirement->fill($data);
                if($planrequirement->validateElectiveCourse()){
                  $planrequirement->save();
                  return response()->json(trans('messages.item_saved'));
                }else{
                  $errors = new MessageBag();
                  $errors->add('course_name', 'Course is not listed in selected elective list');
                  return response()->json($errors, 422);
                }
              }else{
                return response()->json($planrequirement->errors(), 422);
              }
            }else{
              //is not custom, so only certain fields can be updated
              if($planrequirement->electivelist_id == null){
                //has no elective list, so course name cannot be changed
                $data = $request->only(['notes', 'completedcourse_id', 'course_id', 'course_id_lock', 'completedcourse_id_lock']);
              }else{
                $data = $request->only(['notes', 'completedcourse_id', 'course_id', 'course_name', 'course_id_lock', 'completedcourse_id_lock']);
              }
              if(isset($data['course_id']) && $data['course_id'] == 0){
                $data['course_id'] = null;
              }
              if(isset($data['completedcourse_id']) && $data['completedcourse_id'] == 0){
                $data['completedcourse_id'] = null;
              }
              if($planrequirement->defaultEditValidate($data, array($planrequirement->plan->student_id))){
                $planrequirement->fill($data);
                if($planrequirement->validateElectiveCourse()){
                  $planrequirement->save();
                  return response()->json(trans('messages.item_saved'));
                }else{
                  $errors = new MessageBag();
                  $errors->add('course_name', 'Course is not listed in selected elective list');
                  return response()->json($errors, 422);
                }
              }else{
                return response()->json($planrequirement->errors(), 422);
              }
            }
          }else{
            //new requirement
            $planrequirement = new PlanRequirement();
            $data = $request->all();
            if(isset($data['course_id']) && $data['course_id'] == 0){
              $data['course_id'] = null;
            }
            if(isset($data['electivelist_id']) && $data['electivelist_id'] == 0){
              $data['electivelist_id'] = null;
            }
            if(isset($data['completedcourse_id']) && $data['completedcourse_id'] == 0){
              $data['completedcourse_id'] = null;
            }
            if($planrequirement->customEditValidate($data, array($plan->student_id))){
              $planrequirement->fill($data);
              $semester = $plan->semesters->sortByDesc('ordering')->first();
              $planrequirement->semester_id = $semester->id;
              $planrequirement->ordering = $semester->requirements->sortByDesc('ordering')->first()->ordering + 1;
              $planrequirement->plan_id = $plan->id;
              $planrequirement->save();
              return response()->json(trans('messages.item_saved'));
            }else{
              return response()->json($planrequirement->errors(), 422);
            }
          }
        }else{
          //cannot edit a plan if you aren't the student or an advisor
          abort(404);
        }
      }
    }

    public function postCourseDelete(Request $request, $id = -1){
      if($id < 0){
        //id not found
        abort(404);
      }else{
        $user = Auth::user();
        $plan = Plan::findOrFail($id);
        if($user->is_advisor || (!$user->is_advisor && $user->student->id == $plan->student_id)){

          if($request->has('planrequirement_id')){
            $planrequirement = Planrequirement::findOrFail($request->input('planrequirement_id'));

            if($planrequirement->plan_id != $plan->id){
              //can't edit course not on the plan;
              abort(404);
            }
            if($planrequirement->degreerequirement_id == null){
              $planrequirement->delete();
              return response()->json(trans('messages.item_deleted'));
            }else{
              return response()->json(trans('errors.default_req'), 403);
            }
          }else{
            abort(404);
          }
        }else{
          //cannot edit a plan if you aren't the student or an advisor
          abort(404);
        }
      }
    }

}
