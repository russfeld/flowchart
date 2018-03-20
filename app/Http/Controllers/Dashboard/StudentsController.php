<?php

namespace App\Http\Controllers\Dashboard;

use Illuminate\Http\Request;

use App\Http\Controllers\Controller;

use App\Models\Student;
use App\Models\Advisor;
use App\Models\Department;
use App\Models\User;

class StudentsController extends Controller
{
  public function __construct()
  {
    $this->middleware('cas');
    $this->middleware('update_profile');
    $this->middleware('advisors_only');
  }

  public function getStudents(Request $request, $id = -1){
      if($id < 0){
        if($request->has('deleted')){
          $students = Student::with('user', 'department', 'advisor')->onlyTrashed()->get();
          return view('dashboard.students')->with('students', $students)->with('page_title', "Deleted Students");
        }else{
          $students = Student::with('user', 'department', 'advisor')->get();
          $deleted = Student::onlyTrashed()->count();
          return view('dashboard.students')->with('students', $students)->with('page_title', "Students")->with('deleted', $deleted);
        }
      }else{
        $student = Student::withTrashed()->findOrFail($id);
        $departments = Department::orderBy('name', 'asc')->get();
        $deptUnknown = new Department();
        $deptUnknown->name = "Unassigned";
        $deptUnknown->id = 0;
        $departments->prepend($deptUnknown);
        $advisors = Advisor::orderBy('name', 'asc')->get();
        $advUnknown = new Advisor();
        $advUnknown->name = "Unassigned";
        $advUnknown->id = 0;
        $advisors->prepend($advUnknown);
        return view('dashboard.studentedit')->with('student', $student)->with('page_title', "Edit Student")->with('departments', $departments)->with('advisors', $advisors);
      }
  }

  public function getNewstudent(){
    $student = new Student();
    $departments = Department::orderBy('name', 'asc')->get();
    $deptUnknown = new Department();
    $deptUnknown->name = "Unassigned";
    $deptUnknown->id = 0;
    $departments->prepend($deptUnknown);
    $advisors = Advisor::orderBy('name', 'asc')->get();
    $advUnknown = new Advisor();
    $advUnknown->name = "Unassigned";
    $advUnknown->id = 0;
    $advisors->prepend($advUnknown);
    return view('dashboard.studentedit')->with('student', $student)->with('page_title', "New Student")->with('departments', $departments)->with('advisors', $advisors);
  }

  public function postStudents($id = -1, Request $request){
    if($id < 0){
      abort(404);
    }else{
      $data = $request->all();
      $student = Student::findOrFail($id);
      $user = $student->user;
      if($user->validateChange($data)){
        if($student->validate($data)){
          $user->fill($data);
          $user->save();
          $student->fill($data);
          $student->save();
          return response()->json(trans('messages.item_saved'));
        }else{
          return response()->json($student->errors(), 422);
        }
      }else{
        return response()->json($user->errors(), 422);
      }
    }
  }

  public function postNewstudent(Request $request){
    $data = $request->all();
    $user = new User();
    if($user->validate($data)){
      $student = new Student();
      if($student->validate($data)){
        $user->fill($data);
        $user->is_advisor = false;
        $user->save();
        $student->fill($data);
        $student->user()->associate($user);
        $student->save();
        $request->session()->put('message', trans('messages.item_saved'));
        $request->session()->put('type', 'success');
        return response()->json(url('admin/students/' . $student->id));
      }else{
        return response()->json($student->errors(), 422);
      }
    }else{
      return response()->json($user->errors(), 422);
    }
  }

  public function postDeletestudent(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:students',
    ]);
    $student = Student::findOrFail($request->input('id'));
    $user = $student->user;
    $student->delete();
    $user->delete();
    $request->session()->put('message', trans('messages.item_deleted'));
    $request->session()->put('type', 'success');
    return response()->json(trans('messages.item_deleted'));
  }

  public function postForcedeletestudent(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:students',
    ]);
    $student = Student::withTrashed()->findOrFail($request->input('id'));
    if($student->trashed()){
      $user = $student->user;
      $student->meetings()->forceDelete();
      $student->forceDelete();
      $user->forceDelete();
      $request->session()->put('message', trans('messages.item_forcedeleted'));
      $request->session()->put('type', 'success');
      return response()->json(trans('messages.item_forcedeleted'));
    }else{
      return response()->json(trans('errors.not_trashed'), 404);
    }
  }

  public function postRestorestudent(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:students',
    ]);
    $student = Student::withTrashed()->findOrFail($request->input('id'));
    $user = $student->user;
    $student->restore();
    $user->restore();
    $request->session()->put('message', trans('messages.item_restored'));
    $request->session()->put('type', 'success');
    return response()->json(trans('messages.item_restored'));
  }

}
