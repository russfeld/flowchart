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

}
