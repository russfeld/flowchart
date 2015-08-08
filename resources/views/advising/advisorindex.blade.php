@extends('layouts.master')

@section('title', 'Advising - Manage Appointments')

@section('content')

@include('advising._advisor', ['advisor' => $advisor, 'link' => false])

<h4>Click on the calendar to view meeting details or schedule meetings or blackout times</h4>

@include('advising._advisorcalendar', ['advisor' => $advisor])

<br>
@endsection