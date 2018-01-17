<?php

namespace App\Http\Controllers\Dashboard;

use Illuminate\Http\Request;

use App\Http\Controllers\Controller;

use App\Models\Groupsession;

class GroupsessionsController extends Controller
{
  public function __construct()
  {
    $this->middleware('cas');
    $this->middleware('update_profile');
    $this->middleware('advisors_only');
  }

  public function getGroupsessions(Request $request, $id = -1){
    if($id < 0){
      $groupsessions = Groupsession::with('advisor', 'student')->get();
      return view('dashboard.groupsessions')->with('groupsessions', $groupsessions)->with('page_title', "Groupsessions");
    }else{
      $groupsession = Groupsession::findOrFail($id);
      $groupsession->load('student', 'advisor');
      return view('dashboard.groupsessionedit')->with('groupsession', $groupsession)->with('page_title', "Edit Groupsession");
    }
  }

  public function postDeletegroupsession(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:groupsessions',
    ]);
    $groupsession = Groupsession::findOrFail($request->input('id'));
    $groupsession->delete();
    $request->session()->put('message', trans('messages.item_deleted'));
    $request->session()->put('type', 'success');
    return response()->json(trans('messages.item_deleted'), 200);
  }

}
