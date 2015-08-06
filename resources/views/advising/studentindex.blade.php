@extends('layouts.master')

@section('title', 'Advising - Schedule an Appointment')

@section('content')

<h3 class="top-header">Welcome {{ $user->student->first_name}}! Your currently assigned advisor is:</h3>

@include('advising._advisor', ['advisor' => $user->student->advisor])
<h3>Click an open time below to schedule a meeting or <a href="{{ url('advising/select') }}">view all available advisors.</a></h3>

@include('advising._singlecalendar', ['advisor' => $user->student->advisor])
<br>
@endsection