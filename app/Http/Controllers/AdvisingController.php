<?php

namespace App\Http\Controllers;

use App\User;
use App\Department;
use App\Meeting;
use App\Blackoutevent;
use App\Advisor;

use Auth;
use Illuminate\Http\Request;
use DateTime;
use DateInterval;

use League\Fractal\Manager;
use League\Fractal\Resource\Collection;
use App\JsonSerializer;

class AdvisingController extends Controller
{

	public function __construct()
	{
		$this->middleware('auth');
        $this->fractal = new Manager();
	}

    /**
     * Responds to requests to GET /courses
     */
    public function getIndex($id = -1)
    {
    	$user = Auth::user();

        if($id < 0){
        	//currently authenticated user is an advisor
        	if($user->advisor()->count()){
        		$user->load('advisor.department');
        		return view('advising/advisorindex')->with('user', $user);
        	}else if($user->student()->count()){
        		$user->load('student.advisor.department');
        		return view('advising/studentindex')->with('user', $user)->with('advisor', $user->student->advisor);
        	}else{
        		abort('404', "AdvisingController: The currently authenticated user does not match any student or advisor records!");
        	}
        }else{
            $advisor = Advisor::findOrFail($id);
            return view('advising/studentindex')->with('user', $user)->with('advisor', $advisor);
        }
    }

    public function getSelect($dept = -1)
    {
    	$user = Auth::user();

    	if($dept < 0){
	    	//currently authenticated user is an advisor
	    	if($user->advisor()->count()){
	    		$dept = $user->advisor->department->id;
	    	}else if($user->student()->count()){
	    		$dept = $user->student->department->id;
	    	} else{
    			abort('404', "AdvisingController: The currently authenticated user does not match any student or advisor records!");
    		}
	    }else{
	    	Department::findOrFail($dept);
	    }
		
		$departments = Department::with('advisors')->get();

		return view('advising/selectadvisor')->with('departments', $departments)->with('dept', $dept);
    }

    public function getMeetingfeed(Request $request){
    	$this->validate($request, [
            'id' => 'required|exists:advisors,id',
            'start' => 'required|date',
            'end' => 'required|date|after:start',
        ]);

        $id = $request->input('id');
        $start = $request->input('start');
        $end = $request->input('end');
        $sid = -1;

        $user = Auth::user();
        if($user->student()->count()){
            $sid = $user->student->id;
        }

    	$meetings = Meeting::where('advisor_id', $id)->where('start', '>=', new DateTime($start))->where('end', '<=', new DateTime($end))->get();

        $resource = new Collection($meetings, function($meeting) use ($sid) {
            return[
                'id' => $meeting->id,
                'start' => $meeting->start,
                'end' => $meeting->end,
                'type' => ($sid == $meeting->student_id) ? 's' : 'm',
                'title' => ($sid == $meeting->student_id) ? $meeting->title : 'Advising',
                'desc' => ($sid == $meeting->student_id) ? $meeting->description : ''
            ];
        }); 

        $this->fractal->setSerializer(new JsonSerializer());

    	return $this->fractal->createData($resource)->toJson();
    }

    public function getBlackoutfeed(Request $request){
    	$this->validate($request, [
            'id' => 'required|exists:advisors,id',
            'start' => 'required|date',
            'end' => 'required|date|after:start'
        ]);

        $id = $request->input('id');
        $start = $request->input('start');
        $end = $request->input('end');

    	$meetings = Blackoutevent::where('advisor_id', $id)->where('start', '>=', new DateTime($start))->where('end', '<=', new DateTime($end))->get();

        $meeting = new Blackoutevent();
        $startd = new DateTime($start);
        $meeting->start = $startd->format('Y-m-d H:i:s');
        $endd = new DateTime();
        $endd->add(new DateInterval("PT4H"));
        $meeting->end = $endd->format('Y-m-d H:00:00');
        $meeting->id = 0;
        $meeting->title = '';

        $meetings->prepend($meeting);

    	return $meetings->toJson();
    }

    public function postCreatemeeting(Request $request){
        $endd = new DateTime();
        $endd->add(new DateInterval("PT4H"));
        $end = $endd->format('Y-m-d H:00:00');

        $this->validate($request, [
            'id' => 'required|exists:advisors,id',
            'start' => 'required|date|after:' . $end,
            'end' => 'required|date|after:start',
            'title' => 'required|string',
            'desc' => 'string',
            'meetingid' => 'sometimes|required|exists:meetings,id'
        ]);

        $user = Auth::user();

        if($request->has('meetingid')){
            $meeting = Meeting::find($request->input('meetingid'));
            if($user->student()->count()){
                if($meeting->student_id != $user->student->id){
                    return response()->json("Cannot modify an appointment not assigned to your student record", 500);
                }
            }
        }else{
            $meeting = new Meeting;
            if($user->student()->count()){
                $meeting->student_id = $user->student->id;
            }
        }

        $meeting->title = $request->input('title');
        $meeting->start = $request->input('start');
        $meeting->end = $request->input('end');
        $meeting->description = $request->input('desc');
        $meeting->advisor_id = $request->input('id');
        $meeting->save();

        return ("success");
    }

    public function postDeletemeeting(Request $request){
        $this->validate($request, [
            'meetingid' => 'required|exists:meetings,id'
        ]);

        $user = Auth::user();

        $meeting = Meeting::find($request->input('meetingid'));

        if($user->student()->count()){
            if($meeting->student_id != $user->student->id){
                return response()->json("Cannot delete an appointment not assigned to your student record", 500);
            }
        }

        $meeting->delete();

        return ("success");
    }

}