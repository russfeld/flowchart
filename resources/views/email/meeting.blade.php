@extends('email.master')

@section('content')

<h1>An advising appointment has been {{ $type }}!</h1>

<p><b>Title:</b> {{ $meeting->title }}</p>
<p><b>Start:</b> {{ $meeting->start }}</p>
<p><b>End:</b> {{ $meeting->end }}</p>
<p><b>Student:</b> {{ $meeting->student->name }}</p>
<p><b>Description:</b> {{ $meeting->description }}</p>



@endsection