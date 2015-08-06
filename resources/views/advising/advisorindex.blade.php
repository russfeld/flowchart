@extends('layouts.master')

@section('title', 'Advising - Manage Appointments')

@section('content')

@include('advising._advisor', ['advisor' => $advisor, 'link' => false])

<h4>Click on the calendar to view meeting details or schedule blackout times, or <a href="{{ url('advising/select/' . $advisor->department->id) }}">view all advisors.</a></h4>

@include('advising._advisorcalendar', ['advisor' => $advisor])

<br>
@endsection