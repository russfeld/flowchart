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
      $degreeprogram = Degreeprogram::withTrashed()->with('requirements')->findOrFail($id);
      $resource = new Collection($degreeprogram->requirements, function($requirement) {
          if(!empty($requirement->course_name)){
            return[
                'id' => $requirement->id,
                'notes' => $requirement->notes,
                'semester' => $requirement->semester,
                'ordering' => $requirement->ordering,
                'credits' => $requirement->credits,
                'name' => $requirement->course_name,
            ];
          }else{
            return[
                'id' => $requirement->id,
                'notes' => $requirement->notes,
                'semester' => $requirement->semester,
                'ordering' => $requirement->ordering,
                'credits' => $requirement->credits,
                'name' => $requirement->electivelist->name,
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
      $degreerequirement = Degreerequirement::findOrFail($id);

      $resource = new Item($degreerequirement, function($requirement) {
        if(!empty($requirement->course_name)){
          return[
              'id' => $requirement->id,
              'notes' => $requirement->notes,
              'semester' => $requirement->semester,
              'ordering' => $requirement->ordering,
              'credits' => $requirement->credits,
              'type' => 'course',
              'course_name' => $requirement->course_name,
          ];
        }else{
          return[
              'id' => $requirement->id,
              'notes' => $requirement->notes,
              'semester' => $requirement->semester,
              'ordering' => $requirement->ordering,
              'credits' => $requirement->credits,
              'type' => 'electivelist',
              'electivelist_id' => $requirement->electivelist->id,
              'electivelist_name' => $requirement->electivelist->name,
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
      if($request->has("course_name")){
        $degreerequirement->electivelist_id = null;
      }
      if($request->has("electivelist_id")){
        $degreerequirement->course_name = "";
      }
      $degreerequirement->save();
      return response()->json(trans('messages.item_saved'));
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
        if($request->has("course_name")){
          $degreerequirement->electivelist_id = null;
        }
        if($request->has("electivelist_id")){
          $degreerequirement->course_name = "";
        }
        $degreerequirement->save();
        return response()->json(trans('messages.item_saved'));
      }else{
        return response()->json($degreerequirement->errors(), 422);
      }
    }
  }

  public function postDeletedegreerequirement(Request $request){
    $this->validate($request, [
      'id' => 'required|exists:degreerequirements',
    ]);
    $degreerequirement = Degreerequirement::findOrFail($request->input('id'));
    $degreerequirement->delete();
    $request->session()->put('message', trans('messages.item_deleted'));
    $request->session()->put('type', 'success');
    return response()->json(trans('messages.item_deleted'));
  }


}
