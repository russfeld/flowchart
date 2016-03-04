<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\User;
use App\Models\Advisor;
use App\Models\Groupsession;

use Event;
use App\Events\GroupsessionRegister;

use Auth;
use Cas;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use League\Fractal\Manager;
use League\Fractal\Resource\Collection;
use App\JsonSerializer;

class GroupsessionController extends Controller
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
        return redirect('groupsession/list');
      }else{
        return view('groupsession/index');
      }
    }

    public function getList()
    {
      $user = Auth::user();

      if($user->is_advisor){
        $user->load('advisor');
        return view('groupsession/list')->with('user', $user)->with('advisor', $user->advisor);
      }else{
        $user->load('student');
        return view('groupsession/list')->with('user', $user)->with('student', $user->student);
      }
    }

    public function getQueue(){
      $groupsessions = Groupsession::all();

      $resource = new Collection($groupsessions, function($gs) {
            if($gs->advisor_id > 0){
              return[
                  'id' => (int)$gs->id,
                  'userid' => (int)$gs->user_id,
                  'name' => $gs->student->name,
                  'advsior' => $gs->advisor->name,
                  'status' => (int)$gs->status,
              ];
            }else{
              return[
                  'id' => (int)$gs->id,
                  'userid' => (int)$gs->user_id,
                  'name' => $gs->student->name,
                  'advsior' => "",
                  'status' => (int)$gs->status,
              ];
            }
      });

      $this->fractal->setSerializer(new JsonSerializer());
	    return $this->fractal->createData($resource)->toJson();
    }

    public function postRegister()
    {
      $user = Auth::user();
      if(!$user->is_advisor){
        $groupsession = new Groupsession;
        $groupsession->student_id = $user->student->id;
        $groupsession->advisor_id = null;
        $groupsession->status = Groupsession::$STATUS_QUEUED;
        $groupsession->save();
        Event::fire(new GroupsessionRegister($groupsession));
        return response()->json(trans('messages.groupsession_registered'));
      }else{
        return response()->json(trans('errors.students_only'), 403);
      }
    }
}
