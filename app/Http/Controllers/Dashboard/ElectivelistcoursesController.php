<?php

namespace App\Http\Controllers\Dashboard;

use League\Fractal\Manager;
use League\Fractal\Resource\Collection;
use League\Fractal\Resource\Item;
use App\JsonSerializer;

use Illuminate\Http\Request;

use App\Http\Controllers\Controller;

use App\Models\Electivelist;
use App\Models\Electivelistcourse;
class ElectivelistcoursesController extends Controller
{

  public function __construct()
  {
    $this->middleware('cas');
    $this->middleware('update_profile');
    $this->middleware('advisors_only');
    $this->fractal = new Manager();
  }

  public function getElectivelistcoursesforList(Request $request, $id = -1){
    if($id < 0){
      abort(404);
    }else{
      $electivelist = Electivelist::withTrashed()->with('courses')->findOrFail($id);
      $resource = new Collection($electivelist->courses, function($course) {
          return[
              'id' => $course->id,
              'name' => $course->full_range,
          ];
      });
      $this->fractal->setSerializer(new JsonSerializer());
      return $this->fractal->createData($resource)->toJson();
    }
  }

  public function getElectivelistcourse(Request $request, $id = -1){
    if($id < 0){
      abort(404);
    }else{
      $electivelistcourse = Electivelistcourse::findOrFail($id);
      $resource = new Item($electivelistcourse, function($course) {
          return[
              'id' => $course->id,
              'course_prefix' => $course->course_prefix,
              'course_min_number' => $course->course_min_number,
              'course_max_number' => $course->course_max_number,
          ];
      });
      $this->fractal->setSerializer(new JsonSerializer());
      return $this->fractal->createData($resource)->toJson();
    }
  }

  public function postNewelectivelistcourse(Request $request){
    $data = $request->all();
    $electivelistcourse = new Electivelistcourse();
    if($electivelistcourse->validate($data)){
      $electivelistcourse->fill($data);
      if(!$request->has('course_max_number')){
        $electivelistcourse->course_max_number = null;
      }
      $electivelistcourse->save();
      return response()->json(trans('messages.item_saved'));
    }else{
      return response()->json($electivelistcourse->errors(), 422);
    }
  }

  public function postElectivelistcourse(Request $request, $id = 1){
    if($id < 0){
      abort(404);
    }else{
      $data = $request->all();
      $electivelistcourse = Electivelistcourse::findOrFail($id);
      if($electivelistcourse->validate($data)){
        $electivelistcourse->fill($data);
        if(!$request->has('course_max_number')){
          $electivelistcourse->course_max_number = null;
        }
        $electivelistcourse->save();
        return response()->json(trans('messages.item_saved'));
      }else{
        return response()->json($electivelistcourse->errors(), 422);
      }
    }
  }

  public function postDeleteelectivelistcourse(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:electivelistcourses',
    ]);
    $electivelistcourse = Electivelistcourse::findOrFail($request->input('id'));
    $electivelistcourse->delete();
    $request->session()->put('message', trans('messages.item_deleted'));
    $request->session()->put('type', 'success');
    return response()->json(trans('messages.item_deleted'));
  }


}
