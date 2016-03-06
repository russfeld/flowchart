@extends('layouts.master')

@section('title', 'Courses')

@section('content')
<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 bg-light-purple rounded">
	<h3 class="top-header text-center">Group Advising</h3>
</div>

<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
  <p>The CIS department is moving to group advising sessions as part of Fall 2016 enrollment. Please plan to attend the appropriate session from the list below. All group advising sessions will be held in Fiedler Auditorium (DUF 1107).</p>

  <ul>
    <li><b>Juniors/seniors (60+ hours already finished):</b> Wednesday, March 9, 6:00-9:00 pm</li>
    <li><b>Freshmen/sophomores with last name A-M:</b> Wednesday, March 23, 6:00-9:00 pm</li>
    <li><b>Freshmen/sophomores with last name N-Z:</b> Wednesday, March 30, 6:00-9:00 pm</li>
  </ul>

  <p>At the group session, students will meet with an advisor on a first-come, first-serve basis. The advisor will approve your Fall 2016 schedule and lift your advising flag.<p>

  <p>Please bring the following to the group advising session:<p>

  <ul>
    <li>A copy of your DARS report (<a href="http://www.k-state.edu/ksis/help/students/stuViewDARS.html">Instructions</a>)</li>
    <li>A proposed Fall 2016 schedule. When planning your schedule, you should consult both your DARS report and your current CIS flowchart (<a href="https://flowcharts.engg.ksu.edu/">Engineering Flowchart Site</a>).
      <ul>
        <li>Pay attention to which CIS courses are marked as Fall-only or Spring-only in the flowchart. Students who do not have a proposed schedule will be asked to complete one BEFORE meeting with an advisor at the group session.</li>
      </ul></li>
  </ul>

  <p>After your group advising session, you will still need to enroll in KSIS. You can look up your enrollment time in your KSIS Student Center under “Enrollment Dates”.  This is the first day and time when you are eligible to enroll. Please note that enrollment dates are staggered by number of hours: seniors may enroll as early as March 21, but freshmen may not enroll until April 15.</p>

  <p>If you have additional questions or are unable to make ANY of the listed group advising times, then you may schedule an individual appointment with your advisor. However, these individual times will be limited.</p>

	<a href=" {{ url('groupsession') }}" class="btn btn-primary">Check in here</a>
	<hr class="help-line">
</div>


@endsection
