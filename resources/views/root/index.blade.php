@extends('layouts.master')

@section('title', 'Home')

@section('content')

    <div class="jumbotron">
      <div class="container">
        <h1>Engineering Advising</h1>
        <p>Welcome to the new K-State Engineering Advising System. This is your one-stop-shop to find classes, view your flowcharts and degree progress, schedule advising appointments, and more! Check out the sections below to get started.</p>
        <p><a class="btn btn-primary btn-lg" href="{{ url('/about') }}" role="button">Learn more &raquo;</a></p>
      </div>
    </div>

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
          <h2>Advising</h2>
          <p>When you are ready to enroll or if you have any questions, quickly schedule an appointment with your academic advisor.</p>
          <p><a class="btn btn-default" href="{{ url('/advising') }}" role="button">Schedule an Appointment &raquo;</a></p>
        </div>
        <div class="col-md-4">
          <h2>Help</h2>
          <p>Not sure how to use the new system? Click here for help!</p>
          <p><a class="btn btn-default" href="{{ url('/help') }}" role="button">Help &raquo;</a></p>
        </div>
      </div>
    </div>

@endsection