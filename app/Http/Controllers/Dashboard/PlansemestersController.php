<?php

namespace App\Http\Controllers\Dashboard;

use League\Fractal\Manager;
use League\Fractal\Resource\Collection;
use League\Fractal\Resource\Item;
use App\JsonSerializer;

use Illuminate\Http\Request;

use App\Http\Controllers\Controller;

use App\Models\Plan;
use App\Models\Semester;

class PlansemestersController extends Controller
{

  public function __construct()
  {
    $this->middleware('cas');
    $this->middleware('update_profile');
    $this->middleware('advisors_only');
    $this->fractal = new Manager();
  }

  public function getPlansemestersForPlan(Request $request, $id = -1){
    if($id < 0){
      abort(404);
    }else{
      $plan = Plan::withTrashed()->with('semesters')->findOrFail($id);
      $resource = new Collection($plan->semesters, function($semester) {
          return[
              'id' => $semester->id,
              'name' => $semester->name,
              'number' => $semester->number,
              'ordering' => $semester->ordering,
          ];
      });
      $this->fractal->setSerializer(new JsonSerializer());
      return $this->fractal->createData($resource)->toJson();
    }
  }

  public function getPlanSemester($id = -1){
    if($id < 0){
      abort(404);
    }else{
      $semester = Semester::findOrFail($id);
      return view('dashboard.plansemesteredit')->with('semester', $semester)->with('plan_id', $semester->plan_id);
    }
  }

  public function getNewPlanSemester($id = -1){
    if($id < 0){
      abort(404);
    }else{
      $semester = new Semester();
      return view('dashboard.plansemesteredit')->with('semester', $semester)->with('plan_id', $id);
    }
  }

  public function postNewPlanSemester(Request $request){
    $data = $request->all();
    $semester = new Semester();
    if($semester->validate($data)){
      $semester->fill($data);
      $semester->save();
      $request->session()->put('message', trans('messages.item_saved'));
      $request->session()->put('type', 'success');
      return response()->json(url('admin/plans/plansemester/' . $semester->id));
    }else{
      return response()->json($semester->errors(), 422);
    }
  }

  public function postPlanSemester(Request $request, $id = -1){
    if($id < 0){
      abort(404);
    }else{
      $data = $request->all();
      $semester = Semester::findOrFail($id);
      if($semester->validate($data)){
        $semester->fill($data);
        $semester->save();
        return response()->json(trans('messages.item_saved'));
      }else{
        return response()->json($semester->errors(), 422);
      }
    }
  }

  public function postDeletePlanSemester(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:semesters',
    ]);
    $semester = Semester::findOrFail($request->input('id'));
    $semester->delete();
    $request->session()->put('message', trans('messages.item_deleted'));
    $request->session()->put('type', 'success');
    return response()->json(trans('messages.item_deleted'));
  }
}
