<?php

namespace App\Http\Controllers\Dashboard;

use Illuminate\Http\Request;

use App\Http\Controllers\Controller;

use App\Models\Degreeprogram;
use App\Models\Plan;

class PlansController extends Controller
{
  public function __construct()
  {
    $this->middleware('cas');
    $this->middleware('update_profile');
    $this->middleware('advisors_only');
  }

  public function getPlans(Request $request, $id = -1){
    if($id < 0){
      if($request->has('deleted')){
        $plans = Plan::with('degreeprogram', 'student')->onlyTrashed()->get();
        return view('dashboard.plans')->with('plans', $plans)->with('page_title', "Deleted Plans");
      }else{
        $plans = Plan::with('degreeprogram', 'student')->get();
        $deleted = Plan::onlyTrashed()->count();
        return view('dashboard.plans')->with('plans', $plans)->with('page_title', "Plans")->with('deleted', $deleted);
      }
    }else{
      $plan = Plan::withTrashed()->findOrFail($id);
      $degreeprograms = Degreeprogram::all();
      $semesters = collect([
        (object)['id' => 0, 'name' => 'Unassigned'],
        (object)['id' => 1, 'name' => 'Spring'],
        (object)['id' => 2, 'name' => 'Summer'],
        (object)['id' => 3, 'name' => 'Fall'],
      ]);
      return view('dashboard.planedit')->with('plan', $plan)->with('page_title', "Edit Plan")->with('semesters', $semesters)->with('degreeprograms', $degreeprograms);
    }
  }

  public function getPlanDetail(Request $request, $id = -1){
    if($id < 0){
      return redirect ('admin/plans');
    }else{
      $plan = Plan::withTrashed()->findOrFail($id);
      return view('dashboard.plandetail')->with('plan', $plan)->with('page_title', "Plan Details");
    }
  }

  public function getNewplan(){
      $plan = new Plan();
      $degreeprograms = Degreeprogram::all();
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
      return view('dashboard.planedit')->with('plan', $plan)->with('page_title', "New Plan")->with('semesters', $semesters)->with('degreeprograms', $degreeprograms);
  }

  public function postPlans($id = -1, Request $request){
    if($id < 0){
      abort(404);
    }else{
      $data = $request->all();
      $plan = Plan::findOrFail($id);
      if($plan->validate($data)){
        $plan->fill($data);
        $plan->save();
        return response()->json(trans('messages.item_saved'));
      }else{
        return response()->json($plan->errors(), 422);
      }
    }
  }

  public function postNewplan(Request $request){
    $data = $request->all();
    $plan = new Plan();
    if($plan->validate($data)){
      $plan->fill($data);
      $plan->save();
      return response()->json(url('admin/plans/' . $plan->id));
    }else{
      return response()->json($plan->errors(), 422);
    }
  }

  public function postDeleteplan(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:plans',
    ]);
    $plan = Plan::findOrFail($request->input('id'));
    $plan->delete();
    $request->session()->put('message', trans('messages.item_deleted'));
    $request->session()->put('type', 'success');
    return response()->json(trans('messages.item_deleted'));
  }

  public function postRestoreplan(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:plans',
    ]);
    $plan = Plan::withTrashed()->findOrFail($request->input('id'));
    $plan->restore();
    $request->session()->put('message', trans('messages.item_restored'));
    $request->session()->put('type', 'success');
    return response()->json(trans('messages.item_restored'));
  }

  public function postForcedeleteplan(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:plans',
    ]);
    $plan = Plan::withTrashed()->findOrFail($request->input('id'));
    if($plan->trashed()){
      foreach($plan->requirements()->get() as $requirement){
        $requirement->requireable()->delete();
        $requirement->delete();
      }
      $plan->forceDelete();
      $request->session()->put('message', trans('messages.item_forcedeleted'));
      $request->session()->put('type', 'success');
      return response()->json(trans('messages.item_forcedeleted'));
    }else{
      return response()->json(trans('errors.not_trashed'), 404);
    }
  }

}
