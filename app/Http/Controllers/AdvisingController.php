<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Department;
use App\Models\Meeting;
use App\Models\Blackoutevent;
use App\Models\Advisor;
use App\Models\Blackout;

use Auth;
use Illuminate\Http\Request;
use DateTime;
use DateInterval;

use League\Fractal\Manager;
use League\Fractal\Resource\Collection;
use League\Fractal\Resource\Item;
use App\JsonSerializer;

use Cas;
use Carbon\Carbon;

class AdvisingController extends Controller
{

	public function __construct()
	{
		$this->middleware('cas');
		$this->middleware('update_profile');
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
						//if user is not hidden, show their calendar
						if(!$user->advisor->hidden){
	        		$user->load('advisor.department');
	        		return view('advising/advisorindex')->with('user', $user)->with('advisor', $user->advisor);

						//if not, show the selector
						}else{
							return redirect('advising/select');
						}
        	}else{
            if($user->student->advisor === null){
              return redirect('advising/select');
            }
        		$user->load('student.advisor.department');
        		return view('advising/studentindex')->with('user', $user)->with('advisor', $user->student->advisor);
        	}
        }else{
					$advisor = Advisor::findOrFail($id);
					if($user->is_advisor){
						if($advisor->id == $user->advisor->id){
							return view('advising/advisorindex')->with('user', $user)->with('advisor', $user->advisor);
						}else{
            	return view('advising/readonlyindex')->with('user', $user)->with('advisor', $advisor);
						}
					}else{
            return view('advising/studentindex')->with('user', $user)->with('advisor', $advisor);
					}
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

		$departments = Department::with(['advisors' => function($query) {
			$query->where('hidden', false);
		}])->get();

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
                    'start' => $meeting->start->toDateTimeString(),
                    'end' => $meeting->end->toDateTimeString(),
                    'type' => 'm',
                    'title' => $meeting->title,
										'className' => $meeting->statusclass,
                    'desc' => $meeting->description,
										'status' => $meeting->status,
                    'studentname' => $meeting->student->name,
                    'student_id' => $meeting->student->id,
                ];
            }else{
                return[
                    'id' => $meeting->id,
                    'start' => $meeting->start->toDateTimeString(),
                    'end' => $meeting->end->toDateTimeString(),
                    'type' => ($sid == $meeting->student_id) ? 's' : 'm',
                    'title' => ($sid == $meeting->student_id) ? $meeting->title : 'Advising',
                    'desc' => ($sid == $meeting->student_id) ? $meeting->description : '',
										'status' => ($sid == $meeting->student_id) ? $meeting->status : '',
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
            $endd->add(new DateInterval(config('app.in_advance')));
            $meeting->end = $endd->format('Y-m-d H:59:59');
            $meeting->id = 0;
            $meeting->title = '';

            $meetings->prepend($meeting);
        }

        $resource = new Collection($meetings, function($meeting) use ($user){
            if($user->is_advisor){
                return[
                    'id' => $meeting->id,
                    'start' => $meeting->start->toDateTimeString(),
                    'end' => $meeting->end->toDateTimeString(),
                    'type' => 'b',
                    'title' => $meeting->title,
                    'blackout_id' => $meeting->blackout_id,
                    'repeat' => $meeting->repeat
                ];
            }else{
                return[
                    'id' => $meeting->id,
                    'start' => $meeting->start->toDateTimeString(),
                    'end' => $meeting->end->toDateTimeString(),
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
                'start' => $blackout->start->toDateTimeString(),
                'end' => $blackout->end->toDateTimeString(),
                'title' => $blackout->title,
                'repeat_type' => $blackout->repeat_type,
                'repeat_every' => $blackout->repeat_every,
                'repeat_detail' => $blackout->repeat_detail,
                'repeat_until' => $blackout->repeat_until->toDateTimeString()
            ];
        });

        $this->fractal->setSerializer(new JsonSerializer());

        return $this->fractal->createData($resource)->toJson();
    }

    public function getMeeting(Request $request){
        $this->validate($request, [
            'meetingid' => 'required|exists:meetings,id'
        ]);

        $id = $request->input('meetingid');

        $meeting = Meeting::find($id);

        $user = Auth::user();
        if($user->is_advisor){
            if($user->advisor->id != $meeting->advisor_id){
                return response()->json("Cannot request a meeting not assigned to your advisor record", 500);
            }
        }else{
            return response()->json("Students cannot request individual meetings", 500);
        }

        $resource = new Item($meeting, function($meeting){
            return[
                'id' => $meeting->id,
                'start' => $meeting->start->toDateTimeString(),
                'end' => $meeting->end->toDateTimeString(),
                'type' => 'm',
                'title' => $meeting->title,
                'desc' => $meeting->description,
                'studentname' => $meeting->student->name,
                'student_id' => $meeting->student->id,
								'status' => $meeting->status,
            ];
        });

        $this->fractal->setSerializer(new JsonSerializer());

        return $this->fractal->createData($resource)->toJson();
    }

    public function getConflicts(Request $request){
        $user = Auth::user();

        if($user->is_advisor){

            $id = $user->advisor->id;
            $meetings = Meeting::where('advisor_id', $id)->where('conflict', true)->get();

            if(!$meetings->isEmpty()){
                $resource = new Collection($meetings, function($meeting) use ($user){
                    return[
                        'id' => $meeting->id,
                        'start' => $meeting->start->toDateTimeString(),
                        'end' => $meeting->end->toDateTimeString(),
                        'title' => $meeting->title,
                    ];
                });

                $this->fractal->setSerializer(new JsonSerializer());

                return $this->fractal->createData($resource)->toJson();
            }else{
                return response()->json("No conflicts", 204);
            }
        }else{
            return response()->json("Advisor Access Only", 403);
        }
    }

    public function postCreatemeeting(Request $request){
        $endd = new DateTime();
        $endd->add(new DateInterval(config('app.in_advance')));
        $end = $endd->format('Y-m-d H:59:59');

        $this->validate($request, [
            'id' => 'required|exists:advisors,id',
            'start' => 'required|date',
            'end' => 'required|date|after:start',
            'title' => 'required|string',
            'desc' => 'required|string',
            'meetingid' => 'sometimes|required|exists:meetings,id',
						'status' => 'sometimes|required|integer'
        ]);

        $user = Auth::user();

        //using Carbon for dates
        //http://laravel.com/docs/5.1/eloquent-mutators#date-mutators
        //http://stackoverflow.com/questions/24824624/laravel-q-where-between-dates
        //http://carbon.nesbot.com/docs/

		$startTime = Carbon::parse($request->input('start'));
		$endTime = Carbon::parse($request->input('end'));
		$advisorId = $request->input('id');

        if(!$user->is_advisor){
    		if($endTime->diffInMinutes($startTime) > 60){
                return response()->json("Meeting cannot be longer than one hour.", 500);
    		}//Is the scheduled meeting longer than one hour?

            if(!($startTime->isSameDay($endTime))){
                return response()->json("Meetings must begin and end on the same date.", 500);
            }
        }

        if($request->has('meetingid')){
            $collisions = Meeting::where('advisor_id', $advisorId)->where('end', '>', $startTime)->where('start', '<', $endTime)->where('id', '!=', $request->input('meetingid'))->get();
        }else{
            $collisions = Meeting::where('advisor_id', $advisorId)->where('end', '>', $startTime)->where('start', '<', $endTime)->get();
        }

        if(!$collisions->isEmpty()){
            return response()->json("There is another meeting scheduled during that time.", 500);
        }

        $blackouts = Blackoutevent::where('advisor_id', $advisorId)->where('end', '>', $startTime)->where('start', '<', $endTime)->get();

        if(!$blackouts->isEmpty()){
            return response()->json("That time is blacked out by the advisor.", 500);
        }

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
						$meeting->status = $request->input('status');
        }

        $meeting->title = $request->input('title');
        $meeting->start = $startTime;
        $meeting->end = $endTime;
        $meeting->description = $request->input('desc');
        $meeting->advisor_id = $request->input('id');
        $meeting->conflict = false;
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

				$startTime = Carbon::parse($request->input('bstart'));
				$endTime = Carbon::parse($request->input('bend'));
				if(!($startTime->isSameDay($endTime))){
					  $error = array(
							'bend' => array("Blackouts must begin and end on the same date"),
						);
						return response()->json($error, 422);
				}

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

        $blackout->start = Carbon::parse($request->input('bstart'));
        $blackout->end = Carbon::parse($request->input('bend'));
        $blackout->title = $request->input('btitle');
        $blackout->repeat_type = $request->input('brepeat');
        if($blackout->repeat_type > 0){
            $blackout->repeat_every = $request->input('brepeatevery');
            $blackout->repeat_until = Carbon::parse($request->input('brepeatuntil'));
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

				$startTime = Carbon::parse($request->input('bstart'));
				$endTime = Carbon::parse($request->input('bend'));
				if(!($startTime->isSameDay($endTime))){
					  $error = array(
							'bend' => array("Blackouts must begin and end on the same date"),
						);
						return response()->json($error, 422);
				}

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

        $blackout->start = Carbon::parse($request->input('bstart'));
        $blackout->end = Carbon::parse($request->input('bend'));
        $blackout->title = $request->input('btitle');

        $collisions = Meeting::where('advisor_id', $blackout->advisor_id)->where('end', '>', $blackout->start)->where('start', '<', $blackout->end)->get();
        foreach($collisions as $meeting){
            $meeting->conflict = true;
            $meeting->save();
        }

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

    public function postResolveconflict(Request $request){
        $this->validate($request, [
            'meetingid' => 'required|exists:meetings,id'
        ]);

        $user = Auth::user();

        $meeting = Meeting::find($request->input('meetingid'));

        if(!$user->is_advisor){
            return response()->json("Students cannot resolve conflicts", 500);
        }

        $meeting->conflict = false;
        $meeting->save();

        return ("Conflict marked as resolved!");
    }

}
