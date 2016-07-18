@extends('layouts.master')

@section('title', 'Advising - View Advisor Calendar')

@section('content')

@include('advising._advisor', ['advisor' => $advisor, 'link' => false])

<div class="col-sm-12">
	<h4>This calendar is read-only!</h4>
</div>

@include('advising._readonlycalendar', ['advisor' => $advisor])

<br>
@endsection
