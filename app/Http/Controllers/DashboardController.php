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
use App\Models\Degreeprogram;
use App\Models\Plan;
use App\Models\Degreerequirement;
use App\Models\Degreerequiredcourse;
use App\Models\Degreeelectivecourse;
use App\Models\Completedcourse;
use App\Models\Transfercourse;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class DashboardController extends Controller
{

    public function __construct()
  	{
  		$this->middleware('cas');
  		$this->middleware('update_profile');
      $this->middleware('advisors_only');
      $this->fractal = new Manager();
  	}

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function getIndex()
    {
        $data["students"] = Student::count();
        $data["advisors"] = Advisor::count();
        $data["meetings"] = Meeting::count();
        $data["groupsessions"] = Groupsession::count();
        $data["blackouts"] = Blackout::count();
        $data["blackoutevents"] = Blackoutevent::count();
        $data["courses"] = Course::count();
        $data["plans"] = Plan::count();
        $data["degreeprograms"] = Degreeprogram::count();
        $data["degreerequirements"] = Degreerequirement::count();
        $data["completedcourses"] = Completedcourse::count();
        $data["transfercourses"] = Transfercourse::count();
        return view('dashboard.index')->with('page_title', "Advising Dashboard")->with('data', $data);
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
          return view('dashboard.studentedit')->with('student', $student)->with('page_title', "Edit Student")->with('departments', $departments)->with('advisors', $advisors);
        }
    }

    public function getNewstudent(){
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

    public function getDepartments(Request $request, $id = -1){
      if($id < 0){
        if($request->has('deleted')){
          $departments = Department::onlyTrashed()->get();
          return view('dashboard.departments')->with('departments', $departments)->with('page_title', "Deleted Departments");
        }else{
          $departments = Department::all();
          $deleted = Department::onlyTrashed()->count();
          return view('dashboard.departments')->with('departments', $departments)->with('page_title', "Departments")->with('deleted', $deleted);
        }
      }else{
        $department = Department::withTrashed()->findOrFail($id);
        return view('dashboard.departmentedit')->with('department', $department)->with('page_title', "Edit Department");
      }
    }

    public function getNewdepartment(){
      $department = new Department();
      return view('dashboard.departmentedit')->with('department', $department)->with('page_title', "New Department");
    }

    public function postDepartments($id = -1, Request $request){
      if($id < 0){
        abort(404);
      }else{
        $data = $request->all();
        $department = Department::findOrFail($id);
        if($department->validate($data)){
          $department->fill($data);
          $department->save();
          return response()->json(trans('messages.item_saved'));
        }else{
          return response()->json($department->errors(), 422);
        }
      }
    }

    public function postNewdepartment(Request $request){
      $data = $request->all();
      $department = new Department();
      if($department->validate($data)){
        $department->fill($data);
        $department->save();
        return response()->json(url('admin/departments/' . $department->id));
      }else{
        return response()->json($department->errors(), 422);
      }
    }

    public function postDeletedepartment(Request $request){
      $this->validate($request, [
        'id' => 'required|exists:departments',
      ]);
      $department = Department::findOrFail($request->input('id'));
      $department->delete();
      $request->session()->put('message', trans('messages.item_deleted'));
      $request->session()->put('type', 'success');
      return response()->json(trans('messages.item_deleted'));
    }

    public function postRestoredepartment(Request $request){
      $this->validate($request, [
        'id' => 'required|exists:departments',
      ]);
      $department = Department::withTrashed()->findOrFail($request->input('id'));
      $department->restore();
      $request->session()->put('message', trans('messages.item_restored'));
      $request->session()->put('type', 'success');
      return response()->json(trans('messages.item_restored'));
    }

    public function postForcedeletedepartment(Request $request){
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
        foreach($department->programs()->get() as $program){
          $program->department_id = null;
          $program->save();
        }
        $department->forceDelete();
        $request->session()->put('message', trans('messages.item_forcedeleted'));
        $request->session()->put('type', 'success');
        return response()->json(trans('messages.item_forcedeleted'));
      }else{
        return response()->json(trans('errors.not_trashed'), 404);
      }
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

    public function getBlackouts(Request $request, $id = -1){
      if($id < 0){
        $blackouts = Blackout::with('advisor', 'events')->get();
        return view('dashboard.blackouts')->with('blackouts', $blackouts)->with('page_title', "Blackouts");
      }else{
        $blackout = Blackout::findOrFail($id);
        $blackout->load('events', 'advisor');
        return view('dashboard.blackoutedit')->with('blackout', $blackout)->with('page_title', "Edit Blackout");
      }
    }

    public function postDeleteblackout(Request $request){
      $this->validate($request, [
        'id' => 'required|exists:blackouts',
      ]);
      $blackout = Blackout::findOrFail($request->input('id'));
      $blackout->delete();
      $request->session()->put('message', trans('messages.item_deleted'));
      $request->session()->put('type', 'success');
      return response()->json(trans('messages.item_deleted'), 200);
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

    public function getSettings(){
      $settings = DbConfig::listDb()->orderBy('key', 'asc')->get();
      return view('dashboard.settings')->with('page_title', "Edit Settings")->with('settings', $settings);
    }

    public function postNewsetting(Request $request){
      $this->validate($request, [
        'key' => 'required|string',
      ]);
      if(!DbConfig::has($request->input('key'))){
        DbConfig::store($request->input('key'), false);
        $request->session()->put('message', trans('messages.item_saved'));
        $request->session()->put('type', 'success');
        return response()->json(trans('messages.item_saved'), 200);
      }else{
        return response()->json(trans('errors.item_exists'), 400);
      }
    }

    public function postSavesetting(Request $request){
      $this->validate($request, [
        'key' => 'required|string',
      ]);
      if(DbConfig::has($request->input('key'))){
        if(DbConfig::get($request->input('key')) == true){
          DbConfig::store($request->input('key'), false);
        }else{
          DbConfig::store($request->input('key'), true);
        }
        $request->session()->put('message', trans('messages.item_saved'));
        $request->session()->put('type', 'success');
        return response()->json(trans('messages.item_saved'), 200);
      }else{
        return response()->json(trans('errors.not_found'), 400);
      }
    }

    public function getDegreeprograms(Request $request, $id = -1){
        if($id < 0){
          if($request->has('deleted')){
            $degreeprograms = Degreeprogram::with('department')->onlyTrashed()->get();
            return view('dashboard.degreeprograms')->with('degreeprograms', $degreeprograms)->with('page_title', "Deleted Degree Programs");
          }else{
            $degreeprograms = Degreeprogram::with('department')->get();
            $deleted = Degreeprogram::onlyTrashed()->count();
            return view('dashboard.degreeprograms')->with('degreeprograms', $degreeprograms)->with('page_title', "Degree Programs")->with('deleted', $deleted);
          }
        }else{
          $degreeprogram = Degreeprogram::withTrashed()->findOrFail($id);
          $departments = Department::all();
          $deptUnknown = new Department();
          $deptUnknown->name = "Unassigned";
          $deptUnknown->id = 0;
          $departments->prepend($deptUnknown);
          $semesters = collect([
            (object)['id' => 0, 'name' => 'Unassigned'],
            (object)['id' => 1, 'name' => 'Spring'],
            (object)['id' => 2, 'name' => 'Summer'],
            (object)['id' => 3, 'name' => 'Fall'],
          ]);
          return view('dashboard.degreeprogramedit')->with('degreeprogram', $degreeprogram)->with('page_title', "Edit Degree Program")->with('departments', $departments)->with('semesters', $semesters);
        }
    }

    public function getNewdegreeprogram(){
        $degreeprogram = new DegreeProgram();
        $departments = Department::all();
        $deptUnknown = new Department();
        $deptUnknown->name = "Unassigned";
        $deptUnknown->id = 0;
        $departments->prepend($deptUnknown);
        $semesters = collect([
          (object)['id' => 0, 'name' => 'Unassigned'],
          (object)['id' => 1, 'name' => 'Spring'],
          (object)['id' => 2, 'name' => 'Summer'],
          (object)['id' => 3, 'name' => 'Fall'],
        ]);
        return view('dashboard.degreeprogramedit')->with('degreeprogram', $degreeprogram)->with('page_title', "New Degree Program")->with('departments', $departments)->with('semesters', $semesters);
    }

    public function postDegreeprograms($id = -1, Request $request){
      if($id < 0){
        abort(404);
      }else{
        $data = $request->all();
        $degreeprogram = Degreeprogram::findOrFail($id);
        if($degreeprogram->validate($data)){
          $degreeprogram->fill($data);
          $degreeprogram->save();
          return response()->json(trans('messages.item_saved'));
        }else{
          return response()->json($degreeprogram->errors(), 422);
        }
      }
    }

    public function postNewdegreeprogram(Request $request){
      $data = $request->all();
      $degreeprogram = new Degreeprogram();
      if($degreeprogram->validate($data)){
        $degreeprogram->fill($data);
        $degreeprogram->save();
        return response()->json(url('admin/degreeprograms/' . $degreeprogram->id));
      }else{
        return response()->json($degreeprogram->errors(), 422);
      }
    }

    public function postDeletedegreeprogram(Request $request){
      $this->validate($request, [
        'id' => 'required|exists:degreeprograms',
      ]);
      $degreeprogram = Degreeprogram::findOrFail($request->input('id'));
      $degreeprogram->delete();
      $request->session()->put('message', trans('messages.item_deleted'));
      $request->session()->put('type', 'success');
      return response()->json(trans('messages.item_deleted'));
    }

    public function postRestoredegreeprogram(Request $request){
      $this->validate($request, [
        'id' => 'required|exists:degreeprograms',
      ]);
      $degreeprogram = Degreeprogram::withTrashed()->findOrFail($request->input('id'));
      $degreeprogram->restore();
      $request->session()->put('message', trans('messages.item_restored'));
      $request->session()->put('type', 'success');
      return response()->json(trans('messages.item_restored'));
    }

    public function postForcedeletedegreeprogram(Request $request){
      $this->validate($request, [
        'id' => 'required|exists:degreeprograms',
      ]);
      $degreeprogram = Degreeprogram::withTrashed()->findOrFail($request->input('id'));
      if($degreeprogram->trashed()){
        foreach($degreeprogram->requirements()->get() as $requirement){
          $requirement->requireable()->delete();
          $requirement->delete();
        }
        foreach($degreeprogram->plans()->get() as $plan){
          $plan->degreeprogram_id = null;
          $plan->save();
        }
        $degreeprogram->forceDelete();
        $request->session()->put('message', trans('messages.item_forcedeleted'));
        $request->session()->put('type', 'success');
        return response()->json(trans('messages.item_forcedeleted'));
      }else{
        return response()->json(trans('errors.not_trashed'), 404);
      }
    }

    public function getPlans(Request $request, $id = -1){
      if($id < 0){
        if($request->has('deleted')){
          $plans = Plan::with('degreeprogram', 'student')->onlyTrashed()->get();
          return view('dashboard.plans')->with('plans', $plans)->with('page_title', "Deleted Plans");
        }else{
          $plans = Plan::with('degreeprogram', 'student')->get();
          $deleted = Plan::onlyTrashed()->count();
          return view('dashboard.plans')->with('plans', $plans)->with('page_title', "Plans")->with('deleted', $deleted);
        }
      }else{
        $plan = Plan::withTrashed()->findOrFail($id);
        $degreeprograms = Degreeprogram::all();
        $semesters = collect([
          (object)['id' => 0, 'name' => 'Unassigned'],
          (object)['id' => 1, 'name' => 'Spring'],
          (object)['id' => 2, 'name' => 'Summer'],
          (object)['id' => 3, 'name' => 'Fall'],
        ]);
        return view('dashboard.planedit')->with('plan', $plan)->with('page_title', "Edit Plan")->with('semesters', $semesters)->with('degreeprograms', $degreeprograms);
      }
    }

    public function getNewplan(){
        $plan = new Plan();
        $degreeprograms = Degreeprogram::all();
        $degreeprogramUnknown = new Degreeprogram();
        $degreeprogramUnknown->name = "Unassigned";
        $degreeprogramUnknown->id = 0;
        $degreeprograms->prepend($degreeprogramUnknown);
        $semesters = collect([
          (object)['id' => 0, 'name' => 'Unassigned'],
          (object)['id' => 1, 'name' => 'Spring'],
          (object)['id' => 2, 'name' => 'Summer'],
          (object)['id' => 3, 'name' => 'Fall'],
        ]);
        return view('dashboard.planedit')->with('plan', $plan)->with('page_title', "New Plan")->with('semesters', $semesters)->with('degreeprograms', $degreeprograms);
    }

    public function postPlans($id = -1, Request $request){
      if($id < 0){
        abort(404);
      }else{
        $data = $request->all();
        $plan = Plan::findOrFail($id);
        if($plan->validate($data)){
          $plan->fill($data);
          $plan->save();
          return response()->json(trans('messages.item_saved'));
        }else{
          return response()->json($plan->errors(), 422);
        }
      }
    }

    public function postNewplan(Request $request){
      $data = $request->all();
      $plan = new Plan();
      if($plan->validate($data)){
        $plan->fill($data);
        $plan->save();
        return response()->json(url('admin/plans/' . $plan->id));
      }else{
        return response()->json($plan->errors(), 422);
      }
    }

    public function postDeleteplan(Request $request){
      $this->validate($request, [
        'id' => 'required|exists:plans',
      ]);
      $plan = Plan::findOrFail($request->input('id'));
      $plan->delete();
      $request->session()->put('message', trans('messages.item_deleted'));
      $request->session()->put('type', 'success');
      return response()->json(trans('messages.item_deleted'));
    }

    public function postRestoreplan(Request $request){
      $this->validate($request, [
        'id' => 'required|exists:plans',
      ]);
      $plan = Plan::withTrashed()->findOrFail($request->input('id'));
      $plan->restore();
      $request->session()->put('message', trans('messages.item_restored'));
      $request->session()->put('type', 'success');
      return response()->json(trans('messages.item_restored'));
    }

    public function postForcedeleteplan(Request $request){
      $this->validate($request, [
        'id' => 'required|exists:plans',
      ]);
      $plan = Plan::withTrashed()->findOrFail($request->input('id'));
      if($plan->trashed()){
        foreach($plan->requirements()->get() as $requirement){
          $requirement->requireable()->delete();
          $requirement->delete();
        }
        $plan->forceDelete();
        $request->session()->put('message', trans('messages.item_forcedeleted'));
        $request->session()->put('type', 'success');
        return response()->json(trans('messages.item_forcedeleted'));
      }else{
        return response()->json(trans('errors.not_trashed'), 404);
      }
    }

    public function getCompletedcourses(Request $request, $id = -1){
      if($id < 0){
        $completedcourses = Completedcourse::with('course', 'student', 'requirement')->get();
        return view('dashboard.completedcourses')->with('completedcourses', $completedcourses)->with('page_title', "Completed Courses");
      }else{
        $completedcourse = Completedcourse::findOrFail($id);
        $semesters = collect([
          (object)['id' => 0, 'name' => 'Unassigned'],
          (object)['id' => 1, 'name' => 'Spring'],
          (object)['id' => 2, 'name' => 'Summer'],
          (object)['id' => 3, 'name' => 'Fall'],
        ]);
        return view('dashboard.completedcourseedit')->with('completedcourse', $completedcourse)->with('page_title', "Edit Completed Course")->with('semesters', $semesters);
      }
    }

    public function getNewcompletedcourse(){
        $completedcourse = new Completedcourse();
        $semesters = collect([
          (object)['id' => 0, 'name' => 'Unassigned'],
          (object)['id' => 1, 'name' => 'Spring'],
          (object)['id' => 2, 'name' => 'Summer'],
          (object)['id' => 3, 'name' => 'Fall'],
        ]);
        return view('dashboard.completedcourseedit')->with('completedcourse', $completedcourse)->with('page_title', "New Completed Course")->with('semesters', $semesters);
    }

    public function postCompletedcourses($id = -1, Request $request){
      if($id < 0){
        abort(404);
      }else{
        $data = $request->all();
        $completedcourse = Completedcourse::findOrFail($id);
        if($completedcourse->validate($data)){
          $completedcourse->fill($data);
          $completedcourse->save();
          return response()->json(trans('messages.item_saved'));
        }else{
          return response()->json($completedcourse->errors(), 422);
        }
      }
    }

    public function postNewcompletedcourse(Request $request){
      $data = $request->all();
      $completedcourse = new Completedcourse();
      if($completedcourse->validate($data)){
        $completedcourse->fill($data);
        $completedcourse->save();
        return response()->json(url('admin/completedcourses/' . $completedcourse->id));
      }else{
        return response()->json($completedcourse->errors(), 422);
      }
    }

    public function postDeletecompletedcourse(Request $request){
      $this->validate($request, [
        'id' => 'required|exists:completedcourses',
      ]);
      $completedcourse = Completedcourse::findOrFail($request->input('id'));
      $completedcourse->delete();
      $request->session()->put('message', trans('messages.item_deleted'));
      $request->session()->put('type', 'success');
      return response()->json(trans('messages.item_deleted'));
    }
}
