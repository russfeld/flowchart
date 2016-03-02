<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\User;
use App\Models\Advisor;
use App\Models\Groupsession;

use Auth;
use Cas;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class GroupsessionController extends Controller
{

    public function __construct()
  	{
  		$this->middleware('cas');
  		$this->middleware('update_profile');
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
        $user->load('advisor');
        return view('groupsession/index')->with('user', $user)->with('advisor', $user->advisor);
      }else{
        $user->load('student');
        return view('groupsession/index')->with('user', $user)->with('student', $user->student);
      }
    }

    public function postRegister()
    {
      $user = Auth::user();
      if(!$user->is_advisor){
        $groupsession = new Groupsession;
        $groupsession->student_id = $user->student->id;
        $groupsession->advisor_id = null;
        $groupsession->save();
        Event::fire(new GroupsessionRegister($groupsession));
        return response()->json(trans('messages.groupsession_registered'));
      }else{
        return response()->json(trans('errors.students_only'), 403);
      }
    }
}
