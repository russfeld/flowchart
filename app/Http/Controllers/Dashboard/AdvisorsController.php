<?php

namespace App\Http\Controllers\Dashboard;

use Illuminate\Http\Request;

use App\Http\Controllers\Controller;

use Auth;

use App\Models\Advisor;
use App\Models\Department;
use App\Models\User;

class AdvisorsController extends Controller
{
  public function __construct()
  {
    $this->middleware('cas');
    $this->middleware('update_profile');
    $this->middleware('advisors_only');
  }

  public function getAdvisors(Request $request, $id = -1){
    if($id < 0){
      if($request->has('deleted')){
        $advisors = Advisor::onlyTrashed()->with('user', 'department')->get();
        return view('dashboard.advisors')->with('advisors', $advisors)->with('page_title', " Deleted Advisors");
      }else{
        $advisors = Advisor::with('user', 'department')->get();
        $deleted = Advisor::onlyTrashed()->count();
        return view('dashboard.advisors')->with('advisors', $advisors)->with('page_title', "Advisors")->with('deleted', $deleted);
      }
    }else{
      $advisor = Advisor::withTrashed()->findOrFail($id);
      $departments = Department::all();
      $deptUnknown = new Department();
      $deptUnknown->name = "Unassigned";
      $deptUnknown->id = 0;
      $departments->prepend($deptUnknown);
      return view('dashboard.advisoredit')->with('advisor', $advisor)->with('page_title', "Edit Advisor")->with('departments', $departments);
    }
  }

  public function getNewadvisor(){
    $advisor = new Advisor();
    $advisor->pic = "";
    $departments = Department::all();
    $deptUnknown = new Department();
    $deptUnknown->name = "Unassigned";
    $deptUnknown->id = 0;
    $departments->prepend($deptUnknown);
    return view('dashboard.advisoredit')->with('advisor', $advisor)->with('page_title', "New Advisor")->with('departments', $departments);
  }

  public function postAdvisors($id = -1, Request $request){
    if($id < 0){
      abort(404);
    }else{
      $data = $request->all();
      $advisor = Advisor::findOrFail($id);
      $user = $advisor->user;
      if($user->validateChange($data)){
        if($advisor->validate($data)){
          $user->fill($data);
          $user->save();
          $advisor->fill($data);
          if($request->hasFile('pic')){
            $advisor->savePic($request->file('pic'));
          }
          $advisor->save();
          return response()->json(trans('messages.item_saved'));
        }else{
          return response()->json($advisor->errors(), 422);
        }
      }else{
        return response()->json($user->errors(), 422);
      }
    }
  }

  public function postNewadvisor(Request $request){
    $data = $request->all();
    $user = new User();
    if($user->validate($data)){
      $advisor = new Advisor();
      if($advisor->validate($data)){
        $user->fill($data);
        $user->is_advisor = true;
        $user->save();
        $advisor->fill($data);
        $advisor->user()->associate($user);
        if($request->hasFile('pic')){
          $advisor->savePic($request->file('pic'));
        }
        $advisor->save();
        $request->session()->put('message', trans('messages.item_saved'));
        $request->session()->put('type', 'success');
        return response()->json(url('admin/advisors/' . $advisor->id));
      }else{
        return response()->json($advisor->errors(), 422);
      }
    }else{
      return response()->json($user->errors(), 422);
    }
  }

  public function postDeleteadvisor(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:advisors',
    ]);
    $advisor = Advisor::findOrFail($request->input('id'));
    $user = $advisor->user;
    $auser = Auth::user();
    if($auser->id == $user->id){
      return response()->json(trans('errors.own_user'), 400);
    }else{
      $advisor->delete();
      $user->delete();
      $request->session()->put('message', trans('messages.item_deleted'));
      $request->session()->put('type', 'success');
      return response()->json(trans('messages.item_deleted'));
    }
  }

  public function postForcedeleteadvisor(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:advisors',
    ]);
    $advisor = Advisor::withTrashed()->findOrFail($request->input('id'));
    $user = $advisor->user;
    $auser = Auth::user();
    if($auser->id == $user->id){
      return response()->json(trans('errors.own_user'), 400);
    }elseif($advisor->trashed()){
      $advisor->meetings()->forceDelete();
      $advisor->events()->forceDelete();
      $advisor->blackouts()->forceDelete();
      foreach($advisor->students()->get() as $student){
        $student->advisor_id = null;
        $student->save();
      }
      $advisor->forceDelete();
      $user->forceDelete();
      $request->session()->put('message', trans('messages.item_forcedeleted'));
      $request->session()->put('type', 'success');
      return response()->json(trans('messages.item_forcedeleted'));
    }else{
      return response()->json(trans('errors.not_trashed'), 404);
    }
  }

  public function postRestoreadvisor(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:advisors',
    ]);
    $advisor = Advisor::withTrashed()->findOrFail($request->input('id'));
    $user = $advisor->user;
    $advisor->restore();
    $user->restore();
    $request->session()->put('message', trans('messages.item_restored'));
    $request->session()->put('type', 'success');
    return response()->json(trans('messages.item_deleted'));
  }

}
