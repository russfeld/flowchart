<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use League\Fractal\Manager;
use League\Fractal\Resource\Collection;
use App\JsonSerializer;

use Auth;
use DbConfig;

use App\Models\Student;
use App\Models\Advisor;
use App\Models\Department;
use App\Models\User;
use App\Models\Meeting;
use App\Models\Groupsession;
use App\Models\Blackout;
use App\Models\Blackoutevent;
use App\Models\Course;

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
          $data["students"] = Student::count();
          $data["advisors"] = Advisor::count();
          $data["meetings"] = Meeting::count();
          $data["groupsessions"] = Groupsession::count();
          $data["blackouts"] = Blackout::count();
          $data["blackoutevents"] = Blackoutevent::count();
          $data["courses"] = Course::count();
          //$data["flowcharts"] = Flowchart::count();
          return view('dashboard.index')->with('user', $user)->with('page_title', "Advising Dashboard")->with('data', $data);
        }else{
          abort(404);
        }
    }

    public function getStudents(Request $request, $id = -1){
        $user = Auth::user();
        if($user->is_advisor){
          if($id < 0){
            if($request->has('deleted')){
              $students = Student::with('user', 'department', 'advisor')->onlyTrashed()->get();
              return view('dashboard.students')->with('user', $user)->with('students', $students)->with('page_title', "Deleted Students");
            }else{
              $students = Student::with('user', 'department', 'advisor')->get();
              $deleted = Student::onlyTrashed()->count();
              return view('dashboard.students')->with('user', $user)->with('students', $students)->with('page_title', "Students")->with('deleted', $deleted);
            }
          }else{
            $student = Student::withTrashed()->findOrFail($id);
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

    public function getNewstudent(){
      $user = Auth::user();
      if($user->is_advisor){
        $student = new Student();
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
        return view('dashboard.studentedit')->with('user', $user)->with('student', $student)->with('page_title', "New Student")->with('departments', $departments)->with('advisors', $advisors);
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

    public function postNewstudent(Request $request){
      $user = Auth::user();
      if($user->is_advisor){
        $this->validate($request, [
            'eid' => 'required|string|unique:users,eid',
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'email' => 'required|email',
            'advisor' => 'sometimes|required|exists:advisors,id',
            'department' => 'sometimes|required|exists:departments,id',
        ]);
        $user2 = new User();
        $user2->eid = $request->input('eid');
        $user2->is_advisor = false;
        $user2->save();

        $student = new Student();
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
        $student->user()->associate($user2);
        $student->save();
        return response()->json(url('admin/students/' . $student->id));
      }else{
        return response()->json(trans('errors.not_found'), 404);
      }
    }

    public function postDeletestudent(Request $request){
      $user = Auth::user();
      if($user->is_advisor){
        $this->validate($request, [
          'id' => 'required|exists:students',
        ]);
        $student = Student::findOrFail($request->input('id'));
        $user = $student->user;
        $student->delete();
        $user->delete();
        $request->session()->set('message', trans('messages.item_deleted'));
        $request->session()->set('type', 'success');
        return response()->json(trans('messages.item_deleted'));
      }else{
        return response()->json(trans('errors.not_found'), 404);
      }
    }

    public function postForcedeletestudent(Request $request){
      $user = Auth::user();
      if($user->is_advisor){
        $this->validate($request, [
          'id' => 'required|exists:students',
        ]);
        $student = Student::withTrashed()->findOrFail($request->input('id'));
        if($student->trashed()){
          $user = $student->user;
          $student->meetings()->forceDelete();
          $student->forceDelete();
          $user->forceDelete();
          $request->session()->set('message', trans('messages.item_forcedeleted'));
          $request->session()->set('type', 'success');
          return response()->json(trans('messages.item_forcedeleted'));
        }else{
          return response()->json(trans('errors.not_trashed'), 404);
        }
      }else{
        return response()->json(trans('errors.not_found'), 404);
      }
    }

    public function postRestorestudent(Request $request){
      $user = Auth::user();
      if($user->is_advisor){
        $this->validate($request, [
          'id' => 'required|exists:students',
        ]);
        $student = Student::withTrashed()->findOrFail($request->input('id'));
        $user = $student->user;
        $student->restore();
        $user->restore();
        $request->session()->set('message', trans('messages.item_restored'));
        $request->session()->set('type', 'success');
        return response()->json(trans('messages.item_restored'));
      }else{
        return response()->json(trans('errors.not_found'), 404);
      }
    }

    public function getAdvisors(Request $request, $id = -1){
        $user = Auth::user();
        if($user->is_advisor){
          if($id < 0){
            if($request->has('deleted')){
              $advisors = Advisor::onlyTrashed()->with('user', 'department')->get();
              return view('dashboard.advisors')->with('user', $user)->with('advisors', $advisors)->with('page_title', " Deleted Advisors");
            }else{
              $advisors = Advisor::with('user', 'department')->get();
              $deleted = Advisor::onlyTrashed()->count();
              return view('dashboard.advisors')->with('user', $user)->with('advisors', $advisors)->with('page_title', "Advisors")->with('deleted', $deleted);
            }
          }else{
            $advisor = Advisor::withTrashed()->findOrFail($id);
            $departments = Department::all();
            $deptUnknown = new Department();
            $deptUnknown->name = "Unassigned";
            $deptUnknown->id = 0;
            $departments->prepend($deptUnknown);
            return view('dashboard.advisoredit')->with('user', $user)->with('advisor', $advisor)->with('page_title', "Edit Advisor")->with('departments', $departments);
          }
        }else{
          abort(404);
        }
    }

    public function getNewadvisor(){
      $user = Auth::user();
      if($user->is_advisor){
        $advisor = new Advisor();
        $departments = Department::all();
        $deptUnknown = new Department();
        $deptUnknown->name = "Unassigned";
        $deptUnknown->id = 0;
        $departments->prepend($deptUnknown);
        return view('dashboard.advisoredit')->with('user', $user)->with('advisor', $advisor)->with('page_title', "New Advisor")->with('departments', $departments);
      }else{
        abort(404);
      }
    }

    public function postAdvisors($id = -1, Request $request){
      $user = Auth::user();
      if($user->is_advisor){
        if($id < 0){
          abort(404);
        }else{
          $this->validate($request, [
              'name' => 'required|string',
              'email' => 'required|string|email',
              'office' => 'required|string',
              'phone' => 'required|string',
              'notes' => 'string',
              'pic' => 'image',
              'department' => 'sometimes|required|exists:departments,id',
          ]);
          $advisor = Advisor::findOrFail($id);
          $advisor->name = $request->input('name');
          $advisor->email = $request->input('email');
          $advisor->office = $request->input('office');
          $advisor->phone = $request->input('phone');
          $advisor->notes = $request->input('notes');
          if($request->hasFile('pic')){
            $path = storage_path() . "/app/images";
            $extension = $request->file('pic')->getClientOriginalExtension();
            $filename = $advisor->user->eid . '.' . $extension;
            $request->file('pic')->move($path, $filename);
            $advisor->pic = 'images/' . $filename;
          }
          if($request->has('department')){
            $department = Department::findOrFail($request->input('department'));
            $advisor->department()->associate($department);
          }
          $advisor->save();
          return response()->json(trans('messages.item_saved'));
        }
      }else{
        return response()->json(trans('errors.not_found'), 404);
      }
    }

    public function postNewadvisor(Request $request){
      $user = Auth::user();
      if($user->is_advisor){
        $this->validate($request, [
            'eid' => 'required|string|unique:users,eid',
            'name' => 'required|string',
            'email' => 'required|string|email',
            'office' => 'required|string',
            'phone' => 'required|string',
            'notes' => 'string',
            'pic' => 'required|image',
            'department' => 'sometimes|required|exists:departments,id',
        ]);
        $user2 = new User();
        $user2->eid = $request->input('eid');
        $user2->is_advisor = true;
        $user2->save();

        $advisor = new Advisor();
        $advisor->name = $request->input('name');
        $advisor->email = $request->input('email');
        $advisor->office = $request->input('office');
        $advisor->phone = $request->input('phone');
        $advisor->notes = $request->input('notes');
        if($request->hasFile('pic')){
          $path = storage_path() . "/app/images";
          $extension = $request->file('pic')->getClientOriginalExtension();
          $filename = $user2->eid . '.' . $extension;
          $request->file('pic')->move($path, $filename);
          $advisor->pic = 'images/' . $filename;
        }
        if($request->has('department')){
          $department = Department::findOrFail($request->input('department'));
          $advisor->department()->associate($department);
        }
        $advisor->user()->associate($user2);
        $advisor->save();
        return response()->json(url('admin/advisors/' . $advisor->id));
      }else{
        return response()->json(trans('errors.not_found'), 404);
      }
    }

    public function postDeleteadvisor(Request $request){
      $auser = Auth::user();
      if($auser->is_advisor){
        $this->validate($request, [
          'id' => 'required|exists:advisors',
        ]);
        $advisor = Advisor::findOrFail($request->input('id'));
        $user = $advisor->user;
        if($auser->id == $user->id){
          return response()->json(trans('errors.own_user'), 400);
        }else{
          $advisor->delete();
          $user->delete();
          $request->session()->set('message', trans('messages.item_deleted'));
          $request->session()->set('type', 'success');
          return response()->json(trans('messages.item_deleted'));
        }
      }else{
        return response()->json(trans('errors.not_found'), 404);
      }
    }

    public function postForcedeleteadvisor(Request $request){
      $auser = Auth::user();
      if($auser->is_advisor){
        $this->validate($request, [
          'id' => 'required|exists:advisors',
        ]);
        $advisor = Advisor::withTrashed()->findOrFail($request->input('id'));
        $user = $advisor->user;
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
          $request->session()->set('message', trans('messages.item_forcedeleted'));
          $request->session()->set('type', 'success');
          return response()->json(trans('messages.item_forcedeleted'));
        }else{
          return response()->json(trans('errors.not_trashed'), 404);
        }
      }else{
        return response()->json(trans('errors.not_found'), 404);
      }
    }

    public function postRestoreadvisor(Request $request){
      $user = Auth::user();
      if($user->is_advisor){
        $this->validate($request, [
          'id' => 'required|exists:advisors',
        ]);
        $advisor = Advisor::withTrashed()->findOrFail($request->input('id'));
        $user = $advisor->user;
        $advisor->restore();
        $user->restore();
        $request->session()->set('message', trans('messages.item_restored'));
        $request->session()->set('type', 'success');
        return response()->json(trans('messages.item_deleted'));
      }else{
        return response()->json(trans('errors.not_found'), 404);
      }
    }

    public function getDepartments(Request $request, $id = -1){
        $user = Auth::user();
        if($user->is_advisor){
          if($id < 0){
            if($request->has('deleted')){
              $departments = Department::onlyTrashed()->get();
              return view('dashboard.departments')->with('user', $user)->with('departments', $departments)->with('page_title', "Deleted Departments");
            }else{
              $departments = Department::all();
              $deleted = Department::onlyTrashed()->count();
              return view('dashboard.departments')->with('user', $user)->with('departments', $departments)->with('page_title', "Departments")->with('deleted', $deleted);
            }
          }else{
            $department = Department::withTrashed()->findOrFail($id);
            return view('dashboard.departmentedit')->with('user', $user)->with('department', $department)->with('page_title', "Edit Department");
          }
        }else{
          abort(404);
        }
    }

    public function getNewdepartment(){
        $user = Auth::user();
        if($user->is_advisor){
            $department = new Department();
            return view('dashboard.departmentedit')->with('user', $user)->with('department', $department)->with('page_title', "New Department");
        }else{
          abort(404);
        }
    }

    public function postDepartments($id = -1, Request $request){
      $user = Auth::user();
      if($user->is_advisor){
        if($id < 0){
          abort(404);
        }else{
          $this->validate($request, [
              'name' => 'required|string',
              'email' => 'required|string|email',
              'office' => 'required|string',
              'phone' => 'required|string',
          ]);
          $department = Department::findOrFail($id);
          $department->name = $request->input('name');
          $department->email = $request->input('email');
          $department->office = $request->input('office');
          $department->phone = $request->input('phone');
          $department->save();
          return response()->json(trans('messages.item_saved'));
        }
      }else{
        return response()->json(trans('errors.not_found'), 404);
      }
    }

    public function postNewdepartment(Request $request){
      $user = Auth::user();
      if($user->is_advisor){
        $this->validate($request, [
            'name' => 'required|string',
            'email' => 'required|string|email',
            'office' => 'required|string',
            'phone' => 'required|string',
        ]);
        $department = new Department();
        $department->name = $request->input('name');
        $department->email = $request->input('email');
        $department->office = $request->input('office');
        $department->phone = $request->input('phone');
        $department->save();
        return response()->json(url('admin/departments/' . $department->id));
      }else{
        return response()->json(trans('errors.not_found'), 404);
      }
    }

    public function postDeletedepartment(Request $request){
      $user = Auth::user();
      if($user->is_advisor){
        $this->validate($request, [
          'id' => 'required|exists:departments',
        ]);
        $department = Department::findOrFail($request->input('id'));
        $department->delete();
        $request->session()->set('message', trans('messages.item_deleted'));
        $request->session()->set('type', 'success');
        return response()->json(trans('messages.item_deleted'));
      }else{
        return response()->json(trans('errors.not_found'), 404);
      }
    }

    public function postRestoredepartment(Request $request){
      $user = Auth::user();
      if($user->is_advisor){
        $this->validate($request, [
          'id' => 'required|exists:departments',
        ]);
        $department = Department::withTrashed()->findOrFail($request->input('id'));
        $department->restore();
        $request->session()->set('message', trans('messages.item_restored'));
        $request->session()->set('type', 'success');
        return response()->json(trans('messages.item_restored'));
      }else{
        return response()->json(trans('errors.not_found'), 404);
      }
    }

    public function postForcedeletedepartment(Request $request){
      $user = Auth::user();
      if($user->is_advisor){
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
          $department->forceDelete();
          $request->session()->set('message', trans('messages.item_forcedeleted'));
          $request->session()->set('type', 'success');
          return response()->json(trans('messages.item_forcedeleted'));
        }else{
          return response()->json(trans('errors.not_trashed'), 404);
        }
      }else{
        return response()->json(trans('errors.not_found'), 404);
      }
    }

    public function getMeetings(Request $request, $id = -1){
        $user = Auth::user();
        if($user->is_advisor){
          if($id < 0){
            if($request->has('deleted')){
              $meetings = Meeting::with('student', 'advisor')->onlyTrashed()->get();
              return view('dashboard.meetings')->with('user', $user)->with('meetings', $meetings)->with('page_title', "Meetings");
            }else{
              $deleted = Meeting::onlyTrashed()->count();
              $meetings = Meeting::with('student', 'advisor')->get();
              return view('dashboard.meetings')->with('user', $user)->with('meetings', $meetings)->with('page_title', "Meetings")->with('deleted', $deleted);
            }

          }else{
            $meeting = Meeting::withTrashed()->findOrFail($id);
            return view('dashboard.meetingedit')->with('user', $user)->with('meeting', $meeting)->with('page_title', "Edit Meeting");
          }
        }else{
          abort(404);
        }
    }

    public function postDeletemeeting(Request $request){
      $user = Auth::user();
      if($user->is_advisor){
        $this->validate($request, [
          'id' => 'required|exists:meetings',
        ]);
        $meeting = Meeting::findOrFail($request->input('id'));
        $meeting->delete();
        $request->session()->set('message', trans('messages.item_deleted'));
        $request->session()->set('type', 'success');
        return response()->json(trans('messages.item_deleted'), 200);
      }else{
        return response()->json(trans('errors.not_found'), 404);
      }
    }

    public function postForcedeletemeeting(Request $request){
      $user = Auth::user();
      if($user->is_advisor){
        $this->validate($request, [
          'id' => 'required|exists:meetings',
        ]);
        $meeting = Meeting::withTrashed()->findOrFail($request->input('id'));
        if($meeting->trashed()){
          $meeting->forceDelete();
          $request->session()->set('message', trans('messages.item_forcedeleted'));
          $request->session()->set('type', 'success');
          return response()->json(trans('messages.item_forcedeleted'));
        }else{
          return response()->json(trans('errors.not_trashed'), 404);
        }
      }else{
        return response()->json(trans('errors.not_found'), 404);
      }
    }

    public function getBlackouts(Request $request, $id = -1){
        $user = Auth::user();
        if($user->is_advisor){
          if($id < 0){
            $blackouts = Blackout::with('advisor', 'events')->get();
            return view('dashboard.blackouts')->with('user', $user)->with('blackouts', $blackouts)->with('page_title', "Blackouts");
          }else{
            $blackout = Blackout::findOrFail($id);
            $blackout->load('events', 'advisor');
            return view('dashboard.blackoutedit')->with('user', $user)->with('blackout', $blackout)->with('page_title', "Edit Blackout");
          }
        }else{
          abort(404);
        }
    }

    public function postDeleteblackout(Request $request){
      $user = Auth::user();
      if($user->is_advisor){
        $this->validate($request, [
          'id' => 'required|exists:blackouts',
        ]);
        $blackout = Blackout::findOrFail($request->input('id'));
        $blackout->delete();
        $request->session()->set('message', trans('messages.item_deleted'));
        $request->session()->set('type', 'success');
        return response()->json(trans('messages.item_deleted'), 200);
      }else{
        return response()->json(trans('errors.not_found'), 404);
      }
    }

    public function getGroupsessions(Request $request, $id = -1){
        $user = Auth::user();
        if($user->is_advisor){
          if($id < 0){
            $groupsessions = Groupsession::with('advisor', 'student')->get();
            return view('dashboard.groupsessions')->with('user', $user)->with('groupsessions', $groupsessions)->with('page_title', "Groupsessions");
          }else{
            $groupsession = Groupsession::findOrFail($id);
            $groupsession->load('student', 'advisor');
            return view('dashboard.groupsessionedit')->with('user', $user)->with('groupsession', $groupsession)->with('page_title', "Edit Groupsession");
          }
        }else{
          abort(404);
        }
    }

    public function postDeletegroupsession(Request $request){
      $user = Auth::user();
      if($user->is_advisor){
        $this->validate($request, [
          'id' => 'required|exists:groupsessions',
        ]);
        $groupsession = Groupsession::findOrFail($request->input('id'));
        $groupsession->delete();
        $request->session()->set('message', trans('messages.item_deleted'));
        $request->session()->set('type', 'success');
        return response()->json(trans('messages.item_deleted'), 200);
      }else{
        return response()->json(trans('errors.not_found'), 404);
      }
    }

    public function getSettings(){
      $user = Auth::user();
      $settings = DbConfig::listDb()->orderBy('key', 'asc')->get();
      return view('dashboard.settings')->with('user', $user)->with('page_title', "Edit Settings")->with('settings', $settings);
    }

    public function postNewsetting(Request $request){
      $user = Auth::user();
      if($user->is_advisor){
        $this->validate($request, [
          'key' => 'required|string',
        ]);
        if(!DbConfig::has($request->input('key'))){
          DbConfig::store($request->input('key'), false);
          $request->session()->set('message', trans('messages.item_saved'));
          $request->session()->set('type', 'success');
          return response()->json(trans('messages.item_saved'), 200);
        }else{
          return response()->json(trans('errors.item_exists'), 400);
        }
      }else{
        return response()->json(trans('errors.not_found'), 404);
      }
    }

    public function postSavesetting(Request $request){
      $user = Auth::user();
      if($user->is_advisor){
        $this->validate($request, [
          'key' => 'required|string',
        ]);
        if(DbConfig::has($request->input('key'))){
          if(DbConfig::get($request->input('key')) == true){
            DbConfig::store($request->input('key'), false);
          }else{
            DbConfig::store($request->input('key'), true);
          }
          $request->session()->set('message', trans('messages.item_saved'));
          $request->session()->set('type', 'success');
          return response()->json(trans('messages.item_saved'), 200);
        }else{
          return response()->json(trans('errors.not_found'), 400);
        }
      }else{
        return response()->json(trans('errors.not_found'), 404);
      }
    }

}
