@extends('layouts.master')

@section('title', 'Advising - Select Advisor')

@section('content')

<h3>{{ $department->name }} Advisors</h3>

@foreach($department->advisors as $advisor)
@include('advising._advisor', ['advisor' => $advisor])
@endforeach

@include('advising._multicalendar', ['advisors' => $department->advisors])

@endsection