<?php

namespace App\Http\Controllers\Dashboard;

use Illuminate\Http\Request;

use App\Models\Student;
use App\Models\Advisor;
use App\Models\Meeting;
use App\Models\Groupsession;
use App\Models\Blackout;
use App\Models\Blackoutevent;
use App\Models\Course;
use App\Models\Degreeprogram;
use App\Models\Plan;
use App\Models\Degreerequirement;
use App\Models\Completedcourse;
use App\Models\Transfercourse;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class DashboardController extends Controller
{

    public function __construct()
  	{
  		$this->middleware('cas');
  		$this->middleware('update_profile');
      $this->middleware('advisors_only');
  	}

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function getIndex()
    {
        $data["students"] = Student::count();
        $data["advisors"] = Advisor::count();
        $data["meetings"] = Meeting::count();
        $data["groupsessions"] = Groupsession::count();
        $data["blackouts"] = Blackout::count();
        $data["blackoutevents"] = Blackoutevent::count();
        $data["courses"] = Course::count();
        $data["plans"] = Plan::count();
        $data["degreeprograms"] = Degreeprogram::count();
        $data["degreerequirements"] = Degreerequirement::count();
        $data["completedcourses"] = Completedcourse::count();
        $data["transfercourses"] = Transfercourse::count();
        return view('dashboard.index')->with('page_title', "Advising Dashboard")->with('data', $data);
    }

}
