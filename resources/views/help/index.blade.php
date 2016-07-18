@extends('layouts.master')

@section('title', 'Courses')

@section('content')
<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 bg-light-purple rounded">
	<h3 class="top-header text-center">Engineering Advising Help</h3>
	<h4>Table of Contents</h4>
	<ol>
		<li><a href="#schedule">Scheduling a Meeting</a></li>
		<li><a href="#schedule">Editing a Meeting</a></li>
		<li><a href="#schedule">Deleting a Meeting</a></li>
	</ol>
</div>

<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
	<h4 id="schedule">1. Scheduling a Meeting</h4>
	<ol>
		<li>From the homepage, click the <a class="btn btn-default" style="pointer-events: none" href="#">Schedule an Appointment &raquo;</a> button:
			<img class="img-responsive img-help" src="{{ url('img/help/1login.gif') }}" alt="Click Schedule an Appointment">
			or click the <a class="btn btn-primary" style="pointer-events: none" href="#">Advising</a> button in the top navigation menu:
			<img class="img-responsive img-help" src="{{ url('img/help/2login.gif') }}" alt="Click Advising button"><br><br></li>
		<li>Once you log in, you'll be shown the schedule for your assigned advisor, if any. If you wish to schedule a meeting wtih another advisor, click the <a class="btn btn-primary" style="pointer-events: none" href="#">Select a Different Advisor</a> button.
		 	<img class="img-responsive img-help" src="{{ url('img/help/3select.gif') }}" alt="View All Available Advisors"><br><br></li>
		<li>To schedule a meeting, click on any open time on the calendar:
			<img class="img-responsive img-help" src="{{ url('img/help/4time.gif') }}" alt="Schedule a 20 Minute Meeting">
			or click and drag to select a time range:
			<img class="img-responsive img-help" src="{{ url('img/help/5time.gif') }}" alt="Schedule a Longer Meeting"><br><br></li>
		<li>In the popup window, edit the meeting details, and click <a class="btn btn-primary" style="pointer-events: none" href="#">Save</a> to create the meeting:
			<img class="img-responsive img-help" src="{{ url('img/help/6details.gif') }}" alt="Schedule a Longer Meeting"></li>
	</ol>
	<hr class="help-line">
	<h4 id="schedule">2. Editing a Meeting</h4>
	<ol>
		<li>To edit a meeting, click on any of the green meetings on your calendar, make your changes, and click <a class="btn btn-primary" style="pointer-events: none" href="#">Save</a>:
			<img class="img-responsive img-help" src="{{ url('img/help/7edit.gif') }}" alt="Edit a Meeting"></li>
	</ol>
	<hr class="help-line">
	<h4 id="schedule">3. Deleting a Meeting</h4>
	<ol>
		<li>To delete a meeting, click on any of the green meetings on your calendar, and click the <a class="btn btn-danger" style="pointer-events: none" href="#">Delete</a> button:
			<img class="img-responsive img-help" src="{{ url('img/help/8delete.gif') }}" alt="Delete a Meeting"></li>
	</ol>
	<hr class="help-line">
</div>


@endsection
