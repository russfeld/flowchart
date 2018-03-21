<?php

namespace App\Http\Controllers\Dashboard;

use League\Fractal\Manager;
use League\Fractal\Resource\Collection;
use League\Fractal\Resource\Item;
use App\JsonSerializer;

use Illuminate\Http\Request;

use App\Http\Controllers\Controller;

use App\Models\Plan;
use App\Models\Planrequirement;

class PlanrequirementsController extends Controller
{

  public function __construct()
  {
    $this->middleware('cas');
    $this->middleware('update_profile');
    $this->middleware('advisors_only');
    $this->fractal = new Manager();
  }

  public function getPlanrequirementsForPlan(Request $request, $id = -1){
    if($id < 0){
      abort(404);
    }else{
      $plan = Plan::withTrashed()->with('requirements')->findOrFail($id);
      $resource = new Collection($plan->requirements, function($requirement) {
        return[
            'id' => $requirement->id,
            'notes' => $requirement->notes,
            'semester' => $requirement->semester->ordering . " - " . $requirement->semester->name,
            'ordering' => $requirement->ordering,
            'credits' => $requirement->credits,
            'name' => $requirement->course_name,
            'electivelist_abbr' => $requirement->electivelist_id === null ? '' : $requirement->electivelist->abbreviation,
            'catalog_course' => $requirement->course_id == null ? '' : $requirement->course->shortTitle,
            'completed_course' => $requirement->completedcourse_id == null ? '' : $requirement->completedcourse->fullTitle,
        ];
      });
      $this->fractal->setSerializer(new JsonSerializer());
      return $this->fractal->createData($resource)->toJson();
    }
  }

  public function getPlanrequirement(Request $request, $id = -1){
    if($id < 0){
      abort(404);
    }else{
      $planrequirement = Planrequirement::findOrFail($id);

      $resource = new Item($planrequirement, function($requirement) {
        return[
            'id' => $requirement->id,
            'notes' => $requirement->notes,
            'semester_id' => $requirement->semester->id,
            'ordering' => $requirement->ordering,
            'credits' => $requirement->credits,
            'course_name' => $requirement->course_name,
            'electivelist_name' => $requirement->electivelist_id === null ? '' : $requirement->electivelist->name,
            'electivelist_id' => $requirement->electivelist_id === null ? 0 : $requirement->electivelist_id,
            'degreerequirement_id' => $requirement->degreerequirement_id == null ? '' : $requirement->degreerequirement_id,
            'catalog_course' => $requirement->course_id == null ? '' : $requirement->course->fullTitle,
            'course_id' => $requirement->course_id == null ? 0 : $requirement->course_id,
            'completed_course' => $requirement->completedcourse_id == null ? '' : $requirement->completedcourse->fullTitle,
            'completedcourse_id' => $requirement->completedcourse_id == null ? 0 : $requirement->completedcourse_id,
        ];
      });
      $this->fractal->setSerializer(new JsonSerializer());
      return $this->fractal->createData($resource)->toJson();
    }
  }

  public function postNewplanrequirement(Request $request){
    $data = $request->all();
    $planrequirement = new Planrequirement();
    if($planrequirement->validateWithParams($data, array(-1, $data['plan_id'], $data['student_id']))){
      $planrequirement->fill($data);
      if(!$request->has("electivelist_id")){
        $planrequirement->electivelist_id = null;
      }
      $planrequirement->save();
      return response()->json(trans('messages.item_saved'));
    }else{
      return response()->json($planrequirement->errors(), 422);
    }
  }

  public function postPlanrequirement(Request $request, $id = -1){
    if($id < 0){
      abort(404);
    }else{
      $data = $request->all();
      $planrequirement = Planrequirement::findOrFail($id);
      if(isset($data['course_id']) && $data['course_id'] == 0){
        $data['course_id'] = null;
      }
      if(isset($data['electivelist_id']) && $data['electivelist_id'] == 0){
        $data['electivelist_id'] = null;
      }
      if(isset($data['completedcourse_id']) && $data['completedcourse_id'] == 0){
        $data['completedcourse_id'] = null;
      }
      if($planrequirement->validateWithParams($data, array($id, $data['plan_id'], $data['student_id']))){
        $planrequirement->fill($data);
        if(!$request->has("electivelist_id")){
          $planrequirement->electivelist_id = null;
        }
        $planrequirement->save();
        return response()->json(trans('messages.item_saved'));
      }else{
        return response()->json($planrequirement->errors(), 422);
      }
    }
  }

  public function postDeleteplanrequirement(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:planrequirements',
    ]);
    $planrequirement = Planrequirement::findOrFail($request->input('id'));
    $planrequirement->delete();
    return response()->json(trans('messages.item_deleted'));
  }
}
