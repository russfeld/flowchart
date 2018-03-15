@extends('layouts.masterwide')

@section('title', 'Flowcharts - Manage Flowchart')

@section('content')

@include('flowcharts._flowchart', ['plan' => $plan, 'link' => false])

@endsection
