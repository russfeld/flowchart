<?php

namespace App\Http\Controllers\Dashboard;

use League\Fractal\Manager;
use League\Fractal\Resource\Collection;
use League\Fractal\Resource\Item;
use App\JsonSerializer;

use Illuminate\Http\Request;

use App\Http\Controllers\Controller;

use App\Models\Degreeprogram;
use App\Models\Degreerequirement;
use App\Models\Course;
use App\Models\Electivelist;

class DegreerequirementsController extends Controller
{

  public function __construct()
  {
    $this->middleware('cas');
    $this->middleware('update_profile');
    $this->middleware('advisors_only');
    $this->fractal = new Manager();
  }

  public function getDegreerequirementsForProgram(Request $request, $id = -1){
    if($id < 0){
      abort(404);
    }else{
      $degreeprogram = Degreeprogram::withTrashed()->with('requirements.requireable')->findOrFail($id);
      $resource = new Collection($degreeprogram->requirements, function($requirement) {
          if($requirement->requireable_type == "App\\Models\\Course"){
            return[
                'id' => $requirement->id,
                'notes' => $requirement->notes,
                'semester' => $requirement->semester,
                'ordering' => $requirement->ordering,
                'credits' => $requirement->credits,
                'name' => $requirement->requireable->shortTitle,
            ];
          }else if($requirement->requireable_type == "App\\Models\\Electivelist"){
            return[
                'id' => $requirement->id,
                'notes' => $requirement->notes,
                'semester' => $requirement->semester,
                'ordering' => $requirement->ordering,
                'credits' => $requirement->credits,
                'name' => $requirement->requireable->name,
            ];
          }
      });
      $this->fractal->setSerializer(new JsonSerializer());
      return $this->fractal->createData($resource)->toJson();
    }
  }

  public function getDegreerequirement(Request $request, $id = -1){
    if($id < 0){
      abort(404);
    }else{
      $degreerequirement = Degreerequirement::with('requireable')->findOrFail($id);

      $resource = new Item($degreerequirement, function($requirement) {
        if($requirement->requireable_type == "App\\Models\\Course"){
          return[
              'id' => $requirement->id,
              'notes' => $requirement->notes,
              'semester' => $requirement->semester,
              'ordering' => $requirement->ordering,
              'credits' => $requirement->credits,
              'type' => 'course',
              'course_id' => $requirement->requireable->id,
              'course_name' => $requirement->requireable->fullTitle,
          ];
        }else if($requirement->requireable_type == "App\\Models\\Electivelist"){
          return[
              'id' => $requirement->id,
              'notes' => $requirement->notes,
              'semester' => $requirement->semester,
              'ordering' => $requirement->ordering,
              'credits' => $requirement->credits,
              'type' => 'electivelist',
              'electivelist_id' => $requirement->requireable->id,
              'electivelist_name' => $requirement->requireable->name,
          ];
        }
      });
      $this->fractal->setSerializer(new JsonSerializer());
      return $this->fractal->createData($resource)->toJson();
    }
  }

  public function postNewdegreerequirement(Request $request){
    $data = $request->all();
    $degreerequirement = new Degreerequirement();
    if($degreerequirement->validate($data)){
      $degreerequirement->fill($data);
      if($request->has('course_id')){
        $course = Course::findOrFail($request->input('course_id'));
        $course->degreerequirements()->save($degreerequirement);
        return response()->json(trans('messages.item_saved'));
      }else if($request->has('electivelist_id')){
        $electivelist = Electivelist::findOrFail($request->input('electivelist_id'));
        $electivelist->degreerequirements()->save($degreerequirement);
        return response()->json(trans('messages.item_saved'));
      }
    }else{
      return response()->json($degreerequirement->errors(), 422);
    }
  }

  public function postDegreerequirement(Request $request, $id = -1){
    if($id < 0){
      abort(404);
    }else{
      $data = $request->all();
      $degreerequirement = Degreerequirement::findOrFail($id);
      if($degreerequirement->validate($data)){
        $degreerequirement->fill($data);
        if($request->has('course_id')){
          $course = Course::findOrFail($request->input('course_id'));
          $course->degreerequirements()->save($degreerequirement);
          return response()->json(trans('messages.item_saved'));
        }else if($request->has('electivelist_id')){
          $electivelist = Electivelist::findOrFail($request->input('electivelist_id'));
          $electivelist->degreerequirements()->save($degreerequirement);
          return response()->json(trans('messages.item_saved'));
        }
      }else{
        return response()->json($degreerequirement->errors(), 422);
      }
    }
  }


}
