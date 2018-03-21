<?php

namespace App\Http\Controllers;

use Auth;

use League\Fractal\Manager;
use League\Fractal\Resource\Collection;
use App\JsonSerializer;

use App\Models\Completedcourse;

use Illuminate\Http\Request;

class CompletedcoursesController extends Controller
{

  public function __construct()
	{
		$this->middleware('cas');
    $this->fractal = new Manager();
	}

  public function getCompletedcoursefeed(Request $request, $id = -1){
    if($id < 0){
      abort(404);
    }

    $user = Auth::user();

    if($user->is_advisor || $user->student_id == $id){
      $this->validate($request, [
            'query' => 'required|string',
        ]);

        $completedcourses = Completedcourse::where('student_id', $id)->filterName($request->input('query'))->get();

        $resource = new Collection($completedcourses, function($course) {
              return[
                  'value' => $course->fullTitle,
                  'data' => $course->id,
              ];
        });

      return $this->fractal->createData($resource)->toJson();

    }else{
      abort(404);
    }
  }
}
