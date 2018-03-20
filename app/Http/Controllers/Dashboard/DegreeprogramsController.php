<?php

namespace App\Http\Controllers\Dashboard;

use Illuminate\Http\Request;

use App\Http\Controllers\Controller;

use App\Models\Degreeprogram;
use App\Models\Department;

class DegreeprogramsController extends Controller
{
  public function __construct()
  {
    $this->middleware('cas');
    $this->middleware('update_profile');
    $this->middleware('advisors_only');
  }

  public function getDegreeprograms(Request $request, $id = -1){
      if($id < 0){
        if($request->has('deleted')){
          $degreeprograms = Degreeprogram::with('department')->onlyTrashed()->get();
          return view('dashboard.degreeprograms')->with('degreeprograms', $degreeprograms)->with('page_title', "Deleted Degree Programs");
        }else{
          $degreeprograms = Degreeprogram::with('department')->get();
          $deleted = Degreeprogram::onlyTrashed()->count();
          return view('dashboard.degreeprograms')->with('degreeprograms', $degreeprograms)->with('page_title', "Degree Programs")->with('deleted', $deleted);
        }
      }else{
        $degreeprogram = Degreeprogram::withTrashed()->findOrFail($id);
        $departments = Department::orderBy('name', 'asc')->get();
        $deptUnknown = new Department();
        $deptUnknown->name = "Unassigned";
        $deptUnknown->id = 0;
        $departments->prepend($deptUnknown);
        $semesters = collect([
          (object)['id' => 0, 'name' => 'Unassigned'],
          (object)['id' => 1, 'name' => 'Spring'],
          (object)['id' => 2, 'name' => 'Summer'],
          (object)['id' => 3, 'name' => 'Fall'],
        ]);
        return view('dashboard.degreeprogramedit')->with('degreeprogram', $degreeprogram)->with('page_title', "Edit Degree Program")->with('departments', $departments)->with('semesters', $semesters);
      }
  }

  public function getDegreeprogramDetail(Request $request, $id = -1){
    if($id < 0){
      return redirect ('admin/degreeprograms');
    }else{
      $degreeprogram = Degreeprogram::withTrashed()->findOrFail($id);
      return view('dashboard.degreeprogramdetail')->with('degreeprogram', $degreeprogram)->with('page_title', "Degree Program Details");
    }
  }

  public function getNewdegreeprogram(){
      $degreeprogram = new DegreeProgram();
      $departments = Department::orderBy('name', 'asc')->get();
      $deptUnknown = new Department();
      $deptUnknown->name = "Unassigned";
      $deptUnknown->id = 0;
      $departments->prepend($deptUnknown);
      $semesters = collect([
        (object)['id' => 0, 'name' => 'Unassigned'],
        (object)['id' => 1, 'name' => 'Spring'],
        (object)['id' => 2, 'name' => 'Summer'],
        (object)['id' => 3, 'name' => 'Fall'],
      ]);
      return view('dashboard.degreeprogramedit')->with('degreeprogram', $degreeprogram)->with('page_title', "New Degree Program")->with('departments', $departments)->with('semesters', $semesters);
  }

  public function postDegreeprograms($id = -1, Request $request){
    if($id < 0){
      abort(404);
    }else{
      $data = $request->all();
      $degreeprogram = Degreeprogram::findOrFail($id);
      if($degreeprogram->validate($data)){
        $degreeprogram->fill($data);
        $degreeprogram->save();
        return response()->json(trans('messages.item_saved'));
      }else{
        return response()->json($degreeprogram->errors(), 422);
      }
    }
  }

  public function postNewdegreeprogram(Request $request){
    $data = $request->all();
    $degreeprogram = new Degreeprogram();
    if($degreeprogram->validate($data)){
      $degreeprogram->fill($data);
      $degreeprogram->save();
      $request->session()->put('message', trans('messages.item_saved'));
      $request->session()->put('type', 'success');
      return response()->json(url('admin/degreeprograms/' . $degreeprogram->id));
    }else{
      return response()->json($degreeprogram->errors(), 422);
    }
  }

  public function postDeletedegreeprogram(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:degreeprograms',
    ]);
    $degreeprogram = Degreeprogram::findOrFail($request->input('id'));
    $degreeprogram->delete();
    $request->session()->put('message', trans('messages.item_deleted'));
    $request->session()->put('type', 'success');
    return response()->json(trans('messages.item_deleted'));
  }

  public function postRestoredegreeprogram(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:degreeprograms',
    ]);
    $degreeprogram = Degreeprogram::withTrashed()->findOrFail($request->input('id'));
    $degreeprogram->restore();
    $request->session()->put('message', trans('messages.item_restored'));
    $request->session()->put('type', 'success');
    return response()->json(trans('messages.item_restored'));
  }

  public function postForcedeletedegreeprogram(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:degreeprograms',
    ]);
    $degreeprogram = Degreeprogram::withTrashed()->findOrFail($request->input('id'));
    if($degreeprogram->trashed()){
      foreach($degreeprogram->requirements()->get() as $requirement){
        $requirement->delete();
      }
      foreach($degreeprogram->plans()->get() as $plan){
        $plan->degreeprogram_id = null;
        $plan->save();
      }
      $degreeprogram->forceDelete();
      $request->session()->put('message', trans('messages.item_forcedeleted'));
      $request->session()->put('type', 'success');
      return response()->json(trans('messages.item_forcedeleted'));
    }else{
      return response()->json(trans('errors.not_trashed'), 404);
    }
  }

}
