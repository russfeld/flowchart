@extends('layouts.master')

@section('title', 'Advising - Schedule an Appointment')

@section('content')

<h3 class="top-header">Welcome {{ $user->student->first_name}}! Your currently selected advisor is:</h3>

@include('advising._advisor', ['advisor' => $advisor, 'link' => false])

<h4>Click an open time below to schedule a meeting or <a href="{{ url('advising/select/' . $user->student->department->id) }}">view all available advisors.</a></h4>

@include('advising._singlecalendar', ['advisor' => $advisor])
<input type="hidden" id="studentName" value="{{ $user->student->name }}" />
<br>
@endsection