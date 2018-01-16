@extends('layouts.master')

@section('title', 'Home')

@section('content')

    @include('editable.textarea', ['field' => $editables['header']])

    <div class="container">
      <!-- Example row of columns -->
      <div class="row">
        <!--
        <div class="col-md-4">
          <h2>Courses</h2>
          <p>Find unique and interesting K-State courses from across the campus. View the current semester's schedule, and see course prerequisites and notes.</p>
          <p><a class="btn btn-default" href="{{ url('/courses') }}" role="button">Find Courses &raquo;</a></p>
        </div>
        <div class="col-md-4">
          <h2>Flowcharts</h2>
          <p>View your flowchart for your current degree program, try out other degree programs, and explore other K-State Engineering majors.</p>
          <p><a class="btn btn-default" href="{{ url('/flowcharts') }}" role="button">View Flowcharts &raquo;</a></p>
       </div>
     -->
        <div class="col-md-4">
          @include('editable.textarea', ['field' => $editables['advising']])
        </div>
        @if(DbConfig::get('navbar_showgroupsession') === true)
          <div class="col-md-4">
            @include('editable.textarea', ['field' => $editables['groupsession']])
          </div>
        @endif
        <div class="col-md-4">
          @include('editable.textarea', ['field' => $editables['help']])
        </div>
      </div>
    </div>

@endsection
