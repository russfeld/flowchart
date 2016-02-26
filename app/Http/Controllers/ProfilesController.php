<?php

namespace App\Http\Controllers;

use App\User;
use App\Student;

use League\Fractal\Manager;
use League\Fractal\Resource\Collection;
use App\JsonSerializer;

use Auth;
use Illuminate\Http\Request;

class ProfilesController extends Controller
{

	public function __construct()
	{
		$this->middleware('cas');
        $this->fractal = new Manager();
	}

    /**
     * Responds to requests to GET /courses
     */
    public function getIndex()
    {
        $user = Auth::user();

        if($user->is_advisor){
            $user->load('advisor');
            return view('profiles/advisorindex')->with('advisor', $user->advisor);
        }else{
            $user->load('student.advisor', 'student.department');
            return view('profiles/index')->with('student', $user->student);
        }
    }

    public function getStudentfeed(Request $request){
    	$user = Auth::user();
    	if($user->is_advisor){
	    	$this->validate($request, [
	            'query' => 'required|string',
	        ]);

          $students = Student::filterName($request->input('query'))->get();

	        $resource = new Collection($students, function($student) {
                return[
                    'value' => $student->name,
                    'data' => $student->id,
                ];
	        });

	    	return $this->fractal->createData($resource)->toJson();
    	}else{
    		return response()->json(trans('errors.advisors_only'), 403);
    	}
    }

    public function postUpdate(Request $request){
        $user = Auth::user();
        if($user->is_advisor){
					return response()->json(trans('errors.unimplemented'), 400);
        }else{
            $this->validate($request, [
                'first_name' => 'required|string',
                'last_name' => 'required|string',
            ]);
            $student = $user->student;
            $student->first_name = $request->input('first_name');
            $student->last_name = $request->input('last_name');
            $student->save();
						return response()->json(trans('messages.profile_updated'));
        }

    }

}
