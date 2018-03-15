@extends('layouts.master')

@section('title', 'Flowcharts - Select Student')

@section('content')

@foreach($students as $student)
  {{$student->name}} <a href="/flowcharts/{{ $student->id }}">Flowchart</a><br>
@endforeach

@endsection
