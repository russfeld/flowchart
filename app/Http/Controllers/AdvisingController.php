<?php

namespace App\Http\Controllers;

use App\User;
use App\Department;
use App\Meeting;
use App\Blackoutevent;

use Auth;
use Illuminate\Http\Request;
use DateTime;

class AdvisingController extends Controller
{

	public function __construct()
	{
		$this->middleware('auth');
	}

    /**
     * Responds to requests to GET /courses
     */
    public function getIndex()
    {
    	$user = Auth::user();

    	//currently authenticated user is an advisor
    	if($user->advisor()->count()){
    		$user->load('advisor.department');
    		return view('advising/advisorindex')->with('user', $user);
    	}else if($user->student()->count()){
    		$user->load('student.advisor.department');
    		return view('advising/studentindex')->with('user', $user);
    	}else{
    		abort('404', "AdvisingController: The currently authenticated user does not match any student or advisor records!");
    	}
    }

    public function getSelect($dept = -1)
    {
    	$user = Auth::user();

    	if($dept < 0){
	    	//currently authenticated user is an advisor
	    	if($user->advisor()->count()){
	    		$department = $user->advisor->department;
	    	}else if($user->student()->count()){
	    		$department = $user->student->department;
	    	} else{
    			abort('404', "AdvisingController: The currently authenticated user does not match any student or advisor records!");
    		}
	    }else{
	    	$department = Department::findOrFail($dept);
	    }
		
		$department->load('advisors');

		return view('advising/selectadvisor')->with('department', $department);
    }

    public function getMeetingfeed(Request $request){
    	if($request->has('id') && $request->has('start') && $request->has('end') ){
	    	$id = $request->input('id');
	    	$start = $request->input('start');
	    	$end = $request->input('end');
	    }else{
	    	abort('400');
	    }

    	$meetings = Meeting::where('advisor_id', $id)->where('start', '>=', new DateTime($start))->where('end', '<=', new DateTime($end))->get();

    	return $meetings->toJson();
    }

    public function getBlackoutfeed(Request $request){
    	if($request->has('id') && $request->has('start') && $request->has('end') ){
	    	$id = $request->input('id');
	    	$start = $request->input('start');
	    	$end = $request->input('end');
	    }else{
	    	abort('400');
	    }

    	$meetings = Blackoutevent::where('advisor_id', $id)->where('start', '>=', new DateTime($start))->where('end', '<=', new DateTime($end))->get();

    	return $meetings->toJson();
    }

    public function postCreatemeeting(Request $request){
        if($request->has('title') && $request->has('start') && $request->has('end') && $request->has('id')){
            $meeting = new Meeting;
            $meeting->title = $request->input('title');
            $meeting->start = $request->input('start');
            $meeting->end = $request->input('end');
            $meeting->advisor_id = $request->input('id');
            $user = Auth::user();
            if($user->student()->count()){
                $meeting->student_id = $user->student->id;
            }
            $meeting->save();
        }else{
            abort('400');
        }

        return ("success");
    }

}