<?php

namespace App\Http\Controllers\Dashboard;

use Illuminate\Http\Request;

use App\Http\Controllers\Controller;

use App\Models\Department;

class DepartmentsController extends Controller
{
  public function __construct()
  {
    $this->middleware('cas');
    $this->middleware('update_profile');
    $this->middleware('advisors_only');
  }

  public function getDepartments(Request $request, $id = -1){
    if($id < 0){
      if($request->has('deleted')){
        $departments = Department::onlyTrashed()->get();
        return view('dashboard.departments')->with('departments', $departments)->with('page_title', "Deleted Departments");
      }else{
        $departments = Department::all();
        $deleted = Department::onlyTrashed()->count();
        return view('dashboard.departments')->with('departments', $departments)->with('page_title', "Departments")->with('deleted', $deleted);
      }
    }else{
      $department = Department::withTrashed()->findOrFail($id);
      return view('dashboard.departmentedit')->with('department', $department)->with('page_title', "Edit Department");
    }
  }

  public function getNewdepartment(){
    $department = new Department();
    return view('dashboard.departmentedit')->with('department', $department)->with('page_title', "New Department");
  }

  public function postDepartments($id = -1, Request $request){
    if($id < 0){
      abort(404);
    }else{
      $data = $request->all();
      $department = Department::findOrFail($id);
      if($department->validate($data)){
        $department->fill($data);
        $department->save();
        return response()->json(trans('messages.item_saved'));
      }else{
        return response()->json($department->errors(), 422);
      }
    }
  }

  public function postNewdepartment(Request $request){
    $data = $request->all();
    $department = new Department();
    if($department->validate($data)){
      $department->fill($data);
      $department->save();
      $request->session()->put('message', trans('messages.item_saved'));
      $request->session()->put('type', 'success');
      return response()->json(url('admin/departments/' . $department->id));
    }else{
      return response()->json($department->errors(), 422);
    }
  }

  public function postDeletedepartment(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:departments',
    ]);
    $department = Department::findOrFail($request->input('id'));
    $department->delete();
    $request->session()->put('message', trans('messages.item_deleted'));
    $request->session()->put('type', 'success');
    return response()->json(trans('messages.item_deleted'));
  }

  public function postRestoredepartment(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:departments',
    ]);
    $department = Department::withTrashed()->findOrFail($request->input('id'));
    $department->restore();
    $request->session()->put('message', trans('messages.item_restored'));
    $request->session()->put('type', 'success');
    return response()->json(trans('messages.item_restored'));
  }

  public function postForcedeletedepartment(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:departments',
    ]);
    $department = Department::withTrashed()->findOrFail($request->input('id'));
    if($department->trashed()){
      foreach($department->students()->get() as $student){
        $student->department_id = null;
        $student->save();
      }
      foreach($department->advisors()->get() as $advisor){
        $advisor->department_id = null;
        $advisor->save();
      }
      foreach($department->programs()->get() as $program){
        $program->department_id = null;
        $program->save();
      }
      $department->forceDelete();
      $request->session()->put('message', trans('messages.item_forcedeleted'));
      $request->session()->put('type', 'success');
      return response()->json(trans('messages.item_forcedeleted'));
    }else{
      return response()->json(trans('errors.not_trashed'), 404);
    }
  }

}
