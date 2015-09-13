@extends('layouts.master')

@section('title', 'Home')

@section('content')

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
        <div class="col-md-12">
          <h2>About the new Engineering Advising System</h2>
          <p>This site is a work in progress. Our goal is to create the best academic advising experience for students and advisors alike. Contact russfeld@ksu.edu if you have any questions or comments</p>
        </div>
      </div>
    </div>

@endsection