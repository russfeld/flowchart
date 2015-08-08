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
		$this->middleware('auth');
        $this->fractal = new Manager();
	}

    /**
     * Responds to requests to GET /courses
     */
    public function getIndex()
    {
        return view('profiles/index');
    }

    public function getStudentfeed(Request $request){
    	$user = Auth::user();
    	if($user->isadvisor){
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
    		return response()->json("Only advisors may access this data", 403);
    	}
    }

}