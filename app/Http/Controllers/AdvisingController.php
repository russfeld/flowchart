<?php

namespace App\Http\Controllers;

use App\User;
use App\Department;
use App\Meeting;
use App\Blackoutevent;
use App\Advisor;
use App\Blackout;

use Auth;
use Illuminate\Http\Request;
use DateTime;
use DateInterval;

use League\Fractal\Manager;
use League\Fractal\Resource\Collection;
use League\Fractal\Resource\Item;
use App\JsonSerializer;

use Cas;

class AdvisingController extends Controller
{

	public function __construct()
	{
		$this->middleware('cas');
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
        	if($user->is_advisor){
        		$user->load('advisor.department');
        		return view('advising/advisorindex')->with('user', $user)->with('advisor', $user->advisor);
        	}else{
                if($user->student->advisor === null){
                    return redirect('advising/select');
                }
        		$user->load('student.advisor.department');
        		return view('advising/studentindex')->with('user', $user)->with('advisor', $user->student->advisor);
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
	    	if($user->is_advisor){
	    		$dept = $user->advisor->department->id;
	    	}else{
                if($user->student->department === null){
                    $dept = 1;
                }else{
	    		    $dept = $user->student->department->id;
                }
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
        $advisor = false;

        $user = Auth::user();
        if($user->is_advisor){
            $advisor = true;
        }else{
            $sid = $user->student->id;
        }

    	$meetings = Meeting::where('advisor_id', $id)->where('start', '>=', new DateTime($start))->where('end', '<=', new DateTime($end))->get();

        $resource = new Collection($meetings, function($meeting) use ($sid, $advisor) {
            if($advisor){
                return[
                    'id' => $meeting->id,
                    'start' => $meeting->start,
                    'end' => $meeting->end,
                    'type' => 'm',
                    'title' => $meeting->title,
                    'desc' => $meeting->description,
                    'studentname' => $meeting->student->name,
                    'student_id' => $meeting->student->id,
                ];
            }else{
                return[
                    'id' => $meeting->id,
                    'start' => $meeting->start,
                    'end' => $meeting->end,
                    'type' => ($sid == $meeting->student_id) ? 's' : 'm',
                    'title' => ($sid == $meeting->student_id) ? $meeting->title : 'Advising',
                    'desc' => ($sid == $meeting->student_id) ? $meeting->description : ''
                ];
            }
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

        $user = Auth::user();
        if(!$user->is_advisor){
            $meeting = new Blackoutevent();
            $startd = new DateTime($start);
            $meeting->start = $startd->format('Y-m-d H:i:s');
            $endd = new DateTime();
            $endd->add(new DateInterval("PT4H"));
            $meeting->end = $endd->format('Y-m-d H:00:00');
            $meeting->id = 0;
            $meeting->title = '';

            $meetings->prepend($meeting);
        }

        $resource = new Collection($meetings, function($meeting) use ($user){
            if($user->is_advisor){
                return[
                    'id' => $meeting->id,
                    'start' => $meeting->start,
                    'end' => $meeting->end,
                    'type' => 'b',
                    'title' => $meeting->title,
                    'blackout_id' => $meeting->blackout_id,
                    'repeat' => $meeting->repeat
                ];
            }else{
                return[
                    'id' => $meeting->id,
                    'start' => $meeting->start,
                    'end' => $meeting->end,
                    'type' => 'b',
                    'title' => $meeting->title
                ];
            }
        });

        $this->fractal->setSerializer(new JsonSerializer());

        return $this->fractal->createData($resource)->toJson();
    }

    public function getBlackout(Request $request){
        $this->validate($request, [
            'id' => 'required|exists:blackouts,id'
        ]);

        $id = $request->input('id');

        $blackout = Blackout::find($id);

        $user = Auth::user();
        if($user->is_advisor){
            if($user->advisor->id != $blackout->advisor_id){
                return response()->json("Cannot edit a blackout not assigned to your advisor record", 500);
            }
        }

        $resource = new Item($blackout, function($blackout){
            return[
                'id' => $blackout->id,
                'start' => $blackout->start,
                'end' => $blackout->end,
                'title' => $blackout->title,
                'repeat_type' => $blackout->repeat_type,
                'repeat_every' => $blackout->repeat_every,
                'repeat_detail' => $blackout->repeat_detail,
                'repeat_until' => $blackout->repeat_until
            ];
        });

        $this->fractal->setSerializer(new JsonSerializer());

        return $this->fractal->createData($resource)->toJson();
    }

    public function postCreatemeeting(Request $request){
        $endd = new DateTime();
        $endd->add(new DateInterval("PT4H"));
        $end = $endd->format('Y-m-d H:00:00');

        $this->validate($request, [
            'id' => 'required|exists:advisors,id',
            'start' => 'required|date',
            'end' => 'required|date|after:start',
            'title' => 'required|string',
            'desc' => 'string',
            'meetingid' => 'sometimes|required|exists:meetings,id'
        ]);

//Added by chris
		$startTime = $request->input('start');
		//$sotStartTime = strtotime($startTime);

		$endTime = $request->input('end');
		//$sotEndTime = $strtotime($endTime);

		$advisorId = $request->input('id');

		$lengthScheduled = (strtotime($startTime) - strtotime($endTime)) / 3600;

		if($lengthScheduled > 1){
		return ("Meeting cannot be longer than one hour.");
		}//Is the scheduled meeting longer than one hour?


		//$midnight = strtotime(date('d-m-Y',$startTime));

		//$endOfDay = date("Y-m-d H:i:s", strtotime('+5 hours', $startOfDay))
		$dateObject = date_parse($startTime);

		$startOfDay = date('Y-m-d H:i:s', mktime(0,0,0, $dateObject['month'], $dateObject['day'], $dateObject['year'] ));//creates a time starting that time at 00:00:00
		$endOfDay = date('Y-m-d H:i:s', mktime(23,59,59, $dateObject['month'], $dateObject['day'], $dateObject['year'] ));//create a time at 23:59:59


		//Returns meetings that would be during the event time.
		$canCreate = true;
		//return strtotime($startTime) . " hey " . strtotime($startOfDay);
		$meetings = Meeting::whereRaw('start BETWEEN ? AND ? AND advisor_id = ?', [$startOfDay, $endOfDay, $advisorId])->get();

		$hello = "";
		foreach($meetings as $meeting){
			if((strtotime($startTime) < strtotime($meeting->end)) && (strtotime($endTime) <= strtotime($meeting->start))){
				$hello = "yeah";
			}
		}

		return $hello;




        $user = Auth::user();

        if(!$user->is_advisor){
            $this->validate($request, [
                'start' => 'after:' . $end
            ]);
        }else{
            $this->validate($request, [
                'studentid' => 'required|exists:students,id',
            ]);
        }

        if($request->has('meetingid')){
            $meeting = Meeting::find($request->input('meetingid'));
            if(!$user->is_advisor){
                if($meeting->student_id != $user->student->id){
                    return response()->json("Cannot modify an appointment not assigned to your student record", 500);
                }
            }
            $meeting->sequence++;
        }else{
            $meeting = new Meeting;
            $meeting->sequence = 0;
        }

        if(!$user->is_advisor){
            $meeting->student_id = $user->student->id;
        }else{
            $meeting->student_id = $request->input('studentid');
        }

        $meeting->title = $request->input('title');
        $meeting->start = $request->input('start');
        $meeting->end = $request->input('end');
        $meeting->description = $request->input('desc');
        $meeting->advisor_id = $request->input('id');
        $meeting->save();

        return ("Advising meeting saved!");
    }

    public function postDeletemeeting(Request $request){
        $this->validate($request, [
            'meetingid' => 'required|exists:meetings,id'
        ]);

        $user = Auth::user();

        $meeting = Meeting::find($request->input('meetingid'));

        if(!$user->is_advisor){
            if($meeting->student_id != $user->student->id){
                return response()->json("Cannot delete an appointment not assigned to your student record", 500);
            }
        }

        $meeting->delete();

        return ("Advising meeting deleted!");
    }

    public function postCreateblackout(Request $request){
        $this->validate($request, [
            'bstart' => 'required|date',
            'bend' => 'required|date|after:bstart',
            'btitle' => 'required|string',
            'bblackoutid' => 'sometimes|required|exists:blackouts,id',
            'brepeat' => 'required|integer|between:0,2',
            'brepeatevery' => 'sometimes|required|integer|required_if:brepeat,1|required_if:brepeat,2',
            'brepeatweekdaysm' => 'sometimes|required|required_if:brepeat,2',
            'brepeatweekdayst' => 'sometimes|required|required_if:brepeat,2',
            'brepeatweekdaysw' => 'sometimes|required|required_if:brepeat,2',
            'brepeatweekdaysu' => 'sometimes|required|required_if:brepeat,2',
            'brepeatweekdaysf' => 'sometimes|required|required_if:brepeat,2',
            'brepeatuntil' => 'sometimes|required|date|after:bstart|required_if:brepeat,2|required_if:brepeat,1'
        ]);

        $user = Auth::user();

        if($request->has('bblackoutid')){
            $blackout = Blackout::find($request->input('bblackoutid'));
            if($user->is_advisor){
                if($blackout->advisor_id != $user->advisor->id){
                    return response()->json("Cannot modify an appointment not assigned to your advisor record", 500);
                }
            }
        }else{
            $blackout = new Blackout;
            if($user->is_advisor){
                $blackout->advisor_id = $user->advisor->id;
            }
        }

        $blackout->start = $request->input('bstart');
        $blackout->end = $request->input('bend');
        $blackout->title = $request->input('btitle');
        $blackout->repeat_type = $request->input('brepeat');
        if($blackout->repeat_type > 0){
            $blackout->repeat_every = $request->input('brepeatevery');
            $blackout->repeat_until = $request->input('brepeatuntil');
            $startd = new DateTime($blackout->start);
        }
        if($blackout->repeat_type == 2){
            $detail = "";
            if($request->input('brepeatweekdaysm') == 'true'){
                $detail = $detail . "1";
            }
            if($request->input('brepeatweekdayst') == 'true'){
                $detail = $detail . "2";
            }
            if($request->input('brepeatweekdaysw') == 'true'){
                $detail = $detail . "3";
            }
            if($request->input('brepeatweekdaysu') == 'true'){
                $detail = $detail . "4";
            }
            if($request->input('brepeatweekdaysf') == 'true'){
                $detail = $detail . "5";
            }
            $blackout->repeat_detail = $detail;
        }

        $blackout->save();


        return ("Blackout series saved!");
    }

    public function postCreateblackoutevent(Request $request){
        $this->validate($request, [
            'bstart' => 'required|date',
            'bend' => 'required|date|after:bstart',
            'btitle' => 'required|string',
            'bblackouteventid' => 'sometimes|required|exists:blackoutevents,id'
        ]);

        $user = Auth::user();

        if($request->has('bblackouteventid')){
            $blackout = Blackoutevent::find($request->input('bblackouteventid'));
            if($user->is_advisor){
                if($blackout->advisor_id != $user->advisor->id){
                    return response()->json("Cannot modify a blackout not assigned to your advisor record", 500);
                }
            }
        }else{
            $blackout = new Blackoutevent;
            if($user->is_advisor){
                $blackout->advisor_id = $user->advisor->id;
            }
        }

        $blackout->start = $request->input('bstart');
        $blackout->end = $request->input('bend');
        $blackout->title = $request->input('btitle');

        $blackout->save();


        return ("Blackout event saved!");
    }

    public function postDeleteblackout(Request $request){
        $this->validate($request, [
            'bblackoutid' => 'required|exists:blackouts,id'
        ]);

        $user = Auth::user();

        $blackout = Blackout::find($request->input('bblackoutid'));

        if($user->is_advisor){
            if($blackout->advisor_id != $user->advisor->id){
                return response()->json("Cannot delete a blackout not assigned to your advisor record", 500);
            }
        }

        $blackout->delete();

        return ("Blackout series deleted!");
    }

    public function postDeleteblackoutevent(Request $request){
        $this->validate($request, [
            'bblackouteventid' => 'required|exists:blackoutevents,id'
        ]);

        $user = Auth::user();

        $blackout = Blackoutevent::find($request->input('bblackouteventid'));

        if($user->is_advisor){
            if($blackout->advisor_id != $user->advisor->id){
                return response()->json("Cannot delete a blackout not assigned to your advisor record", 500);
            }
        }

        $blackout->delete();

        return ("Blackout event deleted!");
    }

}
