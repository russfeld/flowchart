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
          if($requirement->electivelist_id === null){
            return[
                'id' => $requirement->id,
                'notes' => $requirement->notes,
                'semester' => $requirement->semester->ordering . " - " . $requirement->semester->name,
                'ordering' => $requirement->ordering,
                'credits' => $requirement->credits,
                'name' => $requirement->course_name,
            ];
          }else if(!empty($requirement->course_name)){
            return[
                'id' => $requirement->id,
                'notes' => $requirement->notes,
                'semester' => $requirement->semester->ordering . " - " . $requirement->semester->name,
                'ordering' => $requirement->ordering,
                'credits' => $requirement->credits,
                'name' => $requirement->course_name . " from " . $requirement->electivelist->name,
            ];
          }else{
            return[
                'id' => $requirement->id,
                'notes' => $requirement->notes,
                'semester' => $requirement->semester->ordering . " - " . $requirement->semester->name,
                'ordering' => $requirement->ordering,
                'credits' => $requirement->credits,
                'name' => $requirement->electivelist->name,
            ];
          }
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
        if($requirement->electivelist_id === null){
          return[
              'id' => $requirement->id,
              'notes' => $requirement->notes,
              'semester_id' => $requirement->semester->id,
              'ordering' => $requirement->ordering,
              'credits' => $requirement->credits,
              'type' => 'course',
              'course_name' => $requirement->course_name,
              'degreerequirement_id' => $requirement->degreerequirement_id == null ? '' : $requirement->degreerequirement_id,
          ];
        }else{
          return[
              'id' => $requirement->id,
              'notes' => $requirement->notes,
              'semester_id' => $requirement->semester->id,
              'ordering' => $requirement->ordering,
              'credits' => $requirement->credits,
              'type' => 'electivelist',
              'course_name' => $requirement->course_name,
              'electivelist_id' => $requirement->electivelist->id,
              'electivelist_name' => $requirement->electivelist->name,
              'degreerequirement_id' => $requirement->degreerequirement_id == null ? '' : $requirement->degreerequirement_id,
          ];
        }
      });
      $this->fractal->setSerializer(new JsonSerializer());
      return $this->fractal->createData($resource)->toJson();
    }
  }

  public function postNewplanrequirement(Request $request){
    $data = $request->all();
    $planrequirement = new Planrequirement();
    if($planrequirement->validateWithParams($data, array(-1, $data['plan_id']))){
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
      if($planrequirement->validateWithParams($data, array($id, $data['plan_id']))){
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
    $request->session()->put('message', trans('messages.item_deleted'));
    $request->session()->put('type', 'success');
    return response()->json(trans('messages.item_deleted'));
  }
}
