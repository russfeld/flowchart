<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use League\Fractal\Manager;
use League\Fractal\Resource\Collection;
use App\JsonSerializer;

use Auth;

use App\Models\Student;
use App\Models\Advisor;
use App\Models\Department;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class DashboardController extends Controller
{

    public function __construct()
  	{
  		$this->middleware('cas');
  		$this->middleware('update_profile');
      $this->fractal = new Manager();
  	}

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function getIndex()
    {
        $user = Auth::user();
        if($user->is_advisor){
          return view('dashboard.index')->with('user', $user);
        }else{
          abort(404);
        }
    }

    public function getStudents($id = -1){
        $user = Auth::user();
        if($user->is_advisor){
          if($id < 0){
            $students = Student::with('user', 'department', 'advisor')->get();
            return view('dashboard.students')->with('user', $user)->with('students', $students)->with('page_title', "Students");
          }else{
            $student = Student::findOrFail($id);
            $departments = Department::all();
            $deptUnknown = new Department();
            $deptUnknown->name = "Unassigned";
            $deptUnknown->id = 0;
            $departments->prepend($deptUnknown);
            $advisors = Advisor::all();
            $advUnknown = new Advisor();
            $advUnknown->name = "Unassigned";
            $advUnknown->id = 0;
            $advisors->prepend($advUnknown);
            return view('dashboard.studentedit')->with('user', $user)->with('student', $student)->with('page_title', "Edit Student")->with('departments', $departments)->with('advisors', $advisors);
          }
        }else{
          abort(404);
        }
    }

    public function postStudents($id = -1, Request $request){
      $user = Auth::user();
      if($user->is_advisor){
        if($id < 0){
          abort(404);
        }else{
          $this->validate($request, [
              'first_name' => 'required|string',
              'last_name' => 'required|string',
              'email' => 'required|email',
              'advisor' => 'sometimes|required|exists:advisors,id',
              'department' => 'sometimes|required|exists:departments,id',
          ]);
          $student = Student::findOrFail($id);
          $student->first_name = $request->input('first_name');
          $student->last_name = $request->input('last_name');
          $student->email = $request->input('email');
          if($request->has('advisor')){
            $advisor = Advisor::findOrFail($request->input('advisor'));
            $student->advisor()->associate($advisor);
          }
          if($request->has('department')){
            $department = Department::findOrFail($request->input('department'));
            $student->department()->associate($department);
          }
          $student->save();
          return response()->json(trans('messages.item_saved'));
        }
      }else{
        return response()->json(trans('errors.not_found'), 404);
      }
    }
}
