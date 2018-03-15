@extends('layouts.master')

@section('title', 'Flowcharts - List')

@section('content')

<h3 class="top-header">Flowcharts for {{$student->name}}:</h3>

<a type="button" class="btn btn-success" href="/flowcharts/new">New Flowchart</a>

@foreach($plans as $plan)
  @include('flowcharts._flowchart', ['plan' => $plan, 'link' => true])
@endforeach

@endsection
