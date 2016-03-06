@extends('layouts.master')

@section('title', 'Advising - Schedule an Appointment')

@section('content')

<h3 class="top-header">Welcome to Group Advising!</h3>

<p>At the group session, you will meet with an advisor on a first-come, first-serve basis. The advisor will approve your schedule for the next semester and lift your advising flag.<p>

<p>After your group advising session, you will still need to enroll in KSIS. You can look up your enrollment time in your KSIS Student Center under “Enrollment Dates”.  This is the first day and time when you are eligible to enroll. Please note that enrollment dates are staggered by number of hours: seniors may enroll as early as March 21, but freshmen may not enroll until April 15.</p>

<p>If you have additional questions or are unable to make ANY of the listed group advising times, then you may schedule an individual appointment with your advisor. However, these individual times will be limited.</p>

<div class="panel panel-primary">
  <div class="panel-heading">Make sure you have the following available, either on paper or electronically, <b>before</b> you check in:</div>
  <div class="panel-body">
    <ul>
      <li>A copy of your DARS report (<a href="http://www.k-state.edu/ksis/help/students/stuViewDARS.html">Instructions</a>)</li>
      <li>A proposed schedule for the next semester.
        <ul>
          <li>When planning your schedule, you should consult both your DARS report and your current CIS flowchart (<a href="https://flowcharts.engg.ksu.edu/">Engineering Flowchart Site</a>)</li>
          <li>Pay attention to which CIS courses are marked as Fall-only or Spring-only in the flowchart.</li>
        </ul>
      </li>
    </ul>
    <p><b>Students who do not have a DARS report and proposed schedule will not be seen by an advisor until these steps are completed</b></p>
    <a class="btn btn-success" href="{{ url('groupsession/list') }}">I have my DARS and Schedule ready</a>
  </div>
</div>



@endsection
