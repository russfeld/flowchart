<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Models\Advisor;

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
    public function getIndex(Request $request)
    {
        $user = Auth::user();

        if($user->is_advisor){
            $user->load('advisor');
						if ($request->session()->has('lastUrl')) {
						  return view('profiles/advisorindex')->with('advisor', $user->advisor)->with('lastUrl', $request->session()->get('lastUrl'));
						}else{
							return view('profiles/advisorindex')->with('advisor', $user->advisor);
						}
        }else{
            $user->load('student.advisor', 'student.department');

						if ($request->session()->has('lastUrl')) {
						  return view('profiles/index')->with('student', $user->student)->with('lastUrl', $request->session()->get('lastUrl'));
						}else{
							return view('profiles/index')->with('student', $user->student);
						}


        }
    }

		public function getPic(Request $request, $id = -1){
			$user = Auth::user();
			if($user->is_advisor){
				if($id < 0){
					return response()->json($user->advisor->pic);
				}else{
					$advisor = Advisor::findOrFail($id);
					return response()->json(url($advisor->pic));
				}
			}else{
				return response()->json(trans('errors.unimplemented'));
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
				$data = $request->all();
				$advisor = $user->advisor;
				if($advisor->validate($data)){
					$advisor->fill($data);
					if($request->hasFile('pic')){
						$advisor->savePic($request->file('pic'));
					}
					$user->update_profile = true;
					$user->save();
					$advisor->save();
					return response()->json(trans('messages.profile_updated'));
				}else{
					return response()->json($advisor->errors(), 422);
				}
      }else{
				$data = $request->all();
				$student = $user->student;
        if($student->validate($data)){
          $student->fill($data);
					$user->update_profile = true;
					$user->save();
          $student->save();
          return response()->json(trans('messages.profile_updated'));
        }else{
          return response()->json($student->errors(), 422);
        }
      }
    }

		public function postNewstudent(Request $request){
			$user = Auth::user();
			if($user->is_advisor){
				$data = $request->all();
				$user = new User();
	      if($user->validate($data)){
					$user->fill($data);
					$user->is_advisor = false;
					$user->save();
					$student = Student::buildFromUser($user);
					$student->save();
					return response()->json(trans('messages.user_created'), 200);
				}else{
					return response()->json($user->errors(), 422);
				}
			}else{
				return response()->json(trans('errors.advisors_only'), 403);
			}
		}

}
