<?php

namespace App\Http\Controllers\Dashboard;

use Illuminate\Http\Request;

use App\Http\Controllers\Controller;

use App\Models\Meeting;

class MeetingsController extends Controller
{
  public function __construct()
  {
    $this->middleware('cas');
    $this->middleware('update_profile');
    $this->middleware('advisors_only');
  }

  public function getMeetings(Request $request, $id = -1){
      if($id < 0){
        if($request->has('deleted')){
          $meetings = Meeting::with('student', 'advisor')->onlyTrashed()->get();
          return view('dashboard.meetings')->with('meetings', $meetings)->with('page_title', "Meetings");
        }else{
          $deleted = Meeting::onlyTrashed()->count();
          $meetings = Meeting::with('student', 'advisor')->get();
          return view('dashboard.meetings')->with('meetings', $meetings)->with('page_title', "Meetings")->with('deleted', $deleted);
        }
      }else{
        $meeting = Meeting::withTrashed()->findOrFail($id);
        return view('dashboard.meetingedit')->with('meeting', $meeting)->with('page_title', "Edit Meeting");
      }
  }

  public function postDeletemeeting(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:meetings',
    ]);
    $meeting = Meeting::findOrFail($request->input('id'));
    $meeting->delete();
    $request->session()->put('message', trans('messages.item_deleted'));
    $request->session()->put('type', 'success');
    return response()->json(trans('messages.item_deleted'), 200);
  }

  public function postForcedeletemeeting(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:meetings',
    ]);
    $meeting = Meeting::withTrashed()->findOrFail($request->input('id'));
    if($meeting->trashed()){
      $meeting->forceDelete();
      $request->session()->put('message', trans('messages.item_forcedeleted'));
      $request->session()->put('type', 'success');
      return response()->json(trans('messages.item_forcedeleted'));
    }else{
      return response()->json(trans('errors.not_trashed'), 404);
    }
  }


}
