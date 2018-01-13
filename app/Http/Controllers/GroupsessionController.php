<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\User;
use App\Models\Advisor;
use App\Models\Groupsession;

use Event;
use App\Events\GroupsessionRegister;
use App\Events\GroupsessionEnd;

use Auth;
use Cas;
use DbConfig;

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
      $this->middleware('groupsessiondisabled', ['except' => ['getEnable', 'getIndex']]);
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

      $enabled = DbConfig::get('groupsessionenabled');

      if($user->is_advisor && $enabled){
        return redirect('groupsession/list');
      }else{
        return view('groupsession/index')->with('user', $user)->with('enabled', $enabled);
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
      $groupsessions = Groupsession::where('status', '<', 3)->orderBy('status', 'desc')->orderBy('id', 'asc')->get();

      $resource = new Collection($groupsessions, function($gs) {
            if(count($gs->advisor)){
              return[
                  'id' => (int)$gs->id,
                  'userid' => (int)$gs->student->user_id,
                  'name' => $gs->student->name,
                  'advisor' => $gs->advisor->name,
                  'status' => (int)$gs->status,
              ];
            }else{
              return[
                  'id' => (int)$gs->id,
                  'userid' => (int)$gs->student->user_id,
                  'name' => $gs->student->name,
                  'advisor' => "",
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
        event(new GroupsessionRegister($groupsession));
        return response()->json(trans('messages.groupsession_register'));
      }else{
        return response()->json(trans('errors.students_only'), 403);
      }
    }

    public function postTake(Request $request){
      $user = Auth::user();
      if($user->is_advisor){
        $this->validate($request, [
            'gid' => 'required|exists:groupsessions,id',
        ]);
        $groupsession = Groupsession::find($request->input('gid'));
        $groupsession->status = Groupsession::$STATUS_BECKON;
        $groupsession->advisor()->associate($user->advisor);
        $groupsession->save();
        event(new GroupsessionRegister($groupsession));
        return response()->json(trans('messages.groupsession_take'));
      }else{
        return response()->json(trans('errors.advisors_only'), 403);
      }
    }

    public function postPut(Request $request){
      $user = Auth::user();
      if($user->is_advisor){
        $this->validate($request, [
            'gid' => 'required|exists:groupsessions,id',
        ]);
        $groupsession = Groupsession::find($request->input('gid'));
        $groupsession->status = Groupsession::$STATUS_DELAY;
        $groupsession->save();
        $newGroupsession = new Groupsession;
        $newGroupsession->student_id = $groupsession->student_id;
        $newGroupsession->advisor_id = null;
        $newGroupsession->status = Groupsession::$STATUS_QUEUED;
        $newGroupsession->save();
        event(new GroupsessionRegister($newGroupsession));
        event(new GroupsessionRegister($groupsession));
        return response()->json(trans('messages.groupsession_put'));
      }else{
        return response()->json(trans('errors.advisors_only'), 403);
      }
    }

    public function postDone(Request $request){
      $user = Auth::user();
      if($user->is_advisor){
        $this->validate($request, [
            'gid' => 'required|exists:groupsessions,id',
        ]);
        $groupsession = Groupsession::find($request->input('gid'));
        $groupsession->status = Groupsession::$STATUS_DONE;
        $groupsession->save();
        event(new GroupsessionRegister($groupsession));
        return response()->json(trans('messages.groupsession_done'));
      }else{
        return response()->json(trans('errors.advisors_only'), 403);
      }
    }

    public function postDelete(Request $request){
      $user = Auth::user();
      if($user->is_advisor){
        $this->validate($request, [
            'gid' => 'required|exists:groupsessions,id',
        ]);
        $groupsession = Groupsession::find($request->input('gid'));
        $groupsession->status = Groupsession::$STATUS_ABSENT;
        $groupsession->save();
        event(new GroupsessionRegister($groupsession));
        return response()->json(trans('messages.groupsession_delete'));
      }else{
        return response()->json(trans('errors.advisors_only'), 403);
      }
    }

    public function getEnable(){
      $user = Auth::user();
      if($user->is_advisor){
        DbConfig::store('groupsessionenabled', true);
      }
      return redirect('/groupsession');
    }

    public function postDisable(Request $request){
      $user = Auth::user();
      if($user->is_advisor && $user->id == $request->input('id')){
        DbConfig::store('groupsessionenabled', false);
        $groupsessions = Groupsession::where('status', '<', 3)->get();
        foreach($groupsessions as $gs){
          $gs->status = 4;
          $gs->save();
        }
        event(new GroupsessionEnd());
      }
      return redirect('/groupsession');
    }
}
