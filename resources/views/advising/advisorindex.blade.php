@extends('layouts.master')

@section('title', 'Advising - Manage Appointments')

@section('content')

<div id="conflictingMeetings" class="col-xs-12 col-sm-12 col-md-12 col-lg-12 div-danger rounded hidden">
	<span>You have meetings that conflict with scheduled blackouts. <button type="button" class="btn btn-primary" id="resolveButton">Resolve</button></span>
</div>
@include('advising._resolve')

@include('advising._advisor', ['advisor' => $advisor, 'link' => false])

<div class="col-sm-6">
  <button id="createMeetingBtn" class="btn btn-primary btn-block">Create an Advising Meeting</button>
</div>
<div class="col-sm-6">
  <button id="createBlackoutBtn" class="btn btn-primary btn-block">Create a Blackout Time</button>
</div>
<div class="col-sm-12">
	<h4>You can also click on the calendar to view meeting details or schedule meetings or blackout times</h4>
</div>
@include('advising._advisorcalendar', ['advisor' => $advisor])

<br>
@endsection
