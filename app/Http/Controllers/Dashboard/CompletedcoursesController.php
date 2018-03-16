<?php

namespace App\Http\Controllers\Dashboard;

use Illuminate\Http\Request;

use App\Http\Controllers\Controller;

use App\Models\Completedcourse;
use App\Models\Transfercourse;

class CompletedcoursesController extends Controller
{
  public function __construct()
  {
    $this->middleware('cas');
    $this->middleware('update_profile');
    $this->middleware('advisors_only');
  }

  public function getCompletedcourses(Request $request, $id = -1){
    if($id < 0){
      $completedcourses = Completedcourse::with('student', 'requirement', 'transfercourse')->get();
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
        if($data['transfer']){
          if(count($completedcourse->transfercourse)){
            $transfercourse = $completedcourse->transfercourse;
          }else{
            $transfercourse = new Transfercourse();
          }
          if($transfercourse->validate($data)){
            $transfercourse->fill($data);
            $transfercourse->completedcourse_id = $completedcourse->id;
            $transfercourse->save();
          }else{
            return response()->json($transfercourse->errors(), 422);
          }
        }else{
          if(count($completedcourse->transfercourse)){
            $transfercourse = $completedcourse->transfercourse;
            $transfercourse->delete();
          }
        }
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
      if($data['transfer']){
        $transfercourse = new Transfercourse();
        if($transfercourse->validate($data)){
          $completedcourse->save();
          $transfercourse->fill($data);
          $transfercourse->completedcourse_id = $completedcourse->id;
          $transfercourse->save();
        }else{
          return response()->json($transfercourse->errors(), 422);
        }
      }else{
        $completedcourse->save();
      }
      $request->session()->put('message', trans('messages.item_saved'));
      $request->session()->put('type', 'success');
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
